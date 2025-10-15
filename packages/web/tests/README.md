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

### 运行特定模块测试

```bash
# 运行项目管理相关测试
npx playwright test tests/e2e/offline/projectManager

# 运行 HTTP 节点相关测试
npx playwright test tests/e2e/offline/httpNode

# 运行工作台相关测试
npx playwright test tests/e2e/offline/projectWorkbench

# 运行设置模块测试
npx playwright test tests/e2e/offline/settings

# 运行单个测试文件
npx playwright test tests/e2e/offline/projectManager/projectManager.spec.ts

# 运行匹配特定名称的测试
npx playwright test --grep "项目管理"

# 排除某些测试
npx playwright test --grep-invert "待实现"
```

### 调试特定测试

```bash
# 使用 UI 模式调试特定模块
npx playwright test tests/e2e/offline/projectManager --ui

# Headed 模式运行并暂停
npx playwright test tests/e2e/offline/projectManager --headed --debug

# 显示浏览器并慢速执行
npx playwright test tests/e2e/offline/projectManager --headed --slow-mo=1000
```

## 📁 目录结构

```
tests/
├── e2e/                                    # E2E 测试用例
│   ├── common/                             # 通用测试用例（待实现）
│   ├── offline/                            # 离线模式测试
│   │   ├── ai/                             # AI 功能测试
│   │   ├── appWorkbench/                   # 应用工作台测试
│   │   │   ├── appWorkbench.spec.ts        # 主测试文件
│   │   │   ├── nav.spec.ts                 # 导航功能
│   │   │   └── operation.spec.ts           # 操作功能（刷新、前进、后退、窗口控制等）
│   │   ├── groupManager/                   # 团队管理测试
│   │   ├── httpMockNode/                   # HTTP Mock 节点测试
│   │   ├── httpNode/                       # HTTP 节点测试
│   │   │   ├── httpNode.spec.ts            # 基础功能
│   │   │   ├── httpNode-advanced.spec.ts   # 高级功能
│   │   │   ├── httpNode-request.spec.ts    # 请求功能
│   │   │   └── httpNode-variable.spec.ts   # 变量功能
│   │   ├── httpNodeRedoUndo/               # HTTP 节点撤销重做测试
│   │   ├── language/                       # 语言切换测试
│   │   ├── projectManager/                 # 项目管理测试
│   │   ├── projectWorkbench/               # 项目工作台测试
│   │   │   ├── projectWorkbench.spec.ts    # 主测试文件
│   │   │   ├── banner.spec.ts              # Banner 功能（树、搜索、快捷操作）
│   │   │   ├── nav.spec.ts                 # 导航功能
│   │   │   ├── audit.spec.ts               # 审计功能
│   │   │   ├── recycle.spec.ts             # 回收站功能
│   │   │   ├── import.spec.ts              # 导入功能
│   │   │   ├── export.spec.ts              # 导出功能
│   │   │   ├── share.spec.ts               # 分享功能
│   │   │   └── projectSettings.spec.ts     # 项目设置
│   │   ├── settings/                       # 设置模块测试
│   │   │   ├── aiSettings.spec.ts          # AI 设置
│   │   │   ├── commonSettings.spec.ts      # 通用设置
│   │   │   ├── styleSettings.spec.ts       # 样式设置
│   │   │   └── cacheAndBackup.spec.ts      # 缓存与备份
│   │   ├── shortcut/                       # 快捷键测试
│   │   ├── websocketMockNode/              # WebSocket Mock 节点测试
│   │   ├── websocketNode/                  # WebSocket 节点测试
│   │   └── websocketNodeRedoUndo/          # WebSocket 节点撤销重做测试
│   └── online/                             # 在线模式测试（待实现）
├── fixtures/                               # 测试夹具和辅助函数
│   └── enhanced-electron-fixtures.ts       # 增强型 Electron fixtures
├── mocks/                                  # Mock 数据和服务
├── specs/                                  # 测试规格说明
└── utils/                                  # 测试工具函数
```

## 🧪 测试模块说明

### 离线模式测试 (Offline)

离线模式测试覆盖应用在无网络连接状态下的所有核心功能。

#### 📝 节点管理模块

| 模块 | 说明 | 状态 |
|------|------|------|
| `httpNode/` | HTTP 接口节点的创建、编辑、删除、请求发送等功能 | ✅ 已实现 |
| `httpMockNode/` | HTTP Mock 节点的模拟数据配置和响应测试 | ⏳ 待实现 |
| `websocketNode/` | WebSocket 连接节点的配置和通信测试 | ✅ 已实现 |
| `websocketMockNode/` | WebSocket Mock 节点的模拟消息测试 | ⏳ 待实现 |

