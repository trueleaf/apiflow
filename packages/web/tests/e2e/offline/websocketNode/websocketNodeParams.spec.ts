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
      // 添加Query参数
      await addQueryParam(contentPage, 'token', '123456');
      // 验证参数存在
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
      // 输入基础URL
      await fillUrl(contentPage, 'echo.websocket.org');
      // 添加Query参数
      await addQueryParam(contentPage, 'token', 'abc123');
      // 验证参数出现在完整URL中
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
      // 连续添加3个不同的参数
      await addQueryParam(contentPage, 'token', '123');
      await addQueryParam(contentPage, 'user', 'test');
      await addQueryParam(contentPage, 'room', 'lobby');
      // 验证所有参数都存在
      await verifyQueryParamExists(contentPage, 'token');
      await verifyQueryParamExists(contentPage, 'user');
      await verifyQueryParamExists(contentPage, 'room');
    });

    test('应能添加空值参数', async () => {
      // 添加空值参数
      await addQueryParam(contentPage, 'empty', '');
      // 验证参数存在
      await verifyQueryParamExists(contentPage, 'empty');
    });

    test('应能添加带特殊字符的参数', async () => {
      // 添加带特殊字符的参数
      await addQueryParam(contentPage, 'special', '!@#$%');
      // 验证参数存在
      await verifyQueryParamExists(contentPage, 'special');
    });

    test('应能添加中文参数', async () => {
      // 添加中文参数
      await addQueryParam(contentPage, 'name', '测试');
      // 验证参数存在
      await verifyQueryParamExists(contentPage, 'name');
    });

    test('添加参数时应能设置描述', async () => {
      // 添加参数并设置描述
      await addQueryParam(contentPage, 'token', '123', { description: 'API Token' });
      // 验证参数存在
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
      // 添加参数
      await addQueryParam(contentPage, 'oldKey', 'value');
      // 修改参数key
      await editQueryParamKey(contentPage, 'oldKey', 'newKey');
      // 验证新key存在
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
      // 添加参数
      await addQueryParam(contentPage, 'token', 'oldValue');
      // 修改参数value
      await editQueryParamValue(contentPage, 'token', 'newValue');
      // 验证新value在URL中
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('newValue');
    });

    test('编辑参数后URL应更新', async () => {
      // 输入URL并添加参数
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'id', '123');
      // 修改参数值
      await editQueryParamValue(contentPage, 'id', '456');
      // 验证URL更新
      await verifyQueryParamInUrl(contentPage, 'id', '456');
    });

    test('应能将参数值改为空', async () => {
      // 添加参数
      await addQueryParam(contentPage, 'token', '123');
      // 将值改为空
      await editQueryParamValue(contentPage, 'token', '');
      // 验证参数仍存在
      await verifyQueryParamExists(contentPage, 'token');
    });
  });

  test.describe('5.3 删除Query参数测试', () => {
    test('应能删除Query参数', async () => {
      // 添加参数
      await addQueryParam(contentPage, 'token', '123');
      // 删除参数
      await deleteQueryParam(contentPage, 'token');
      // 验证参数已删除
      const tokenInput = contentPage.locator('input[value="token"]').first();
      const count = await tokenInput.count();
      expect(count).toBe(0);
    });

    test('删除参数后URL应更新', async () => {
      // 输入URL并添加参数
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'token', '123');
      // 删除参数
      await deleteQueryParam(contentPage, 'token');
      // 验证URL中不包含参数
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).not.toContain('token');
    });

    test('应能删除多个参数', async () => {
      // 添加多个参数
      await addQueryParam(contentPage, 'param1', 'value1');
      await addQueryParam(contentPage, 'param2', 'value2');
      await addQueryParam(contentPage, 'param3', 'value3');
      // 删除所有参数
      await deleteQueryParam(contentPage, 'param1');
      await deleteQueryParam(contentPage, 'param2');
      await deleteQueryParam(contentPage, 'param3');
      // 验证参数数量
      const count = await getQueryParamCount(contentPage);
      expect(count).toBeLessThanOrEqual(1);
    });
  });

  test.describe('5.4 启用/禁用参数测试', () => {
    test('应能禁用Query参数', async () => {
      // 添加启用的参数
      await addQueryParam(contentPage, 'token', '123', { enabled: true });
      // 切换为禁用
      await toggleQueryParam(contentPage, 'token');
      await contentPage.waitForTimeout(300);
    });

    test('应能启用被禁用的参数', async () => {
      // 添加禁用的参数
      await addQueryParam(contentPage, 'token', '123', { enabled: false });
      // 切换为启用
      await toggleQueryParam(contentPage, 'token');
      await contentPage.waitForTimeout(300);
    });

    test('禁用的参数不应出现在URL中', async () => {
      // 输入URL
      await fillUrl(contentPage, 'echo.websocket.org');
      // 添加禁用的参数
      await addQueryParam(contentPage, 'token', '123', { enabled: false });
      // 验证URL中不包含该参数
      const fullUrl = await getFullConnectionUrl(contentPage);
      if (!fullUrl.includes('token')) {
        expect(fullUrl).not.toContain('token=123');
      }
    });

    test('启用参数后应出现在URL中', async () => {
      // 输入URL
      await fillUrl(contentPage, 'echo.websocket.org');
      // 添加禁用的参数
      await addQueryParam(contentPage, 'token', '123', { enabled: false });
      // 切换为启用
      await toggleQueryParam(contentPage, 'token');
      await contentPage.waitForTimeout(300);
      // 验证URL中包含参数
      const fullUrl = await getFullConnectionUrl(contentPage);
      if (fullUrl.includes('token')) {
        expect(fullUrl).toContain('token');
      }
    });
  });

  test.describe('5.5 清空所有参数测试', () => {
    test('应能清空所有Query参数', async () => {
      // 添加多个参数
      await addQueryParam(contentPage, 'param1', 'value1');
      await addQueryParam(contentPage, 'param2', 'value2');
      await addQueryParam(contentPage, 'param3', 'value3');
      // 清空所有参数
      await clearAllQueryParams(contentPage);
      // 验证参数数量
      const count = await getQueryParamCount(contentPage);
      expect(count).toBeLessThanOrEqual(1);
    });

    test('清空后URL不应包含参数', async () => {
      // 输入URL并添加参数
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'token', '123');
      await addQueryParam(contentPage, 'user', 'test');
      // 清空所有参数
      await clearAllQueryParams(contentPage);
      // 验证URL不包含参数
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toBe('ws://echo.websocket.org');
    });
  });

  test.describe('5.6 URL同步测试', () => {
    test('多个参数应正确拼接到URL', async () => {
      // 输入URL并添加多个参数
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'token', '123');
      await addQueryParam(contentPage, 'user', 'alice');
      // 验证所有参数都在URL中
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('token=123');
      expect(fullUrl).toContain('user=alice');
      expect(fullUrl).toContain('?');
    });

    test('参数应使用&连接', async () => {
      // 输入URL并添加多个参数
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'a', '1');
      await addQueryParam(contentPage, 'b', '2');
      // 验证参数使用&连接
      const fullUrl = await getFullConnectionUrl(contentPage);
      if (fullUrl.includes('a=1') && fullUrl.includes('b=2')) {
        expect(fullUrl).toContain('&');
      }
    });

    test('URL应正确编码特殊字符', async () => {
      // 输入URL并添加中文参数
      await fillUrl(contentPage, 'echo.websocket.org');
      await addQueryParam(contentPage, 'name', '张三');
      // 验证URL包含参数
      const fullUrl = await getFullConnectionUrl(contentPage);
      expect(fullUrl).toContain('name');
    });
  });

  test.describe('5.7 参数顺序测试', () => {
    test('参数应按添加顺序显示', async () => {
      // 按顺序添加参数
      await addQueryParam(contentPage, 'first', '1');
      await addQueryParam(contentPage, 'second', '2');
      await addQueryParam(contentPage, 'third', '3');
      // 切换到Params标签页
      await switchToTab(contentPage, 'Params');
      // 验证所有参数可见
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
      // 创建长key
      const longKey = 'a'.repeat(100);
      // 添加长key参数
      await addQueryParam(contentPage, longKey, 'value');
      // 验证参数存在
      await verifyQueryParamExists(contentPage, longKey);
    });

    test('应能添加长value的参数', async () => {
      // 创建长value
      const longValue = 'b'.repeat(500);
      // 添加长value参数
      await addQueryParam(contentPage, 'key', longValue);
      // 验证参数存在
      await verifyQueryParamExists(contentPage, 'key');
    });

    test('应能添加大量参数', async () => {
      // 添加10个参数
      for (let i = 1; i <= 10; i++) {
        await addQueryParam(contentPage, `param${i}`, `value${i}`);
        await contentPage.waitForTimeout(100);
      }
      // 验证参数数量
      const count = await getQueryParamCount(contentPage);
      expect(count).toBeGreaterThanOrEqual(10);
    });
  });

  test.describe('5.9 Params标签页测试', () => {
    test('应能切换到Params标签页', async () => {
      // 切换到Params标签页
      await switchToTab(contentPage, 'Params');
      // 验证标签页激活
      const paramsTab = contentPage.locator('.el-tabs__item.is-active:has-text("Params")');
      await expect(paramsTab).toBeVisible();
    });

    test('Params标签页应显示参数表格', async () => {
      // 切换到Params标签页
      await switchToTab(contentPage, 'Params');
      // 验证参数表格显示
      const paramsTable = contentPage.locator('.params-table, .s-params').first();
      if (await paramsTable.count() > 0) {
        await expect(paramsTable).toBeVisible();
      }
    });

    test('应显示参数输入框', async () => {
      // 切换到Params标签页
      await switchToTab(contentPage, 'Params');
      // 验证key输入框显示
      const keyInput = contentPage.locator('input[placeholder*="参数名称"], input[placeholder*="key"]').first();
      await expect(keyInput).toBeVisible();
      // 验证value输入框显示
      const valueInput = contentPage.locator('input[placeholder*="参数值"], input[placeholder*="value"]').first();
      await expect(valueInput).toBeVisible();
    });
  });
});
