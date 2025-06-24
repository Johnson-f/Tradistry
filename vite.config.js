import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import graphql from '@rollup/plugin-graphql'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
   graphql()
  ],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
  },
})