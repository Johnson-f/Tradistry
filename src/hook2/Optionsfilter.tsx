import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Select, Flex, Spacer, useColorModeValue } from "@chakra-ui/react";
import  { supabase } from "../supabaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


interface OptionsfilterProps {
  timeFilter: string;
}

const Optionsfilter: React.FC<OptionsfilterProps> = ({ timeFilter }) => {
  const [commission, setCommission] = useState<number | null>(null);
  const [totalTrades, setTotalTrades] = useState<number | null>(null);
  const [winRate, setWinRate] = useState<number | null>(null);
  const [averageGain, setAverageGain] = useState<number | null>(null);
  const [averageLoss, setAverageLoss] = useState<number | null>(null);
  const [totalContracts, setTotalContracts] = useState<number | null>(null);
  const [netProfitData, setNetProfitData] = useState<{ data: string; net_profit: number }[]>([]);
  const [roi, setRoi] = useState<number | null>(null);
  const [avgHoldLoss, setAvgHoldLoss] = useState<number | null>(null);
  const [avgHoldWin, setAvgHoldWin] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const boxBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // Fetch commissions 
      let commissionData, commissionError;
      switch (timeFilter) {
        case "7days":
          ({ data: commissionData, error: commissionError } = await supabase.rpc("commissions_options7days"));
          break;
          case "30days":
          ({ data: commissionData, error: commissionError } = await supabase.rpc("commissions_option30day"));
          break;
        case "90days":
          ({ data: commissionData, error: commissionError } = await supabase.rpc("commissions_option90day"));
          break;
        case "1year":
          ({ data: commissionData, error: commissionError } = await supabase.rpc("commissions_options1year"));
          break;
        default:
          ({ data: commissionData, error: commissionError } = await supabase.rpc("commissions_options"));
      }
      {/*setCommission(commissionError ? null : commissionData);*/}
      setCommission(commissionError ? null : (Array.isArray(commissionData) ? commissionData[0]?.sum : commissionData));

      // Fetch total trades 
      let tradesData, tradesError;
      switch (timeFilter) {
        case "7days":
          ({ data: tradesData, error: tradesError } = await supabase.rpc("trades_options7days"));
          break;
        case "30days":
          ({ data: tradesData, error: tradesError } = await supabase.rpc("trades_options30days"));
          break;
        case "90days":
          ({ data: tradesData, error: tradesError } = await supabase.rpc("trades_options90days"));
          break;
        case "1year":
          ({ data: tradesData, error: tradesError } = await supabase.rpc("trades_options1year"));
          break;
        default:
          ({ data: tradesData, error: tradesError } = await supabase.rpc("total_optionstrades"));
      }
      {/*setTotalTrades(tradesError ? null : tradesData);*/}
      setTotalTrades(tradesError ? null : (Array.isArray(tradesData) ? tradesData[0]?.count : tradesData));

      // Fetch win rate 
      let winRateData, winRateError;
      switch (timeFilter) {
        case "7days":
          ({ data: winRateData, error: winRateError } = await supabase.rpc("winrate_options7day"));
          break;
        case "30days":
          ({ data: winRateData, error: winRateError } = await supabase.rpc("winrate_options30day"));
          break;
        case "90days":
          ({ data: winRateData, error: winRateError } = await supabase.rpc("winrate_options90day"));
          break;
        case "1year":
          ({ data: winRateData, error: winRateError } = await supabase.rpc("winrate_options1year"));
          break;
        default:
          ({ data: winRateData, error: winRateError } = await supabase.rpc("winrate_options"));
      }
      {/*setWinRate(winRateError ? null : winRateData);*/}
      setWinRate(winRateError ? null : (Array.isArray(winRateData) ? winRateData[0]?.winrate : winRateData));

      // Fetch average gain
      let avgGainData, avgGainError;
      switch (timeFilter) {
        case "7days":
          ({ data: avgGainData, error: avgGainError } = await supabase.rpc("averagegain_options7day"));
          break;
        case "30days":
          ({ data: avgGainData, error: avgGainError } = await supabase.rpc("averagegain_options30day"));
          break;
        case "90days":
          ({ data: avgGainData, error: avgGainError } = await supabase.rpc("averagegain_option90day"));
          break;
        case "1year":
          ({ data: avgGainData, error: avgGainError } = await supabase.rpc("averagegain_options1year"));
          break;
        default:
          ({ data: avgGainData, error: avgGainError } = await supabase.rpc("average_gainoptions"));
      }
      setAverageGain(avgGainError ? null : (Array.isArray(avgGainData) ? avgGainData[0]?.average_gain : avgGainData));

      // Fetch average loss
      let avgLossData, avgLossError;
      switch (timeFilter) {
        case "7days":
          ({ data: avgLossData, error: avgLossError } = await supabase.rpc("averageloss_option7day"));
          break;
        case "30days":
          ({ data: avgLossData, error: avgLossError } = await supabase.rpc("averageloss_option30day"));
          break;
        case "90days":
          ({ data: avgLossData, error: avgLossError } = await supabase.rpc("averageloss_option90day"));
          break;
        case "1year":
          ({ data: avgLossData, error: avgLossError } = await supabase.rpc("averageloss_option1year"));
          break;
        default:
          ({ data: avgLossData, error: avgLossError } = await supabase.rpc("averageloss_options"));
      }
      setAverageLoss(
        avgLossError ? null : (Array.isArray(avgLossData) ? avgLossData[0]?.average_loss : avgLossData)
      );

      // Fetch total contracts 
      let contractsData, contractsError;
      switch (timeFilter) {
        case "7days":
          ({ data: contractsData, error: contractsError } = await supabase.rpc("total_contracts7day"));
          break;
        case "30days":
          ({ data: contractsData, error: contractsError } = await supabase.rpc("total_contracts30day"));
          break;
        case "90days":
          ({ data: contractsData, error: contractsError } = await supabase.rpc("total_contracts90day"));
          break;
        case "1year":
          ({ data: contractsData, error: contractsError } = await supabase.rpc("total_contracts1year"));
          break;
        default:
          ({ data: contractsData, error: contractsError } = await supabase.rpc("total_contracts"));
      }
      setTotalContracts(
        contractsError ? null : (Array.isArray(contractsData) ? contractsData[0]?.count : contractsData)
      );

      // Fetch net profit data
      let netProfitRaw, netProfitError;
      switch (timeFilter) {
        case "7days":
          ({ data: netProfitRaw, error: netProfitError } = await supabase.rpc("netprofit_options7day"));
          break;
        case "30days":
          ({ data: netProfitRaw, error: netProfitError } = await supabase.rpc("netprofit_options30day"));
          break;
        case "90days":
          ({ data: netProfitRaw, error: netProfitError } = await supabase.rpc("netprofit_options90day"));
          break;
        case "1year":
          ({ data: netProfitRaw, error: netProfitError } = await supabase.rpc("netprofit_options1year"));
          break;
        default:
          ({ data: netProfitRaw, error: netProfitError } = await supabase.rpc("net_profitoptions"));
      }
      if (netProfitError) {
        setNetProfitData([]);
      } else {
        setNetProfitData(
          (netProfitRaw || []).map((item: any) => ({
            date: item.date || item.trade_date || item.created_at || "Unknown",
            net_profit: parseFloat(item.net_profit || item.profit || item.pnl || 0),
          }))
        );
      }

      // Function to fetch ROI
      let roiData, roiError;
      switch (timeFilter) {
        case "7days":
          ({ data: roiData, error: roiError } = await supabase.rpc("return_oninvest7day"));
          break;
        case "30days":
          ({ data: roiData, error: roiError } = await supabase.rpc("return_oninvest30day"));
          break;
        case "90days":
          ({ data: roiData, error: roiError } = await supabase.rpc("return_oninvest90day"));
          break;
        case "1year":
          ({ data: roiData, error: roiError } = await supabase.rpc("return_oninvest1year"));
          break;
        default:
          ({ data: roiData, error: roiError } = await supabase.rpc("return_oninvest"));
      }
      setRoi(
        roiError ? null : (Array.isArray(roiData) ? roiData[0]?.roi ?? roiData[0]?.return_on_investment : roiData)
      );

      // Function for fetch average hold period on winners 
      let avgHoldWinData, avgHoldWinError;
      switch (timeFilter) {
        case "7days":
          ({ data: avgHoldWinData, error: avgHoldWinError } = await supabase.rpc("avghold_optionwins7day"));
          break;
        case "30days":
          ({ data: avgHoldWinData, error: avgHoldWinError } = await supabase.rpc("avghold_optionwins30day"));
          break;
        case "90days":
          ({ data: avgHoldWinData, error: avgHoldWinError } = await supabase.rpc("avghold_optionwins90day"));
          break;
        case "1year":
          ({ data: avgHoldWinData, error: avgHoldWinError } = await supabase.rpc("avghold_optionwins1year"));
          break;
        default:
          ({ data: avgHoldWinData, error: avgHoldWinError } = await supabase.rpc("avghold_optionwins"));
      }
      setAvgHoldWin(
        avgHoldWinError ? null : (Array.isArray(avgHoldWinData) ? avgHoldWinData[0]?.avg_hold_win : avgHoldWinData)
      );  

      // Function to fetch average hold period on losers 
      let avgHoldLossData, avgHoldLossError;
      switch (timeFilter) {
        case "7days":
          ({ data: avgHoldLossData, error: avgHoldLossError } = await supabase.rpc("avghold_optionwins7day"));
          break;
        case "30days":
          ({ data: avgHoldLossData, error: avgHoldLossError } = await supabase.rpc("avghold_optionwins30day"));
          break;
        case "90days":
          ({ data: avgHoldLossData, error: avgHoldLossError } = await supabase.rpc("avghold_optionwins90day"));
          break;
        case "1year":
          ({ data: avgHoldLossData, error: avgHoldLossError } = await supabase.rpc("avghold_optionwins1year"));
          break;
        default:
          ({ data: avgHoldLossData, error: avgHoldLossError } = await supabase.rpc("avghold_optionwins"));
      }
      setAvgHoldLoss(
        avgHoldLossError ? null : (Array.isArray(avgHoldLossData) ? avgHoldLossData[0]?.avg_hold_loss : avgHoldLossData)
      );
  

      setLoading(false);
    };
    fetchStats();
  }, [timeFilter]);

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg={boxBg} p={3} border="1px" borderColor="gray.200" borderRadius="md" boxShadow="md">
          <Text color={textColor} fontWeight="semibold">{`Date: ${label}`}</Text>
          <Text color="blue.500">{`Net Profit: $${payload[0].value.toFixed(2)}`}</Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <>
    <Flex direction="row" gap={6} mt={4} wrap="wrap">
      {/* Commission Box */}
      <Box
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        p={6}
        bg={boxBg}
        color={textColor}
        ml={5}
      >
        <Heading as="h2" size="md" mb={4}>
          Total Fees
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" color="teal.500">
          {loading
            ? "Loading..."
            : commission !== null
              ? `$${commission.toFixed(2)}`
              : "No Data"}
        </Text>
      </Box>

      {/* Total Trades Box */}
      <Box
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        p={6}
        bg={boxBg}
        color={textColor}
      >
        <Heading as="h2" size="md" mb={4}>
          Total Trades
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
          {loading
            ? "Loading..."
            : totalTrades !== null
              ? totalTrades
              : "No Data"}
        </Text>
      </Box>

      {/* Win Rate Box */}
      <Box
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        p={6}
        bg={boxBg}
        color={textColor}
      >
        <Heading as="h2" size="md" mb={4}>
          Win Rate
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" color="green.500">
          {loading
            ? "Loading..."
            : winRate !== null
              ? `${winRate}%`
              : "No Data"}
        </Text>
      </Box>

      {/* Average Gain Box */}
      <Box
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        p={6}
        bg={boxBg}
        color={textColor}>
        <Heading as="h2" size="md" mb={4}>
          Average Gain
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" color="purple.500">
          {loading
            ? "Loading..."
            : averageGain !== null
              ? `${averageGain.toFixed(2)}%`
              : "No Data"}
        </Text>
      </Box>

      {/* Average Loss Box */}
      <Box
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        p={6}
        bg={boxBg}
        color={textColor}>
        <Heading as="h2" size="md" mb={4}>
          Average Loss
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" color="red.400">
          {loading
            ? "Loading..."
            : averageLoss !== null
              ? `${averageLoss.toFixed(2)}%`
              : "No Data"}
        </Text>
      </Box>

      {/* Total Contracts box */}
      <Box
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        p={6}
        bg={boxBg}
        color={textColor}>
        <Heading as="h2" size="md" mb={4}>
          Total Contracts
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" color="orange.400">
          {loading
            ? "Loading..."
            : totalContracts !== null
              ? totalContracts
              : "No Data"}
        </Text>
      </Box>
    </Flex>

    {/* Net Profit chart */}
    <Flex direction="row" gap={6} mt={8} align="flex-start">
    <Box w="60%" ml={4} mt={8} p={6} bg={boxBg} borderRadius="lg" boxShadow="md">
        <Heading as="h2" size="md" mb={4} color={textColor}>
          Net Profit - Equity Curve
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
                } } />
              <YAxis
                tick={{ fontSize: 12, fill: textColor }}
                tickFormatter={(value) => `$${value.toFixed(0)}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="net_profit"
                stroke="url(#netProfitGradient)"
                strokeWidth={3}
                dot={{ fill: '#805AD5', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#805AD5', strokeWidth: 2 }}
                name="Net Profit" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>

      {/* ROI Box */}
      <Flex direction="column" w="40%" mt={8} mr={4}>
      <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      p={6}
      mt={8}
      bg={boxBg}
      color={textColor}>
        <Heading as="h2" size="md" mb={4}>
          Return on Investment
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color="cyan.500">
            {loading
            ? "Loading..."
            : roi !== null
            ? `${roi.toFixed(2)}%`
            : "No Data"}
            </Text>
            </Box>
            
            {/* Avg Hold period on winners box */}
            <Box
            maxW="sm"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            p={6}
            mt={8}
            bg={boxBg}
            color={textColor}>
              <Heading as="h2" size="md" mb={4}>
                Avg Hold on Winners
                </Heading>
                <Text fontSize="2xl" fontWeight="bold" color="cyan.500">
                  {loading
                  ? "Loading..."
                  : avgHoldWin !== null
                  ? `${avgHoldWin.toFixed(2)} days`
                  : "No Data"}
                  </Text>
                  </Box>

            {/* Avg Hold period on losers box */}
            <Box
            maxW="sm"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            p={6}
            mt={8}
            bg={boxBg}
            color={textColor}
            >
              <Heading as="h2" size="md" mb={4}>
                Avg Hold on Losers
                </Heading>
                <Text fontSize="2xl" fontWeight="bold" color="pink.400">
                  {loading
                  ? "Loading..."
                  : avgHoldLoss !== null
                  ? `${avgHoldLoss.toFixed(2)} days`
                  : "No Data"}
                  </Text>
                  </Box>
                  </Flex>
      </Flex>
      </>
  );
};

    export default Optionsfilter;