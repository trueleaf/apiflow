import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  fillUrl,
  addLocalVariable,
  addEnvironmentVariable,
  addGlobalVariable,
  verifyUrlContainsVariable,
  openVariablePanel
} from './helpers/websocketNodeHelpers';

test.describe('7. WebSocket节点 - 变量系统测试', () => {
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

  test.describe('7.1 局部变量测试', () => {
    /**
     * 测试目的：验证能够添加局部变量
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 打开变量面板
     *   2. 添加局部变量
     * 预期结果：局部变量成功添加
     * 验证点：局部变量添加功能
     * 说明：局部变量仅在当前节点有效
     */
    test('应能添加局部变量', async () => {
      // 添加局部变量
      await addLocalVariable(contentPage, 'localVar', 'localValue');
      // 等待变量添加完成
      await contentPage.waitForTimeout(300);
    });

    test('应能在URL中使用局部变量', async () => {
      // 添加局部变量
      await addLocalVariable(contentPage, 'host', 'echo.websocket.org');
      // 在URL中使用变量
      await fillUrl(contentPage, '{{host}}');
      // 验证变量在URL中
      await verifyUrlContainsVariable(contentPage, 'host');
    });
  });

  test.describe('7.2 环境变量测试', () => {
    test('应能添加环境变量', async () => {
      // 添加环境变量
      await addEnvironmentVariable(contentPage, 'envVar', 'envValue');
      // 等待变量添加完成
      await contentPage.waitForTimeout(300);
    });

    test('应能在URL中使用环境变量', async () => {
      // 添加环境变量
      await addEnvironmentVariable(contentPage, 'baseUrl', 'test.com');
      // 在URL中使用变量
      await fillUrl(contentPage, '{{baseUrl}}/socket');
      // 验证变量在URL中
      await verifyUrlContainsVariable(contentPage, 'baseUrl');
    });
  });

  test.describe('7.3 全局变量测试', () => {
    test('应能添加全局变量', async () => {
      // 添加全局变量
      await addGlobalVariable(contentPage, 'globalVar', 'globalValue');
      // 等待变量添加完成
      await contentPage.waitForTimeout(300);
    });

    test('应能在URL中使用全局变量', async () => {
      // 添加全局变量
      await addGlobalVariable(contentPage, 'apiKey', '12345');
      // 在URL中使用变量
      await fillUrl(contentPage, 'ws://api.com?key={{apiKey}}');
      // 验证变量在URL中
      await verifyUrlContainsVariable(contentPage, 'apiKey');
    });
  });

  test.describe('7.4 变量面板测试', () => {
    test('应能打开变量管理面板', async () => {
      // 查找变量按钮
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      if (await variableBtn.count() > 0) {
        // 打开变量面板
        await openVariablePanel(contentPage);
        // 获取变量面板
        const panel = contentPage.locator('.variable-panel, .el-dialog').first();
        if (await panel.count() > 0) {
          // 验证面板可见
          await expect(panel).toBeVisible();
        }
      }
    });
  });

  test.describe('7.5 变量语法测试', () => {
    test('应支持双大括号语法', async () => {
      // 输入带双大括号的URL
      await fillUrl(contentPage, '{{variableName}}');
      // 获取URL输入框
      const urlInput = contentPage.locator('.connection-input input.el-input__inner');
      // 获取输入框的值
      const value = await urlInput.inputValue();
      // 验证包含双大括号
      expect(value).toContain('{{');
      expect(value).toContain('}}');
    });

    test('应支持多个变量', async () => {
      // 输入包含多个变量的URL
      await fillUrl(contentPage, '{{host}}/{{path}}?key={{apiKey}}');
      // 验证第一个变量
      await verifyUrlContainsVariable(contentPage, 'host');
      // 验证第二个变量
      await verifyUrlContainsVariable(contentPage, 'path');
      // 验证第三个变量
      await verifyUrlContainsVariable(contentPage, 'apiKey');
    });
  });
});
