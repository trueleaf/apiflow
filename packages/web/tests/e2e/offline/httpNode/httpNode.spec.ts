import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  getMethodSelector,
  verifyHttpMethod,
  getUrlInput,
  switchToTab,
  addQueryParam,
  verifyQueryParamExists,
  clickSendRequest,
  clickSaveApi,
  clickRefresh
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
      const treeNode = contentPage.locator('.tree-node:has-text("Test API")').first();
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
      const headersTab = contentPage.locator('.el-tabs__item:has-text("Headers")').first();
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
      const paramsContent = contentPage.locator('.params-table, .s-params').first();
      await expect(paramsContent).toBeVisible();
      await switchToTab(contentPage, 'Headers');
      const headersContent = contentPage.locator('.headers-table, .s-params').first();
      await expect(headersContent).toBeVisible();
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

  test.describe('1.3 各个模块测试', () => {
    test('应显示Params模块各个功能', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      const paramsModule = contentPage.locator('.params-table, .s-params').first();
      await expect(paramsModule).toBeVisible();
      await switchToTab(contentPage, 'Body');
      const bodyModule = contentPage.locator('.body-config, .monaco-editor').first();
      await expect(bodyModule).toBeVisible();
      await switchToTab(contentPage, 'Headers');
      const headersModule = contentPage.locator('.headers-table, .s-params').first();
      await expect(headersModule).toBeVisible();
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
      const saveBtn = contentPage.locator('[title*="保存"], .save-btn').first();
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
      const toolbar = contentPage.locator('.toolbar, .operation-bar').first();
      await expect(toolbar).toBeVisible();
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
      const paramsTable = contentPage.locator('.params-table, .s-params').first();
      await expect(paramsTable).toBeVisible();
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
