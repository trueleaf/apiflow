FROM node:20-bookworm-slim AS build

ARG USE_NPM_MIRROR=false
ARG TARGETARCH

WORKDIR /app

COPY packages/website/package.json packages/website/package-lock.json ./packages/website/
RUN if [ "$USE_NPM_MIRROR" = "true" ]; then npm config set registry https://registry.npmmirror.com; fi

WORKDIR /app/packages/website
RUN npm ci --include=optional

# 根据目标架构安装对应的原生绑定（多架构构建时 npm ci 只装宿主机的）
RUN if [ "$TARGETARCH" = "amd64" ]; then \
      npm install --no-save @parcel/watcher-linux-x64-glibc @next/swc-linux-x64-gnu; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
      npm install --no-save @parcel/watcher-linux-arm64-glibc @next/swc-linux-arm64-gnu; \
    fi

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
