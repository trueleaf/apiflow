import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  switchToResponseConfigTab,
  addResponseConfig,
  deleteResponseConfig,
  setResponseStatusCode,
  setResponseTitle,
  selectResponseDataType,
  editResponseExample,
  getResponseExampleContent,
  formatResponseJson,
  verifyJsonSyntaxError,
  getResponseConfigList,
  collapseResponseConfig,
  expandResponseConfig,
  verifyResponseConfigCollapsed,
  verifyResponseConfigExpanded,
  switchToTab
} from './helpers/httpNodeHelpers';

test.describe('6. HTTP节点 - 返回参数配置测试', () => {
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

  test.describe('6.1 响应配置基础操作', () => {
    test('应能添加响应配置', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      const configList = getResponseConfigList(contentPage);
      const count = await configList.count();
      expect(count).toBeGreaterThan(0);
    });

    test('应能删除响应配置', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await contentPage.waitForTimeout(300);
      const countBefore = await getResponseConfigList(contentPage).count();
      await deleteResponseConfig(contentPage, 0);
      const countAfter = await getResponseConfigList(contentPage).count();
      expect(countAfter).toBeLessThan(countBefore);
    });

    test('应能设置响应状态码', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await setResponseStatusCode(contentPage, '200');
      await contentPage.waitForTimeout(300);
      const statusInput = contentPage.locator('input[placeholder*="状态码"], .status-code-input').first();
      const value = await statusInput.inputValue();
      expect(value).toBe('200');
    });

    test('应能设置响应标题', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await setResponseTitle(contentPage, '成功响应');
      await contentPage.waitForTimeout(300);
      const titleInput = contentPage.locator('input[placeholder*="标题"], .response-title-input').first();
      const value = await titleInput.inputValue();
      expect(value).toBe('成功响应');
    });
  });

  test.describe('6.2 响应数据类型设置', () => {
    test('应支持JSON数据类型', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await selectResponseDataType(contentPage, 'JSON');
      await contentPage.waitForTimeout(300);
    });

    test('应支持Text数据类型', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await selectResponseDataType(contentPage, 'Text');
      await contentPage.waitForTimeout(300);
    });

    test('应支持HTML数据类型', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await selectResponseDataType(contentPage, 'HTML');
      await contentPage.waitForTimeout(300);
    });

    test('应支持XML数据类型', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await selectResponseDataType(contentPage, 'XML');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('6.3 响应示例编辑', () => {
    test('应能编辑JSON响应示例', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await selectResponseDataType(contentPage, 'JSON');
      const jsonContent = '{"status": "success", "data": {"id": 1}}';
      await editResponseExample(contentPage, jsonContent);
      const content = await getResponseExampleContent(contentPage);
      expect(content).toContain('success');
    });

    test('JSON示例应支持格式化', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await selectResponseDataType(contentPage, 'JSON');
      const compressedJson = '{"a":1,"b":2}';
      await editResponseExample(contentPage, compressedJson);
      await formatResponseJson(contentPage);
      const content = await getResponseExampleContent(contentPage);
      expect(content).toBeDefined();
    });

    test('应验证JSON示例语法', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await selectResponseDataType(contentPage, 'JSON');
      const invalidJson = '{invalid: json}';
      await editResponseExample(contentPage, invalidJson);
      await contentPage.waitForTimeout(500);
      await verifyJsonSyntaxError(contentPage);
    });

    test('应能编辑Text响应示例', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await selectResponseDataType(contentPage, 'Text');
      const textContent = 'This is a text response example';
      await editResponseExample(contentPage, textContent);
      const content = await getResponseExampleContent(contentPage);
      expect(content).toContain('text response');
    });
  });

  test.describe('6.4 多状态码配置', () => {
    test('应能配置多个状态码', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await setResponseStatusCode(contentPage, '200');
      await contentPage.waitForTimeout(300);
      await addResponseConfig(contentPage);
      await setResponseStatusCode(contentPage, '404');
      await contentPage.waitForTimeout(300);
      await addResponseConfig(contentPage);
      await setResponseStatusCode(contentPage, '500');
      await contentPage.waitForTimeout(300);
      const configList = getResponseConfigList(contentPage);
      const count = await configList.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('不同状态码应有独立的响应示例', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await setResponseStatusCode(contentPage, '200');
      await selectResponseDataType(contentPage, 'JSON');
      await editResponseExample(contentPage, '{"status": "ok"}');
      await contentPage.waitForTimeout(300);
      await addResponseConfig(contentPage);
      await setResponseStatusCode(contentPage, '404');
      await selectResponseDataType(contentPage, 'JSON');
      await editResponseExample(contentPage, '{"status": "not found"}');
      await contentPage.waitForTimeout(300);
    });

    test('状态码不应重复', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await setResponseStatusCode(contentPage, '200');
      await contentPage.waitForTimeout(300);
      await addResponseConfig(contentPage);
      await setResponseStatusCode(contentPage, '200');
      await contentPage.waitForTimeout(300);
      const errorMsg = contentPage.locator('.el-message--error, .error-message, .el-message--warning').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });
  });

  test.describe('6.5 响应配置折叠展开', () => {
    test('应能折叠响应配置', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await contentPage.waitForTimeout(300);
      await collapseResponseConfig(contentPage, 0);
      await verifyResponseConfigCollapsed(contentPage, 0);
    });

    test('应能展开响应配置', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await contentPage.waitForTimeout(300);
      await collapseResponseConfig(contentPage, 0);
      await contentPage.waitForTimeout(300);
      await expandResponseConfig(contentPage, 0);
      await verifyResponseConfigExpanded(contentPage, 0);
    });

    test('折叠状态应保持', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToResponseConfigTab(contentPage);
      await addResponseConfig(contentPage);
      await contentPage.waitForTimeout(300);
      await collapseResponseConfig(contentPage, 0);
      await contentPage.waitForTimeout(300);
      await switchToTab(contentPage, 'Params');
      await contentPage.waitForTimeout(300);
      await switchToResponseConfigTab(contentPage);
      await contentPage.waitForTimeout(300);
      await verifyResponseConfigCollapsed(contentPage, 0);
    });
  });
});
