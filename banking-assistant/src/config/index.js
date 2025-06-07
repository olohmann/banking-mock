import { config } from 'dotenv';

config();

/**
 * Application configuration object
 * @type {Object}
 */
export default {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  API_VERSION: process.env.API_VERSION || 'v1',

  // API URL configuration - single consolidated base URL
  baseUrl: process.env.BASE_URL,

  // Reverse proxy configuration
  trustProxy: process.env.TRUST_PROXY === 'true',

  // Security configuration
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
};
