import React, { useState, useEffect, createContext, useContext, ReactNode, JSX } from 'react'
import { User, Palette, Bell, Globe, Shield, Monitor, Link } from 'lucide-react'
import { Settings as SettingsIcon } from 'lucide-react'
import { supabase } from './supabaseClient'
import {
  Box,
  Button,
  Select,
  useColorMode,
  useColorModeValue,
  Text,
  Switch,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Divider,
  useToast,
} from '@chakra-ui/react'
import NotificationSettingsComponent from './components/NotificationSettings'
import SnapTradeConnectionStatus from './components/SnapTradeConnectionStatus'
import { SnapTradeConnection } from './types/snaptrade'

// Types
type ThemeType = 'light' | 'dark' | 'system';
type ColorThemeName = 'default' | string; // Fix: define ColorThemeName

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeType;
  colorTheme: ColorThemeName;
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
  handleThemeChange: (newTheme: ThemeType) => void;
  handleColorThemeChange: (newColorTheme: ColorThemeName) => void;
  bgColor: string;
  textColor: string;
  cardBg: string;
  borderColor: string;
}

interface ThemeProviderProps {
  children: ReactNode;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationSettings {
  activityInWorkspace: boolean;
  alwaysSendEmail: boolean;
  pageUpdates: boolean;
  workspaceDigest: boolean;
  announcements: boolean;
  smartReminders: boolean; 
}

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface SettingSection {
  id: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}

// Enhanced device session interface
interface DeviceSession {
  id: string;
  user_id: string;
  device_info: string;
  ip_address: string;
  user_agent: string;
  platform: string;
  browser: string;
  os: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  location?: string;
  is_current_session: boolean;
  last_active: string;
  created_at: string;
  status: 'active' | 'inactive' | 'expired';
}

// Device detection utilities
const getDeviceInfo = () => {
  if (typeof navigator === 'undefined') {
    return {
      userAgent: '',
      platform: '',
      browser: 'Unknown',
      os: 'Unknown',
      deviceType: 'desktop' as 'desktop',
      deviceInfo: 'Unknown - Unknown on desktop'
    };
  }
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
  
  return {
    userAgent,
    platform,
    browser,
    os,
    deviceType,
    deviceInfo: `${os} - ${browser} on ${deviceType}`
  };
};

// Get location from IP
const getLocationFromIP = async (ip: string): Promise<string> => {
  if (!ip) return 'Unknown location';
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    if (data.city && data.country) {
      return `${data.city}, ${data.country}`;
    }
    return 'Unknown location';
  } catch (error) {
    return 'Unknown location';
  }
};

// Format relative time
const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
};

// Get device icon based on type
const getDeviceIcon = (deviceType: string, os: string) => {
  switch (deviceType) {
    case 'mobile':
      return '📱';
    case 'tablet':
      return '📱';
    case 'desktop':
      if (os === 'macOS') return '🖥️';
      if (os === 'Windows') return '💻';
      if (os === 'Linux') return '🐧';
      return '💻';
    default:
      return '💻';
  }
};

