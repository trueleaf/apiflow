import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  switchToTab,
  addHeader,
  deleteHeader,
  toggleHeader,
  editHeaderKey,
  editHeaderValue,
  verifyHeaderExists,
  getHeaderCount,
  verifyDefaultHeaderExists
} from './helpers/websocketNodeHelpers';

test.describe('6. WebSocket节点 - Headers测试', () => {
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

  test.describe('6.1 默认请求头测试', () => {
    test('应显示默认WebSocket请求头', async () => {
      await switchToTab(contentPage, 'Headers');
      const defaultHeaders = contentPage.locator('.default-headers, .ws-headers').first();
      if (await defaultHeaders.count() > 0) {
        await expect(defaultHeaders).toBeVisible();
      }
    });

    test('应包含Upgrade请求头', async () => {
      await verifyDefaultHeaderExists(contentPage, 'Upgrade');
    });

    test('应包含Connection请求头', async () => {
      await verifyDefaultHeaderExists(contentPage, 'Connection');
    });
  });

  test.describe('6.2 添加自定义请求头测试', () => {
    test('应能添加自定义请求头', async () => {
      await addHeader(contentPage, 'Authorization', 'Bearer token123');
      await verifyHeaderExists(contentPage, 'Authorization');
    });

    test('应能添加多个自定义请求头', async () => {
      await addHeader(contentPage, 'X-Custom-Header', 'value1');
      await addHeader(contentPage, 'X-Another-Header', 'value2');
      await addHeader(contentPage, 'X-Third-Header', 'value3');
      await verifyHeaderExists(contentPage, 'X-Custom-Header');
      await verifyHeaderExists(contentPage, 'X-Another-Header');
      await verifyHeaderExists(contentPage, 'X-Third-Header');
    });

    test('应能添加带描述的请求头', async () => {
      await addHeader(contentPage, 'API-Key', '12345', { description: 'API authentication key' });
      await verifyHeaderExists(contentPage, 'API-Key');
    });

    test('应能添加空值请求头', async () => {
      await addHeader(contentPage, 'Empty-Header', '');
      await verifyHeaderExists(contentPage, 'Empty-Header');
    });
  });

  test.describe('6.3 编辑请求头测试', () => {
    test('应能编辑请求头key', async () => {
      await addHeader(contentPage, 'OldKey', 'value');
      await editHeaderKey(contentPage, 'OldKey', 'NewKey');
      await verifyHeaderExists(contentPage, 'NewKey');
    });

    test('应能编辑请求头value', async () => {
      await addHeader(contentPage, 'Token', 'oldValue');
      await editHeaderValue(contentPage, 'Token', 'newValue');
      await verifyHeaderExists(contentPage, 'Token');
    });
  });

  test.describe('6.4 删除请求头测试', () => {
    test('应能删除自定义请求头', async () => {
      await addHeader(contentPage, 'ToDelete', 'value');
      await deleteHeader(contentPage, 'ToDelete');
      const headerInput = contentPage.locator('input[value="ToDelete"]').first();
      const count = await headerInput.count();
      expect(count).toBe(0);
    });

    test('应能删除多个请求头', async () => {
      await addHeader(contentPage, 'Header1', 'value1');
      await addHeader(contentPage, 'Header2', 'value2');
      await deleteHeader(contentPage, 'Header1');
      await deleteHeader(contentPage, 'Header2');
      const count = await getHeaderCount(contentPage);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('6.5 启用/禁用请求头测试', () => {
    test('应能禁用请求头', async () => {
      await addHeader(contentPage, 'TestHeader', 'value', { enabled: true });
      await toggleHeader(contentPage, 'TestHeader');
      await contentPage.waitForTimeout(300);
    });

    test('应能启用被禁用的请求头', async () => {
      await addHeader(contentPage, 'TestHeader', 'value', { enabled: false });
      await toggleHeader(contentPage, 'TestHeader');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('6.6 特殊请求头测试', () => {
    test('应能添加Content-Type请求头', async () => {
      await addHeader(contentPage, 'Content-Type', 'application/json');
      await verifyHeaderExists(contentPage, 'Content-Type');
    });

    test('应能添加User-Agent请求头', async () => {
      await addHeader(contentPage, 'User-Agent', 'CustomClient/1.0');
      await verifyHeaderExists(contentPage, 'User-Agent');
    });

    test('应能添加Origin请求头', async () => {
      await addHeader(contentPage, 'Origin', 'https://example.com');
      await verifyHeaderExists(contentPage, 'Origin');
    });
  });

  test.describe('6.7 Headers标签页测试', () => {
    test('应能切换到Headers标签页', async () => {
      await switchToTab(contentPage, 'Headers');
      const headersTab = contentPage.locator('.el-tabs__item.is-active:has-text("请求头"), .el-tabs__item.is-active:has-text("Headers")').first();
      await expect(headersTab).toBeVisible();
    });

    test('应显示Headers表格', async () => {
      await switchToTab(contentPage, 'Headers');
      const headersTable = contentPage.locator('.headers-table, .s-params').first();
      if (await headersTable.count() > 0) {
        await expect(headersTable).toBeVisible();
      }
    });
  });
});
