// Hook for 
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import { logger } from '../services/logger';

export interface ManualReminder {
  id: number;
  title: string;
  description?: string;
  reminder_type: 'general' | 'trading' | 'personal' | 'work' | 'health' | 'finance' | 'learning';
  reminder_time: string;
  timezone: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  send_email: boolean;
  send_in_app: boolean;
  email_subject?: string;
  email_body?: string;
  is_active: boolean;
  status: 'pending' | 'sent' | 'cancelled' | 'completed';
  priority: 1 | 2 | 3 | 4;
  created_at: string;
  updated_at: string;
  last_sent_at?: string;
  next_send_at: string;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  reminder_type?: 'general' | 'trading' | 'personal' | 'work' | 'health' | 'finance' | 'learning';
  reminder_time: string;
  timezone?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  send_email?: boolean;
  send_in_app?: boolean;
  email_subject?: string;
  email_body?: string;
  priority?: 1 | 2 | 3 | 4;
}

export interface UpdateReminderData extends Partial<CreateReminderData> {
  is_active?: boolean;
}

export function useManualReminders() {
  const [reminders, setReminders] = useState<ManualReminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Fetch user's reminders
  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_user_manual_reminders', {
          p_status: null,
          p_active_only: true
        });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setReminders(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reminders';
      setError(errorMessage);
      logger.error('Error fetching reminders', err, { hook: 'useManualReminders' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new reminder
  const createReminder = useCallback(async (reminderData: CreateReminderData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .rpc('create_manual_reminder', {
          p_title: reminderData.title,
          p_description: reminderData.description || null,
          p_reminder_type: reminderData.reminder_type || 'general',
          p_reminder_time: reminderData.reminder_time,
          p_timezone: reminderData.timezone || 'UTC',
          p_is_recurring: reminderData.is_recurring || false,
          p_recurrence_pattern: reminderData.recurrence_pattern || null,
          p_send_email: reminderData.send_email !== false,
          p_send_in_app: reminderData.send_in_app !== false,
          p_email_subject: reminderData.email_subject || null,
          p_email_body: reminderData.email_body || null,
          p_priority: reminderData.priority || 2
        });

      if (createError) {
        throw new Error(createError.message);
      }

      toast({
        title: 'Reminder created',
        description: 'Your reminder has been scheduled successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the reminders list
      await fetchReminders();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reminder';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReminders, toast]);

  // Update an existing reminder
  const updateReminder = useCallback(async (reminderId: number, updateData: UpdateReminderData) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .rpc('update_manual_reminder', {
          p_reminder_id: reminderId,
          p_title: updateData.title || null,
          p_description: updateData.description || null,
          p_reminder_type: updateData.reminder_type || null,
          p_reminder_time: updateData.reminder_time || null,
          p_timezone: updateData.timezone || null,
          p_is_recurring: updateData.is_recurring || null,
          p_recurrence_pattern: updateData.recurrence_pattern || null,
          p_send_email: updateData.send_email || null,
          p_send_in_app: updateData.send_in_app || null,
          p_email_subject: updateData.email_subject || null,
          p_email_body: updateData.email_body || null,
          p_priority: updateData.priority || null,
          p_is_active: updateData.is_active || null
        });

      if (updateError) {
        throw new Error(updateError.message);
      }

      toast({
        title: 'Reminder updated',
        description: 'Your reminder has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the reminders list
      await fetchReminders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update reminder';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReminders, toast]);

  // Cancel a reminder
  const cancelReminder = useCallback(async (reminderId: number) => {
    try {
      setLoading(true);
      setError(null);

      const { error: cancelError } = await supabase
        .rpc('cancel_manual_reminder', {
          p_reminder_id: reminderId
        });

      if (cancelError) {
        throw new Error(cancelError.message);
      }

      toast({
        title: 'Reminder cancelled',
        description: 'Your reminder has been cancelled.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the reminders list
      await fetchReminders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel reminder';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReminders, toast]);

  // Complete a reminder
  const completeReminder = useCallback(async (reminderId: number) => {
    try {
      setLoading(true);
      setError(null);

      const { error: completeError } = await supabase
        .rpc('complete_manual_reminder', {
          p_reminder_id: reminderId
        });

      if (completeError) {
        throw new Error(completeError.message);
      }

      toast({
        title: 'Reminder completed',
        description: 'Your reminder has been marked as completed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the reminders list
      await fetchReminders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete reminder';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReminders, toast]);

  // Delete a reminder (by cancelling it)
  const deleteReminder = useCallback(async (reminderId: number) => {
    try {
      setLoading(true);
      setError(null);

      // First cancel the reminder
      await cancelReminder(reminderId);

      toast({
        title: 'Reminder deleted',
        description: 'Your reminder has been deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reminder';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cancelReminder, toast]);

  // Get reminder history
  const getReminderHistory = useCallback(async (reminderId?: number) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: historyError } = await supabase
        .rpc('get_manual_reminder_history', {
          p_reminder_id: reminderId || null
        });

      if (historyError) {
        throw new Error(historyError.message);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reminder history';
      setError(errorMessage);
      logger.error('Error fetching reminder history', err, { hook: 'useManualReminders' });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load reminders on mount
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  return {
    reminders,
    loading,
    error,
    createReminder,
    updateReminder,
    cancelReminder,
    completeReminder,
    deleteReminder,
    getReminderHistory,
    refreshReminders: fetchReminders,
  };
} 