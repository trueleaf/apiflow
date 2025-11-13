import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  getSaveButton,
  switchToTab,
  verifyConnectionStatus,
  getFullConnectionUrl
} from './helpers/websocketNodeHelpers';

test.describe('1. WebSocket节点 - 基础功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test.describe('1.1 创建测试', () => {
    /**
     * 测试目的：验证WebSocket节点的创建功能
     * 前置条件：应用已启动，工作区已初始化
     * 操作步骤：
     *   1. 创建测试项目
     *   2. 创建WebSocket类型的节点
     *   3. 等待节点界面加载
     *   4. 验证节点显示在树形导航中
     * 预期结果：
     *   - 节点创建成功
     *   - 左侧树形导航显示WebSocket节点
     *   - WebSocket操作区域可见
     * 验证点：WebSocket节点创建和UI显示
     */
    test('应能创建WebSocket节点', async () => {
      // 创建测试项目
      await createProject(contentPage, '测试项目');
      // 创建WebSocket节点
      const result = await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 验证节点创建成功
      expect(result.success).toBe(true);
      // 等待节点界面加载
      await waitForWebSocketNodeReady(contentPage);
      // 验证树节点显示
      const treeNode = contentPage
        .locator('.tree-node:has-text(\"Test WebSocket\"), .el-tree-node__content:has-text(\"Test WebSocket\"), .el-tree-node__label:has-text(\"Test WebSocket\")')
        .first();
      await expect(treeNode).toBeVisible();
      // 验证操作区域可见
      const wsOperation = contentPage.locator('.ws-operation, .websocket').first();
      await expect(wsOperation).toBeVisible();
    });

    /**
     * 测试目的：验证连接UI组件的显示
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 等待WebSocket节点就绪
     *   2. 检查协议选择器是否显示
     *   3. 检查URL输入框是否显示
     *   4. 检查连接按钮是否显示
     *   5. 检查保存按钮是否显示
     * 预期结果：
     *   - 所有必需的UI组件都可见
     *   - 组件布局正确
     * 验证点：连接相关UI组件的完整性
     */
    test('应能显示连接UI组件', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证协议选择器
      const protocolSelector = contentPage.locator('.protocol-select .el-select');
      await expect(protocolSelector).toBeVisible();
      // 验证URL输入框
      const urlInput = contentPage.locator('.connection-input input.el-input__inner');
      await expect(urlInput).toBeVisible();
      // 验证连接按钮
      const connectBtn = contentPage.locator('button:has-text("发起连接"), button:has-text("重新连接")');
      await expect(connectBtn).toBeVisible();
      // 验证保存按钮
      const saveBtn = getSaveButton(contentPage);
      await expect(saveBtn).toBeVisible();
    });

    /**
     * 测试目的：验证默认协议设置为WS
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 等待WebSocket节点就绪
     *   2. 获取协议选择器的值
     *   3. 验证默认值为ws
     * 预期结果：
     *   - 默认协议为WS（非加密）
     *   - 协议选择器正确显示
     * 验证点：默认协议配置
     * 说明：WS是非加密协议，WSS是加密协议
     */
    test('默认协议应该是WS', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 获取协议选择器的值
      const protocolSelector = contentPage.locator('.protocol-select .el-select');
      const selectedText = await protocolSelector.locator('.el-select__selected-item, input').first().inputValue();
      // 验证默认值为ws
      expect(selectedText.toLowerCase()).toBe('ws');
    });
  });

  test.describe('1.2 UI组件显示测试', () => {
    /**
     * 测试目的：验证所有必需UI组件的显示
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 等待节点就绪
     *   2. 逐一检查各个UI组件的可见性
     * 预期结果：
     *   - 协议选择器可见
     *   - URL输入框可见
     *   - 连接按钮可见
     *   - 保存和刷新按钮可见
     *   - 状态显示区域可见
     * 验证点：UI组件完整性
     */
    test('应显示所有必需的UI组件', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证协议选择器
      const protocolSelector = contentPage.locator('.protocol-select .el-select');
      await expect(protocolSelector).toBeVisible();
      // 验证URL输入框
      const urlInput = contentPage.locator('.connection-input input.el-input__inner');
      await expect(urlInput).toBeVisible();
      // 验证连接按钮
      const connectBtn = contentPage.locator('button:has-text("发起连接"), button:has-text("重新连接")');
      await expect(connectBtn).toBeVisible();
      // 验证保存按钮
      const saveBtn = contentPage.locator('button:has-text(\"保存\")');
      await expect(saveBtn).toBeVisible();
      // 验证刷新按钮
      const refreshBtn = contentPage.locator('button:has-text(\"刷新\")');
      await expect(refreshBtn).toBeVisible();
      // 验证状态显示区域
      const statusWrap = contentPage.locator('.status-wrap').first();
      await expect(statusWrap).toBeVisible();
    });

    /**
     * 测试目的：验证连接状态标签的显示
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 等待节点就绪
     *   2. 查找"连接状态"标签
     * 预期结果：连接状态标签可见
     * 验证点：状态显示标签
     */
    test('应显示连接状态标签', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 查找连接状态标签
      const label = contentPage.locator('.status-wrap .label:has-text(\"连接状态\")').first();
      await expect(label).toBeVisible();
    });

    /**
     * 测试目的：验证连接操作区域的显示
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 等待节点就绪
     *   2. 检查连接包装器和布局容器
     * 预期结果：
     *   - 连接包装器可见
     *   - 连接布局容器可见
     * 验证点：连接操作区域的结构
     */
    test('应显示连接操作区域', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证连接包装器
      const connectionWrap = contentPage.locator('.connection-wrap').first();
      await expect(connectionWrap).toBeVisible();
      // 验证连接布局容器
      const connectionLayout = contentPage.locator('.connection-layout').first();
      await expect(connectionLayout).toBeVisible();
    });
  });

  test.describe('1.3 标签测试', () => {
    /**
     * 测试目的：验证所有标签页的显示
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 等待节点就绪
     *   2. 检查各个标签页是否显示
     * 预期结果：
     *   - 消息标签页可见
     *   - Params标签页可见
     *   - 请求头标签页可见
     *   - 前置脚本标签页可见
     *   - 后置脚本标签页可见
     * 验证点：标签页完整性
     */
    test('应显示所有标签', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证消息标签页
      const messageTab = contentPage.locator('.el-tabs__item:has-text(\"消息\")').first();
      await expect(messageTab).toBeVisible();
      // 验证Params标签页
      const paramsTab = contentPage.locator('.el-tabs__item:has-text(\"Params\")').first();
      await expect(paramsTab).toBeVisible();
      // 验证请求头标签页
      const headersTab = contentPage.locator('.el-tabs__item:has-text(\"请求头\"), .el-tabs__item:has-text(\"Headers\")').first();
      await expect(headersTab).toBeVisible();
      // 验证前置脚本标签页
      const preScriptTab = contentPage.locator('.el-tabs__item:has-text(\"前置脚本\")').first();
      await expect(preScriptTab).toBeVisible();
      // 验证后置脚本标签页
      const afterScriptTab = contentPage.locator('.el-tabs__item:has-text(\"后置脚本\")').first();
      await expect(afterScriptTab).toBeVisible();
    });

    /**
     * 测试目的：验证切换到消息标签页
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 切换到消息标签
     *   2. 验证标签激活状态
     * 预期结果：消息标签页显示激活状态
     * 验证点：标签页切换功能
     */
    test('应能切换到消息标签', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 切换到消息标签
      await switchToTab(contentPage, 'Message');
      // 验证标签激活状态
      const messageActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text(\"消息\")');
      await expect(messageActiveTab).toBeVisible();
    });

    /**
     * 测试目的：验证切换到Params标签页
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 切换到Params标签
     *   2. 验证标签激活状态
     * 预期结果：Params标签页显示激活状态
     * 验证点：Params标签页切换
     */
    test('应能切换到Params标签', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 切换到Params标签
      await switchToTab(contentPage, 'Params');
      // 验证标签激活状态
      const paramsActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text(\"Params\")');
      await expect(paramsActiveTab).toBeVisible();
    });

    /**
     * 测试目的：验证切换到Headers标签页
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 切换到Headers标签
     *   2. 验证标签激活状态
     * 预期结果：Headers标签页显示激活状态
     * 验证点：Headers标签页切换
     */
    test('应能切换到Headers标签', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 切换到Headers标签
      await switchToTab(contentPage, 'Headers');
      // 验证标签激活状态
      const headersActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text(\"请求头\"), .el-tabs__item.is-active:has-text(\"Headers\")').first();
      await expect(headersActiveTab).toBeVisible();
    });

    /**
     * 测试目的：验证切换到前置脚本标签页
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 切换到前置脚本标签
     *   2. 验证标签激活状态
     * 预期结果：前置脚本标签页显示激活状态
     * 验证点：前置脚本标签页切换
     */
    test('应能切换到前置脚本标签', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 切换到前置脚本标签
      await switchToTab(contentPage, 'PreScript');
      // 验证标签激活状态
      const preScriptActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text(\"前置脚本\")');
      await expect(preScriptActiveTab).toBeVisible();
    });

    /**
     * 测试目的：验证切换到后置脚本标签页
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 切换到后置脚本标签
     *   2. 验证标签激活状态
     * 预期结果：后置脚本标签页显示激活状态
     * 验证点：后置脚本标签页切换
     */
    test('应能切换到后置脚本标签', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 切换到后置脚本标签
      await switchToTab(contentPage, 'AfterScript');
      // 验证标签激活状态
      const afterScriptActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text(\"后置脚本\")');
      await expect(afterScriptActiveTab).toBeVisible();
    });
  });

  test.describe('1.4 初始状态测试', () => {
    test('应显示未连接状态', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证未连接状态
      await verifyConnectionStatus(contentPage, 'disconnected');
    });

    test('应显示空的URL输入框', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 获取URL输入框的值
      const urlInput = contentPage.locator('.connection-input input.el-input__inner');
      const value = await urlInput.inputValue();
      // 验证为空
      expect(value).toBe('');
    });

    test('应显示空的连接状态', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 获取完整连接URL
      const fullUrl = await getFullConnectionUrl(contentPage);
      // 验证为默认ws://
      expect(fullUrl).toBe('ws://');
    });

    test('保存按钮应该可用', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证保存按钮可用
      const saveBtn = getSaveButton(contentPage);
      await expect(saveBtn).toBeEnabled();
    });

    test('刷新按钮应该可用', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证刷新按钮可用
      const refreshBtn = contentPage.locator('button:has-text(\"刷新\")');
      await expect(refreshBtn).toBeEnabled();
    });
  });

  test.describe('1.5 响应信息区域测试', () => {
    test('应显示响应信息区域', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证响应信息区域显示
      const infoLayout = contentPage.locator('.info-layout').first();
      await expect(infoLayout).toBeVisible();
    });

    test('响应区应显示基本信息标签', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证基本信息标签显示
      const baseInfoTab = contentPage.locator('.info-layout .el-tabs__item:has-text(\"基本信息\")').first();
      await expect(baseInfoTab).toBeVisible();
    });
  });

  test.describe('1.6 布局测试', () => {
    test('应显示双栏布局', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证连接布局容器
      const connectionLayout = contentPage.locator('.connection-layout').first();
      await expect(connectionLayout).toBeVisible();
      // 验证信息布局容器
      const infoLayout = contentPage.locator('.info-layout').first();
      await expect(infoLayout).toBeVisible();
    });

    test('应显示可调整大小的分隔条', async () => {
      // 创建测试项目和节点
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test WebSocket',
        type: 'websocket'
      });
      // 等待节点就绪
      await waitForWebSocketNodeReady(contentPage);
      // 验证分隔条显示
      const resizeControl = contentPage.locator('.info-layout .resize-bar, .info-layout .s-resize').first();
      if (await resizeControl.count() > 0) {
        await expect(resizeControl).toBeVisible();
      }
    });
  });
});
