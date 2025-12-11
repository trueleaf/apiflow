# 业务代码错误记录

本文档记录在E2E测试过程中发现的业务代码问题，这些问题不是测试代码问题，而是实际业务逻辑的缺陷。

---

## 错误 1: 关闭Tab后高亮逻辑不正确

- **测试文件**: `tests/e2e/offline/app-workbench/workbench-top/navigation.spec.ts`
- **测试用例**: 关闭最右侧高亮Tab后高亮左侧最近的Tab
- **测试行号**: 213

### 错误描述

当关闭最右侧的项目Tab时，期望高亮左侧最近的**项目Tab**，但实际高亮了**设置Tab**。

### 复现步骤

1. 创建项目A
2. 创建项目B（此时项目B Tab高亮，Tab顺序为：项目A、项目B、设置）
3. 关闭项目B Tab
4. 期望结果：项目A Tab被高亮
5. 实际结果：设置Tab被高亮

### 期望行为

关闭高亮的项目Tab后，应该优先高亮同类型（项目类型）的相邻Tab，而不是跳到其他类型的Tab（如设置Tab）。

### 相关业务代码

可能涉及的代码文件：
- `src/renderer/components/` 下的 Tab 管理组件
- `src/main/` 下的 TopBar View 相关逻辑
- Tab 状态管理 store

### 建议修复方案

修改Tab关闭后的高亮逻辑：
1. 首先尝试高亮右侧同类型Tab
2. 如果右侧没有同类型Tab，则高亮左侧同类型Tab
3. 如果没有同类型Tab，再考虑其他类型Tab

---

## 测试框架问题: Playwright Electron "step id not found" 错误 (非业务代码问题)

- **影响范围**: 所有 E2E 测试
- **当前 Playwright 版本**: 1.55.1
- **错误类型**: 测试框架问题（非业务代码 Bug）

### 错误描述

在运行 Playwright Electron 测试时，频繁出现 `Internal error: step id not found: fixture@XX` 错误，导致所有测试在 fixture 设置或清理阶段失败。

### 错误信息

```
Internal error: step id not found: fixture@62
Internal error: step id not found: fixture@63
Error: locator.click: Target page, context or browser has been closed
```

### 根本原因

这是 Playwright 与 Electron 结合使用时的已知 Bug，与 Playwright 内部的 step 跟踪机制有关。主要发生在 fixture 的生命周期管理期间，尤其是在应用关闭阶段。

### 已尝试的解决方案

1. **禁用 trace 和 video 录制** - 在 `playwright.electron.config.ts` 中设置 `trace: 'off'` 和 `video: 'off'` - 无效
2. **增加 app.close() 前的延迟** - 在 fixture 中添加 500ms-2000ms 延迟 - 无效
3. **使用 process.kill 替代 app.close()** - 尝试直接杀死进程 - 无效
4. **增加重试次数** - 配置 `retries: 2` - 部分缓解但不能解决
5. **降级 Playwright 版本**:
   - 1.44.0: 与 Electron 36.2.0 不兼容，出现 "Application exited" 错误
   - 1.48.0: 出现 "Target page, context or browser has been closed" 错误
   - 结论: 旧版本与新 Electron 不兼容，保留 1.55.1

### 当前状态

**严重程度**: 阻塞性问题，所有测试均无法通过

**环境信息**:
- Playwright: 1.55.1
- Electron: 36.2.0
- 操作系统: Windows

**问题表现**:
- 所有 E2E 测试在运行时 100% 失败
- 错误出现在 fixture 生命周期管理阶段（setup/teardown）
- 重试机制（retries: 2）无法缓解问题
- 每个测试均失败 3 次后标记为失败

**临时解决方案**: 暂无有效解决方案。建议：
1. 等待 Playwright 修复与 Electron 36.x 的兼容性问题
2. 或考虑降级 Electron 版本（需评估对应用的影响）
3. 或使用其他测试框架（如 WebdriverIO）

### 建议方案

1. **继续使用重试机制** - `retries: 2` 配置可以缓解偶发错误
2. **关注 Playwright GitHub Issues** - 相关 issue:
   - https://github.com/microsoft/playwright/issues
   - 搜索 "step id not found" 或 "electron fixture"
3. **等待 Playwright 更新** - 后续版本可能修复此问题
4. **考虑替代测试框架** - 如果问题持续严重，可考虑使用 Spectron 或其他 Electron 测试工具

### 当前配置

```typescript
// playwright.electron.config.ts
{
  retries: 2,                    // 重试机制
  workers: 1,                    // 串行执行
  use: {
    trace: 'off',               // 禁用 trace
    video: 'off',               // 禁用 video
    screenshot: 'only-on-failure'
  }
}
```

```typescript
// electron.fixture.ts
electronApp: async ({}, use) => {
  // ... 启动逻辑
  await use(app);
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    await app.close();
  } catch {
    // 忽略关闭错误
  }
}
```

---
