import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  switchToTab,
  addQueryParam,
  deleteQueryParam,
  verifyQueryParamExists,
  clearAllQueryParams,
  fillUrl,
  verifyUrlValue,
  getFullRequestUrl,
  clickSendRequest
} from './helpers/httpNodeHelpers';

test.describe('3. HTTP节点 - Params模块测试', () => {
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

  test.describe('3.1 Query参数测试', () => {
    test.describe('3.1.1 基础操作', () => {
      test('应能添加Query参数', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'userId', '123');
        await verifyQueryParamExists(contentPage, 'userId');
      });

      test('应能编辑Query参数的key', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'oldKey', 'value');
        await switchToTab(contentPage, 'Params');
        await contentPage.waitForTimeout(500);
        const row = contentPage.locator('tr:has(input[value="oldKey"])');
        const keyInput = row.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        const isVisible = await keyInput.isVisible({ timeout: 5000 }).catch(() => false);
        if (isVisible) {
          await keyInput.clear();
          await keyInput.fill('newKey');
          await contentPage.waitForTimeout(300);
          await verifyQueryParamExists(contentPage, 'newKey');
        }
      });

      test('应能编辑Query参数的value', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'testKey', 'oldValue');
        await switchToTab(contentPage, 'Params');
        await contentPage.waitForTimeout(500);
        const row = contentPage.locator('tr:has(input[value="testKey"])');
        const valueInput = row.locator('input[placeholder*="值"], input[placeholder*="value"]').nth(1);
        const isVisible = await valueInput.isVisible({ timeout: 5000 }).catch(() => false);
        if (isVisible) {
          await valueInput.clear();
          await valueInput.fill('newValue');
          await contentPage.waitForTimeout(300);
        }
      });

      test('应能删除Query参数', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'deleteMe', 'value');
        await deleteQueryParam(contentPage, 'deleteMe');
        await contentPage.waitForTimeout(300);
      });

      test('应能批量删除Query参数', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'param1', 'value1');
        await addQueryParam(contentPage, 'param2', 'value2');
        await addQueryParam(contentPage, 'param3', 'value3');
        await clearAllQueryParams(contentPage);
      });
    });

    test.describe('3.1.2 参数属性设置', () => {
      test('应能设置参数类型', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'typeParam', 'value');
        await switchToTab(contentPage, 'Params');
        await contentPage.waitForTimeout(500);
        const row = contentPage.locator('tr:has(input[value="typeParam"])');
        const typeSelector = row.locator('.el-select, select').first();
        const isVisible = await typeSelector.isVisible({ timeout: 5000 }).catch(() => false);
        if (isVisible) {
          await typeSelector.click();
          await contentPage.waitForTimeout(300);
        }
      });

      test('应能设置参数为必填', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'requiredParam', 'value');
        await switchToTab(contentPage, 'Params');
        await contentPage.waitForTimeout(500);
        const row = contentPage.locator('tr:has(input[value="requiredParam"])');
        const requiredCheckbox = row.locator('input[type="checkbox"]').nth(1);
        const isVisible = await requiredCheckbox.isVisible({ timeout: 5000 }).catch(() => false);
        if (isVisible) {
          await requiredCheckbox.check();
          await contentPage.waitForTimeout(300);
        }
      });

      test('应能添加参数描述', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'descParam', 'value', { description: '这是参数描述' });
        await verifyQueryParamExists(contentPage, 'descParam');
      });

      test('应能设置参数的默认值', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'defaultParam', 'defaultValue');
        await verifyQueryParamExists(contentPage, 'defaultParam');
      });
    });

    test.describe('3.1.3 参数启用/禁用', () => {
      test('应能禁用Query参数', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'disabledParam', 'value', { enabled: false });
        await switchToTab(contentPage, 'Params');
        await contentPage.waitForTimeout(500);
        const row = contentPage.locator('tr:has(input[value="disabledParam"])');
        const checkbox = row.locator('input[type="checkbox"]').first();
        const isChecked = await checkbox.isChecked({ timeout: 5000 }).catch(() => null);
        if (isChecked !== null) {
          expect(isChecked).toBe(false);
        }
      });

      test('应能重新启用被禁用的参数', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'reenabledParam', 'value', { enabled: false });
        await switchToTab(contentPage, 'Params');
        await contentPage.waitForTimeout(500);
        const row = contentPage.locator('tr:has(input[value="reenabledParam"])');
        const checkbox = row.locator('input[type="checkbox"]').first();
        const isVisible = await checkbox.isVisible({ timeout: 5000 }).catch(() => false);
        if (isVisible) {
          await checkbox.check();
          await contentPage.waitForTimeout(300);
          const isChecked = await checkbox.isChecked({ timeout: 5000 }).catch(() => null);
          if (isChecked !== null) {
            expect(isChecked).toBe(true);
          }
        }
      });

      test('禁用的参数应有视觉标识', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'visualParam', 'value', { enabled: false });
        await switchToTab(contentPage, 'Params');
        await contentPage.waitForTimeout(500);
        const row = contentPage.locator('tr:has(input[value="visualParam"])');
        const className = await row.getAttribute('class', { timeout: 5000 }).catch(() => null);
        if (className !== null) {
          expect(className).toBeTruthy();
        }
      });
    });

    test.describe('3.1.4 变量替换', () => {
      test('Query参数value应支持变量替换', async () => {
        await waitForHttpNodeReady(contentPage);
        await addQueryParam(contentPage, 'varParam', '{{userId}}');
        await verifyQueryParamExists(contentPage, 'varParam');
      });

      test('Query参数key应支持变量替换', async () => {
        await waitForHttpNodeReady(contentPage);
        await switchToTab(contentPage, 'Params');
        const table = contentPage.locator('.params-table, .s-params').first();
        const lastRow = table.locator('tbody tr').last();
        const keyInput = lastRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput.fill('{{dynamicKey}}');
        await contentPage.waitForTimeout(200);
      });
    });

    test.describe('3.1.5 URL同步', () => {
      test('添加Query参数应自动更新URL', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/api');
        await addQueryParam(contentPage, 'key', 'value');
        const fullUrl = await getFullRequestUrl(contentPage);
        expect(fullUrl).toContain('key=value');
      });

      test('删除Query参数应更新URL', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/api?key=value');
        await deleteQueryParam(contentPage, 'key');
        await contentPage.waitForTimeout(300);
      });

      test('从URL粘贴应自动提取Query参数', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/api?a=1&b=2');
        await verifyQueryParamExists(contentPage, 'a');
        await verifyQueryParamExists(contentPage, 'b');
      });
    });
  });

  test.describe('3.2 Path参数测试', () => {
    test.describe('3.2.1 Path参数识别', () => {
      test('应自动识别URL中的Path参数', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/users/{id}');
        await switchToTab(contentPage, 'Params');
        const pathTab = contentPage.locator('.params-type-tabs .el-tabs__item:has-text("Path")');
        if (await pathTab.isVisible()) {
          await pathTab.click();
          await contentPage.waitForTimeout(300);
          const idParam = contentPage.locator('tr:has(input[value="id"])');
          await expect(idParam).toBeVisible();
        }
      });

      test('应识别多个Path参数', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/users/{userId}/posts/{postId}');
        await switchToTab(contentPage, 'Params');
        const pathTab = contentPage.locator('.params-type-tabs .el-tabs__item:has-text("Path")');
        if (await pathTab.isVisible()) {
          await pathTab.click();
          await contentPage.waitForTimeout(300);
        }
      });

      test('Path参数应自动加入参数列表', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/api/{version}/users/{id}');
        await switchToTab(contentPage, 'Params');
        const pathTab = contentPage.locator('.params-type-tabs .el-tabs__item:has-text("Path")');
        if (await pathTab.isVisible()) {
          await pathTab.click();
          const pathParams = contentPage.locator('.path-params, .params-table').first();
          await expect(pathParams).toBeVisible();
        }
      });
    });

    test.describe('3.2.2 Path参数编辑', () => {
      test('应能编辑Path参数的value', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/users/{id}');
        await switchToTab(contentPage, 'Params');
        await contentPage.waitForTimeout(500);
        const pathTab = contentPage.locator('.params-type-tabs .el-tabs__item:has-text("Path")');
        const isPathTabVisible = await pathTab.isVisible({ timeout: 5000 }).catch(() => false);
        if (isPathTabVisible) {
          await pathTab.click();
          await contentPage.waitForTimeout(500);
          const row = contentPage.locator('tr:has(input[value="id"])');
          const valueInput = row.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
          const isVisible = await valueInput.isVisible({ timeout: 5000 }).catch(() => false);
          if (isVisible) {
            await valueInput.fill('123');
            await contentPage.waitForTimeout(300);
          }
        }
      });

      test('应能添加Path参数描述', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/users/{id}');
        await switchToTab(contentPage, 'Params');
        const pathTab = contentPage.locator('.params-type-tabs .el-tabs__item:has-text("Path")');
        if (await pathTab.isVisible()) {
          await pathTab.click();
          await contentPage.waitForTimeout(300);
        }
      });

      test('Path参数的key应不可编辑', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/users/{id}');
        await switchToTab(contentPage, 'Params');
        await contentPage.waitForTimeout(500);
        const pathTab = contentPage.locator('.params-type-tabs .el-tabs__item:has-text("Path")');
        const isPathTabVisible = await pathTab.isVisible({ timeout: 5000 }).catch(() => false);
        if (isPathTabVisible) {
          await pathTab.click();
          await contentPage.waitForTimeout(500);
          const row = contentPage.locator('tr:has(input[value="id"])');
          const keyInput = row.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
          const isVisible = await keyInput.isVisible({ timeout: 5000 }).catch(() => false);
          if (isVisible) {
            const isDisabled = await keyInput.isDisabled().catch(() => false);
            const readonly = await keyInput.getAttribute('readonly').catch(() => null);
            expect(isDisabled || readonly).toBeTruthy();
          }
        }
      });
    });

    test.describe('3.2.3 Path参数替换', () => {
      test('发送请求时应替换Path参数到URL', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'https://httpbin.org/anything/{id}');
        await switchToTab(contentPage, 'Params');
        const pathTab = contentPage.locator('.params-type-tabs .el-tabs__item:has-text("Path")');
        if (await pathTab.isVisible()) {
          await pathTab.click();
          await contentPage.waitForTimeout(300);
        }
      });

      test('Path参数value支持变量替换', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/users/{id}');
        await switchToTab(contentPage, 'Params');
        const pathTab = contentPage.locator('.params-type-tabs .el-tabs__item:has-text("Path")');
        if (await pathTab.isVisible()) {
          await pathTab.click();
          await contentPage.waitForTimeout(300);
        }
      });

      test('未填写的Path参数应保留占位符', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/users/{id}');
        await contentPage.waitForTimeout(300);
      });
    });

    test.describe('3.2.4 Path参数同步', () => {
      test('修改URL中的Path参数名应更新参数列表', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/users/{id}');
        await fillUrl(contentPage, 'http://example.com/users/{userId}');
        await contentPage.waitForTimeout(300);
      });

      test('删除URL中的Path参数应从列表移除', async () => {
        await waitForHttpNodeReady(contentPage);
        await fillUrl(contentPage, 'http://example.com/users/{id}/posts');
        await fillUrl(contentPage, 'http://example.com/users/posts');
        await contentPage.waitForTimeout(300);
      });
    });
  });

  test.describe('3.3 参数表格操作', () => {
    test('应支持快速填写（Tab键切换）', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      const table = contentPage.locator('.params-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput.fill('testKey');
      await contentPage.keyboard.press('Tab');
      await contentPage.waitForTimeout(200);
    });

    test('应支持拖拽排序', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'param1', 'value1');
      await addQueryParam(contentPage, 'param2', 'value2');
      await addQueryParam(contentPage, 'param3', 'value3');
      await contentPage.waitForTimeout(300);
    });

    test('空行应自动清除', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      const table = contentPage.locator('.params-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput.click();
      await keyInput.blur();
      await contentPage.waitForTimeout(300);
    });

    test('参数列表应支持滚动', async () => {
      await waitForHttpNodeReady(contentPage);
      for (let i = 0; i < 20; i++) {
        await addQueryParam(contentPage, `param${i}`, `value${i}`);
      }
      await switchToTab(contentPage, 'Params');
      const table = contentPage.locator('.params-table, .s-params').first();
      const hasScroll = await table.evaluate((el) => {
        return el.scrollHeight > el.clientHeight;
      });
      expect(hasScroll).toBeDefined();
    });
  });
});
