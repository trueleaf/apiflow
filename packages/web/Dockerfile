# Build Stage
FROM node:20 AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy web package files
COPY packages/web/package.json ./packages/web/

# Install dependencies (skip electron binary download, keep dev deps for build)
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
# Use npm ci for reproducible installs and include optional deps for platform-specific native modules
RUN npm ci

# Copy web source code
COPY packages/web ./packages/web

# Build the web application
WORKDIR /app/packages/web
RUN npm run build:web

# Production Stage
FROM nginx:alpine

# Copy built files from builder (Vite outputs web build to dist/web)
COPY --from=builder /app/packages/web/dist/web /usr/share/nginx/html

# Copy nginx configuration
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
