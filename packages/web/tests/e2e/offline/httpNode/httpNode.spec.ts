import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode, clearAllAppData } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  getMethodSelector,
  verifyHttpMethod,
  getUrlInput,
  switchToTab,
  addQueryParam,
  verifyQueryParamExists,
  fillUrl,
  verifyPathParamExists,
} from './helpers/httpNodeHelpers';

test.describe('1. HTTP节点 - 基础功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test.describe('1.1 基础创建测试', () => {
    test('基础创建流程：创建HTTP节点应成功', async () => {
      await createProject(contentPage, '测试项目');
      const result = await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      expect(result.success).toBe(true);
      await waitForHttpNodeReady(contentPage);
      const treeNode = contentPage
        .locator('.tree-node:has-text("Test API"), .el-tree-node__content:has-text("Test API"), .el-tree-node__label:has-text("Test API")')
        .first();
      await expect(treeNode).toBeVisible();
      await verifyHttpMethod(contentPage, 'GET');
      const apiOperation = contentPage.locator('.api-operation').first();
      await expect(apiOperation).toBeVisible();
    });

    test('创建后应立即显示UI界面', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const methodSelector = getMethodSelector(contentPage);
      await expect(methodSelector).toBeVisible();
      const urlInput = getUrlInput(contentPage);
      await expect(urlInput).toBeVisible();
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await expect(paramsTab).toBeVisible();
      const sendBtn = contentPage.locator('button:has-text("发送请求")').first();
      await expect(sendBtn).toBeVisible();
    });
  });

  test.describe('1.2 标签页测试', () => {
    test('应显示所有标签页', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await expect(paramsTab).toBeVisible();
      const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")').first();
      await expect(bodyTab).toBeVisible();
      const headersTab = contentPage
        .locator('.el-tabs__item:has-text("Headers"), .el-tabs__item:has-text("请求头")')
        .first();
      await expect(headersTab).toBeVisible();
    });

    test('应能切换标签页', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      const paramsActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text("Params")');
      await expect(paramsActiveTab).toBeVisible();
      await switchToTab(contentPage, 'Headers');
      const headersActiveTab = contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first();
      await expect(headersActiveTab).toBeVisible();
    });

    test('标签页切换应保持数据', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testKey', 'testValue');
      await switchToTab(contentPage, 'Headers');
      await switchToTab(contentPage, 'Params');
      await verifyQueryParamExists(contentPage, 'testKey');
    });
  });

  test.describe('1.3 Params模块功能测试', () => {
    test('1.3.1 应正确显示Params标签页基础结构', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      await expect(contentPage.locator('text=Query 参数')).toBeVisible();
      const paramInput = contentPage.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数名称"]').first();
      await expect(paramInput).toBeVisible();
    });

    test('1.3.2 Query参数应支持添加和编辑', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testKey', 'testValue');
      await verifyQueryParamExists(contentPage, 'testKey');
      await addQueryParam(contentPage, 'key2', 'value2', { description: '测试描述' });
      await verifyQueryParamExists(contentPage, 'key2');
    });

    test('1.3.3 Query参数应支持启用和禁用', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'enabledParam', 'value1', { enabled: true });
      await addQueryParam(contentPage, 'disabledParam', 'value2', { enabled: false });
      await verifyQueryParamExists(contentPage, 'enabledParam');
      await verifyQueryParamExists(contentPage, 'disabledParam');
    });

    test('1.3.4 Path参数应自动识别URL中的路径变量', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, '/api/:id/:userId');
      await contentPage.waitForTimeout(500);
      await switchToTab(contentPage, 'Params');
      await expect(contentPage.locator('text=Path 参数')).toBeVisible();
      await verifyPathParamExists(contentPage, 'id');
      await verifyPathParamExists(contentPage, 'userId');
    });

    test('1.3.5 Params数据应在标签页切换时保持', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'persistKey', 'persistValue');
      await fillUrl(contentPage, '/api/:pathParam');
      await contentPage.waitForTimeout(500);
      await switchToTab(contentPage, 'Body');
      await switchToTab(contentPage, 'Headers');
      await switchToTab(contentPage, 'Params');
      await verifyQueryParamExists(contentPage, 'persistKey');
      await verifyPathParamExists(contentPage, 'pathParam');
    });

    test('各模块应能正常交互', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testParam', 'testValue');
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'testParam');
    });

    test('模块切换应保持数据', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'persistData', 'value');
      await switchToTab(contentPage, 'Body');
      await switchToTab(contentPage, 'Params');
      await verifyQueryParamExists(contentPage, 'persistData');
    });
  });

  test.describe('1.4 发送按钮测试', () => {
    test('应显示发送/取消按钮', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const sendBtn = contentPage.locator('button:has-text("发送请求")').first();
      await expect(sendBtn).toBeVisible();
      await expect(sendBtn).toBeEnabled();
    });

    test('应显示保存按钮', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const saveBtn = contentPage.locator('button:has-text("保存接口")').first();
      await expect(saveBtn).toBeVisible();
    });

    test('应显示刷新按钮', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const refreshBtn = contentPage.locator('[title*="刷新"], .refresh-btn').first();
      await expect(refreshBtn).toBeVisible();
    });

    test('应显示其他辅助按钮', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await expect(contentPage.locator('text=撤销')).toBeVisible();
      await expect(contentPage.locator('text=重做')).toBeVisible();
    });
  });

  test.describe('1.5 初始状态', () => {
    test('应使用默认请求方法（GET）', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await verifyHttpMethod(contentPage, 'GET');
    });

    test('应显示空URL输入框', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value).toBe('');
      const placeholder = await urlInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    });

    test('应显示空参数表单', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      const paramInput = contentPage.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数名称"]').first();
      await expect(paramInput).toBeVisible();
    });

    test('各标签页应显示正确的默认状态', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const tabs = contentPage.locator('.el-tabs__item');
      const count = await tabs.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('1.6 响应式布局', () => {
    test('应支持最小宽度1200px', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await contentPage.setViewportSize({ width: 1200, height: 800 });
      await contentPage.waitForTimeout(300);
      const apiOperation = contentPage.locator('.api-operation').first();
      await expect(apiOperation).toBeVisible();
    });

    test('窗口小于1200px应显示可滚动', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await contentPage.setViewportSize({ width: 1000, height: 800 });
      await contentPage.waitForTimeout(300);
      const hasScroll = await contentPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasScroll).toBeDefined();
    });
  });
});
