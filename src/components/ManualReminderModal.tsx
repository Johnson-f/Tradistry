// Manual Reminder Modal 
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  VStack,
  HStack,
  Text,
  useToast,
  Badge,
  Box,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Calendar, Clock, Bell, Mail, Repeat, AlertTriangle } from 'lucide-react';
import { useManualReminders, CreateReminderData, ManualReminder } from '../hooks/useManualReminders';

interface ManualReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingReminder?: ManualReminder | null;
  mode: 'create' | 'edit';
}

export const ManualReminderModal: React.FC<ManualReminderModalProps> = ({
  isOpen,
  onClose,
  editingReminder,
  mode
}) => {
  const toast = useToast();
  const { createReminder, updateReminder, loading } = useManualReminders();

  // Form state
  const [formData, setFormData] = useState<CreateReminderData>({
    title: '',
    description: '',
    reminder_type: 'general',
    reminder_time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_recurring: false,
    recurrence_pattern: '',
    send_email: true,
    send_in_app: true,
    email_subject: '',
    email_body: '',
    priority: 2,
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when editing
  useEffect(() => {
    if (mode === 'edit' && editingReminder) {
      setFormData({
        title: editingReminder.title,
        description: editingReminder.description || '',
        reminder_type: editingReminder.reminder_type,
        reminder_time: new Date(editingReminder.reminder_time).toISOString().slice(0, 16),
        timezone: editingReminder.timezone,
        is_recurring: editingReminder.is_recurring,
        recurrence_pattern: editingReminder.recurrence_pattern || '',
        send_email: editingReminder.send_email,
        send_in_app: editingReminder.send_in_app,
        email_subject: editingReminder.email_subject || '',
        email_body: editingReminder.email_body || '',
        priority: editingReminder.priority,
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        reminder_type: 'general',
        reminder_time: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        is_recurring: false,
        recurrence_pattern: '',
        send_email: true,
        send_in_app: true,
        email_subject: '',
        email_body: '',
        priority: 2,
      });
    }
    setErrors({});
  }, [mode, editingReminder, isOpen]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.reminder_time) {
      newErrors.reminder_time = 'Reminder time is required';
    } else {
      const selectedTime = new Date(formData.reminder_time);
      const now = new Date();
      if (selectedTime <= now) {
        newErrors.reminder_time = 'Reminder time must be in the future';
      }
    }

    if (formData.is_recurring && !formData.recurrence_pattern) {
      newErrors.recurrence_pattern = 'Recurrence pattern is required for recurring reminders';
    }

    if (formData.send_email && !formData.email_subject) {
      newErrors.email_subject = 'Email subject is required when email notifications are enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        await createReminder(formData);
      } else if (editingReminder) {
        await updateReminder(editingReminder.id, formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof CreateReminderData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Get priority color
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'gray';
      case 2: return 'blue';
      case 3: return 'orange';
      case 4: return 'red';
      default: return 'blue';
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Urgent';
      default: return 'Medium';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Bell size={20} />
            <Text>{mode === 'create' ? 'Create New Reminder' : 'Edit Reminder'}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>Basic Information</Text>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.title}>
                  <FormLabel>Title *</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="What do you want to be reminded about?"
                  />
                  {errors.title && <Text color="red.500" fontSize="sm">{errors.title}</Text>}
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Additional details about this reminder..."
                    rows={3}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={formData.reminder_type}
                      onChange={(e) => handleFieldChange('reminder_type', e.target.value)}
                    >
                      <option value="general">General</option>
                      <option value="trading">Trading</option>
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="health">Health</option>
                      <option value="finance">Finance</option>
                      <option value="learning">Learning</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      value={formData.priority}
                      onChange={(e) => handleFieldChange('priority', parseInt(e.target.value))}
                    >
                      <option value={1}>Low</option>
                      <option value={2}>Medium</option>
                      <option value={3}>High</option>
                      <option value={4}>Urgent</option>
                    </Select>
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Scheduling */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>Scheduling</Text>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.reminder_time}>
                  <FormLabel>Reminder Time *</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.reminder_time}
                    onChange={(e) => handleFieldChange('reminder_time', e.target.value)}
                  />
                  {errors.reminder_time && <Text color="red.500" fontSize="sm">{errors.reminder_time}</Text>}
                </FormControl>

                <FormControl>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    value={formData.timezone}
                    onChange={(e) => handleFieldChange('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </Select>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Recurring Reminder</FormLabel>
                  <Switch
                    isChecked={formData.is_recurring}
                    onChange={(e) => handleFieldChange('is_recurring', e.target.checked)}
                  />
                </FormControl>

                {formData.is_recurring && (
                  <FormControl isInvalid={!!errors.recurrence_pattern}>
                    <FormLabel>Recurrence Pattern</FormLabel>
                    <Input
                      value={formData.recurrence_pattern}
                      onChange={(e) => handleFieldChange('recurrence_pattern', e.target.value)}
                      placeholder="e.g., 0 9 * * 1-5 (weekdays at 9 AM)"
                    />
                    {errors.recurrence_pattern && <Text color="red.500" fontSize="sm">{errors.recurrence_pattern}</Text>}
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Use cron format: minute hour day month weekday
                    </Text>
                  </FormControl>
                )}
              </VStack>
            </Box>

            <Divider />

            {/* Notification Settings */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>Notification Settings</Text>
              <VStack spacing={4}>
                <HStack spacing={6}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">In-App Notification</FormLabel>
                    <Switch
                      isChecked={formData.send_in_app}
                      onChange={(e) => handleFieldChange('send_in_app', e.target.checked)}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Email Notification</FormLabel>
                    <Switch
                      isChecked={formData.send_email}
                      onChange={(e) => handleFieldChange('send_email', e.target.checked)}
                    />
                  </FormControl>
                </HStack>

                {formData.send_email && (
                  <VStack spacing={4} w="full">
                    <FormControl isInvalid={!!errors.email_subject}>
                      <FormLabel>Email Subject</FormLabel>
                      <Input
                        value={formData.email_subject}
                        onChange={(e) => handleFieldChange('email_subject', e.target.value)}
                        placeholder="Subject for the email notification"
                      />
                      {errors.email_subject && <Text color="red.500" fontSize="sm">{errors.email_subject}</Text>}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Email Body</FormLabel>
                      <Textarea
                        value={formData.email_body}
                        onChange={(e) => handleFieldChange('email_body', e.target.value)}
                        placeholder="Custom email message (optional)"
                        rows={4}
                      />
                    </FormControl>
                  </VStack>
                )}
              </VStack>
            </Box>

            {/* Preview */}
            {formData.title && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">Reminder Preview</Text>
                  <Text fontSize="sm" mt={1}>
                    <strong>{formData.title}</strong>
                    {formData.description && ` - ${formData.description}`}
                  </Text>
                  <HStack mt={2} spacing={2}>
                    <Badge colorScheme={getPriorityColor(formData.priority || 2)}>
                      {getPriorityLabel(formData.priority || 2)}
                    </Badge>
                    <Badge colorScheme="blue">
                      {formData.reminder_type}
                    </Badge>
                    {formData.is_recurring && (
                      <Badge colorScheme="green">
                        <Repeat size={12} style={{ marginRight: '4px' }} />
                        Recurring
                      </Badge>
                    )}
                  </HStack>
                </Box>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText={mode === 'create' ? 'Creating...' : 'Updating...'}
            >
              {mode === 'create' ? 'Create Reminder' : 'Update Reminder'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 