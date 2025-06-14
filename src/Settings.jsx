import React, { useState, useEffect, createContext, useContext } from 'react'
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

// Create Theme context that works with Chakra UI
const ThemeContext = createContext();

// Theme Provider component integrated with Chakra UI
const ThemeProvider = ({ children }) => {
  const { colorMode, toggleColorMode, setColorMode } = useColorMode();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    return savedTheme || 'system';
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Dynamic styles for light and dark modes
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.900', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme-preference');
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
 
  const handleThemeChange = (newTheme) => {
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

  const themeStyles = {
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

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function SettingsModal({ isOpen, onClose }) {
  const { theme, handleThemeChange, isDark, cardBg, borderColor, colorMode, toggleColorMode } = useTheme();
  const [activeSection, setActiveSection] = useState('Account');
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState({
    activityInWorkspace: true,
    alwaysSendEmail: false,
    pageUpdates: true,
    workspaceDigest: true,
    announcements: false,
  });
  const settingSections = [
    { id: 'Account', icon: User, label: 'Account' },
    { id: 'Appearance', icon: Palette, label: 'Appearance' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Language', icon: Globe, label: 'Language & Time' },
    { id: 'Security', icon: Shield, label: 'Security' },
    { id: 'Desktop', icon: Monitor, label: 'Desktop app' },
  ];
  const [startWeekOnMonday, setStartWeekOnMonday] = useState(true);
  const [autoTimezone, setAutoTimezone] = useState(true);
  const [timezone, setTimezone] = useState('(GMT+1:00} Lagos');
  const [userData, setUserData] = useState(null);
  const toast = useToast();

  // Fetch user data from supabase
  useEffect(() => {
    const fetchUserData = async () => {
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
  const updateUserProfile = async () => {
    const input = document.getElementById('fullName');
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
        ...prev,
        user_metadata: { ...prev.user_metadata, full_name: newName },
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

  const resetPassword = async () => {
    const { error} = await supabase.auth.resetPasswordForEmail(userData?.email);
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

  // Render setting context based on active section
  const renderSettingContent = () => {
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
                      onChange={(e) => handleThemeChange(e.target.value)}
                      w="200px"
                      >
                        <option value="system">Use system settings</option>
                        <option value="light">Light mode</option>
                        <option value="dark">Dark mode</option>
                      </Select>
                  </Box>
                </HStack>
              </FormControl>
              {/*<FormControl>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1}>
                    <FormLabel fontSize="base" fontWeight="medium" mb={8}>
                      Toggle Dark Mode
                    </FormLabel>
                    <Text fontSize="sm" color="gray.500">Switch between light and dark mode</Text>
                  </VStack>
                  <Switch 
                     isChecked={colorMode === 'dark'}
                     onChange={toggleColorMode}
                     colorScheme="blue"
                     />
                </HStack>
              </FormControl>*/}
            </VStack>
          )
        // Add other cases here..
        default: 
        return (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">Select a setting category from the sidebar</Text>
          </Box>
        );
    }
  };

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
}

export default function Settings() {
  return (
    <ThemeProvider>
      <SettingsContent />
      </ThemeProvider>
  );
}

function SettingsContent() {
  const { bgColor, textColor } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
}

export { useTheme, ThemeProvider };