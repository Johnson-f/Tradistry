import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // For Tailwind CSS
import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider } from './Settings'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider>
      <ThemeProvider>
    <App />
    </ThemeProvider>
    </ChakraProvider>
  </StrictMode>
)
