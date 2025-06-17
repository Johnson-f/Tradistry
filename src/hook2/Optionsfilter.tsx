import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Select, Flex, Spacer, useColorModeValue } from "@chakra-ui/react";
import  { supabase } from "../supabaseClient";

interface OptionsfilterProps {
  timeFilter: string;
}

const Optionsfilter: React.FC<OptionsfilterProps> = ({ timeFilter }) => {
  const [commission, setCommission] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const boxBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  useEffect(() => {
    const fetchCommission = async () => {
      setLoading(true);
      let data, error;
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
          ({ data, error } = await supabase.rpc("commissions_options1year"));
          break;
        default:
          ({ data, error } = await supabase.rpc("commissions_options"));
      }
      if (error) {
        setCommission(null);
        console.error(error);
      } else {
        setCommission(data);
      }
      setLoading(false);
    };
    fetchCommission();
  }, [timeFilter]);

  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      p={6}
      mb={6}
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
  )
    };

    export default Optionsfilter;