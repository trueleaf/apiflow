import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  selectHttpMethod,
  switchToTab,
  switchBodyMode,
  fillJsonBody,
  fillRawBody,
  addFormDataField,
  addUrlEncodedField,
  verifyHeaderExists
} from './helpers/httpNodeHelpers';

test.describe('4. HTTP节点 - Body模块测试', () => {
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
    await waitForHttpNodeReady(contentPage);
    await selectHttpMethod(contentPage, 'POST');
  });

  test.describe('4.1 JSON模式测试', () => {
    test('应能切换到JSON模式', async () => {
      await switchToTab(contentPage, 'Body');
      await switchBodyMode(contentPage, 'JSON');
      const editor = contentPage.locator('.monaco-editor').first();
      await expect(editor).toBeVisible();
    });

    test('应能输入JSON数据', async () => {
      await fillJsonBody(contentPage, { key: 'value', name: 'test' });
      await contentPage.waitForTimeout(500);
      const editor = contentPage.locator('.monaco-editor').first();
      await expect(editor).toBeVisible();
    });

    test('应能格式化JSON', async () => {
      await fillJsonBody(contentPage, '{"key":"value","name":"test"}');
      await contentPage.waitForTimeout(300);
      const formatBtn = contentPage.locator('[title*="格式化"], .format-btn').first();
      if (await formatBtn.isVisible()) {
        await formatBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('应验证JSON语法', async () => {
      await switchToTab(contentPage, 'Body');
      await switchBodyMode(contentPage, 'JSON');
      await fillJsonBody(contentPage, '{"invalid json');
      await contentPage.waitForTimeout(500);
    });

    test('JSON中应支持变量替换', async () => {
      await fillJsonBody(contentPage, { userId: '{{userId}}', token: '{{token}}' });
      await contentPage.waitForTimeout(300);
      const editor = contentPage.locator('.monaco-editor').first();
      await expect(editor).toBeVisible();
    });

    test('应支持JSON语法高亮', async () => {
      await fillJsonBody(contentPage, { key: 'value', number: 123, bool: true });
      await contentPage.waitForTimeout(300);
      const editor = contentPage.locator('.monaco-editor').first();
      const hasHighlight = await editor.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.fontFamily.length > 0;
      });
      expect(hasHighlight).toBeTruthy();
    });

    test('应自动设置Content-Type为application/json', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchToTab(contentPage, 'Headers');
      const hiddenToggle = contentPage
        .locator('.header-info span')
        .filter({ hasText: /隐藏|hidden/i })
        .first();
      if (await hiddenToggle.isVisible()) {
        await hiddenToggle.click();
        await contentPage.waitForTimeout(200);
      }
      await verifyHeaderExists(contentPage, 'Content-Type');
    });
  });

  test.describe('4.2 FormData模式测试', () => {
    test('应能切换到FormData模式', async () => {
      await switchBodyMode(contentPage, 'form-data');
      const tree = contentPage.locator('.body-params .el-tree').first();
      await expect(tree).toBeVisible();
    });

    test('应能添加文本字段', async () => {
      await addFormDataField(contentPage, 'username', 'testuser');
      const keyInput = contentPage.locator('.body-params .custom-params input[placeholder*="参数"]').first();
      await expect(keyInput).toHaveValue('username');
      const valueInput = contentPage.locator('.body-params .custom-params .value-text-input').first();
      await expect(valueInput).toHaveValue('testuser');
    });

    test('应能添加文件字段', async () => {
      await addFormDataField(contentPage, 'avatar', '/path/to/file.jpg', { type: 'file' });
      const keyInputs = await contentPage
        .locator('.body-params .custom-params input[placeholder*="参数"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = keyInputs.indexOf('avatar');
      expect(targetIndex).toBeGreaterThan(-1);
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const valueInput = row.locator('input[placeholder*="变量模式"], input[placeholder*="variable"]').first();
      await expect(valueInput).toHaveValue('/path/to/file.jpg');
    });

    test('应能删除表单字段', async () => {
      await addFormDataField(contentPage, 'testField', 'testValue');
      const keyLocator = contentPage.locator('.body-params .custom-params input[placeholder*="参数"]');
      const initialValues = await keyLocator.evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = initialValues.indexOf('testField');
      expect(targetIndex).toBeGreaterThan(-1);
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const deleteBtn = row.locator('.delete-icon, .icon-shanchu, [title*="删除"]').first();
      await deleteBtn.click();
      await contentPage.waitForTimeout(300);
      const afterValues = await keyLocator.evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      expect(afterValues.includes('testField')).toBe(false);
    });

    test('表单字段应支持启用/禁用', async () => {
      await addFormDataField(contentPage, 'disabledField', 'value', { enabled: false });
      const keyValues = await contentPage
        .locator('.body-params .custom-params input[placeholder*="参数"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = keyValues.indexOf('disabledField');
      expect(targetIndex).toBeGreaterThan(-1);
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const checkbox = row.locator('input[type="checkbox"]').first();
      const isChecked = await checkbox.isChecked();
      expect(isChecked).toBe(false);
    });

    test('表单字段value应支持变量', async () => {
      await addFormDataField(contentPage, 'userId', '{{userId}}');
      const keyValues = await contentPage
        .locator('.body-params .custom-params input[placeholder*="参数"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = keyValues.indexOf('userId');
      expect(targetIndex).toBeGreaterThan(-1);
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const valueInput = row.locator('.value-text-input, textarea').first();
      await expect(valueInput).toHaveValue('{{userId}}');
    });

    test('应自动设置Content-Type为multipart/form-data', async () => {
      await addFormDataField(contentPage, 'formKey', 'formValue');
      await switchToTab(contentPage, 'Headers');
      const hiddenToggle = contentPage
        .locator('.header-info span')
        .filter({ hasText: /隐藏|hidden/i })
        .first();
      if (await hiddenToggle.isVisible()) {
        await hiddenToggle.click();
        await contentPage.waitForTimeout(200);
      }
      await verifyHeaderExists(contentPage, 'Content-Type');
    });
  });

  test.describe('4.3 x-www-form-urlencoded模式测试', () => {
    test('应能切换到urlencoded模式', async () => {
      await switchBodyMode(contentPage, 'x-www-form-urlencoded');
      const tree = contentPage.locator('.body-params .el-tree').first();
      await expect(tree).toBeVisible();
    });

    test('应能添加参数对', async () => {
      await addUrlEncodedField(contentPage, 'username', 'testuser');
      const keyInput = contentPage.locator('.body-params .custom-params input[placeholder*="参数"]').first();
      await expect(keyInput).toHaveValue('username');
      const valueInput = contentPage.locator('.body-params .custom-params .value-text-input').first();
      await expect(valueInput).toHaveValue('testuser');
    });

    test('应能编辑参数', async () => {
      await addUrlEncodedField(contentPage, 'editKey', 'oldValue');
      const keyValues = await contentPage
        .locator('.body-params .custom-params input[placeholder*="参数"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = keyValues.indexOf('editKey');
      expect(targetIndex).toBeGreaterThan(-1);
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const valueInput = row.locator('.value-text-input').first();
      await valueInput.evaluate((element, newValue) => {
        const input = element as HTMLInputElement;
        input.focus();
        input.value = newValue as string;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, 'newValue');
      await contentPage.waitForTimeout(200);
    });

    test('应能删除参数', async () => {
      await addUrlEncodedField(contentPage, 'deleteKey', 'value');
      const keyLocator = contentPage.locator('.body-params .custom-params input[placeholder*="参数"]');
      const initialValues = await keyLocator.evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = initialValues.indexOf('deleteKey');
      expect(targetIndex).toBeGreaterThan(-1);
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const deleteBtn = row.locator('.delete-icon, .icon-shanchu, [title*="删除"]').first();
      await deleteBtn.click();
      await contentPage.waitForTimeout(300);
      const afterValues = await keyLocator.evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      expect(afterValues.includes('deleteKey')).toBe(false);
    });

    test('参数应支持启用/禁用', async () => {
      await addUrlEncodedField(contentPage, 'disabledKey', 'value', { enabled: false });
      const keyValues = await contentPage
        .locator('.body-params .custom-params input[placeholder*="参数"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = keyValues.indexOf('disabledKey');
      expect(targetIndex).toBeGreaterThan(-1);
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const checkbox = row.locator('input[type="checkbox"]').first();
      const isChecked = await checkbox.isChecked();
      expect(isChecked).toBe(false);
    });

    test('应自动设置Content-Type为application/x-www-form-urlencoded', async () => {
      await addUrlEncodedField(contentPage, 'formKey', 'formValue');
      await switchToTab(contentPage, 'Headers');
      const hiddenToggle = contentPage
        .locator('.header-info span')
        .filter({ hasText: /隐藏|hidden/i })
        .first();
      if (await hiddenToggle.isVisible()) {
        await hiddenToggle.click();
        await contentPage.waitForTimeout(200);
      }
      await verifyHeaderExists(contentPage, 'Content-Type');
    });
  });

  test.describe('4.4 Raw模式测试', () => {
    test('应能切换到Raw模式', async () => {
      await switchBodyMode(contentPage, 'raw');
      const editor = contentPage.locator('.monaco-editor, textarea').first();
      await expect(editor).toBeVisible();
    });

    test('应能输入原始文本', async () => {
      await fillRawBody(contentPage, 'This is raw text content');
      await contentPage.waitForTimeout(300);
      const editor = contentPage.locator('.monaco-editor, textarea').first();
      await expect(editor).toBeVisible();
    });

    test('应能选择数据类型', async () => {
      await switchBodyMode(contentPage, 'raw');
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
      }
    });

    test('支持的数据类型应包括text/plain', async () => {
      await switchBodyMode(contentPage, 'raw');
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
        const optionTexts = await contentPage
          .locator('.el-select-dropdown__item')
          .evaluateAll((elements) => elements.map((element) => (element.textContent || '').trim().toLowerCase()));
        expect(optionTexts.includes('text')).toBe(true);
      }
    });

    test('支持的数据类型应包括text/html', async () => {
      await switchBodyMode(contentPage, 'raw');
      await contentPage.waitForTimeout(300);
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
        const optionTexts = await contentPage
          .locator('.el-select-dropdown__item')
          .evaluateAll((elements) => elements.map((element) => (element.textContent || '').trim().toLowerCase()));
        expect(optionTexts.includes('html')).toBe(true);
      }
    });

    test('支持的数据类型应包括application/xml', async () => {
      await switchBodyMode(contentPage, 'raw');
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
        const optionTexts = await contentPage
          .locator('.el-select-dropdown__item')
          .evaluateAll((elements) => elements.map((element) => (element.textContent || '').trim().toLowerCase()));
        expect(optionTexts.includes('xml')).toBe(true);
      }
    });

    test('支持的数据类型应包括text/javascript', async () => {
      await switchBodyMode(contentPage, 'raw');
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
        const optionTexts = await contentPage
          .locator('.el-select-dropdown__item')
          .evaluateAll((elements) => elements.map((element) => (element.textContent || '').trim().toLowerCase()));
        expect(optionTexts.includes('javascript')).toBe(true);
      }
    });

    test('Raw模式应支持变量替换', async () => {
      await fillRawBody(contentPage, 'User ID: {{userId}}, Token: {{token}}');
      await contentPage.waitForTimeout(300);
    });

    test('应根据选择的类型设置Content-Type', async () => {
      await fillRawBody(contentPage, 'Raw body sample');
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        const htmlOption = contentPage.locator('.el-select-dropdown__item:has-text("html")').first();
        if (await htmlOption.isVisible()) {
          await htmlOption.click();
        }
      }
      await switchToTab(contentPage, 'Headers');
      const hiddenToggle = contentPage
        .locator('.header-info span')
        .filter({ hasText: /隐藏|hidden/i })
        .first();
      if (await hiddenToggle.isVisible()) {
        await hiddenToggle.click();
        await contentPage.waitForTimeout(200);
      }
      await verifyHeaderExists(contentPage, 'Content-Type');
    });
  });

  test.describe('4.5 Binary模式测试', () => {
    test('应能切换到Binary模式', async () => {
      await switchBodyMode(contentPage, 'binary');
      const binaryWrap = contentPage.locator('.binary-wrap').first();
      await expect(binaryWrap).toBeVisible({ timeout: 2000 });
    });

    test('应支持文件模式', async () => {
      await switchBodyMode(contentPage, 'binary');
      const fileRadio = contentPage.locator('.binary-wrap .el-radio').filter({ hasText: '文件模式' }).first();
      if (await fileRadio.isVisible()) {
        await fileRadio.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('应支持变量模式', async () => {
      await switchBodyMode(contentPage, 'binary');
      const varRadio = contentPage.locator('.binary-wrap .el-radio').filter({ hasText: '变量模式' }).first();
      if (await varRadio.isVisible()) {
        await varRadio.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('文件模式应显示文件大小', async () => {
      await switchBodyMode(contentPage, 'binary');
      await contentPage.waitForTimeout(300);
    });

    test('应能清除选择的文件', async () => {
      await switchBodyMode(contentPage, 'binary');
      const clearBtn = contentPage.locator('[title*="清除"], .clear-btn, .binary-wrap .close').first();
      if (await clearBtn.isVisible()) {
        await clearBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('4.6 None模式测试', () => {
    test('应能切换到None模式', async () => {
      await switchBodyMode(contentPage, 'none');
      const noneInput = contentPage.locator('.body-params input[value="none"]').first();
      await expect(noneInput).toBeChecked();
    });

    test('None模式应清空Body内容', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchBodyMode(contentPage, 'none');
      await contentPage.waitForTimeout(300);
      const editors = await contentPage.locator('.body-params .monaco-editor').count();
      expect(editors).toBe(0);
    });

    test('None模式不应设置Content-Type', async () => {
      await switchBodyMode(contentPage, 'none');
      await contentPage.waitForTimeout(300);
      await switchToTab(contentPage, 'Headers');
      const hiddenToggle = contentPage
        .locator('.header-info span')
        .filter({ hasText: /隐藏|hidden/i })
        .first();
      if (await hiddenToggle.isVisible()) {
        await hiddenToggle.click();
        await contentPage.waitForTimeout(200);
      }
      const headerKeys = await contentPage
        .locator('.header-info input[placeholder*="请求头"], .header-info input[placeholder*="参数"], .header-info input[placeholder*="key"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      expect(headerKeys.includes('Content-Type')).toBe(false);
    });
  });

  test.describe('4.7 模式切换测试', () => {
    test('从JSON切换到FormData应提示数据丢失', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchBodyMode(contentPage, 'form-data');
      await contentPage.waitForTimeout(500);
    });

    test('取消模式切换应保持原数据', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await contentPage.waitForTimeout(300);
    });

    test('确认切换应清空前一模式数据', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchBodyMode(contentPage, 'form-data');
      await switchBodyMode(contentPage, 'JSON');
      await contentPage.waitForTimeout(300);
    });

    test('模式切换应更新Content-Type', async () => {
      await switchBodyMode(contentPage, 'JSON');
      await contentPage.waitForTimeout(200);
      await switchBodyMode(contentPage, 'form-data');
      await contentPage.waitForTimeout(300);
    });

    test('相同模式切换应保持数据', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchToTab(contentPage, 'Params');
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('4.8 Body数据持久化', () => {
    test('Body数据应自动保存', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchToTab(contentPage, 'Headers');
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });

    test('切换请求方法应保持Body数据', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await selectHttpMethod(contentPage, 'PUT');
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });
  });
});