#### ↩️ 撤销重做模块

| 模块 | 说明 | 状态 |
|------|------|------|
| `httpNodeRedoUndo/` | HTTP 节点操作的撤销和重做功能测试 | ⏳ 待实现 |
| `websocketNodeRedoUndo/` | WebSocket 节点操作的撤销和重做功能测试 | ⏳ 待实现 |

#### 🗂️ 管理器模块

| 模块 | 说明 | 状态 |
|------|------|------|
| `projectManager/` | 项目的增删改查、搜索、收藏等功能测试 | ✅ 已实现 |
| `groupManager/` | 团队管理功能测试（成员、权限、协作） | ⏳ 待实现 |

#### 🎨 工作台模块

**ProjectWorkbench (项目工作台)**

| 子模块 | 说明 | 状态 |
|--------|------|------|
| `banner.spec.ts` | 文档树、搜索、快捷操作、项目切换功能 | ⏳ 待实现 |
| `nav.spec.ts` | 标签页导航、打开、关闭、切换功能 | ⏳ 待实现 |
| `audit.spec.ts` | 操作审计、历史记录查看功能 | ⏳ 待实现 |
| `recycle.spec.ts` | 回收站、恢复、彻底删除功能 | ⏳ 待实现 |
| `import.spec.ts` | 导入 JSON、Postman、Swagger 等格式 | ⏳ 待实现 |
| `export.spec.ts` | 导出为 JSON、Markdown、HTML 等格式 | ⏳ 待实现 |
| `share.spec.ts` | 分享链接生成、权限设置功能 | ⏳ 待实现 |
| `projectSettings.spec.ts` | 项目配置、成员管理、权限设置 | ⏳ 待实现 |

**AppWorkbench (应用工作台)**

| 子模块 | 说明 | 状态 |
|--------|------|------|
| `nav.spec.ts` | 应用级标签页导航功能 | ⏳ 待实现 |
| `operation.spec.ts` | 刷新、前进、后退、窗口控制、用户设置、语言切换 | ⏳ 待实现 |

#### ⚙️ 设置模块

| 模块 | 说明 | 状态 |
|------|------|------|
| `aiSettings.spec.ts` | AI 服务配置、API Key、模型选择 | ⏳ 待实现 |
| `commonSettings.spec.ts` | 开机启动、系统托盘、自动更新、快捷键 | ⏳ 待实现 |
| `styleSettings.spec.ts` | 主题模式、语言、字体设置 | ⏳ 待实现 |
| `cacheAndBackup.spec.ts` | 缓存管理、数据备份、恢复、导入导出 | ⏳ 待实现 |

#### 🔧 其他功能模块

| 模块 | 说明 | 状态 |
|------|------|------|
| `ai/` | AI 功能集成测试（文档生成、测试用例生成） | ⏳ 待实现 |
| `language/` | 多语言切换、界面文本更新测试 | ⏳ 待实现 |
| `shortcut/` | 快捷键配置、冲突检测、自定义测试 | ⏳ 待实现 |

### 在线模式测试 (Online)

> 📌 **计划中**：在线模式测试将覆盖需要网络连接的功能，如团队协作、云端同步、在线分享等。

### 通用测试 (Common)

> 📌 **计划中**：通用测试将包含跨模式的共享测试用例和工具函数。

## ✍️ 编写测试

## ✍️ 编写测试

### 基础测试结构

所有测试文件都应遵循以下基本结构：

```typescript
import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { test } from '../../../fixtures/enhanced-electron-fixtures';

test.describe('模块功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    // 初始化页面引用
    const pages = await resolveHeaderAndContentPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;
    
    // 设置测试前置条件
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
    });
  });

  test('应能完成某个功能', async () => {
    // 测试实现
  });
});
```

### 离线模式测试示例

#### 示例 1：项目管理测试

```typescript
test.describe('项目列表展示测试', () => {
  test('页面加载后应正确显示项目列表容器', async () => {
    // 导航到项目列表页
    await contentPage.evaluate(() => {
      window.location.hash = '#/home';
    });
    await contentPage.waitForURL(/home/, { timeout: 5000 });
    
    // 验证项目列表容器存在
    const docListContainer = contentPage.locator('.doc-list');
    await expect(docListContainer).toBeVisible();
    
    // 验证新建项目按钮存在
    await expect(contentPage.locator('button:has-text("新建项目")')).toBeVisible();
  });
});
```

