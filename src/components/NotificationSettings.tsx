import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { Bell, Mail, Info } from 'lucide-react';
import { useNotificationSettings } from '../hooks/useNotificationSettings';

const NotificationSettingsComponent: React.FC = () => {
  const {
    settings,
    loading,
    toggleSetting,
    resetToDefaults,
  } = useNotificationSettings();

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={mutedTextColor}>Loading notification settings...</Text>
      </Box>
    );
  }

  const SettingItem = ({ 
    icon: IconComponent, 
    title, 
    description, 
    settingKey, 
    badge 
  }: {
    icon: React.ComponentType<{ size?: number }>;
    title: string;
    description: string;
    settingKey: keyof typeof settings;
    badge?: string;
  }) => (
    <FormControl display="flex" alignItems="flex-start" justifyContent="space-between">
      <HStack spacing={3} flex={1}>
        <Box
          p={2}
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderRadius="md"
          color={useColorModeValue('blue.600', 'blue.300')}
        >
          <IconComponent size={20} />
        </Box>
        <VStack align="start" spacing={1} flex={1}>
          <HStack spacing={2}>
            <FormLabel htmlFor={settingKey} mb={0} fontWeight="medium" color={textColor}>
              {title}
            </FormLabel>
            {badge && (
              <Badge colorScheme="blue" size="sm" variant="subtle">
                {badge}
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color={mutedTextColor}>
            {description}
          </Text>
        </VStack>
      </HStack>
      <Switch
        id={settingKey}
        isChecked={settings[settingKey]}
        onChange={() => toggleSetting(settingKey)}
        colorScheme="blue"
        ml={4}
      />
    </FormControl>
  );

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="bold" color={textColor} mb={2}>
            Notification Settings
          </Text>
          <Text fontSize="sm" color={mutedTextColor}>
            Customize how and when you receive notifications about your trading activities.
          </Text>
        </Box>

        <VStack spacing={4} align="stretch">
          <SettingItem
            icon={Bell}
            title="Smart Reminders"
            description="Get intelligent reminders based on your trading patterns and market conditions."
            settingKey="smartReminders"
            badge="Recommended"
          />
          
          <SettingItem
            icon={Mail}
            title="Email Notifications"
            description="Receive important reminders and updates via email."
            settingKey="emailNotifications"
          />

          <SettingItem
            icon={Bell}
            title="Trade Reminders"
            description="Reminders to log your trades after market hours."
            settingKey="tradeReminders"
          />

          <SettingItem
            icon={Bell}
            title="Market Open Reminders"
            description="Reminders before market opens to review your watchlist and plan."
            settingKey="marketOpenReminders"
          />

          <SettingItem
            icon={Bell}
            title="Weekly Reports"
            description="Receive weekly summaries of your trading performance."
            settingKey="weeklyReports"
          />

          <SettingItem
            icon={Bell}
            title="Achievement Notifications"
            description="Get notified when you reach trading milestones and achievements."
            settingKey="achievementNotifications"
          />

          <SettingItem
            icon={Bell}
            title="System Alerts"
            description="Important system updates, maintenance notices, and security alerts."
            settingKey="systemAlerts"
            badge="Important"
          />
        </VStack>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Notification Timing</Text>
            <Text fontSize="sm">
              Smart reminders are sent at optimal times based on market hours and your activity patterns.
            </Text>
          </Box>
        </Alert>

        <HStack spacing={3} justify="flex-end">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            colorScheme="gray"
          >
            Reset to Defaults
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default NotificationSettingsComponent; 