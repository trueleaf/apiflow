# Build Stage
FROM node:20 AS builder

ARG USE_NPM_MIRROR=false
ENV USE_NPM_MIRROR=$USE_NPM_MIRROR

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy root scripts used by preinstall
COPY scripts ./scripts

# Copy workspace package files for npm workspaces resolution
COPY packages/*/package.json ./packages/*/

# Configure NPM registry based on USE_NPM_MIRROR environment variable
RUN node scripts/setup-npm-registry.js && npm config get registry

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
