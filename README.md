# Banking Mock Services

A comprehensive suite of mock banking and brokerage API services built with modern Node.js architecture. This project provides realistic financial service endpoints for development, testing, and demonstration purposes.

## 🏗️ Architecture

This monorepo contains two distinct microservices:

- **`banking-assistant/`** - Core banking operations (balances, transactions)
- **`banking-brokerage/`** - Investment and brokerage account management

Both services are built with:
- **Node.js 20 LTS** with ES modules
- **Express.js** for REST API framework
- **Zod** for input validation
- **OpenAPI 3.0** specification with Swagger UI
- **Built-in testing** with `node:test` runner
- **Docker** containerization for cloud deployment

## 🚀 Quick Start

### Prerequisites

- **Node.js 20 LTS** or higher
- **pnpm** package manager (recommended)
- **Docker** (optional, for containerized deployment)

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd banking-mock

# Install dependencies for both services
cd banking-assistant && pnpm install && cd ..
cd banking-brokerage && pnpm install && cd ..

# Start both services in development mode
./dev.sh
```

### Docker Compose (Recommended)

```bash
# Start all services with Docker Compose
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## 📊 Services Overview

### Banking Assistant API
**Port**: 3001 (Docker) / 3000 (Local)  
**Base URL**: `http://localhost:3001/api/v1`  
**Documentation**: `http://localhost:3001/api-docs`

**Key Features**:
- Account balance inquiry
- Transaction history with pagination
- Multiple account types support
- Deterministic mock data generation

**Example Usage**:
```bash
# Get account balance
curl http://localhost:3001/api/v1/accounts/12345/balance

# Get transaction history
curl "http://localhost:3001/api/v1/accounts/12345/transactions?limit=10&offset=0"
```

### Banking Brokerage API
**Port**: 3002 (Docker) / 3000 (Local)  
**Base URL**: `http://localhost:3002/api/v1`  
**Documentation**: `http://localhost:3002/api-docs`

**Key Features**:
- Brokerage account creation and management
- Multiple account types (Individual, Joint, IRA, Roth IRA, Business)
- Account filtering and pagination
- Investment account status tracking

**Example Usage**:
```bash
# Create brokerage account
curl -X POST http://localhost:3002/api/v1/brokerage/accounts \
  -H "Content-Type: application/json" \
  -d '{"accountType": "individual", "customerName": "John Doe"}'

# List brokerage accounts
curl "http://localhost:3002/api/v1/brokerage/accounts?limit=10&offset=0"
```

## 🛠️ Development

### Project Structure

```
banking-mock/
├── banking-assistant/          # Core banking API service
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── services/          # Business logic and mock data
│   │   └── middleware/        # Express middleware
│   └── docs/openapi.yaml      # OpenAPI specification
├── banking-brokerage/          # Brokerage API service
│   ├── src/                   # Same structure as banking-assistant
│   └── docs/openapi.yaml      # OpenAPI specification
├── docker-compose.yml         # Local development setup
├── docker-compose.prod.yml    # Production deployment
├── deploy.sh                  # Azure deployment script
└── dev.sh                     # Local development helper
```

### Testing

Run tests for individual services:

```bash
# Banking Assistant tests
cd banking-assistant
pnpm test
pnpm test:coverage

# Banking Brokerage tests  
cd banking-brokerage
pnpm test
pnpm test:coverage
```

### Code Quality

Both services follow strict code quality standards:

```bash
# Linting (per service)
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
```

## 🌐 API Documentation

Each service provides comprehensive OpenAPI 3.0 documentation:

- **Banking Assistant**: http://localhost:3001/api-docs
- **Banking Brokerage**: http://localhost:3002/api-docs

The documentation includes:
- Interactive API explorer
- Request/response schemas
- Example payloads
- Authentication details
- Error response formats

## 🐳 Deployment

### Docker Compose (Development)

```bash
# Start all services
docker compose up -d

# Scale specific service
docker compose up -d --scale banking-assistant=2

# View service logs
docker compose logs banking-assistant
```

### Azure Container Instances (Production)

The project includes automated Azure deployment:

```bash
# Configure deployment variables
cp deploy.env.example deploy.env
# Edit deploy.env with your Azure settings

# Deploy to Azure
./deploy.sh
```

**Azure Resources Created**:
- Azure Container Registry (ACR)
- Azure Container Instances (ACI)
- Resource Group with networking
- Load balancing and health checks

### Environment Variables

Key configuration options:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Service port | `3000` |
| `LOG_LEVEL` | Logging verbosity | `info` |

## 🧪 Mock Data

Both services generate deterministic mock data:

- **Consistent responses** for the same input parameters
- **Realistic financial data** patterns
- **Configurable data sets** for different test scenarios
- **Pagination support** for large datasets

### Banking Assistant Mock Data
- Multiple account types (checking, savings, credit)
- Transaction categories (payments, deposits, transfers)
- Realistic balance calculations
- Date-based transaction filtering

### Banking Brokerage Mock Data
- Investment account types
- Account status lifecycle
- Customer profile variations
- Regulatory compliance flags

## 🔧 Configuration

### Development Setup

```bash
# Banking Assistant
cd banking-assistant
cp .env.example .env

# Banking Brokerage  
cd banking-brokerage
cp .env.example .env
```

### Production Configuration

Use environment variables or Docker secrets for production:

```yaml
# docker-compose.prod.yml example
environment:
  - NODE_ENV=production
  - PORT=3000
  - LOG_LEVEL=warn
```

## 📈 Monitoring & Health

Both services include health check endpoints:

```bash
# Service health
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health

# Docker health checks (automatic)
docker compose ps
```

Health check responses include:
- Service status
- Uptime information
- Memory usage
- Response time metrics

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Follow** the coding standards (ESLint + Prettier)
4. **Add tests** for new functionality
5. **Update** documentation as needed
6. **Submit** a pull request

### Code Standards

- **ES modules** only (`import`/`export`)
- **Node.js 20** features and APIs
- **Async/await** patterns (no callbacks)
- **Zod validation** for all inputs
- **JSDoc** for all exported functions
- **2-space indentation**, single quotes
- **Comprehensive testing** with `node:test`

## 📋 API Reference

### Common Response Formats

**Success Response**:
```json
{
  "success": true,
  "data": { /* response payload */ },
  "timestamp": "2025-06-07T10:30:00Z"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid account ID format",
    "details": { /* validation details */ }
  },
  "timestamp": "2025-06-07T10:30:00Z"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `404` | Resource not found |
| `500` | Internal server error |

## 📄 License

MIT License - see [individual service README files](./banking-assistant/README.md) for details.

## 📞 Support

For questions or issues:
1. Check the [service-specific documentation](./banking-assistant/README.md)
2. Review the OpenAPI specifications
3. Open an issue in this repository

---

**Built with ❤️ using modern Node.js and cloud-native practices**