#### 示例 2：HTTP 节点测试

```typescript
test.describe('HTTP 节点基础功能', () => {
  test('应能创建新的 HTTP 接口', async () => {
    // 点击新建接口按钮
    const addNodeBtn = contentPage.locator('[title="新增文件"]').first();
    await addNodeBtn.click();
    
    // 填写接口信息
    const nodeInput = contentPage.locator('input[placeholder*="接口名称"]').first();
    await nodeInput.fill('测试接口');
    
    // 确认创建
    await contentPage.locator('button:has-text("确定")').click();
    
    // 验证接口已创建
    const node = contentPage.locator('.custom-tree-node:has-text("测试接口")');
    await expect(node).toBeVisible();
  });
});
```

#### 示例 3：设置模块测试

```typescript
test.describe('主题设置测试', () => {
  test('应能切换到深色主题', async () => {
    // 打开设置页面
    await contentPage.evaluate(() => {
      window.location.hash = '#/settings/style';
    });
    
    // 选择深色主题
    const darkThemeOption = contentPage.locator('[data-theme="dark"]');
    await darkThemeOption.click();
    
    // 验证主题已应用
    const body = contentPage.locator('body');
    await expect(body).toHaveClass(/dark-theme/);
  });
});
```

### 测试辅助函数

#### 页面解析工具

```typescript
const resolveHeaderAndContentPages = async (
  electronApp: ElectronApplication,
  timeout = 10000
): Promise<{ headerPage: Page; contentPage: Page }> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const windows = electronApp.windows();
    let headerPage: Page | undefined;
    let contentPage: Page | undefined;
    
    windows.forEach((page) => {
      const url = page.url();
      if (url.includes('header.html')) {
        headerPage = page;
      } else if (url && url !== 'about:blank') {
        contentPage = page;
      }
    });
    
    if (headerPage && contentPage) {
      return { headerPage, contentPage };
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('未能定位 header 与 content 页面');
};
```

### 测试最佳实践

#### 1. 使用有意义的测试描述

```typescript
// ✅ 好的做法
test('创建项目时项目名称为空应无法提交', async () => { ... });

// ❌ 避免的做法
test('测试1', async () => { ... });
```

#### 2. 等待元素就绪

```typescript
// ✅ 好的做法
await contentPage.waitForSelector('.dialog', { state: 'visible' });
await expect(contentPage.locator('.dialog')).toBeVisible();

// ❌ 避免的做法
await contentPage.waitForTimeout(1000); // 固定延迟不可靠
```

#### 3. 使用精确的选择器

```typescript
// ✅ 好的做法
const button = contentPage.locator('button:has-text("新建项目")');
const input = contentPage.locator('input[placeholder="项目名称"]');

// ❌ 避免的做法
const button = contentPage.locator('.btn').first(); // 过于宽泛
```

#### 4. 独立的测试用例

```typescript
// ✅ 好的做法 - 每个测试独立设置数据
test.beforeEach(async () => {
  await createTestProject('测试项目');
});

// ❌ 避免的做法 - 测试间存在依赖
test('测试1', async () => {
  await createProject(); // 后续测试依赖此数据
});
test('测试2', async () => {
  // 依赖测试1创建的数据
});
```

#### 5. 清理测试数据

