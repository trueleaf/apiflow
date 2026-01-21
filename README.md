<div align="center">

![logo](./docs/logo.jpg)

# Apiflow

### A Free, AI-Powered API Tool like Postman

[中文](./README_CN.md) | English

[![GitHub Release](https://img.shields.io/github/v/release/trueleaf/apiflow?style=flat-square)](https://github.com/trueleaf/apiflow/releases/latest)
[![License](https://img.shields.io/github/license/trueleaf/apiflow)](https://github.com/trueleaf/apiflow/blob/master/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/trueleaf/apiflow/total)](https://github.com/trueleaf/apiflow/releases/latest)

[Download](https://github.com/trueleaf/apiflow/releases)  | [Online Demo](https://apiflow.cn/)


<!-- 🚀 [Download](https://github.com/trueleaf/apiflow/releases) ·
✨ [Online Demo](https://apiflow.cn) -->
<!-- 📖 [Documentation](https://www.yuque.com/apiflow) · -->

</div>

---
## 🖥️ Preview

### AI Agent
![AI Agent](./docs/en/agent.gif)

### Server-Sent Events (SSE)
![SSE](./docs/en/sse.gif)

---
## 🚀 What is Apiflow?

**Apiflow** is a **completely free**, **AI-powered API development platform** designed as a modern alternative to **Postman**, **Hoppscotch**, and **Insomnia**.

It supports **API testing**, **mocking**, **WebSocket**, **AI agents**, **team collaboration**, **offline usage**, and **local deployment** — while fully embracing the **OpenAPI 3.0 ecosystem**.

---

## ✨ Key Features

### ✅ 100% Free
- All features are free to use
- No paid plans, no feature limits

### 🤖 AI Agent Built-In
- Built-in AI Agent for API design, testing and debugging
- Configure your own Large Language Model
- Works in offline or intranet environments

### 👥 Team Collaboration

- Built-in team and workspace management
- **Unlimited teams and members**
- Fine-grained permission control:
  - Project-level permissions
  - Role-based access control (RBAC)
  - Read / write / admin roles
- Operation history and change tracking
- Designed for teams of any size

### 📴 Offline & Online

- Local-first by design, online when you need it
- Full offline capability with local persistence
- Bidirectional conversion between offline and online data
- Smooth transition from personal usage to team collaboration
- Ideal for private networks and restricted environments


### 🏠 Self-Hosted & Local Deployment
- One-click Docker deployment
- Data fully controlled by yourself
- Suitable for enterprises and private networks

### 🔄 OpenAPI Friendly
- Import & export **OpenAPI 3.x**
- Seamlessly migrate data to:
  - Postman
  - Insomnia
  - Hoppscotch
  - Any OpenAPI-compatible tool

---

## 🧩 Core Capabilities

- HTTP API testing (RESTful)
- WebSocket testing
- Mock Server (HTTP / WebSocket / SSE)
- Environment & variable system
- Pre-request & post-request scripts
- Project & folder management
- Import / Export (Postman, OpenAPI, JSON)
- Internationalization (EN / ZH / JA)

---



## ⬇️ Download

Download the latest version for your platform:

| Platform | Download |
|---------|----------|
| 🪟 Windows | https://github.com/trueleaf/apiflow/releases |
| 🍎 macOS | https://github.com/trueleaf/apiflow/releases |
| 🐧 Linux | https://github.com/trueleaf/apiflow/releases |


---

## 🐳 Local Deployment (Docker)

### Requirements
- Docker
- Docker Compose

### First Deployment

```bash
git clone https://github.com/trueleaf/apiflow
cd apiflow

cp .env.example .env
# edit .env to configure MongoDB credentials

docker compose pull
docker compose up -d

# Verify deployment
curl http://localhost  
curl http://localhost/api/health 
```

### 🚀 Code Update

If you are running Apiflow with Docker, updating the code does not require rebuilding locally.

**Option 1: Using Update Script (Recommended)**

```bash
# Make scripts executable (first time only)
chmod +x update.sh rollback.sh

# Run update
./update.sh

# For China mirror
./update.sh --cn
```

**Option 2: Manual Update**

```bash
docker compose pull
docker compose down
docker compose up -d
```

**Rollback to Previous Version**

```bash
./rollback.sh v1.2.3
```

For more details, see [README_DEPLOY.md](./README_DEPLOY.md).

---

## 💻 Local Development

### Prerequisites
- **Node.js**: >= 20.0.0
- **MongoDB**: Running locally or accessible remotely
- **Git**: For cloning the repository

### Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/trueleaf/apiflow.git
cd apiflow
```

2. **Install dependencies**

```bash
npm install
```

This will install dependencies for both `packages/web` and `packages/server`.

3. **Configure environment variables**

Create or edit configuration files in `packages/server/src/config/` as needed.

4. **Start development servers**

```bash
npm run dev
```

This command will start both the frontend and backend servers concurrently:
- **Frontend (Web)**: http://localhost:4000
- **Backend (Server)**: http://localhost:7001

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run dev:web` | Start only the frontend |
| `npm run web:dev` | Start only the frontend (alternative) |
| `npm run server:dev` | Start only the backend |
| `npm run web:build` | Build the web application |
| `npm run server:build` | Build the server application |
| `npm run server:test` | Run server unit tests |
| `npm run bootstrap` | Install all dependencies |

### Project Structure

This is a multi-package monorepo:

- `packages/web` - Frontend application (Vite + Vue 3 + Electron)
- `packages/server` - Backend application (Midway.js + MongoDB)
- `packages/website` - Marketing website (Next.js)

### Development Tips

- Ensure MongoDB is running before starting the server
- The frontend supports hot module replacement (HMR) for fast development
- Backend auto-restarts when files change
- You can develop packages independently by running their specific dev commands

## 📜 License

This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for details.
