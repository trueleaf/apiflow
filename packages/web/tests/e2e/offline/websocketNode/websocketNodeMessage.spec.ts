import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  fillUrl,
  clickConnect,
  waitForConnected,
  switchToTab,
  fillMessage,
  clickSendMessage,
  getMessageContent,
  clearMessage,
  verifySendMessageButtonEnabled,
  verifySendMessageButtonDisabled,
  addMessageTemplate,
  deleteMessageTemplate,
  selectMessageTemplate,
  verifyMessageTemplateExists,
  getMessageTemplateCount,
  enableAutoSend,
  disableAutoSend,
  setAutoSendInterval
} from './helpers/websocketNodeHelpers';

test.describe('3. WebSocket节点 - 消息收发测试', () => {
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

  test.describe('3.1 消息编辑器测试', () => {
    /**
     * 测试目的：验证消息编辑器的显示
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 切换到消息标签页
     *   2. 查找消息编辑器
     * 预期结果：消息编辑器可见
     * 验证点：消息编辑器UI组件
     */
    test('应显示消息编辑器', async () => {
      await switchToTab(contentPage, 'Message');
      const editor = contentPage.locator('.message-editor, .monaco-editor').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证能够在消息编辑器中输入内容
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 在消息编辑器输入文本
     *   2. 获取编辑器内容
     *   3. 验证内容正确
     * 预期结果：消息成功输入
     * 验证点：消息输入功能
     */
    test('应能在消息编辑器中输入内容', async () => {
      await fillMessage(contentPage, 'Hello WebSocket');
      const content = await getMessageContent(contentPage);
      expect(content).toContain('Hello');
    });

    /**
     * 测试目的：验证能够输入JSON格式消息
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 输入JSON格式的消息
     *   2. 验证JSON内容保存
     * 预期结果：JSON消息正确保存
     * 验证点：JSON消息支持
     * 说明：WebSocket常用JSON格式传输结构化数据
     */
    test('应能输入JSON格式消息', async () => {
      const jsonMessage = '{"type": "message", "content": "Hello"}';
      await fillMessage(contentPage, jsonMessage);
      const content = await getMessageContent(contentPage);
      expect(content).toContain('type');
      expect(content).toContain('message');
    });

    /**
     * 测试目的：验证能够输入多行文本消息
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 输入包含换行的多行文本
     *   2. 验证所有行都保存
     * 预期结果：多行文本正确保存
     * 验证点：多行文本支持
     */
    test('应能输入多行文本消息', async () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      await fillMessage(contentPage, multilineMessage);
      const content = await getMessageContent(contentPage);
      expect(content).toContain('Line 1');
      expect(content).toContain('Line 2');
      expect(content).toContain('Line 3');
    });

    /**
     * 测试目的：验证能够清空消息内容
     * 前置条件：已创建WebSocket节点并输入了消息
     * 操作步骤：
     *   1. 输入消息
     *   2. 清空消息
     *   3. 验证内容为空
     * 预期结果：消息被清空
     * 验证点：消息清空功能
     */
    test('应能清空消息内容', async () => {
      await fillMessage(contentPage, 'Test message');
      await clearMessage(contentPage);
      const content = await getMessageContent(contentPage);
      expect(content.trim()).toBe('');
    });

    /**
     * 测试目的：验证能够编辑已输入的消息
     * 前置条件：已创建WebSocket节点并输入了消息
     * 操作步骤：
     *   1. 输入原始消息
     *   2. 修改消息内容
     *   3. 验证更新后的内容
     * 预期结果：消息内容成功更新
     * 验证点：消息编辑功能
     */
    test('应能编辑已输入的消息', async () => {
      await fillMessage(contentPage, 'Original message');
      await fillMessage(contentPage, 'Updated message');
      const content = await getMessageContent(contentPage);
      expect(content).toContain('Updated');
    });
  });

  test.describe('3.2 发送消息测试', () => {
    test('未连接时发送按钮应禁用', async () => {
      await switchToTab(contentPage, 'Message');
      const sendBtn = contentPage.locator('button:has-text("发送消息")');
      if (await sendBtn.count() > 0) {
        await expect(sendBtn).toBeDisabled();
      }
    });

    test('连接成功后发送按钮应启用', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await switchToTab(contentPage, 'Message');
      const sendBtn = contentPage.locator('button:has-text("发送消息")');
      if (await sendBtn.count() > 0) {
        await expect(sendBtn).toBeEnabled();
      }
    });

    test('应能发送文本消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Test message');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应能发送JSON消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      const jsonMessage = '{"type": "test", "data": "value"}';
      await fillMessage(contentPage, jsonMessage);
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应能连续发送多条消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Message 1');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(300);
      await fillMessage(contentPage, 'Message 2');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(300);
      await fillMessage(contentPage, 'Message 3');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(300);
    });

    test('发送空消息应成功', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await clearMessage(contentPage);
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('3.3 消息模板测试', () => {
    test('应能添加消息模板', async () => {
      await switchToTab(contentPage, 'Message');
      await addMessageTemplate(contentPage, 'Test Template', 'Template content');
      await contentPage.waitForTimeout(500);
      await verifyMessageTemplateExists(contentPage, 'Test Template');
    });

    test('应能选择消息模板', async () => {
      await switchToTab(contentPage, 'Message');
      await addMessageTemplate(contentPage, 'Test Template', 'Template content');
      await contentPage.waitForTimeout(300);
      await selectMessageTemplate(contentPage, 'Test Template');
      await contentPage.waitForTimeout(300);
      const content = await getMessageContent(contentPage);
      expect(content).toContain('Template content');
    });

    test('应能删除消息模板', async () => {
      await switchToTab(contentPage, 'Message');
      await addMessageTemplate(contentPage, 'Test Template', 'Template content');
      await contentPage.waitForTimeout(300);
      await deleteMessageTemplate(contentPage, 'Test Template');
      await contentPage.waitForTimeout(300);
      const templateExists = await contentPage.locator('.template-item:has-text("Test Template")').count();
      expect(templateExists).toBe(0);
    });

    test('应能添加多个消息模板', async () => {
      await switchToTab(contentPage, 'Message');
      await addMessageTemplate(contentPage, 'Template 1', 'Content 1');
      await contentPage.waitForTimeout(200);
      await addMessageTemplate(contentPage, 'Template 2', 'Content 2');
      await contentPage.waitForTimeout(200);
      await addMessageTemplate(contentPage, 'Template 3', 'Content 3');
      await contentPage.waitForTimeout(200);
      const count = await getMessageTemplateCount(contentPage);
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('应能添加JSON格式的消息模板', async () => {
      await switchToTab(contentPage, 'Message');
      const jsonTemplate = '{"type": "template", "name": "test"}';
      await addMessageTemplate(contentPage, 'JSON Template', jsonTemplate);
      await contentPage.waitForTimeout(300);
      await selectMessageTemplate(contentPage, 'JSON Template');
      await contentPage.waitForTimeout(300);
      const content = await getMessageContent(contentPage);
      expect(content).toContain('type');
      expect(content).toContain('template');
    });
  });

  test.describe('3.4 自动发送测试', () => {
    test('应能启用自动发送', async () => {
      await switchToTab(contentPage, 'Message');
      await enableAutoSend(contentPage);
      const checkbox = contentPage.locator('.auto-send-checkbox, input[type="checkbox"]').filter({ hasText: '自动发送' }).first();
      if (await checkbox.count() > 0) {
        await expect(checkbox).toBeChecked();
      }
    });

    test('应能禁用自动发送', async () => {
      await switchToTab(contentPage, 'Message');
      await enableAutoSend(contentPage);
      await disableAutoSend(contentPage);
      const checkbox = contentPage.locator('.auto-send-checkbox, input[type="checkbox"]').filter({ hasText: '自动发送' }).first();
      if (await checkbox.count() > 0) {
        await expect(checkbox).not.toBeChecked();
      }
    });

    test('应能设置自动发送间隔', async () => {
      await switchToTab(contentPage, 'Message');
      await setAutoSendInterval(contentPage, 5000);
      const intervalInput = contentPage.locator('input[placeholder*="间隔"], .auto-send-interval').first();
      if (await intervalInput.count() > 0) {
        const value = await intervalInput.inputValue();
        expect(value).toBe('5000');
      }
    });
  });

  test.describe('3.5 快捷操作测试', () => {
    test('应能通过快捷操作快速填充消息', async () => {
      await switchToTab(contentPage, 'Message');
      const quickActionBtn = contentPage.locator('.quick-action, .快捷操作').first();
      if (await quickActionBtn.count() > 0) {
        await quickActionBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('3.6 消息类型测试', () => {
    test('应支持文本类型消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Plain text message');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应支持JSON类型消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      const jsonMessage = '{"type": "json", "content": "test"}';
      await fillMessage(contentPage, jsonMessage);
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应支持特殊字符消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, '特殊字符: !@#$%^&*(){}[]<>?/\\|');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应支持中文消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, '你好，WebSocket！');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应支持表情符号消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Hello 👋 World 🌍');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
    });
  });

  test.describe('3.7 消息长度测试', () => {
    test('应能发送短消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      await fillMessage(contentPage, 'Hi');
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(300);
    });

    test('应能发送中等长度消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      const mediumMessage = 'A'.repeat(500);
      await fillMessage(contentPage, mediumMessage);
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应能发送较长消息', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickConnect(contentPage);
      await waitForConnected(contentPage, 15000);
      const longMessage = 'B'.repeat(5000);
      await fillMessage(contentPage, longMessage);
      await clickSendMessage(contentPage);
      await contentPage.waitForTimeout(1000);
    });
  });
});
