import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../fixtures/fixtures';
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
  getUrlInput,
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
    test('应能选择WS协议', async () => {
      await selectProtocol(contentPage, 'ws');
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('ws://');
    });

    test('应能选择WSS协议', async () => {
      await selectProtocol(contentPage, 'wss');
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('wss://');
    });

    test('切换协议应更新完整URL', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await selectProtocol(contentPage, 'ws');
      let fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toBe('ws://echo.websocket.org');
      await selectProtocol(contentPage, 'wss');
      fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toBe('wss://echo.websocket.org');
    });
  });

  test.describe('2.2 URL输入测试', () => {
    test('应能输入WebSocket连接地址', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await verifyUrlValue(contentPage, 'echo.websocket.org');
    });

    test('输入URL应更新完整连接地址', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('echo.websocket.org');
    });

    test('应能输入带端口的URL', async () => {
      await fillUrl(contentPage, 'localhost:8080');
      await verifyUrlValue(contentPage, 'localhost:8080');
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('localhost:8080');
    });

    test('应能输入带路径的URL', async () => {
      await fillUrl(contentPage, 'echo.websocket.org/socket');
      await verifyUrlValue(contentPage, 'echo.websocket.org/socket');
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('/socket');
    });

    test('应能清空URL', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await fillUrl(contentPage, '');
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value).toBe('');
    });
  });

  test.describe('2.3 连接操作测试', () => {
    test('应能发起WebSocket连接', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await verifyConnectionStatus(contentPage, 'connecting');
      await waitForConnected(contentPage, 15000);
      await verifyConnectionStatus(contentPage, 'connected');
      await verifyDisconnectButtonVisible(contentPage);
    });

    test('连接成功后应显示断开连接按钮', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      const disconnectBtn = contentPage.locator('button:has-text("断开连接")');
      await expect(disconnectBtn).toBeVisible();
    });

    test('应能断开WebSocket连接', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      await verifyConnectionStatus(contentPage, 'disconnected');
      await verifyDisconnectButtonHidden(contentPage);
    });

    test('断开连接后应显示发起连接按钮', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      const connectBtn = contentPage.locator('button:has-text("发起连接")');
      await expect(connectBtn).toBeVisible();
    });

    test('应能重新连接', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await verifyConnectionStatus(contentPage, 'connected');
    });
  });

  test.describe('2.4 连接状态测试', () => {
    test('初始状态应为disconnected', async () => {
      await verifyConnectionStatus(contentPage, 'disconnected');
    });

    test('点击连接后应进入connecting状态', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      const connectingBtn = contentPage.locator('button:has-text("连接中")');
      await expect(connectingBtn).toBeVisible();
    });

    test('连接成功后应为connected状态', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await verifyConnectionStatus(contentPage, 'connected');
    });

    test('断开连接后应回到disconnected状态', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      await verifyConnectionStatus(contentPage, 'disconnected');
    });

    test('连接失败应显示error状态', async () => {
      await fillUrl(contentPage, 'invalid-websocket-url-that-does-not-exist.com');
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(3000);
      const status = await contentPage.locator('button:has-text("重新连接")').isVisible();
      expect(status).toBe(true);
    });
  });

  test.describe('2.5 完整URL显示测试', () => {
    test('应正确显示完整的WS URL', async () => {
      await selectProtocol(contentPage, 'ws');
      await fillUrl(contentPage, 'echo.websocket.org');
      await verifyFullConnectionUrl(contentPage, 'ws://echo.websocket.org');
    });

    test('应正确显示完整的WSS URL', async () => {
      await selectProtocol(contentPage, 'wss');
      await fillUrl(contentPage, 'echo.websocket.org');
      await verifyFullConnectionUrl(contentPage, 'wss://echo.websocket.org');
    });

    test('应正确显示带端口的完整URL', async () => {
      await selectProtocol(contentPage, 'ws');
      await fillUrl(contentPage, 'localhost:8080');
      await verifyFullConnectionUrl(contentPage, 'ws://localhost:8080');
    });

    test('应正确显示带路径的完整URL', async () => {
      await selectProtocol(contentPage, 'ws');
      await fillUrl(contentPage, 'echo.websocket.org/socket');
      await verifyFullConnectionUrl(contentPage, 'ws://echo.websocket.org/socket');
    });
  });

  test.describe('2.6 连接按钮状态测试', () => {
    test('未输入URL时应能点击连接按钮', async () => {
      const connectBtn = contentPage.locator('button:has-text("发起连接")');
      await expect(connectBtn).toBeEnabled();
    });

    test('连接中时不应显示发起连接按钮', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      const connectBtn = contentPage.locator('button:has-text("发起连接")');
      await expect(connectBtn).not.toBeVisible();
      const connectingBtn = contentPage.locator('button:has-text("连接中")');
      await expect(connectingBtn).toBeVisible();
    });

    test('已连接时应显示断开连接按钮', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await verifyDisconnectButtonVisible(contentPage);
    });

    test('断开连接后应隐藏断开连接按钮', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      await verifyDisconnectButtonHidden(contentPage);
    });
  });

  test.describe('2.7 WSS协议连接测试', () => {
    test('应能通过WSS协议连接', async () => {
      await selectProtocol(contentPage, 'wss');
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await verifyConnectionStatus(contentPage, 'connected');
    });

    test('WSS连接成功后完整URL应为wss://', async () => {
      await selectProtocol(contentPage, 'wss');
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('wss://');
    });

    test('应能断开WSS连接', async () => {
      await selectProtocol(contentPage, 'wss');
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      await verifyConnectionStatus(contentPage, 'disconnected');
    });
  });

  test.describe('2.8 连接超时测试', () => {
    test('连接不存在的服务器应最终显示错误状态', async () => {
      await fillUrl(contentPage, 'this-domain-does-not-exist-12345.com');
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(5000);
      const reconnectBtn = contentPage.locator('button:has-text("重新连接")');
      const isVisible = await reconnectBtn.isVisible();
      expect(isVisible).toBe(true);
    });
  });
});