// Create Theme context that works with Chakra UI
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider component integrated with Chakra UI
const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // @ts-ignore
  const { colorMode, toggleColorMode, setColorMode } = useColorMode() as any;
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme-preference') as ThemeType | null;
    return savedTheme || 'system';
  });
  const [colorTheme, setColorTheme] = useState<ColorThemeName>(() => {
    const savedColorTheme = localStorage.getItem('color-theme-preference') as ColorThemeName | null;
    return savedColorTheme || 'default';
  });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Dynamic styles for light and dark modes
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.900', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme-preference') as ThemeType | null;
      const savedColorTheme = localStorage.getItem('color-theme-preference') as ColorThemeName | null;
      
      if (savedTheme) {
        setTheme(savedTheme);
        if (setColorMode) {
          setColorMode(savedTheme === 'dark' ? 'dark' : savedTheme === 'light' ? 'light' : 'system');
        }
      } else {
        const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme('system');
        if (setColorMode) {
          setColorMode(prefersDark ? 'dark' : 'light');
        }
      }
      
      if (savedColorTheme) {
        setColorTheme(savedColorTheme);
      }
      
      setIsLoaded(true);
    };
    initializeTheme();
  }, [setColorMode]);

  // Persist theme to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('theme-preference', theme);
  }, [theme, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('color-theme-preference', colorTheme);
  }, [colorTheme, isLoaded]);
 
  const handleThemeChange = (newTheme: ThemeType): void => {
    setTheme(newTheme);
    if (newTheme === 'dark' && colorMode !== 'dark') {
      toggleColorMode(); // Switch to dark mode
    } else if (newTheme === 'light' && colorMode !== 'light') {
      toggleColorMode(); // Switch to light mode
    } else if (newTheme === 'system') {
      const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark && colorMode !== 'dark') {
        toggleColorMode(); // Switch to dark mode
      } else if (!prefersDark && colorMode !== 'light') {
        toggleColorMode(); // Switch to light mode
      }
    }
  };

  const handleColorThemeChange = (newColorTheme: ColorThemeName): void => {
    setColorTheme(newColorTheme);
  };

  if (!isLoaded) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.100">
        <Text color="gray.600">Loading theme...</Text>
      </Box>
    );
  }

  const themeStyles: ThemeContextType = {
    isDark: colorMode === 'dark',
    theme,
    colorTheme,
    colorMode, 
    toggleColorMode,
    handleThemeChange,
    handleColorThemeChange,
    bgColor,
    textColor,
    cardBg,
    borderColor,
  };

  return <ThemeContext.Provider value={themeStyles}>{children}</ThemeContext.Provider>;
};

const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const NOTIFICATION_SETTINGS_KEY = 'notifications';

