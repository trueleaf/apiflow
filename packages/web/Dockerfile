# 构建阶段
FROM node:22 AS builder

WORKDIR /app
COPY packages/web/package*.json ./
RUN npm ci

COPY packages/web .
RUN npm run web:build

# 生产阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]