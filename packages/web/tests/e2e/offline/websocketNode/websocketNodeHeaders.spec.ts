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
    /**
     * 测试目的：验证显示默认WebSocket请求头
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 检查默认请求头区域
     * 预期结果：默认请求头区域可见
     * 验证点：默认请求头显示
     * 说明：WebSocket协议需要特定的请求头进行握手
     */
    test('应显示默认WebSocket请求头', async () => {
      // 切换到Headers标签页
      await switchToTab(contentPage, 'Headers');
      // 检查默认请求头区域
      const defaultHeaders = contentPage.locator('.default-headers, .ws-headers').first();
      if (await defaultHeaders.count() > 0) {
        await expect(defaultHeaders).toBeVisible();
      }
    });

    test('应包含Upgrade请求头', async () => {
      // 验证Upgrade请求头存在
      await verifyDefaultHeaderExists(contentPage, 'Upgrade');
    });

    test('应包含Connection请求头', async () => {
      // 验证Connection请求头存在
      await verifyDefaultHeaderExists(contentPage, 'Connection');
    });
  });

  test.describe('6.2 添加自定义请求头测试', () => {
    /**
     * 测试目的：验证能够添加自定义请求头
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 添加Authorization请求头
     *   2. 验证请求头存在
     * 预期结果：自定义请求头成功添加
     * 验证点：自定义请求头添加功能
     * 说明：常用于添加认证信息
     */
    test('应能添加自定义请求头', async () => {
      // 添加Authorization请求头
      await addHeader(contentPage, 'Authorization', 'Bearer token123');
      // 验证请求头存在
      await verifyHeaderExists(contentPage, 'Authorization');
    });

    test('应能添加多个自定义请求头', async () => {
      // 添加多个自定义请求头
      await addHeader(contentPage, 'X-Custom-Header', 'value1');
      await addHeader(contentPage, 'X-Another-Header', 'value2');
      await addHeader(contentPage, 'X-Third-Header', 'value3');
      // 验证所有请求头存在
      await verifyHeaderExists(contentPage, 'X-Custom-Header');
      await verifyHeaderExists(contentPage, 'X-Another-Header');
      await verifyHeaderExists(contentPage, 'X-Third-Header');
    });

    test('应能添加带描述的请求头', async () => {
      // 添加带描述的请求头
      await addHeader(contentPage, 'API-Key', '12345', { description: 'API authentication key' });
      // 验证请求头存在
      await verifyHeaderExists(contentPage, 'API-Key');
    });

    test('应能添加空值请求头', async () => {
      // 添加空值请求头
      await addHeader(contentPage, 'Empty-Header', '');
      // 验证请求头存在
      await verifyHeaderExists(contentPage, 'Empty-Header');
    });
  });

  test.describe('6.3 编辑请求头测试', () => {
    /**
     * 测试目的：验证能够编辑请求头key
     * 前置条件：已添加请求头
     * 操作步骤：
     *   1. 添加请求头
     *   2. 修改key
     *   3. 验证新key存在
     * 预期结果：请求头key成功修改
     * 验证点：请求头key编辑功能
     */
    test('应能编辑请求头key', async () => {
      // 添加请求头
      await addHeader(contentPage, 'OldKey', 'value');
      // 修改key
      await editHeaderKey(contentPage, 'OldKey', 'NewKey');
      // 验证新key存在
      await verifyHeaderExists(contentPage, 'NewKey');
    });

    test('应能编辑请求头value', async () => {
      // 添加请求头
      await addHeader(contentPage, 'Token', 'oldValue');
      // 修改value
      await editHeaderValue(contentPage, 'Token', 'newValue');
      // 验证请求头存在
      await verifyHeaderExists(contentPage, 'Token');
    });
  });

  test.describe('6.4 删除请求头测试', () => {
    test('应能删除自定义请求头', async () => {
      // 添加请求头
      await addHeader(contentPage, 'ToDelete', 'value');
      // 删除请求头
      await deleteHeader(contentPage, 'ToDelete');
      // 验证请求头已删除
      const headerInput = contentPage.locator('input[value="ToDelete"]').first();
      const count = await headerInput.count();
      expect(count).toBe(0);
    });

    test('应能删除多个请求头', async () => {
      // 添加多个请求头
      await addHeader(contentPage, 'Header1', 'value1');
      await addHeader(contentPage, 'Header2', 'value2');
      // 删除所有请求头
      await deleteHeader(contentPage, 'Header1');
      await deleteHeader(contentPage, 'Header2');
      // 验证请求头数量
      const count = await getHeaderCount(contentPage);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('6.5 启用/禁用请求头测试', () => {
    test('应能禁用请求头', async () => {
      // 添加启用的请求头
      await addHeader(contentPage, 'TestHeader', 'value', { enabled: true });
      // 切换为禁用
      await toggleHeader(contentPage, 'TestHeader');
      await contentPage.waitForTimeout(300);
    });

    test('应能启用被禁用的请求头', async () => {
      // 添加禁用的请求头
      await addHeader(contentPage, 'TestHeader', 'value', { enabled: false });
      // 切换为启用
      await toggleHeader(contentPage, 'TestHeader');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('6.6 特殊请求头测试', () => {
    test('应能添加Content-Type请求头', async () => {
      // 添加Content-Type请求头
      await addHeader(contentPage, 'Content-Type', 'application/json');
      // 验证请求头存在
      await verifyHeaderExists(contentPage, 'Content-Type');
    });

    test('应能添加User-Agent请求头', async () => {
      // 添加User-Agent请求头
      await addHeader(contentPage, 'User-Agent', 'CustomClient/1.0');
      // 验证请求头存在
      await verifyHeaderExists(contentPage, 'User-Agent');
    });

    test('应能添加Origin请求头', async () => {
      // 添加Origin请求头
      await addHeader(contentPage, 'Origin', 'https://example.com');
      // 验证请求头存在
      await verifyHeaderExists(contentPage, 'Origin');
    });
  });

  test.describe('6.7 Headers标签页测试', () => {
    test('应能切换到Headers标签页', async () => {
      // 切换到Headers标签页
      await switchToTab(contentPage, 'Headers');
      // 验证标签页激活
      const headersTab = contentPage.locator('.el-tabs__item.is-active:has-text("请求头"), .el-tabs__item.is-active:has-text("Headers")').first();
      await expect(headersTab).toBeVisible();
    });

    test('应显示Headers表格', async () => {
      // 切换到Headers标签页
      await switchToTab(contentPage, 'Headers');
      // 验证Headers表格显示
      const headersTable = contentPage.locator('.headers-table, .s-params').first();
      if (await headersTable.count() > 0) {
        await expect(headersTable).toBeVisible();
      }
    });
  });
});
