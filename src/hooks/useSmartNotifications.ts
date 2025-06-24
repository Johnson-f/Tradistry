// This hook is used to manage smart notifications 
import { useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { notificationService } from '../services/NotificationService';
import { supabase } from '../supabaseClient';
import { useNotificationSettings } from './useNotificationSettings';
import { logger } from '../services/logger';

export function useSmartNotifications() {
  const toast = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { settings } = useNotificationSettings();

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        // Check if smart reminders are enabled
        if (!settings.smartReminders) {
          logger.debug('Smart reminders disabled by user', { hook: 'useSmartNotifications' });
          return;
        }

        // Get eligible notifications for the user
        const notifications = await notificationService.getUserNotifications();
        
        if (notifications.length === 0) {
          logger.debug('No eligible notifications found', { hook: 'useSmartNotifications' });
          return;
        }

        logger.info(`Found ${notifications.length} eligible notifications`, { count: notifications.length, hook: 'useSmartNotifications' });

        // Process each notification
        for (const notification of notifications) {
          // Check if user should receive this notification
          const shouldSend = await notificationService.shouldSendNotification(notification.id);
          if (!shouldSend) {
            logger.debug(`Skipping notification ${notification.id} - user not eligible`, { notificationId: notification.id, hook: 'useSmartNotifications' });
            continue;
          }

          // Check specific notification type settings
          let shouldShowNotification = true;
          
          switch (notification.notification_type) {
            case 'trade_reminder':
              shouldShowNotification = settings.tradeReminders;
              break;
            case 'market_open':
              shouldShowNotification = settings.marketOpenReminders;
              break;
            case 'weekly_report':
              shouldShowNotification = settings.weeklyReports;
              break;
            case 'achievement':
              shouldShowNotification = settings.achievementNotifications;
              break;
            case 'system_alert':
              shouldShowNotification = settings.systemAlerts;
              break;
            default:
              shouldShowNotification = true;
          }

          if (!shouldShowNotification) {
            logger.debug(`Skipping notification ${notification.id} - type disabled by user`, { notificationId: notification.id, notificationType: notification.notification_type, hook: 'useSmartNotifications' });
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
              case 'system_alert':
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
            
            logger.info(`Showed toast notification: ${notification.title}`, { notificationId: notification.id, title: notification.title, hook: 'useSmartNotifications' });
          }

          // Send email if user has email notifications enabled
          if (settings.emailNotifications && 
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
                logger.info(`Sent email notification: ${notification.email_subject}`, { notificationId: notification.id, emailSubject: notification.email_subject, hook: 'useSmartNotifications' });
              }
            }
          }
        }
      } catch (error) {
        logger.error('Error processing notifications', error, { hook: 'useSmartNotifications' });
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
  }, [toast, settings]);

  // Listen for custom notification events (for manual triggers)
  useEffect(() => {
    const handleNotificationEvent = (event: CustomEvent) => {
      const { title, message, type, priority, requiresAction } = event.detail;
      
      // Check if the notification type is enabled
      let shouldShowNotification = true;
      
      switch (type) {
        case 'trade_reminder':
          shouldShowNotification = settings.tradeReminders;
          break;
        case 'market_open':
          shouldShowNotification = settings.marketOpenReminders;
          break;
        case 'weekly_report':
          shouldShowNotification = settings.weeklyReports;
          break;
        case 'achievement':
          shouldShowNotification = settings.achievementNotifications;
          break;
        case 'system_alert':
          shouldShowNotification = settings.systemAlerts;
          break;
        default:
          shouldShowNotification = true;
      }

      if (!shouldShowNotification) {
        logger.debug(`Skipping manual notification - type ${type} disabled by user`, { notificationType: type, hook: 'useSmartNotifications' });
        return;
      }
      
      let status: 'info' | 'success' | 'warning' | 'error' = 'info';
      switch (type) {
        case 'achievement':
          status = 'success';
          break;
        case 'alert':
        case 'system_alert':
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
  }, [toast, settings]);

  return {
    checkNotifications: () => {
      // Expose a function to manually check notifications
      const checkNotifications = async () => {
        try {
          if (!settings.smartReminders) return;

          const notifications = await notificationService.getUserNotifications();
          for (const notification of notifications) {
            const shouldSend = await notificationService.shouldSendNotification(notification.id);
            if (!shouldSend) continue;

            // Check specific notification type settings
            let shouldShowNotification = true;
            
            switch (notification.notification_type) {
              case 'trade_reminder':
                shouldShowNotification = settings.tradeReminders;
                break;
              case 'market_open':
                shouldShowNotification = settings.marketOpenReminders;
                break;
              case 'weekly_report':
                shouldShowNotification = settings.weeklyReports;
                break;
              case 'achievement':
                shouldShowNotification = settings.achievementNotifications;
                break;
              case 'system_alert':
                shouldShowNotification = settings.systemAlerts;
                break;
              default:
                shouldShowNotification = true;
            }

            if (!shouldShowNotification) continue;

            if (notification.notification_category === 'toast' || 
                notification.notification_category === 'both') {
              
              let status: 'info' | 'success' | 'warning' | 'error' = 'info';
              switch (notification.notification_type) {
                case 'achievement':
                  status = 'success';
                  break;
                case 'alert':
                case 'system_alert':
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
          logger.error('Error manually checking notifications', error, { hook: 'useSmartNotifications' });
        }
      };
      checkNotifications();
    },
  };
} 