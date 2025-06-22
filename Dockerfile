# 阶段1: 构建Web应用
FROM node:22 AS web-builder

WORKDIR /app
COPY package*.json ./
COPY packages/web/package.json ./packages/web/

# 安装Web依赖
RUN npm install --prefix packages/web

# 构建Web应用
COPY packages/web ./packages/web
RUN npm run web:build --prefix packages/web

# 阶段2: 构建Server应用
FROM node:22 AS server-builder

WORKDIR /app
COPY --from=web-builder /app/packages/web/dist ./packages/web/dist

# 单独拷贝server的package.json以提高缓存利用率
COPY packages/server/package*.json ./packages/server/
RUN npm install --prefix packages/server

# 拷贝所有文件并构建Server
COPY packages/server ./packages/server
RUN npm run build --prefix packages/server

# 阶段3: 生产运行环境
FROM node:22

# 设置生产环境变量
ENV NODE_ENV=production
ENV MIDWAY_SERVER_PORT=7004

WORKDIR /app

# 安装生产依赖
COPY --from=server-builder /app/packages/server/package*.json ./packages/server/
RUN npm install --omit=dev --prefix packages/server

# 拷贝构建产物
COPY --from=server-builder /app/packages/server/dist ./packages/server/dist
COPY --from=server-builder /app/packages/web/dist ./packages/server/public

# 设置工作目录到server并暴露端口
WORKDIR /app/packages/server
EXPOSE 7004

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:7004/ || exit 1

# 启动命令
CMD ["npm", "run", "server:start"]