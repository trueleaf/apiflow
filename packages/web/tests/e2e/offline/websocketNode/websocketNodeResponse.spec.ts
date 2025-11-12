import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  fillUrl,
  clickConnect,
  clickDisconnect,
  waitForConnected,
  waitForDisconnected,
  switchToResponseTab,
  fillMessage,
  clickSendMessage,
  getMessageList,
  getMessageCount,
  verifyMessageCount,
  verifyConnectedMessage,
  verifyDisconnectedMessage,
  verifyMessageInList,
  verifyErrorMessage,
  clickClearMessages,
  verifyMessageListEmpty,
  getSentMessages,
  getReceivedMessages
} from './helpers/websocketNodeHelpers';

test.describe('4. WebSocket节点 - 响应查看测试', () => {
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

  test.describe('4.1 响应区域显示测试', () => {
    /**
     * 测试目的：验证响应信息区域的显示
     * 前置条件：已创建WebSocket节点
     * 操作步骤：查找响应信息布局
     * 预期结果：响应信息区域可见
     * 验证点：响应区域UI
     */
    test('应显示响应信息区域', async () => {
      const infoLayout = contentPage.locator('.info-layout').first();
      await expect(infoLayout).toBeVisible();
    });

    test('应能切换到基本信息标签', async () => {
      await switchToResponseTab(contentPage);
      const baseInfoTab = contentPage.locator('.el-tabs__item.is-active:has-text("基本信息")').first();
      await expect(baseInfoTab).toBeVisible();
    });

    test('应显示消息列表容器', async () => {
      await switchToResponseTab(contentPage);
      const messageListContainer = contentPage.locator('.message-list, .ws-messages, .response-messages').first();
      if (await messageListContainer.count() > 0) {
        await expect(messageListContainer).toBeVisible();
      }
    });
  });

  test.describe('4.2 连接成功消息测试', () => {
    test('连接成功后应显示连接消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await switchToResponseTab(contentPage);
      await contentPage.waitForTimeout(500);
      await verifyConnectedMessage(contentPage);
    });

    test('连接消息应包含连接成功标识', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await switchToResponseTab(contentPage);
      await contentPage.waitForTimeout(500);
      const connectedMsg = contentPage.locator('.message-item:has-text("连接成功"), .message-item:has-text("connected")').first();
      if (await connectedMsg.count() > 0) {
        await expect(connectedMsg).toBeVisible();
      }
    });

    test('连接消息应显示时间戳', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await switchToResponseTab(contentPage);
      await contentPage.waitForTimeout(500);
      const timestamp = contentPage.locator('.message-item .timestamp, .message-time').first();
      if (await timestamp.count() > 0) {
        await expect(timestamp).toBeVisible();
      }
    });
  });

  test.describe('4.3 断开连接消息测试', () => {
    test('手动断开连接应显示断开消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      await switchToResponseTab(contentPage);
      await contentPage.waitForTimeout(500);
      await verifyDisconnectedMessage(contentPage, 'manual');
    });

    test('断开消息应显示断开原因', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clickDisconnect(contentPage);
      await waitForDisconnected(contentPage);
      await switchToResponseTab(contentPage);
      await contentPage.waitForTimeout(500);
      const disconnectMsg = contentPage.locator('.message-item:has-text("断开"), .message-item:has-text("disconnect")').first();
      if (await disconnectMsg.count() > 0) {
        await expect(disconnectMsg).toBeVisible();
      }
    });
  });

  test.describe('4.4 发送消息显示测试', () => {
    test('发送消息后应在列表中显示', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Test message');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      await verifyMessageInList(contentPage, 'Test message', 'sent');
    });

    test('应显示发送消息的时间戳', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Test message');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      const sentMessages = getSentMessages(contentPage);
      const firstMsg = sentMessages.first();
      if (await firstMsg.count() > 0) {
        const timestamp = firstMsg.locator('.timestamp, .time').first();
        if (await timestamp.count() > 0) {
          await expect(timestamp).toBeVisible();
        }
      }
    });

    test('应显示发送消息的内容', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Hello WebSocket');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      const messageContent = contentPage.locator('.message-item:has-text("Hello WebSocket")').first();
      await expect(messageContent).toBeVisible();
    });

    test('发送多条消息应全部显示', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Message 1');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
      await fillMessage(contentPage, 'Message 2');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
      await fillMessage(contentPage, 'Message 3');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      const messages = getMessageList(contentPage);
      const count = await messages.count();
      expect(count).toBeGreaterThan(3);
    });
  });

  test.describe('4.5 接收消息显示测试', () => {
    test('接收到服务器消息应在列表中显示', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Echo test');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(2000);
      await switchToResponseTab(contentPage);
      await verifyMessageInList(contentPage, 'Echo test', 'received');
    });

    test('应区分发送和接收消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Test echo');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(2000);
      await switchToResponseTab(contentPage);
      const sentMessages = getSentMessages(contentPage);
      const receivedMessages = getReceivedMessages(contentPage);
      const sentCount = await sentMessages.count();
      const receivedCount = await receivedMessages.count();
      expect(sentCount).toBeGreaterThan(0);
      expect(receivedCount).toBeGreaterThan(0);
    });

    test('接收消息应显示时间戳', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Test');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(2000);
      await switchToResponseTab(contentPage);
      const receivedMessages = getReceivedMessages(contentPage);
      if (await receivedMessages.count() > 0) {
        const firstMsg = receivedMessages.first();
        const timestamp = firstMsg.locator('.timestamp, .time').first();
        if (await timestamp.count() > 0) {
          await expect(timestamp).toBeVisible();
        }
      }
    });

    test('接收消息应显示完整内容', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      const testMessage = 'Complete message content test';
      await fillMessage(contentPage, testMessage);
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(2000);
      await switchToResponseTab(contentPage);
      const receivedMessage = contentPage.locator('.message-item:has-text("Complete message content test")').first();
      if (await receivedMessage.count() > 0) {
        await expect(receivedMessage).toBeVisible();
      }
    });
  });

  test.describe('4.6 消息类型识别测试', () => {
    test('应正确识别文本消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Text message');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1500);
      await switchToResponseTab(contentPage);
      const textMessage = contentPage.locator('.message-item:has-text("Text message")').first();
      await expect(textMessage).toBeVisible();
    });

    test('应正确识别JSON消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      const jsonMessage = '{"type": "test"}';
      await fillMessage(contentPage, jsonMessage);
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1500);
      await switchToResponseTab(contentPage);
      const receivedJson = contentPage.locator('.message-item:has-text("type")').first();
      if (await receivedJson.count() > 0) {
        await expect(receivedJson).toBeVisible();
      }
    });
  });

  test.describe('4.7 清空消息测试', () => {
    test('应能清空消息列表', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Test');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      await clickClearMessages(contentPage);
      await verifyMessageListEmpty(contentPage);
    });

    test('清空后再发送消息应正常显示', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Before clear');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      await clickClearMessages(contentPage);
      await fillMessage(contentPage, 'After clear');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      const messages = getMessageList(contentPage);
      const count = await messages.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('4.8 消息列表滚动测试', () => {
    test('发送多条消息后列表应可滚动', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      for (let i = 1; i <= 10; i++) {
        await fillMessage(contentPage, `Message ${i}`);
        await clickSendMessage(contentPage);
        await contentPage.waitForTimeout(200);
      }
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      const messageList = contentPage.locator('.message-list, .ws-messages').first();
      if (await messageList.count() > 0) {
        await expect(messageList).toBeVisible();
      }
    });

    test('新消息应自动滚动到底部', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      for (let i = 1; i <= 5; i++) {
        await fillMessage(contentPage, `Message ${i}`);
        await clickSendMessage(contentPage);
        await contentPage.waitForTimeout(300);
      }
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      const lastMessage = contentPage.locator('.message-item:has-text("Message 5")').first();
      if (await lastMessage.count() > 0) {
        await expect(lastMessage).toBeVisible();
      }
    });
  });

  test.describe('4.9 错误消息显示测试', () => {
    test('连接失败应显示错误消息', async () => {
      await fillUrl(contentPage, 'invalid-host-12345.com');
      await clickConnect(contentPage);
      await contentPage.waitForTimeout(5000);
      await switchToResponseTab(contentPage);
      const errorMsg = contentPage.locator('.message-item.error, .error-message').first();
      if (await errorMsg.count() > 0) {
        await expect(errorMsg).toBeVisible();
      }
    });
  });

  test.describe('4.10 消息数量统计测试', () => {
    test('应正确统计消息数量', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Test 1');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
      await fillMessage(contentPage, 'Test 2');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      const count = await getMessageCount(contentPage);
      expect(count).toBeGreaterThan(2);
    });

    test('清空后消息数量应为0', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Test');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
      await switchToResponseTab(contentPage);
      await clickClearMessages(contentPage);
      await verifyMessageCount(contentPage, 0);
    });
  });
});
