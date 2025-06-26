import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Define color themes with light and dark variants
export const colorThemes = {
  default: {
    light: {
      primary: {
        50: '#f5f7ff',
        100: '#e4e9ff',
        200: '#c2caff',
        300: '#9faaff',
        400: '#7d8bff',
        500: '#5a6bff',
        600: '#4855cc',
        700: '#363f99',
        800: '#242966',
        900: '#121433',
      },
      background: '#ffffff',
      surface: '#ffffff',
      text: '#1a202c',
      textSecondary: '#4a5568',
      border: '#e2e8f0',
    },
    dark: {
      primary: {
            50: '#f5f7ff',
            100: '#e4e9ff',
            200: '#c2caff',
            300: '#9faaff',
            400: '#7d8bff',
        500: '#5a6bff',
            600: '#4855cc',
            700: '#363f99',
            800: '#242966',
            900: '#121433',
        },
      background: '#1a202c',
      surface: '#2d3748',
      text: '#f7fafc',
      textSecondary: '#a0aec0',
      border: '#4a5568',
    },
  },
  ocean: {
    light: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#e2e8f0',
    },
    dark: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
    },
  },
  forest: {
    light: {
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      background: '#f9fafb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#4b5563',
      border: '#d1d5db',
    },
    dark: {
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      border: '#374151',
    },
  },
  sunset: {
    light: {
      primary: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
      },
      background: '#fefefe',
      surface: '#ffffff',
      text: '#1c1917',
      textSecondary: '#57534e',
      border: '#e7e5e4',
    },
    dark: {
      primary: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
      },
      background: '#1c1917',
      surface: '#292524',
      text: '#fafaf9',
      textSecondary: '#a8a29e',
      border: '#44403c',
    },
  },
  lavender: {
    light: {
      primary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87',
      },
      background: '#fafafa',
      surface: '#ffffff',
      text: '#1e1b4b',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
    dark: {
      primary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87',
      },
      background: '#1e1b4b',
      surface: '#312e81',
      text: '#f5f3ff',
      textSecondary: '#a5b4fc',
      border: '#4c1d95',
    },
  },
  rose: {
    light: {
      primary: {
        50: '#fff1f2',
        100: '#ffe4e6',
        200: '#fecdd3',
        300: '#fda4af',
        400: '#fb7185',
        500: '#f43f5e',
        600: '#e11d48',
        700: '#be123c',
        800: '#9f1239',
        900: '#881337',
      },
      background: '#fefefe',
      surface: '#ffffff',
      text: '#1f1f23',
      textSecondary: '#71717a',
      border: '#e4e4e7',
    },
    dark: {
      primary: {
        50: '#fff1f2',
        100: '#ffe4e6',
        200: '#fecdd3',
        300: '#fda4af',
        400: '#fb7185',
        500: '#f43f5e',
        600: '#e11d48',
        700: '#be123c',
        800: '#9f1239',
        900: '#881337',
      },
      background: '#1f1f23',
      surface: '#27272a',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
      border: '#3f3f46',
    },
  },
};

export type ColorThemeName = keyof typeof colorThemes;
export type ThemeMode = 'light' | 'dark';

const createTheme = (colorThemeName: ColorThemeName, mode: ThemeMode): ThemeConfig => {
  // Safety checks with fallbacks
  const safeColorThemeName = colorThemeName || 'default';
  const safeMode = mode || 'light';
  
  // Ensure the theme exists, fallback to default if not
  const themeData = colorThemes[safeColorThemeName];
  if (!themeData) {
    console.warn(`Theme "${safeColorThemeName}" not found, falling back to default`);
    return createTheme('default', safeMode);
  }
  
  const colors = themeData[safeMode];
  if (!colors) {
    console.warn(`Mode "${safeMode}" not found for theme "${safeColorThemeName}", falling back to light`);
    return createTheme(safeColorThemeName, 'light');
  }
  
  return extendTheme({
    colors: {
      brand: colors.primary,
      primary: colors.primary,
    },
    fonts: {
        heading: `'Poppins', sans-serif`,
        body: `'Inter', sans-serif`,
    },
    styles: {
        global: {
            body: {
          bg: colors.background,
          color: colors.text,
        },
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg': colors.background,
        'chakra-body-text': colors.text,
        'chakra-placeholder-color': colors.textSecondary,
        'chakra-border-color': colors.border,
        },
    },
});
};

// Default theme (for backward compatibility)
const theme: ThemeConfig = createTheme('default', 'light');

export { createTheme };
export default theme; 