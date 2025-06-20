FROM node:20

WORKDIR /app

# 1. 复制依赖定义
COPY packages/server/package*.json ./

# 2. 安装生产依赖（包含mongodb）
RUN npm ci --production

# 3. 复制应用代码
COPY packages/server .

EXPOSE 7004
CMD ["npm", "run", "server:start"]