import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateOpenAPISpec, getPrimaryServerUrl } from './openapi.js';

describe('Banking Assistant OpenAPI Dynamic Generation', () => {
  it('should generate spec with default development URL', () => {
    const spec = generateOpenAPISpec();
    
    assert.ok(spec.servers);
    assert.ok(Array.isArray(spec.servers));
    assert.ok(spec.servers.length > 0);
    assert.ok(spec.servers[0].url.includes('localhost'));
    assert.ok(spec.servers[0].url.includes('/api/v1'));
    assert.strictEqual(spec.info['x-environment'], 'development');
    assert.strictEqual(spec.info['x-api-version'], 'v1');
  });

  it('should use explicit base URL when provided', () => {
    const baseUrl = 'https://api.example.com/banking/v1';
    const spec = generateOpenAPISpec({ baseUrl });
    
    assert.strictEqual(spec.servers[0].url, baseUrl);
    assert.strictEqual(spec.servers[0].description, 'Configured API server');
  });

  it('should generate production URLs in production environment', () => {
    process.env.NODE_ENV = 'production';
    process.env.PRODUCTION_API_URL = 'https://api.prod.com/banking/v1';
    
    const spec = generateOpenAPISpec({ nodeEnv: 'production' });
    
    assert.strictEqual(spec.servers[0].url, 'https://api.prod.com/banking/v1');
    assert.strictEqual(spec.servers[0].description, 'Production server');
    assert.strictEqual(spec.info['x-environment'], 'production');
    
    // Cleanup
    delete process.env.NODE_ENV;
    delete process.env.PRODUCTION_API_URL;
  });

  it('should generate staging URLs in staging environment', () => {
    process.env.STAGING_API_URL = 'https://api.staging.com/banking/v1';
    
    const spec = generateOpenAPISpec({ nodeEnv: 'staging' });
    
    assert.strictEqual(spec.servers[0].url, 'https://api.staging.com/banking/v1');
    assert.strictEqual(spec.servers[0].description, 'Staging server');
    
    // Cleanup
    delete process.env.STAGING_API_URL;
  });

  it('should use custom port and API version for development URLs', () => {
    const spec = generateOpenAPISpec({ port: 4000, apiVersion: 'v2' });
    
    assert.ok(spec.servers[0].url.includes(':4000'));
    assert.ok(spec.servers[0].url.includes('/api/v2'));
    assert.strictEqual(spec.info['x-api-version'], 'v2');
  });

  it('should include localhost for non-development environments', () => {
    const spec = generateOpenAPISpec({ nodeEnv: 'production', port: 3000 });
    
    // Should have both production and localhost URLs
    assert.ok(spec.servers.length >= 2);
    assert.ok(spec.servers.some((server) => server.url.includes('localhost')));
  });

  it('should return primary server URL', () => {
    const baseUrl = 'https://api.example.com/banking/v1';
    const primaryUrl = getPrimaryServerUrl({ baseUrl });
    
    assert.strictEqual(primaryUrl, baseUrl);
  });

  it('should include generation metadata', () => {
    const spec = generateOpenAPISpec();
    
    assert.ok(spec.info['x-generated-at']);
    assert.ok(spec.info['x-environment']);
    assert.ok(spec.info['x-api-version']);
    assert.ok(new Date(spec.info['x-generated-at']).getTime() > 0);
  });

  it('should respect API version in URLs', () => {
    const spec = generateOpenAPISpec({ apiVersion: 'v2', port: 3000 });
    
    assert.ok(spec.servers[0].url.endsWith('/api/v2'));
    assert.strictEqual(spec.info['x-api-version'], 'v2');
  });

  it('should handle default port correctly', () => {
    const spec = generateOpenAPISpec({ port: undefined });
    
    // Should default to 3000
    assert.ok(spec.servers[0].url.includes(':3000'));
  });
});
