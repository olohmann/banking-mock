import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import config from './config/index.js';
import brokerageRoutes from './routes/brokerage.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
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
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );

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
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customSiteTitle: 'Banking Brokerage Mock API',
      customCss: '.swagger-ui .topbar { display: none }',
    }),
  );

  // Health check route
  app.get('/health', (req, res) => {
    res.json({
      service: 'banking-brokerage-mock',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // API routes
  app.use('/api/v1', brokerageRoutes);

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

/**
 * Start the Express server
 * @async
 */
const startServer = async () => {
  try {
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`🚀 Banking Brokerage Mock API running on port ${config.port}`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('\\n🛑 Shutting down server...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await startServer();
}

export { createApp, startServer };
