import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient'; 
import { useCalendarLogic } from '../hook2/Calendarlogic';
import { Box, Text, Flex, Button, useColorModeValue } from "@chakra-ui/react";
import { Grid, GridItem, VStack, HStack, Badge, Spinner, useToast } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

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
const CalendarHeader = ({ currentDate, onNavigate }: any) => {
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
      <Box bg={badgeBg} px={3} py={1} rounded="md" fontSize="sm">
        This month
      </Box>
    </Flex>
    );
};

// Function to render the calendar grid 
const CalendarGrid = ({ days }: any) => {
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
    const cardBg = useColorModeValue("white", "whiteAlpha.100");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const green = useColorModeValue("green.500", "green.400");
    const red = useColorModeValue("red.500", "red.400");
    const blue = useColorModeValue("blue.500", "blue.300");

    return (
        <VStack spacing={4} align="stretch">
      {weeklyData && weeklyData.length > 0 ? (
        weeklyData.map((week: any, index: number) => {
          const netPnl = week.weekly_pnl ?? week.total_pnl ?? week.pnl ?? 0;
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

  const bg = useColorModeValue(
    "linear-gradient(to-br, white, gray.100)",
    "linear-gradient(to-br, slate.900, purple.900)"
  )
  const text = useColorModeValue("gray.900", "white");
  const gridGap = { base: 4, lg: 6 };

  const calendarDays = getCalendarDays();

  // Provide safe fallback values if stats is null
  const totalPnl = stats?.total_pnl ?? 0;
  const winRate = stats?.win_rate ?? 0;
  const avgWin = stats?.average_win ?? 0;
  const avgLoss = stats?.average_loss ?? 0;
  const tradingDays = stats?.trading_days ?? stats?.tradingDays ?? 0;

  // Toast for missing data 
  useEffect(() => {
    if (!loading && (!weeklyData || weeklyData.length === 0)) {
      toast({
        title: "No data for this month.",
        description: "You have no journal entries or trading data for the selected period.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, [loading, weeklyData, toast]);

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
  }, [toast]);

  // Smart Reminder: Remind to review open positions every morning before market opens (9:15 AM weekdays)
  useEffect(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Only schedule on weekdays (Monday to Friday)
    if (day === 0 || day === 6) return;

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
        description: "Review your open positions before the market opens!",
        status: "info",
        duration: 12000,
        isClosable: true,
        position: "top-right",
      });
    }, target.getTime() - now.getTime());

    return () => clearTimeout(timeout);
  }, [toast]);

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
      />
      
      <Grid templateColumns={{ base: "1fr", lg: "repeat(4, 1fr)" }} gap={gridGap}>
        {/* Calendar */}
        <CalendarGrid days={calendarDays} />
        {/* Weekly Summary */}
        <GridItem>
          <WeeklySummary weeklyData={weeklyData} />
        </GridItem>
      </Grid>
      
      {loading && (
        <Flex justify="center" mt={4}>
          <Spinner color="blue.400" />
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
{/* Will need this code else */}
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
    </Box>
  );
};

export default Calendarbody;