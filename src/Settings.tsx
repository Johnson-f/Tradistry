import React, { useState, useEffect, createContext, useContext, ReactNode, JSX } from 'react'
import { User, Palette, Bell, Globe, Shield, Monitor, X, ChevronDown } from 'lucide-react'
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
  ModalHeader,
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

// Types
type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeType;
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
  handleThemeChange: (newTheme: ThemeType) => void;
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

// Create Theme context that works with Chakra UI
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider component integrated with Chakra UI
const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { colorMode, toggleColorMode, setColorMode } = useColorMode();
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme-preference') as ThemeType | null;
    return savedTheme || 'system';
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
      if (savedTheme) {
        setTheme(savedTheme);
        setColorMode(savedTheme === 'dark' ? 'dark' : savedTheme === 'light' ? 'light' : 'system');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme('system');
        setColorMode(prefersDark ? 'dark' : 'light');
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
 
  const handleThemeChange = (newTheme: ThemeType): void => {
    setTheme(newTheme);
    if (newTheme === 'dark' && colorMode !== 'dark') {
      toggleColorMode(); // Switch to dark mode
    } else if (newTheme === 'light' && colorMode !== 'light') {
      toggleColorMode(); // Switch to light mode
    } else if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark && colorMode !== 'dark') {
        toggleColorMode(); // Switch to dark mode
      } else if (!prefersDark && colorMode !== 'light') {
        toggleColorMode(); // Switch to light mode
      }
    }
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
    colorMode, 
    toggleColorMode, // Add toggleColorMode to themeStyles
    handleThemeChange,
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

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, handleThemeChange, isDark, cardBg, borderColor, colorMode, toggleColorMode } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('Account');
  const [sessions, setSessions] = useState<any[]>([]);
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
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
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

  // Fetch user sessions from supabase
  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });
        if (!error && data) setSessions(data);
    };
    if (activeSection === 'Security') fetchSessions();
  }, [activeSection]);
  
  const settingSections: SettingSection[] = [
    { id: 'Account', icon: User, label: 'Account' },
    { id: 'Appearance', icon: Palette, label: 'Appearance' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Language', icon: Globe, label: 'Language & Time' },
    { id: 'Security', icon: Shield, label: 'Security' },
    { id: 'Desktop', icon: Monitor, label: 'Desktop app' },
  ];
  
  const [startWeekOnMonday, setStartWeekOnMonday] = useState<boolean>(true);
  const [autoTimezone, setAutoTimezone] = useState<boolean>(true);
  const [timezone, setTimezone] = useState<string>('(GMT+1:00} Lagos');
  const [userData, setUserData] = useState<SupabaseUser | null>(null);
  const toast = useToast();
  const currentSessionId = localStorage.getItem('currentSessionId'); // Get current session ID from localStorage (new code)

  // Fetch user data from supabase
  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user data:', error.message);
      } else {
        setUserData(data.user);
      }
    };
    fetchUserData();
  }, []);

  // Update user profile
  const updateUserProfile = async (): Promise<void> => {
    const input = document.getElementById('fullName') as HTMLInputElement;
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
        
      case 'Appearance':
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="xl" mb={2}>Appearance</Text>
              <Text fontSize="sm" color="gray.500" mb={6}>
                Customize how your application looks on your device.
              </Text>
            </Box>
            <FormControl>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <FormLabel fontSize="base" fontWeight="medium" mb={8}>
                    Theme
                  </FormLabel>
                  <Text fontSize="sm" color="gray.500"></Text>
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
          </VStack>
        );

        case 'Notifications':
          return (
            <VStack spacing={6} align="stretch">
              <Box>
                <Text fontSize="xl" mb={2}>Notifications</Text>
                <Text fontSize="sm" color="gray.500" mb={6}>
                  Manage your notification preferences.
                </Text>
              </Box>
              {/* ...other notification toggles... */}
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel htmlFor="smart-reminders" mb={0} fontWeight="medium">
                    Smart Reminders 
                  </FormLabel>
                  <Text fontSize="sm" color="gray.500">
                    Get automatic reminders to keep you disciplined with your trading.
                  </Text>
                </Box>
                <Switch
                   id="smart-reminders"
                   isChecked={notifications.smartReminders}
                   onChange={handleSmartRemindersToggle}
                   colorScheme="blue"
                   />
              </FormControl>
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel htmlFor="email-reminders" mb={0} fontWeight="medium">
                    Email Notifications 
                  </FormLabel>
                  <Text fontSize="sm" color="gray.500">
                    Receive smart reminders by Email.
                  </Text>
                  </Box>
                  <Switch 
                    id="email-reminders"
                    isChecked={notifications.alwaysSendEmail}
                    onChange={handleEmailNotificationsToggle}
                    colorScheme="blue"
                    />
              </FormControl>
            </VStack>
          );

          case 'Security':
            return (
              <VStack spacing={6} align="stretch">
                <Box>
                  <Text fontSize="xl" mb={2}>Device Sessions</Text>
                  <Text fontSize="sm" color="gray.500" mb={6}>
                    These devices are currently logged in to your account.
                  </Text>
                  <Button
                  colorScheme="red"
                  size="sm"
                  mb={4}
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user || !currentSessionId) return;
                    await supabase
                    .from('user_sessions')
                    .delete()
                    .eq('user_id', user.id)
                    .neq('id', currentSessionId);
                    setSessions(sessions.filter(s => s.id === currentSessionId));
                    }}
                    >
                      Log out all other devices
                      </Button>
                  <Box>
                    {sessions.length === 0 && (
                      <Text color="gray.400">No active sessions found.</Text>
                    )}
                    {sessions.map((session) => (
                      <Box key={session.id} p={3} mb={2} borderWidth={1} borderRadius="md">
                        <Text fontWeight="medium">{session.device_info}</Text>
                        <Text fontSize="sm" color="gray.500">
                          IP: {session.ip_address || 'Unknown'}<br />
                          Logged in: {new Date(session.created_at).toLocaleString()}
                        </Text>
                        {/* Show "Log out" only for this session */}
                        {session.id === currentSessionId && (
                          <Button
                          colorScheme="red"
                          size="xs"
                          mt={2}
                          onClick={async () => {
                            await supabase.from('user_sessions').delete().eq('id', session.id);
                            setSessions(sessions.filter(s => s.id !== session.id));
                            // Optionally, also sign out the user
                            // // await supabase.auth.signOut();
                            }}
                            >
                              Log out from this device
                              </Button>
                            )}
                        </Box>
                    ))}
                  </Box>
                  </Box>
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
  console.log('currentSessionId', currentSessionId, sessions.map(s => s.id));
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
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
export { useTheme, ThemeProvider, NOTIFICATION_SETTINGS_KEY };