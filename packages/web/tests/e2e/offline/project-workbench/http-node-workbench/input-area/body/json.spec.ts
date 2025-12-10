import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('Json', () => {
  // 测试用例1: 输入满足json5格式数据以后,调用echo接口返回结果body参数正确,并且content-type为application/json
  test('输入json5格式数据调用echo接口返回结果正确且content-type为application/json', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('JSON格式测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('.method-select');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 在JSON编辑器中输入json5格式数据
    const monacoEditor = contentPage.locator('.monaco-editor').first();
    await monacoEditor.click();
    await contentPage.waitForTimeout(300);
    // 清空编辑器内容并输入json5格式数据
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{name: "test", age: 25, active: true}');
    await contentPage.waitForTimeout(500);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    // 验证Content-Type为application/json
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
    // 验证响应体中包含正确的JSON数据
    await expect(responseBody).toContainText('name', { timeout: 10000 });
    await expect(responseBody).toContainText('test', { timeout: 10000 });
    await expect(responseBody).toContainText('age', { timeout: 10000 });
    await expect(responseBody).toContainText('25', { timeout: 10000 });
  });
  // 测试用例2: json数据的值字段支持变量,调用echo接口返回结果body参数正确
  test('json数据值字段支持变量调用echo接口返回结果正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('JSON变量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('.method-select');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 打开变量弹窗配置变量
    const variableBtn = contentPage.locator('[data-testid="variable-btn"]');
    await variableBtn.click();
    await contentPage.waitForTimeout(500);
    // 添加变量 user_id=123
    const variableDialog = contentPage.locator('.el-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    const variableKeyInput = variableDialog.locator('[data-testid="params-tree-key-input"]').first();
    await variableKeyInput.fill('user_id');
    const variableValueInput = variableDialog.locator('[data-testid="params-tree-value-input"]').first();
    await variableValueInput.click();
    await contentPage.keyboard.type('123');
    await contentPage.waitForTimeout(300);
    // 关闭变量弹窗
    const closeBtn = variableDialog.locator('.el-dialog__headerbtn');
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 在JSON编辑器中输入包含变量的JSON数据
    const monacoEditor = contentPage.locator('.monaco-editor').first();
    await monacoEditor.click();
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{"user_id": "{{user_id}}", "name": "test"}');
    await contentPage.waitForTimeout(500);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    // 验证变量被正确替换
    await expect(responseBody).toContainText('123', { timeout: 10000 });
    await expect(responseBody).toContainText('user_id', { timeout: 10000 });
  });
  // 测试用例3: json数据支持超大数字
  test('json数据支持超大数字调用echo接口返回结果正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('JSON大数字测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('.method-select');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 在JSON编辑器中输入包含超大数字的JSON数据
    const monacoEditor = contentPage.locator('.monaco-editor').first();
    await monacoEditor.click();
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{"big_number": 9007199254740992, "name": "test"}');
    await contentPage.waitForTimeout(500);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    // 验证超大数字被正确处理
    await expect(responseBody).toContainText('9007199254740992', { timeout: 10000 });
    await expect(responseBody).toContainText('big_number', { timeout: 10000 });
  });
});
