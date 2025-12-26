# Docker 发布与部署

## Docker 部署

**要求**：**Docker** 和 **Docker Compose**

### 通用准备

```bash
# 克隆仓库
git clone https://gitee.com/wildsell/apiflow.git
cd apiflow

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 MongoDB 账号密码 !!!强烈建议修改默认密码
```

### 方案一：使用国内源（推荐）

```bash
# 拉取镜像（国内源）
docker compose -f docker-compose.yml -f docker-compose.cn.yml pull

# 启动全部服务（国内源）
docker compose -f docker-compose.yml -f docker-compose.cn.yml up -d

# 查看容器日志（stdout）
docker compose -f docker-compose.yml -f docker-compose.cn.yml logs -f server

# 查看文件日志（容器内 /app/logs，已持久化）
docker compose -f docker-compose.yml -f docker-compose.cn.yml exec server ls /app/logs
docker compose -f docker-compose.yml -f docker-compose.cn.yml exec server tail -f /app/logs/*.log

# 停止服务
docker compose -f docker-compose.yml -f docker-compose.cn.yml down
```

### 方案二：使用 Docker Hub

```bash
# 拉取镜像
docker compose pull

# 启动全部服务
docker compose up -d

# 查看容器日志（stdout）
docker compose logs -f server

# 查看文件日志（容器内 /app/logs，已持久化）
docker compose exec server ls /app/logs
docker compose exec server tail -f /app/logs/*.log

# 停止服务
docker compose down
```

**环境变量配置** (`.env` 文件)：

```bash
MONGO_ROOT_USERNAME=admin              # MongoDB 管理员用户名
MONGO_ROOT_PASSWORD=your_password      # MongoDB 管理员密码（请修改为强密码）
MONGO_DATABASE=apiflow                 # 数据库名称
```

服务可访问于：
- **Web UI**: http://localhost
- **API Server**: http://localhost:7001
- **MongoDB**: 仅 Docker 内部网络可访问（不对外暴露）

日志说明：
- 文件日志目录：`/app/logs`（docker-compose 已挂载为 `server_logs`）
- 轮转策略：按天轮转、单文件 100MB、保留 14 天

## Docker Hub 发布（本地）

本仓库包含两个 Docker 镜像：
- `apiflow-server`（Node server）
- `apiflow-web`（Nginx web）

脚本使用：
- 当前仓库的 Git SHA（`git rev-parse --short=12 HEAD`）
- 各包的版本号：
  - `packages/server/package.json`
  - `packages/web/package.json`

### 前置条件
- Docker Desktop 且 Buildx 已启用
- 已登录 Docker Hub（`docker login`）

### 构建原理与完整命令

脚本的工作流程如下：
1. 从 `packages/server/package.json` 与 `packages/web/package.json` 读取版本号。
2. 使用 `git rev-parse --short=12 HEAD` 生成当前提交的短 SHA。
3. 调用 `docker buildx build` 分别构建 `server` 与 `web` 两个镜像，并推送到 Docker Hub。
4. 每个镜像会打三个标签：`latest`、`v<package_version>`、`<git_sha>`，便于版本追踪与回滚。

镜像构建细节：
- `server` 与 `web` 使用各自的 Dockerfile 构建。
- Dockerfile 采用 lock 文件 + `npm ci`，保证依赖可复现。
- `server` 在构建完成后会 `npm prune --omit=dev`，仅保留生产依赖。
- 脚本默认构建多架构镜像（`linux/amd64,linux/arm64`）。

等价的完整命令如下（示例以 `DOCKERHUB_USER=yourname` 为例）：

```powershell
# 生成版本与 SHA
$SERVER_VERSION = (Get-Content packages\server\package.json | ConvertFrom-Json).version
$WEB_VERSION = (Get-Content packages\web\package.json | ConvertFrom-Json).version
$GIT_SHA = (git rev-parse --short=12 HEAD).Trim()

# 构建并推送 server
docker buildx build -f packages/server/Dockerfile `
  -t yourname/apiflow-server:latest `
  -t yourname/apiflow-server:v$SERVER_VERSION `
  -t yourname/apiflow-server:$GIT_SHA `
  --platform linux/amd64,linux/arm64 `
  --push .

# 构建并推送 web
docker buildx build -f packages/web/Dockerfile `
  -t yourname/apiflow-web:latest `
  -t yourname/apiflow-web:v$WEB_VERSION `
  -t yourname/apiflow-web:$GIT_SHA `
  --platform linux/amd64,linux/arm64 `
  --push .
```

### 运行脚本

```powershell
node scripts\publish-docker.js --user <DOCKERHUB_USER>
```

可选参数：

```powershell
node scripts\publish-docker.js --user <DOCKERHUB_USER> --use-npm-mirror
```

### 生成的标签

