import { Box, Flex, Heading, useColorModeValue } from "@chakra-ui/react";
import React from "react";

const CalendarHeader: React.FC = () => {
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
                <Heading
          as="h1"
          size="xl"
          fontWeight="extrabold"
          letterSpacing="wide"
          color="blue.500"
          mr={8}
          transition="color 0.2s"
          _hover={{ color: "blue.400" }}
        >
          Calendar
        </Heading>
                </Flex>
            </Box>
    );
};

export default CalendarHeader;