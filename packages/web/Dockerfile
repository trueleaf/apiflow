FROM node:20-bookworm-slim AS build

ARG USE_NPM_MIRROR=false
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /app

COPY packages/web/package.json ./packages/web/
RUN if [ "$USE_NPM_MIRROR" = "true" ]; then npm config set registry https://registry.npmmirror.com; fi

WORKDIR /app/packages/web
RUN npm install --include=optional

COPY packages/web/ ./
RUN npm run build:web

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/packages/web/dist/web/ /usr/share/nginx/html/
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
