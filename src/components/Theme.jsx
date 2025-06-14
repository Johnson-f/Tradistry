import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    colors: {
        brand: {
            50: '#f5f7ff',
            100: '#e4e9ff',
            200: '#c2caff',
            300: '#9faaff',
            400: '#7d8bff',
            500: '#5a6bff', // Primary brand color
            600: '#4855cc',
            700: '#363f99',
            800: '#242966',
            900: '#121433',
        },
    },
    fonts: {
        heading: `'Poppins', sans-serif`,
        body: `'Inter', sans-serif`,
    },
    styles: {
        global: {
            body: {
                bg: 'gray.50', // Light background
                color: 'gray.800', // Dark text
            },
        },
    },
});

export default theme;