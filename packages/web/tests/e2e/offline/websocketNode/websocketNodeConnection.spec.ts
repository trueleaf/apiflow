import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  selectProtocol,
  fillUrl,
  clickConnect,
  clickDisconnect,
  verifyConnectionStatus,
  waitForConnected,
  waitForDisconnected,
  verifyDisconnectButtonVisible,
  verifyDisconnectButtonHidden,
  getFullConnectionUrl,
  verifyFullConnectionUrl,
  verifyUrlValue
} from './helpers/websocketNodeHelpers';

test.describe('2. WebSocket节点 - 连接管理测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test WebSocket',
      type: 'websocket'
    });
    await waitForWebSocketNodeReady(contentPage);
  });

  test.describe('2.1 协议选择测试', () => {
    /**
     * 测试目的：验证能够选择WS协议
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 选择WS协议
     *   2. 获取完整连接URL
     *   3. 验证URL包含ws://前缀
     * 预期结果：完整URL使用ws://协议
     * 验证点：WS协议选择功能
     * 说明：WS是非加密的WebSocket协议
     */
    test('应能选择WS协议', async () => {
      // 选择WS协议
      await selectProtocol(contentPage, 'ws');
      // 获取完整连接URL
      const fullUrl = await getFullConnectionUrl(contentPage);
      // 验证URL包含ws://前缀
      expect(fullUrl).toContain('ws://');
    });

    /**
     * 测试目的：验证能够选择WSS协议
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 选择WSS协议
     *   2. 获取完整连接URL
     *   3. 验证URL包含wss://前缀
     * 预期结果：完整URL使用wss://协议
     * 验证点：WSS协议选择功能
     * 说明：WSS是加密的WebSocket协议，类似HTTPS
     */
    test('应能选择WSS协议', async () => {
      // 选择WSS协议
      await selectProtocol(contentPage, 'wss');
      // 获取完整连接URL
      const fullUrl = await getFullConnectionUrl(contentPage);
      // 验证URL包含wss://前缀
      expect(fullUrl).toContain('wss://');
    });

    /**
     * 测试目的：验证切换协议时完整URL同步更新
     * 前置条件：已创建WebSocket节点并输入了URL
     * 操作步骤：
     *   1. 输入URL地址
     *   2. 选择WS协议，验证完整URL为ws://
     *   3. 切换到WSS协议，验证完整URL更新为wss://
     * 预期结果：
     *   - 协议切换时URL前缀自动更新
     *   - 地址部分保持不变
     * 验证点：协议与URL的联动更新
     */
    test('切换协议应更新完整URL', async () => {
      // 输入URL地址
      await fillUrl(contentPage, 'echo.websocket.org');
      // 选择WS协议
      await selectProtocol(contentPage, 'ws');
      // 验证完整URL为ws://
      let fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toBe('ws://echo.websocket.org');
      // 切换到WSS协议
      await selectProtocol(contentPage, 'wss');
      // 验证完整URL更新为wss://
      fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toBe('wss://echo.websocket.org');
    });
  });

  test.describe('2.2 URL输入测试', () => {
    /**
     * 测试目的：验证能够输入WebSocket连接地址
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 在URL输入框输入地址
     *   2. 验证输入值正确保存
     * 预期结果：URL地址成功输入和显示
     * 验证点：URL输入功能
     */
    test('应能输入WebSocket连接地址', async () => {
      // 在URL输入框输入地址
      await fillUrl(contentPage, 'echo.websocket.org');
      // 验证输入值正确保存
      await verifyUrlValue(contentPage, 'echo.websocket.org');
    });

    /**
     * 测试目的：验证输入URL后完整连接地址更新
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 输入URL地址
     *   2. 获取完整连接地址
     *   3. 验证包含输入的地址
     * 预期结果：完整连接地址包含协议前缀和输入的URL
     * 验证点：URL与完整连接地址的联动
     */
    test('输入URL应更新完整连接地址', async () => {
      // 输入URL地址
      await fillUrl(contentPage, 'echo.websocket.org');
      // 获取完整连接地址
      const fullUrl = await getFullConnectionUrl(contentPage);
      // 验证包含输入的地址
      expect(fullUrl).toContain('echo.websocket.org');
    });

    /**
     * 测试目的：验证能够输入带端口号的URL
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 输入包含端口号的URL
     *   2. 验证URL和完整连接地址都包含端口号
     * 预期结果：端口号正确保存和显示
     * 验证点：带端口URL的支持
     */
    test('应能输入带端口的URL', async () => {
      // 输入包含端口号的URL
      await fillUrl(contentPage, 'localhost:8080');
      // 验证URL包含端口号
      await verifyUrlValue(contentPage, 'localhost:8080');
      // 验证完整连接地址包含端口号
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('localhost:8080');
    });

    /**
     * 测试目的：验证能够输入带路径的URL
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 输入包含路径的URL
     *   2. 验证URL和完整连接地址都包含路径
     * 预期结果：路径正确保存和显示
     * 验证点：带路径URL的支持
     * 说明：WebSocket可以连接到特定路径，如/socket或/ws
     */
    test('应能输入带路径的URL', async () => {
      // 输入包含路径的URL
      await fillUrl(contentPage, 'echo.websocket.org/socket');
      // 验证URL包含路径
      await verifyUrlValue(contentPage, 'echo.websocket.org/socket');
      // 验证完整连接地址包含路径
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('/socket');
    });

    /**
     * 测试目的：验证能够清空URL
     * 前置条件：已创建WebSocket节点并输入了URL
     * 操作步骤：
     *   1. 输入URL地址
     *   2. 清空URL输入框
     *   3. 验证输入框为空
     * 预期结果：URL可以被清空
     * 验证点：URL清空功能
     */
    test('应能清空URL', async () => {
      // 输入URL地址
      await fillUrl(contentPage, 'echo.websocket.org');
      // 清空URL输入框
      await fillUrl(contentPage, '');
      // 验证输入框为空
      const urlInput = contentPage.locator('.connection-input input.el-input__inner');
      const value = await urlInput.inputValue();
      expect(value).toBe('');
    });
  });

  test.describe('2.3 连接操作测试', () => {
    /**
     * 测试目的：验证能够发起WebSocket连接
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 输入WebSocket服务地址
     *   2. 点击连接按钮
     *   3. 验证连接状态变为connecting
     *   4. 等待连接建立
     * 预期结果：
     *   - 连接状态经历connecting
     *   - 最终连接成功
     * 验证点：WebSocket连接建立功能
     * 说明：使用echo.websocket.org作为测试服务器
     */
    test('应能发起WebSocket连接', async () => {
      // 输入WebSocket服务地址
      await fillUrl(contentPage, 'echo.websocket.org');
      // 点击连接按钮
      await clickConnect(contentPage);
      // 验证连接状态变为connecting
      await verifyConnectionStatus(contentPage, 'connecting');
      // 等待连接建立
      await waitForConnected(contentPage, 15000);
      // 验证连接成功
      await verifyConnectionStatus(contentPage, 'connected');
      await verifyDisconnectButtonVisible(contentPage);
    });

    /**
     * 测试目的：验证连接成功后显示断开连接按钮
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 输入URL并发起连接
     *   2. 等待连接成功
     *   3. 查找断开连接按钮
     * 预期结果：断开连接按钮可见
     * 验证点：连接成功后的UI状态
     */
    test('连接成功后应显示断开连接按钮', async () => {
      // 输入URL并发起连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      // 等待连接成功
      await waitForConnected(contentPage, 15000);
      // 查找断开连接按钮
      const disconnectBtn = contentPage.locator('button:has-text("断开连接")');
      await expect(disconnectBtn).toBeVisible();
    });

    /**
     * 测试目的：验证能够断开WebSocket连接
     * 前置条件：已建立WebSocket连接
     * 操作步骤：
     *   1. 建立WebSocket连接
     *   2. 点击断开连接按钮
     *   3. 等待连接断开
     *   4. 验证连接状态和UI更新
     * 预期结果：
     *   - 连接成功断开
     *   - 状态变为disconnected
     *   - 断开连接按钮隐藏
     * 验证点：WebSocket断开连接功能
     */
    test('应能断开WebSocket连接', async () => {
      // 建立WebSocket连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 点击断开连接按钮
      await clickDisconnect(contentPage);
      // 等待连接断开
      await waitForDisconnected(contentPage);
      // 验证连接状态和UI更新
      await verifyConnectionStatus(contentPage, 'disconnected');
      await verifyDisconnectButtonHidden(contentPage);
    });

    /**
     * 测试目的：验证断开连接后显示发起连接按钮
     * 前置条件：已建立并断开WebSocket连接
     * 操作步骤：
     *   1. 建立并断开连接
     *   2. 查找发起连接按钮
     * 预期结果：发起连接按钮恢复显示
     * 验证点：断开后的UI状态恢复
     */
    test('断开连接后应显示发起连接按钮', async () => {
      // 建立并断开连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      // 查找发起连接按钮
      const connectBtn = contentPage.locator('button:has-text("发起连接")');
      await expect(connectBtn).toBeVisible();
    });

    /**
     * 测试目的：验证能够重新连接
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 建立连接
     *   2. 断开连接
     *   3. 再次发起连接
     *   4. 等待连接成功
     * 预期结果：
     *   - 能够成功重新连接
     *   - 连接状态正确更新
     * 验证点：重复连接功能
     */
    test('应能重新连接', async () => {
      // 建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 断开连接
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      // 再次发起连接
      await clickConnect(contentPage);
      // 等待连接成功
      await waitForConnected(contentPage, 15000);
      await verifyConnectionStatus(contentPage, 'connected');
    });
  });

  test.describe('2.4 连接状态测试', () => {
    /**
     * 测试目的：验证初始连接状态为disconnected
     * 前置条件：已创建WebSocket节点
     * 操作步骤：检查初始连接状态
     * 预期结果：状态为disconnected
     * 验证点：初始状态正确性
     */
    test('初始状态应为disconnected', async () => {
      // 检查初始连接状态
      await verifyConnectionStatus(contentPage, 'disconnected');
    });

    test('点击连接后应进入connecting状态', async () => {
      // 输入URL
      await fillUrl(contentPage, 'echo.websocket.org');
      // 点击连接
      await clickConnect(contentPage);
      // 验证显示连接中按钮
      const connectingBtn = contentPage.locator('button:has-text("连接中")');
      await expect(connectingBtn).toBeVisible();
    });

    test('连接成功后应为connected状态', async () => {
      // 输入URL并发起连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      // 等待连接成功
      await waitForConnected(contentPage, 15000);
      // 验证状态为connected
      await verifyConnectionStatus(contentPage, 'connected');
    });

    test('断开连接后应回到disconnected状态', async () => {
      // 建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 断开连接
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      // 验证状态为disconnected
      await verifyConnectionStatus(contentPage, 'disconnected');
    });

    test('连接失败应显示error状态', async () => {
      // 输入无效URL
      await fillUrl(contentPage, 'invalid-websocket-url-that-does-not-exist.com');
      // 尝试连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(3000);
      // 验证显示重新连接按钮
      const status = await contentPage.locator('button:has-text("重新连接")').isVisible();
      expect(status).toBe(true);
    });
  });

  test.describe('2.5 完整URL显示测试', () => {
    test('应正确显示完整的WS URL', async () => {
      // 选择WS协议并输入URL
      await selectProtocol(contentPage, 'ws');
      await fillUrl(contentPage, 'echo.websocket.org');
      // 验证完整连接URL
      await verifyFullConnectionUrl(contentPage, 'ws://echo.websocket.org');
    });

    test('应正确显示完整的WSS URL', async () => {
      // 选择WSS协议并输入URL
      await selectProtocol(contentPage, 'wss');
      await fillUrl(contentPage, 'echo.websocket.org');
      // 验证完整连接URL
      await verifyFullConnectionUrl(contentPage, 'wss://echo.websocket.org');
    });

    test('应正确显示带端口的完整URL', async () => {
      // 选择WS协议并输入带端口的URL
      await selectProtocol(contentPage, 'ws');
      await fillUrl(contentPage, 'localhost:8080');
      // 验证完整连接URL包含端口
      await verifyFullConnectionUrl(contentPage, 'ws://localhost:8080');
    });

    test('应正确显示带路径的完整URL', async () => {
      // 选择WS协议并输入带路径的URL
      await selectProtocol(contentPage, 'ws');
      await fillUrl(contentPage, 'echo.websocket.org/socket');
      // 验证完整连接URL包含路径
      await verifyFullConnectionUrl(contentPage, 'ws://echo.websocket.org/socket');
    });
  });

  test.describe('2.6 连接按钮状态测试', () => {
    test('未输入URL时应能点击连接按钮', async () => {
      // 验证连接按钮可用
      const connectBtn = contentPage.locator('button:has-text("发起连接")');
      await expect(connectBtn).toBeEnabled();
    });

    test('连接中时不应显示发起连接按钮', async () => {
      // 输入URL并发起连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      // 验证发起连接按钮不可见
      const connectBtn = contentPage.locator('button:has-text("发起连接")');
      await expect(connectBtn).not.toBeVisible();
      // 验证连接中按钮可见
      const connectingBtn = contentPage.locator('button:has-text("连接中")');
      await expect(connectingBtn).toBeVisible();
    });

    test('已连接时应显示断开连接按钮', async () => {
      // 建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 验证断开连接按钮可见
      await verifyDisconnectButtonVisible(contentPage);
    });

    test('断开连接后应隐藏断开连接按钮', async () => {
      // 建立并断开连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      // 验证断开连接按钮隐藏
      await verifyDisconnectButtonHidden(contentPage);
    });
  });

  test.describe('2.7 WSS协议连接测试', () => {
    test('应能通过WSS协议连接', async () => {
      // 选择WSS协议并输入URL
      await selectProtocol(contentPage, 'wss');
      await fillUrl(contentPage, 'echo.websocket.org');
      // 发起连接
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 验证连接成功
      await verifyConnectionStatus(contentPage, 'connected');
    });

    test('WSS连接成功后完整URL应为wss://', async () => {
      // 选择WSS协议并建立连接
      await selectProtocol(contentPage, 'wss');
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 验证完整URL包含wss://
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('wss://');
    });

    test('应能断开WSS连接', async () => {
      // 建立WSS连接
      await selectProtocol(contentPage, 'wss');
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 断开连接
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      // 验证状态为disconnected
      await verifyConnectionStatus(contentPage, 'disconnected');
    });
  });

  test.describe('2.8 连接超时测试', () => {
    test('连接不存在的服务器应最终显示错误状态', async () => {
      // 输入不存在的服务器地址
      await fillUrl(contentPage, 'this-domain-does-not-exist-12345.com');
      // 尝试连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(5000);
      // 验证显示重新连接按钮
      const reconnectBtn = contentPage.locator('button:has-text("重新连接")');
      const isVisible = await reconnectBtn.isVisible();
      expect(isVisible).toBe(true);
    });
  });
});
