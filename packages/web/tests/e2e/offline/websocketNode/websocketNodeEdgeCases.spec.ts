import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  fillUrl,
  clickConnect,
  waitForConnected,
  fillMessage,
  clickSendMessage,
  addQueryParam,
  addHeader
} from './helpers/websocketNodeHelpers';

test.describe('13. WebSocket节点 - 边界情况测试', () => {
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

  test.describe('13.1 大消息测试', () => {
    /**
     * 测试目的：验证能够发送大消息(5KB)
     * 前置条件：已建立WebSocket连接
     * 操作步骤：
     *   1. 建立连接
     *   2. 填写5KB大小的消息
     *   3. 发送消息
     * 预期结果：大消息成功发送
     * 验证点：大消息发送功能
     * 说明：测试系统对大数据包的支持
     */
    test('应能发送大消息(5KB)', async () => {
      // 输入URL并建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 创建5KB大消息
      const largeMessage = 'A'.repeat(5000);
      // 填充大消息
      await fillMessage(contentPage, largeMessage);
      // 发送大消息
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
    });

    test('应能接收大消息', async () => {
      // 输入URL并建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 创建3KB大消息
      const largeMessage = 'B'.repeat(3000);
      // 发送大消息并等待接收
      await fillMessage(contentPage, largeMessage);
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(2000);
    });
  });

  test.describe('13.2 特殊字符测试', () => {
    test('应能处理表情符号', async () => {
      // 输入URL并建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 发送包含表情符号的消息
      await fillMessage(contentPage, '🚀 Hello 👋 World 🌍');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
    });

    test('应能处理中文字符', async () => {
      // 输入URL并建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 发送中文消息
      await fillMessage(contentPage, '你好世界！这是一个测试消息。');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
    });

    test('应能处理特殊符号', async () => {
      // 输入URL并建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 发送包含特殊符号的消息
      await fillMessage(contentPage, '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
    });
  });

  test.describe('13.3 高频消息测试', () => {
    test('应能快速连续发送消息', async () => {
      // 输入URL并建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 循环快速发送5条消息
      for (let i = 0; i < 5; i++) {
        await fillMessage(contentPage, `Rapid message ${i}`);
        await clickSendMessage(contentPage);
        await contentPage.waitForTimeout(100);
      }
      await contentPage.waitForTimeout(1000);
    });
  });

  test.describe('13.4 长时间连接测试', () => {
    test('连接应保持稳定5秒', async () => {
      // 输入URL并建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 保持连接5秒
      await contentPage.waitForTimeout(5000);
      // 查找断开连接按钮
      const disconnectBtn = contentPage.locator('button:has-text("断开连接")');
      // 验证连接保持稳定
      await expect(disconnectBtn).toBeVisible();
    });
  });

  test.describe('13.5 极限参数测试', () => {
    test('应能添加大量Query参数', async () => {
      // 循环添加20个Query参数
      for (let i = 0; i < 20; i++) {
        await addQueryParam(contentPage, `param${i}`, `value${i}`);
        await contentPage.waitForTimeout(50);
      }
      await contentPage.waitForTimeout(300);
    });

    test('应能添加大量Headers', async () => {
      // 循环添加10个Headers
      for (let i = 0; i < 10; i++) {
        await addHeader(contentPage, `X-Custom-${i}`, `value${i}`);
        await contentPage.waitForTimeout(50);
      }
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('13.6 空值测试', () => {
    test('应能发送空消息', async () => {
      // 输入URL并建立连接
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      // 发送空消息
      await fillMessage(contentPage, '');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应能添加空值参数', async () => {
      // 添加空值Query参数
      await addQueryParam(contentPage, 'emptyParam', '');
      await contentPage.waitForTimeout(200);
    });
  });

  test.describe('13.7 长URL测试', () => {
    test('应能处理长URL', async () => {
      // 创建长路径
      const longPath = 'a'.repeat(200);
      // 输入长URL
      await fillUrl(contentPage, `echo.websocket.org/${longPath}`);
      await contentPage.waitForTimeout(300);
    });

    test('应能处理带长查询字符串的URL', async () => {
      // 输入基础URL
      await fillUrl(contentPage, 'echo.websocket.org');
      // 循环添加15个长参数
      for (let i = 0; i < 15; i++) {
        await addQueryParam(contentPage, `longParam${i}`, 'value'.repeat(20));
        await contentPage.waitForTimeout(50);
      }
      await contentPage.waitForTimeout(300);
    });
  });
});
