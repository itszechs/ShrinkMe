# Base image
FROM node:16-alpine as base

# Set working directory
WORKDIR /app

ENV NODE_ENV=production

# Stage for building the React app
FROM base as build-frontend

# Copy frontend code to the container
COPY frontend .

# Install frontend dependencies
RUN npm install

# Build the React app
RUN npm run build

# Stage for building the backend app
FROM base as build-backend

# Copy backend code to the container
COPY backend .

# Install backend dependencies
RUN npm install

# Final image with Nginx and Node.js
FROM nginx:alpine

# Install Node.js in the final image
RUN apk add --no-cache nodejs npm

# Remove default Nginx configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy Nginx configuration file to container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app to the container
COPY --from=build-frontend /app /app/frontend

# Copy the backend code to the container
COPY --from=build-backend /app /app/backend

RUN npm install serve -g

# Copy the startup script to the container
COPY startup.sh /app

# Make the script executable
RUN chmod +x /app/startup.sh

# Start Nginx and backend with the startup script
CMD ["/app/startup.sh"]
