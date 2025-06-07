import express from 'express';
import swaggerUi from 'swagger-ui-express';
import config from './config/index.js';
import brokerageRoutes from './routes/brokerage.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import { generateOpenAPISpec } from './utils/openapi.js';

/**
 * Create Express application instance
 * @returns {import('express').Application} Express app
 */
const createApp = () => {
  const app = express();

  // Trust reverse proxy - IMPORTANT for security and correct client IP detection
  if (config.trustProxy) {
    app.set('trust proxy', true);
  }

  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Enhanced CORS for reverse proxy scenarios
  app.use((req, res, next) => {
    const origin = req.get('Origin');

    if (config.allowedOrigins.includes('*') || config.allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Forwarded-For, X-Forwarded-Proto');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    return next();
  });

  // Security headers middleware (only set if not already set by reverse proxy)
  app.use((req, res, next) => {
    if (!res.get('X-Content-Type-Options')) {
      res.set('X-Content-Type-Options', 'nosniff');
    }
    if (!res.get('X-Frame-Options')) {
      res.set('X-Frame-Options', 'DENY');
    }
    if (!res.get('X-XSS-Protection')) {
      res.set('X-XSS-Protection', '1; mode=block');
    }

    next();
  });

  // Enhanced request logging middleware that respects proxy headers
  app.use((req, res, next) => {
    const clientIp = req.get('X-Forwarded-For') || req.ip;
    const protocol = req.get('X-Forwarded-Proto') || req.protocol;
    const host = req.get('X-Forwarded-Host') || req.get('Host');

    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${clientIp} - ${protocol}://${host}`);
    next();
  });

  // Load OpenAPI spec with dynamic server URLs
  const openApiSpec = generateOpenAPISpec({
    port: config.port,
    nodeEnv: config.nodeEnv,
    apiVersion: config.apiVersion,
  });

  // API documentation
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customSiteTitle: 'Banking Brokerage Mock API',
      customCss: '.swagger-ui .topbar { display: none }',
    }),
  );

  // Serve OpenAPI spec as JSON
  app.get('/openapi.json', (req, res) => {
    res.json(openApiSpec);
  });

  // Enhanced health check with reverse proxy information
  app.get('/health', (req, res) => {
    res.json({
      service: 'banking-brokerage-mock',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.nodeEnv,
      proxy: {
        forwarded_for: req.get('X-Forwarded-For'),
        forwarded_proto: req.get('X-Forwarded-Proto'),
        forwarded_host: req.get('X-Forwarded-Host'),
        real_ip: req.ip,
        user_agent: req.get('User-Agent'),
      },
    });
  });

  // API routes with versioning
  app.use(`/api/${config.apiVersion}`, brokerageRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Banking Brokerage Mock API',
      version: '1.0.0',
      environment: config.nodeEnv,
      documentation: '/api-docs',
      openapi: '/openapi.json',
      endpoints: {
        health: '/health',
        accounts: `/api/${config.apiVersion}/brokerage/accounts`,
        userAccounts: `/api/${config.apiVersion}/brokerage/users/{userId}/accounts`,
      },
    });
  });

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
      console.log(`🔍 OpenAPI Spec: http://localhost:${config.port}/openapi.json`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
      console.log(`💼 Example Accounts: http://localhost:${config.port}/api/${config.apiVersion}/brokerage/users/USR1234567890/accounts`);
    });

    // Enhanced graceful shutdown with proxy connection handling
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      // Stop accepting new connections
      server.close(() => {
        console.log('Server closed. Goodbye! 👋');
        process.exit(0);
      });

      // Force close after timeout to handle hanging proxy connections
      setTimeout(() => {
        console.log('Force closing server...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

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
