import { useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { notificationService } from '../services/NotificationService';
import { supabase } from '../supabaseClient';

export function useSmartNotifications() {
  const toast = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        // Get user's notification preferences
        const preferences = await notificationService.getUserNotificationPreferences();
        if (!preferences) {
          console.log('Could not fetch notification preferences, using defaults');
          // Continue with default preferences
        } else if (!preferences.smartReminders) {
          console.log('Smart reminders disabled by user');
          return;
        }

        // Get eligible notifications for the user
        const notifications = await notificationService.getUserNotifications();
        
        if (notifications.length === 0) {
          console.log('No eligible notifications found');
          return;
        }

        console.log(`Found ${notifications.length} eligible notifications`);

        // Process each notification
        for (const notification of notifications) {
          // Check if user should receive this notification
          const shouldSend = await notificationService.shouldSendNotification(notification.id);
          if (!shouldSend) {
            console.log(`Skipping notification ${notification.id} - user not eligible`);
            continue;
          }

          // Show toast notification if it supports toast or both
          if (notification.notification_category === 'toast' || 
              notification.notification_category === 'both') {
            
            // Determine toast status based on notification type
            let status: 'info' | 'success' | 'warning' | 'error' = 'info';
            switch (notification.notification_type) {
              case 'achievement':
                status = 'success';
                break;
              case 'alert':
              case 'system':
                status = 'warning';
                break;
              case 'reminder':
              case 'tip':
              case 'motivation':
              default:
                status = 'info';
                break;
            }

            // Show the toast
            toast({
              title: notification.title,
              description: notification.toast_message || notification.message,
              status,
              duration: notification.priority >= 3 ? 15000 : 10000, // Longer duration for high priority
              isClosable: true,
              position: 'top-right',
              variant: 'solid',
            });

            // Mark notification as sent
            await notificationService.markNotificationSent(notification.id, 'toast');
            
            console.log(`Showed toast notification: ${notification.title}`);
          }

          // Send email if user has email notifications enabled
          if (preferences?.alwaysSendEmail && 
              (notification.notification_category === 'email' || notification.notification_category === 'both') &&
              notification.email_subject && notification.email_body) {
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
              const emailSent = await notificationService.sendEmailNotification(
                user.email,
                notification.email_subject,
                notification.email_body
              );
              
              if (emailSent) {
                await notificationService.markNotificationSent(notification.id, 'email');
                console.log(`Sent email notification: ${notification.email_subject}`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing notifications:', error);
      }
    };

    // Check notifications on app load
    checkNotifications();
    
    // Set up interval to check notifications every 5 minutes while app is open
    intervalRef.current = setInterval(checkNotifications, 5 * 60 * 1000);
    
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [toast]);

  // Listen for custom notification events (for manual triggers)
  useEffect(() => {
    const handleNotificationEvent = (event: CustomEvent) => {
      const { title, message, type, priority, requiresAction } = event.detail;
      
      let status: 'info' | 'success' | 'warning' | 'error' = 'info';
      switch (type) {
        case 'achievement':
          status = 'success';
          break;
        case 'alert':
        case 'system':
          status = 'warning';
          break;
        default:
          status = 'info';
          break;
      }

      toast({
        title,
        description: message,
        status,
        duration: priority >= 3 ? 15000 : 10000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
    };

    window.addEventListener('notification-toast', handleNotificationEvent as EventListener);
    
    return () => {
      window.removeEventListener('notification-toast', handleNotificationEvent as EventListener);
    };
  }, [toast]);

  return {
    checkNotifications: () => {
      // Expose a function to manually check notifications
      const checkNotifications = async () => {
        try {
          const preferences = await notificationService.getUserNotificationPreferences();
          if (!preferences?.smartReminders) return;

          const notifications = await notificationService.getUserNotifications();
          for (const notification of notifications) {
            const shouldSend = await notificationService.shouldSendNotification(notification.id);
            if (!shouldSend) continue;

            if (notification.notification_category === 'toast' || 
                notification.notification_category === 'both') {
              
              let status: 'info' | 'success' | 'warning' | 'error' = 'info';
              switch (notification.notification_type) {
                case 'achievement':
                  status = 'success';
                  break;
                case 'alert':
                case 'system':
                  status = 'warning';
                  break;
                default:
                  status = 'info';
                  break;
              }

              toast({
                title: notification.title,
                description: notification.toast_message || notification.message,
                status,
                duration: notification.priority >= 3 ? 15000 : 10000,
                isClosable: true,
                position: 'top-right',
                variant: 'solid',
              });

              await notificationService.markNotificationSent(notification.id, 'toast');
            }
          }
        } catch (error) {
          console.error('Error manually checking notifications:', error);
        }
      };
      checkNotifications();
    }
  };
} 