# Web 项目测试辅助模板

本项目基于 Vue 3、Vite 7 与 Element Plus，主要用于搭建 Web 测试场景的基础环境。

- 默认集成 Element Plus，方便快速搭建可视化界面组件
- 通过 `npm run test` 可使用 Rolldown 预览版打包器启动开发服务
- 已配置默认页面展示 “hello word”，可作为测试入口或健康检查
- 开发服务器端口固定为 `6000`，便于统一管理和脚本化调用

运行命令：

```bash
npm install
npm run test
```

访问 `http://localhost:6543/` 即可查看页面效果。
当前目录父级目录../web  src\renderer\pages\modules\apidoc\doc-list