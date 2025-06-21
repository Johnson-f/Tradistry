const { createClient } = require('@supabase/supabase-js');

// Your actual Supabase credentials
const supabaseUrl = 'https://xzzpqryqndcfrwltlfpj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6enBxcnlxbmRjZnJ3bHRsZnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDYwODEsImV4cCI6MjA2NDg4MjA4MX0.xc6dyc7ThqoV0wxkpPXs04t4rUvvL593FA1DR6LTZq4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReminders() {
  console.log('🔍 Checking manual reminders in database...\n');

  try {
    // Check manual_reminders table
    console.log('📋 Manual Reminders Table:');
    const { data: reminders, error: remindersError } = await supabase
      .from('manual_reminders')
      .select('*')
      .order('created_at', { ascending: false });

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      return;
    }

    if (!reminders || reminders.length === 0) {
      console.log('❌ No reminders found in manual_reminders table');
    } else {
      console.log(`✅ Found ${reminders.length} reminders:`);
      reminders.forEach((reminder, index) => {
        console.log(`\n${index + 1}. Reminder ID: ${reminder.id}`);
        console.log(`   Title: ${reminder.title}`);
        console.log(`   Status: ${reminder.status}`);
        console.log(`   Is Active: ${reminder.is_active}`);
        console.log(`   Next Send At: ${reminder.next_send_at}`);
        console.log(`   Created At: ${reminder.created_at}`);
      });
    }

    // Check manual_reminder_history table
    console.log('\n📋 Manual Reminder History Table:');
    const { data: history, error: historyError } = await supabase
      .from('manual_reminder_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (historyError) {
      console.error('Error fetching history:', historyError);
      return;
    }

    if (!history || history.length === 0) {
      console.log('❌ No history records found in manual_reminder_history table');
    } else {
      console.log(`✅ Found ${history.length} history records:`);
      history.forEach((record, index) => {
        console.log(`\n${index + 1}. History ID: ${record.id}`);
        console.log(`   Reminder ID: ${record.reminder_id}`);
        console.log(`   Status: ${record.status}`);
        console.log(`   Scheduled For: ${record.scheduled_for}`);
        console.log(`   Email Sent: ${record.email_sent}`);
        console.log(`   In App Sent: ${record.in_app_sent}`);
        console.log(`   Created At: ${record.created_at}`);
      });
    }

    // Test the get_pending_manual_reminders function
    console.log('\n🔍 Testing get_pending_manual_reminders function:');
    const { data: pendingReminders, error: pendingError } = await supabase
      .rpc('get_pending_manual_reminders', {
        p_current_time: new Date().toISOString()
      });

    if (pendingError) {
      console.error('Error calling get_pending_manual_reminders:', pendingError);
      return;
    }

    if (!pendingReminders || pendingReminders.length === 0) {
      console.log('❌ No pending reminders found by the function');
    } else {
      console.log(`✅ Found ${pendingReminders.length} pending reminders:`);
      pendingReminders.forEach((reminder, index) => {
        console.log(`\n${index + 1}. Reminder ID: ${reminder.id}`);
        console.log(`   Title: ${reminder.title}`);
        console.log(`   Next Send At: ${reminder.next_send_at}`);
        console.log(`   History ID: ${reminder.history_id}`);
      });
    }

    // Check current time vs scheduled times
    console.log('\n⏰ Time Analysis:');
    const now = new Date();
    console.log(`Current time: ${now.toISOString()}`);
    
    if (history && history.length > 0) {
      console.log('\nScheduled times in history:');
      history.forEach((record, index) => {
        const scheduledTime = new Date(record.scheduled_for);
        const isPast = scheduledTime <= now;
        console.log(`${index + 1}. ${record.scheduled_for} (${isPast ? 'PAST' : 'FUTURE'})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkReminders(); 