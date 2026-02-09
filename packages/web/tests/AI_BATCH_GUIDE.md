# 测试案例批次处理指南（给 AI 看）

## 📋 系统概述

本系统将 ApiFlow 的 134 个离线测试文件划分为约 28 个业务批次，每个批次包含 5-8 个相关测试文件。系统提供了自动化的测试文件与业务代码的映射，方便 AI 大模型进行批次化的测试覆盖分析和补充。

## 🎯 AI 处理目标

每个批次的处理任务包括：

1. **分析现有测试覆盖**
   - 理解当前测试的功能点和测试场景
   - 识别测试的断言和验证逻辑
   - 评估测试的完整性和准确性

2. **扫描业务代码实现**
   - 阅读相关业务代码，理解功能实现细节
   - 识别代码中的分支逻辑、边界条件、异常处理
   - 发现可能的用户交互场景和数据流转

3. **识别测试缺口**
   - 对比业务代码与测试覆盖，找出未测试的场景
   - 重点关注：
     - 边界值测试（空值、最大值、最小值）
     - 异常流程（错误处理、网络异常）
     - 用户交互（点击、输入、拖拽）
     - 数据持久化（缓存、IndexedDB、localStorage）
     - 状态管理（Pinia store 更新）

4. **提出优化建议**
   - 补充遗漏的测试案例（提供具体测试代码）
   - 优化现有测试的断言和覆盖度
   - 改进测试的可维护性和可读性
   - 修复测试中的潜在问题

## 📦 批次信息结构

每个批次提供以下信息：

```json
{
  "id": "batch-001",
  "name": "应用程序外壳 - IPC通信",
  "status": "pending",
  "category": {
    "level1": "应用程序外壳",
    "level2": "IPC通信"
  },
  "files": [
    {
      "path": "tests/e2e/offline/app-shell/ipc-handshake.spec.ts",
      "relatedBusinessCode": [
        "src/main/ipcMessage/",
        "src/renderer/pages/layout/"
      ],
      "testCases": [
        "应用启动时事件监听器立即可用",
        "设置按钮点击后Tab和页面同步创建"
      ],
      "testCount": 4
    }
  ],
  "stats": {
    "fileCount": 1,
    "testCount": 4
  }
}
```

## 🔍 AI 分析流程

### 步骤1：读取测试文件

使用 `read_file` 工具读取批次中列出的所有测试文件，理解：
- 测试的目的和覆盖范围
- 测试的前置条件和操作步骤
- 测试的断言和预期结果
- 测试使用的 fixtures 和辅助函数

### 步骤2：扫描业务代码

根据 `relatedBusinessCode` 字段，读取相关的业务代码目录：
- 如果是目录（以 `/` 结尾），扫描目录下的主要文件
- 理解功能实现的核心逻辑
- 识别可能的边界条件和异常情况
- 注意组件之间的交互和数据流

### 步骤3：对比分析

将测试覆盖与业务实现进行对比：
- 列出业务代码中的所有功能点
- 标记哪些功能点已被测试覆盖
- 识别未覆盖的功能点和缺失的测试场景

### 步骤4：输出建议

按照规范格式输出分析结果和改进建议。

## 📝 输出格式规范

请按以下格式组织输出：

### 1. 现有测试覆盖分析

```
✅ 已覆盖场景：
- 场景1：[描述]
- 场景2：[描述]

⚠️ 覆盖不足：
- 问题1：[描述]
- 问题2：[描述]
```

### 2. 业务代码分析

```
核心功能：
- 功能1：[描述实现细节]
- 功能2：[描述实现细节]

边界条件：
- 条件1：[描述]
- 条件2：[描述]

异常处理：
- 异常1：[描述]
- 异常2：[描述]
```

### 3. 测试缺口识别

```
❌ 缺失的测试场景：

1. [场景名称]
   - 测试目的：[说明]
   - 业务依据：[代码位置和逻辑]
   - 优先级：高/中/低

2. [场景名称]
   ...
```

### 4. 补充测试代码

为每个缺失场景提供完整的测试代码：

```typescript
// 测试文件：[文件路径]
// 添加位置：[describe块名称]

test('测试场景名称', async ({ contentPage }) => {
  // 前置条件
  await clearCache();
  await loginAccount();
  
  // 操作步骤
  // ...
  
  // 断言验证
  await expect(element).toBeVisible();
});
```

