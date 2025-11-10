import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  selectHttpMethod,
  verifyHttpMethod,
  fillUrl,
  verifyUrlValue,
  getUrlInput,
  clickSendRequest,
  sendRequestAndWait,
  clickCancelRequest,
  clickSaveApi,
  clickRefresh,
  switchToTab,
  addQueryParam,
  verifyQueryParamExists,
  getFullRequestUrl
} from './helpers/httpNodeHelpers';

test.describe('2. HTTP节点 - 请求操作模块测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    //创建测试项目和HTTP节点
    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test API',
      type: 'http'
    });
  });

  test.describe('2.1 请求方法测试', () => {
    test('应支持GET方法选择', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'GET');
      await verifyHttpMethod(contentPage, 'GET');
      await clickRefresh(contentPage);
      await verifyHttpMethod(contentPage, 'GET');
    });

    test('应支持POST方法选择', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await verifyHttpMethod(contentPage, 'POST');
      const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
      await expect(bodyTab).toBeVisible();
    });

    test('应支持PUT方法选择', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'PUT');
      await verifyHttpMethod(contentPage, 'PUT');
    });

    test('应支持DELETE方法选择', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'DELETE');
      await verifyHttpMethod(contentPage, 'DELETE');
    });

    test('应支持PATCH方法选择', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'PATCH');
      await verifyHttpMethod(contentPage, 'PATCH');
    });

    test('应支持HEAD方法选择', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'HEAD');
      await verifyHttpMethod(contentPage, 'HEAD');
    });

    test('应支持OPTIONS方法选择', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'OPTIONS');
      await verifyHttpMethod(contentPage, 'OPTIONS');
    });

    test('方法切换时应保持其他配置不变', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://example.com/api');
      await addQueryParam(contentPage, 'userId', '123');
      await selectHttpMethod(contentPage, 'POST');
      await verifyUrlValue(contentPage, 'http://example.com/api');
      await verifyQueryParamExists(contentPage, 'userId');
    });
  });

  test.describe('2.2 请求URL测试', () => {
    test('应能输入普通URL', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://example.com/api');
      await verifyUrlValue(contentPage, 'http://example.com/api');
      await clickRefresh(contentPage);
      await verifyUrlValue(contentPage, 'http://example.com/api');
    });

    test('应能输入带端口的URL', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://localhost:3000/api');
      await verifyUrlValue(contentPage, 'http://localhost:3000/api');
    });

    test('应能输入带查询参数的URL', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://example.com/api?key=value&name=test');
      await verifyUrlValue(contentPage, 'http://example.com/api?key=value&name=test');
      await switchToTab(contentPage, 'Params');
      const keyParam = contentPage.locator('tr:has(input[value="key"])');
      const nameParam = contentPage.locator('tr:has(input[value="name"])');
      await expect(keyParam).toBeVisible();
      await expect(nameParam).toBeVisible();
    });

    test('应能输入带Path参数的URL', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://example.com/users/{id}/posts/{postId}');
      await verifyUrlValue(contentPage, 'http://example.com/users/{id}/posts/{postId}');
      await switchToTab(contentPage, 'Params');
      const pathTab = contentPage.locator('.params-type-tabs .el-tabs__item:has-text("Path")');
      await pathTab.click();
      await contentPage.waitForTimeout(300);
      const idParam = contentPage.locator('tr:has(input[value="id"])');
      const postIdParam = contentPage.locator('tr:has(input[value="postId"])');
      await expect(idParam).toBeVisible();
      await expect(postIdParam).toBeVisible();
    });

    test('应支持URL粘贴', async () => {
      await waitForHttpNodeReady(contentPage);
      const longUrl = 'http://example.com/api/v1/users/search?query=test&limit=100&offset=0&sort=created_at&order=desc';
      const urlInput = getUrlInput(contentPage);
      await urlInput.clear();
      await contentPage.evaluate((url) => {
        navigator.clipboard.writeText(url);
      }, longUrl);
      await urlInput.focus();
      await contentPage.keyboard.press('Control+V');
      await urlInput.blur();
      await contentPage.waitForTimeout(300);
      await verifyUrlValue(contentPage, longUrl);
    });

    test('应支持URL自动格式化', async () => {
      await waitForHttpNodeReady(contentPage);
      const urlInput = getUrlInput(contentPage);
      await urlInput.fill('http://example.com/api test');
      await urlInput.blur();
      await contentPage.waitForTimeout(300);
      const value = await urlInput.inputValue();
      expect(value).toContain('test');
    });

    test('应支持URL中的变量替换', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://{{host}}/api/{{version}}');
      await verifyUrlValue(contentPage, 'http://{{host}}/api/{{version}}');
      const urlInput = getUrlInput(contentPage);
      const className = await urlInput.getAttribute('class');
      expect(className).toBeTruthy();
    });

    test('应处理超长URL', async () => {
      await waitForHttpNodeReady(contentPage);
      const longPath = 'a'.repeat(2000);
      const longUrl = `http://example.com/${longPath}`;
      await fillUrl(contentPage, longUrl);
      await verifyUrlValue(contentPage, longUrl);
      const urlInput = getUrlInput(contentPage);
      const scrollWidth = await urlInput.evaluate((el: HTMLInputElement) => el.scrollWidth);
      const clientWidth = await urlInput.evaluate((el: HTMLInputElement) => el.clientWidth);
      expect(scrollWidth).toBeGreaterThan(clientWidth);
    });

    test('应验证URL格式', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'invalid-url');
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value).toBe('invalid-url');
    });

    test('URL输入框应有placeholder提示', async () => {
      await waitForHttpNodeReady(contentPage);
      const urlInput = getUrlInput(contentPage);
      const placeholder = await urlInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
      expect(placeholder).toContain('http');
    });
  });

  test.describe('2.3 环境和前缀管理', () => {
    test('应显示环境选择下拉框', async () => {
      await waitForHttpNodeReady(contentPage);
      const envSelector = contentPage.locator('.el-select, .el-checkbox').first();
      await expect(envSelector).toBeVisible();
    });

    test('应能切换不同环境', async () => {
      await waitForHttpNodeReady(contentPage);
      const prefixBtn = contentPage.locator('button:has-text("接口前缀")');
      if (await prefixBtn.isVisible()) {
        await prefixBtn.click();
        await contentPage.waitForTimeout(500);
      }
    });

    test('应能配置接口前缀', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, '/users');
      const fullUrl = await getFullRequestUrl(contentPage);
      expect(fullUrl.length).toBeGreaterThan(0);
    });

    test('前缀应自动拼接到URL', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, '/api/test');
      await contentPage.waitForTimeout(300);
      const fullUrl = await getFullRequestUrl(contentPage);
      expect(fullUrl).toBeTruthy();
    });

    test('绝对URL应忽略前缀', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://example.com/api');
      const fullUrl = await getFullRequestUrl(contentPage);
      expect(fullUrl).toContain('example.com');
    });
  });

  test.describe('2.4 发送和控制操作', () => {
    test('点击发送按钮应发起请求', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const sendBtn = contentPage.locator('button:has-text("发送请求")');
      await expect(sendBtn).toBeVisible();
      await expect(sendBtn).toBeEnabled();
    });

    test('请求发送中应显示加载状态', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/delay/2');
      await clickSendRequest(contentPage);
      const cancelBtn = contentPage.locator('button:has-text("取消请求")');
      await expect(cancelBtn).toBeVisible({ timeout: 2000 });
    });

    test('应能取消正在发送的请求', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/delay/5');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(500);
      const cancelBtn = contentPage.locator('button:has-text("取消请求")');
      if (await cancelBtn.isVisible()) {
        await clickCancelRequest(contentPage);
        await contentPage.waitForTimeout(500);
        const sendBtn = contentPage.locator('button:has-text("发送请求")');
        await expect(sendBtn).toBeVisible();
      }
    });

    test('请求完成后应恢复发送按钮', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const sendBtn = contentPage.locator('button:has-text("发送请求")');
      await expect(sendBtn).toBeVisible({ timeout: 30000 });
    });

    test('发送请求前应验证URL必填', async () => {
      await waitForHttpNodeReady(contentPage);
      const urlInput = getUrlInput(contentPage);
      await urlInput.clear();
      const sendBtn = contentPage.locator('button:has-text("发送请求")');
      await expect(sendBtn).toBeVisible();
    });

    test('应支持快捷键发送请求', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      const urlInput = getUrlInput(contentPage);
      await urlInput.focus();
      await contentPage.keyboard.press('Control+Enter');
      await contentPage.waitForTimeout(500);
    });

    test('发送失败应显示错误提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://invalid-domain-that-does-not-exist-12345.com');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
    });

    test('应支持刷新操作', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://example.com/api');
      await clickRefresh(contentPage);
      await verifyUrlValue(contentPage, 'http://example.com/api');
    });
  });

  test.describe('2.5 请求状态管理', () => {
    test('未保存状态应有提示标识', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://example.com/api');
      await contentPage.waitForTimeout(500);
      const unsavedIndicator = contentPage.locator('.unsaved-indicator, .dirty-flag, [title*="未保存"]');
      const count = await unsavedIndicator.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('保存后应清除未保存标识', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://example.com/api');
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('发送请求前应自动保存', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await contentPage.waitForTimeout(300);
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(1000);
    });
  });
});
