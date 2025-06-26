import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Bell, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient'; 
import { useCalendarLogic } from '../hook2/Calendarlogic';
import { Box, Text, Flex, Button, useColorModeValue } from "@chakra-ui/react";
import { Grid, GridItem, VStack, HStack, Badge, Spinner, useToast } from "@chakra-ui/react";
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton,
  useDisclosure,
  Divider,
  List,
  ListItem,
  ListIcon
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Minus, TrendingUp, TrendingDown, DollarSign, Calendar, Clock } from 'lucide-react';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { useCalendarData } from '../hooks/useCalendarData';
import { useJournalEntries } from '../hook2/Journalentries';
import { useJournalOptions } from '../hook2/Journaloptions';
import useJournalFilter from '../hook2/Journalfilter';
import useOptionsFilter from '../hook2/Optionsfilter';
import useLocalStorage from '../hook2/Localstorage';
import { ManualReminderModal } from './ManualReminderModal';
import { ReminderListModal } from './ReminderListModal';
import { logger } from '../services/logger';

// Utility Functions
const formatCurrency = (amount: number) => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 1000) {
    return `${amount >= 0 ? '' : '-'}$${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${amount >= 0 ? '' : '-'}$${absAmount.toFixed(0)}`;
};

// Function to get the class for each day based on PnL
const getDayBg = (pnl: number, colorMode: string) => {
    if (pnl > 15000) return colorMode === "light" ? "green.600" : "green.500";
    if (pnl > 5000) return colorMode === "light" ? "green.400" : "green.400";
    if (pnl > 0) return colorMode === "light" ? "green.200" : "green.300";
    if (pnl > -5000) return colorMode === "light" ? "red.200" : "red.300";
    if (pnl > -15000) return colorMode === "light" ? "red.400" : "red.500";
    return colorMode === "light" ? "red.600" : "red.700";
};

// Notification settings key
const NOTIFICATION_SETTINGS_KEY = 'notifications';

// Helper to get smartReminders setting from localStorage 
function getSmartRemindersSetting() {
  try {
    const settings = JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || '{}');
    return settings.smartReminders !== false; // default to true if not set 
  } catch {
    return true;
  }
}

// UI components for the stats card, calendar header, and grid 
const StatsCard = ({ title, value, subtitle, hasTooltip = true, delay = 0 }: any) => {
    const cardBg = useColorModeValue("white", "whiteAlpha.100"); // More contrast
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");
    const valueColor = useColorModeValue("green.500", "green.400");
    const MotionBox = motion(Box);
    return (
      <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      boxShadow={useColorModeValue("md", "none")}
      p={4}
      rounded="xl"
      backdropFilter="blur(5px)"
    >
      <Flex align="center" gap={2} mb={2}>
        <Text color="gray.400" fontSize="sm">{title}</Text>
        {hasTooltip && (
          <Box w={4} h={4} bg="gray.600" rounded="full" display="flex" alignItems="center" justifyContent="center">
            <Text fontSize="xs">?</Text>
          </Box>
        )}
      </Flex>
      <Text fontSize="2xl" fontWeight="bold" color={valueColor}>
        {value}
      </Text>
      {subtitle && (
        <Text fontSize="sm" mt={1}>
          {subtitle}
        </Text>
      )}
    </Box>
  );
};

// Function to render the calendar header 
const CalendarHeader = ({ currentDate, onNavigate, onCreateReminder, onViewReminders }: any) => {
    const headerBg = useColorModeValue("gray.200", "gray.800");
    const badgeBg = useColorModeValue("gray.300", "gray.700");
    return (
        <Flex align="center" justify="space-between" mb={4}>
      <HStack spacing={4}>
        <Button
          onClick={() => onNavigate(-1)}
          size="sm"
          variant="ghost"
          aria-label="Previous Month"
        >
          <ChevronLeft />
        </Button>
        <Text fontSize="xl" fontWeight="semibold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <Button
          onClick={() => onNavigate(1)}
          size="sm"
          variant="ghost"
          aria-label="Next Month"
        >
          <ChevronRight />
        </Button>
      </HStack>
      <HStack spacing={3}>
        <Button
          leftIcon={<Plus size={16} />}
          size="sm"
          colorScheme="blue"
          variant="outline"
          onClick={onCreateReminder}
        >
          New Reminder
        </Button>
        <Button
          leftIcon={<Bell size={16} />}
          size="sm"
          colorScheme="purple"
          variant="outline"
          onClick={onViewReminders}
        >
          My Reminders
        </Button>
        <Box bg={badgeBg} px={3} py={1} rounded="md" fontSize="sm">
          This month
        </Box>
      </HStack>
    </Flex>
    );
};

