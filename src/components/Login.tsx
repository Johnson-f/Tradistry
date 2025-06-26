import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  Alert,
  AlertIcon,
  Divider,
  Icon,
  Flex,
  useToast,
} from '@chakra-ui/react'
import { FaGoogle, FaDiscord } from 'react-icons/fa'
import { logger } from '../services/logger'

// Helper to log user session to supabase 
async function logUserSession() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Enhanced device detection
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';
    
    // Detect OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    // Detect device type
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
      if (/iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent)) {
        deviceType = 'tablet';
      }
    }
    
    const deviceInfo = `${os} - ${browser} on ${deviceType}`;
    
    // Get IP address (optional)
    let ip_address = '';
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const json = await res.json();
        ip_address = json.ip;
    } catch (error) {
        logger.error('Error fetching IP address', error, { component: 'Login' });
    }

   await supabase.from('user_sessions').insert({
    user_id: user.id,
    device_info: deviceInfo,
    ip_address,
    user_agent: userAgent,
    platform,
    browser,
    os,
    device_type: deviceType,
    last_active: new Date().toISOString(),
   }).select('id').then(({ data }) => {
    if (data && data[0]?.id) {
        localStorage.setItem('currentSessionId', data[0].id)
    }
   });
}

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const toast = useToast()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setError(error.message)
                toast({
                    title: 'Login Failed',
                    description: error.message,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                })
            } else {
                await logUserSession()
                toast({
                    title: 'Login Successful',
                    description: 'Welcome back to your journal!',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                })
                navigate('/')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialSignIn = async (provider: 'google' | 'discord') => {
        setError('')
        setIsLoading(true)
        
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin,
                }
            })
            if (error) {
                setError(error.message)
                toast({
                    title: 'Social Login Failed',
                    description: error.message,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                })
            }
        } catch (err) {
            setError('An unexpected error occurred')
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Box
            minH="100vh"
            bgGradient="linear(to-br, slate.900, blue.900, indigo.900)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            position="relative"
            overflow="hidden"
        >
            {/* Trading Chart Background pattern */}
            <Box
                position="absolute"
                inset={0}
                opacity={0.1}
                pointerEvents="none"
            >
                <svg width="100%" height="100%" viewBox="0 0 1200 800" fill="none">
                    {/* Grid Lines */}
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Trading Chart Lines */}
                    <path 
                        d="M50 400 L150 350 L250 380 L350 320 L450 340 L550 280 L650 300 L750 240 L850 260 L950 200 L1050 220 L1150 180"
                        stroke="#10b981" 
                        strokeWidth="2" 
                        fill="none" 
                        opacity="0.6" 
                    />
                    <path 
                        d="M50 450 L150 420 L250 440 L350 380 L450 400 L550 360 L650 380 L750 320 L850 340 L950 280 L1050 300 L1150 260"
                        stroke="#ef4444" 
                        strokeWidth="2" 
                        fill="none" 
                        opacity="0.6" 
                    />
                    
                    {/* Candlestick patterns */}
                    <g opacity="0.4">
                        <rect x="100" y="330" width="8" height="40" fill="#10b981" />
                        <rect x="150" y="340" width="8" height="30" fill="#ef4444" />
                        <rect x="200" y="320" width="8" height="50" fill="#10b981" />
                        <rect x="250" y="350" width="8" height="35" fill="#ef4444" />
                        <rect x="300" y="310" width="8" height="60" fill="#10b981" />
                    </g>
                </svg>
            </Box>

            {/* Floating Elements */}
            <Box
                position="absolute"
                top="20"
                left="20"
                w="16"
                h="16"
                bg="green.500"
                opacity={0.1}
                borderRadius="full"
                filter="blur(20px)"
                animation="pulse 2s infinite"
            />
            <Box
                position="absolute"
                bottom="20"
                right="20"
                w="20"
                h="20"
                bg="blue.500"
                opacity={0.1}
                borderRadius="full"
                filter="blur(20px)"
                animation="pulse 2s infinite"
            />
            <Box
                position="absolute"
                top="50%"
                left="10"
                w="12"
                h="12"
                bg="cyan.500"
                opacity={0.1}
                borderRadius="full"
                filter="blur(20px)"
                animation="pulse 2s infinite"
            />

            {/* Main Container */}
            <Container
                maxW="lg"
                bg="white"
                opacity={0.95}
                backdropFilter="blur(20px)"
                borderRadius="3xl"
                boxShadow="2xl"
                p={4}
                border="1px solid"
                borderColor="whiteAlpha.200"
                position="relative"
                zIndex={10}
            >
                {/* Header */}
                <VStack spacing={4} mb={4} textAlign="center">
                    <Box
                        w="12"
                        h="12"
                        bgGradient="linear(to-br, blue.600, indigo.600)"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mb={3}
                    >
                        <Icon
                            as="svg"
                            w={6}
                            h={6}
                            color="white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M3 13h2v4H3v-4zm4-6h2v10H7V7zm4-4h2v14h-2V3zm4 2h2v12h-2V5zm4 4h2v8h-2V9z" />
                        </Icon>
                    </Box>
                    <Heading size="lg" color="gray.900" mb={1}>
                        Welcome Back!
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                        New to Tradistry?{' '}
                        <Button
                            variant="link"
                            color="blue.600"
                            _hover={{ color: 'blue.700' }}
                            fontWeight="semibold"
                            fontSize="xs"
                            p={0}
                            h="auto"
                            onClick={() => navigate('/SignUp')}
                        >
                            Create Account
                        </Button>
                    </Text>
                </VStack>

                {/* Form */}
                <form onSubmit={handleLogin}>
                    <VStack spacing={3}>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                                Email
                            </FormLabel>
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="gray.200"
                                _focus={{
                                    borderColor: 'blue.500',
                                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                                }}
                                bg="gray.50"
                                opacity={0.5}
                                fontSize="sm"
                                py={2.5}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <Flex justify="space-between" align="center" mb={1}>
                                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb={0}>
                                    Password
                                </FormLabel>
                                <Button
                                    variant="link"
                                    fontSize="xs"
                                    color="blue.600"
                                    _hover={{ color: 'blue.700' }}
                                    p={0}
                                    h="auto"
                                    onClick={() => navigate('/ForgotPassword')}
                                >
                                    Forgot password?
                                </Button>
                            </Flex>
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="gray.200"
                                _focus={{
                                    borderColor: 'blue.500',
                                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                                }}
                                bg="gray.50"
                                opacity={0.5}
                                fontSize="sm"
                                py={2.5}
                            />
                        </FormControl>

                        {error && (
                            <Alert status="error" borderRadius="xl" fontSize="sm">
                                <AlertIcon />
                                {error}
                            </Alert>
                        )}

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
                            mb={8}
                            isLoading={isLoading}
                            loadingText="Signing in..."
                        >
                            Start Trading Journal
                        </Button>
                    </VStack>
                </form>

                {/* Divider */}
                <Box position="relative" my={8}>
                    <Divider />
                    <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        bg="white"
                        px={4}
                        fontWeight="semibold"
                        fontSize="md"
                        color="gray.400"
                    >
                        or
                    </Box>
                </Box>

                {/* Social Sign in Buttons */}
                <VStack spacing={2}>
                    <Button
                        w="full"
                        bg="white"
                        border="2px solid"
                        borderColor="gray.200"
                        color="gray.800"
                        fontWeight="semibold"
                        fontSize="lg"
                        borderRadius="2xl"
                        py={6}
                        leftIcon={
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                             <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                          </span>
                        }
                        _active={{ bg: 'gray.100' }}
                        mb={4}
                        onClick={() => handleSocialSignIn('google')}
                        isLoading={isLoading}
                        loadingText="Connecting..."
                    >
                        Continue with Google
                    </Button>

                    <Button
                        w="full"
                        bg="#5865F2"
                        color="white"
                        fontWeight="semibold"
                        fontSize="lg"
                        borderRadius="2xl"
                        py={6}
                        leftIcon={<Icon as={FaDiscord} boxSize={6} />}
                        _hover={{ bg: '#4752C4' }}
                        _active={{ bg: '#4752C4' }}
                        onClick={() => handleSocialSignIn('discord')}
                        isLoading={isLoading}
                        loadingText="Connecting..."
                    >
                        Continue with Discord
                    </Button>
                </VStack>
            </Container>
        </Box>
    )
} 