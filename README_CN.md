<div align="center">

![logo](https://images.gitee.com/uploads/images/2021/0331/214909_4f34bc9b_1230427.png "屏幕截图.png")

# Apiflow

### 免费、本地优先、AI 驱动的 API 开发平台，支持团队协作 — 更智能的 Postman 替代方案

[English](./README.md) | 中文

[![GitHub Release](https://img.shields.io/github/v/release/trueleaf/apiflow?style=flat-square)](https://github.com/trueleaf/apiflow/releases/latest)
[![License](https://img.shields.io/github/license/trueleaf/apiflow)](https://github.com/trueleaf/apiflow/blob/master/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/trueleaf/apiflow/total)](https://github.com/trueleaf/apiflow/releases/latest)

[客户端下载](https://github.com/trueleaf/apiflow/releases) | [完整文档](https://www.yuque.com/apiflow) | [在线体验](https://online.jobtool.cn/)

</div>

## ✨ 特性

- 🚀 **HTTP 接口测试** - 支持 GET/POST/PUT/DELETE 等全部请求方式，RESTful 风格，多种 Body 类型
- 🔌 **WebSocket 测试** - 完整的 WebSocket 连接管理与消息收发
- 🤖 **AI 助手** - 内置 AI 对话功能，支持 OpenAI 兼容 API
- 🎭 **Mock 服务器** - 内置 HTTP/WebSocket/SSE Mock 服务，支持条件脚本
- 🔐 **变量系统** - 四层作用域变量（临时/本地/环境/全局），支持 `{{变量名}}` 语法
- 📦 **离线模式** - 完全本地化运行，数据存储于 IndexedDB，无需服务端
- 🌍 **国际化** - 支持简体中文、繁体中文、英语、日语
- ⌨️ **快捷键** - 可自定义的键盘快捷键
- 🔄 **自动更新** - 内置自动更新功能

## 预览

![输入图片说明](https://images.gitee.com/uploads/images/2021/0331/215000_bc4b9025_1230427.png "屏幕截图.png")

![输入图片说明](https://images.gitee.com/uploads/images/2021/0331/215030_fcc9272e_1230427.png "屏幕截图.png")

![输入图片说明](https://images.gitee.com/uploads/images/2021/0331/215051_83e16797_1230427.png "屏幕截图.png")

## 快速开始

### 下载安装

前往 [Releases](https://github.com/trueleaf/apiflow/releases) 下载适合您系统的安装包：

- **Windows**: `.exe` 安装包
- **macOS**: `.dmg` 安装包
- **Linux**: `.AppImage` 或 `.deb` 包

### 开发环境

要求：**Node.js >= 20.0.0**

```bash
# 克隆仓库
git clone https://github.com/trueleaf/apiflow
cd apiflow

# 安装依赖
npm install

# 启动开发模式
cd packages/web
npm run dev

# 构建客户端
npm run build:app:win    # Windows
npm run build:app:mac    # macOS
npm run build:app:linux  # Linux
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript + Vite |
| 桌面端 | Electron 36 |
| 状态管理 | Pinia |
| UI 组件 | Element Plus |
| 代码编辑器 | Monaco Editor |
| 本地存储 | IndexedDB (Dexie) |
| HTTP 客户端 | Got |
| Mock 服务 | Koa |

## 主要功能

### 🔧 接口调试

- [x] 支持 GET、POST、PUT、DELETE、HEAD、OPTIONS 等请求方式
- [x] 支持 RESTful 风格接口与路径参数
- [x] 支持 Query 参数、Body 参数（form-data、x-www-form-urlencoded、JSON、XML、Binary）
- [x] 支持自定义请求头和 Cookie 管理
- [x] 支持变量替换 `{{variableName}}`
- [x] 支持前置脚本 (pre-request) 和后置脚本
- [x] 支持 WebSocket 连接测试

### 🎭 Mock 服务

- [x] 内置 HTTP Mock 服务器
- [x] 内置 WebSocket Mock 服务器
- [x] 支持 SSE (Server-Sent Events)
- [x] 支持 MockJS 语法
- [x] 支持条件脚本和优先级路由匹配

### 📁 项目管理

- [x] 无限层级文件夹嵌套
- [x] 拖拽排序与批量操作
- [x] 高级搜索与筛选
- [x] 操作历史审计
- [x] 标签管理

### 📥 导入导出

**导入支持：**
- [x] OpenAPI 3.0 / Swagger
- [x] Postman
- [x] Apiflow JSON 格式

**导出支持：**
- [x] HTML 离线文档
- [x] Word (DOCX)
- [x] JSON 数据
- [x] OpenAPI 格式

### 🤖 AI 助手

- [x] 内置 AI 对话界面
- [x] 支持 OpenAI 兼容 API
- [x] 支持流式响应
- [x] 可配置 API Key、Base URL、模型

### 🌍 国际化

- [x] 简体中文 (zh-cn)
- [x] 繁体中文 (zh-tw)
- [x] English (en)
- [x] 日本語 (ja)

## 文档

- [产品介绍](https://www.yuque.com/apiflow/as0gig/fayyy6)
- [使用教程](https://www.yuque.com/apiflow/as0gig/npr3di)
- [完整文档](https://www.yuque.com/apiflow)

## QQ 交流群

977506603 欢迎加入

## License

[MIT](./LICENSE)