// Function to render the calendar grid 
const CalendarGrid = ({ days, onDateClick }: any) => {
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const todayRing = useColorModeValue("blue.400", "blue.300");
    const colorMode = useColorModeValue("light", "dark");

    return (
        <GridItem colSpan={{ base: 1, lg: 3 }}>
      {/* Day headers */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box key={day} textAlign="center" color="gray.400" fontSize="sm" py={2}>
            {day}
          </Box>
        ))}
      </Grid>
      {/* Calendar grid */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {days.map((dayInfo: any, index: number) => (
          <Box
            key={index}
            aspectRatio={1}
            p={2}
            border="1px solid"
            borderColor={borderColor}
            position="relative"
            opacity={!dayInfo.isCurrentMonth ? 0.3 : 1}
            bg={dayInfo.dayData ? getDayBg(dayInfo.dayData.pnl, colorMode) : useColorModeValue("gray.100", "gray.800")}
            borderRadius="md"
            boxShadow={dayInfo.isToday ? `0 0 0 2px ${todayRing}` : undefined}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              transform: "scale(1.05)",
              boxShadow: "lg",
              zIndex: 1
            }}
            onClick={() => onDateClick(dayInfo)}
          >
            <Text fontSize="xs" color="gray.400" mb={1}>{dayInfo.day}</Text>
            {dayInfo.dayData && (
              <VStack spacing={0} align="start">
                <Text fontWeight="semibold" color="white" fontSize="xs">
                  {formatCurrency(dayInfo.dayData.pnl)}
                </Text>
                <Text color="gray.200" fontSize="xs">
                  {dayInfo.dayData.trades} trade{dayInfo.dayData.trades !== 1 ? 's' : ''}
                </Text>
              </VStack>
            )}
          </Box>
        ))}
      </Grid>
    </GridItem>
    );
};

// Function to render the weekly summary 
  const WeeklySummary = ({ weeklyData }: any) => {
    logger.debug('WeeklyData in component', { weeklyData, component: 'Calendarbody' });
    const cardBg = useColorModeValue("white", "whiteAlpha.100");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const green = useColorModeValue("green.500", "green.400");
    const red = useColorModeValue("red.500", "red.400");
    const blue = useColorModeValue("blue.500", "blue.300");

    // Debug: Log the weekly data structure
    logger.debug('WeeklyData in component', { weeklyData, component: 'Calendarbody' });

    return (
        <VStack spacing={4} align="stretch">
      {weeklyData && weeklyData.length > 0 ? (
        weeklyData.map((week: any, index: number) => {
          logger.debug('Week data', { week, component: 'Calendarbody' });
          // Debug: Log each week's structure
          logger.debug('Week data', { week, component: 'Calendarbody' });
          
          // Try different possible property names for P&L
          const netPnl = week.total_pnl ?? week.weekly_pnl ?? week.pnl ?? 0;
          
          // Debug: Log the calculated P&L
          logger.debug('Calculated netPnl', { netPnl, week, component: 'Calendarbody' });
          
          return (
            <Box 
            key={index} 
            bg={cardBg} 
            p={4} 
            borderColor={borderColor}
            rounded="xl"
            boxShadow={useColorModeValue("md", "none")}
            backdropFilter="blur(5px)"
            >
              <Text fontSize="sm" color={textColor} mb={2}>
                Week {week.week_number || index + 1}
              </Text>
              <Text
                fontSize="xl"
                fontWeight="bold"
                mb={1}
                color={netPnl >= 0 ? green : red}
              >
                {formatCurrency(netPnl)}
              </Text>
              <Text fontSize="sm" color={blue}>
                {week.trading_days || 0} day{(week.trading_days || 0) !== 1 ? 's' : ''}
              </Text>
            </Box>
          );
        })
      ) : (
        <Text color={textColor} textAlign="center">No weekly data available</Text>
      )}
    </VStack>
    );
  };

