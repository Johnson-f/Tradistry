import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // <-- import your hook
import { Box, Text, Heading, Flex, useColorModeValue } from "@chakra-ui/react";

console.log("JournalFilter component rendered"); 

interface JournalFilterProps {
    filter: string;
    setFilter: (filter: string) => void;
    timeFilter: string;
    setTimeFilter: (filter: string) => void;
}
const JournalFilter: React.FC<JournalFilterProps> = ({ filter, setFilter, timeFilter, setTimeFilter }) => {
    const [commission, setCommission] = useState<number | null>(null); // State to hold commission data 
    const [totalTrades, setTotalTrades] = useState<number | null>(null); // State to hold total trades data 
    const [winRate, setWinRate] = useState<number | null>(null); // State to hold win rate data 
    const [averageGain, setAverageGain] = useState<number | null>(null); // State to hold average gain data 
    const [averageLoss, setAverageLoss] = useState<number | null>(null); // State to hold average loss data 

    // Subscribe to realtime changes on the journal_entries table

    // Color mode value
    const boxBg = useColorModeValue("white", "gray.700");
    const commissionColor = useColorModeValue("teal.500", "teal.300");
    const tradesColor = useColorModeValue("blue.500", "blue.300");
    const textColor = useColorModeValue("gray.800", "white");
    const avgGainColor = useColorModeValue("orange.500", "orange.300");
    const winRateColor = useColorModeValue("green.500", "green.300");


    // Fetch commission logic
    const fetchCommission = async () => {
        console.log("Fetching commission for time filter:", timeFilter);
        let data, error;
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
        if (error) {
            console.error("Commission fetch error:", error);
        } else {
            console.log("Commission data fetched:", data);
            setCommission(data);
        }
    };

    // Fetch total trades logic 
    const fetchTotalTrades = async () => {
        console.log("Fetching total trades for time filter:", timeFilter); // Remove this
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
            console.error("Total trades fetch error:", error);
        } else {
            console.log("Total trades data fetched:", data);
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
            console.error("Win rate fetch error:", error);
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
            console.error("Average gain fetch error:", error);
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
        console.error("Average loss fetch error:", error);
    } else {
        setAverageLoss(data);
    }
    };


    // Fetch on mount and when timeFilter changes
    useEffect(() => {
        fetchCommission();
        fetchTotalTrades();
        fetchWinRate();
        fetchAverageGain();
        fetchAverageLoss();
    }, [timeFilter]);

    return (
        <>
            <Flex direction="row" gap={6} mt={4}>
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
                        Commission
                    </Heading>
                    <Text fontSize="2xl" fontWeight="bold" color={commissionColor}>
                        {commission !== null ? commission : "Loading..."}
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
                            <Text fontSize="2xl" fontWeight="bold" color={commissionColor}>
                                {winRate !== null ? `${winRate}%` : "Loading..."}
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
                            mt={4}
                            color={textColor}
                            >
                                <Heading as="h2" size="md" mb={4}>
                        Average Gain
                    </Heading>
                    <Text fontSize="2xl" fontWeight="bold" color={avgGainColor}>
                        {averageGain !== null ? `${averageGain}` : "Loading..."}
                    </Text>
                            </Box>
                            {/* Average loss box */}
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
                                        {averageLoss !== null ? `${averageLoss}` : "Loading..."}
                                        </Text>
                                        </Box>
                    </Flex>
            {/* ...rest of your page... */}
        </>
    );
};

export default JournalFilter;
// This component displays the total commission based on the selected time filter and updates in realtime.