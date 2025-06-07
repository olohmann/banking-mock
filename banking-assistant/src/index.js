import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import config from './config/index.js';
import bankingRoutes from './routes/banking.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create Express application instance
 * @returns {import('express').Application} Express app
 */
const createApp = () => {
  const app = express();

  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS headers for development
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    return next();
  });

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Load OpenAPI spec
  const openApiSpec = YAML.load(join(__dirname, '../docs/openapi.yaml'));
  
  // API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customSiteTitle: 'Banking Assistant Mock API',
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  // Serve OpenAPI spec as JSON
  app.get('/openapi.json', (req, res) => {
    res.json(openApiSpec);
  });

  // API routes with versioning
  app.use(`/api/${config.API_VERSION}`, bankingRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Banking Assistant Mock API',
      version: '1.0.0',
      environment: config.NODE_ENV,
      documentation: '/api-docs',
      openapi: '/openapi.json',
      endpoints: {
        health: `/api/${config.API_VERSION}/health`,
        balance: `/api/${config.API_VERSION}/accounts/{accountId}/balance`,
        transactions: `/api/${config.API_VERSION}/accounts/{accountId}/transactions`,
      },
    });
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

/**
 * Start the server
 * @async
 */
const startServer = async () => {
  try {
    const app = createApp();
    
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Banking Assistant Mock API running on port ${config.PORT}`);
      console.log(`📚 API Documentation: http://localhost:${config.PORT}/api-docs`);
      console.log(`🔍 OpenAPI Spec: http://localhost:${config.PORT}/openapi.json`);
      console.log(`🏥 Health Check: http://localhost:${config.PORT}/api/${config.API_VERSION}/health`);
      console.log(`💰 Example Balance: http://localhost:${config.PORT}/api/${config.API_VERSION}/accounts/ACC1234567890/balance`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed. Goodbye! 👋');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server only if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { createApp, startServer };