每个镜像包含：
- `latest`
- `v<package_version>`
- `<git_sha>`

示例：
- `docker.io/<USER>/apiflow-server:v1.0.0`
- `docker.io/<USER>/apiflow-server:abc123def456`

---

# Docker Publish and Deployment

## Docker Deployment

**Requirements**: **Docker** and **Docker Compose**

### Common preparation

```bash
# Clone the repo
git clone https://gitee.com/wildsell/apiflow.git
cd apiflow

# Configure environment variables
cp .env.example .env
# Edit .env and set the MongoDB credentials (strongly recommended)
```

### Option 1: China mirror (recommended)

```bash
# Pull images (China mirror)
docker compose -f docker-compose.yml -f docker-compose.cn.yml pull

# Start all services (China mirror)
docker compose -f docker-compose.yml -f docker-compose.cn.yml up -d

# View container logs (stdout)
docker compose -f docker-compose.yml -f docker-compose.cn.yml logs -f server

# View file logs (inside container /app/logs, persisted)
docker compose -f docker-compose.yml -f docker-compose.cn.yml exec server ls /app/logs
docker compose -f docker-compose.yml -f docker-compose.cn.yml exec server tail -f /app/logs/*.log

# Stop services
docker compose -f docker-compose.yml -f docker-compose.cn.yml down
```

### Option 2: Docker Hub

```bash
# Pull images
docker compose pull

# Start all services
docker compose up -d

# View container logs (stdout)
docker compose logs -f server

# View file logs (inside container /app/logs, persisted)
docker compose exec server ls /app/logs
docker compose exec server tail -f /app/logs/*.log

# Stop services
docker compose down
```

**Environment variables** (`.env` file):

```bash
MONGO_ROOT_USERNAME=admin              # MongoDB admin username
MONGO_ROOT_PASSWORD=your_password      # MongoDB admin password (use a strong one)
MONGO_DATABASE=apiflow                 # Database name
```

Services available at:
- **Web UI**: http://localhost
- **API Server**: http://localhost:7001
- **MongoDB**: internal Docker network only (not exposed)

Logs:
- File log directory: `/app/logs` (mounted as `server_logs` by docker-compose)
- Rotation policy: daily rotation, 100MB per file, keep 14 days

## Docker Hub Publish (Local)

This repo contains two Docker images:
- `apiflow-server` (Node server)
- `apiflow-web` (Nginx web)

The script uses:
- the Git SHA from the current repo (`git rev-parse --short=12 HEAD`)
- the version from each package:
  - `packages/server/package.json`
  - `packages/web/package.json`

### Prerequisites
- Docker Desktop with Buildx enabled
- Logged in to Docker Hub (`docker login`)

### Build flow and full commands

The script flow:
1. Read versions from `packages/server/package.json` and `packages/web/package.json`.
2. Generate the short SHA with `git rev-parse --short=12 HEAD`.
3. Run `docker buildx build` to build and push the `server` and `web` images.
4. Tag each image with `latest`, `v<package_version>`, and `<git_sha>` for tracking and rollback.

Build details:
- `server` and `web` each use their own Dockerfile.
- Dockerfiles use lock files + `npm ci` for reproducible installs.
- `server` runs `npm prune --omit=dev` after build to keep prod deps only.
- The script builds multi-arch images by default (`linux/amd64,linux/arm64`).

Equivalent commands (example `DOCKERHUB_USER=yourname`):

```powershell
# Generate versions and SHA
$SERVER_VERSION = (Get-Content packages\server\package.json | ConvertFrom-Json).version
$WEB_VERSION = (Get-Content packages\web\package.json | ConvertFrom-Json).version
$GIT_SHA = (git rev-parse --short=12 HEAD).Trim()

# Build and push server
docker buildx build -f packages/server/Dockerfile `
  -t yourname/apiflow-server:latest `
  -t yourname/apiflow-server:v$SERVER_VERSION `
  -t yourname/apiflow-server:$GIT_SHA `
  --platform linux/amd64,linux/arm64 `
  --push .

# Build and push web
docker buildx build -f packages/web/Dockerfile `
  -t yourname/apiflow-web:latest `
  -t yourname/apiflow-web:v$WEB_VERSION `
  -t yourname/apiflow-web:$GIT_SHA `
  --platform linux/amd64,linux/arm64 `
  --push .
```

### Run

```powershell
node scripts\publish-docker.js --user <DOCKERHUB_USER>
```

Optional flags:

```powershell
node scripts\publish-docker.js --user <DOCKERHUB_USER> --use-npm-mirror
```

### Tags produced

For each image:
- `latest`
- `v<package_version>`
- `<git_sha>`

Example:
- `docker.io/<USER>/apiflow-server:v1.0.0`
- `docker.io/<USER>/apiflow-server:abc123def456`
