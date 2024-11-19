#!/bin/bash

# Azure login
az login

# ACR login
az acr login --name avimate

# Get the version from package.json with npm
version=$(npm run --silent get-version)

# Output version to the console
echo "Deploying version $version"

# Tag the Docker image
docker tag avimate-web avimate.azurecr.io/avimate-web:$version

# Push the Docker image to the registry
docker push avimate.azurecr.io/avimate-web:$version

# Redeploy the application
az containerapp update --name avimate-web --resource-group avimate --image avimate.azurecr.io/avimate-web:$version