import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateOpenAPISpec, getPrimaryServerUrl } from './openapi.js';

describe('OpenAPI Dynamic Generation', () => {
  it('should generate spec with default development URL', () => {
    const spec = generateOpenAPISpec();
    
    assert.ok(spec.servers);
    assert.ok(Array.isArray(spec.servers));
    assert.ok(spec.servers.length > 0);
    assert.ok(spec.servers[0].url.includes('localhost'));
    assert.strictEqual(spec.info['x-environment'], 'development');
  });

  it('should use explicit base URL when provided', () => {
    const baseUrl = 'https://api.example.com/v1';
    const spec = generateOpenAPISpec({ baseUrl });
    
    assert.strictEqual(spec.servers[0].url, baseUrl);
    assert.strictEqual(spec.servers[0].description, 'Configured API server');
  });

  it('should generate production URLs in production environment', () => {
    process.env.NODE_ENV = 'production';
    process.env.PRODUCTION_API_URL = 'https://api.prod.com/brokerage/v1';
    
    const spec = generateOpenAPISpec({ nodeEnv: 'production' });
    
    assert.strictEqual(spec.servers[0].url, 'https://api.prod.com/brokerage/v1');
    assert.strictEqual(spec.servers[0].description, 'Production server');
    assert.strictEqual(spec.info['x-environment'], 'production');
    
    // Cleanup
    delete process.env.NODE_ENV;
    delete process.env.PRODUCTION_API_URL;
  });

  it('should generate staging URLs in staging environment', () => {
    process.env.STAGING_API_URL = 'https://api.staging.com/brokerage/v1';
    
    const spec = generateOpenAPISpec({ nodeEnv: 'staging' });
    
    assert.strictEqual(spec.servers[0].url, 'https://api.staging.com/brokerage/v1');
    assert.strictEqual(spec.servers[0].description, 'Staging server');
    
    // Cleanup
    delete process.env.STAGING_API_URL;
  });

  it('should use custom port for development URLs', () => {
    const spec = generateOpenAPISpec({ port: 4000 });
    
    assert.ok(spec.servers[0].url.includes(':4000'));
  });

  it('should include localhost for non-development environments', () => {
    const spec = generateOpenAPISpec({ nodeEnv: 'production', port: 3001 });
    
    // Should have both production and localhost URLs
    assert.ok(spec.servers.length >= 2);
    assert.ok(spec.servers.some((server) => server.url.includes('localhost')));
  });

  it('should return primary server URL', () => {
    const baseUrl = 'https://api.example.com/v1';
    const primaryUrl = getPrimaryServerUrl({ baseUrl });
    
    assert.strictEqual(primaryUrl, baseUrl);
  });

  it('should include generation metadata', () => {
    const spec = generateOpenAPISpec();
    
    assert.ok(spec.info['x-generated-at']);
    assert.ok(spec.info['x-environment']);
    assert.ok(new Date(spec.info['x-generated-at']).getTime() > 0);
  });
});
