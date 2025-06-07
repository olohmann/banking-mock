import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration
 */
const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  apiVersion: process.env.API_VERSION || 'v1',

  // API URL configuration - single consolidated base URL
  baseUrl: process.env.BASE_URL,

  // Reverse proxy configuration
  trustProxy: process.env.TRUST_PROXY === 'true',

  // Security configuration
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
};

export default config;
