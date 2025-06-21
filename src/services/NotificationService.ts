import { supabase } from '../supabaseClient';

// Types for notifications
export interface NotificationTemplate {
  id: number;
  notification_type: string;
  notification_category: string;
  title: string;
  message: string;
  email_subject?: string;
  email_body?: string;
  toast_message?: string;
  priority: number;
  requires_action: boolean;
  delay_minutes: number;
  expires_after_hours?: number;
  send_once: boolean;
  target_user_type: string;
  min_entries_required: number;
  days_since_signup?: number;
}

export interface NotificationHistory {
  id: number;
  user_id: string;
  notification_id: number;
  sent_at: string;
  sent_via: string;
  status: string;
  read_at?: string;
  email_sent: boolean;
  toast_sent: boolean;
  error_message?: string;
}

export interface UserNotificationStats {
  total_notifications: number;
  emails_sent: number;
  toasts_sent: number;
  notifications_read: number;
  notifications_pending: number;
}

class NotificationService {
  // Get notifications for the current user
  async getUserNotifications(): Promise<NotificationTemplate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('get_user_notifications');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  // Mark a notification as sent
  async markNotificationSent(
    notificationId: number, 
    sentVia: 'email' | 'toast' | 'both' | 'system' = 'system'
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('mark_notification_sent', {
          p_notification_id: notificationId,
          p_sent_via: sentVia
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error marking notification sent:', error);
      return false;
    }
  }

  // Update notification status (e.g., mark as read)
  async updateNotificationStatus(
    notificationId: number,
    status: 'sent' | 'delivered' | 'failed' | 'read' | 'pending'
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('update_notification_status', {
          p_notification_id: notificationId,
          p_status: status
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error updating notification status:', error);
      return false;
    }
  }

  // Get notification statistics for the user
  async getUserNotificationStats(daysBack: number = 30): Promise<UserNotificationStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('get_user_notification_stats', {
          p_days_back: daysBack
        });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return null;
    }
  }

  // Check if user should receive a specific notification
  async shouldSendNotification(notificationId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('should_send_notification', {
          p_notification_id: notificationId
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking notification eligibility:', error);
      return false;
    }
  }

  // Get user's notification preferences
  async getUserNotificationPreferences(): Promise<{
    alwaysSendEmail: boolean;
    smartReminders: boolean;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, try to get existing profile
      let { data, error } = await supabase
        .from('profiles')
        .select('always_send_email')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create one
      if (error && error.code === 'PGRST116') {
        console.log('Profile not found, creating new profile for user:', user.id);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            always_send_email: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('always_send_email')
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          // Return default values if profile creation fails
          return {
            alwaysSendEmail: false,
            smartReminders: true
          };
        }

        data = newProfile;
      } else if (error) {
        console.error('Error fetching profile:', error);
        // Return default values if there's an error
        return {
          alwaysSendEmail: false,
          smartReminders: true
        };
      }

      // Get smart reminders setting from localStorage
      const localSettings = localStorage.getItem('notifications');
      const smartReminders = localSettings ? 
        JSON.parse(localSettings).smartReminders !== false : true;

      return {
        alwaysSendEmail: data?.always_send_email || false,
        smartReminders
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      // Return default values if there's an error
      return {
        alwaysSendEmail: false,
        smartReminders: true
      };
    }
  }

  // Send email notification (this would integrate with your email service)
  async sendEmailNotification(
    userEmail: string,
    subject: string,
    body: string
  ): Promise<boolean> {
    try {
      // This is where you'd integrate with your email service
      // For now, we'll just log it and return true
      console.log('Sending email notification:', {
        to: userEmail,
        subject,
        body: body.substring(0, 100) + '...'
      });

      // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
      // Example with a hypothetical email service:
      // const response = await emailService.send({
      //   to: userEmail,
      //   subject,
      //   html: body
      // });
      // return response.success;

      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  // Process and send notifications based on templates
  async processNotifications(): Promise<void> {
    try {
      const preferences = await this.getUserNotificationPreferences();
      if (!preferences) return;

      const notifications = await this.getUserNotifications();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const notification of notifications) {
        // Check if user should receive this notification
        const shouldSend = await this.shouldSendNotification(notification.id);
        if (!shouldSend) continue;

        let emailSent = false;
        let toastSent = false;

        // Send email if user has email notifications enabled and notification supports it
        if (preferences.alwaysSendEmail && 
            (notification.notification_category === 'email' || notification.notification_category === 'both') &&
            notification.email_subject && notification.email_body) {
          emailSent = await this.sendEmailNotification(
            user.email!,
            notification.email_subject,
            notification.email_body
          );
        }

        // Send toast notification if notification supports it
        if (notification.notification_category === 'toast' || notification.notification_category === 'both') {
          toastSent = true;
          // The toast will be handled by the UI components
          this.triggerToastNotification(notification);
        }

        // Mark notification as sent
        const sentVia = emailSent && toastSent ? 'both' : 
                       emailSent ? 'email' : 
                       toastSent ? 'toast' : 'system';
        
        await this.markNotificationSent(notification.id, sentVia);
      }
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  }

  // Trigger toast notification (this will be called by UI components)
  private triggerToastNotification(notification: NotificationTemplate): void {
    // Dispatch a custom event that UI components can listen to
    const event = new CustomEvent('notification-toast', {
      detail: {
        title: notification.title,
        message: notification.toast_message || notification.message,
        type: notification.notification_type,
        priority: notification.priority,
        requiresAction: notification.requires_action
      }
    });
    window.dispatchEvent(event);
  }

  // Get scheduled notifications for a specific time
  async getScheduledNotifications(
    targetTime: string,
    userType: string = 'all'
  ): Promise<NotificationTemplate[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_scheduled_notifications', {
          p_target_time: targetTime,
          p_user_type: userType
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
      return [];
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService; 