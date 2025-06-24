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
    const { data, error }: SupabaseResponse<UserSession[]> = await supabase
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
      console.error('Error fetching IP address:', error);
    }
    
    const { data, error }: SupabaseResponse<UserSession[]> = await supabase.from('user_sessions').insert({
      user_id: user.id,
      device_info: deviceInfo,
      ip_address,
    }).select('id').single();
    
    if (error) {
      console.error('Error inserting session:', error.message);
    }
    
    if (data && data[0]?.id) {
      localStorage.setItem('currentSessionId', data[0].id);
    }
  }
}

// Function to ensure user profile exists
async function ensureUserProfile(): Promise<void> {
  const { data: { user } }: SupabaseResponse<{ user: User | null }> = await supabase.auth.getUser();
  if (!user) return;

  try {
    // Check if profile exists
    const { error: fetchError }: SupabaseResponse<Profile> = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create one
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('Creating user profile for:', user.id);
      
      const { error: createError }: SupabaseResponse<Profile> = await supabase
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
        console.error('Error creating user profile:', createError);
      } else {
        console.log('User profile created successfully');
      }
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
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
    supabase.auth.getSession().then(({ data }: { data: SessionData }) => {
      setUser(data.session?.user ?? null)
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
      <ThemeProvider>
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Landingpage />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <Route
            path="*"
            element={
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
                    <Route path="/Journal.jsx" element={

                      <Journal />
                      } 
                      />
                    <Route path="/Analytics" element={<Analytics />} />
                    <Route path="/Calendar.jsx" element={<Calendar />} />
                    <Route path="/Notes" element={<Notes />} />
                    <Route path="/Settings" element={<Settings />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="*" element = {<Navigate to="/Dashboard" />} />
                  </Routes>
                </main>
              </div>
              </Protectedroute>
            }
            />
        )}
      </Routes>
    </Router>
    </ThemeProvider>
    </ChakraProvider>
    </QueryClientProvider>
  )
}

export default App 