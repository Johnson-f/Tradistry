import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Select, Flex, Spacer, useColorModeValue } from "@chakra-ui/react";
import  { supabase } from "../supabaseClient";

interface OptionsfilterProps {
  timeFilter: string;
}

const Optionsfilter: React.FC<OptionsfilterProps> = ({ timeFilter }) => {
  const [commission, setCommission] = useState<number | null>(null);
  const [totalTrades, setTotalTrades] = useState<number | null>(null);
  const [winRate, setWinRate] = useState<number | null>(null);
  const [averageGain, setAverageGain] = useState<number | null>(null);
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


      setLoading(false);
    };
    fetchStats();
  }, [timeFilter]);

  return (
    <Flex direction="row" gap={6} mt={4} wrap="wrap">
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
          Total Option Commissions
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" color="teal.500">
          {loading
            ? "Loading..."
            : commission !== null
            ? `$${commission.toFixed(2)}`
            : "No Data"}
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
        color={textColor}
      >
        <Heading as="h2" size="md" mb={4}>
          Total Option Trades
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
          {loading
            ? "Loading..."
            : totalTrades !== null
            ? totalTrades
            : "No Data"}
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
    </Flex>
  );
};

    export default Optionsfilter;