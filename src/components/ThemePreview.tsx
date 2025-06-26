import React from 'react';
import { Box, VStack, HStack, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { colorThemes, ColorThemeName } from './Theme';

interface ThemePreviewProps {
  selectedTheme: ColorThemeName;
  onThemeSelect: (theme: ColorThemeName) => void;
  currentMode: 'light' | 'dark';
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ 
  selectedTheme, 
  onThemeSelect, 
  currentMode 
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const themeNames: { [key in ColorThemeName]: string } = {
    default: 'Default',
    ocean: 'Ocean',
    forest: 'Forest',
    sunset: 'Sunset',
    lavender: 'Lavender',
    rose: 'Rose',
  };

  const getThemePreviewColors = (themeName: ColorThemeName, mode: 'light' | 'dark') => {
    const theme = colorThemes[themeName][mode];
    return {
      primary: theme.primary[500],
      background: theme.background,
      surface: theme.surface,
      text: theme.text,
    };
  };

  const getThemeColor = (themeName: ColorThemeName, mode: 'light' | 'dark', shade: number) => {
    const theme = colorThemes[themeName][mode];
    return theme.primary[shade as keyof typeof theme.primary];
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="sm" fontWeight="medium" color="gray.600">
        Color Themes
      </Text>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={3}>
        {(Object.keys(colorThemes) as ColorThemeName[]).map((themeName) => {
          const colors = getThemePreviewColors(themeName, currentMode);
          const isSelected = selectedTheme === themeName;
          
          return (
            <Button
              key={themeName}
              variant="outline"
              onClick={() => onThemeSelect(themeName)}
              borderColor={isSelected ? colors.primary : borderColor}
              borderWidth={isSelected ? '2px' : '1px'}
              bg={isSelected ? `${colors.primary}10` : 'transparent'}
              _hover={{
                bg: isSelected ? `${colors.primary}15` : hoverBg,
                borderColor: colors.primary,
              }}
              height="auto"
              p={0}
              overflow="hidden"
            >
              <VStack spacing={0} align="stretch" w="100%">
                {/* Theme name */}
                <Box p={3} bg={colors.surface} borderBottom="1px" borderColor={borderColor}>
                  <Text fontSize="sm" fontWeight="medium" color={colors.text}>
                    {themeNames[themeName]}
                  </Text>
                </Box>
                
                {/* Color preview */}
                <Box p={3} bg={colors.background}>
                  <VStack spacing={2} align="stretch">
                    {/* Primary color bar */}
                    <Box 
                      h="8" 
                      bg={colors.primary} 
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="xs" color="white" fontWeight="medium">
                        Primary
                      </Text>
                    </Box>
                    
                    {/* Color palette preview */}
                    <HStack spacing={1}>
                      {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                        <Box
                          key={shade}
                          flex={1}
                          h="4"
                          bg={getThemeColor(themeName, currentMode, shade)}
                          borderRadius="sm"
                        />
                      ))}
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </Button>
          );
        })}
      </Box>
    </VStack>
  );
};

export default ThemePreview; 