# Azure Deployment Guide

This guide covers the complete deployment process for Banking Mock Services to Azure Container Apps using Terraform.

## Overview

The deployment process consists of 3 steps:

1. **Infrastructure Setup** - Deploy Azure Resource Group and Container Registry
2. **Container Build** - Build and push Docker images to Azure Container Registry
3. **Container Apps Deployment** - Deploy applications with HTTPS endpoints

## Prerequisites

Before starting the deployment, ensure you have:

- **Azure CLI** installed and configured (`az login`)
- **Terraform** v1.0+ installed
- **Docker** installed and running
- **Node.js 20 LTS** (for local development)
- **pnpm** package manager

## Quick Start

### Automated Deployment (Recommended)

```bash
# Run the complete deployment process
./scripts/deploy.sh

# Deploy with specific image tag
IMAGE_TAG=v1.2.3 ./scripts/deploy.sh
```

This script will:
- Validate prerequisites
- Deploy infrastructure
- Build and push containers
- Deploy Container Apps
- Display HTTPS endpoints

### Manual Step-by-Step Deployment

#### Step 1: Infrastructure Setup

```bash
# Navigate to infrastructure directory
cd terraform/01-infrastructure

# Copy and customize variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your preferred values

# Deploy infrastructure
terraform init
terraform plan
terraform apply
```

#### Step 2: Build and Push Containers

```bash
# Return to project root
cd ../..

# Build and push containers
./scripts/build-containers.sh
```

#### Step 3: Deploy Container Apps

```bash
# Navigate to container apps directory
cd terraform/03-container-apps

# Copy and customize variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars to match your infrastructure

# Deploy container apps
terraform init
terraform plan
terraform apply
```

## Configuration

### Infrastructure Variables (`terraform/01-infrastructure/terraform.tfvars`)

```hcl
resource_group_name = "rg-banking-mock-dev"
location           = "East US"
acr_name          = "acrbankingmockdev"

tags = {
  Environment = "development"
  Project     = "banking-mock"
  Owner       = "your-team"
}
```

### Container Apps Variables (`terraform/03-container-apps/terraform.tfvars`)

```hcl
resource_group_name           = "rg-banking-mock-dev"
acr_name                     = "acrbankingmockdev"
container_app_environment_name = "cae-banking-mock-dev"
image_tag                    = "latest"
```

## Environment Variables

The deployment scripts support the following environment variables:

- `ACR_NAME` - Azure Container Registry name (auto-detected)
- `RESOURCE_GROUP` - Resource Group name (auto-detected)  
- `IMAGE_TAG` - Docker image tag (default: `latest`)

The `IMAGE_TAG` variable is supported by:
- `./scripts/build-containers.sh` - Tags and pushes Docker images
- `./scripts/deploy.sh` - Full deployment with specified image tag
- `./scripts/update-containers.sh` - Updates existing deployment with new image

Example with custom image tag:
```bash
IMAGE_TAG=v1.2.3 ./scripts/build-containers.sh
```

### Updating Existing Deployment

If you already have a deployment and want to update the containers with a new image:

```bash
# Update containers with new image tag
IMAGE_TAG=v1.2.4 ./scripts/update-containers.sh
```

This script will:
- Build and push new containers with the specified tag
- Update Container Apps to use the new images
- Skip infrastructure deployment (faster for code updates)

## Service Endpoints

After successful deployment, the services will be available at:

- **Banking Assistant**: `https://<unique-id>.eastus.azurecontainerapps.io`
- **Banking Brokerage**: `https://<unique-id>.eastus.azurecontainerapps.io`

### API Documentation

Each service provides OpenAPI documentation:

- Banking Assistant: `https://<endpoint>/api-docs`
- Banking Brokerage: `https://<endpoint>/api-docs`

## Monitoring and Logs

### Azure Portal

1. Navigate to your Resource Group in the Azure Portal
2. Select the Container App Environment
3. View logs in the Log Analytics workspace

### Azure CLI

```bash
# View container app logs
az containerapp logs show \
  --name ca-banking-assistant \
  --resource-group rg-banking-mock-dev

az containerapp logs show \
  --name ca-banking-brokerage \
  --resource-group rg-banking-mock-dev
```

## Scaling Configuration

The Container Apps are configured with auto-scaling:

- **Min replicas**: 1
- **Max replicas**: 3
- **CPU**: 0.25 cores per container
- **Memory**: 0.5Gi per container

To modify scaling settings, edit the `azurerm_container_app` resources in `terraform/03-container-apps/main.tf`.

## Troubleshooting

### Common Issues

1. **ACR Login Failed**
   ```bash
   az acr login --name <your-acr-name>
   ```

2. **Docker Build Failed**
   - Ensure Docker daemon is running
   - Check Dockerfile syntax in service directories

3. **Terraform State Conflicts**
   ```bash
   # If needed, import existing resources
   terraform import azurerm_resource_group.main /subscriptions/<sub-id>/resourceGroups/<rg-name>
   ```

4. **Container App Not Starting**
   - Check environment variables in Terraform configuration
   - Verify image exists in ACR
   - Review container logs in Azure Portal

### Debug Commands

```bash
# Check Terraform outputs
cd terraform/01-infrastructure && terraform output
cd terraform/03-container-apps && terraform output

# Verify container images
az acr repository list --name <acr-name>

# Check container app status
az containerapp list --resource-group <rg-name> --output table
```

## Cleanup

To destroy all resources:

```bash
# Automated cleanup
./scripts/destroy.sh

# Manual cleanup (in reverse order)
cd terraform/03-container-apps && terraform destroy
cd terraform/01-infrastructure && terraform destroy
```

## Security Considerations

- **HTTPS Only**: All endpoints use HTTPS with automatic SSL certificates
- **ACR Integration**: Private container registry with admin authentication
- **Network Security**: Container Apps communicate over private network
- **Resource Isolation**: Each service runs in isolated containers

## Cost Optimization

- **Auto-scaling**: Scales down to 1 replica during low usage
- **Shared Environment**: Both apps share the same Container App Environment
- **Basic ACR Tier**: Uses Basic tier for development workloads

For production, consider:
- Upgrading ACR to Standard/Premium for geo-replication
- Implementing Azure Key Vault for secrets management
- Adding Application Insights for detailed monitoring
