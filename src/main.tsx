import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // For Tailwind CSS
import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider } from './Settings'
import App from './App'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <ChakraProvider>
      <ThemeProvider>
    <App />
    </ThemeProvider>
    </ChakraProvider>
  </StrictMode>
) 