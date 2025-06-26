import React, { useState, useEffect, useRef } from 'react'
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
import { DominoSpinner } from 'react-spinners-kit'
import { useColorModeValue, Box, Text, VStack } from '@chakra-ui/react'
import Notes from './Notes'
import { useSmartNotifications } from './hooks/useSmartNotifications'
import { useManualReminderNotifications } from './hooks/useManualReminderNotifications'
import { logger } from './services/logger'
import SnapTradeCallback from './components/SnapTradeCallback'

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
    // Enhanced device detection
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';
    
    // Detect OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    // Detect device type
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
      if (/iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent)) {
        deviceType = 'tablet';
      }
    }
    
    const deviceInfo = `${os} - ${browser} on ${deviceType}`;
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
        user_agent: userAgent,
        platform,
        browser,
        os,
        device_type: deviceType,
        last_active: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Error inserting session', error, { component: 'App' });
    }

    if (data && data.id) {
      localStorage.setItem('currentSessionId', data.id);
    }
  } else {
    // Update last_active for existing session
    await supabase
      .from('user_sessions')
      .update({ last_active: new Date().toISOString() })
      .eq('id', localSessionId);
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

// Loading component with theme awareness
const LoadingScreen: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const spinnerColor = useColorModeValue('#686769', '#9CA3AF');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      position="relative"
      overflow="hidden"
    >
      {/* Background gradient overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient={useColorModeValue(
          'linear(to-br, blue.50, purple.50)',
          'linear(to-br, gray.900, blue.900)'
        )}
        opacity={0.3}
      />
      
      {/* Loading content */}
      <VStack spacing={8} position="relative" zIndex={1}>
        {/* Logo/Brand */}
        <Box
          w="20"
          h="20"
          bgGradient="linear(to-br, purple.600, blue.600)"
          borderRadius="2xl"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="xl"
          animation="bounce 2s infinite"
        >
          <Text fontSize="3xl" fontWeight="bold" color="white">
            T
          </Text>
        </Box>
        
        {/* Spinner */}
        
        
        {/* Loading text */}
        <VStack spacing={3}>
          <Text
            fontSize="xl"
            fontWeight="semibold"
            color={textColor}
            textAlign="center"
            letterSpacing="wide"
          >
            Tradistry
          </Text>
          <Text
            fontSize="sm"
            color={mutedTextColor}
            textAlign="center"
            maxW="300px"
          >
            
          </Text>
        </VStack>
        
        {/* Animated dots */}
        <Box display="flex" gap={2}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w="3"
              h="3"
              bg={accentColor}
              borderRadius="full"
              animation={`pulse 1.4s ease-in-out infinite ${i * 0.2}s`}
            />
          ))}
        </Box>
      </VStack>
      
      {/* Global styles for animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { 
              opacity: 0.3; 
              transform: scale(0.8); 
            }
            50% { 
              opacity: 1; 
              transform: scale(1.2); 
            }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}
      </style>
    </Box>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarWidth, setSidebarWidth] = useState<number>(256) // Default expanded width
  const initialCheckDone = useRef(false)

  // Use smart notifications
  useSmartNotifications();
  
  // Use manual reminder notifications
  useManualReminderNotifications();

  useEffect(() => {
    supabase.auth.getSession().then((response) => {
      setUser(response.data.session?.user ?? null)
      if (!initialCheckDone.current) {
        setLoading(false)
        initialCheckDone.current = true
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null)
      if (!initialCheckDone.current) {
        setLoading(false)
        initialCheckDone.current = true
      }
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
    return <LoadingScreen />
  }
  return (
    <QueryClientProvider client={queryClient}>
    {/* Helmet for SEO */}
    <Helmet>
      <title>Journal Project</title>
      <meta name="description" content="A platform for traders to journal their trades and analyze their performance."/>
    </Helmet>
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
                    <Route path="/Login" element={<Login />} />
                    <Route path="/snaptrade/callback" element={<SnapTradeCallback />} />
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
    </QueryClientProvider>
  )
};

export default App