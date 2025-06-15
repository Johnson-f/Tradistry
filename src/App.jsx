import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client' 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Helmet } from 'react-helmet'
import './index.css'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import Journal from './Journal'
import Analytics from './Analytics'
import Calendar from './Calendar'
import Settings from './Settings'
import Landingpage from './Landingpage'
import Login from './components/Login'
import SignUp from './components/SignUp'
import { supabase } from './supabaseClient'
import Protectedroute from './components/Protectedroute'
import ForgotPassword from './components/ForgotPassword'
import graphqlClient from './apollo/client'
import { RingLoader } from 'react-spinners'
import ErrorBoundary from './components/Error'
import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider } from './Settings'

console.log('ChakraProvider:', ChakraProvider);

// Initialize React Query Client 
const queryClient = new QueryClient()

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(256) // Default expanded width

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <RingLoader color="#100e0e" size={64} loading={true} />
    </div>
    )
  }
  return (
    <QueryClientProvider client={queryClient}>
    <ApolloProvider client={graphqlClient}>
    {/* Helmet for SEO */}
    <Helmet>
      <title>Journal Project</title>
      <meta name="description" content="A platform for traders to journal their trades and analyze their performance."/>
    </Helmet>
    <ChakraProvider>
      <ThemeProvider>
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Landingpage />} />
            <Route path="/Login.jsx" element={<Login />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <Route
            path="*"
            element={
              <Protectedroute user={user}>
              <div className='flex'>
                {/* Pass setSidebarWidth to Sidebar */}
                <Sidebar onWidthChange={setSidebarWidth} />
                <main 
                   className='flex-1 transition-all duration-300'
                   style={{ marginLeft: sidebarWidth }} // Adjust margin dynamically
                   >
                    {/* Remove errorboundary */}
                  <Routes>
                    <Route path="/Dashboard" element={<Dashboard />} />
                    <Route path="/Journal.jsx" element={
                      <ErrorBoundary>
                      <Journal />
                      </ErrorBoundary>
                      } 
                      />
                    <Route path="/Analytics.jsx" element={<Analytics />} />
                    <Route path="/Calendar.jsx" element={<Calendar />} />
                    <Route path="/Settings" element={<Settings />} />
                    <Route path="/Login.jsx" element={<Login />} />
                    <Route path="*" element = {<Navigate to="/Dashboard" />} />
                  </Routes>
                </main>
              </div>
              </Protectedroute>
            }
            />
        )}
      </Routes>
    </Router>
    </ThemeProvider>
    </ChakraProvider>
    </ApolloProvider>
    </QueryClientProvider>
  )
}

export default App 

 {/* bg-gradient-to-br from-gray-900 via-gray-900 to-black p-4 */}