// Date Detail Modal Component
const DateDetailModal = ({ isOpen, onClose, selectedDate, dayData }: any) => {
  const modalBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const green = useColorModeValue("green.500", "green.400");
  const red = useColorModeValue("red.500", "red.400");
  const blue = useColorModeValue("blue.500", "blue.300");
  const orange = useColorModeValue("orange.500", "orange.400");
  const purple = useColorModeValue("purple.500", "purple.400");

  // Fetch economic and earnings data for the selected date
  const { economicEvents, earningsData, loading: calendarDataLoading } = useCalendarData(selectedDate);

  // Debug logging
  logger.debug('DateDetailModal data', { 
    selectedDate, 
    economicEvents, 
    earningsData, 
    calendarDataLoading, 
    component: 'Calendarbody' 
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'N/A';
    return timeStr;
  };

  const getImportanceColor = (importance: string) => {
    switch (importance?.toLowerCase()) {
      case 'high': return red;
      case 'medium': return orange;
      case 'low': return green;
      default: return blue;
    }
  };

  const getMarketImpactIcon = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'bullish': return TrendingUp;
      case 'bearish': return TrendingDown;
      default: return Minus;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={modalBg} maxH="90vh">
        <ModalHeader color={textColor}>
          {selectedDate ? formatDate(selectedDate) : 'Date Details'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Trading Summary Section */}
            {dayData && (
              <Box p={4} bg={useColorModeValue("gray.50", "gray.700")} rounded="lg">
                <Text fontSize="lg" fontWeight="bold" mb={3}>Trading Summary (Stocks & Options)</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Net P&L</Text>
                    <Text fontSize="xl" fontWeight="bold" color={dayData.pnl >= 0 ? green : red}>
                      {formatCurrency(dayData.pnl)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Total Trades</Text>
                    <Text fontSize="xl" fontWeight="bold" color={blue}>
                      {dayData.trades}
                    </Text>
                  </Box>
                </Grid>
              </Box>
            )}

            {/* Economic Events Section */}
            {economicEvents.length > 0 && (
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={3} color={purple}>
                  Economic Events
                </Text>
                <List spacing={3}>
                  {economicEvents.map((event: any, index: number) => (
                    <ListItem key={index} p={3} bg={useColorModeValue("purple.50", "purple.900")} rounded="md">
                      <Flex justify="space-between" align="center" mb={2}>
                        <HStack>
                          <ListIcon 
                            as={getMarketImpactIcon(event.market_impact)} 
                            color={getImportanceColor(event.importance_level)} 
                          />
                          <Text fontWeight="semibold">
                            {event.event_name}
                          </Text>
                        </HStack>
                        <Badge colorScheme={event.importance_level?.toLowerCase() === 'high' ? 'red' : 
                                           event.importance_level?.toLowerCase() === 'medium' ? 'orange' : 'green'}>
                          {event.importance_level || 'Medium'}
                        </Badge>
                      </Flex>
                      <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="sm" color="gray.500">
                        <Text>Time: {formatTime(event.event_time)}</Text>
                        <Text>Country: {event.country}</Text>
                        {event.actual_value !== null && (
                          <Text>Actual: {event.actual_value}{event.unit_of_measure ? ` ${event.unit_of_measure}` : ''}</Text>
                        )}
                        {event.forecast_value !== null && (
                          <Text>Forecast: {event.forecast_value}{event.unit_of_measure ? ` ${event.unit_of_measure}` : ''}</Text>
                        )}
                      </Grid>
                      {event.description && (
                        <Text fontSize="sm" mt={2} color="gray.600">
                          {event.description}
                        </Text>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Earnings Data Section */}
            {earningsData.length > 0 && (
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={3} color={orange}>
                  Earnings Reports
                </Text>
                <List spacing={3}>
                  {earningsData.map((earning: any, index: number) => (
                    <ListItem key={index} p={3} bg={useColorModeValue("orange.50", "orange.900")} rounded="md">
                      <Flex justify="space-between" align="center" mb={2}>
                        <HStack>
                          <ListIcon as={DollarSign} color={orange} />
                          <Text fontWeight="semibold">
                            {earning.symbol}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          Q{earning.fiscal_quarter} {earning.fiscal_year}
                        </Text>
                      </Flex>
                      <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="sm" color="gray.500">
                        {earning.eps_estimate !== null && (
                          <Text>EPS Est: ${earning.eps_estimate}</Text>
                        )}
                        {earning.revenue_estimate !== null && (
                          <Text>Revenue Est: ${earning.revenue_estimate}M</Text>
                        )}
                      </Grid>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Trade Details Section */}
            {dayData?.tradeDetails && dayData.tradeDetails.length > 0 && (
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={3}>Trade Details</Text>
                <List spacing={3}>
                  {dayData.tradeDetails.map((trade: any, index: number) => (
                    <ListItem key={index} p={3} bg={useColorModeValue("gray.50", "gray.700")} rounded="md">
                      <Flex justify="space-between" align="center" mb={2}>
                        <HStack>
                          <ListIcon 
                            as={trade.pnl >= 0 ? CheckCircle : XCircle} 
                            color={trade.pnl >= 0 ? green : red} 
                          />
                          <Text fontWeight="semibold">
                            {trade.symbol || `Trade ${index + 1}`}
                          </Text>
                        </HStack>
                        <Text 
                          fontWeight="bold" 
                          color={trade.pnl >= 0 ? green : red}
                        >
                          {formatCurrency(trade.pnl)}
                        </Text>
                      </Flex>
                      <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="sm" color="gray.500">
                        <Text>Entry: ${trade.entry_price || 'N/A'}</Text>
                        <Text>Exit: ${trade.exit_price || 'N/A'}</Text>
                        <Text>Size: {trade.position_size || 'N/A'}</Text>
                        <Text>Type: {trade.trade_type || 'N/A'}</Text>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Notes Section */}
            {dayData?.notes && (
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={3}>Notes</Text>
                <Box p={3} bg={useColorModeValue("blue.50", "blue.900")} rounded="md">
                  <Text fontSize="sm" color={useColorModeValue("blue.800", "blue.100")}>
                    {dayData.notes}
                  </Text>
                </Box>
              </Box>
            )}

            {/* Loading State */}
            {calendarDataLoading && (
              <Flex justify="center" py={4}>
                <Spinner color={useColorModeValue("blue.500", "blue.300")} />
              </Flex>
            )}

            {/* No Data Message */}
            {!dayData && !economicEvents.length && !earningsData.length && !calendarDataLoading && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">No data available for this date.</Text>
                <Text fontSize="sm" color="gray.400" mt={2}>
                  This could be a weekend, holiday, or a day with no trading activity or market events.
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Main Component
const Calendarbody = () => {
  const {
    currentDate,
    stats,
    weeklyData,
    getCalendarDays,
    navigateMonth,
    loading
  } = useCalendarLogic();

  const toast = useToast();
  const { settings } = useNotificationSettings();

  const bg = useColorModeValue(
    "linear-gradient(to-br, white, gray.100)",
    "linear-gradient(to-br, slate.900, purple.900)"
  )
  const text = useColorModeValue("gray.900", "white");
  const gridGap = { base: 4, lg: 6 };

  const calendarDays = getCalendarDays();
  // Modal state management
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  // State to track if "no data" notification has been shown
  const [noDataNotificationShown, setNoDataNotificationShown] = useState(false);

  // Reminder modal state
  const [showCreateReminderModal, setShowCreateReminderModal] = useState(false);
  const [showReminderListModal, setShowReminderListModal] = useState(false);

  // Handle date click
  const handleDateClick = (dayInfo: any) => {
    if (dayInfo.date) {
      setSelectedDate(dayInfo.date);
      setSelectedDayData(dayInfo.dayData || null);
      onOpen();
    }
  };

  // Handle reminder modal actions
  const handleCreateReminder = () => {
    setShowCreateReminderModal(true);
  };

  const handleViewReminders = () => {
    setShowReminderListModal(true);
  };

  const handleCreateReminderClose = () => {
    setShowCreateReminderModal(false);
  };

  const handleReminderListClose = () => {
    setShowReminderListModal(false);
  };

  // Provide safe fallback values if stats is null
  const totalPnl = stats?.total_pnl ?? 0;
  const winRate = stats?.win_rate ?? 0;
  const avgWin = stats?.average_win ?? 0;
  const avgLoss = stats?.average_loss ?? 0;
  const tradingDays = stats?.trading_days ?? stats?.tradingDays ?? 0;

  // Toast for missing data - only show once per session
  useEffect(() => {
    if (!loading && (!weeklyData || weeklyData.length === 0) && !noDataNotificationShown) {
      setNoDataNotificationShown(true);
      toast({
        title: "No data for this month.",
        description: "You have no journal entries or trading data for the selected period.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, [loading, weeklyData, toast, noDataNotificationShown]);

  // Reset the notification flag when data becomes available
  useEffect(() => {
    if (weeklyData && weeklyData.length > 0) {
      setNoDataNotificationShown(false);
    }
  }, [weeklyData]);

                                      {/* MANUAL REMINDERS */}
  useEffect(() => {
    const now = new Date();
    const target = new Date();
    target.setHours(16, 0, 0, 0); // 4:00 PM today

    // If it's already past 4 PM, schedule for tomorrow
    if (now > target) target.setDate(target.getDate() + 1);

    const timeout = setTimeout(() => {
      toast({
        title: "Reminder",
        description: "Review your trades for today!",
        status: "info",
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });
    }, target.getTime() - now.getTime());

    return () => clearTimeout(timeout);
  }, [toast]);

                                {/* SMART REMINDERS */}
  // Smart reminder: Remind to log trades 15 minutes after market close (4:15 PM weekdays)
  useEffect(() => {
    if (!settings.smartReminders || !settings.tradeReminders) return;
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Only schedule on weekdays (Monday to Friday)
    if (day === 0 || day === 6) return;

    const target = new Date();
    target.setHours(16, 15, 0, 0); // 4:15 PM today

    // If it's already past 4:15 PM, schedule for next weekday
    if (now > target) {
      target.setDate(target.getDate() + 1);
      // If next day is Saturday (6), skip to Monday
      if (target.getDay() === 6) target.setDate(target.getDate() + 2);
      // If next day is Sunday (0), skip to Monday
      if (target.getDay() === 0) target.setDate(target.getDate() + 1);
      target.setHours(16, 15, 0, 0);
    }

    const timeout = setTimeout(() => {
      toast({
        title: "Log your trades",
        description: "Market closed 15 minutes ago. Take a moment to log today's trades!",
        status: "info",
        duration: 15000,
        isClosable: true,
        position: "top-right",
      });
    }, target.getTime() - now.getTime());

    return () => clearTimeout(timeout);
  }, [toast, settings.smartReminders, settings.tradeReminders]);

  // Smart Reminder: Remind to review open positions every morning before market opens (9:15 AM weekdays)
  useEffect(() => {
    if (!settings.smartReminders || !settings.marketOpenReminders) return;
    const today = new Date().toISOString().slice(0, 10);

    // Find open positions: entries with no exit_date or exit_price
    const openPositions =
      weeklyData?.flatMap(week =>
        week.days?.filter((day: { entry_date: string; exit_date: string; exit_price: any; }) =>
          String(day.entry_date).slice(0, 10) <= today &&
          (!day.exit_date || !day.exit_price || day.exit_date === "")
        ) || []
      ) || [];

    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Only schedule on weekdays and if there are open positions
    if (day === 0 || day === 6 || openPositions.length === 0) return;

    const target = new Date();
    target.setHours(9, 15, 0, 0); // 9:15 AM today

    // If it's already past 9:15 AM, schedule for next weekday
    if (now > target) {
      target.setDate(target.getDate() + 1);
      // If next day is Saturday (6), skip to Monday 
      if (target.getDay() === 6) target.setDate(target.getDate() + 2);
      // If next day is Sunday (0), skip to Monday
      if (target.getDay() === 0) target.setDate(target.getDate() + 1);
      target.setHours(9, 15, 0, 0);
    }
    const timeout = setTimeout(() => {
      toast({
        title: "Pre-market Reminder",
        description: `You have ${openPositions.length} open position(s). Review them before the market opens!`,
        status: "info",
        duration: 12000,
        isClosable: true,
        position: "top-right",
      });
    }, target.getTime() - now.getTime());

    return () => clearTimeout(timeout);
  }, [toast, weeklyData, settings.smartReminders, settings.marketOpenReminders]);

  // Smart Reminders -> Reminder to review watchlist (Time: 8:30 AM)
  useEffect(() => {
    if (!settings.smartReminders || !settings.marketOpenReminders) return;
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Only schedule on weekdays (Monday to Friday)
    if (day === 0 || day === 6) return;

    const target = new Date();
    target.setHours(8, 30, 0, 0); // 8:30 AM today

    // If it's already past 8:30 AM, schedule for next weekday
    if (now > target) {
      target.setDate(target.getDate() + 1);
      if (target.getDay() === 6) target.setDate(target.getDate() + 2); // Skip to Monday 
      if (target.getDay() === 0) target.setDate(target.getDate() + 1); // Skip to Monday
    target.setHours(8, 30, 0, 0);
    }

    const timeout = setTimeout(() => {
      toast({
        title: "Market opens in 1 hour",
        description: "Time to review your watchlist.",
        status: "info",
        duration: 12000,
        isClosable: true,
        position: "top-right",
      });
    }, target.getTime() - now.getTime());
  }, [toast, settings.smartReminders, settings.marketOpenReminders]);

  // Smart reminders -> Reminder to help the user stick to their plan during market hours (11:00 AM)
  useEffect(() => {
    if (!settings.smartReminders || !settings.tradeReminders) return;
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Only schedule on weekdays (Monday to Friday)
    if (day === 0 || day === 6) return;

    const target = new Date();
    target.setHours(11, 0, 0, 0); // 11:00 AM today

    // If it's already past 11:00 AM, schedule for next weekday
    if (now > target) {
      target.setDate(target.getDate() + 1);
      if (target.getDay() === 6) target.setDate(target.getDate() + 2); // Skip to Monday
      if (target.getDay() === 0) target.setDate(target.getDate() + 1); // Skip to Monday
      target.setHours(11, 0, 0, 0);
    }
  
    const timeout = setTimeout(() => {
      toast({
        title: "Pre-Market Prep",
        description: "Have you followed your plan so far? Quick journal entry?",
        status: "info",
        duration: 12000,
        isClosable: true,
        position: "top-right",
      });
    }, target.getTime() - now.getTime());
  }, [toast, settings.smartReminders, settings.tradeReminders]);

  // Smart Reminders -> Post-Market Journal Prompt to remind to journal thoughts (5:00 PM)
  useEffect(() => {
    if (!settings.smartReminders || !settings.tradeReminders) return;
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Only schedule on weekdays (Monday to Friday)
    if (day === 0 || day === 6) return;

    const target = new Date();
    target.setHours(17, 0, 0, 0); // 5:00 PM today

    // If it's already past 5:00 PM, schedule for next weekday 
    if (now > target) {
      target.setDate(target.getDate() + 1);
      if (target.getDay() === 6) target.setDate(target.getDate() + 2); // Skip to Monday
      if (target.getDay() === 0) target.setDate(target.getDate() + 1); // Skip to Monday
      target.setHours(17, 0, 0, 0);
    }

    const timeout = setTimeout(() => {
      toast({
        title: "Post-Market Journal Prompt",
        description: "Day closed. Record your trades & thoughts now while they're fresh.",
        status: "info",
        duration: 15000,
        isClosable: true,
        position: "top-right",
      });
    }, target.getTime() - now.getTime());
  
    return () => clearTimeout(timeout);
  }, [toast, settings.smartReminders, settings.tradeReminders]);

  // Smart Reminders -> Weekly Reflection Prompt (Sundays at 10:00 AM)
  useEffect(() => {
    if (!settings.smartReminders || !settings.weeklyReports) return;
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Only schedule on Sundays
    if (day !== 0) return;

    const target = new Date();
    target.setHours(10, 0, 0, 0); // 10:00 AM today

    // If it's already past 10:00 AM, schedule for next Sunday
    if (now > target) {
      target.setDate(target.getDate() + 7); // Next Sunday
      target.setHours(10, 0, 0, 0);
    }

    const timeout = setTimeout(() => {
      toast({
        title: "Weekly Reflection Prompt",
        description: "It's Sunday. Time for your weekly review & goal setting.",
        status: "info",
        duration: 20000,
        isClosable: true,
        position: "top-right",
      });
    }, target.getTime() - now.getTime());
  
    return () => clearTimeout(timeout);
  }, [toast, settings.smartReminders, settings.weeklyReports]);

  return (
    <Box bg={bg} color={text} p={6} minH="100vh" sx={{ background: bg }}>
      {/* Header Stats */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} mb={6}>
        <StatsCard
          title="Net P&L"
          value={formatCurrency(totalPnl)}
        />
        <StatsCard
          title="Trade win %"
          value={`${winRate.toFixed(2)}%`}
        />
        <StatsCard
          title="Avg win/loss trade"
          value={avgLoss !== 0 ? (avgWin / Math.abs(avgLoss)).toFixed(2) : '0.00'}
          subtitle={
            <HStack spacing={4}>
              <Text color="green.400">{formatCurrency(avgWin)}</Text>
              <Text color="red.400">{formatCurrency(avgLoss)}</Text>
            </HStack>
          }
        />
        <Box 
        bg={useColorModeValue("white", "whiteAlpha.100")}
        borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}
        p={4} 
        rounded="xl"
        backdropFilter="blur(5px)"
        boxShadow={useColorModeValue("md", "none")}
        >
          <Text fontSize="sm" color="gray.400" mb={1}>Monthly stats:</Text>
          <HStack spacing={2} align="center">
            <Badge colorScheme="green" px={2} py={1} borderRadius="md" fontSize="sm">
              {formatCurrency(totalPnl)}
            </Badge>
            <Text color="blue.400" fontSize="sm">{tradingDays} days</Text>
          </HStack>
        </Box>
      </Grid>

      {/* Calendar Navigation */}
      <CalendarHeader
        currentDate={currentDate}
        onNavigate={navigateMonth}
        onCreateReminder={handleCreateReminder}
        onViewReminders={handleViewReminders}
      />
      
      <Grid templateColumns={{ base: "1fr", lg: "repeat(4, 1fr)" }} gap={gridGap}>
        {/* Calendar */}
        <CalendarGrid days={calendarDays} onDateClick={handleDateClick} />
        {/* Weekly Summary */}
        <GridItem>
          <WeeklySummary weeklyData={weeklyData} />
        </GridItem>
      </Grid>
      
      {loading && (
        <Flex justify="center" mt={4}>
          <Spinner color={useColorModeValue("blue.500", "blue.300")} />
        </Flex>
      )}

      {/* Debug Information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Box mb={4} p={4} bg={useColorModeValue("gray.100", "gray.800")} rounded="md" fontSize="xs">
          <div>Loading: {loading.toString()}</div>
          <div>Stats: {JSON.stringify(stats, null, 2)}</div>
          <div>Weekly Data Count: {weeklyData?.length || 0}</div>
        </Box>
      )}

      <Box
    mb={6}
    p={4}
    bg={useColorModeValue("blue.50", "blue.900")}
    color={useColorModeValue("blue.800", "blue.100")}
    rounded="md"
    boxShadow="sm"
  >
    <Text fontWeight="bold" mb={1}>Quick Summary</Text>
    <HStack spacing={6}>
      <Text>Entries: <b>{weeklyData?.length || 0}</b></Text>
      <Text>Net P&L: <b>{formatCurrency(stats?.total_pnl ?? 0)}</b></Text>
      <Text>Win Rate: <b>{(stats?.win_rate ?? 0).toFixed(2)}%</b></Text>
      <Text>Trading Days: <b>{stats?.trading_days ?? 0}</b></Text>
    </HStack>
  </Box>
      <DateDetailModal
        isOpen={isOpen}
        onClose={onClose}
        selectedDate={selectedDate}
        dayData={selectedDayData}
      />

      {/* Manual Reminder Modals */}
      <ManualReminderModal
        isOpen={showCreateReminderModal}
        onClose={handleCreateReminderClose}
        editingReminder={null}
        mode="create"
      />

      <ReminderListModal
        isOpen={showReminderListModal}
        onClose={handleReminderListClose}
      />
    </Box>
  );
};

export default Calendarbody;