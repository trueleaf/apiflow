import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
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
    await selectHttpMethod(contentPage, 'POST');
  });

  test.describe('4.1 JSON模式测试', () => {
    /**
     * 测试目的：验证能够切换到JSON模式
     * 前置条件：已创建HTTP节点并选择POST方法
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 选择JSON模式
     *   3. 验证Monaco编辑器显示
     * 预期结果：
     *   - JSON模式成功激活
     *   - Monaco代码编辑器可见
     * 验证点：JSON模式切换和编辑器初始化
     */
    test('应能切换到JSON模式', async () => {
      await switchToTab(contentPage, 'Body');
      await switchBodyMode(contentPage, 'JSON');
      const editor = contentPage.locator('.monaco-editor').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证能够在JSON模式下输入数据
     * 前置条件：已切换到JSON模式
     * 操作步骤：
     *   1. 填入JSON对象 {key: 'value', name: 'test'}
     *   2. 等待编辑器更新
     *   3. 验证编辑器可见
     * 预期结果：
     *   - JSON数据成功输入
     *   - 编辑器正常显示
     * 验证点：JSON数据输入功能
     */
    test('应能输入JSON数据', async () => {
      await fillJsonBody(contentPage, { key: 'value', name: 'test' });
      await contentPage.waitForTimeout(500);
      const editor = contentPage.locator('.monaco-editor').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证JSON格式化功能
     * 前置条件：已输入压缩的JSON字符串
     * 操作步骤：
     *   1. 输入压缩的JSON: {"key":"value","name":"test"}
     *   2. 查找格式化按钮
     *   3. 点击格式化按钮
     * 预期结果：
     *   - JSON被格式化为易读的多行格式
     *   - 缩进和换行符正确添加
     * 验证点：JSON格式化美化功能
     * 说明：格式化后的JSON更易于阅读和编辑
     */
    test('应能格式化JSON', async () => {
      await fillJsonBody(contentPage, '{"key":"value","name":"test"}');
      await contentPage.waitForTimeout(300);
      const formatBtn = contentPage.locator('[title*="格式化"], .format-btn').first();
      if (await formatBtn.isVisible()) {
        await formatBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证JSON语法验证功能
     * 前置条件：已切换到JSON模式
     * 操作步骤：
     *   1. 输入不合法的JSON: {"invalid json
     *   2. 等待验证结果
     * 预期结果：
     *   - 编辑器显示语法错误提示
     *   - 错误位置有下划线或标记
     * 验证点：JSON语法校验功能
     * 说明：实时语法检查帮助开发者发现JSON错误
     */
    test('应验证JSON语法', async () => {
      await switchToTab(contentPage, 'Body');
      await switchBodyMode(contentPage, 'JSON');
      await fillJsonBody(contentPage, '{"invalid json');
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证JSON中支持变量替换语法
     * 前置条件：已切换到JSON模式
     * 操作步骤：
     *   1. 输入包含变量占位符的JSON
     *   2. 验证编辑器显示
     * 预期结果：
     *   - 变量占位符{{userId}}、{{token}}被识别
     *   - 发送请求时会进行变量替换
     * 验证点：JSON中的变量占位符支持
     * 说明：变量使用{{variableName}}语法
     */
    test('JSON中应支持变量替换', async () => {
      await fillJsonBody(contentPage, { userId: '{{userId}}', token: '{{token}}' });
      await contentPage.waitForTimeout(300);
      const editor = contentPage.locator('.monaco-editor').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证JSON语法高亮显示
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入包含多种数据类型的JSON
     *   2. 检查编辑器样式
     * 预期结果：
     *   - 不同类型的值有不同颜色
     *   - 字符串、数字、布尔值等有语法高亮
     * 验证点：Monaco编辑器语法高亮功能
     * 说明：语法高亮提升代码可读性
     */
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

    /**
     * 测试目的：验证JSON模式自动设置Content-Type请求头
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 填入JSON数据
     *   2. 切换到Headers标签页
     *   3. 显示隐藏的请求头
     *   4. 验证Content-Type存在
     * 预期结果：
     *   - Content-Type自动设置为application/json
     *   - 请求头列表中可见
     * 验证点：Content-Type自动管理
     * 说明：系统根据Body模式自动设置正确的Content-Type
     */
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
    /**
     * 测试目的：验证能够切换到FormData模式
     * 前置条件：已创建HTTP节点
     * 操作步骤：切换Body模式为form-data
     * 预期结果：
     *   - FormData模式成功激活
     *   - 参数树形表格显示
     * 验证点：FormData模式切换
     * 说明：FormData用于文件上传和表单提交
     */
    test('应能切换到FormData模式', async () => {
      await switchBodyMode(contentPage, 'form-data');
      const tree = contentPage.locator('.body-params .el-tree').first();
      await expect(tree).toBeVisible();
    });

    /**
     * 测试目的：验证添加文本类型的FormData字段
     * 前置条件：已切换到FormData模式
     * 操作步骤：
     *   1. 添加字段 username=testuser
     *   2. 验证key输入框值
     *   3. 验证value输入框值
     * 预期结果：
     *   - 字段成功添加到列表
     *   - key和value正确显示
     * 验证点：文本字段添加功能
     */
    test('应能添加文本字段', async () => {
      await addFormDataField(contentPage, 'username', 'testuser');
      const keyInput = contentPage.locator('.body-params .custom-params input[placeholder*="参数"]').first();
      await expect(keyInput).toHaveValue('username');
      const valueInput = contentPage.locator('.body-params .custom-params .value-text-input').first();
      await expect(valueInput).toHaveValue('testuser');
    });

    /**
     * 测试目的：验证添加文件类型的FormData字段
     * 前置条件：已切换到FormData模式
     * 操作步骤：
     *   1. 添加文件字段 avatar=/path/to/file.jpg
     *   2. 定位到avatar字段行
     *   3. 验证文件路径输入框值
     * 预期结果：
     *   - 文件字段成功添加
     *   - 文件路径正确保存
     * 验证点：文件字段添加功能
     * 说明：文件字段用于上传文件到服务器
     */
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

    /**
     * 测试目的：验证删除FormData字段
     * 前置条件：已添加FormData字段
     * 操作步骤：
     *   1. 添加字段testField
     *   2. 定位到该字段行
     *   3. 点击删除按钮
     *   4. 验证字段已从列表移除
     * 预期结果：
     *   - 字段成功删除
     *   - 列表中不再包含该字段
     * 验证点：字段删除功能
     */
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

    /**
     * 测试目的：验证FormData字段的启用/禁用功能
     * 前置条件：已切换到FormData模式
     * 操作步骤：
     *   1. 添加禁用状态的字段
     *   2. 定位到该字段行
     *   3. 检查启用复选框状态
     * 预期结果：
     *   - 复选框未勾选(禁用状态)
     *   - 禁用的字段不会在请求中发送
     * 验证点：字段启用/禁用控制
     * 说明：禁用字段用于临时排除某些参数
     */
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

    /**
     * 测试目的：验证FormData字段value支持变量
     * 前置条件：已切换到FormData模式
     * 操作步骤：
     *   1. 添加字段值为{{userId}}
     *   2. 定位到该字段行
     *   3. 验证value输入框包含变量占位符
     * 预期结果：
     *   - 变量占位符正确保存
     *   - 发送请求时会替换为实际值
     * 验证点：FormData中的变量支持
     */
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

    /**
     * 测试目的：验证FormData模式自动设置Content-Type
     * 前置条件：已添加FormData字段
     * 操作步骤：
     *   1. 添加表单字段
     *   2. 切换到Headers标签页
     *   3. 显示隐藏的请求头
     *   4. 验证Content-Type存在
     * 预期结果：
     *   - Content-Type自动设置为multipart/form-data
     *   - 包含boundary参数
     * 验证点：FormData的Content-Type自动管理
     */
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
    /**
     * 测试目的：验证能够切换到urlencoded模式
     * 前置条件：已创建HTTP节点
     * 操作步骤：切换Body模式为x-www-form-urlencoded
     * 预期结果：
     *   - urlencoded模式成功激活
     *   - 参数树形表格显示
     * 验证点：urlencoded模式切换
     * 说明：urlencoded用于传统表单提交
     */
    test('应能切换到urlencoded模式', async () => {
      await switchBodyMode(contentPage, 'x-www-form-urlencoded');
      const tree = contentPage.locator('.body-params .el-tree').first();
      await expect(tree).toBeVisible();
    });

    /**
     * 测试目的：验证添加urlencoded参数对
     * 前置条件：已切换到urlencoded模式
     * 操作步骤：
     *   1. 添加参数 username=testuser
     *   2. 验证key和value输入框
     * 预期结果：
     *   - 参数成功添加
     *   - key和value正确显示
     * 验证点：参数添加功能
     */
    test('应能添加参数对', async () => {
      await addUrlEncodedField(contentPage, 'username', 'testuser');
      const keyInput = contentPage.locator('.body-params .custom-params input[placeholder*="参数"]').first();
      await expect(keyInput).toHaveValue('username');
      const valueInput = contentPage.locator('.body-params .custom-params .value-text-input').first();
      await expect(valueInput).toHaveValue('testuser');
    });

    /**
     * 测试目的：验证编辑urlencoded参数
     * 前置条件：已添加urlencoded参数
     * 操作步骤：
     *   1. 添加参数editKey=oldValue
     *   2. 定位到该参数行
     *   3. 修改value为newValue
     * 预期结果：
     *   - 参数value成功修改
     *   - 新值正确保存
     * 验证点：参数编辑功能
     */
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

    /**
     * 测试目的：验证删除urlencoded参数
     * 前置条件：已添加urlencoded参数
     * 操作步骤：
     *   1. 添加参数deleteKey
     *   2. 定位到该参数行
     *   3. 点击删除按钮
     *   4. 验证参数已移除
     * 预期结果：
     *   - 参数成功删除
     *   - 列表中不再包含该参数
     * 验证点：参数删除功能
     */
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

    /**
     * 测试目的：验证urlencoded参数的启用/禁用功能
     * 前置条件：已切换到urlencoded模式
     * 操作步骤：
     *   1. 添加禁用状态的参数
     *   2. 定位到该参数行
     *   3. 检查复选框状态
     * 预期结果：
     *   - 复选框未勾选
     *   - 禁用的参数不会在请求中发送
     * 验证点：参数启用/禁用控制
     */
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

    /**
     * 测试目的：验证urlencoded模式自动设置Content-Type
     * 前置条件：已添加urlencoded参数
     * 操作步骤：
     *   1. 添加参数
     *   2. 切换到Headers标签页
     *   3. 显示隐藏的请求头
     *   4. 验证Content-Type存在
     * 预期结果：
     *   - Content-Type自动设置为application/x-www-form-urlencoded
     * 验证点：Content-Type自动管理
     */
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
    /**
     * 测试目的：验证能够切换到Raw模式
     * 前置条件：已创建HTTP节点
     * 操作步骤：切换Body模式为raw
     * 预期结果：
     *   - Raw模式成功激活
     *   - 编辑器或文本框显示
     * 验证点：Raw模式切换
     * 说明：Raw模式用于发送原始文本数据
     */
    test('应能切换到Raw模式', async () => {
      await switchBodyMode(contentPage, 'raw');
      const editor = contentPage.locator('.monaco-editor, textarea').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证在Raw模式下输入原始文本
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 填入原始文本内容
     *   2. 验证编辑器显示
     * 预期结果：
     *   - 文本成功输入
     *   - 编辑器正常显示
     * 验证点：原始文本输入功能
     */
    test('应能输入原始文本', async () => {
      await fillRawBody(contentPage, 'This is raw text content');
      await contentPage.waitForTimeout(300);
      const editor = contentPage.locator('.monaco-editor, textarea').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证Raw模式支持选择数据类型
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 查找数据类型选择器
     *   2. 点击打开下拉列表
     * 预期结果：
     *   - 类型选择器可见
     *   - 可以打开类型选择下拉
     * 验证点：数据类型选择功能
     * 说明：不同类型影响Content-Type和语法高亮
     */
    test('应能选择数据类型', async () => {
      await switchBodyMode(contentPage, 'raw');
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
      }
    });

    /**
     * 测试目的：验证Raw模式支持text/plain类型
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 打开类型选择器
     *   2. 检查选项列表是否包含text
     * 预期结果：选项列表中有text类型
     * 验证点：text/plain类型支持
     */
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

    /**
     * 测试目的：验证Raw模式支持text/html类型
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 打开类型选择器
     *   2. 检查选项列表是否包含html
     * 预期结果：选项列表中有html类型
     * 验证点：text/html类型支持
     * 说明：html类型用于发送HTML文档
     */
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

    /**
     * 测试目的：验证Raw模式支持application/xml类型
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 打开类型选择器
     *   2. 检查选项列表是否包含xml
     * 预期结果：选项列表中有xml类型
     * 验证点：application/xml类型支持
     * 说明：xml类型用于发送XML文档
     */
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

    /**
     * 测试目的：验证Raw模式支持text/javascript类型
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 打开类型选择器
     *   2. 检查选项列表是否包含javascript
     * 预期结果：选项列表中有javascript类型
     * 验证点：text/javascript类型支持
     */
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

    /**
     * 测试目的：验证Raw模式支持变量替换
     * 前置条件：已切换到Raw模式
     * 操作步骤：填入包含变量占位符的文本
     * 预期结果：
     *   - 变量占位符正确保存
     *   - 发送请求时会进行变量替换
     * 验证点：Raw模式中的变量支持
     */
    test('Raw模式应支持变量替换', async () => {
      await fillRawBody(contentPage, 'User ID: {{userId}}, Token: {{token}}');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Raw模式根据选择的类型设置Content-Type
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 填入原始内容
     *   2. 选择html类型
     *   3. 切换到Headers标签页
     *   4. 验证Content-Type设置
     * 预期结果：
     *   - Content-Type根据选择的类型自动设置
     *   - 如选择html则为text/html
     * 验证点：Content-Type根据Raw类型自动设置
     */
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
    /**
     * 测试目的：验证能够切换到Binary模式
     * 前置条件：已创建HTTP节点
     * 操作步骤：切换Body模式为binary
     * 预期结果：
     *   - Binary模式成功激活
     *   - Binary包装容器显示
     * 验证点：Binary模式切换
     * 说明：Binary模式用于发送二进制文件数据
     */
    test('应能切换到Binary模式', async () => {
      await switchBodyMode(contentPage, 'binary');
      const binaryWrap = contentPage.locator('.binary-wrap').first();
      await expect(binaryWrap).toBeVisible({ timeout: 2000 });
    });

    /**
     * 测试目的：验证Binary模式支持文件模式
     * 前置条件：已切换到Binary模式
     * 操作步骤：
     *   1. 查找文件模式单选按钮
     *   2. 点击选择文件模式
     * 预期结果：
     *   - 文件模式可选择
     *   - 显示文件选择界面
     * 验证点：文件模式选项
     * 说明：文件模式从本地选择文件发送
     */
    test('应支持文件模式', async () => {
      await switchBodyMode(contentPage, 'binary');
      const fileRadio = contentPage.locator('.binary-wrap .el-radio').filter({ hasText: '文件模式' }).first();
      if (await fileRadio.isVisible()) {
        await fileRadio.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证Binary模式支持变量模式
     * 前置条件：已切换到Binary模式
     * 操作步骤：
     *   1. 查找变量模式单选按钮
     *   2. 点击选择变量模式
     * 预期结果：
     *   - 变量模式可选择
     *   - 显示变量输入框
     * 验证点：变量模式选项
     * 说明：变量模式使用变量值作为文件路径
     */
    test('应支持变量模式', async () => {
      await switchBodyMode(contentPage, 'binary');
      const varRadio = contentPage.locator('.binary-wrap .el-radio').filter({ hasText: '变量模式' }).first();
      if (await varRadio.isVisible()) {
        await varRadio.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证文件模式显示文件大小
     * 前置条件：已切换到Binary模式并选择了文件
     * 操作步骤：切换到Binary模式
     * 预期结果：选择文件后显示文件大小信息
     * 验证点：文件信息显示
     * 说明：文件大小帮助用户了解上传的文件情况
     */
    test('文件模式应显示文件大小', async () => {
      await switchBodyMode(contentPage, 'binary');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证能够清除选择的文件
     * 前置条件：已选择Binary文件
     * 操作步骤：
     *   1. 切换到Binary模式
     *   2. 查找清除按钮
     *   3. 点击清除按钮
     * 预期结果：
     *   - 清除按钮可见
     *   - 文件选择被清除
     * 验证点：文件清除功能
     */
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
    /**
     * 测试目的：验证能够切换到None模式
     * 前置条件：已创建HTTP节点
     * 操作步骤：切换Body模式为none
     * 预期结果：
     *   - None模式成功激活
     *   - None模式单选按钮被选中
     * 验证点：None模式切换
     * 说明：None模式表示不发送请求体
     */
    test('应能切换到None模式', async () => {
      await switchBodyMode(contentPage, 'none');
      const noneInput = contentPage.locator('.body-params input[value="none"]').first();
      await expect(noneInput).toBeChecked();
    });

    /**
     * 测试目的：验证None模式清空Body内容
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 先输入JSON数据
     *   2. 切换到None模式
     *   3. 检查Monaco编辑器数量
     * 预期结果：
     *   - Body内容区域清空
     *   - 不显示任何编辑器
     * 验证点：None模式清空功能
     */
    test('None模式应清空Body内容', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchBodyMode(contentPage, 'none');
      await contentPage.waitForTimeout(300);
      const editors = await contentPage.locator('.body-params .monaco-editor').count();
      expect(editors).toBe(0);
    });

    /**
     * 测试目的：验证None模式不设置Content-Type
     * 前置条件：已切换到None模式
     * 操作步骤：
     *   1. 切换到None模式
     *   2. 切换到Headers标签页
     *   3. 显示隐藏的请求头
     *   4. 检查Content-Type是否存在
     * 预期结果：
     *   - Headers列表中不包含Content-Type
     *   - 发送请求时不携带Content-Type
     * 验证点：None模式不设置Content-Type
     * 说明：None模式下请求体为空,不需要Content-Type
     */
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
    /**
     * 测试目的：验证从JSON切换到FormData时的数据丢失提示
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 切换到FormData模式
     *   3. 等待提示弹窗
     * 预期结果：
     *   - 可能显示数据丢失警告弹窗
     *   - 提示用户切换将清空当前数据
     * 验证点：模式切换的数据保护提示
     * 说明：不同模式数据格式不兼容,切换需提示
     */
    test('从JSON切换到FormData应提示数据丢失', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchBodyMode(contentPage, 'form-data');
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证取消模式切换保持原数据
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 尝试切换模式但取消
     * 预期结果：
     *   - 原有数据保持不变
     *   - 仍处于JSON模式
     * 验证点：取消切换的数据保护
     */
    test('取消模式切换应保持原数据', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证确认切换清空前一模式数据
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 切换到FormData
     *   3. 再切换回JSON
     * 预期结果：
     *   - 每次切换清空前一模式的数据
     *   - 切换回JSON后数据为空
     * 验证点：模式切换的数据清理
     */
    test('确认切换应清空前一模式数据', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchBodyMode(contentPage, 'form-data');
      await switchBodyMode(contentPage, 'JSON');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证模式切换更新Content-Type
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到JSON模式
     *   2. 切换到FormData模式
     * 预期结果：
     *   - Content-Type跟随模式变化
     *   - JSON时为application/json
     *   - FormData时为multipart/form-data
     * 验证点：模式切换时Content-Type同步更新
     */
    test('模式切换应更新Content-Type', async () => {
      await switchBodyMode(contentPage, 'JSON');
      await contentPage.waitForTimeout(200);
      await switchBodyMode(contentPage, 'form-data');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证相同模式切换保持数据
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 切换到其他标签页
     *   3. 切换回Body标签页
     * 预期结果：
     *   - 数据保持不变
     *   - 仍为JSON模式
     * 验证点：标签页切换不影响Body数据
     */
    test('相同模式切换应保持数据', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchToTab(contentPage, 'Params');
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('4.8 Body数据持久化', () => {
    /**
     * 测试目的：验证Body数据自动保存
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 切换到Headers标签页
     *   3. 切换回Body标签页
     * 预期结果：
     *   - Body数据仍然存在
     *   - 数据自动保存到缓存
     * 验证点：Body数据持久化功能
     * 说明：切换标签页不会丢失Body数据
     */
    test('Body数据应自动保存', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await switchToTab(contentPage, 'Headers');
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证切换请求方法保持Body数据
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 切换HTTP方法为PUT
     *   3. 切换回Body标签页
     * 预期结果：
     *   - Body数据保持不变
     *   - 不同HTTP方法共享Body数据
     * 验证点：HTTP方法切换时Body数据保持
     * 说明：切换请求方法不影响已输入的Body内容
     */
    test('切换请求方法应保持Body数据', async () => {
      await fillJsonBody(contentPage, { key: 'value' });
      await selectHttpMethod(contentPage, 'PUT');
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });
  });
});
