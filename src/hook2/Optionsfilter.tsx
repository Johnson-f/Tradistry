import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Box, Text, Heading, Flex, useColorModeValue } from "@chakra-ui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface NetProfitData {
  date: string;
  net_profit: number;
}

const Optionsfilter: React.FC = () => {
  const [commission, setCommission] = useState<number | null>(null);
  const [totalTrades, setTotalTrades] = useState<number | null>(null);
  const [winRate, setWinRate] = useState<number | null>(null);
  const [averageGain, setAverageGain] = useState<number | null>(null);
  const [averageLoss, setAverageLoss] = useState<number | null>(null);
  const [averageTradeValue, setAverageTradeValue] = useState<number | null>(null);
  const [averageHoldWin, setAverageHoldWin] = useState<number | null>(null);
  const [averageHoldLoss, setAverageHoldLoss] = useState<number | null>(null);
  const [netProfitData, setNetProfitData] = useState<NetProfitData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState("all");

  // Color mode values
  const boxBg = useColorModeValue("white", "gray.700");
  const commissionColor = useColorModeValue("teal.500", "teal.300");
  const tradesColor = useColorModeValue("blue.500", "blue.300");
  const textColor = useColorModeValue("gray.800", "white");
  const avgGainColor = useColorModeValue("orange.500", "orange.300");
  const winRateColor = useColorModeValue("green.500", "green.300");
  const chartBg = useColorModeValue("white", "gray.800");

  // Fetch commission
  const fetchCommission = async () => {
    let { data, error } = await supabase.rpc("commissions_options");
    if (error) {
      console.error("Commission fetch error:", error);
    } else {
      setCommission(data);
    }
  };

  // Fetch total trades
  const fetchTotalTrades = async () => {
    let { data, error } = await supabase.rpc("trades_options");
    if (error) {
      console.error("Total trades fetch error:", error);
    } else {
      setTotalTrades(data);
    }
  };

  // Fetch win rate
  const fetchWinRate = async () => {
    let { data, error } = await supabase.rpc("winrate_options");
    if (error) {
      console.error("Win rate fetch error:", error);
    } else {
      setWinRate(data);
    }
  };

  // Fetch average gain
  const fetchAverageGain = async () => {
    let { data, error } = await supabase.rpc("averagegain_options");
    if (error) {
      console.error("Average gain fetch error:", error);
    } else {
      setAverageGain(data);
    }
  };

  // Fetch average loss
  const fetchAverageLoss = async () => {
    let { data, error } = await supabase.rpc("averageloss_options");
    if (error) {
      console.error("Average loss fetch error:", error);
    } else {
      setAverageLoss(data);
    }
  };

  // Fetch average trade value
  const fetchAverageTradeValue = async () => {
    let { data, error } = await supabase.rpc("averagetrade_value_options");
    if (error) {
      console.error("Average trade value fetch error:", error);
    } else {
      setAverageTradeValue(data);
    }
  };

  // Fetch average holding period for winners
  const fetchAverageHoldWin = async () => {
    let { data, error } = await supabase.rpc("avghold_wins_options");
    if (error) {
      console.error("Average hold win fetch error:", error);
    } else {
      setAverageHoldWin(data);
    }
  };

  // Fetch average holding period for losers
  const fetchAverageHoldLoss = async () => {
    let { data, error } = await supabase.rpc("avghold_loss_options");
    if (error) {
      console.error("Average hold loss fetch error:", error);
    } else {
      setAverageHoldLoss(data);
    }
  };

  // Fetch net profit data
  const fetchNetProfitData = async () => {
    let { data, error } = await supabase.rpc("netprofit_options");
    if (error) {
      setNetProfitData([]);
    } else {
      const formattedData = (data || []).map((item: any) => ({
        date: item.date || item.trade_date || item.created_at || 'Unknown',
        net_profit: parseFloat(item.net_profit || item.profit || item.pnl || 0)
      }));
      setNetProfitData(formattedData);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCommission(),
        fetchTotalTrades(),
        fetchWinRate(),
        fetchAverageGain(),
        fetchAverageLoss(),
        fetchAverageTradeValue(),
        fetchAverageHoldWin(),
        fetchAverageHoldLoss(),
        fetchNetProfitData()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line
  }, [timeFilter]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg={chartBg} p={3} border="1px" borderColor="gray.200" borderRadius="md" boxShadow="md">
          <Text color={textColor} fontWeight="semibold">{`Date: ${label}`}</Text>
          <Text color="blue.500">{`Net Profit: $${payload[0].value.toFixed(2)}`}</Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <>
         <Heading as="h1" size="xl" mb={6} color={textColor}>
            Options
         </Heading>
      <Flex direction="row" gap={6} mt={4} wrap="wrap">
        <Box
          maxW="sm"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
          bg={boxBg}
          mt={4}
          color={textColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Total Commission
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color={commissionColor}>
            {commission !== null ? `$${commission.toFixed(2)}` : "Loading..."}
          </Text>
        </Box>

        <Box
          maxW="sm"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
          bg={boxBg}
          mt={4}
          color={textColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Total Trades
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color={tradesColor}>
            {totalTrades !== null ? totalTrades : "Loading..."}
          </Text>
        </Box>

        <Box
          maxW="sm"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
          bg={boxBg}
          mt={4}
          color={textColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Win Rate
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color={winRateColor}>
            {winRate !== null ? `${winRate}%` : "Loading..."}
          </Text>
        </Box>

        <Box
          maxW="sm"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
          bg={boxBg}
          mt={4}
          color={textColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Average Gain
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color={avgGainColor}>
            {averageGain !== null ? `${averageGain.toFixed(2)}%` : "Loading..."}
          </Text>
        </Box>

        <Box
          maxW="sm"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
          bg={boxBg}
          mt={4}
          color={textColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Average Loss
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color="red.400">
            {averageLoss !== null ? `$${averageLoss.toFixed(2)}` : "Loading..."}
          </Text>
        </Box>

        <Box
          maxW="sm"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
          bg={boxBg}
          mt={4}
          color={textColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Avg Trade Value
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color="purple.400">
            {averageTradeValue !== null ? `$${averageTradeValue.toFixed(2)}` : "Loading..."}
          </Text>
        </Box>
      </Flex>

      {/* Net Profit Chart */}
      <Flex direction="row" gap={6} mt={8} align="flex-start">
        <Box w="60%" mt={8} p={6} bg={boxBg} borderRadius="lg" boxShadow="md">
          <Heading as="h2" size="md" mb={4} color={textColor}>
            Equity Curve - Net Profit
          </Heading>
          {loading ? (
            <Box h="300px" display="flex" alignItems="center" justifyContent="center">
              <Text color={textColor}>Loading chart data...</Text>
            </Box>
          ) : netProfitData.length === 0 ? (
            <Box h="300px" display="flex" alignItems="center" justifyContent="center">
              <Text color={textColor}>No data available for the selected time period</Text>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={netProfitData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="netProfitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#805AD5" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#63B3ED" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: textColor }}
                  tickFormatter={(value) => {
                    try {
                      return new Date(value).toLocaleDateString();
                    } catch {
                      return value;
                    }
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: textColor }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="net_profit"
                  stroke="url(#netProfitGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#805AD5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#805AD5', strokeWidth: 2 }}
                  name="Net Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Average holding period for winners */}
        <Box
          maxW="sm"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
          bg={boxBg}
          mt={4}
          color={textColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Avg Hold on Winners
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color="cyan.500">
            {averageHoldWin !== null ? `${averageHoldWin.toFixed(2)} days` : "Loading..."}
          </Text>
        </Box>

        {/* Average holding period for losers */}
        <Box
          maxW="sm"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
          bg={boxBg}
          mt={4}
          color={textColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Avg Hold on Losers
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color="pink.400">
            {averageHoldLoss !== null ? `${averageHoldLoss.toFixed(2)} days` : "Loading..."}
          </Text>
        </Box>
      </Flex>
    </>
  );
};

export default Optionsfilter;