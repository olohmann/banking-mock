# Dynamic OpenAPI URL Configuration

The Banking Brokerage Mock API supports dynamic server URL generation in the OpenAPI specification. This allows the API documentation and client tools to use the correct URLs based on your deployment environment.

## How It Works

The OpenAPI specification is generated dynamically at runtime, replacing the static server URLs with environment-appropriate URLs.

## Configuration Options

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BROKERAGE_API_BASE_URL` | Explicit base URL (overrides all other settings) | `https://api.yourdomain.com/brokerage/v1` |
| `PRODUCTION_API_URL` | Production environment URL | `https://api.prod.com/brokerage/v1` |
| `STAGING_API_URL` | Staging environment URL | `https://api-staging.com/brokerage/v1` |
| `NODE_ENV` | Environment mode | `development`, `staging`, `production` |
| `PORT` | Local development port | `3001` |

### URL Generation Logic

1. **Explicit Base URL**: If `BROKERAGE_API_BASE_URL` is set, it takes precedence
2. **Environment-based**: URLs are generated based on `NODE_ENV`:
   - `development`: `http://localhost:{PORT}/api/v1`
   - `staging`: Uses `STAGING_API_URL` or default staging URL
   - `production`: Uses `PRODUCTION_API_URL` or default production URL
3. **Localhost Fallback**: Non-development environments include a localhost option for testing

## Usage Examples

### Docker Compose
```yaml
services:
  banking-brokerage:
    environment:
      - BROKERAGE_API_BASE_URL=http://banking-brokerage:3001/api/v1
```

### Cloud Deployment
```bash
export BROKERAGE_API_BASE_URL=https://your-cloud-url.com/api/v1
export NODE_ENV=production
```

### Local Development with Custom Port
```bash
export PORT=4000
npm start
# OpenAPI spec will show: http://localhost:4000/api/v1
```

### Staging Environment
```bash
export NODE_ENV=staging
export STAGING_API_URL=https://api-staging.yourdomain.com/brokerage/v1
npm start
```

## Accessing Dynamic OpenAPI Spec

- **JSON Format**: `GET /openapi.json`
- **Swagger UI**: `GET /api-docs`

The generated specification includes metadata:
- `x-generated-at`: Timestamp when the spec was generated
- `x-environment`: Current environment mode

## API Endpoints

All endpoints automatically use the dynamically configured base URL:

- Health Check: `{baseUrl}/../health`
- Create Account: `{baseUrl}/brokerage/accounts`
- List User Accounts: `{baseUrl}/brokerage/users/{userId}/accounts`
- Get Account Details: `{baseUrl}/brokerage/accounts/{accountId}`

## Testing

Run the tests to verify dynamic URL generation:

```bash
npm test -- src/utils/openapi.test.js
```
