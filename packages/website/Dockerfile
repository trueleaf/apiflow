FROM node:20-bookworm AS build

ARG USE_NPM_MIRROR=false

WORKDIR /app

COPY packages/website/package.json packages/website/package-lock.json ./packages/website/
RUN if [ "$USE_NPM_MIRROR" = "true" ]; then npm config set registry https://registry.npmmirror.com; fi

WORKDIR /app/packages/website
# 使用 npm install 替代 npm ci，确保可选依赖正确安装
RUN npm install --include=optional

COPY packages/website/ ./
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