```typescript
test.afterEach(async ({ contentPage }) => {
  // 清理测试创建的数据
  await contentPage.evaluate(() => {
    localStorage.clear();
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

### 通用测试规范

1. **测试前构建**：始终在运行测试前构建应用（`npm run test:e2e:build`）
2. **串行执行**：Electron 测试应该串行执行，避免资源冲突
3. **测试隔离**：每个测试会启动新的 Electron 实例，确保测试隔离
4. **清晰的描述**：使用清晰的 `describe` 和 `test` 描述，便于理解测试目的

### 离线模式测试规范

1. **设置离线模式**：
   ```typescript
   test.beforeEach(async ({ contentPage }) => {
     await contentPage.evaluate(() => {
       localStorage.setItem('runtime/networkMode', 'offline');
     });
   });
   ```

2. **验证离线状态**：确保测试不会意外依赖网络功能
   ```typescript
   const networkText = headerPage.locator('.network-text');
   await expect(networkText).toHaveText(/离线模式/);
   ```

3. **数据准备**：在 `beforeEach` 中准备测试数据，在 `afterEach` 中清理

### 节点测试规范

1. **等待节点加载**：
   ```typescript
   await contentPage.waitForSelector('.custom-tree-node', { timeout: 5000 });
   ```

2. **使用辅助函数**：创建通用的节点操作函数
   ```typescript
   async function createHttpNode(name: string) {
     // 通用创建逻辑
   }
   ```

3. **验证节点状态**：不仅验证存在性，还要验证状态
   ```typescript
   const node = contentPage.locator(`.node:has-text("${name}")`);
   await expect(node).toBeVisible();
   await expect(node).toHaveClass(/active/);
   ```

### 工作台测试规范

1. **页面导航**：
   ```typescript
   await contentPage.evaluate(() => {
     window.location.hash = '#/doc-edit';
   });
   await contentPage.waitForURL(/doc-edit/, { timeout: 5000 });
   ```

2. **等待页面加载完成**：
   ```typescript
   await contentPage.waitForLoadState('domcontentloaded');
   await contentPage.waitForSelector('.banner', { timeout: 10000 });
   ```

3. **标签页操作**：
   ```typescript
   const tab = headerPage.locator('.tab-item:has-text("标签名")');
   await tab.click();
   await expect(tab).toHaveClass(/active/);
   ```

### 设置模块测试规范

1. **验证设置持久化**：
   ```typescript
   // 修改设置
   await changeSetting('theme', 'dark');
   
   // 刷新页面
   await contentPage.reload();
   
   // 验证设置保持
   const theme = await getSetting('theme');
   expect(theme).toBe('dark');
   ```

2. **测试设置生效**：不仅保存设置，还要验证UI变化
   ```typescript
   await selectTheme('dark');
   await expect(contentPage.locator('body')).toHaveClass(/dark/);
   ```

### 性能测试规范

1. **测试响应时间**：
   ```typescript
   const start = Date.now();
   await performAction();
   const duration = Date.now() - start;
   expect(duration).toBeLessThan(1000); // 1秒内完成
   ```

2. **避免固定延迟**：使用 `waitFor` 而不是 `waitForTimeout`
   ```typescript
   // ❌ 避免
   await page.waitForTimeout(5000);
   
   // ✅ 推荐
   await page.waitForSelector('.element', { state: 'visible' });
   ```

### 错误处理规范

1. **验证错误提示**：
   ```typescript
   // 触发错误
   await submitInvalidData();
   
   // 验证错误消息
   const error = contentPage.locator('.error-message');
   await expect(error).toBeVisible();
   await expect(error).toContainText('必填项不能为空');
   ```

2. **测试边界条件**：
   ```typescript
   test('空名称应无法提交', async () => { ... });
   test('超长名称应被截断或拒绝', async () => { ... });
   test('特殊字符应正确处理', async () => { ... });
   ```

### 代码组织规范

1. **使用辅助函数**：提取可复用的测试逻辑
   ```typescript
   // tests/utils/test-helpers.ts
   export async function createTestProject(name: string) { ... }
   export async function deleteAllProjects() { ... }
   ```

2. **分组相关测试**：
   ```typescript
   test.describe('创建功能', () => {
     test.describe('表单验证', () => { ... });
     test.describe('成功场景', () => { ... });
   });
   ```

3. **使用有意义的变量名**：
   ```typescript
   // ✅ 好
   const projectNameInput = page.locator('input[name="projectName"]');
   
   // ❌ 差
   const input1 = page.locator('input').first();
   ```

## ⚠️ 重要注意事项

1. **必须先构建**：测试依赖 `dist/main/main.mjs`，必须先执行构建
2. **端口占用**：确保没有其他进程占用 Electron 可能使用的端口
3. **开发模式冲突**：运行测试时不要同时运行 `npm run dev`
4. **权限问题**：某些 Electron 功能（如文件系统）可能需要额外权限
5. **串行执行**：测试配置为串行执行，避免多个 Electron 实例冲突
6. **测试隔离**：每个测试文件启动独立的 Electron 实例，确保数据隔离
7. **离线模式**：离线测试不应依赖任何网络请求

## 🐛 故障排查

### 常见问题及解决方案

#### 1. 测试启动失败

**问题**：`Error: Application not found`

**解决方案**：
```bash
# 重新构建应用
npm run test:e2e:build

# 或完整构建
npm run build:app:pack
```

#### 2. 页面定位失败

**问题**：`未能定位 header 与 content 页面`

**解决方案**：
- 检查 Electron 应用是否正常启动
- 增加超时时间：`timeout = 15000`
- 查看是否有多个窗口干扰

#### 3. 元素选择器失效

**问题**：`Timeout waiting for selector`

**解决方案**：
```typescript
// 增加等待时间
await page.waitForSelector('.element', { timeout: 10000 });

