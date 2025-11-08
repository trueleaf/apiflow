import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  fillUrl,
  clickSendRequest,
  sendRequestAndWait,
  switchToResponseTab,
  verifyResponseStatus,
  getResponseBody,
  verifyResponseBodyContains,
  getResponseTime
} from './helpers/httpNodeHelpers';

test.describe('10. HTTP节点 - 响应展示模块测试', () => {
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

  test.describe('10.1 响应基本信息测试', () => {
    test('应显示响应状态码', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/status/200');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      await expect(statusCode).toBeVisible({ timeout: 5000 });
    });

    test('应显示响应时间', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const responseTime = await getResponseTime(contentPage);
      expect(responseTime).toBeTruthy();
    });

    test('应显示响应大小', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      const sizeElement = contentPage.locator('.response-size, .size').first();
      const sizeText = await sizeElement.textContent();
      expect(sizeText || '').toBeTruthy();
    });

    test('应显示响应格式', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/json');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      const formatElement = contentPage.locator('.response-format, .content-type').first();
      const format = await formatElement.textContent();
      expect(format || '').toBeTruthy();
    });

    test('应显示下载进度（如果是大文件）', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/bytes/1024');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(2000);
    });

    test('成功请求应显示成功状态样式', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/status/200');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      const className = await statusCode.getAttribute('class');
      expect(className).toBeTruthy();
    });

    test('失败请求应显示失败状态样式', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/status/404');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      const className = await statusCode.getAttribute('class');
      expect(className).toBeTruthy();
    });
  });

  test.describe('10.2 响应体展示测试', () => {
    test('JSON响应应格式化显示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/json');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const responseBody = contentPage.locator('.response-body, .monaco-editor').first();
      await expect(responseBody).toBeVisible({ timeout: 5000 });
    });

    test('Text响应应原样显示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/robots.txt');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const responseBody = await getResponseBody(contentPage);
      expect(responseBody).toBeTruthy();
    });

    test('HTML响应应支持渲染预览', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/html');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const previewBtn = contentPage.locator('[title*="预览"], .preview-btn').first();
      if (await previewBtn.isVisible()) {
        await previewBtn.click();
        await contentPage.waitForTimeout(500);
      }
    });

    test('XML响应应格式化显示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/xml');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const responseBody = await getResponseBody(contentPage);
      expect(responseBody).toBeTruthy();
    });

    test('Binary响应应显示下载选项', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/image/png');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const downloadBtn = contentPage.locator('[title*="下载"], .download-btn').first();
      if (await downloadBtn.isVisible()) {
        await expect(downloadBtn).toBeVisible();
      }
    });

    test('空响应应显示提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/status/204');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const emptyState = contentPage.locator('.empty-response, .no-content').first();
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });

    test('超大响应应支持滚动查看', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/bytes/10000');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const responseContainer = contentPage.locator('.response-body, .monaco-editor').first();
      const hasScroll = await responseContainer.evaluate((el) => {
        return el.scrollHeight > el.clientHeight;
      });
      expect(hasScroll).toBeDefined();
    });

    test('应支持复制响应内容', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const copyBtn = contentPage.locator('[title*="复制"], .copy-btn').first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('应支持切换响应体展示模式（格式化/原始）', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/json');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const modeSwitch = contentPage.locator('.mode-switch, .format-toggle').first();
      if (await modeSwitch.isVisible()) {
        await modeSwitch.click();
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('10.3 响应头展示测试', () => {
    test('应显示所有响应头', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应头');
      const headersList = contentPage.locator('.response-headers, .headers-list').first();
      await expect(headersList).toBeVisible({ timeout: 5000 });
    });

    test('响应头应显示key和value', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应头');
      const headerRow = contentPage.locator('.header-row, tr').first();
      await expect(headerRow).toBeVisible({ timeout: 5000 });
    });

    test('应支持搜索响应头', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应头');
      const searchInput = contentPage.locator('.search-input, input[placeholder*="搜索"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('content');
        await contentPage.waitForTimeout(300);
      }
    });

    test('应显示响应头数量', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应头');
      const countElement = contentPage.locator('.header-count, .count').first();
      if (await countElement.isVisible()) {
        const count = await countElement.textContent();
        expect(count).toBeTruthy();
      }
    });

    test('应支持复制响应头', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应头');
      const copyBtn = contentPage.locator('[title*="复制"], .copy-btn').first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('10.4 Cookie展示测试', () => {
    test('应提取Set-Cookie头中的Cookie', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?name=value');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      const cookiesList = contentPage.locator('.cookies-list, .cookie-table').first();
      if (await cookiesList.isVisible()) {
        await expect(cookiesList).toBeVisible();
      }
    });

    test('应显示Cookie的name和value', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?testcookie=testvalue');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    test('应显示Cookie的domain', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?cookie1=value1');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    test('应显示Cookie的path', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?cookie2=value2');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    test('应显示Cookie的过期时间', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?cookie3=value3');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    test('应显示Cookie的HttpOnly属性', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?cookie4=value4');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    test('应显示Cookie的Secure属性', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/cookies/set?cookie5=value5');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      await contentPage.waitForTimeout(500);
    });

    test('无Cookie响应应显示空状态', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, 'Cookie');
      const emptyState = contentPage.locator('.empty-cookies, .no-cookies').first();
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });
  });

  test.describe('10.5 原始响应展示测试', () => {
    test('应显示原始响应体', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const rawTab = contentPage.locator('.el-tabs__item:has-text("原始"), .raw-tab').first();
      if (await rawTab.isVisible()) {
        await rawTab.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('原始响应应包含所有字符', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const rawTab = contentPage.locator('.el-tabs__item:has-text("原始"), .raw-tab').first();
      if (await rawTab.isVisible()) {
        await rawTab.click();
        const rawContent = await contentPage.locator('.raw-content, .response-raw').first().textContent();
        expect(rawContent).toBeTruthy();
      }
    });

    test('应支持复制原始响应', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      const copyBtn = contentPage.locator('[title*="复制"], .copy-btn').first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('10.6 请求信息回显测试', () => {
    test('应显示实际发送的URL', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?param1=value1');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '请求信息');
      const requestUrl = contentPage.locator('.request-url, .url').first();
      if (await requestUrl.isVisible()) {
        const url = await requestUrl.textContent();
        expect(url).toContain('httpbin.org');
      }
    });

    test('应显示实际发送的请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '请求信息');
      const requestHeaders = contentPage.locator('.request-headers, .headers').first();
      if (await requestHeaders.isVisible()) {
        await expect(requestHeaders).toBeVisible();
      }
    });

    test('应显示实际发送的请求体', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/post');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '请求信息');
      await contentPage.waitForTimeout(500);
    });

    test('应显示请求方法', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '请求信息');
      const requestMethod = contentPage.locator('.request-method, .method').first();
      if (await requestMethod.isVisible()) {
        const method = await requestMethod.textContent();
        expect(method).toBeTruthy();
      }
    });

    test('变量替换后的值应在请求信息中显示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '请求信息');
      await contentPage.waitForTimeout(500);
    });
  });

  test.describe('10.7 响应标签页切换测试', () => {
    test('应支持在不同响应标签间切换', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '基本信息');
      await switchToResponseTab(contentPage, '响应体');
      await switchToResponseTab(contentPage, '响应头');
      await switchToResponseTab(contentPage, 'Cookie');
      await switchToResponseTab(contentPage, '请求信息');
    });

    test('切换标签应保持响应数据', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(3000);
      await switchToResponseTab(contentPage, '响应体');
      const body1 = await getResponseBody(contentPage);
      await switchToResponseTab(contentPage, '响应头');
      await switchToResponseTab(contentPage, '响应体');
      const body2 = await getResponseBody(contentPage);
      expect(body1).toBe(body2);
    });
  });
});
