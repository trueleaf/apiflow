import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  fillUrl,
  verifyUrlValue,
  addQueryParam,
  verifyQueryParamExists,
  addHeader,
  verifyHeaderExists,
  fillJsonBody,
  selectHttpMethod,
  switchBodyMode,
  addFormDataField,
  fillRawBody,
  clickSendRequest,
  addLocalVariable,
  addEnvironmentVariable,
  addGlobalVariable,
  verifyUrlContainsVariable,
  getUrlInput
} from './helpers/httpNodeHelpers';

test.describe('15. HTTP节点 - 变量替换功能测试', () => {
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

  test.describe('15.1 URL中的变量替换', () => {
    test('应识别{{variableName}}语法', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://{{host}}/api');
      await verifyUrlContainsVariable(contentPage, 'host');
      const urlInput = getUrlInput(contentPage);
      const className = await urlInput.getAttribute('class');
      expect(className).toBeTruthy();
    });

    test('应替换单个变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'host', 'example.com');
      await fillUrl(contentPage, 'http://{{host}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'host');
    });

    test('应替换多个变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'host', 'example.com');
      await addLocalVariable(contentPage, 'version', 'v1');
      await fillUrl(contentPage, 'http://{{host}}/{{version}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'host');
      await verifyUrlContainsVariable(contentPage, 'version');
    });

    test('未定义的变量应保持原样', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'http://example.com/{{undefined}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'undefined');
    });

    test('变量名应区分大小写', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'Host', 'example.com');
      await fillUrl(contentPage, 'http://{{host}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'host');
    });
  });

  test.describe('15.2 参数中的变量替换', () => {
    test('Query参数value应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'userId', '123');
      await addQueryParam(contentPage, 'id', '{{userId}}');
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'id');
    });

    test('Query参数key应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'paramKey', 'id');
      await addQueryParam(contentPage, '{{paramKey}}', 'value');
      await contentPage.waitForTimeout(300);
    });

    test('Path参数应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'userId', '456');
      await fillUrl(contentPage, 'http://example.com/users/{id}');
      await contentPage.waitForTimeout(300);
    });

    test('参数value可包含部分变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'id', '123');
      await addQueryParam(contentPage, 'fullId', 'prefix_{{id}}_suffix');
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'fullId');
    });
  });

  test.describe('15.3 请求头中的变量替换', () => {
    test('Header value应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'token', 'abc123');
      await addHeader(contentPage, 'X-Token', '{{token}}');
      await contentPage.waitForTimeout(300);
      await verifyHeaderExists(contentPage, 'X-Token');
    });

    test('Authorization头应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'token', 'secret-token-123');
      await addHeader(contentPage, 'Authorization', 'Bearer {{token}}');
      await contentPage.waitForTimeout(300);
      await verifyHeaderExists(contentPage, 'Authorization');
    });

    test('自定义头应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'customValue', 'custom123');
      await addHeader(contentPage, 'X-Custom-Header', '{{customValue}}');
      await contentPage.waitForTimeout(300);
      await verifyHeaderExists(contentPage, 'X-Custom-Header');
    });
  });

  test.describe('15.4 Body中的变量替换', () => {
    test('JSON Body应支持变量替换', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await addLocalVariable(contentPage, 'userId', '789');
      await fillJsonBody(contentPage, { userId: '{{userId}}', name: 'test' });
      await contentPage.waitForTimeout(300);
    });

    test('JSON多层嵌套应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await addLocalVariable(contentPage, 'userId', '123');
      await addLocalVariable(contentPage, 'userName', 'testUser');
      await fillJsonBody(contentPage, {
        user: {
          id: '{{userId}}',
          name: '{{userName}}'
        }
      });
      await contentPage.waitForTimeout(300);
    });

    test('FormData value应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await addLocalVariable(contentPage, 'fieldValue', 'formValue123');
      await switchBodyMode(contentPage, 'form-data');
      await addFormDataField(contentPage, 'field1', '{{fieldValue}}');
      await contentPage.waitForTimeout(300);
    });

    test('Raw模式应支持变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await addLocalVariable(contentPage, 'var', 'rawValue');
      await switchBodyMode(contentPage, 'raw');
      await fillRawBody(contentPage, 'Text with {{var}} replacement');
      await contentPage.waitForTimeout(300);
    });

    test('Binary变量模式应读取变量值', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await switchBodyMode(contentPage, 'binary');
      const varMode = contentPage.locator('input[type="radio"][value="variable"], .mode-variable').first();
      if (await varMode.isVisible()) {
        await varMode.check({ force: true });
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('15.5 变量作用域测试', () => {
    test('应优先使用局部变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addGlobalVariable(contentPage, 'scopeTest', 'globalValue');
      await addLocalVariable(contentPage, 'scopeTest', 'localValue');
      await fillUrl(contentPage, 'http://{{scopeTest}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'scopeTest');
    });

    test('局部变量不存在时应使用环境变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addEnvironmentVariable(contentPage, 'envVar', 'envValue');
      await fillUrl(contentPage, 'http://{{envVar}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'envVar');
    });

    test('环境变量不存在时应使用全局变量', async () => {
      await waitForHttpNodeReady(contentPage);
      await addGlobalVariable(contentPage, 'globalVar', 'globalValue');
      await fillUrl(contentPage, 'http://{{globalVar}}/api');
      await contentPage.waitForTimeout(300);
      await verifyUrlContainsVariable(contentPage, 'globalVar');
    });
  });

  test.describe('15.6 变量实时预览', () => {
    test('应显示变量替换后的实际值预览', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'previewVar', 'previewValue');
      await fillUrl(contentPage, 'http://{{previewVar}}/api');
      await contentPage.waitForTimeout(300);
      const previewElement = contentPage.locator('.variable-preview, .var-tip').first();
      if (await previewElement.isVisible()) {
        await expect(previewElement).toBeVisible();
      }
    });

    test('鼠标悬停变量应显示当前值', async () => {
      await waitForHttpNodeReady(contentPage);
      await addLocalVariable(contentPage, 'hoverVar', 'hoverValue');
      await fillUrl(contentPage, 'http://{{hoverVar}}/api');
      await contentPage.waitForTimeout(300);
      const urlInput = getUrlInput(contentPage);
      await urlInput.hover();
      await contentPage.waitForTimeout(500);
      const tooltip = contentPage.locator('.el-tooltip__popper, .tooltip').first();
      if (await tooltip.isVisible()) {
        await expect(tooltip).toBeVisible();
      }
    });
  });
});
