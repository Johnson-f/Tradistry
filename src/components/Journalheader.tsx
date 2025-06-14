import { Box, Grid, GridItem, Flex, Text, Button, Select } from '@chakra-ui/react'
import React from 'react'
import { useTheme } from '../Settings'; // Import the useTheme hook


const journalheader = () => {
    // Use theme context to dynamically set colors
    const { bgColor, textColor, buttonBg, buttonHoverBg } = useTheme();
    
    // Debugging: Log theme values
    console.log('Theme values:', { bgColor, textColor, buttonBg, buttonHoverBg });
  return (
    <Box
      bg={bgColor}
      p={4} // Change the height of the box here 
      shadow="sm" // Change the shadow here 
      w="full"
      borderBottom="1px solid #E2E8F0" // Add a subtle border for separation 
      position="fixed"
      top="0"
      zIndex="1000"
      >
        <Grid
          templateColumns="repeat(2, 1fr)" // Two columns: one for the title, one for filters/buttons
          justify="space-between"
          gap={4} // Spacing between grid items
          >
            {/* Left side: Dashboard title */}
            <GridItem>
            <Text
              fontSize="2xl" // Change the font size here 
              fontWeight="semibold"
              color={textColor}
              >
                Journal Entries
              </Text>
              </GridItem>

              {/* Right side: Filters and buttons */}
              <GridItem display="flex" alignItems="center" gap={4}>
                    <Button
                      size="sm"
                      bg={buttonBg}
                      color={textColor}
                      _hover={{ bg: buttonHoverBg }}
                      >
                        Filters
                      </Button>
                      <Select
                        size="sm"
                        bg={buttonBg}
                        color={textColor}
                        shadow="md"
                        _hover={{ bg: buttonHoverBg }}
                        w="150px" // Set a fixed width for the dropdown
                        minW="150px" // Ensure it doesn't shrink below this width
                        >
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </Select>
                        </GridItem>
          </Grid>
      </Box>
  );
};

export default journalheader;