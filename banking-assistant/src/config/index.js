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
};
