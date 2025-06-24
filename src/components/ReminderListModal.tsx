// Reminder list Modal 
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Divider,
  Flex,
} from '@chakra-ui/react';
import { 
  Bell, 
  Edit, 
  X, 
  Check, 
  Clock, 
  Calendar, 
  Repeat, 
  Mail, 
  Smartphone,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useManualReminders, ManualReminder } from '../hooks/useManualReminders';
import { ManualReminderModal } from './ManualReminderModal';
import { logger } from '../services/logger';

interface ReminderListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReminderListModal: React.FC<ReminderListModalProps> = ({
  isOpen,
  onClose
}) => {
  const toast = useToast();
  const { 
    reminders, 
    loading, 
    cancelReminder, 
    completeReminder, 
    deleteReminder,
    refreshReminders 
  } = useManualReminders();

  // State for edit modal
  const [editingReminder, setEditingReminder] = useState<ManualReminder | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Handle edit reminder
  const handleEdit = (reminder: ManualReminder) => {
    setEditingReminder(reminder);
    setShowEditModal(true);
  };

  // Handle cancel reminder
  const handleCancel = async (reminderId: number) => {
    try {
      await cancelReminder(reminderId);
    } catch (error) {
      logger.error('Error cancelling reminder', error, { reminderId, component: 'ReminderListModal' });
    }
  };

  // Handle complete reminder
  const handleComplete = async (reminderId: number) => {
    try {
      await completeReminder(reminderId);
    } catch (error) {
      logger.error('Error completing reminder', error, { reminderId, component: 'ReminderListModal' });
    }
  };

  // Handle delete reminder
  const handleDelete = async (reminderId: number) => {
    try {
      await deleteReminder(reminderId);
    } catch (error) {
      logger.error('Error deleting reminder', error, { reminderId, component: 'ReminderListModal' });
    }
  };

  // Close edit modal and refresh
  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingReminder(null);
    refreshReminders();
  };

  // Close create modal and refresh
  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    refreshReminders();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'blue';
      case 'sent': return 'green';
      case 'cancelled': return 'red';
      case 'completed': return 'purple';
      default: return 'gray';
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get time until reminder
  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const reminderTime = new Date(dateString);
    const diff = reminderTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Overdue';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Filter reminders by status
  const pendingReminders = reminders.filter(r => r.status === 'pending' && r.is_active);
  const completedReminders = reminders.filter(r => r.status === 'completed');
  const cancelledReminders = reminders.filter(r => r.status === 'cancelled');

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack justify="space-between" w="full">
              <HStack>
                <Bell size={20} />
                <Text>My Reminders</Text>
              </HStack>
              <Button
                leftIcon={<Plus size={16} />}
                colorScheme="blue"
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                New Reminder
              </Button>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {loading ? (
              <Flex justify="center" py={8}>
                <Spinner color="blue.400" />
              </Flex>
            ) : (
              <VStack spacing={6} align="stretch">
                {/* Active Reminders */}
                {pendingReminders.length > 0 && (
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4}>
                      Active Reminders ({pendingReminders.length})
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {pendingReminders.map((reminder) => (
                        <Box
                          key={reminder.id}
                          p={4}
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                          bg="white"
                        >
                          <Flex justify="space-between" align="start" mb={2}>
                            <Box flex={1}>
                              <HStack mb={2}>
                                <Text fontWeight="semibold" fontSize="md">
                                  {reminder.title}
                                </Text>
                                <Badge colorScheme={getPriorityColor(reminder.priority)} size="sm">
                                  {getPriorityLabel(reminder.priority)}
                                </Badge>
                                <Badge colorScheme="blue" size="sm">
                                  {reminder.reminder_type}
                                </Badge>
                                {reminder.is_recurring && (
                                  <Badge colorScheme="green" size="sm">
                                    <Repeat size={12} style={{ marginRight: '4px' }} />
                                    Recurring
                                  </Badge>
                                )}
                              </HStack>
                              
                              {reminder.description && (
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                  {reminder.description}
                                </Text>
                              )}

                              <HStack spacing={4} fontSize="sm" color="gray.500">
                                <HStack>
                                  <Calendar size={14} />
                                  <Text>{formatDate(reminder.next_send_at)}</Text>
                                </HStack>
                                <HStack>
                                  <Clock size={14} />
                                  <Text>{getTimeUntil(reminder.next_send_at)}</Text>
                                </HStack>
                                <HStack>
                                  {reminder.send_email && <Mail size={14} />}
                                  {reminder.send_in_app && <Smartphone size={14} />}
                                </HStack>
                              </HStack>
                            </Box>

                            <HStack spacing={1}>
                              <IconButton
                                aria-label="Edit reminder"
                                icon={<Edit size={16} />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(reminder)}
                              />
                              <IconButton
                                aria-label="Complete reminder"
                                icon={<Check size={16} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => handleComplete(reminder.id)}
                              />
                              <IconButton
                                aria-label="Cancel reminder"
                                icon={<X size={16} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleCancel(reminder.id)}
                              />
                            </HStack>
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Completed Reminders */}
                {completedReminders.length > 0 && (
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4}>
                      Completed ({completedReminders.length})
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {completedReminders.slice(0, 5).map((reminder) => (
                        <Box
                          key={reminder.id}
                          p={3}
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                          bg="gray.50"
                          opacity={0.7}
                        >
                          <Flex justify="space-between" align="center">
                            <Text fontSize="sm" fontWeight="medium">
                              {reminder.title}
                            </Text>
                            <Badge colorScheme="purple" size="sm">
                              Completed
                            </Badge>
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* No Reminders */}
                {reminders.length === 0 && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="medium">No reminders yet</Text>
                      <Text fontSize="sm">
                        Create your first reminder to get started with custom notifications.
                      </Text>
                    </Box>
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <ManualReminderModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        editingReminder={editingReminder}
        mode="edit"
      />

      {/* Create Modal */}
      <ManualReminderModal
        isOpen={showCreateModal}
        onClose={handleCreateModalClose}
        editingReminder={null}
        mode="create"
      />
    </>
  );
}; 