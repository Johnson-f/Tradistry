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
import React, { useState, useEffect } from "react";
import { useTheme } from "../Settings";
import { supabase } from "../supabaseClient";

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

  // Fetch metric
  const fetchMetrics = async () => {
    if (!userUuid) {
      console.error("User UUID is not set");
      return;
    }
    // Win rate
    let { data: winRateData, error: winRateError } = await supabase.rpc(
      "filter_win_rate",
      { end_date: endDate, start_date: startDate, symbol, user_uuid: userUuid },
    );
    if (winRateError) console.error(winRateError);
    else setWinRate(winRateData);

    // Net Profit
    let { data: netProfitData, error: netProfitError } = await supabase.rpc(
      "filter_net_profit",
      { end_date: endDate, start_date: startDate, symbol, user_uuid: userUuid },
    );
    if (netProfitError) console.error(netProfitError);
    else setNetProfit(netProfitData);

    // Total Trades
    let { data: totalTradesData, error: totalTradesError } = await supabase.rpc(
      "filter_total_trades",
      { end_date: endDate, start_date: startDate, user_uuid: userUuid },
    );
    if (totalTradesError) console.error(totalTradesError);
    else setTotalTrades(totalTradesData);
  };

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