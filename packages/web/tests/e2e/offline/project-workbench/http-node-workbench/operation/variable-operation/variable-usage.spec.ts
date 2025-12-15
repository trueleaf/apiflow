import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('VariableUsage', () => {
  // 测试用例1: 在url中使用{{ 变量名 }}语法,发送请求时变量被正确替换
  test('在url中使用变量语法发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL变量替换测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理弹窗并创建变量
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableDialog = contentPage.locator('.el-dialog, .variable-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    // 新增baseUrl变量
    const addVariableBtn = variableDialog.locator('.el-button').filter({ hasText: /新增|添加|Add/ }).first();
    await addVariableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableNameInput = variableDialog.locator('input').first();
    await variableNameInput.fill('baseUrl');
    const variableValueInput = variableDialog.locator('input').nth(1);
    await variableValueInput.fill(`http://localhost:${MOCK_SERVER_PORT}`);
    const saveVariableBtn = variableDialog.locator('.el-button--primary').filter({ hasText: /保存|确定|Save|OK/ }).first();
    await saveVariableBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭变量弹窗
    const closeBtn = variableDialog.locator('.el-dialog__close, .close-btn').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 在url中使用变量
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('{{baseUrl}}/echo');
    await contentPage.waitForTimeout(200);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含echo接口返回的数据,说明变量被正确替换
    await expect(responseBody).toContainText('/echo', { timeout: 10000 });
  });
  // 测试用例2: 在query参数value中使用变量,发送请求时变量被正确替换
  test('在query参数中使用变量发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query变量替换测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理弹窗并创建变量
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableDialog = contentPage.locator('.el-dialog, .variable-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    // 新增userId变量
    const addVariableBtn = variableDialog.locator('.el-button').filter({ hasText: /新增|添加|Add/ }).first();
    await addVariableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableNameInput = variableDialog.locator('input').first();
    await variableNameInput.fill('userId');
    const variableValueInput = variableDialog.locator('input').nth(1);
    await variableValueInput.fill('12345');
    const saveVariableBtn = variableDialog.locator('.el-button--primary').filter({ hasText: /保存|确定|Save|OK/ }).first();
    await saveVariableBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭变量弹窗
    const closeBtn = variableDialog.locator('.el-dialog__close, .close-btn').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 设置URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo?id={{userId}}`);
    await contentPage.waitForTimeout(200);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含替换后的参数值
    await expect(responseBody).toContainText('12345', { timeout: 10000 });
  });
  // 测试用例3: 在header参数value中使用变量,发送请求时变量被正确替换
  test('在header参数中使用变量发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Header变量替换测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理弹窗并创建变量
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableDialog = contentPage.locator('.el-dialog, .variable-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    // 新增authToken变量
    const addVariableBtn = variableDialog.locator('.el-button').filter({ hasText: /新增|添加|Add/ }).first();
    await addVariableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableNameInput = variableDialog.locator('input').first();
    await variableNameInput.fill('authToken');
    const variableValueInput = variableDialog.locator('input').nth(1);
    await variableValueInput.fill('Bearer xyz123');
    const saveVariableBtn = variableDialog.locator('.el-button--primary').filter({ hasText: /保存|确定|Save|OK/ }).first();
    await saveVariableBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭变量弹窗
    const closeBtn = variableDialog.locator('.el-dialog__close, .close-btn').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 设置URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(200);
    // 切换到Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加Authorization header
    const headerSection = contentPage.locator('.custom-headers, .headers-section').first();
    const headerKeyInput = headerSection.locator('input').first();
    await headerKeyInput.click();
    await headerKeyInput.fill('Authorization');
    await contentPage.waitForTimeout(200);
    const headerValueInput = headerSection.locator('input').nth(1);
    await headerValueInput.click();
    await headerValueInput.fill('{{authToken}}');
    await contentPage.waitForTimeout(200);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含替换后的header值
    await expect(responseBody).toContainText('Bearer xyz123', { timeout: 10000 });
  });
  // 测试用例4: 在body json中使用变量,发送请求时变量被正确替换
  test('在body json中使用变量发送请求时变量被正确替换', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Body变量替换测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理弹窗并创建变量
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableDialog = contentPage.locator('.el-dialog, .variable-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    // 新增userName变量
    const addVariableBtn = variableDialog.locator('.el-button').filter({ hasText: /新增|添加|Add/ }).first();
    await addVariableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableNameInput = variableDialog.locator('input').first();
    await variableNameInput.fill('userName');
    const variableValueInput = variableDialog.locator('input').nth(1);
    await variableValueInput.fill('John');
    const saveVariableBtn = variableDialog.locator('.el-button--primary').filter({ hasText: /保存|确定|Save|OK/ }).first();
    await saveVariableBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭变量弹窗
    const closeBtn = variableDialog.locator('.el-dialog__close, .close-btn').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 切换请求方法为POST
    const methodSelector = contentPage.locator('[data-testid="method-select"]').first();
    await methodSelector.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first();
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 设置URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(200);
    // 切换到Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.body-type-selector, .body-mode-selector').locator('text=JSON').first();
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 输入JSON body
    const bodyEditor = contentPage.locator('.body-editor, .monaco-editor, .json-editor').first();
    await bodyEditor.click();
    await contentPage.keyboard.type('{"name": "{{userName}}"}');
    await contentPage.waitForTimeout(200);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含替换后的body值
    await expect(responseBody).toContainText('John', { timeout: 10000 });
  });
});
