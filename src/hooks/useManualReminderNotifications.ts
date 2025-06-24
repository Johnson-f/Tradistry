import { useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import { logger } from '../services/logger';

interface ManualReminderNotification {
  user_id: string;
  reminder_id: number;
  title: string;
  description?: string;
  priority: number;
  reminder_type: string;
  timestamp: string;
}

export function useManualReminderNotifications() {
  const toast = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const cleanupRef = useRef(false);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    };

    // Set up real-time subscription for manual reminder notifications
    const setupNotifications = async () => {
      // Prevent setup if component is unmounting
      if (cleanupRef.current) return;

      const user = await getCurrentUser();
      if (!user) return;

      // Prevent multiple subscriptions
      if (isSubscribedRef.current && channelRef.current) {
        logger.debug('Manual reminder notifications already subscribed', { hook: 'useManualReminderNotifications' });
        return;
      }

      // Clean up any existing channel first
      if (channelRef.current) {
        try {
          await supabase.removeChannel(channelRef.current);
          logger.debug('Existing manual reminder channel removed', { hook: 'useManualReminderNotifications' });
        } catch (error) {
          logger.debug('No existing channel to remove or error during removal', { error, hook: 'useManualReminderNotifications' });
        }
        channelRef.current = null;
        isSubscribedRef.current = false;
      }

      // Create a channel for manual reminder notifications
      channelRef.current = supabase
        .channel('manual_reminder_notifications')
        .on('broadcast', { event: 'manual_reminder' }, (payload) => {
          const notification: ManualReminderNotification = payload.payload;
          
          // Only show notifications for the current user
          if (notification.user_id === user.id) {
            showNotification(notification);
          }
        });

      try {
        await channelRef.current.subscribe();
        isSubscribedRef.current = true;
        logger.info('Manual reminder notifications subscription set up successfully', { hook: 'useManualReminderNotifications' });
      } catch (error) {
        logger.error('Error setting up manual reminder notifications', error, { hook: 'useManualReminderNotifications' });
        isSubscribedRef.current = false;
        channelRef.current = null;
      }
    };

    // Show notification toast
    const showNotification = (notification: ManualReminderNotification) => {
      // Determine toast status based on priority
      let status: 'info' | 'success' | 'warning' | 'error' = 'info';
      switch (notification.priority) {
        case 4: // Urgent
          status = 'error';
          break;
        case 3: // High
          status = 'warning';
          break;
        case 2: // Medium
          status = 'info';
          break;
        case 1: // Low
          status = 'success';
          break;
        default:
          status = 'info';
      }

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.description || 'You have a reminder!',
        status,
        duration: notification.priority >= 3 ? 15000 : 10000, // Longer duration for high priority
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });

      logger.debug('Manual reminder notification shown', { notification, hook: 'useManualReminderNotifications' });
    };

    // Set up notifications
    setupNotifications();

    // Cleanup on unmount
    return () => {
      cleanupRef.current = true;
      
      const cleanup = async () => {
        if (channelRef.current && isSubscribedRef.current) {
          try {
            await supabase.removeChannel(channelRef.current);
            isSubscribedRef.current = false;
            channelRef.current = null;
            logger.info('Manual reminder notifications subscription cleaned up', { hook: 'useManualReminderNotifications' });
          } catch (error) {
            logger.error('Error cleaning up manual reminder notifications', error, { hook: 'useManualReminderNotifications' });
          }
        }
      };
      
      cleanup();
    };
  }, []); // Empty dependency array to prevent re-subscription

  // Function to manually check for notifications (useful for testing)
  const checkNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get any pending notifications for the user
      const { data: pendingReminders, error } = await supabase
        .rpc('get_user_manual_reminders', {
          p_status: 'pending',
          p_active_only: true
        });

      if (error) {
        logger.error('Error checking notifications', error, { hook: 'useManualReminderNotifications' });
        return;
      }

      if (pendingReminders && pendingReminders.length > 0) {
        logger.info(`Found ${pendingReminders.length} pending reminders`, { count: pendingReminders.length, hook: 'useManualReminderNotifications' });
        
        // Show notification for the most recent one
        const mostRecent = pendingReminders[0];
        toast({
          title: mostRecent.title,
          description: mostRecent.description || 'You have a pending reminder!',
          status: 'info',
          duration: 10000,
          isClosable: true,
          position: 'top-right',
        });
      }
    } catch (error) {
      logger.error('Error checking notifications', error, { hook: 'useManualReminderNotifications' });
    }
  };

  return {
    checkNotifications,
  };
} 