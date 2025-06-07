import YAML from 'yamljs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

/**
 * Generate OpenAPI specification with dynamic server URLs
 * @param {object} options - Configuration options
 * @param {string} [options.baseUrl] - Base URL for the API server
 * @param {number} [options.port] - Port number for local development
 * @param {string} [options.nodeEnv] - Environment (development, staging, production)
 * @param {string} [options.apiVersion] - API version (e.g., 'v1')
 * @returns {object} OpenAPI specification with dynamic server URLs
 */
export function generateOpenAPISpec(options = {}) {
  const {
    baseUrl = process.env.BASE_URL,
    port = process.env.PORT || 3000,
    nodeEnv = process.env.NODE_ENV || 'development',
    apiVersion = process.env.API_VERSION || 'v1',
  } = options;

  // Load the base OpenAPI spec
  const specPath = join(__dirname, '../../docs/openapi.yaml');
  const baseSpec = YAML.load(specPath);

  // Generate server URLs based on configuration
  const servers = [];

  if (baseUrl) {
    // Use explicit base URL if provided (handles reverse proxy scenarios)
    servers.push({
      url: baseUrl,
      description: 'Configured API server',
    });
  } else {
    // Auto-generate URL for local development
    servers.push({
      url: `http://localhost:${port}/api/${apiVersion}`,
      description: 'Local development server',
    });
  }

  // Always include localhost for development if not already present and not in production
  if (nodeEnv === 'development' && baseUrl && !baseUrl.includes('localhost')) {
    servers.push({
      url: `http://localhost:${port}/api/${apiVersion}`,
      description: 'Local development server',
    });
  }

  // Update the spec with dynamic servers
  const dynamicSpec = {
    ...baseSpec,
    servers,
    info: {
      ...baseSpec.info,
      'x-generated-at': new Date().toISOString(),
      'x-environment': nodeEnv,
      'x-api-version': apiVersion,
    },
  };

  return dynamicSpec;
}

/**
 * Get the primary server URL from the generated spec
 * @param {object} [options] - Configuration options
 * @returns {string} Primary server URL
 */
export function getPrimaryServerUrl(options = {}) {
  const spec = generateOpenAPISpec(options);
  return spec.servers[0]?.url || 'http://localhost:3000/api/v1';
}
