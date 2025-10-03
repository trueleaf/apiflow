# Playwright E2E 测试文档 - Electron 版本

## 📦 安装

已安装的依赖包：
- `@playwright/test` - Playwright 测试框架（支持 Electron）
- `electron` - Electron 运行时
- `@types/node` - Node.js 类型定义

## 🚀 使用说明

### 前置条件

**重要**: 在运行测试前，必须先构建 Electron 应用：

```bash
# 构建应用（测试前必须执行）
npm run test:e2e:build

# 或者使用完整构建
npm run build:app:pack
```

测试脚本会自动执行构建（通过 `pretest:e2e` 钩子），但首次使用建议手动构建以确认无误。

### 运行测试

```bash
# 运行所有 Electron 测试
npm run test:e2e

# 使用 UI 模式运行测试（推荐用于调试）
npm run test:e2e:ui

# 调试模式运行测试
npm run test:e2e:debug

# Headed 模式运行测试（显示 Electron 窗口）
npm run test:e2e:headed

# 查看测试报告
npm run test:e2e:report
```

## 📁 目录结构

```
tests/
├── e2e/                          # E2E 测试用例
│   └── web/                      # Electron 应用测试
│       └── example.spec.ts       # Electron 测试示例
├── fixtures/                     # 测试夹具和辅助函数
│   ├── electron-fixtures.ts     # Electron 专用 fixtures
│   └── mock-data.ts             # 模拟测试数据
└── utils/                        # 测试工具函数
    ├── test-helpers.ts          # 通用测试辅助
    └── wait-for.ts              # 等待工具
```

## ✍️ 编写 Electron 测试

### 基础 Electron 测试示例

```typescript
import { test, expect } from '../fixtures/electron-fixtures';

test.describe('Electron 功能测试', () => {
  test('验证应用启动', async ({ electronApp, mainWindow }) => {
    // electronApp: Electron 应用实例
    // mainWindow: 主窗口 Page 对象
    
    expect(electronApp).toBeTruthy();
    await expect(mainWindow).toHaveTitle(/Apiflow/);
  });
});
```

### 测试主进程功能

```typescript
import { test, expect } from '../fixtures/electron-fixtures';

test.describe('主进程测试', () => {
  test('验证应用版本', async ({ electronApp }) => {
    // 在主进程中执行代码
    const appVersion = await electronApp.evaluate(async ({ app }) => {
      return app.getVersion();
    });
    
    expect(appVersion).toBeTruthy();
  });
});
```

### 测试渲染进程 UI

```typescript
import { test, expect } from '../fixtures/electron-fixtures';

test.describe('UI 测试', () => {
  test('验证页面元素', async ({ mainWindow }) => {
    // mainWindow 是 Page 对象，可以像普通 Playwright 测试一样使用
    const appContainer = mainWindow.locator('#app');
    await expect(appContainer).toBeVisible();
  });
});
```

### 测试 IPC 通信（高级）

```typescript
import { test, expect } from '../fixtures/electron-fixtures';

test.describe('IPC 通信测试', () => {
  test('验证主进程和渲染进程通信', async ({ electronApp, mainWindow }) => {
    // 在渲染进程中调用 IPC
    const result = await mainWindow.evaluate(() => {
      return window.electron.invoke('some-ipc-channel', { data: 'test' });
    });
    
    expect(result).toBeTruthy();
  });
});
```

## 🔧 配置说明

主要配置在 `playwright.electron.config.ts` 文件中：

- **测试环境**: Electron 应用（而非浏览器）
- **执行模式**: 串行执行（workers: 1），避免多个 Electron 实例冲突
- **超时设置**: 30 秒测试超时，10 秒操作超时
- **重试机制**: CI 环境下失败重试 2 次
- **报告格式**: HTML + JSON + List
- **Fixtures**: 通过 `electron-fixtures.ts` 提供 `electronApp` 和 `mainWindow`

## 📝 最佳实践

1. **测试前构建**：始终在运行测试前构建应用（`npm run test:e2e:build`）
2. **串行执行**：Electron 测试应该串行执行，避免资源冲突
3. **使用 data-testid**：为关键 UI 元素添加 `data-testid` 属性，方便定位
4. **等待加载完成**：使用 `waitForLoadState()` 等待页面加载
5. **测试隔离**：每个测试会启动新的 Electron 实例，确保测试隔离
6. **IPC 测试**：可以通过 `mainWindow.evaluate()` 测试渲染进程与主进程的通信
7. **主进程测试**：使用 `electronApp.evaluate()` 在主进程上下文中执行代码
8. **清晰的描述**：使用清晰的 `describe` 和 `test` 描述

## ⚠️ 重要注意事项

1. **必须先构建**：测试依赖 `dist/main/main.mjs`，必须先执行构建
2. **端口占用**：确保没有其他进程占用 Electron 可能使用的端口
3. **开发模式冲突**：运行测试时不要同时运行 `npm run dev`
4. **权限问题**：某些 Electron 功能（如文件系统）可能需要额外权限
5. **串行执行**：测试配置为串行执行，避免多个 Electron 实例冲突

## 🎯 下一步

1. 根据实际应用添加 `data-testid` 属性到关键 UI 元素
2. 编写核心功能的 Electron 测试用例
3. 测试 IPC 通信和主进程功能
4. 添加更多测试辅助函数
5. 配置 CI/CD 自动运行测试

## 📚 参考资料

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright Electron 测试](https://playwright.dev/docs/api/class-electron)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
- [Electron 官方文档](https://www.electronjs.org/)
