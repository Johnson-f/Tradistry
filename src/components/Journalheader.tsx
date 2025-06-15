import {
  Box,
  Grid,
  GridItem,
  Flex,
  Text,
  Button,
  Select,
  Input,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../Settings";
import { supabase } from "../supabaseClient";
import { useSupabaseSubscription } from "../hook2/SupabaseSubscription";

const JournalHeader = () => {
  // Use theme context to dynamically set colors
  const { textColor } = useTheme();

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [winRate, setWinRate] = useState("");
  const [netProfit, setNetProfit] = useState("");
  const [totalTrades, setTotalTrades] = useState("");
  const [symbol, setSymbol] = useState("BTCUSD");
  const [userUuid, setUserUuid] = useState<string | null>(null);

  // Get user UUID from session
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserUuid(user?.id || null);
    };
    getUser();
  }, []);
  
  // Subscribe to journal table changes 
  

  // Fetch metric
  const fetchMetrics = useCallback(async () => {
    if (!userUuid) return;
    let { data: winRateData } = await supabase.rpc(
      "filter_win_rate",
      { end_date: endDate, start_date: startDate, symbol, user_uuid: userUuid },
    );
    setWinRate(winRateData);

    let { data: netProfitData } = await supabase.rpc(
      "filter_net_profit",
      { end_date: endDate, start_date: startDate, symbol, user_uuid: userUuid },
    );
    setNetProfit(netProfitData);

    let { data: totalTradesData } = await supabase.rpc(
      "filter_total_trades",
      { end_date: endDate, start_date: startDate, user_uuid: userUuid },
    );
    setTotalTrades(totalTradesData);
  }, [userUuid, startDate, endDate, symbol]);
  
  // Auto-fetch metrics on mount, filter change, or realtime event 
  const { events } = useSupabaseSubscription({
    table: "entry_table",
    eventTypes: ["INSERT", "UPDATE", "DELETE"],
  });

  useEffect(() => {
    if (userUuid) fetchMetrics();
    // eslint-disable-next-line
  }, [userUuid, startDate, endDate, symbol, events])

  return (
    <>
      <Box
        bg="black"
        p={4}
        shadow="sm"
        w="full"
        borderBottom="1px solid #E2E8F0"
        position="fixed"
        top="0"
        zIndex="1000"
      >
        <Grid
          templateColumns="repeat(2, 1fr)"
          justifyContent="space-between"
          gap={4}
        >
          {/* Left side: Dashboard title */}
          <GridItem>
            <Text
              fontSize="2xl"
              fontWeight="semibold"
              color={textColor}
            >
              Journal Entries
            </Text>
          </GridItem>

          {/* Right side: Filters and buttons */}
          <GridItem
            display="flex"
            alignItems="center"
            gap={4}
            justifyContent="flex-end"
          >
            <Input
              type="date"
              size="sm"
              bg="white"
              color={textColor}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              w="130px"
            />
            <Input
              type="date"
              size="sm"
              bg="white"
              color={textColor}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              w="130px"
            />
            <Select
              size="sm"
              bg="white"
              color={textColor}
              shadow="md"
              w="120px"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            >
              <option value="BTCUSD">BTCUSD</option>
              <option value="ETHUSD">ETHUSD</option>
              <option value="AAPL">AAPL</option>
            </Select>
            <Button
              size="sm"
              bg="white"
              color={textColor}
              onClick={fetchMetrics}
              isDisabled={!userUuid}
            >
              Apply
            </Button>
          </GridItem>
        </Grid>
      </Box>

      {/* Cards for metrics */}
      <Flex mt="100px" gap={6} justify="center">
        <Card minW="200px" bg="gray" color={textColor} shadow="md">
          <CardHeader fontWeight="bold">Win Rate</CardHeader>
          <CardBody fontSize="2xl">
            {winRate !== "" && winRate !== null ? `${winRate}%` : '--'}
          </CardBody>
        </Card>
        <Card minW="200px" bg="gray" color={textColor} shadow="md">
          <CardHeader fontWeight="bold">Net Profit</CardHeader>
          <CardBody fontSize="2xl">
            {netProfit !== "" && netProfit !== null ? netProfit : '--'}
          </CardBody>
        </Card>
        <Card minW="200px" bg="gray" color={textColor} shadow="md">
          <CardHeader fontWeight="bold">Total Trades</CardHeader>
          <CardBody fontSize="2xl">
            {totalTrades !== "" && totalTrades !== null ? totalTrades : '--'}
          </CardBody>
        </Card>
      </Flex>
    </>
  );
};

export default JournalHeader;