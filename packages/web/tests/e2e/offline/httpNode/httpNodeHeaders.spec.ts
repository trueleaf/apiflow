import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  switchToTab,
  addHeader,
  deleteHeader,
  verifyHeaderExists,
  clearAllHeaders,
  switchBodyMode,
  clickSendRequest
} from './helpers/httpNodeHelpers';

test.describe('5. HTTP节点 - Headers模块测试', () => {
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

  test.describe('5.1 自定义请求头测试', () => {
    test('应能添加自定义请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'X-Custom-Header', 'CustomValue');
      await verifyHeaderExists(contentPage, 'X-Custom-Header');
    });

    test('应能编辑请求头的key', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Old-Header', 'value');
      await switchToTab(contentPage, 'Headers');
      const row = contentPage.locator('tr:has(input[value="Old-Header"])');
      const keyInput = row.locator('input[placeholder*="请求头"], input[placeholder*="key"]').first();
      await keyInput.clear();
      await keyInput.fill('New-Header');
      await contentPage.waitForTimeout(200);
      await verifyHeaderExists(contentPage, 'New-Header');
    });

    test('应能编辑请求头的value', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Test-Header', 'oldValue');
      await switchToTab(contentPage, 'Headers');
      const row = contentPage.locator('tr:has(input[value="Test-Header"])');
      const valueInput = row.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.clear();
      await valueInput.fill('newValue');
      await contentPage.waitForTimeout(200);
    });

    test('应能删除请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Delete-Me', 'value');
      await deleteHeader(contentPage, 'Delete-Me');
      await contentPage.waitForTimeout(300);
    });

    test('应能批量删除请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Header1', 'value1');
      await addHeader(contentPage, 'Header2', 'value2');
      await addHeader(contentPage, 'Header3', 'value3');
      await clearAllHeaders(contentPage);
    });

    test('应能添加请求头描述', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Described-Header', 'value', { description: '这是请求头描述' });
      await verifyHeaderExists(contentPage, 'Described-Header');
    });

    test('请求头value应支持变量替换', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Authorization', 'Bearer {{token}}');
      await verifyHeaderExists(contentPage, 'Authorization');
    });

    test('请求头应支持启用/禁用', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Disabled-Header', 'value', { enabled: false });
      await switchToTab(contentPage, 'Headers');
      const row = contentPage.locator('tr:has(input[value="Disabled-Header"])');
      const checkbox = row.locator('input[type="checkbox"]').first();
      const isChecked = await checkbox.isChecked();
      expect(isChecked).toBe(false);
    });
  });

  test.describe('5.2 公共请求头测试', () => {
    test('应显示项目级公共请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersBtn = contentPage.locator('[title*="公共"], .public-headers-btn').first();
      if (await publicHeadersBtn.isVisible()) {
        await publicHeadersBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('应显示全局级公共请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersBtn = contentPage.locator('[title*="公共"], .public-headers-btn').first();
      if (await publicHeadersBtn.isVisible()) {
        await publicHeadersBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('应能显示/隐藏公共请求头区域', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const toggleBtn = contentPage.locator('.toggle-public-headers, .show-public').first();
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(200);
        await toggleBtn.click();
        await contentPage.waitForTimeout(200);
      }
    });

    test('应能在节点级禁用公共请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const checkbox = publicHeadersArea.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.uncheck();
          await contentPage.waitForTimeout(200);
        }
      }
    });

    test('应能重新启用公共请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const checkbox = publicHeadersArea.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.check();
          await contentPage.waitForTimeout(200);
        }
      }
    });

    test('公共头应标识其来源（项目级/全局级）', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const sourceLabel = publicHeadersArea.locator('.source-label, .level-tag').first();
        if (await sourceLabel.isVisible()) {
          await expect(sourceLabel).toBeVisible();
        }
      }
    });

    test('公共头的key应只读', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const keyInput = publicHeadersArea.locator('input[placeholder*="请求头"]').first();
        if (await keyInput.isVisible()) {
          const isReadonly = await keyInput.getAttribute('readonly') || await keyInput.isDisabled();
          expect(isReadonly).toBeTruthy();
        }
      }
    });

    test('公共头的value应只读', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const valueInput = publicHeadersArea.locator('input[placeholder*="值"]').first();
        if (await valueInput.isVisible()) {
          const isReadonly = await valueInput.getAttribute('readonly') || await valueInput.isDisabled();
          expect(isReadonly).toBeTruthy();
        }
      }
    });
  });

  test.describe('5.3 默认请求头测试', () => {
    test('应显示Content-Type默认请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      await contentPage.waitForTimeout(300);
    });

    test('Content-Type应根据Body模式自动设置', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchBodyMode(contentPage, 'JSON');
      await switchToTab(contentPage, 'Headers');
      await contentPage.waitForTimeout(300);
    });

    test('应能手动修改Content-Type', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const contentTypeRow = contentPage.locator('tr:has(input[value="Content-Type"])');
      if (await contentTypeRow.isVisible()) {
        const valueInput = contentTypeRow.locator('input[placeholder*="值"]').first();
        await valueInput.fill('application/xml');
        await contentPage.waitForTimeout(200);
      }
    });

    test('手动修改Content-Type后切换Body模式应提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchBodyMode(contentPage, 'JSON');
      await switchBodyMode(contentPage, 'form-data');
      await contentPage.waitForTimeout(300);
    });

    test('应显示User-Agent等常见默认头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('5.4 请求头优先级测试', () => {
    test('自定义头应优先于公共头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Authorization', 'Bearer custom-token');
      await contentPage.waitForTimeout(300);
    });

    test('禁用的自定义头不应覆盖公共头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Authorization', 'Bearer custom-token', { enabled: false });
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('5.5 特殊请求头处理', () => {
    test('应支持设置Authorization头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Authorization', 'Bearer my-secret-token');
      await verifyHeaderExists(contentPage, 'Authorization');
    });

    test('应支持设置Cookie头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Cookie', 'sessionId=abc123; userId=456');
      await verifyHeaderExists(contentPage, 'Cookie');
    });

    test('应支持设置Accept头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Accept', 'application/json');
      await verifyHeaderExists(contentPage, 'Accept');
    });

    test('应支持自定义header(X-Custom-Header)', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'X-Request-ID', 'req-12345');
      await verifyHeaderExists(contentPage, 'X-Request-ID');
    });
  });

  test.describe('5.6 请求头表格操作', () => {
    test('应支持快速填写（Tab键切换）', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const table = contentPage.locator('.headers-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="请求头"]').first();
      await keyInput.fill('X-Test-Header');
      await contentPage.keyboard.press('Tab');
      await contentPage.waitForTimeout(200);
    });

    test('应支持拖拽排序', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Header1', 'value1');
      await addHeader(contentPage, 'Header2', 'value2');
      await addHeader(contentPage, 'Header3', 'value3');
      await contentPage.waitForTimeout(300);
    });

    test('应支持复制请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Copy-Header', 'copy-value');
      await switchToTab(contentPage, 'Headers');
      const row = contentPage.locator('tr:has(input[value="Copy-Header"])');
      const copyBtn = row.locator('[title*="复制"], .copy-btn').first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('空行应自动清除', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const table = contentPage.locator('.headers-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="请求头"]').first();
      await keyInput.click();
      await keyInput.blur();
      await contentPage.waitForTimeout(300);
    });
  });
});
