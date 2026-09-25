# Apiflow 源码构建与升级部署文档

> 适用场景：官方 Docker 镜像版本滞后于 Release 时，从源码自行构建镜像并升级线上部署。
> 本文档基于 `v0.9.51` + 导入功能修复（`fix/import-children-creator` 分支）编写。

## 一、背景说明

- 官方镜像（`xiaoxiaoshu/apiflow-*`，Docker Hub）停留在 v0.9.5（2026-08-17），v0.9.51（2026-08-31）未推送镜像。
- v0.9.5 → v0.9.51 之间 **server / website 无任何代码改动**，只有 web（前端）有 3 个提交。
- 本仓库在 v0.9.51 基础上额外修复了一个导入缺陷（嵌套文件夹内的文档 creator 为空导致导入报错，issue #44 未修完整），修复在分支 `fix/import-children-creator`，仅改动 web 前端一个文件。

## 二、构建环境要求

- Docker 20.10+（含 buildx）
- Git
- 磁盘空间 ≥ 5GB
- 如服务器在国内网络环境，构建命令中加 `--build-arg USE_NPM_MIRROR=true`（使用 npmmirror 源）

## 三、获取源码

```bash
git clone https://github.com/trueleaf/apiflow.git
cd apiflow
git checkout fix/import-children-creator   # = v0.9.51 + 导入修复
```

## 四、构建镜像

**在仓库根目录执行**（Dockerfile 的构建上下文是仓库根目录，不是各子包目录）：

```bash
docker build -t xiaoxiaoshu/apiflow-server:latest \
  -f packages/server/Dockerfile . --build-arg USE_NPM_MIRROR=true

docker build -t xiaoxiaoshu/apiflow-website:latest \
  -f packages/website/Dockerfile . --build-arg USE_NPM_MIRROR=true

docker build -t xiaoxiaoshu/apiflow-web:latest \
  -f packages/web/Dockerfile . --build-arg USE_NPM_MIRROR=true
```

镜像名必须保持 `xiaoxiaoshu/apiflow-*:latest` 不变，`docker-compose.yml` 会直接引用。

参考构建耗时：server / website / web 各约 1 分钟内（有缓存时更快）。

### 关于 Mongo 镜像（重要）

**不要重建、不要替换 `xiaoxiaoshu/apiflow-mongo:6` 镜像，也不要删除 `mongo_data` 数据卷。**
线上数据都在该卷里。Mongo 镜像内容就是官方 `mongo:6`，无需任何变更，compose 启动时会复用已有镜像和卷。

## 五、线上升级步骤

前置条件：线上已有官方镜像部署（含 `docker-compose.yml`、`.env`、`mongo_data` 卷）。

### 1. 备份（必做）

```bash
# 备份 Mongo 数据（在部署目录执行）
docker compose exec mongo mongodump \
  --username "$MONGO_ROOT_USERNAME" --password "$MONGO_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --archive=/data/db/backup_$(date +%Y%m%d).archive --gzip
docker compose cp mongo:/data/db/backup_$(date +%Y%m%d).archive ./backup_$(date +%Y%m%d).archive
```

### 2. 检查 .env

确认 `.env` 中的 `MONGO_ROOT_USERNAME` / `MONGO_ROOT_PASSWORD` 与**首次部署时一致**。
Mongo 的账号密码只在数据卷首次初始化时生效，改 `.env` 里的密码会导致认证失败、服务起不来。

### 3. 替换镜像并重启

将第四步构建好的三个镜像导入线上机器（`docker save` / `docker load`，或推到内部 registry 后改 compose 里的镜像名），然后：

```bash
docker compose down
docker compose up -d
```

**禁止执行** `docker compose pull` 或 `./update.sh`——它们会从 Docker Hub 拉取旧的官方 latest，覆盖掉本地构建的镜像。

### 4. 验证

```bash
# 容器健康状态
docker compose ps        # mongo / server 应为 healthy

# API 健康检查
curl http://localhost/api/health
# 期望返回: {"code":0,"msg":"操作成功","data":{"status":"ok"}}

# 前端版本：浏览器访问后，页面源码/bundle 中版本号应为 0.9.51
```

功能验证：登录后进入项目，导入带 tags 的 OpenAPI 3.0 文档（嵌套文件夹结构），应能导入成功（issue #44 场景）。

## 六、回滚

```bash
docker compose down
docker compose pull        # 拉回官方镜像（v0.9.5）
docker compose up -d
```

数据卷不受镜像切换影响，回滚不会丢数据。

## 七、常见问题

| 现象 | 原因 | 处理 |
|------|------|------|
| mongo 容器 unhealthy，日志报 `Authentication failed: storedKey mismatch` | `.env` 的 Mongo 密码与数据卷初始化时不一致 | 改回首次部署时的密码 |
| 升级后页面功能/版本仍是旧的 | 浏览器缓存了旧前端 | 硬刷新（Cmd/Ctrl+Shift+R）或无痕窗口 |
| 镜像被覆盖回旧版 | 执行了 `docker compose pull` / `update.sh` | 重新执行第四节构建命令 |
| 导入报 `docs[0].children[0].info.creator 不允许为空` | web 镜像不是 `fix/import-children-creator` 分支构建的 | 确认源码分支后重新构建 web 镜像 |
| 导入报 `item.url.prefix 不被允许` | web 镜像是旧版修复（只改了 creator），未包含 prefix→host 改名 | 拉取最新 `fix/import-children-creator` 分支重新构建 web 镜像 |
| 打开项目报"内部错误"，每次都弹 | 之前失败的导入在浏览器 IndexedDB 残留了无效标签页，旧服务端对非法文档 id 直接抛 500 | 用最新分支重建 **server + web** 镜像；新服务端返回业务错误 4001，前端会提示"当前接口不存在"并允许一键关闭标签。临时处理：清除该站点的网站数据后重新登录 |

## 八、后续

官方补推 v0.9.51+ 镜像、并合并导入修复后，可恢复官方更新流程（`./update.sh`）。届时留意 https://github.com/trueleaf/apiflow/issues/44 的进展。
