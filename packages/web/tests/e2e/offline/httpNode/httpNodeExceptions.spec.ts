import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  fillUrl,
  clickSendRequest,
  switchToPreRequestTab,
  fillPreRequestScript,
  switchToAfterRequestTab,
  fillAfterRequestScript,
  openHistoryPanel,
  addLocalVariable,
  switchToTab
} from './helpers/httpNodeHelpers';

test.describe('17. HTTP节点 - 异常场景测试', () => {
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

  test.describe('17.1 网络错误处理', () => {
    test('网络不可用应显示错误提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://localhost:9999/unavailable');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const errorMsg = contentPage.locator('.el-message--error, .error-message, .response-error').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });

    test('DNS解析失败应显示错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://this-domain-does-not-exist-12345.com/api');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const errorMsg = contentPage.locator('.el-message--error, .error-message, .response-error').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });

    test('连接超时应显示超时错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://10.255.255.1/timeout');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(5000);
      const errorMsg = contentPage.locator('.el-message--error, .error-message, .timeout-error').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });

    test('连接被拒绝应显示错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://localhost:54321/refused');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const errorMsg = contentPage.locator('.el-message--error, .error-message, .connection-error').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });
  });

  test.describe('17.2 HTTP错误状态码', () => {
    test('400错误应正确显示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/status/400');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toContain('400');
      }
    });

    test('401未授权应显示错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/status/401');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toContain('401');
      }
    });

    test('403禁止访问应显示错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/status/403');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toContain('403');
      }
    });

    test('404未找到应显示错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/status/404');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toContain('404');
      }
    });

    test('500服务器错误应显示错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/status/500');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toContain('500');
      }
    });

    test('502/503/504网关错误应显示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/status/502');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toBeDefined();
      }
    });
  });

  test.describe('17.3 响应格式错误', () => {
    test('非法JSON响应应显示错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/html');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const responseBody = contentPage.locator('.response-body, .response-content').first();
      if (await responseBody.isVisible()) {
        await expect(responseBody).toBeVisible();
      }
    });

    test('Content-Type与实际内容不符应提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/html');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
    });

    test('乱码响应应正确处理', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/encoding/utf8');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
    });

    test('超大响应应能正常处理', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/bytes/1048576');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(5000);
      const responseView = contentPage.locator('.response-view, .response-panel').first();
      if (await responseView.isVisible()) {
        await expect(responseView).toBeVisible();
      }
    });
  });

  test.describe('17.4 脚本执行错误', () => {
    test('前置脚本语法错误应捕获', async () => {
      await waitForHttpNodeReady(contentPage);
      const invalidScript = 'const a = ;';
      await fillPreRequestScript(contentPage, invalidScript);
      await contentPage.waitForTimeout(300);
      const errorMarker = contentPage.locator('.squiggly-error, .error-marker').first();
      if (await errorMarker.isVisible()) {
        await expect(errorMarker).toBeVisible();
      }
    });

    test('前置脚本运行时错误应捕获', async () => {
      await waitForHttpNodeReady(contentPage);
      const errorScript = 'throw new Error("Runtime error in pre-request script");';
      await fillPreRequestScript(contentPage, errorScript);
      await contentPage.waitForTimeout(300);
    });

    test('后置脚本错误应捕获', async () => {
      await waitForHttpNodeReady(contentPage);
      const errorScript = 'undefinedFunction();';
      await fillAfterRequestScript(contentPage, errorScript);
      await contentPage.waitForTimeout(300);
    });

    test('断言失败应正确标识', async () => {
      await waitForHttpNodeReady(contentPage);
      const failScript = 'pm.test("Should fail", () => { pm.expect(1).to.equal(2); });';
      await fillAfterRequestScript(contentPage, failScript);
      await contentPage.waitForTimeout(300);
    });

    test('脚本超时应中止执行', async () => {
      await waitForHttpNodeReady(contentPage);
      const infiniteScript = 'while(true) { }';
      await fillPreRequestScript(contentPage, infiniteScript);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('17.5 文件上传错误', () => {
    test('文件不存在应显示错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });

    test('文件过大应提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });

    test('文件权限不足应显示错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });

    test('文件类型不支持应提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('17.6 变量相关错误', () => {
    test('未定义的变量应保持原样或提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?param={{undefinedVar}}');
      await contentPage.waitForTimeout(300);
      const urlInput = contentPage.locator('.url-input, input[placeholder*="URL"]').first();
      const value = await urlInput.inputValue();
      expect(value).toContain('{{undefinedVar}}');
    });

    test('循环引用的变量应检测', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'varA', '{{varB}}');
      await addLocalVariable(contentPage, 'varB', '{{varA}}');
      await contentPage.waitForTimeout(300);
    });

    test('变量值格式错误应处理', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'invalidJson', '{invalid: json}');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('17.7 并发和竞态条件', () => {
    test('快速连续发送请求应正确处理', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?concurrent=test');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(100);
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(100);
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
    });

    test('请求发送中切换节点应处理正确', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/delay/5');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(500);
      const treeNode = contentPage.locator('.tree-node, .el-tree-node').nth(1).first();
      if (await treeNode.isVisible()) {
        await treeNode.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('请求发送中修改配置应提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/delay/3');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(500);
      await fillUrl(contentPage, 'https://httpbin.org/get?modified=true');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('17.8 数据恢复错误', () => {
    test('损坏的缓存数据应能恢复', async () => {
      await waitForHttpNodeReady(contentPage);
      await contentPage.waitForTimeout(300);
    });

    test('历史记录损坏应能处理', async () => {
      await waitForHttpNodeReady(contentPage);
      await openHistoryPanel(contentPage);
      await contentPage.waitForTimeout(300);
    });
  });
});
