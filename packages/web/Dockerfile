# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy web package files
COPY packages/web/package.json ./packages/web/

# Install dependencies
RUN npm install

# Copy web source code
COPY packages/web ./packages/web

# Build the web application
WORKDIR /app/packages/web
RUN npm run build:web

# Production Stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
