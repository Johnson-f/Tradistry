import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // <-- import your hook
import { Box, Text, Heading } from "@chakra-ui/react";

console.log("JournalFilter component rendered"); 

interface JournalFilterProps {
    filter: string;
    setFilter: (filter: string) => void;
    timeFilter: string;
    setTimeFilter: (filter: string) => void;
}
const JournalFilter: React.FC<JournalFilterProps> = ({ filter, setFilter, timeFilter, setTimeFilter }) => {
    const [commission, setCommission] = useState<number | null>(null); // State to hold commission data 

    // Subscribe to realtime changes on the journal_entries table


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

    // Fetch on mount and when timeFilter changes
    useEffect(() => {
        fetchCommission();
    }, [timeFilter]);

    return (
        <>
            <Box
                maxW="sm"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                p={6}
                bg="white"
                mt={4}
                >
                    <Heading as="h2" size="md" mb={4}>
                        Commission
                    </Heading>
                    <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                        {commission !== null ? commission : "Loading..."}
                    </Text>
                </Box>
            {/* ...rest of your page... */}
        </>
    );
};

export default JournalFilter;
// This component displays the total commission based on the selected time filter and updates in realtime.