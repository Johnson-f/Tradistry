import { useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';

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

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    };

    // Set up real-time subscription for manual reminder notifications
    const setupNotifications = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      // Create a channel for manual reminder notifications
      channelRef.current = supabase
        .channel('manual_reminder_notifications')
        .on('broadcast', { event: 'manual_reminder' }, (payload) => {
          const notification: ManualReminderNotification = payload.payload;
          
          // Only show notifications for the current user
          if (notification.user_id === user.id) {
            showNotification(notification);
          }
        })
        .subscribe();

      console.log('Manual reminder notifications subscription set up');
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

      console.log('Manual reminder notification shown:', notification);
    };

    // Set up notifications
    setupNotifications();

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        console.log('Manual reminder notifications subscription cleaned up');
      }
    };
  }, [toast]);

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
        console.error('Error checking notifications:', error);
        return;
      }

      if (pendingReminders && pendingReminders.length > 0) {
        console.log(`Found ${pendingReminders.length} pending reminders`);
        
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
      console.error('Error checking notifications:', error);
    }
  };

  return {
    checkNotifications,
  };
} 