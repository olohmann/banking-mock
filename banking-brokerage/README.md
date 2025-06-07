# Banking Brokerage Mock API

A comprehensive mock API service for brokerage account management and investment operations, built with modern Node.js and Express.

## Features

- 🏦 **Brokerage Account Management**: Create and manage investment accounts
- 📊 **Multiple Account Types**: Individual, Joint, IRA, Roth IRA, and Business accounts
- 🔍 **Advanced Filtering**: Filter accounts by status, type, and pagination
- 📚 **OpenAPI 3.0 Documentation**: Interactive API documentation with Swagger UI
- ✅ **Input Validation**: Comprehensive request validation with Zod schemas
- 🧪 **Built-in Testing**: Native Node.js test runner with coverage reports
- 🚀 **Modern Architecture**: ES modules, async/await, and cloud-ready design

## Quick Start

### Prerequisites

- Node.js 20 LTS or higher
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env

# Start development server
pnpm dev
```

The API will be available at:
- **API Base URL**: http://localhost:3001/api/v1
- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## API Endpoints

### Brokerage Account Management

#### Create Brokerage Account
```http
POST /api/v1/brokerage/accounts
```

**Request Body:**
```json
{
  "userId": "USER1234",
  "accountType": "individual",
  "initialDeposit": 5000,
  "tradingPermissions": ["stocks", "options"],
  "riskTolerance": "moderate"
}
```

**Response:**
```json
{
  "accountId": "BRK1A2B3C4D5",
  "userId": "USER1234",
  "accountType": "individual",
  "status": "pending",
  "balance": 5000,
  "availableBalance": 5000,
  "currency": "USD",
  "tradingPermissions": ["stocks", "options"],
  "riskTolerance": "moderate",
  "createdAt": "2025-06-07T10:30:00.000Z",
  "lastActivity": "2025-06-07T10:30:00.000Z"
}
```

#### List User's Brokerage Accounts
```http
GET /api/v1/brokerage/users/{userId}/accounts
```

**Query Parameters:**
- `limit` (optional): Number of accounts to return (1-50, default: 10)
- `offset` (optional): Number of accounts to skip (default: 0)
- `status` (optional): Filter by status (`pending`, `active`, `suspended`, `closed`)
- `accountType` (optional): Filter by type (`individual`, `joint`, `ira`, `roth_ira`, `business`)

**Example:**
```http
GET /api/v1/brokerage/users/USER1234/accounts?limit=5&status=active
```

#### Get Brokerage Account Details
```http
GET /api/v1/brokerage/accounts/{accountId}
```

**Example:**
```http
GET /api/v1/brokerage/accounts/BRK1A2B3C4D5
```

## Account Types

- **`individual`**: Personal investment account
- **`joint`**: Shared account between multiple parties
- **`ira`**: Traditional Individual Retirement Account
- **`roth_ira`**: Roth Individual Retirement Account
- **`business`**: Corporate investment account

## Trading Permissions

- **`stocks`**: Equity trading
- **`options`**: Options contracts
- **`crypto`**: Cryptocurrency trading
- **`forex`**: Foreign exchange trading

## Risk Tolerance Levels

- **`conservative`**: Low-risk investment strategy
- **`moderate`**: Balanced risk approach
- **`aggressive`**: High-risk, high-reward strategy

## Development

### Available Scripts

```bash
# Start development server with hot reload
pnpm dev

# Start production server
pnpm start

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Project Structure

```
banking-brokerage/
├── docs/
│   └── openapi.yaml          # OpenAPI 3.0 specification
├── src/
│   ├── config/
│   │   └── index.js          # Application configuration
│   ├── middleware/
│   │   └── index.js          # Express middleware
│   ├── routes/
│   │   └── brokerage.js      # Brokerage API routes
│   ├── schemas/
│   │   ├── index.js          # Zod validation schemas
│   │   └── index.test.js     # Schema tests
│   ├── services/
│   │   ├── mockData.js       # Mock data service
│   │   └── mockData.test.js  # Service tests
│   └── index.js              # Application entry point
├── .env.example              # Environment template
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

### Testing

The project uses Node.js built-in test runner with comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Run tests with coverage report
pnpm test:coverage
```

Test files are co-located with source files using the `*.test.js` pattern.

### Validation

All API endpoints use Zod schemas for robust input validation:

- **Request Parameters**: Path and query parameter validation
- **Request Bodies**: JSON payload validation with detailed error messages
- **Response Schemas**: Consistent response structure validation

### Mock Data

The service includes realistic mock data for development and testing:

- Pre-populated sample accounts for different users
- Realistic account balances and activity timestamps
- Support for all account types and trading permissions

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running. The documentation includes:

- Complete endpoint reference
- Request/response schemas
- Interactive testing interface
- Example requests and responses

## Error Handling

The API provides consistent error responses:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "userId",
      "message": "User ID must be 8-16 alphanumeric characters"
    }
  ]
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Cloud Deployment

The service is designed for cloud deployment with:

- Stateless architecture
- Environment-based configuration
- Health check endpoints
- Structured logging
- Graceful shutdown handling

## Contributing

1. Follow the established code style (Airbnb ESLint rules + Prettier)
2. Write tests for new functionality
3. Update API documentation for endpoint changes
4. Ensure all tests pass before submitting

## License

MIT License - see LICENSE file for details.
