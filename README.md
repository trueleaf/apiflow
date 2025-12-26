<div align="center">

![logo](https://images.gitee.com/uploads/images/2021/0331/214909_4f34bc9b_1230427.png "Screenshot.png")

# Apiflow

### Free, Local-First, AI-Powered API Development Platform with Team Collaboration — Like Postman, But Smarter

[中文](./README_CN.md) | English

[![GitHub Release](https://img.shields.io/github/v/release/trueleaf/apiflow?style=flat-square)](https://github.com/trueleaf/apiflow/releases/latest)
[![License](https://img.shields.io/github/license/trueleaf/apiflow)](https://github.com/trueleaf/apiflow/blob/master/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/trueleaf/apiflow/total)](https://github.com/trueleaf/apiflow/releases/latest)

[Download](https://github.com/trueleaf/apiflow/releases) | [Documentation](https://www.yuque.com/apiflow) | [Online Demo](https://online.jobtool.cn/)

</div>

## ✨ Features

- 🚀 **HTTP API Testing** - Support all HTTP methods (GET/POST/PUT/DELETE etc.), RESTful style, multiple body types
- 🔌 **WebSocket Testing** - Full WebSocket connection management and message handling
- 🤖 **AI Assistant** - Built-in AI chat with OpenAI-compatible API support
- 🎭 **Mock Server** - Built-in HTTP/WebSocket/SSE Mock server with conditional scripts
- 🔐 **Variable System** - Four-scope variables (Session/Local/Environment/Global), `{{variableName}}` syntax
- 📦 **Offline Mode** - Fully local operation with IndexedDB storage, no server required
- 🌍 **Internationalization** - Support for Simplified Chinese, Traditional Chinese, English, Japanese
- ⌨️ **Shortcuts** - Customizable keyboard shortcuts
- 🔄 **Auto Update** - Built-in auto-update functionality

## Preview

![Screenshot](https://images.gitee.com/uploads/images/2021/0331/215000_bc4b9025_1230427.png "Screenshot.png")

![Screenshot](https://images.gitee.com/uploads/images/2021/0331/215030_fcc9272e_1230427.png "Screenshot.png")

![Screenshot](https://images.gitee.com/uploads/images/2021/0331/215051_83e16797_1230427.png "Screenshot.png")

## Quick Start

### Download & Install

Go to [Releases](https://github.com/trueleaf/apiflow/releases) to download the installer for your system:

- **Windows**: `.exe` installer
- **macOS**: `.dmg` installer
- **Linux**: `.AppImage` or `.deb` package

### Development

Requirements: **Node.js >= 20.0.0**

```bash
# Clone the repository
git clone https://github.com/trueleaf/apiflow
cd apiflow

# Install dependencies
npm install

# Start development mode
cd packages/web
npm run dev

# Build client
npm run build:app:win    # Windows
npm run build:app:mac    # macOS
npm run build:app:linux  # Linux
```

### Docker Deployment

Requirements: **Docker** and **Docker Compose**

```bash
# Clone the repository
git clone https://github.com/trueleaf/apiflow
cd apiflow

# Configure environment variables
cp .env.example .env
# Edit .env file to set MongoDB credentials

# Use Docker Hub images (default)
# server: xiaoxiaoshu/apiflow-server:latest
# web: xiaoxiaoshu/apiflow-web:latest

# Pull images
docker compose pull

# Start all services with Docker Compose
docker compose up -d

# Verify deployment
curl http://localhost
curl http://localhost/api/health

# View container logs (stdout)
docker compose logs -f server

# View file logs (inside /app/logs, persisted)
docker compose exec server ls /app/logs
docker compose exec server tail -f /app/logs/*.log

# Stop services
docker compose down
```

**Environment Configuration** (`.env` file):
```bash
MONGO_ROOT_USERNAME=admin              # MongoDB admin username
MONGO_ROOT_PASSWORD=your_password      # MongoDB admin password (change to a strong password)
MONGO_DATABASE=apiflow                 # Database name
```

Services will be available at:
- **Web UI**: http://localhost
- **API Server**: http://localhost/api (proxied; not exposed as `:7001`)
- **MongoDB**: Internal Docker network only (not exposed externally)

Log notes:
- File log directory: `/app/logs` (docker-compose volume `server_logs`)
- Rotation: daily, 100MB per file, retain 14 days

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue 3 + TypeScript + Vite |
| Desktop | Electron 36 |
| State Management | Pinia |
| UI Components | Element Plus |
| Code Editor | Monaco Editor |
| Local Storage | IndexedDB (Dexie) |
| HTTP Client | Got |
| Mock Server | Koa |

## Main Features

### 🔧 API Testing

- [x] Support GET, POST, PUT, DELETE, HEAD, OPTIONS and more
- [x] RESTful style API with path parameters
- [x] Query parameters, Body parameters (form-data, x-www-form-urlencoded, JSON, XML, Binary)
- [x] Custom headers and Cookie management
- [x] Variable substitution `{{variableName}}`
- [x] Pre-request and post-request scripts
- [x] WebSocket connection testing

### 🎭 Mock Server

- [x] Built-in HTTP Mock server
- [x] Built-in WebSocket Mock server
- [x] SSE (Server-Sent Events) support
- [x] MockJS syntax support
- [x] Conditional scripts and priority-based route matching

### 📁 Project Management

- [x] Unlimited folder nesting
- [x] Drag & drop sorting and batch operations
- [x] Advanced search and filtering
- [x] Operation history audit
- [x] Tag management

### 📥 Import & Export

**Import Support:**
- [x] OpenAPI 3.0 / Swagger
- [x] Postman
- [x] Apiflow JSON format

**Export Support:**
- [x] HTML offline documentation
- [x] Word (DOCX)
- [x] JSON data
- [x] OpenAPI format

### 🤖 AI Assistant

- [x] Built-in AI chat interface
- [x] OpenAI-compatible API support
- [x] Streaming response support
- [x] Configurable API Key, Base URL, and model

### 🌍 Internationalization

- [x] Simplified Chinese (zh-cn)
- [x] Traditional Chinese (zh-tw)
- [x] English (en)
- [x] Japanese (ja)

## Documentation

- [Product Introduction](https://www.yuque.com/apiflow/as0gig/fayyy6)
- [User Guide](https://www.yuque.com/apiflow/as0gig/npr3di)
- [Full Documentation](https://www.yuque.com/apiflow)

## Community

QQ Group: 977506603 - Welcome to join!

## License

[MIT](./LICENSE)
