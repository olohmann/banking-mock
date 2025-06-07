# Banking Mock Services - Azure Deployment

This directory contains Docker and Azure deployment configurations for the Banking Mock Services project.

## Project Structure

```
banking-mock/
├── banking-assistant/          # Banking API mock service
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── banking-brokerage/          # Brokerage API mock service
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── deploy.sh                   # Azure deployment script
├── deploy.env.example          # Configuration template
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production deployment
└── DEPLOYMENT.md              # This file
```

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed and configured
- [Docker](https://docs.docker.com/get-docker/) installed and running
- Active Azure subscription
- Appropriate permissions to create resources in Azure

## Quick Start

### 1. Local Development

Run both services locally using Docker Compose:

```bash
# Build and start services
docker-compose up --build

# Access the services
# Banking Assistant: http://localhost:3001
# Banking Brokerage: http://localhost:3002

# Stop services
docker-compose down
```

### 2. Azure Deployment

#### Step 1: Login to Azure
```bash
az login
```

#### Step 2: Configure Deployment (Optional)
```bash
# Copy configuration template
cp deploy.env.example deploy.env

# Edit configuration values
nano deploy.env
```

#### Step 3: Deploy to Azure
```bash
# Make script executable (if not already)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
1. Create Azure Resource Group
2. Create Azure Container Registry (ACR)
3. Build and push Docker images to ACR
4. Deploy containers to Azure Container Instances (ACI)
5. Display service URLs

## Configuration

### Environment Variables

The deployment script uses the following configuration (edit `deploy.env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `AZURE_RESOURCE_GROUP` | Azure resource group name | `rg-banking-mock` |
| `AZURE_LOCATION` | Azure region | `eastus` |
| `ACR_NAME_PREFIX` | Container registry name prefix | `acrbankingmock` |
| `BANKING_ASSISTANT_PORT` | Banking assistant service port | `3001` |
| `BANKING_BROKERAGE_PORT` | Banking brokerage service port | `3002` |
| `CONTAINER_CPU` | Container CPU allocation | `1` |
| `CONTAINER_MEMORY` | Container memory allocation (GB) | `1` |

### Docker Configuration

Each service uses:
- **Base Image**: `node:20-alpine` (secure, minimal)
- **Package Manager**: `pnpm` (fast, efficient)
- **Security**: Non-root user execution
- **Health Checks**: Built-in health monitoring
- **Multi-stage**: Optimized for production

## Service Endpoints

After deployment, services will be available at:

- **Banking Assistant API**: `http://{assistant-fqdn}:3001`
- **Banking Brokerage API**: `http://{brokerage-fqdn}:3002`

### API Documentation

Swagger UI is available at:
- **Banking Assistant**: `http://{assistant-fqdn}:3001/api-docs`
- **Banking Brokerage**: `http://{brokerage-fqdn}:3002/api-docs`

## Monitoring and Management

### Container Health

Health checks are configured for both services:
- **Endpoint**: `/api/health`
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Retries**: 3

### Viewing Logs

```bash
# View container logs
az container logs --resource-group rg-banking-mock --name ci-banking-assistant
az container logs --resource-group rg-banking-mock --name ci-banking-brokerage

# Follow logs in real-time
az container logs --resource-group rg-banking-mock --name ci-banking-assistant --follow
```

### Container Status

```bash
# Check container status
az container show --resource-group rg-banking-mock --name ci-banking-assistant --output table
az container show --resource-group rg-banking-mock --name ci-banking-brokerage --output table
```

## Scaling and Updates

### Updating Services

1. Build new images locally or update code
2. Re-run the deployment script:
   ```bash
   ./deploy.sh
   ```

### Manual Image Updates

```bash
# Build and push updated image
docker build -t {acr-name}.azurecr.io/banking-assistant:latest ./banking-assistant/
docker push {acr-name}.azurecr.io/banking-assistant:latest

# Restart container with updated image
az container restart --resource-group rg-banking-mock --name ci-banking-assistant
```

## Security Considerations

- **Container Security**: Services run as non-root users
- **Network Security**: Only necessary ports are exposed
- **Registry Security**: ACR uses admin credentials (consider using managed identity in production)
- **Environment Isolation**: Production environment variables are configured

## Cost Optimization

- **Container Resources**: Configured for minimal resource usage
- **Image Size**: Alpine-based images for smaller footprint
- **Auto-scaling**: Consider Azure Container Apps for auto-scaling needs

## Troubleshooting

### Common Issues

1. **Docker Build Fails**
   ```bash
   # Clear Docker cache
   docker system prune -a
   ```

2. **ACR Login Issues**
   ```bash
   # Re-authenticate with ACR
   az acr login --name {acr-name}
   ```

3. **Container Won't Start**
   ```bash
   # Check container logs
   az container logs --resource-group rg-banking-mock --name ci-banking-assistant
   ```

4. **Port Conflicts**
   - Ensure ports 3001 and 3002 are available
   - Modify ports in configuration if needed

### Support Commands

```bash
# List all resources in resource group
az resource list --resource-group rg-banking-mock --output table

# Delete all resources (cleanup)
az group delete --name rg-banking-mock --yes --no-wait

# Check Azure CLI version
az --version

# Check Docker version
docker --version
```

## Production Considerations

For production deployments, consider:

1. **Azure Container Apps** instead of Container Instances for better scaling
2. **Azure Key Vault** for secrets management
3. **Azure Application Gateway** for load balancing and SSL termination
4. **Azure Monitor** for comprehensive monitoring and alerting
5. **Managed Identity** instead of ACR admin credentials
6. **Private networking** with Azure Virtual Networks

## License

This deployment configuration is part of the Banking Mock Services project and follows the same license terms.
