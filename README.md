<div align="center">

![logo](https://images.gitee.com/uploads/images/2021/0331/214909_4f34bc9b_1230427.png)

# Apiflow

### A Free, AI-Powered API Development Platform
### A Modern Open-Source Alternative to Postman, Hoppscotch & Insomnia

**Local-First · AI Agents · Team Collaboration · OpenAPI-First**


🚀 [Download](https://github.com/trueleaf/apiflow/releases) ·
✨ [Online Demo](https://apiflow.cn)
<!-- 📖 [Documentation](https://www.yuque.com/apiflow) · -->

</div>

---
## 🖥️ Preview



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

### 🚀Code Update

If you are running Apiflow with Docker, updating the code does not require rebuilding locally.

Simply pull the latest images and restart the services:

```bash
docker compose pull
docker compose up -d
```

## 📜 License

This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for details.