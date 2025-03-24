#!/bin/bash
# Set the environment to production
export NODE_ENV=production
# Azure login
az login
# ACR login
az acr login --name protravka
# Get the version from package.json with npm
version=$(npm run --silent get-version)
# Output version to the console
echo "Deploying version $version"
# Tag the Docker image
docker tag protravka-web protravka.azurecr.io/protravka-web:$version
# Push the Docker image to the registry
docker push protravka.azurecr.io/protravka-web:$version
# Redeploy the application
az containerapp update --name protravka-web --resource-group protravka --image protravka.azurecr.io/protravka-web:$version