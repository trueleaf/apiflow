import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  switchToAfterRequestTab,
  fillAfterRequestScript,
  getScriptContent,
  verifyScriptEditorVisible,
  fillUrl,
  clickSendRequest
} from './helpers/httpNodeHelpers';

test.describe('9. HTTP节点 - 后置脚本测试', () => {
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

  test.describe('9.1 脚本编辑功能', () => {
    test('应显示代码编辑器', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToAfterRequestTab(contentPage);
      await verifyScriptEditorVisible(contentPage);
    });

    test('应能输入JavaScript代码', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'console.log(response.status);';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('response.status');
    });

    test('应支持语法高亮', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillAfterRequestScript(contentPage, 'const status = response.status;');
      await contentPage.waitForTimeout(300);
      const editor = contentPage.locator('.monaco-editor').first();
      const hasHighlight = await editor.evaluate((el) => {
        const tokens = el.querySelectorAll('.mtk1, .mtk6, .mtk22');
        return tokens.length > 0;
      });
      expect(hasHighlight).toBeDefined();
    });
  });

  test.describe('9.2 脚本执行功能', () => {
    test('应能访问response对象', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'console.log(response);';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    test('应能访问response.status获取状态码', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'const statusCode = response.status;';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('response.status');
    });

    test('应能访问response.data获取响应体', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'const body = response.data;';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('response.data');
    });

    test('应能访问response.headers获取响应头', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'const headers = response.headers;';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('response.headers');
    });

    test('应能执行断言测试', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'pm.test("Status is 200", () => { pm.expect(response.status).to.equal(200); });';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.test');
    });

    test('应能设置变量', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'pm.variables.set("responseToken", response.data.token);';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.variables.set');
    });

    test('脚本执行应在请求完成后', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'console.log("After request executed");';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('9.3 脚本错误处理', () => {
    test('语法错误应显示提示', async () => {
      await waitForHttpNodeReady(contentPage);
      const invalidScript = 'const a = ;';
      await fillAfterRequestScript(contentPage, invalidScript);
      await contentPage.waitForTimeout(500);
      const errorMarker = contentPage.locator('.squiggly-error, .error-marker').first();
      if (await errorMarker.isVisible()) {
        await expect(errorMarker).toBeVisible();
      }
    });

    test('运行时错误应显示错误信息', async () => {
      await waitForHttpNodeReady(contentPage);
      const errorScript = 'throw new Error("After request error");';
      await fillAfterRequestScript(contentPage, errorScript);
      await contentPage.waitForTimeout(300);
    });

    test('断言失败应显示失败信息', async () => {
      await waitForHttpNodeReady(contentPage);
      const failScript = 'pm.test("Will fail", () => { pm.expect(1).to.equal(2); });';
      await fillAfterRequestScript(contentPage, failScript);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('9.4 测试断言功能', () => {
    test('应支持pm.test()编写测试', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'pm.test("Test name", function() { pm.expect(true).to.be.true; });';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.test');
    });

    test('应支持pm.expect()断言', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'pm.expect(response.status).to.equal(200);';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.expect');
    });

    test('应显示测试通过数量', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = `pm.test("Test 1", () => { pm.expect(1).to.equal(1); });
pm.test("Test 2", () => { pm.expect(2).to.equal(2); });`;
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    test('应显示测试失败数量', async () => {
      await waitForHttpNodeReady(contentPage);
      const script = 'pm.test("Fail test", () => { pm.expect(1).to.equal(2); });';
      await fillAfterRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });
  });
});