// 检查元素是否在 iframe 中
const frame = page.frameLocator('iframe');
const element = frame.locator('.element');

// 使用更宽松的选择器
const element = page.locator('text=部分匹配');
```

#### 4. 测试执行缓慢

**问题**：测试运行时间过长

**解决方案**：
- 减少固定延迟 `waitForTimeout`
- 使用更精确的等待条件
- 并行运行独立的测试文件（注意 Electron 限制）
- 清理不必要的测试数据

#### 5. localStorage 数据污染

**问题**：测试间数据相互影响

**解决方案**：
```typescript
test.afterEach(async ({ contentPage, headerPage }) => {
  // 清理 localStorage
  await contentPage.evaluate(() => localStorage.clear());
  await headerPage.evaluate(() => localStorage.clear());
});
```

#### 6. 截图和视频问题

**问题**：失败时没有生成截图或视频

**解决方案**：
检查 `playwright.electron.config.ts` 配置：
```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

#### 7. 测试在 CI 环境失败

**问题**：本地通过，CI 失败

**解决方案**：
- 检查 CI 环境的显示设置（headless 模式）
- 增加超时时间以适应较慢的 CI 环境
- 查看 CI 日志和截图
- 确保 CI 环境已正确安装依赖

### 调试技巧

#### 1. 使用 UI 模式

```bash
npm run test:e2e:ui
```
可视化查看测试执行过程，逐步调试。

#### 2. 使用 Debug 模式

```bash
npm run test:e2e:debug
```
在测试中添加 `await page.pause()` 暂停执行。

#### 3. 查看控制台日志

```typescript
// 监听控制台消息
contentPage.on('console', msg => console.log('PAGE LOG:', msg.text()));

// 监听错误
contentPage.on('pageerror', error => console.error('PAGE ERROR:', error));
```

#### 4. 截图调试

```typescript
// 在关键步骤截图
await contentPage.screenshot({ path: 'debug-step1.png' });
await performAction();
await contentPage.screenshot({ path: 'debug-step2.png' });
```

#### 5. 输出元素信息

```typescript
// 获取元素文本内容
const text = await element.textContent();
console.log('Element text:', text);

// 获取元素属性
const className = await element.getAttribute('class');
console.log('Element class:', className);

// 检查元素是否可见
const isVisible = await element.isVisible();
console.log('Element visible:', isVisible);
```

## 🎯 下一步

### 短期目标

1. **实现核心测试用例**
   - [ ] 完成 `projectManager` 所有测试用例实现
   - [ ] 完成 `httpNode` 高级功能测试
   - [ ] 完成 `projectWorkbench` 基础功能测试
   - [ ] 完成 `appWorkbench` 操作功能测试

2. **添加测试数据准备工具**
   - [ ] 创建测试项目工厂函数
   - [ ] 创建测试节点工厂函数
   - [ ] 添加数据清理工具

3. **完善测试基础设施**
   - [ ] 添加更多测试辅助函数
   - [ ] 优化页面等待和定位策略
   - [ ] 添加测试性能监控

### 中期目标

1. **扩展测试覆盖**
   - [ ] 实现所有待实现（⏳）的测试模块
   - [ ] 添加边界条件和异常场景测试
   - [ ] 增加性能和稳定性测试

2. **实现在线模式测试**
   - [ ] 设计在线模式测试架构
   - [ ] 实现团队协作功能测试
   - [ ] 实现云端同步功能测试

3. **添加通用测试**
   - [ ] 提取可复用的测试组件
   - [ ] 实现跨模式的共享测试用例

### 长期目标

1. **测试自动化**
   - [ ] 集成到 CI/CD 流程
   - [ ] 定期自动运行测试
   - [ ] 自动生成测试报告

2. **测试质量提升**
   - [ ] 提高测试覆盖率到 80% 以上
   - [ ] 减少测试执行时间
   - [ ] 消除不稳定的测试用例

3. **文档和培训**
   - [ ] 编写详细的测试编写指南
   - [ ] 录制测试编写教程视频
   - [ ] 组织团队测试培训

### 测试优先级

**P0（高优先级）**：
- 项目管理（创建、编辑、删除）
- HTTP 节点基础功能
- 应用工作台核心操作

**P1（中优先级）**：
- 撤销重做功能
- 导入导出功能
- 设置模块

**P2（低优先级）**：
- AI 功能
- 高级特性
- 性能优化测试

## 📚 参考资料

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright Electron 测试](https://playwright.dev/docs/api/class-electron)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
- [Electron 官方文档](https://www.electronjs.org/)
