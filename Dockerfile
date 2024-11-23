# Stage 1: Build the React application
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:alpine

# Install pm2 globally
RUN apk add --no-cache nodejs npm

# Copy the built files from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start the application using Nginx
CMD ["nginx", "-g", "daemon off;"]