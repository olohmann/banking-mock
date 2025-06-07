# Dynamic OpenAPI URL Configuration

The Banking Assistant Mock API supports dynamic server URL generation in the OpenAPI specification. This allows the API documentation and client tools to use the correct URLs based on your deployment environment.

## How It Works

The OpenAPI specification is generated dynamically at runtime, replacing the static server URLs with environment-appropriate URLs that include the configurable API version.

## Configuration Options

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BANKING_API_BASE_URL` | Explicit base URL (overrides all other settings) | `https://api.yourdomain.com/banking/v1` |
| `PRODUCTION_API_URL` | Production environment URL | `https://api.prod.com/banking/v1` |
| `STAGING_API_URL` | Staging environment URL | `https://api-staging.com/banking/v1` |
| `NODE_ENV` | Environment mode | `development`, `staging`, `production` |
| `PORT` | Local development port | `3000` |
| `API_VERSION` | API version | `v1`, `v2` |

### URL Generation Logic

1. **Explicit Base URL**: If `BANKING_API_BASE_URL` is set, it takes precedence
2. **Environment-based**: URLs are generated based on `NODE_ENV`:
   - `development`: `http://localhost:{PORT}/api/{API_VERSION}`
   - `staging`: Uses `STAGING_API_URL` or default staging URL
   - `production`: Uses `PRODUCTION_API_URL` or default production URL
3. **Localhost Fallback**: Non-development environments include a localhost option for testing

## Usage Examples

### Docker Compose
```yaml
services:
  banking-assistant:
    environment:
      - BANKING_API_BASE_URL=http://banking-assistant:3000/api/v1
      - API_VERSION=v1
```

### Cloud Deployment
```bash
export BANKING_API_BASE_URL=https://your-cloud-url.com/banking/v1
export NODE_ENV=production
export API_VERSION=v1
```

### Local Development with Custom Configuration
```bash
export PORT=4000
export API_VERSION=v2
npm start
# OpenAPI spec will show: http://localhost:4000/api/v2
```

### Staging Environment
```bash
export NODE_ENV=staging
export STAGING_API_URL=https://api-staging.yourdomain.com/banking/v1
export API_VERSION=v1
npm start
```

## Accessing Dynamic OpenAPI Spec

- **JSON Format**: `GET /openapi.json`
- **Swagger UI**: `GET /api-docs`
- **Root Info**: `GET /` (includes endpoint overview)

The generated specification includes metadata:
- `x-generated-at`: Timestamp when the spec was generated
- `x-environment`: Current environment mode
- `x-api-version`: Current API version

## API Endpoints

All endpoints automatically use the dynamically configured base URL:

- Root Information: `GET /`
- Health Check: `GET {baseUrl}/health`
- Account Balance: `GET {baseUrl}/accounts/{accountId}/balance`
- Account Transactions: `GET {baseUrl}/accounts/{accountId}/transactions`

## API Versioning

The Banking Assistant API supports versioning through the `API_VERSION` environment variable:

```bash
# Use API v1 (default)
API_VERSION=v1

# Use API v2
API_VERSION=v2
```

This affects both the URL paths and the OpenAPI spec generation.

## Testing

Run the tests to verify dynamic URL generation:

```bash
npm test -- src/utils/openapi.test.js
```

## Integration with Banking Brokerage

When deploying both services, ensure consistent versioning:

```bash
# Banking Assistant
BANKING_API_BASE_URL=https://api.yourdomain.com/banking/v1
API_VERSION=v1

# Banking Brokerage  
BROKERAGE_API_BASE_URL=https://api.yourdomain.com/brokerage/v1
```
