// This hook is used to manage notification settings for the user 
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import { logger } from '../services/logger';

export interface NotificationSettings {
  smartReminders: boolean;
  emailNotifications: boolean;
  tradeReminders: boolean;
  marketOpenReminders: boolean;
  weeklyReports: boolean;
  achievementNotifications: boolean;
  systemAlerts: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  smartReminders: true,
  emailNotifications: false,
  tradeReminders: true,
  marketOpenReminders: true,
  weeklyReports: true,
  achievementNotifications: true,
  systemAlerts: true,
};

const NOTIFICATION_SETTINGS_KEY = 'notification-settings';

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Load settings from localStorage and Supabase
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load from localStorage first
      const localSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      let localData: Partial<NotificationSettings> = {};
      
      if (localSettings) {
        try {
          localData = JSON.parse(localSettings);
        } catch (error) {
          logger.error('Error parsing local notification settings', error, { hook: 'useNotificationSettings' });
        }
      }

      // Get user's email preference from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('always_send_email')
          .eq('id', user.id)
          .single();

        if (profile) {
          localData.emailNotifications = profile.always_send_email;
        }
      }

      // Merge with defaults
      const mergedSettings = { ...DEFAULT_SETTINGS, ...localData };
      setSettings(mergedSettings);
    } catch (error) {
      logger.error('Error loading notification settings', error, { hook: 'useNotificationSettings' });
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save settings to localStorage and Supabase
  const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      // Save to localStorage
      localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      
      // Save email preference to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            always_send_email: newSettings.emailNotifications,
            updated_at: new Date().toISOString(),
          });
      }

      setSettings(newSettings);
      
      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      logger.error('Error saving notification settings', error, { hook: 'useNotificationSettings' });
      toast({
        title: 'Error',
        description: 'Failed to save notification settings. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Toggle individual settings
  const toggleSetting = useCallback(async (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Update multiple settings at once
  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    const newSettings = {
      ...settings,
      ...updates,
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    await saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    toggleSetting,
    updateSettings,
    resetToDefaults,
    reloadSettings: loadSettings,
  };
} 