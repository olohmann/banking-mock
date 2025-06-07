# Project Structure

```
banking-mock/
├── README.md                          # Main project documentation
├── .gitignore                         # Git ignore patterns
├── dev.sh                            # Local development script
├── docker-compose.yml                # Local Docker Compose
├── docker-compose.prod.yml           # Production Docker Compose
│
├── docs/                             # Documentation
│   └── DEPLOYMENT.md                 # Azure deployment guide
│
├── scripts/                          # Deployment scripts
│   ├── deploy.sh                     # Complete deployment automation
│   ├── build-containers.sh           # Container build and push
│   └── destroy.sh                    # Resource cleanup
│
├── terraform/                        # Infrastructure as Code
│   ├── 01-infrastructure/            # Step 1: Base infrastructure
│   │   ├── main.tf                   # Resource Group + ACR
│   │   └── terraform.tfvars.example  # Configuration template
│   │
│   └── 03-container-apps/            # Step 3: Container Apps
│       ├── main.tf                   # Container Apps deployment
│       └── terraform.tfvars.example  # Configuration template
│
├── banking-assistant/                # Banking API service
│   ├── Dockerfile                    # Container definition
│   ├── package.json                  # Node.js dependencies
│   ├── README.md                     # Service documentation
│   │
│   ├── src/                          # Source code
│   │   ├── index.js                  # Application entry point
│   │   ├── config/                   # Configuration management
│   │   ├── middleware/               # Express middleware
│   │   ├── routes/                   # API route handlers
│   │   ├── schemas/                  # Zod validation schemas
│   │   └── services/                 # Business logic
│   │
│   └── docs/                         # API documentation
│       └── openapi.yaml              # OpenAPI 3.0 specification
│
└── banking-brokerage/                # Brokerage API service
    ├── Dockerfile                    # Container definition
    ├── package.json                  # Node.js dependencies
    ├── README.md                     # Service documentation
    │
    ├── src/                          # Source code
    │   ├── index.js                  # Application entry point
    │   ├── config/                   # Configuration management
    │   ├── middleware/               # Express middleware
    │   ├── routes/                   # API route handlers
    │   ├── schemas/                  # Zod validation schemas
    │   └── services/                 # Business logic
    │
    └── docs/                         # API documentation
        └── openapi.yaml              # OpenAPI 3.0 specification
```

## Deployment Architecture

### Step 1: Infrastructure (`terraform/01-infrastructure/`)
- **Azure Resource Group**: Container for all resources
- **Azure Container Registry**: Private registry for Docker images
- **Output**: Registry credentials and connection details

### Step 2: Container Build (`scripts/build-containers.sh`)
- **Docker Build**: Creates optimized Node.js containers
- **Image Push**: Uploads to Azure Container Registry
- **Multi-service**: Handles both banking-assistant and banking-brokerage

### Step 3: Container Apps (`terraform/03-container-apps/`)
- **Log Analytics Workspace**: Centralized logging and monitoring
- **Container App Environment**: Shared runtime environment
- **Container Apps**: Individual service deployments with:
  - Auto-scaling (1-3 replicas)
  - HTTPS endpoints with SSL certificates
  - Environment-specific configuration
  - Health checks and monitoring

## Service Architecture

Each service follows a consistent structure:

- **Entry Point** (`src/index.js`): Express server setup
- **Configuration** (`src/config/`): Environment-based config
- **Middleware** (`src/middleware/`): CORS, validation, error handling
- **Routes** (`src/routes/`): API endpoint definitions
- **Schemas** (`src/schemas/`): Zod validation schemas
- **Services** (`src/services/`): Business logic and mock data
- **Documentation** (`docs/openapi.yaml`): API specification

## Technology Stack

- **Runtime**: Node.js 20 LTS with ES modules
- **Framework**: Express.js with modern middleware
- **Validation**: Zod for type-safe input validation
- **Documentation**: OpenAPI 3.0 with Swagger UI
- **Testing**: Built-in Node.js test runner with c8 coverage
- **Containerization**: Docker with multi-stage builds
- **Infrastructure**: Terraform for reproducible deployments
- **Cloud Platform**: Azure Container Apps with auto-scaling