// Dummy ThemePreview for error-free build
const ThemePreview: React.FC<{
  selectedTheme: ColorThemeName;
  onThemeSelect: (theme: ColorThemeName) => void;
  currentMode: 'light' | 'dark';
}> = () => null;

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, colorTheme, handleThemeChange, handleColorThemeChange, isDark, cardBg, borderColor, colorMode } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('Account');
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [language, setLanguage] = useState<string>('English');
  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to default if parsing fails 
      }
    }
    return {
      activityInWorkspace: true,
      alwaysSendEmail: false,
      pageUpdates: true,
      workspaceDigest: true,
      announcements: false,
      smartReminders: true,
    };
  });

  // Persist notification settings to localStorage 
  useEffect(() => {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Sync alwaysSendEmail with Supabase
  useEffect(() => {
    const syncEmailSetting = async () => {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;
      if (user) {
        await supabase
           .from('profiles')
           .update({ always_send_email: notifications.alwaysSendEmail })
           .eq('id', user.id);
      }
    };
    // Only sync if alwaysSendEmail changes 
    syncEmailSetting();
  }, [notifications.alwaysSendEmail]);

  // load alwaysSendEmail from supabase on mount 
  useEffect(() => {
    const fetchEmailSetting = async () => {
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data?.user;
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('always_send_email')
          .eq('id', user.id)
          .single();
          if (!error && data) {
            setNotifications((prev) => ({
              ...prev,
              alwaysSendEmail: !!data.always_send_email,
            }));
          }
      }
    };
    fetchEmailSetting();
    // eslint-disable-next-line
  }, []);

  // Enhanced session fetching with device info
  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;
      
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });
        
      if (!error && sessionData) {
        const currentSessionId = localStorage.getItem('currentSessionId');
        
        // Enhance sessions with additional device info and location
        const enhancedSessions = await Promise.all(
          sessionData.map(async (session: any) => {
            const location = await getLocationFromIP(session.ip_address);
            // const deviceInfo = getDeviceInfo(); // Not used
            return {
              ...session,
              location,
              is_current_session: session.id === currentSessionId,
              status: session.last_active ? 
                (new Date().getTime() - new Date(session.last_active).getTime() < 30 * 60 * 1000 ? 'active' : 'inactive') : 
                'expired'
            };
          })
        );
        
        setSessions(enhancedSessions);
      }
    };
    
    if (activeSection === 'Security') fetchSessions();
  }, [activeSection]);
  
  const settingSections: SettingSection[] = [
    { id: 'Account', icon: User, label: 'Account' },
    { id: 'Appearance', icon: Palette, label: 'Appearance' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Integrations', icon: Link, label: 'Integrations' },
    { id: 'Language', icon: Globe, label: 'Language & Time' },
    { id: 'Security', icon: Shield, label: 'Security' },
    { id: 'Desktop', icon: Monitor, label: 'Desktop app' },
  ];
  
  const [startWeekOnMonday, setStartWeekOnMonday] = useState<boolean>(true);
  const [autoTimezone, setAutoTimezone] = useState<boolean>(true);
  const [timezone, setTimezone] = useState<string>('(GMT+1:00) Lagos');
  const [userData, setUserData] = useState<SupabaseUser | null>(null);
  // const [isThemeCustomizationOpen, setIsThemeCustomizationOpen] = useState<boolean>(false); // Not used
  const toast = useToast();
  const currentSessionId = typeof window !== 'undefined' ? localStorage.getItem('currentSessionId') : null;

  // Fetch user data from supabase
  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        // @ts-ignore
        console.error('Error fetching user data:', error.message);
      } else {
        setUserData(data?.user || null);
      }
    };
    fetchUserData();
  }, []);

  // Update user profile
  const updateUserProfile = async (): Promise<void> => {
    const input = document.getElementById('fullName') as HTMLInputElement | null;
    if (!input) return;
    
    const newName = input.value;
    const { error } = await supabase.auth.updateUser({
      data: { full_name: newName },
    });
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      setUserData((prev) => ({
        ...prev!,
        user_metadata: { ...prev?.user_metadata, full_name: newName },
      }));
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetPassword = async (): Promise<void> => {
    if (!userData?.email) return;
    
    const { error } = await supabase.auth.resetPasswordForEmail(userData.email);
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset password email.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Success',
        description: 'Password reset email sent!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handler for toggling smart reminders 
  const handleSmartRemindersToggle = () => {
    setNotifications((prev) => ({
      ...prev,
      smartReminders: !prev.smartReminders,
    }));
  };

  // Toggle email notifications and persist to Supabase
  const handleEmailNotificationsToggle = async () => {
    const newValue = !notifications.alwaysSendEmail;
    setNotifications((prev) => ({
      ...prev,
      alwaysSendEmail: newValue,
    }));
    // Supabase sync handled by useEffect above 
  }

  // Render setting context based on active section
  const renderSettingContent = (): JSX.Element => {
    switch (activeSection) {
      case 'Account':
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Account Information
              </Text>
              <VStack spacing={4} align="stretch">
                <Box bg={cardBg} p={4} rounded="lg" border="1px" borderColor={borderColor}>
                  <HStack spacing={4}>
                    <Box w={12} h={12} bg="linear-gradient(135deg, #10B981, #059669)" rounded="full" display="flex" alignItems="center" justifyContent="center">
                      <User size={24} color="white" />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{userData?.user_metadata?.full_name || 'John Trader'}</Text>
                      <Text fontSize="sm" color="gray.500">{userData?.email || 'john.trader@gmail.com'}</Text>
                      <Text fontSize="sm" color="blue.500">Pro Account</Text>
                    </VStack>
                  </HStack>
                </Box>
                <FormControl>
                  <FormLabel fontSize="sm">Full Name</FormLabel>
                  <Input id="fullName" defaultValue={userData?.user_metadata?.full_name || ''} />
                  <Button mt={4} colorScheme="blue" onClick={updateUserProfile}>
                    Save Changes
                  </Button>
                </FormControl>
              </VStack>
            </Box>
          </VStack>
        );
        
      case 'Integrations':
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="xl" mb={2}>Trading Account Integrations</Text>
              <Text fontSize="sm" color="gray.500" mb={6}>
                Connect your trading accounts to automatically import portfolio data and trade history.
              </Text>
            </Box>
            
            {/* SnapTrade Integration */}
            <Box bg={cardBg} p={6} rounded="lg" border="1px" borderColor={borderColor}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={3}>
                  <Box w={10} h={10} bg="linear-gradient(135deg, #667eea, #764ba2)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <Text color="white" fontWeight="bold" fontSize="lg">S</Text>
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold">SnapTrade</Text>
                    <Text fontSize="sm" color="gray.500">Connect your brokerage accounts</Text>
                  </VStack>
                </HStack>
                
                <Divider />
                
                <SnapTradeConnectionStatus 
                  onConnectionChange={(connection: SnapTradeConnection | null) => {
                    if (connection) {
                      toast({
                        title: 'Connected Successfully',
                        description: 'Your SnapTrade account has been connected.',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    } else {
                      toast({
                        title: 'Disconnected',
                        description: 'Your SnapTrade account has been disconnected.',
                        status: 'info',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                />
                
                <Text fontSize="sm" color="gray.500">
                  SnapTrade allows you to securely connect your brokerage accounts and automatically import your portfolio data, trade history, and account balances.
                </Text>
              </VStack>
            </Box>
            
            {/* Future integrations can be added here */}
            <Box bg={cardBg} p={6} rounded="lg" border="1px" borderColor={borderColor} opacity={0.6}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={3}>
                  <Box w={10} h={10} bg="gray.300" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.600" fontWeight="bold" fontSize="lg">+</Text>
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold" color="gray.600">More Integrations</Text>
                    <Text fontSize="sm" color="gray.500">Coming soon</Text>
                  </VStack>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  We're working on adding support for more trading platforms and data providers.
                </Text>
              </VStack>
            </Box>
          </VStack>
        );

      case 'Appearance':
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="xl" mb={2}>Appearance</Text>
              <Text fontSize="sm" color="gray.500" mb={6}>
                Customize how your application looks on your device.
              </Text>
            </Box>
            
            {/* Basic Theme Selection */}
            <FormControl>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <FormLabel fontSize="base" fontWeight="medium" mb={0}>
                    Theme Mode
                  </FormLabel>
                  <Text fontSize="sm" color="gray.500">Choose between light, dark, or system theme</Text>
                </VStack>
                <Box position="relative">
                  <Select
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value as ThemeType)}
                    w="200px"
                  >
                    <option value="system">Use system settings</option>
                    <option value="light">Light mode</option>
                    <option value="dark">Dark mode</option>
                  </Select>
                </Box>
              </HStack>
            </FormControl>

            <Divider />

            {/* Color Theme Selection */}
            <ThemePreview
              selectedTheme={colorTheme}
              onThemeSelect={handleColorThemeChange}
              currentMode={colorMode}
            />
          </VStack>
        );

      case 'Notifications':
        return <NotificationSettingsComponent />;

      case 'Security':
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="2xl" mb={2} color={useColorModeValue('gray.800', 'gray.100')}>
                Security
              </Text>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={6}>
                Manage your account security and privacy settings.
              </Text>
            </Box>

            {/* Password Management */}
            <Box bg={cardBg} p={6} rounded="lg" border="1px" borderColor={borderColor}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('gray.800', 'gray.100')}>
                  Password
                </Text>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Keep your account secure with a strong password.
                </Text>
                <Button
                  colorScheme="blue"
                  variant="outline"
                  onClick={resetPassword}
                  leftIcon={<Shield size={16} />}
                  _hover={{
                    bg: useColorModeValue('blue.50', 'blue.900'),
                    borderColor: useColorModeValue('blue.300', 'blue.400'),
                  }}
                >
                  Reset Password
                </Button>
              </VStack>
            </Box>

            {/* Enhanced Device Sessions */}
            <Box bg={cardBg} p={6} rounded="lg" border="1px" borderColor={borderColor}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('gray.800', 'gray.100')}>
                      Device Sessions
                    </Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      {sessions.length} device{sessions.length !== 1 ? 's' : ''} logged in
                    </Text>
                  </VStack>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={async () => {
                      const { data, error } = await supabase.auth.getUser();
                      const user = data?.user;
                      if (!user || !currentSessionId) return;
                      await supabase
                        .from('user_sessions')
                        .delete()
                        .eq('user_id', user.id)
                        .neq('id', currentSessionId);
                      setSessions(sessions.filter(s => s.id === currentSessionId));
                      toast({
                        title: 'Success',
                        description: 'Logged out of all other devices.',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                    leftIcon={<Shield size={16} />}
                  >
                    Log out all other devices
                  </Button>
                </HStack>
                
                {sessions.length === 0 && (
                  <Box textAlign="center" py={8}>
                    <Text color={useColorModeValue('gray.500', 'gray.400')}>
                      No active sessions found.
                    </Text>
                  </Box>
                )}
                
                <VStack spacing={3} align="stretch">
                  {sessions.map((session) => (
                    <Box 
                      key={session.id} 
                      p={4} 
                      borderWidth={1} 
                      borderRadius="lg"
                      borderColor={session.is_current_session ? 
                        useColorModeValue('blue.200', 'blue.600') : 
                        useColorModeValue('gray.200', 'gray.600')
                      }
                      bg={session.is_current_session ? 
                        useColorModeValue('blue.50', 'blue.900') : 
                        useColorModeValue('white', 'gray.800')
                      }
                      position="relative"
                      _hover={{
                        borderColor: session.is_current_session ? 
                          useColorModeValue('blue.300', 'blue.500') : 
                          useColorModeValue('gray.300', 'gray.500'),
                        transform: 'translateY(-1px)',
                        boxShadow: useColorModeValue('sm', 'lg'),
                      }}
                      transition="all 0.2s ease-in-out"
                    >
                      {session.is_current_session && (
                        <Box
                          position="absolute"
                          top={2}
                          right={2}
                          bg={useColorModeValue('blue.500', 'blue.400')}
                          color="white"
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="medium"
                          boxShadow="sm"
                        >
                          Current
                        </Box>
                      )}
                      
                      <HStack spacing={3} align="start">
                        <Text fontSize="2xl" filter={useColorModeValue('none', 'brightness(1.2)')}>
                          {getDeviceIcon(session.device_type || 'desktop', session.os || 'Unknown')}
                        </Text>
                        
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack spacing={2} align="center">
                            <Text 
                              fontWeight="semibold" 
                              fontSize="sm"
                              color={useColorModeValue('gray.800', 'gray.100')}
                            >
                              {session.device_info || `${session.os || 'Unknown'} - ${session.browser || 'Unknown'}`}
                            </Text>
                            <Box
                              w={2}
                              h={2}
                              borderRadius="full"
                              bg={session.status === 'active' ? 
                                useColorModeValue('green.400', 'green.300') : 
                                session.status === 'inactive' ? 
                                useColorModeValue('yellow.400', 'yellow.300') : 
                                useColorModeValue('gray.400', 'gray.500')
                              }
                              boxShadow={useColorModeValue('none', '0 0 4px rgba(0,0,0,0.3)')}
                            />
                          </HStack>
                          
                          <Text 
                            fontSize="xs" 
                            color={useColorModeValue('gray.600', 'gray.400')}
                            fontFamily="mono"
                          >
                            IP: {session.ip_address || 'Unknown'}
                          </Text>
                          
                          {session.location && session.location !== 'Unknown location' && (
                            <Text 
                              fontSize="xs" 
                              color={useColorModeValue('gray.600', 'gray.400')}
                              display="flex"
                              alignItems="center"
                              gap={1}
                            >
                              <span>📍</span>
                              {session.location}
                            </Text>
                          )}
                          
                          <Text 
                            fontSize="xs" 
                            color={useColorModeValue('gray.600', 'gray.400')}
                          >
                            Last active: {formatRelativeTime(session.last_active || session.created_at)}
                          </Text>
                          
                          <Text 
                            fontSize="xs" 
                            color={useColorModeValue('gray.600', 'gray.400')}
                          >
                            Logged in: {new Date(session.created_at).toLocaleDateString()} at {new Date(session.created_at).toLocaleTimeString()}
                          </Text>
                        </VStack>
                      </HStack>
                      
                      {session.is_current_session && (
                        <Button
                          colorScheme="red"
                          size="xs"
                          mt={3}
                          variant="outline"
                          _hover={{
                            bg: useColorModeValue('red.50', 'red.900'),
                            borderColor: useColorModeValue('red.300', 'red.400'),
                          }}
                          onClick={async () => {
                            await supabase.from('user_sessions').delete().eq('id', session.id);
                            setSessions(sessions.filter(s => s.id !== session.id));
                            toast({
                              title: 'Success',
                              description: 'Logged out from this device.',
                              status: 'success',
                              duration: 3000,
                              isClosable: true,
                            });
                          }}
                        >
                          Log out from this device
                        </Button>
                      )}
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </Box>

            {/* Account Deletion */}
            <Box bg={cardBg} p={6} rounded="lg" border="1px" borderColor={borderColor}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('red.600', 'red.400')}>
                  Danger Zone
                </Text>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Once you delete your account, there is no going back. Please be certain.
                </Text>
                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      const { data, error } = await supabase.auth.getUser();
                      const user = data?.user;
                      if (user) {
                        // Delete user data from profiles table
                        await supabase
                          .from('profiles')
                          .delete()
                          .eq('id', user.id);
                        
                        // Delete user sessions
                        await supabase
                          .from('user_sessions')
                          .delete()
                          .eq('user_id', user.id);
                        
                        // Delete the user account
                        if (supabase.auth.admin && typeof supabase.auth.admin.deleteUser === 'function') {
                          const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
                          if (delError) {
                            toast({
                              title: 'Error',
                              description: 'Failed to delete account. Please try again.',
                              status: 'error',
                              duration: 3000,
                              isClosable: true,
                            });
                          } else {
                            toast({
                              title: 'Account Deleted',
                              description: 'Your account has been permanently deleted.',
                              status: 'success',
                              duration: 3000,
                              isClosable: true,
                            });
                            // Redirect to landing page or sign out
                            window.location.href = '/';
                          }
                        } else {
                          toast({
                            title: 'Error',
                            description: 'Account deletion is not supported.',
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                          });
                        }
                      }
                    }
                  }}
                  leftIcon={<Shield size={16} />}
                  _hover={{
                    bg: useColorModeValue('red.50', 'red.900'),
                    borderColor: useColorModeValue('red.300', 'red.400'),
                  }}
                >
                  Delete Account
                </Button>
              </VStack>
            </Box>
          </VStack>
        );

      case 'Language':
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="xl" mb={2}>Language & Time</Text>
              <Text fontSize="sm" color="gray.500" mb={6}>
                Customize your language and timezone settings.
              </Text>
            </Box>
            <FormControl>
              <FormLabel fontSize="sm">Language</FormLabel>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Timezone</FormLabel>
              <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="(GMT+1:00) Lagos">(GMT+1:00) Lagos</option>
                <option value="(GMT-5:00) New York">(GMT-5:00) New York</option>
                <option value="(GMT-8:00) Los Angeles">(GMT-8:00) Los Angeles</option>
                <option value="(GMT+0:00) London">(GMT+0:00) London</option>
              </Select>
            </FormControl>
            <FormControl>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <FormLabel fontSize="base" fontWeight="medium">
                    Start week on Monday
                  </FormLabel>
                  <Text fontSize="sm" color="gray.500">Begin your calendar week on Monday instead of Sunday</Text>
                </VStack>
                <Switch
                  isChecked={startWeekOnMonday}
                  onChange={(e) => setStartWeekOnMonday(e.target.checked)}
                />
              </HStack>
            </FormControl>
            <FormControl>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <FormLabel fontSize="base" fontWeight="medium">
                    Auto-detect timezone
                  </FormLabel>
                  <Text fontSize="sm" color="gray.500">Automatically detect your timezone based on location</Text>
                </VStack>
                <Switch
                  isChecked={autoTimezone}
                  onChange={(e) => setAutoTimezone(e.target.checked)}
                />
              </HStack>
            </FormControl>
          </VStack>
        );

      case 'Desktop':
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="xl" mb={2}>Desktop App</Text>
              <Text fontSize="sm" color="gray.500" mb={6}>
                Manage your desktop application settings.
              </Text>
            </Box>
            <Box bg={cardBg} p={4} rounded="lg" border="1px" borderColor={borderColor}>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="medium">Desktop App Status</Text>
                <Text fontSize="sm" color="gray.500">
                  You're currently using the web version of Tradistry.
                </Text>
                <Button colorScheme="blue" variant="outline" size="sm">
                  Download Desktop App
                </Button>
              </VStack>
            </Box>
            <FormControl>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <FormLabel fontSize="base" fontWeight="medium">
                    Launch on startup
                  </FormLabel>
                  <Text fontSize="sm" color="gray.500">Automatically start the app when you log in</Text>
                </VStack>
                <Switch defaultChecked={false} />
              </HStack>
            </FormControl>
            <FormControl>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <FormLabel fontSize="base" fontWeight="medium">
                    Minimize to system tray
                  </FormLabel>
                  <Text fontSize="sm" color="gray.500">Keep the app running in the background when closed</Text>
                </VStack>
                <Switch defaultChecked={true} />
              </HStack>
            </FormControl>
          </VStack>
        );

      // Add other cases here..
      default: 
        return (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">Select a setting category from the sidebar</Text>
          </Box>
        );
    }
  };
  // console.log('currentSessionId', currentSessionId, sessions.map(s => s.id));
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent maxH="80vh" bg={cardBg}>
        <Flex h="600px">
          <Box p={4} borderRight="1px" borderColor={borderColor} bg={isDark ? 'gray.900' : 'gray.50'}>
            <Box p={4} borderBottom="1px" borderColor={borderColor}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold">Settings</Text>
                <ModalCloseButton position="static" />
              </HStack>
            </Box>
            <VStack spacing={1} p={4} align="stretch">
              {settingSections.map((section) => (
                <Button
                  key={section.id}
                  leftIcon={<section.icon size={16} />}
                  onClick={() => setActiveSection(section.id)}
                  variant={activeSection === section.id ? "solid" : "ghost"}
                  colorScheme={activeSection === section.id ? "blue" : "gray"}
                  justifyContent="flex-start"
                  size="sm"
                  >
                    {section.label}
                  </Button>
              ))}
            </VStack>
          </Box>
          <Box flex={1} overflowY="auto">
            <ModalBody p={6}>{renderSettingContent()}</ModalBody>
          </Box>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

const Settings: React.FC = () => {
  return (
    <ThemeProvider>
      <SettingsContent />
    </ThemeProvider>
  );
};

const SettingsContent: React.FC = () => {
  const { bgColor, textColor } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <Box bg={bgColor} color={textColor} minH="100vh" p={8}>
      <Button
        leftIcon={<SettingsIcon size={20} /> }
        onClick={() => setIsModalOpen(true)}
        colorScheme="blue"
        variant="outline"
        >
          Open Settings 
        </Button>
        <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Box>
  );
};
export default Settings;
export { useTheme, ThemeProvider, NOTIFICATION_SETTINGS_KEY, SettingsModal };