# Banking Assistant Mock API

A modern Express-based mock banking API service built with Node.js 20 LTS and ECMAScript modules. This service provides RESTful endpoints for checking account balances and retrieving transaction history, with full OpenAPI 3.0 specification.

## Features

- 🏦 **Account Balance**: Get current balance for any account
- 📊 **Transaction History**: Retrieve paginated transaction history
- 📋 **OpenAPI 3.0**: Full API specification with Swagger UI
- ✨ **Mock Data**: Deterministic mock data generation
- 🔒 **Input Validation**: Zod-based request validation
- 🧪 **Testing**: Built-in Node.js test runner with coverage
- 🎯 **Modern Stack**: ES modules, async/await, Node.js 20 features

## Quick Start

### Prerequisites

- Node.js 20 LTS or higher
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

The API will be available at `http://localhost:3000`

### API Documentation

Visit `http://localhost:3000/api-docs` for interactive Swagger UI documentation.

## API Endpoints

### Health Check
```http
GET /api/v1/health
```

### Account Balance
```http
GET /api/v1/accounts/{accountId}/balance
```

**Example:**
```bash
curl http://localhost:3000/api/v1/accounts/ACC1234567890/balance
```

**Response:**
```json
{
  "accountId": "ACC1234567890",
  "balance": 15420.50,
  "currency": "USD",
  "lastUpdated": "2025-06-07T10:30:00.000Z"
}
```

### Account Transactions
```http
GET /api/v1/accounts/{accountId}/transactions?limit=10&offset=0
```

**Example:**
```bash
curl "http://localhost:3000/api/v1/accounts/ACC1234567890/transactions?limit=5&offset=0"
```

**Response:**
```json
{
  "accountId": "ACC1234567890",
  "transactions": [
    {
      "id": "TXN78900001",
      "accountId": "ACC1234567890",
      "amount": -67.23,
      "currency": "USD",
      "description": "Grocery Store",
      "type": "debit",
      "date": "2025-06-06T14:22:33.000Z",
      "balance": 15487.73
    }
  ],
  "pagination": {
    "limit": 5,
    "offset": 0,
    "total": 50
  }
}
```

## Mock Data

The service includes pre-configured mock accounts:

| Account ID      | Balance    | Currency |
|----------------|------------|----------|
| ACC1234567890  | $15,420.50 | USD      |
| ACC9876543210  | €8,750.25  | EUR      |
| ACC5555666677  | $125,000.00| USD      |
| ACC1111222233  | £2,500.75  | GBP      |

## Development

### Available Scripts

```bash
# Start development server with watch mode
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
src/
├── config/          # Configuration management
├── middleware/      # Express middleware
├── routes/          # API route handlers  
├── schemas/         # Zod validation schemas
├── services/        # Business logic and data services
└── index.js         # Application entry point
docs/
└── openapi.yaml     # OpenAPI 3.0 specification
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
PORT=3000
API_VERSION=v1
```

## Testing

The project uses Node.js built-in test runner:

```bash
# Run all tests
pnpm test

# Run tests with coverage report
pnpm test:coverage
```

### Test Examples

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getAccountBalance } from '../services/mockData.js';

describe('Mock Data Service', () => {
  it('should return balance for valid account', () => {
    const result = getAccountBalance('ACC1234567890');
    
    assert.strictEqual(result.accountId, 'ACC1234567890');
    assert.strictEqual(result.balance, 15420.50);
    assert.strictEqual(result.currency, 'USD');
  });
});
```

## Input Validation

All endpoints use Zod schemas for robust input validation:

```javascript
import { z } from 'zod';

export const accountIdSchema = z
  .string()
  .regex(/^[A-Z0-9]{10,20}$/, 'Account ID must be 10-20 alphanumeric characters');
```

## Error Handling

The API provides consistent error responses:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "accountId",
      "message": "Account ID must be 10-20 alphanumeric characters"
    }
  ]
}
```

## OpenAPI Specification

The complete API specification is available in multiple formats:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **JSON**: `http://localhost:3000/openapi.json`
- **YAML**: `docs/openapi.yaml`

## Code Quality

The project enforces code quality through:

- **ESLint**: Airbnb JavaScript style guide
- **Prettier**: Consistent code formatting
- **Zod**: Runtime type validation
- **Node.js Test Runner**: Built-in testing with coverage

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the code style
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

---

Built with ❤️ using modern Node.js and Express