### 5. 优化建议

```
现有测试的改进建议：

1. 测试文件：[文件路径]
   - 问题：[描述]
   - 建议：[改进方案]
   - 代码：[具体修改]

2. ...
```

## 🎯 测试编写规范

根据项目 AGENTS.md 中的规范，编写测试时需要遵守：

### 代码风格
- 函数使用 `export const foo = () => {}` 而不是 `function foo() {}`
- 禁止使用 `any` 类型
- 禁止使用枚举类型，使用字面量联合类型代替
- 禁止使用行内样式
- 禁止添加不存在的功能或过度设计（YAGNI 原则）

### 测试规范
- 禁止创建公共函数或辅助函数（在测试文件内）
- 必须对关键操作步骤添加必要的注释
- 避免过度注释简单操作（如每个 await 都加注释）
- 注释应该说明"为什么"而不是"是什么"

### 注释示例

❌ 错误示例（过度注释）：
```typescript
// 清空缓存
await clearCache();
// 登录账号
await loginAccount();
// 创建项目
await createProject();
```

✅ 正确示例（关键步骤注释）：
```typescript
await clearCache();
await loginAccount();
await createProject();
// 创建所有类型节点（folder, http, websocket, httpMock, websocketMock）
const nodeList = [...];
for (let i = 0; i < nodeList.length; i += 1) {
  await createNode(contentPage, { nodeType: nodeList[i].nodeType });
}
```

### Playwright 测试规范
- 尽可能模拟用户操作而不是直接调用方法
- 使用 `data-testid` 定位元素
- 使用 fixtures 中提供的辅助函数（如 `clearCache`, `loginAccount`）
- 测试独立性：每个测试应该独立运行，不依赖其他测试

## 🚀 实际使用示例

### 示例批次信息

```
批次ID: batch-005
批次名称: HTTP节点 - Body参数
文件数: 6 个
测试案例数: 35 个

测试文件:
  - tests/e2e/offline/workbench/nodes/http/body/json.spec.ts
  - tests/e2e/offline/workbench/nodes/http/body/form-data-params.spec.ts
  - tests/e2e/offline/workbench/nodes/http/body/urlencoded-params.spec.ts
  - ...

相关业务代码:
  - src/renderer/pages/projectWorkbench/httpNode/body/
  - src/renderer/store/apidoc/requestStore.ts
  - src/renderer/server/request/
```

### AI 处理 Prompt 模板

```
请帮我分析这个测试批次并补充/优化测试案例：

**批次信息：**
- 批次ID: batch-005
- 批次名称: HTTP节点 - Body参数
- 测试文件: [列出所有文件]
- 相关业务代码: [列出所有目录]

**任务要求：**
1. 阅读所有测试文件，理解当前测试覆盖的场景
2. 扫描相关业务代码，了解功能实现细节
3. 识别未覆盖的测试场景（边界值、异常、用户交互等）
4. 提供完整的补充测试代码
5. 给出现有测试的优化建议

请按照 tests/AI_BATCH_GUIDE.md 中规定的格式输出分析结果。
```

## 📊 进度跟踪

使用以下命令管理批次处理进度：

```bash
# 查看下一个待处理批次
npm run test:next-batch

# 标记批次完成
npm run test:mark-done batch-005

# 查看整体进度
npm run test:batch-status
```

## 💡 提示和建议

1. **分批处理的好处**
   - 避免 token 超限
   - 确保上下文集中
   - 便于跟踪进度
   - 可以随时中断和恢复

2. **优先处理顺序**
   - 建议按批次顺序处理
   - 可以根据业务重要性调整优先级
   - 复杂批次可以标记为"进行中"后再处理

3. **分析深度**
   - 重点关注业务逻辑而非 UI 细节
   - 优先补充高价值的测试场景
   - 注意测试的可维护性

4. **代码质量**
   - 提供的测试代码应该可以直接运行
   - 遵守项目的代码规范
   - 添加必要的注释

## 🔄 迭代优化

处理完所有批次后，可以：
1. 重新生成批次索引（测试文件变更后）
2. 重置特定批次重新分析
3. 生成测试覆盖率报告
4. 识别遗漏的业务模块

---

**记住：测试的目标是确保功能正确性和系统稳定性，而不是追求覆盖率数字。每个测试都应该有明确的目的和价值。**
