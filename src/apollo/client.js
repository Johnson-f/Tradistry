import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { supabase } from '../supabaseClient'


// Supabase GraphQL endpoint
const SUPABASE_GRAPHQL_URL = 'https://xzzpqryqndcfrwltlfpj.supabase.co/graphql/v1'

// Supabase anon key
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6enBxcnlxbmRjZnJ3bHRsZnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzE0MTQsImV4cCI6MjA2NDA0NzQxNH0.dCyFDMbaB1uozFN4h8QfRjhGOM6J6syhMso-g5iVaSU"

// HTTP link to Supabase GraphQL - use the constant for consistency
const httpLink = createHttpLink({
    uri: SUPABASE_GRAPHQL_URL,
})

// Auth link that attaches tokens to requests
const authLink = setContext(async (_, { headers }) => {
    try {
        // Get the current session
        const {
            data: { session },
            error
        } = await supabase.auth.getSession()

        if (error) {
            console.error('Error getting session:', error)
        }

        // Use access token if available, otherwise use anon key
        const token = session?.access_token || SUPABASE_ANON_KEY

        return {
            headers: {
                ...headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                // Add apikey header for Supabase
                'apikey': SUPABASE_ANON_KEY,
            },
        }
    } catch (error) {
        console.error('Error in auth link:', error)
        
        // Fallback to anon key if there's an error
        return {
            headers: {
                ...headers,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
            },
        }
    }
})

// Create Apollo Client
const graphqlClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
        // Optional: Add type policies for better caching
        typePolicies: {
            // Add any specific type policies if needed
        }
    }),
    // Optional: Add default options
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
        },
        query: {
            errorPolicy: 'all',
        },
    },
})

export default graphqlClient