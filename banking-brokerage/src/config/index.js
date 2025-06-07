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
};

export default config;
