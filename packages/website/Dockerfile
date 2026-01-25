FROM node:20-bookworm-slim AS build

ARG USE_NPM_MIRROR=false

WORKDIR /app

# 安装构建工具用于编译 native 依赖
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY packages/website/package.json packages/website/package-lock.json ./packages/website/
RUN if [ "$USE_NPM_MIRROR" = "true" ]; then npm config set registry https://registry.npmmirror.com; fi

WORKDIR /app/packages/website
RUN npm ci --include=optional

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
