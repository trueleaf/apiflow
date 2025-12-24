FROM node:20-alpine AS build

ARG USE_NPM_MIRROR=false

WORKDIR /app

COPY packages/server/package.json ./packages/server/
RUN if [ "$USE_NPM_MIRROR" = "true" ]; then npm config set registry https://registry.npmmirror.com; fi

WORKDIR /app/packages/server
RUN npm install

COPY packages/server/ ./
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/packages/server/package.json ./
COPY --from=build /app/packages/server/node_modules ./node_modules
COPY --from=build /app/packages/server/dist ./dist
COPY --from=build /app/packages/server/public ./public
COPY --from=build /app/packages/server/bootstrap.js ./bootstrap.js

EXPOSE 7001
CMD ["node", "./bootstrap.js"]
