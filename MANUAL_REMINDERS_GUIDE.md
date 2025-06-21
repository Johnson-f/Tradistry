# Manual Reminder System Guide

## Overview

The manual reminder system allows users to create custom reminders for themselves with both in-app and email notifications. This system is fully integrated with the trading journal calendar interface.

## Features

### Core Functionality
- **Create Custom Reminders**: Set what you want to be reminded of and when
- **Multiple Notification Types**: In-app notifications and email notifications
- **Recurring Reminders**: Set up reminders that repeat on a schedule
- **Priority Levels**: Low, Medium, High, and Urgent priority levels
- **Reminder Types**: General, Trading, Personal, Work, Health, Finance, Learning
- **Timezone Support**: Accurate timing based on your timezone

### User Interface
- **Two Main Buttons**: Located next to "This Month" in the calendar header
  - **"New Reminder"** (Blue button with Plus icon): Create a new reminder
  - **"My Reminders"** (Purple button with Bell icon): View and manage existing reminders

## How to Use

### Creating a New Reminder

1. **Access the Reminder System**:
   - Navigate to the Calendar page
   - Click the **"New Reminder"** button in the top-right area

2. **Fill in Reminder Details**:
   - **Title** (Required): What you want to be reminded about
   - **Description** (Optional): Additional details
   - **Type**: Choose from General, Trading, Personal, Work, Health, Finance, or Learning
   - **Priority**: Select Low, Medium, High, or Urgent

3. **Set Scheduling**:
   - **Reminder Time** (Required): When you want to be reminded
   - **Timezone**: Your local timezone (auto-detected)
   - **Recurring**: Toggle if you want the reminder to repeat
   - **Recurrence Pattern**: Use cron format (e.g., "0 9 * * 1-5" for weekdays at 9 AM)

4. **Configure Notifications**:
   - **In-App Notification**: Receive notification within the app
   - **Email Notification**: Receive email notification
   - **Email Subject**: Custom subject for email notifications
   - **Email Body**: Custom message for email notifications

5. **Save the Reminder**:
   - Click **"Create Reminder"** to save

### Managing Existing Reminders

1. **View All Reminders**:
   - Click the **"My Reminders"** button in the calendar header

2. **Reminder Actions**:
   - **Edit**: Modify reminder details
   - **Complete**: Mark as completed
   - **Cancel**: Cancel the reminder
   - **Delete**: Remove the reminder permanently

3. **Reminder Status**:
   - **Active**: Pending reminders that will be sent
   - **Completed**: Reminders that have been marked as done
   - **Cancelled**: Reminders that have been cancelled

## Reminder Types

### Trading Reminders
- Market open/close reminders
- Trade logging reminders
- Position review reminders
- Earnings call reminders

### Personal Reminders
- Health check-ins
- Exercise reminders
- Personal appointments

### Work Reminders
- Meeting reminders
- Task deadlines
- Project milestones

### Finance Reminders
- Bill payments
- Investment reviews
- Budget check-ins

### Learning Reminders
- Study sessions
- Course deadlines
- Skill practice

## Technical Details

### Database Structure
The system uses two main tables:
- `manual_reminders`: Stores reminder details and settings
- `manual_reminder_history`: Tracks when reminders were sent and their delivery status

### Backend Functions
- `create_manual_reminder()`: Creates new reminders
- `update_manual_reminder()`: Updates existing reminders
- `get_user_manual_reminders()`: Retrieves user's reminders
- `cancel_manual_reminder()`: Cancels reminders
- `complete_manual_reminder()`: Marks reminders as completed

### Frontend Components
- `ManualReminderModal`: Form for creating/editing reminders
- `ReminderListModal`: List view for managing reminders
- `useManualReminders`: Hook for reminder operations

### Notification Processing
- **Supabase Edge Function**: Processes reminders every 5 minutes
- **Email Service**: Uses Resend for email notifications
- **In-App Notifications**: Real-time notifications via WebSockets

## Cron Pattern Examples

### Daily Reminders
- `0 9 * * *` - Every day at 9:00 AM
- `0 18 * * *` - Every day at 6:00 PM

### Weekly Reminders
- `0 9 * * 1-5` - Weekdays at 9:00 AM
- `0 10 * * 0` - Sundays at 10:00 AM

### Monthly Reminders
- `0 9 1 * *` - First day of each month at 9:00 AM
- `0 15 15 * *` - 15th day of each month at 3:00 PM

## Best Practices

### Creating Effective Reminders
1. **Be Specific**: Use clear, actionable titles
2. **Set Realistic Times**: Consider your schedule and timezone
3. **Use Appropriate Priority**: Don't overuse "Urgent"
4. **Add Context**: Use descriptions to provide additional details

### Managing Reminders
1. **Regular Review**: Check your reminders list weekly
2. **Complete vs Cancel**: Mark as completed when done, cancel if no longer needed
3. **Update as Needed**: Modify reminders if circumstances change

### Notification Settings
1. **Balance Notifications**: Don't overwhelm yourself with too many
2. **Use Email Sparingly**: Reserve email for important reminders
3. **Test Your Setup**: Create a test reminder to verify notifications work

## Troubleshooting

### Common Issues

**Reminders not being sent**:
- Check if the Supabase Edge Function is deployed and running
- Verify your email settings if using email notifications
- Check the reminder status in "My Reminders"

**Wrong timezone**:
- Update your timezone setting in the reminder form
- Ensure your system timezone is correct

**Email not received**:
- Check spam/junk folder
- Verify email address is correct
- Ensure email notifications are enabled

### Getting Help
- Check the browser console for error messages
- Verify your internet connection
- Contact support if issues persist

## Integration with Smart Reminders

The manual reminder system works alongside the existing smart reminder system:
- **Smart Reminders**: Automatic, context-aware notifications
- **Manual Reminders**: User-created, custom notifications

Both systems respect your notification preferences and can be managed independently.

## Security and Privacy

- Reminders are private to each user
- Data is encrypted in transit and at rest
- Email addresses are only used for notifications
- Users can delete their reminders at any time

## Future Enhancements

Potential improvements for the manual reminder system:
- **Reminder Templates**: Pre-built templates for common reminders
- **Bulk Operations**: Edit or delete multiple reminders at once
- **Advanced Scheduling**: More sophisticated recurrence patterns
- **Reminder Categories**: Custom categories for better organization
- **Reminder Sharing**: Share reminders with team members (future feature)
- **Mobile Notifications**: Push notifications for mobile devices 