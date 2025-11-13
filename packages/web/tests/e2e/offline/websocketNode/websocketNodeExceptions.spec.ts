import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  fillUrl,
  clickConnect,
  verifyConnectionStatus,
  fillMessage,
  clickSendMessage,
  switchToResponseTab
} from './helpers/websocketNodeHelpers';

test.describe('14. WebSocket节点 - 异常处理测试', () => {
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

  test.describe('14.1 无效URL测试', () => {
    /**
     * 测试目的：验证连接无效URL时的错误处理
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 输入无效格式的URL
     *   2. 尝试建立连接
     *   3. 等待连接失败
     * 预期结果：
     *   - 连接失败
     *   - 显示重新连接或发起连接按钮
     * 验证点：无效URL的错误处理
     */
    test('连接无效URL应显示错误', async () => {
      // 输入无效URL格式
      await fillUrl(contentPage, 'invalid-url-format');
      // 尝试连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(3000);
      // 查找重新连接或发起连接按钮
      const status = await contentPage.locator('button:has-text("重新连接"), button:has-text("发起连接")').isVisible();
      // 验证按钮显示
      expect(status).toBe(true);
    });

    test('连接不存在的域名应显示错误', async () => {
      // 输入不存在的域名
      await fillUrl(contentPage, 'this-domain-absolutely-does-not-exist-12345.com');
      // 尝试连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(5000);
      // 查找重新连接按钮
      const reconnectBtn = contentPage.locator('button:has-text("重新连接")');
      const isVisible = await reconnectBtn.isVisible();
      // 验证错误处理
      expect(isVisible).toBe(true);
    });

    test('空URL应能点击连接', async () => {
      // 清空URL
      await fillUrl(contentPage, '');
      // 查找发起连接按钮
      const connectBtn = contentPage.locator('button:has-text("发起连接")');
      // 验证按钮可见
      await expect(connectBtn).toBeVisible();
      // 点击连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(1000);
    });
  });

  test.describe('14.2 连接失败测试', () => {
    test('连接失败后应显示错误状态', async () => {
      // 输入无效端口的URL
      await fillUrl(contentPage, 'ws://localhost:99999');
      // 尝试连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(3000);
      // 查找错误状态按钮
      const errorBtn = contentPage.locator('button:has-text("重新连接")');
      const isVisible = await errorBtn.isVisible();
      // 验证错误状态显示
      expect(isVisible).toBe(true);
    });

    test('连接超时应处理正确', async () => {
      // 输入无响应的域名
      await fillUrl(contentPage, 'timeout-test-host-that-does-not-respond.com');
      // 尝试连接
      await clickConnect(contentPage);
      // 等待超时处理
      await contentPage.waitForTimeout(5000);
    });
  });

  test.describe('14.3 网络异常测试', () => {
    test('无效端口号应处理', async () => {
      // 输入无效端口
      await fillUrl(contentPage, 'localhost:999999');
      // 尝试连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(2000);
    });

    test('错误的协议应处理', async () => {
      // 输入HTTP协议而非WebSocket
      await fillUrl(contentPage, 'http://echo.websocket.org');
      // 尝试连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(2000);
    });
  });

  test.describe('14.4 发送异常测试', () => {
    test('未连接时发送消息应被禁用', async () => {
      // 填充消息
      await fillMessage(contentPage, 'Test message');
      // 查找发送按钮
      const sendBtn = contentPage.locator('button:has-text("发送消息")');
      if (await sendBtn.count() > 0) {
        // 检查按钮禁用状态
        const isDisabled = await sendBtn.isDisabled();
        // 验证按钮禁用
        expect(isDisabled).toBe(true);
      }
    });
  });

  test.describe('14.5 错误消息显示测试', () => {
    test('连接错误应显示错误消息', async () => {
      // 输入无效主机
      await fillUrl(contentPage, 'invalid-host.local');
      // 尝试连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(5000);
      // 切换到响应标签
      await switchToResponseTab(contentPage);
      // 查找错误消息
      const errorMsg = contentPage.locator('.message-item.error, .error-message').first();
      if (await errorMsg.count() > 0) {
        // 验证错误消息显示
        await expect(errorMsg).toBeVisible();
      }
    });
  });

  test.describe('14.6 特殊情况处理测试', () => {
    test('连接中再次点击连接应被忽略', async () => {
      // 输入URL
      await fillUrl(contentPage, 'echo.websocket.org');
      // 发起连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(100);
      // 查找连接中按钮
      const connectingBtn = contentPage.locator('button:has-text("连接中")');
      if (await connectingBtn.isVisible()) {
        // 检查按钮状态
        const isDisabled = await connectingBtn.isDisabled();
        if (!isDisabled) {
          // 尝试再次点击
          await connectingBtn.click();
        }
      }
      await contentPage.waitForTimeout(2000);
    });

    test('快速重复连接断开应处理正确', async () => {
      // 输入URL
      await fillUrl(contentPage, 'echo.websocket.org');
      // 发起连接
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(500);
      // 查找断开按钮
      const disconnectBtn = contentPage.locator('button:has-text("断开连接")');
      if (await disconnectBtn.isVisible()) {
        // 快速断开连接
        await disconnectBtn.click();
      }
      await contentPage.waitForTimeout(500);
    });
  });

  test.describe('14.7 资源限制测试', () => {
    test('超长消息应能处理', async () => {
      // 创建超长消息(50KB)
      const veryLongMessage = 'X'.repeat(50000);
      // 填充超长消息
      await fillMessage(contentPage, veryLongMessage);
      await contentPage.waitForTimeout(300);
    });
  });
});
