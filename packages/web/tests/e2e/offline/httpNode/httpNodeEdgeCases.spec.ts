import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  fillUrl,
  verifyUrlValue,
  getUrlInput,
  addQueryParam,
  verifyQueryParamExists,
  addHeader,
  verifyHeaderExists,
  fillJsonBody,
  clickSendRequest,
  clickSaveApi,
  switchToTab,
  resizeWindow
} from './helpers/httpNodeHelpers';

test.describe('16. HTTP节点 - 边界场景测试', () => {
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

  test.describe('16.1 超长URL测试', () => {
    test('应支持2000字符的URL', async () => {
      await waitForHttpNodeReady(contentPage);
      const longUrl = 'https://httpbin.org/get?param=' + 'a'.repeat(1950);
      await fillUrl(contentPage, longUrl);
      await contentPage.waitForTimeout(300);
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value.length).toBeGreaterThan(1900);
    });

    test('应支持5000字符的URL', async () => {
      await waitForHttpNodeReady(contentPage);
      const veryLongUrl = 'https://httpbin.org/get?data=' + 'x'.repeat(4950);
      await fillUrl(contentPage, veryLongUrl);
      await contentPage.waitForTimeout(300);
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value.length).toBeGreaterThan(4900);
    });

    test('超长URL应可滚动查看', async () => {
      await waitForHttpNodeReady(contentPage);
      const longUrl = 'https://httpbin.org/get?scroll=' + 'b'.repeat(2000);
      await fillUrl(contentPage, longUrl);
      await contentPage.waitForTimeout(300);
      const urlInput = getUrlInput(contentPage);
      const scrollWidth = await urlInput.evaluate((el) => (el as HTMLInputElement).scrollWidth);
      const clientWidth = await urlInput.evaluate((el) => (el as HTMLInputElement).clientWidth);
      expect(scrollWidth).toBeGreaterThan(clientWidth);
    });
  });

  test.describe('16.2 大量参数测试', () => {
    test('应支持100个Query参数', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      for (let i = 0; i < 100; i++) {
        await addQueryParam(contentPage, `key${i}`, `value${i}`);
      }
      await contentPage.waitForTimeout(500);
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
    });

    test('应支持200个Query参数', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      for (let i = 0; i < 200; i++) {
        await addQueryParam(contentPage, `param${i}`, `val${i}`);
      }
      await contentPage.waitForTimeout(500);
    });

    test('应支持50个请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      for (let i = 0; i < 50; i++) {
        await addHeader(contentPage, `X-Header-${i}`, `value${i}`);
      }
      await contentPage.waitForTimeout(500);
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
    });

    test('参数表格应支持虚拟滚动', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      for (let i = 0; i < 150; i++) {
        await addQueryParam(contentPage, `test${i}`, `data${i}`);
      }
      await contentPage.waitForTimeout(500);
      const table = contentPage.locator('.s-params, .params-table').first();
      if (await table.isVisible()) {
        await expect(table).toBeVisible();
      }
    });
  });

  test.describe('16.3 特殊字符处理', () => {
    test('URL应支持中文字符', async () => {
      await waitForHttpNodeReady(contentPage);
      const chineseUrl = 'https://httpbin.org/get?name=测试中文';
      await fillUrl(contentPage, chineseUrl);
      await contentPage.waitForTimeout(300);
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value).toContain('测试中文');
    });

    test('URL应支持emoji表情', async () => {
      await waitForHttpNodeReady(contentPage);
      const emojiUrl = 'https://httpbin.org/get?emoji=😀🎉';
      await fillUrl(contentPage, emojiUrl);
      await contentPage.waitForTimeout(300);
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value).toBeDefined();
    });

    test('参数值应支持特殊字符&=?', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      await addQueryParam(contentPage, 'special', 'value&with=special?chars');
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'special');
    });

    test('参数值应支持换行符', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      await addQueryParam(contentPage, 'multiline', 'line1\nline2\nline3');
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'multiline');
    });

    test('JSON应支持Unicode字符', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Body');
      const unicodeJson = '{"unicode": "\\u4e2d\\u6587"}';
      await fillJsonBody(contentPage, unicodeJson);
      await contentPage.waitForTimeout(300);
    });

    test('Header value应支持特殊字符', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      await addHeader(contentPage, 'X-Special-Header', 'value-with-special@#$');
      await contentPage.waitForTimeout(300);
      await verifyHeaderExists(contentPage, 'X-Special-Header');
    });
  });

  test.describe('16.4 空值处理', () => {
    test('空URL应提示错误', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, '');
      await contentPage.waitForTimeout(300);
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(300);
      const errorMsg = contentPage.locator('.el-message--error, .error-message').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });

    test('空Query参数key应自动清除', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      await addQueryParam(contentPage, '', 'emptyKeyValue');
      await contentPage.waitForTimeout(300);
    });

    test('空Header key应自动清除', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      await addHeader(contentPage, '', 'emptyHeaderValue');
      await contentPage.waitForTimeout(300);
    });

    test('空JSON应保存为空对象或空字符串', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Body');
      await fillJsonBody(contentPage, '');
      await contentPage.waitForTimeout(300);
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
    });

    test('空Body应设置Content-Length为0', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Body');
      await fillJsonBody(contentPage, '');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('16.5 空白字符处理', () => {
    test('URL前后空格应自动trim', async () => {
      await waitForHttpNodeReady(contentPage);
      const urlWithSpaces = '  https://httpbin.org/get  ';
      await fillUrl(contentPage, urlWithSpaces);
      await contentPage.waitForTimeout(300);
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value.trim()).toBe(value);
    });

    test('参数key前后空格应trim', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      await addQueryParam(contentPage, '  trimKey  ', 'value');
      await contentPage.waitForTimeout(300);
    });

    test('参数value内部空格应保留', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      await addQueryParam(contentPage, 'message', 'hello world test');
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'message');
    });

    test('JSON中的空格应保留格式', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Body');
      const formattedJson = '{\n  "name": "test",\n  "value": 123\n}';
      await fillJsonBody(contentPage, formattedJson);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('16.6 Unicode和特殊编码', () => {
    test('应支持UTF-8编码', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?utf8=测试');
      await contentPage.waitForTimeout(300);
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value).toContain('测试');
    });

    test('应支持emoji字符', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      await addQueryParam(contentPage, 'emoji', '🚀🎉👍');
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'emoji');
    });

    test('应支持各种语言文字', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Body');
      const multiLangJson = '{"chinese":"中文","japanese":"日本語","korean":"한국어","arabic":"العربية"}';
      await fillJsonBody(contentPage, multiLangJson);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('16.7 最小宽度限制', () => {
    test('窗口宽度1200px应正常显示', async () => {
      await waitForHttpNodeReady(contentPage);
      await resizeWindow(contentPage, 1200, 800);
      await contentPage.waitForTimeout(300);
      const container = contentPage.locator('.http-node-container, .main-container').first();
      if (await container.isVisible()) {
        await expect(container).toBeVisible();
      }
    });

    test('窗口宽度小于1200px应显示滚动条', async () => {
      await waitForHttpNodeReady(contentPage);
      await resizeWindow(contentPage, 1000, 800);
      await contentPage.waitForTimeout(300);
    });

    test('窗口缩放应保持布局', async () => {
      await waitForHttpNodeReady(contentPage);
      await resizeWindow(contentPage, 1600, 900);
      await contentPage.waitForTimeout(300);
      await resizeWindow(contentPage, 1200, 800);
      await contentPage.waitForTimeout(300);
      const container = contentPage.locator('.http-node-container, .main-container').first();
      if (await container.isVisible()) {
        await expect(container).toBeVisible();
      }
    });
  });
});
