require('dotenv').config(); // Load environment variable from .env file
const { ApolloServer } = require('@apollo/server'); // Main GraphQL server library
const { expressMiddleware } = require('@apollo/server/express4'); // Middleware for Express
const express = require('express'); // Express framework to handle HTTP requests 
const helmet = require('helmet'); // Middleware for securing Express apps by setting various HTTP headers 
const http = require('http'); // Node.js HTTP module to create a server
const cors = require('cors'); // Middleware for enabling CORS 
const rateLimit = require('express-rate-limit'); // Middleware for rate limiting 
const { WebSocketServer } = require('ws'); // Websocket server library
const { useServer } = require ('graphql-ws/lib/use/ws'); // Websocket server for GraphQL
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');// GraphQL playground
const cookieParser = require('cookie-parser'); // Middleware to parse cookies 
const expressSanitizer = require('express-sanitizer'); // Middleware for sanitizing inputs 
const logger = require('./logger.cjs'); // Custom logger module 

// Supabase client 
const { createClient } = require('@supabase/supabase-js'); // Import Supabase client 
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);


// Merge schema and resolvers 
const { loadFilesSync } = require('@graphql-tools/load-files'); // Loads GraphQL schema and resolvers from files 
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge'); // Merges multiple typeDefs and resolvers into one 
const { makeExecutableSchema } = require('@graphql-tools/schema');  // Combines typeDefs + resolvers into a schema
const { getUserFromRequest } = require('./Utils/auth.js');

// Load typeDefs (schema) and resolvers from files
const typeDefs = mergeTypeDefs(loadFilesSync('./schema/**/*.js')); // Load all .graphql files from the schema directory 
const resolvers = mergeResolvers(loadFilesSync('./resolvers/**/*.js')); // Load all .js files from the resolvers directory

// Create an executable schema 
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Initialize Express app
const app = express(); // Create an instance of Express
const httpServer = http.createServer(app); // Create an HTTP server using the Express app

// Create a WebSocket server for subscriptions 
const wsServer = new WebSocketServer({
  server: httpServer, // Attach the HTTP server
  path: '/graphql', // Path for the WebSocket server
});

// Use the WebSocket server with the Apollo Server
useServer(
  {
    schema, // Attach the GraphQL schema
    onConnect: async () => {
      logger.info('Client connected to WebSocket');
    },
    onDisconnect: async () => {
      logger.info('Client disconnected from WebSocket');
    },
    context: async (ctx, msg, args) => {
      // Supabase Auth: get user from Authorization header
      return {};
    }
  },
  wsServer // Attach the WebSocket server
);

// Rate Limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers 
    legacyHeaders: false, // Disable the 'X-RateLimit-*' headers 
}); 

// Add middleware to the app 
app.use(helmet()); // Use helmet for security
app.use(limiter); // use rate limiting middleware
app.use(cors()); // Enable CORS
app.use(cookieParser()); // Parse cookies from request headers
app.use(expressSanitizer());
app.use(express.json()); // Parse JSON request bodies 

// Graceful shutdown logic
const shutdown = async () => {
    try {
        logger.info('Shutting down server gracefully...');

        // Stop the Apollo server 
        await server.stop();
        logger.info('Apollo server stopped');

        // Close the WebSocket server 
        wsServer.close();
        logger.info('WebSocket server closed');

        // Close the HTTP server 
        httpServer.close(() => {
            logger.info('HTTP server closed');
            process.exit(0); // Exit the process
        });
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1); // Exit with an error code
    }
};

// Listen for termination signals 
process.on('SIGINT', shutdown); // Handle Ctrl+C
process.on('SIGTERM', shutdown); // Handle termination signal

// Apollo Server instance
const server = new ApolloServer({
  schema, // Attach the GraphQL schema
  introspection: true, // Enable introspection for GraphQL playground 
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })], // Use local GraphQL playground 
  context: async ({ req, res }) => {
    const user = await getUserFromRequest(req, supabase); // Get the user object from the request and Supabase client 
    return { req, res, user, supabase }; // Return the user object and Supabase client 
  },
});

// Start the Apollo server and listen
  (async () => {
    try {
  
      // Start the Apollo server
      await server.start();
  // Add middleware for the /graphql endpoint
  app.use(
    '/graphql',
    cors({
      origin: '*', // Allow requests from Apollo Studio
      credentials: true, // Allow credentials (cookies) to be sent
    }), // Allow cross-origin requests
    express.json(), // Parse JSON requests
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const user = await getUserFromRequest(req, supabase); // Get the user object from the request and Supabase client 
        return { req, res, user, supabase }; // Return the user object and Supabase client 
      },
    })
  );
      // Server listening
    const PORT = process.env.PORT || 4000; // Port to run the server on, default is 4000
      httpServer.listen(PORT, () => {
        logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
      });
    } catch (err) {
      logger.error('Failed to start server:', err);
      process.exit(1);
    }
  })();


