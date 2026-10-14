<div align="center">

![logo](./docs/logo.jpg)

# Apiflow

Postman / Apifox 开源替代方案

[English](./README.md) | 中文

[![GitHub Release](https://img.shields.io/github/v/release/trueleaf/apiflow?style=flat-square)](https://github.com/trueleaf/apiflow/releases/latest)
[![License](https://img.shields.io/github/license/trueleaf/apiflow)](https://github.com/trueleaf/apiflow/blob/master/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/trueleaf/apiflow/total)](https://github.com/trueleaf/apiflow/releases/latest)

[下载](https://github.com/trueleaf/apiflow/releases) | [在线演Demo](https://apiflow.cn/)


</div>

---

# 界面预览

## Agent展示
![AI 代理](./docs/zh/agent_zh.gif)

## SSE与MOCK展示
![SSE](./docs/zh/sse_zh.gif)

---

# Apiflow 是什么？

**Apiflow** 是一个 **完全免费**、**内置 AI 能力** 的 API 接口工具，致力于成为**Postman、Apifox 的现代化开源替代方案**。

它集成了 **API 测试、Mock、WebSocket、AI Agent、团队协作、离线使用、本地部署** 等能力，并全面拥抱 **OpenAPI 3.0 生态体系**。

---

# 核心特性

## 完全免费
- 所有功能永久免费
- 无付费计划
- 无功能限制
- 一键导出到postman、apifox等工具

## 内置 AI Agent
- 内置 AI Agent，辅助 API 设计、测试与调试
- 支持配置你自己的大语言模型（LLM）
- 支持 **离线 / 内网环境** 使用

## 团队协作
- 内置团队与工作区管理
- **团队数量、成员数量不限**
- 细粒度权限控制：
  - 项目级权限
  - 基于角色的权限管理（RBAC）
  - 只读 / 编辑 / 管理员角色
- 操作记录与变更历史追踪
- 适用于任何规模的团队

## 离线 & 在线
- Local-First 设计理念
- 完整离线能力，本地数据持久化
- 离线 / 在线数据双向转换
- 从个人使用平滑过渡到团队协作
- 非常适合内网或受限网络环境

## 自托管 & 本地部署
- Docker 一键部署
- 数据完全由自己掌控
- 适用于企业私有化部署场景

## OpenAPI 友好
- 支持 **OpenAPI 3.x** 导入 / 导出
- 将已完成的 JSON、文本和空 HTTP 响应保存为命名示例，保留状态码与响应类型
- 离线 OpenAPI 导出包含同一状态码下的多条响应示例
- 导入 OpenAPI 文档时保留文件夹分组与 URL 前缀
- 可无缝迁移到：
  - Postman
  - Insomnia
  - Hoppscotch
  - 任意 OpenAPI 兼容工具

---

# 核心能力一览

- HTTP API 测试（RESTful）
- WebSocket 测试
- Mock Server（HTTP / WebSocket / SSE）
- 环境变量与变量系统
- 请求前 / 请求后脚本
- 项目与文件夹管理
- 导入 / 导出（Postman / OpenAPI / JSON）
- 国际化支持（英文 / 中文 / 日文）

---

# 下载

获取适用于你平台的最新版本：

| 平台 | 下载地址 |
|------|----------|
| Windows | https://github.com/trueleaf/apiflow/releases |
| macOS | https://github.com/trueleaf/apiflow/releases |
| Linux | https://github.com/trueleaf/apiflow/releases |

从 v0.9.82 起，桌面客户端使用 Tauri 与 Rust。由旧 Electron 客户端升级时，请先在“设置 → 本地数据 → 数据备份/导出”中备份本地数据，再安装新版并恢复备份。本次升级请直接下载安装包；新版使用带签名的 Tauri 更新源。

---

# 本地部署

## 服务端部署

### Docker 部署

#### 环境要求
- Docker
- Docker Compose

#### 首次部署

```bash
git clone https://gitee.com/wildsell/apiflow
cd apiflow

cp .env.example .env
# 编辑 .env，配置 MongoDB 等参数

docker compose -f docker-compose.yml -f docker-compose.cn.yml pull
docker compose -f docker-compose.yml -f docker-compose.cn.yml up -d

# 验证部署
curl http://localhost
curl http://localhost/api/health
```

#### 部署后添加用户

部署成功后,按照以下步骤添加用户:

1. **切换到互联网模式**
   - 点击应用中的网络模式切换按钮(通常在右上角)
   - 选择"互联网模式"以启用在线功能

2. **登录管理员账号**
   - 账号: `admin`
   - 默认密码: `111111`
   - **重要提示**: 首次登录后请立即修改默认密码以确保安全

3. **添加新用户**
   - 进入后台管理系统
   - 找到用户管理模块
   - 点击"添加用户"为团队成员创建新账号

#### 代码更新

如果你是通过 Docker 运行 Apiflow，更新代码时无需在本地重新构建。

**方式一：使用更新脚本（推荐）**

```bash
# 添加执行权限（首次）
chmod +x update.sh rollback.sh

# 执行更新
./update.sh --cn
```

**方式二：手动更新**

```bash
docker compose -f docker-compose.yml -f docker-compose.cn.yml down
docker compose -f docker-compose.yml -f docker-compose.cn.yml pull
docker compose -f docker-compose.yml -f docker-compose.cn.yml up -d
```

**回滚（推荐使用快照精确回滚）**

```bash
# 方式一：回滚到最近一次 update.sh 备份的快照（推荐）
./rollback.sh --previous

# 方式二：回滚到指定快照文件（推荐）
./rollback.sh --file current_versions_20260122_120000.txt

# 方式三：兼容模式，按 tag/sha 回滚（不保证精确，适合紧急）
./rollback.sh v1.2.3
# ./rollback.sh 7f3a2b1c4d5e

# 中国镜像源配置（如需）
./rollback.sh --previous --cn
```

### 阿里云部署(2026-01-22更新)

#### 购买服务器
![阿里云购买](./docs/aliyun/aliyun_buy.gif)


直接在服务器运行以下命令,完成后浏览器通过ip直接访问。注意：mongodb密码需要你自行修改
```bash
#添加Docker软件包源
sudo wget -O /etc/yum.repos.d/docker-ce.repo http://mirrors.cloud.aliyuncs.com/docker-ce/linux/centos/docker-ce.repo
sudo sed -i 's|https://mirrors.aliyun.com|http://mirrors.cloud.aliyuncs.com|g' /etc/yum.repos.d/docker-ce.repo
#Alibaba Cloud Linux3专用的dnf源兼容插件
sudo dnf -y install dnf-plugin-releasever-adapter --repo alinux3-plus
#安装Docker社区版本，容器运行时containerd.io，以及Docker构建和Compose插件
sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

#启动Docker
sudo systemctl start docker
#设置Docker守护进程在系统启动时自动启动
sudo systemctl enable docker

yum install -y git
git clone https://gitee.com/wildsell/apiflow.git
cd apiflow
cat > .env << 'EOF'
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=9sf9383jm8dpqbxxaaxs
MONGO_DATABASE=apiflow
EOF

docker compose -f docker-compose.yml -f docker-compose.cn.yml pull
docker compose -f docker-compose.yml -f docker-compose.cn.yml up -d
curl -i localhost
```
![阿里云部署](./docs/aliyun/aliyun_linux.gif)

#### 环境要求
- 2核心2G内存

## 客户端构建
通过docker部署后你可以直接通过浏览器访问系统，如果你希望使用完整功能，可以按照以下步骤进行构建：


### 环境要求
- **Node.js**: >= 22.12.0
- **Rust**：>= 1.85，并安装目标平台的原生编译工具链
- **macOS**：需安装 Xcode Command Line Tools（`xcode-select --install`）
- **Linux**：需安装 WebKitGTK 4.1、AppIndicator、OpenSSL 开发包、`patchelf`、`fakeroot` 和 `dpkg`
- Windows / macOS / Linux 安装包只能在对应平台上构建（不支持跨平台交叉编译）

#### 第一步：切换下载源（可选）


如需使用 npm 镜像，编辑项目根目录的 `.npmrc` 文件，取消 registry 一行的注释：
```properties
registry=https://registry.npmmirror.com
```
#### 第二步：克隆代码仓库并安装依赖

```bash
git clone https://gitee.com/wildsell/apiflow.git
cd apiflow
npm install
```


#### 第三步：修改配置（按需调整）

编辑 `packages/web/src/config/config.ts`，根据实际情况修改以下配置项：

```typescript
// 修改后端服务地址（默认指向官方服务器，自部署时改为自己的服务器地址）
httpRequest: {
  url: isDev ? 'http://127.0.0.1:7001' : 'https://your-server.example.com',
  // ...
},
```

> **说明：** 打包完成后，上述配置也可在应用内的 **设置 → 应用配置 → 接口调用地址** 中随时修改，无需重新打包。

#### 第四步：执行打包命令

根据目标平台选择对应命令：

```bash
# Windows
npm run web:build:local:win

# macOS
npm run web:build:local:mac

# Linux
npm run web:build:local:linux

# 仅构建原生程序（不生成安装包）
npm run web:build:local:pack

# Microsoft Store MSIX（需要 Windows SDK）
npm run web:build:local:win:store
```

> **提示（Windows）**：构建 MSIX 需要 Windows SDK；商店包会包含官方 WebView2 固定版运行时。

### 打包命令

| 命令 | 说明 |
|------|------|
| `npm run web:build:local:pack` | 仅构建 Tauri 原生程序，不生成安装包 |
| `npm run web:build:local:win` | 构建 Windows NSIS `.exe` 和 MSI `.msi` 安装包 |
| `npm run web:build:local:win:store` | 构建 Microsoft Store `.msix` 包 |
| `npm run web:build:local:mac` | 在 macOS 构建 macOS 安装包 |
| `npm run web:build:local:linux` | 在 Linux 构建 Linux 安装包 |

### 输出目录

Tauri 安装包位于 `packages/web/src-tauri/target/release/bundle/`，Microsoft Store 包位于 `packages/web/release/`。

发布标签前，在仓库配置密钥 `TAURI_SIGNING_PRIVATE_KEY` 和变量 `TAURI_UPDATER_PUBLIC_KEY`；私钥设置了密码时，再配置 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。标签须为 `v` 加 `packages/web/package.json` 中的版本号。`.github/workflows/build-tauri.yml` 会生成签名的更新元数据和草稿 Release 产物；生成的 MSIX 仍需单独提交到 Partner Center。

发布流程修复后需要重新构建已有标签时，从 `main` 分支运行 **Build Tauri**，将 `release_tag` 填为目标标签（例如 `v0.9.82`）。所有验证与打包任务都会检出该标签对应的代码。

---

# 本地开发

## 环境要求
- **Node.js**: >= 22.12.0
- **MongoDB**: 本地运行或远程可访问
- **Git**: 用于克隆代码仓库

## 快速开始


1. **将下载源切换为国内镜像（可选）**


如需使用 npm 镜像，编辑项目根目录的 `.npmrc` 文件，取消 registry 一行的注释：
```properties

registry=https://registry.npmmirror.com
```


2. **克隆代码仓库并安装依赖**

```bash
git clone https://gitee.com/wildsell/apiflow.git
cd apiflow
npm install
```


2. **启动开发服务器**

```bash
npm run dev
```

此命令会同时启动前端和后端开发服务器：
- **前端 (Tauri)**：桌面应用内访问 http://localhost:4000
- **后端 (Server)**: http://localhost:7001

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动前端和后端开发服务器 |
| `npm run dev:web` | 仅启动浏览器版前端 |
| `npm run web:dev` | 启动 Tauri 桌面前端 |
| `npm run server:dev` | 仅启动后端开发服务器 |
| `npm run web:build` | 构建 Web 应用 |
| `npm run server:build` | 构建 Server 应用 |
| `npm run server:test` | 运行后端单元测试 |
| `npm run bootstrap` | 安装所有依赖 |

## 项目结构

这是一个多包项目（monorepo）：

- `packages/web` - Web 与 Tauri 桌面应用（Vite + Vue 3 + Rust）
- `packages/server` - 后端应用（Midway.js + MongoDB）
- `packages/website` - 官网（Next.js）

## 开发提示

- 启动 Server 前请确保 MongoDB 已运行
- 前端支持热模块替换（HMR），可快速开发调试
- 后端文件变更时会自动重启
- 可以通过运行特定命令独立开发各个包

---

# 许可证

本项目采用 **MIT** 许可证进行许可

详情请参阅 [LICENSE](./LICENSE)
