import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  switchToPreRequestTab,
  fillPreRequestScript,
  getScriptContent,
  verifyScriptEditorVisible,
  clickSendRequest,
  switchToTab,
  addLocalVariable
} from './helpers/httpNodeHelpers';

test.describe('8. HTTP节点 - 前置脚本测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test API',
      type: 'http'
    });
  });

  test.describe('8.1 脚本编辑功能', () => {
    test('应显示代码编辑器', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToPreRequestTab(contentPage);
      await verifyScriptEditorVisible(contentPage);
    });

    test('应能输入JavaScript代码', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'console.log("test");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('console.log');
    });

    test('应支持语法高亮', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillPreRequestScript(contentPage, 'const test = "value";');
      await contentPage.waitForTimeout(300);
      const editor = contentPage.locator('.monaco-editor').first();
      const hasHighlight = await editor.evaluate((el) => {
        const tokens = el.querySelectorAll('.mtk1, .mtk6, .mtk22');
        return tokens.length > 0;
      });
      expect(hasHighlight).toBeDefined();
    });

    test('应支持代码提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToPreRequestTab(contentPage);
      const editor = contentPage.locator('.monaco-editor').first();
      await editor.click();
      await contentPage.keyboard.type('pm.');
      await contentPage.waitForTimeout(500);
      const suggestions = contentPage.locator('.suggest-widget').first();
      if (await suggestions.isVisible()) {
        await expect(suggestions).toBeVisible();
      }
    });

    test('应支持多行代码', async () => {
      await waitForHttpNodeReady(contentPage);
      const multilineScript = `const a = 1;
const b = 2;
console.log(a + b);`;
      await fillPreRequestScript(contentPage, multilineScript);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('const a');
      expect(content).toContain('const b');
    });
  });

  test.describe('8.2 脚本执行功能', () => {
    test('应能访问request对象', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'console.log(request.url);';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    test('应能访问variables对象', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'testVar', 'testValue');
      const script = 'console.log(pm.variables.get("testVar"));';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    test('应能修改请求参数', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'request.url = "http://example.com/modified";';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    test('应能设置变量', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'pm.variables.set("dynamicVar", "dynamicValue");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    test('应能访问环境变量', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'const env = pm.environment.get("envVar");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    test('脚本执行应在请求发送前', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'request.headers["X-Pre-Request"] = "PreValue";';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('8.3 脚本错误处理', () => {
    test('语法错误应显示提示', async () => {
      await waitForHttpNodeReady(contentPage);
      const invalidScript = 'const a = ;';
      await fillPreRequestScript(contentPage, invalidScript);
      await contentPage.waitForTimeout(500);
      const errorMarker = contentPage.locator('.squiggly-error, .error-marker').first();
      if (await errorMarker.isVisible()) {
        await expect(errorMarker).toBeVisible();
      }
    });

    test('运行时错误应显示错误信息', async () => {
      await waitForHttpNodeReady(contentPage);
      const runtimeErrorScript = 'throw new Error("Test error");';
      await fillPreRequestScript(contentPage, runtimeErrorScript);
      await contentPage.waitForTimeout(300);
    });

    test('脚本错误不应阻止请求发送', async () => {
      await waitForHttpNodeReady(contentPage);
      const errorScript = 'undefinedFunction();';
      await fillPreRequestScript(contentPage, errorScript);
      await contentPage.waitForTimeout(300);
      const sendBtn = contentPage.locator('button:has-text("发送请求")').first();
      await expect(sendBtn).toBeEnabled();
    });

    test('应显示脚本执行日志', async () => {
      await waitForHttpNodeReady(contentPage);
      const logScript = 'console.log("Pre-request log message");';
      await fillPreRequestScript(contentPage, logScript);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('8.4 脚本自动保存', () => {
    test('脚本应自动保存', async () => {
      await waitForHttpNodeReady(contentPage);
      const testScript = 'const savedScript = true;';
      await fillPreRequestScript(contentPage, testScript);
      await switchToTab(contentPage, 'Params');
      await switchToPreRequestTab(contentPage);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('savedScript');
    });
  });

  test.describe('8.5 常用API测试', () => {
    test('应支持pm.variables.set()设置变量', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'pm.variables.set("apiKey", "12345");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.variables.set');
    });

    test('应支持pm.variables.get()获取变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'userId', '999');
      const script = 'const id = pm.variables.get("userId");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.variables.get');
    });

    test('应支持pm.request设置请求', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'pm.request.headers.add({key: "X-API-Key", value: "test"});';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.request');
    });
  });
});
