import { Box, Flex, Heading, Spacer, Select, Button, useColorModeValue } from "@chakra-ui/react";
import React, { useState } from "react";

interface JournalHeaderProps {
  filter: string;
  setFilter: (filter: string) => void;
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  appUserId: string;
}
const JournalHeader: React.FC<JournalHeaderProps> = ({ filter, setFilter, timeFilter, setTimeFilter, appUserId }) => {
  const bg = useColorModeValue("gray.100", "gray.700");
  const color = useColorModeValue("gray.800", "white");

  return (
    <Box 
      as="header"
      w="100%"
      px={6}
      py={4}
      bg={bg}
      color={color}
      boxShadow="md"
      backdropFilter="blur(8px)"
      mb={8}
      >
        <Flex align="center">
          {/*<Heading as="h1" size="lg" fontWeight="bold">
            Journal Entry
          </Heading>*/}
          <Heading
    as="h1"
    size="xl"
    fontWeight="extrabold"
    letterSpacing="wide"
    color="teal.500"
    mr={8}
    transition="color 0.2s"
    _hover={{ color: "teal.400" }}
  >
    Journal
  </Heading>
          <Spacer />
          <Box
          fontWeight="bold"
          fontSize="lg"
          color="purple.500"
          px={3}
          py={1}
          borderRadius="md"
          bg={useColorModeValue("purple.50", "purple.900")}
          mr={2}
          boxShadow="sm"
          >
            FILTER
            </Box>
            <Select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            width="200px"
            color={color}
            bg={bg}
            ml={4}
            >
              <option value="">All Time</option>
              <option value="7days">7 Days</option>
              <option value="30days">30 Days</option>
              <option value="90days">90 Days</option>
              <option value="1year">1 Year</option>
            </Select>
        </Flex>
      </Box>
  );
};

export default JournalHeader;