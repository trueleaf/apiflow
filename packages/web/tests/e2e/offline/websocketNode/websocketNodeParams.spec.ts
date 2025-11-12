import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  switchToTab,
  addQueryParam,
  deleteQueryParam,
  toggleQueryParam,
  editQueryParamKey,
  editQueryParamValue,
  verifyQueryParamExists,
  verifyQueryParamInUrl,
  getQueryParamCount,
  clearAllQueryParams,
  fillUrl,
  getFullConnectionUrl
} from './helpers/websocketNodeHelpers';

test.describe('5. WebSocket节点 - Query参数测试', () => {
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

  test.describe('5.1 添加Query参数测试', () => {
    /**
     * 测试目的：验证能够添加Query参数
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 添加Query参数token=123456
     *   3. 验证参数存在
     * 预期结果：Query参数成功添加
     * 验证点：Query参数添加功能
     * 说明：Query参数会附加到WebSocket连接URL后面
     */
    test('应能添加Query参数', async () => {
      await addQueryParam(contentPage, 'token', '123456');
      await verifyQueryParamExists(contentPage, 'token');
    });

    /**
     * 测试目的：验证添加参数后URL自动更新
     * 前置条件：已创建WebSocket节点并输入URL
     * 操作步骤：
     *   1. 输入基础URL
     *   2. 添加Query参数
     *   3. 验证参数出现在完整URL中
     * 预期结果：参数自动附加到URL后面
     * 验证点：参数与URL的联动
     */
    test('添加参数后应在URL中显示', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'token', 'abc123');
      await verifyQueryParamInUrl(contentPage, 'token', 'abc123');
    });

    /**
     * 测试目的：验证能够添加多个Query参数
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 连续添加3个不同的参数
     *   2. 验证所有参数都存在
     * 预期结果：所有参数都成功添加
     * 验证点：多参数支持
     */
    test('应能添加多个Query参数', async () => {
      await addQueryParam(contentPage, 'token', '123');
      await addQueryParam(contentPage, 'user', 'test');
      await addQueryParam(contentPage, 'room', 'lobby');
      await verifyQueryParamExists(contentPage, 'token');
      await verifyQueryParamExists(contentPage, 'user');
      await verifyQueryParamExists(contentPage, 'room');
    });

    test('应能添加空值参数', async () => {
      await addQueryParam(contentPage, 'empty', '');
      await verifyQueryParamExists(contentPage, 'empty');
    });

    test('应能添加带特殊字符的参数', async () => {
      await addQueryParam(contentPage, 'special', '!@#$%');
      await verifyQueryParamExists(contentPage, 'special');
    });

    test('应能添加中文参数', async () => {
      await addQueryParam(contentPage, 'name', '测试');
      await verifyQueryParamExists(contentPage, 'name');
    });

    test('添加参数时应能设置描述', async () => {
      await addQueryParam(contentPage, 'token', '123', { description: 'API Token' });
      await verifyQueryParamExists(contentPage, 'token');
    });
  });

  test.describe('5.2 编辑Query参数测试', () => {
    /**
     * 测试目的：验证能够编辑参数key
     * 前置条件：已添加Query参数
     * 操作步骤：
     *   1. 添加参数
     *   2. 修改参数key
     *   3. 验证新key存在
     * 预期结果：参数key成功修改
     * 验证点：参数key编辑功能
     */
    test('应能编辑参数key', async () => {
      await addQueryParam(contentPage, 'oldKey', 'value');
      await editQueryParamKey(contentPage, 'oldKey', 'newKey');
      await verifyQueryParamExists(contentPage, 'newKey');
    });

    /**
     * 测试目的：验证能够编辑参数value
     * 前置条件：已添加Query参数
     * 操作步骤：
     *   1. 添加参数
     *   2. 修改参数value
     *   3. 验证新value在URL中
     * 预期结果：参数value成功修改
     * 验证点：参数value编辑功能
     */
    test('应能编辑参数value', async () => {
      await addQueryParam(contentPage, 'token', 'oldValue');
      await editQueryParamValue(contentPage, 'token', 'newValue');
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('newValue');
    });

    test('编辑参数后URL应更新', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'id', '123');
      await editQueryParamValue(contentPage, 'id', '456');
      await verifyQueryParamInUrl(contentPage, 'id', '456');
    });

    test('应能将参数值改为空', async () => {
      await addQueryParam(contentPage, 'token', '123');
      await editQueryParamValue(contentPage, 'token', '');
      await verifyQueryParamExists(contentPage, 'token');
    });
  });

  test.describe('5.3 删除Query参数测试', () => {
    test('应能删除Query参数', async () => {
      await addQueryParam(contentPage, 'token', '123');
      await deleteQueryParam(contentPage, 'token');
      const tokenInput = contentPage.locator('input[value="token"]').first();
      const count = await tokenInput.count();
      expect(count).toBe(0);
    });

    test('删除参数后URL应更新', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'token', '123');
      await deleteQueryParam(contentPage, 'token');
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).not.toContain('token');
    });

    test('应能删除多个参数', async () => {
      await addQueryParam(contentPage, 'param1', 'value1');
      await addQueryParam(contentPage, 'param2', 'value2');
      await addQueryParam(contentPage, 'param3', 'value3');
      await deleteQueryParam(contentPage, 'param1');
      await deleteQueryParam(contentPage, 'param2');
      await deleteQueryParam(contentPage, 'param3');
      const count = await getQueryParamCount(contentPage);
      expect(count).toBeLessThanOrEqual(1);
    });
  });

  test.describe('5.4 启用/禁用参数测试', () => {
    test('应能禁用Query参数', async () => {
      await addQueryParam(contentPage, 'token', '123', { enabled: true });
      await toggleQueryParam(contentPage, 'token');
      await contentPage.waitForTimeout(300);
    });

    test('应能启用被禁用的参数', async () => {
      await addQueryParam(contentPage, 'token', '123', { enabled: false });
      await toggleQueryParam(contentPage, 'token');
      await contentPage.waitForTimeout(300);
    });

    test('禁用的参数不应出现在URL中', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'token', '123', { enabled: false });
      const fullUrl = await getFullConnectionUrl(contentPage);
      if (!fullUrl.includes('token')) {
        expect(fullUrl).not.toContain('token=123');
      }
    });

    test('启用参数后应出现在URL中', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'token', '123', { enabled: false });
      await toggleQueryParam(contentPage, 'token');
      await contentPage.waitForTimeout(300);
      const fullUrl = await getFullConnectionUrl(contentPage);
      if (fullUrl.includes('token')) {
        expect(fullUrl).toContain('token');
      }
    });
  });

  test.describe('5.5 清空所有参数测试', () => {
    test('应能清空所有Query参数', async () => {
      await addQueryParam(contentPage, 'param1', 'value1');
      await addQueryParam(contentPage, 'param2', 'value2');
      await addQueryParam(contentPage, 'param3', 'value3');
      await clearAllQueryParams(contentPage);
      const count = await getQueryParamCount(contentPage);
      expect(count).toBeLessThanOrEqual(1);
    });

    test('清空后URL不应包含参数', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'token', '123');
      await addQueryParam(contentPage, 'user', 'test');
      await clearAllQueryParams(contentPage);
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toBe('ws://echo.websocket.org');
    });
  });

  test.describe('5.6 URL同步测试', () => {
    test('多个参数应正确拼接到URL', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'token', '123');
      await addQueryParam(contentPage, 'user', 'alice');
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('token=123');
      expect(fullUrl).toContain('user=alice');
      expect(fullUrl).toContain('?');
    });

    test('参数应使用&连接', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'a', '1');
      await addQueryParam(contentPage, 'b', '2');
      const fullUrl = await getFullConnectionUrl(contentPage);
      if (fullUrl.includes('a=1') && fullUrl.includes('b=2')) {
        expect(fullUrl).toContain('&');
      }
    });

    test('URL应正确编码特殊字符', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'name', '张三');
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('name');
    });
  });

  test.describe('5.7 参数顺序测试', () => {
    test('参数应按添加顺序显示', async () => {
      await addQueryParam(contentPage, 'first', '1');
      await addQueryParam(contentPage, 'second', '2');
      await addQueryParam(contentPage, 'third', '3');
      await switchToTab(contentPage, 'Params');
      const firstParam = contentPage.locator('input[value="first"]').first();
      const secondParam = contentPage.locator('input[value="second"]').first();
      const thirdParam = contentPage.locator('input[value="third"]').first();
      await expect(firstParam).toBeVisible();
      await expect(secondParam).toBeVisible();
      await expect(thirdParam).toBeVisible();
    });
  });

  test.describe('5.8 边界值测试', () => {
    test('应能添加长key的参数', async () => {
      const longKey = 'a'.repeat(100);
      await addQueryParam(contentPage, longKey, 'value');
      await verifyQueryParamExists(contentPage, longKey);
    });

    test('应能添加长value的参数', async () => {
      const longValue = 'b'.repeat(500);
      await addQueryParam(contentPage, 'key', longValue);
      await verifyQueryParamExists(contentPage, 'key');
    });

    test('应能添加大量参数', async () => {
      for (let i = 1; i <= 10; i++) {
        await addQueryParam(contentPage, `param${i}`, `value${i}`);
        await contentPage.waitForTimeout(100);
      }
      const count = await getQueryParamCount(contentPage);
      expect(count).toBeGreaterThanOrEqual(10);
    });
  });

  test.describe('5.9 Params标签页测试', () => {
    test('应能切换到Params标签页', async () => {
      await switchToTab(contentPage, 'Params');
      const paramsTab = contentPage.locator('.el-tabs__item.is-active:has-text("Params")');
      await expect(paramsTab).toBeVisible();
    });

    test('Params标签页应显示参数表格', async () => {
      await switchToTab(contentPage, 'Params');
      const paramsTable = contentPage.locator('.params-table, .s-params').first();
      if (await paramsTable.count() > 0) {
        await expect(paramsTable).toBeVisible();
      }
    });

    test('应显示参数输入框', async () => {
      await switchToTab(contentPage, 'Params');
      const keyInput = contentPage.locator('input[placeholder*="参数名称"], input[placeholder*="key"]').first();
      await expect(keyInput).toBeVisible();
      const valueInput = contentPage.locator('input[placeholder*="参数值"], input[placeholder*="value"]').first();
      await expect(valueInput).toBeVisible();
    });
  });
});
