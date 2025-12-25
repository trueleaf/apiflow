# Docker Hub publish (local)

This repo contains two Docker images:
- `apiflow-server` (Node server)
- `apiflow-web` (Nginx web)

The script uses:
- the Git SHA from the current repo (`git rev-parse --short=12 HEAD`)
- the version from each package's `package.json`
  - `packages/server/package.json`
  - `packages/web/package.json`

## Prerequisites
- Docker Desktop with Buildx enabled
- Logged in to Docker Hub (`docker login`)

## 构建原理与完整命令（中文说明）

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

## Run

```powershell
node scripts\publish-docker.js --user <DOCKERHUB_USER>
```

Optional flags:

```powershell
node scripts\publish-docker.js --user <DOCKERHUB_USER> --use-npm-mirror
```

## Tags produced

For each image:
- `latest`
- `v<package_version>`
- `<git_sha>`

Example:
- `docker.io/<USER>/apiflow-server:v1.0.0`
- `docker.io/<USER>/apiflow-server:abc123def456`
