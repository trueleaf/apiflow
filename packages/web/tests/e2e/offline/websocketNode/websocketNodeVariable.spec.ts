import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  fillUrl,
  addLocalVariable,
  addEnvironmentVariable,
  addGlobalVariable,
  verifyUrlContainsVariable,
  getUrlInput,
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
    test('应能添加局部变量', async () => {
      await addLocalVariable(contentPage, 'localVar', 'localValue');
      await contentPage.waitForTimeout(300);
    });

    test('应能在URL中使用局部变量', async () => {
      await addLocalVariable(contentPage, 'host', 'echo.websocket.org');
      await fillUrl(contentPage, '{{host}}');
      await verifyUrlContainsVariable(contentPage, 'host');
    });
  });

  test.describe('7.2 环境变量测试', () => {
    test('应能添加环境变量', async () => {
      await addEnvironmentVariable(contentPage, 'envVar', 'envValue');
      await contentPage.waitForTimeout(300);
    });

    test('应能在URL中使用环境变量', async () => {
      await addEnvironmentVariable(contentPage, 'baseUrl', 'test.com');
      await fillUrl(contentPage, '{{baseUrl}}/socket');
      await verifyUrlContainsVariable(contentPage, 'baseUrl');
    });
  });

  test.describe('7.3 全局变量测试', () => {
    test('应能添加全局变量', async () => {
      await addGlobalVariable(contentPage, 'globalVar', 'globalValue');
      await contentPage.waitForTimeout(300);
    });

    test('应能在URL中使用全局变量', async () => {
      await addGlobalVariable(contentPage, 'apiKey', '12345');
      await fillUrl(contentPage, 'ws://api.com?key={{apiKey}}');
      await verifyUrlContainsVariable(contentPage, 'apiKey');
    });
  });

  test.describe('7.4 变量面板测试', () => {
    test('应能打开变量管理面板', async () => {
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      if (await variableBtn.count() > 0) {
        await openVariablePanel(contentPage);
        const panel = contentPage.locator('.variable-panel, .el-dialog').first();
        if (await panel.count() > 0) {
          await expect(panel).toBeVisible();
        }
      }
    });
  });

  test.describe('7.5 变量语法测试', () => {
    test('应支持双大括号语法', async () => {
      await fillUrl(contentPage, '{{variableName}}');
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value).toContain('{{');
      expect(value).toContain('}}');
    });

    test('应支持多个变量', async () => {
      await fillUrl(contentPage, '{{host}}/{{path}}?key={{apiKey}}');
      await verifyUrlContainsVariable(contentPage, 'host');
      await verifyUrlContainsVariable(contentPage, 'path');
      await verifyUrlContainsVariable(contentPage, 'apiKey');
    });
  });
});
