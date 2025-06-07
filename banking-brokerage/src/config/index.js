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
  // API URL configuration
  baseUrl: process.env.BROKERAGE_API_BASE_URL,
  productionApiUrl: process.env.PRODUCTION_API_URL,
  stagingApiUrl: process.env.STAGING_API_URL,
};

export default config;
