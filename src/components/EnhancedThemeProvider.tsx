import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { createTheme, colorThemes, ColorThemeName, ThemeMode } from './Theme';

// Types
type ThemeType = 'light' | 'dark' | 'system';
type ColorThemeType = ColorThemeName;

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeType;
  colorTheme: ColorThemeType;
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
  handleThemeChange: (newTheme: ThemeType) => void;
  handleColorThemeChange: (newColorTheme: ColorThemeType) => void;
  bgColor: string;
  textColor: string;
  cardBg: string;
  borderColor: string;
  currentTheme: any;
}

interface EnhancedThemeProviderProps {
  children: ReactNode;
}

// Create Theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Enhanced Theme Provider component
const EnhancedThemeProvider: React.FC<EnhancedThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme-preference') as ThemeType | null;
    return savedTheme || 'system';
  });
  const [colorTheme, setColorTheme] = useState<ColorThemeType>(() => {
    const savedColorTheme = localStorage.getItem('color-theme-preference') as ColorThemeType | null;
    return savedColorTheme || 'default';
  });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Determine current color mode
  const getCurrentColorMode = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  const colorMode = getCurrentColorMode();

  // Get current theme colors based on color theme and mode
  const getCurrentThemeColors = () => {
    return colorThemes[colorTheme][colorMode];
  };

  const currentThemeColors = getCurrentThemeColors();
  
  // Dynamic styles for current theme
  const bgColor = currentThemeColors.background;
  const textColor = currentThemeColors.text;
  const cardBg = currentThemeColors.surface;
  const borderColor = currentThemeColors.border;

  // Create the current theme object
  const currentTheme = createTheme(colorTheme, colorMode);

  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme-preference') as ThemeType | null;
      const savedColorTheme = localStorage.getItem('color-theme-preference') as ColorThemeType | null;
      
      if (savedTheme) {
        setTheme(savedTheme);
      }
      
      if (savedColorTheme) {
        setColorTheme(savedColorTheme);
      }
      
      setIsLoaded(true);
    };
    
    initializeTheme();
  }, []);

  // Persist theme preferences to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('theme-preference', theme);
  }, [theme, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('color-theme-preference', colorTheme);
  }, [colorTheme, isLoaded]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Force re-render when system theme changes
      setTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  };

  const handleThemeChange = (newTheme: ThemeType): void => {
    setTheme(newTheme);
  };

  const handleColorThemeChange = (newColorTheme: ColorThemeType): void => {
    setColorTheme(newColorTheme);
  };

  if (!isLoaded) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: bgColor,
        color: textColor
      }}>
        <span>Loading theme...</span>
      </div>
    );
  }

  const themeStyles: ThemeContextType = {
    isDark: colorMode === 'dark',
    theme,
    colorTheme,
    colorMode,
    toggleColorMode,
    handleThemeChange,
    handleColorThemeChange,
    bgColor,
    textColor,
    cardBg,
    borderColor,
    currentTheme,
  };

  return (
    <ChakraProvider theme={currentTheme}>
      <ThemeContext.Provider value={themeStyles}>
        {children}
      </ThemeContext.Provider>
    </ChakraProvider>
  );
};

export const useEnhancedTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
};

export default EnhancedThemeProvider; 