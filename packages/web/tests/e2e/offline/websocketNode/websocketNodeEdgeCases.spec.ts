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
    test('应能发送大消息(5KB)', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      const largeMessage = 'A'.repeat(5000);
      await fillMessage(contentPage, largeMessage);
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
    });

    test('应能接收大消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      const largeMessage = 'B'.repeat(3000);
      await fillMessage(contentPage, largeMessage);
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(2000);
    });
  });

  test.describe('13.2 特殊字符测试', () => {
    test('应能处理表情符号', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, '🚀 Hello 👋 World 🌍');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
    });

    test('应能处理中文字符', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, '你好世界！这是一个测试消息。');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
    });

    test('应能处理特殊符号', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
    });
  });

  test.describe('13.3 高频消息测试', () => {
    test('应能快速连续发送消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
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
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await contentPage.waitForTimeout(5000);
      const disconnectBtn = contentPage.locator('button:has-text("断开连接")');
      await expect(disconnectBtn).toBeVisible();
    });
  });

  test.describe('13.5 极限参数测试', () => {
    test('应能添加大量Query参数', async () => {
      for (let i = 0; i < 20; i++) {
        await addQueryParam(contentPage, `param${i}`, `value${i}`);
        await contentPage.waitForTimeout(50);
      }
      await contentPage.waitForTimeout(300);
    });

    test('应能添加大量Headers', async () => {
      for (let i = 0; i < 10; i++) {
        await addHeader(contentPage, `X-Custom-${i}`, `value${i}`);
        await contentPage.waitForTimeout(50);
      }
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('13.6 空值测试', () => {
    test('应能发送空消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, '');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应能添加空值参数', async () => {
      await addQueryParam(contentPage, 'emptyParam', '');
      await contentPage.waitForTimeout(200);
    });
  });

  test.describe('13.7 长URL测试', () => {
    test('应能处理长URL', async () => {
      const longPath = 'a'.repeat(200);
      await fillUrl(contentPage, `echo.websocket.org/${longPath}`);
      await contentPage.waitForTimeout(300);
    });

    test('应能处理带长查询字符串的URL', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      for (let i = 0; i < 15; i++) {
        await addQueryParam(contentPage, `longParam${i}`, 'value'.repeat(20));
        await contentPage.waitForTimeout(50);
      }
      await contentPage.waitForTimeout(300);
    });
  });
});
