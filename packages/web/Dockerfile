FROM node:20-bookworm-slim AS build

ARG USE_NPM_MIRROR=false
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

WORKDIR /app

COPY packages/web/package.json packages/web/package-lock.json ./packages/web/
COPY packages/web/tsconfig*.json packages/web/vite.config.ts ./packages/web/
RUN if [ "$USE_NPM_MIRROR" = "true" ]; then npm config set registry https://registry.npmmirror.com; fi

WORKDIR /app/packages/web
RUN npm ci --include=optional --legacy-peer-deps

# 根据目标平台强制安装 rolldown 绑定
# Docker buildx 会为每个平台单独构建，TARGETARCH 会自动设置
ARG TARGETARCH
RUN if [ "$TARGETARCH" = "amd64" ]; then \
      echo "安装 Linux x64 rolldown 绑定..." && \
      npm install --force @rolldown/binding-linux-x64-gnu; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
      echo "安装 Linux ARM64 rolldown 绑定..." && \
      npm install --force @rolldown/binding-linux-arm64-gnu; \
    else \
      echo "警告: 未知架构 $TARGETARCH"; \
    fi

COPY packages/web/ ./
RUN npm run build:web

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/packages/web/dist/web/ /usr/share/nginx/html/
COPY packages/web/nginx.conf /etc/nginx/templates/nginx.official.conf
COPY packages/web/nginx.user.conf /etc/nginx/templates/nginx.user.conf

RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'if [ "$DEPLOYMENT_TYPE" = "official" ]; then' >> /docker-entrypoint.sh && \
    echo '  cp /etc/nginx/templates/nginx.official.conf /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'else' >> /docker-entrypoint.sh && \
    echo '  cp /etc/nginx/templates/nginx.user.conf /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 80
CMD ["/docker-entrypoint.sh"]
