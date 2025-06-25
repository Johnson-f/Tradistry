import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Helmet } from 'react-helmet'
import './index.css'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import Journal from './Journal'
import Analytics from './Analytics'
import Calendar from './Calendar'
import Settings from './Settings'
import Landingpage from './Landingpage'
import Login from './components/Login'
import SignUp from './components/SignUp'
import { supabase } from './supabaseClient'
import Protectedroute from './components/Protectedroute'
import ForgotPassword from './components/ForgotPassword'
import { RingLoader } from 'react-spinners'
import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider } from './Settings'
import Notes from './Notes'
import { useSmartNotifications } from './hooks/useSmartNotifications'
import { useManualReminderNotifications } from './hooks/useManualReminderNotifications'
import { logger } from './services/logger'
import { SnapTradeIntegration } from './components/SnapTradeIntegration'
import { SnapTradeSuccess } from './components/SnapTradeSuccess'

// Type definitions
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface SessionData {
  user: User | null;
}

interface SupabaseResponse<T> {
  data: T;
  error: any;
}

interface UserSession {
  id: string;
  user_id: string;
  device_info: string;
  ip_address: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  always_send_email: boolean;
  created_at: string;
  updated_at: string;
}

// Initialize React Query Client 
const queryClient = new QueryClient()

// Function to log user session to Supabase
async function logUserSession(): Promise<void> {
  const { data: { user } }: SupabaseResponse<{ user: User | null }> = await supabase.auth.getUser();
  if (!user) return;
  const localSessionId = localStorage.getItem('currentSessionId');
  let sessionExists = false;

  if (!localSessionId) {
    // Check if session exists in DB
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('id', localSessionId)
      .eq('user_id', user.id)
      .single();
      sessionExists = !!data && !error;
  }

  if (!sessionExists) {
    // Insert new session 
    const deviceInfo = `${navigator.platform} - ${navigator.userAgent}`;
    let ip_address = '';
    
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const json = await res.json();
      ip_address = json.ip;
    } catch (error) {
      logger.error('Error fetching IP address', error, { component: 'App' });
    }
    
    const { data, error }: { data: UserSession | null; error: any } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        device_info: deviceInfo,
        ip_address,
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Error inserting session', error, { component: 'App' });
    }

    if (data && data.id) {
      localStorage.setItem('currentSessionId', data.id);
    }
  }
}

// Function to ensure user profile exists
async function ensureUserProfile(): Promise<void> {
  const { data: { user } }: SupabaseResponse<{ user: User | null }> = await supabase.auth.getUser();
  if (!user) return;

  try {
    // Check if profile exists
    const { error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create one
    if (fetchError && fetchError.code === 'PGRST116') {
      logger.info('Creating user profile for', { userId: user.id, component: 'App' });
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          always_send_email: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        logger.error('Error creating user profile', createError, { userId: user.id, component: 'App' });
      } else {
        logger.info('User profile created successfully', { userId: user.id, component: 'App' });
      }
    }
  } catch (error) {
    logger.error('Error ensuring user profile', error, { component: 'App' });
  }
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarWidth, setSidebarWidth] = useState<number>(256) // Default expanded width

  // Use smart notifications
  useSmartNotifications();
  
  // Use manual reminder notifications
  useManualReminderNotifications();

  useEffect(() => {
    supabase.auth.getSession().then((response) => {
      setUser(response.data.session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    logUserSession();
    ensureUserProfile(); // Ensure user profile exists
  }, []);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <RingLoader color="#100e0e" size={64} loading={true} />
    </div>
    )
  }
  return (
    <QueryClientProvider client={queryClient}>
    {/* Helmet for SEO */}
    <Helmet>
      <title>Journal Project</title>
      <meta name="description" content="A platform for traders to journal their trades and analyze their performance."/>
    </Helmet>
    <ChakraProvider>
      <Router>
        <Routes>
          {!user ? (
            <>
              <Route path="/" element={<div style={{background: '#fff', color: '#222', minHeight: '100vh'}}><Landingpage /></div>} />
              <Route path="/Login" element={<div style={{background: '#fff', color: '#222', minHeight: '100vh'}}><Login /></div>} />
              <Route path="/SignUp" element={<div style={{background: '#fff', color: '#222', minHeight: '100vh'}}><SignUp /></div>} />
              <Route path="/ForgotPassword" element={<div style={{background: '#fff', color: '#222', minHeight: '100vh'}}><ForgotPassword /></div>} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <Route
              path="*"
              element={
                <ThemeProvider>
                  <Protectedroute user={user}>
                  <div className='flex'>
                    {/* Pass setSidebarWidth to Sidebar */}
                    <Sidebar onWidthChange={setSidebarWidth} />
                    <main 
                       className='flex-1 transition-all duration-300'
                       style={{ marginLeft: sidebarWidth }} // Adjust margin dynamically
                       >
                        {/* Remove errorboundary */}
                      <Routes>
                        <Route path="/Dashboard" element={<Dashboard />} />
                        <Route path="/Journal" element={<Journal />} />
                        <Route path="/Analytics" element={<Analytics />} />
                        <Route path="/Calendar" element={<Calendar />} />
                        <Route path="/Notes" element={<Notes />} />
                        <Route path="/Settings" element={<Settings />} />
                        <Route path="/SnapTrade" element={<SnapTradeIntegration />} />
                        <Route path="/snaptrade-success" element={<SnapTradeSuccess />} />
                        <Route path="/Login" element={<Login />} />
                        <Route path="*" element = {<Navigate to="/Dashboard" />} />
                      </Routes>
                    </main>
                  </div>
                  </Protectedroute>
                </ThemeProvider>
              }
              />
          )}
        </Routes>
      </Router>
    </ChakraProvider>
    </QueryClientProvider>
  )
};

export default App