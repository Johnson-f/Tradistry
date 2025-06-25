import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Heading,
} from '@chakra-ui/react'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setMessage('')
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) setError(error.message)
        else setMessage('Password reset email sent! Check your inbox.')
    }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, slate.900, blue.900, indigo.900)" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container maxW="md" bg="white" opacity={0.97} backdropFilter="blur(20px)" borderRadius="2xl" boxShadow="2xl" p={8} border="1px solid" borderColor="whiteAlpha.200" position="relative" zIndex={10}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg" color="gray.900" textAlign="center">Reset Password</Heading>
          <form onSubmit={handleReset}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                  bg="gray.50"
                  fontSize="sm"
                  py={2.5}
                />
              </FormControl>
              <Button
                type="submit"
                w="full"
                bgGradient="linear(to-r, #3366FF, #7F56D9)"
                color="white"
                fontWeight="bold"
                fontSize="lg"
                borderRadius="2xl"
                py={6}
                boxShadow="0 8px 32px 0 rgba(51,102,255,0.15)"
                _hover={{ bgGradient: 'linear(to-r, #254EDB, #5B3CB8)', transform: 'scale(1.01)' }}
                _active={{ bgGradient: 'linear(to-r, #254EDB, #5B3CB8)' }}
              >
                Send Reset Email
              </Button>
              {message && (
                <Alert status="success" borderRadius="xl" fontSize="sm">
                  <AlertIcon />
                  {message}
                </Alert>
              )}
              {error && (
                <Alert status="error" borderRadius="xl" fontSize="sm">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
            </VStack>
          </form>
        </VStack>
      </Container>
    </Box>
  )
}

export default ForgotPassword