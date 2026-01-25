FROM node:20-bookworm-slim AS build

ARG USE_NPM_MIRROR=false
ARG TARGETARCH

WORKDIR /app

# 安装构建工具用于编译 native 依赖
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY packages/website/package.json packages/website/package-lock.json ./packages/website/
RUN if [ "$USE_NPM_MIRROR" = "true" ]; then npm config set registry https://registry.npmmirror.com; fi

WORKDIR /app/packages/website
RUN npm ci --include=optional

# 根据目标平台强制安装 @parcel/watcher 绑定  
RUN if [ "$TARGETARCH" = "amd64" ] || [ -z "$TARGETARCH" ]; then \
      echo "安装 Linux x64 glibc @parcel/watcher 绑定..." && \
      npm install --force @parcel/watcher-linux-x64-glibc; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
      echo "安装 Linux ARM64 glibc @parcel/watcher 绑定..." && \
      npm install --force @parcel/watcher-linux-arm64-glibc; \
    else \
      echo "警告: 未知架构 $TARGETARCH"; \
    fi

# 调试：查看实际安装的 @parcel/watcher bindings
RUN echo "===== 检查 @parcel/watcher 相关文件 =====" && \
    ls -la node_modules/@parcel/ || echo "没有 @parcel 目录" && \
    find node_modules -name "*watcher*" -type d || echo "没有找到 watcher 相关目录"

COPY packages/website/ ./

ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=build /app/packages/website/.next/standalone ./
COPY --from=build /app/packages/website/.next/static ./.next/static
COPY --from=build /app/packages/website/public ./public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", "server.js"]
