# Build Stage
FROM node:20-alpine AS builder

ARG USE_NPM_MIRROR=false
ENV USE_NPM_MIRROR=$USE_NPM_MIRROR

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy root scripts used by preinstall
COPY scripts ./scripts

# Copy server package files
COPY packages/server/package.json ./packages/server/

# Debug: Show environment variable
RUN echo "USE_NPM_MIRROR is set to: $USE_NPM_MIRROR"

# Install dependencies
RUN npm install

# Copy server source code
COPY packages/server ./packages/server

# Build the server application
WORKDIR /app/packages/server
RUN npm run build

# Production Stage
FROM node:20-alpine

ARG USE_NPM_MIRROR=false
ENV USE_NPM_MIRROR=$USE_NPM_MIRROR

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy root scripts used by preinstall
COPY scripts ./scripts

# Copy server package files
COPY packages/server/package.json ./packages/server/

# Debug: Show environment variable
RUN echo "USE_NPM_MIRROR is set to: $USE_NPM_MIRROR"

# Install production dependencies only
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/bootstrap.js ./packages/server/
COPY --from=builder /app/packages/server/public ./packages/server/public

WORKDIR /app/packages/server

# Set production env var so we don't need cross-env at runtime
ENV NODE_ENV=production

# Expose port
EXPOSE 7001

# Start the application
CMD ["npm", "start"]
