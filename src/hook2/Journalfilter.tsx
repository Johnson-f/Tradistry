import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Box, Text, Heading, Flex, useColorModeValue } from "@chakra-ui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { logger } from '../services/logger';

logger.debug("JournalFilter component rendered", { component: 'JournalFilter' });

interface JournalFilterProps {
    filter: string;
    setFilter: (filter: string) => void;
    timeFilter: string;
    setTimeFilter: (filter: string) => void;
    viewMode: "stocks" | "options"; 
}

// Define the structure of net profit data
interface NetProfitData {
    date: string;
    net_profit: number;
}

const JournalFilter: React.FC<JournalFilterProps> = ({ filter, setFilter, timeFilter, setTimeFilter, viewMode }) => {
    const [commission, setCommission] = useState<number | null>(null);
    const [totalTrades, setTotalTrades] = useState<number | null>(null);
    const [winRate, setWinRate] = useState<number | null>(null);
    const [averageGain, setAverageGain] = useState<number | null>(null);
    const [averageLoss, setAverageLoss] = useState<number | null>(null);
    const [netProfitData, setNetProfitData] = useState<NetProfitData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [averageTradeValue, setAverageTradeValue] = useState<number | null>(null); // State to hold average trade value 
    const [averageHoldWin, setAverageHoldWin] = useState<number | null>(null); // State to hold average holding period for winners 
    const [averageHoldLoss, setAverageHoldLoss] = useState<number | null>(null); // State to hold average holding period for losers 

    // -- OPTIONS-SPECIFIC STATE --


    // Color mode values
    const boxBg = useColorModeValue("white", "gray.700");
    const commissionColor = useColorModeValue("teal.500", "teal.300");
    const tradesColor = useColorModeValue("blue.500", "blue.300");
    const textColor = useColorModeValue("gray.800", "white");
    const avgGainColor = useColorModeValue("orange.500", "orange.300");
    const winRateColor = useColorModeValue("green.500", "green.300");
    const chartBg = useColorModeValue("white", "gray.800");

    // Fetch commission logic
    const fetchCommission = async () => {
        let data, error;
        if (viewMode === "options") {
            switch (timeFilter) {
                case "7days":
                    ({ data, error } = await supabase.rpc("commissions_options7days"));
                    break;
                case "30days":
                    ({ data, error } = await supabase.rpc("commissions_option30day"));
                    break;
                case "90days":
                    ({ data, error } = await supabase.rpc("commisssions_option90day"));
                    break;
                case "1year":
                    // If you have a 1 year RPC for options, use it. Otherwise, fallback to all time.
                    ({ data, error } = await supabase.rpc("commissions_options1year"));
                    break;
                default:
                    ({ data, error } = await supabase.rpc("commissions_options"));
            }
        } else {
        switch (timeFilter) {
            case "7days":
                ({ data, error } = await supabase.rpc("commissions_7days"));
                break;
            case "30days":
                ({ data, error } = await supabase.rpc("commissions_30days"));
                break;
            case "90days":
                ({ data, error } = await supabase.rpc("commissions_90days"));
                break;
            case "1year":
                ({ data, error } = await supabase.rpc("commissions_1year"));
                break;
            default:
                ({ data, error } = await supabase.rpc("total_commissions"));
        }
    }
        if (error) {
            logger.error("Commission fetch error", error, { timeFilter, viewMode, component: 'JournalFilter' });
        } else {
            logger.debug("Commission data fetched", { data, timeFilter, viewMode, component: 'JournalFilter' });
            setCommission(data);
        }
    };

    // Fetch total trades logic 
    const fetchTotalTrades = async () => {
        logger.debug("Fetching total trades for time filter", { timeFilter, component: 'JournalFilter' });
        let data, error;
        switch (timeFilter) {
            case "7days":
                ({ data, error } = await supabase.rpc("trades_7days"));
                break;
            case "30days":
                ({ data, error } = await supabase.rpc("trades_30days"));
                break;
            case "90days":
                ({ data, error } = await supabase.rpc("trades_90days"));
                break;
            case "1year":
                ({ data, error } = await supabase.rpc("trades_1year"));
                break;
            default:
                ({ data, error } = await supabase.rpc("total_trades"));
        }
        if (error) {
            logger.error("Total trades fetch error", error, { timeFilter, component: 'JournalFilter' });
        } else {
            logger.debug("Total trades data fetched", { data, timeFilter, component: 'JournalFilter' });
            setTotalTrades(data);
        }
    };

    // Fetch win rate logic 
    const fetchWinRate = async () => {
        let data, error;
        switch (timeFilter) {
            case "7days":
                ({ data, error } = await supabase.rpc("winrate_7day"));
                break;
            case "30days":
                ({ data, error } = await supabase.rpc("winrate_30day"));
                break;
            case "90days":
                ({ data, error } = await supabase.rpc("winrate_90day"));
                break;
            case "1year":
                ({ data, error } = await supabase.rpc("winrate_1year"));
                break;
            default:
                ({ data, error } = await supabase.rpc("winrate_all"));
        }
        if (error) {
            logger.error("Win rate fetch error", error, { timeFilter, component: 'JournalFilter' });
        } else {
            setWinRate(data);
        }
    };

    // Fetch average gain logic 
    const fetchAverageGain = async () => {
        let data, error;
        switch (timeFilter) {
            case "7days":
                ({ data, error } = await supabase.rpc("averagegain_7day"));
                break;
            case "30days":
                ({ data, error } = await supabase.rpc("averagegain_30day"));
                break;
            case "90days":
                ({ data, error } = await supabase.rpc("averagegain_90day"));
                break;
            case "1year":
                ({ data, error } = await supabase.rpc("averagegain_1year"));
                break;
            default:
                ({ data, error } = await supabase.rpc("average_gain"));
        }
        if (error) {
            logger.error("Average gain fetch error", error, { timeFilter, component: 'JournalFilter' });
        } else {
            setAverageGain(data);
        }
    };

    // Fetch average loss logic
    const fetchAverageLoss = async () => {
        let data, error;
        switch (timeFilter) {
            case "7days":
                ({ data, error } = await supabase.rpc("averageloss_7day"));
                break;
            case "30days":
                ({ data, error } = await supabase.rpc("averageloss_30day"));
                break;
            case "90days":
                ({ data, error } = await supabase.rpc("averageloss_90day"));
                break;
            case "1year":
                ({ data, error } = await supabase.rpc("averageloss_1year"));
                break;
            default:
                ({ data, error } = await supabase.rpc("average_loss"));
        }
        if (error) {
            logger.error("Average loss fetch error", error, { timeFilter, component: 'JournalFilter' });
        } else {
            setAverageLoss(data);
        }
    };

    // Fetch net profit data logic 
    const fetchNetProfitData = async () => {
        let data, error;
        switch (timeFilter) {
            case "7days":
                ({ data, error } = await supabase.rpc("netprofit_7day"));
                break;
            case "30days":
                ({ data, error } = await supabase.rpc("netprofit_30day"));
                break;
            case "90days":
                ({ data, error } = await supabase.rpc("netprofit_90day"));
                break;
            case "1year":
                ({ data, error } = await supabase.rpc("netprofit_1year"));
                break;
            default:
                ({ data, error } = await supabase.rpc("net_prof"));
        }
        if (error) {
            logger.error("Net profit fetch error", error, { timeFilter, component: 'JournalFilter' });
            setNetProfitData([]); // Set empty array on error
        } else {
            logger.debug("Net profit data fetched", { data, timeFilter, component: 'JournalFilter' });
            // Ensure data is properly formatted
            const formattedData = (data || []).map((item: any) => ({
                date: item.date || item.trade_date || item.created_at || 'Unknown',
                net_profit: parseFloat(item.net_profit || item.profit || item.pnl || 0)
            }));
            setNetProfitData(formattedData);
        }
    };

    // Fetch average trade value logic 
    const fetchAverageTradeValue = async () => {
        let data, error;
        switch (timeFilter) {
            case "7days":
                ({ data, error } = await supabase.rpc("averagetrade_value7day"));
                break;
            case "30days":
                ({ data, error } = await supabase.rpc("averagetrade_value30day"));
                break;
            case "90days":
                ({ data, error } = await supabase.rpc("averagetrade_value90day"));
                break;
            case "1year":
                ({ data, error } = await supabase.rpc("averagetrade_value1year"));
                break;
            default:
                ({ data, error } = await supabase.rpc("averagetrade_value"));
        }
        if (error) {
            logger.error("Average trade value fetch error", error, { timeFilter, component: 'JournalFilter' });
        } else {
            setAverageTradeValue(data);
        }
    };

    // Fetch average holding period for winners logic
    const fetchAverageHoldWin = async () => {
        let data, error;
        switch (timeFilter) {
            case "7days":
                ({ data, error } = await supabase.rpc("avghold_wins7day"));
                break;
            case "30days":
                ({ data, error } = await supabase.rpc("avghold_wins30day"));
                break;
            case "90days":
                ({ data, error } = await supabase.rpc("avghold_wins90day"));
                break;
            case "1year":
                ({ data, error } = await supabase.rpc("avghold_wins1year"));
                break;
            default:
                ({ data, error } = await supabase.rpc("avghold_wins"));
        }
        if (error) {
            logger.error("Average hold win fetch error", error, { timeFilter, component: 'JournalFilter' });
        } else {
            setAverageHoldWin(data);
        }
    };

    // Fetch average holding period for losers logic 
    const fetchAverageHoldLoss = async () => {
        let data, error;
        switch (timeFilter) {
            case "7days":
                ({ data, error } = await supabase.rpc("avghold_loss7day"));
                break;
            case "30days":
                ({ data, error } = await supabase.rpc("avghold_loss30day"));
                break;
            case "90days":
                ({ data, error } = await supabase.rpc("avghold_loss90day"));
                break;
            case "1year":
                ({ data, error } = await supabase.rpc("avghold_loss1year"));
                break;
            default:
                ({ data, error } = await supabase.rpc("avghold_loss"));
        }
        if (error) {
            logger.error("Average hold loss fetch error", error, { timeFilter, component: 'JournalFilter' });
        } else {
            setAverageHoldLoss(data);
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
            logger.error("Error fetching data", error, { component: 'JournalFilter' });
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount and when timeFilter changes
    useEffect(() => {
        fetchAllData();
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
            <Flex direction="row" ml={10} gap={6} mt={4} wrap="wrap">
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
                       Trade Fees
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

                {/* Average Trade Value */}
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
            <Flex direction="row" ml={4} gap={6} mt={8} align="flex-start">
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
                    // Render the chart

                    // Version to of the chart
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
                    Avg Hold on Winnners
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

export default JournalFilter;