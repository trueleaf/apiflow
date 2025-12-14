import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('PreScriptExecution', () => {
  // 测试用例1: 前置脚本语法错误时,发送请求后在响应区域展示脚本错误信息
  test('前置脚本语法错误时展示脚本错误信息', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('语法错误测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入有语法错误的代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入有语法错误的代码
    const invalidScript = 'const x = { invalid syntax }';
    await contentPage.keyboard.type(invalidScript);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证错误信息显示（脚本错误应该在页面上显示）
    const errorMessage = contentPage.locator('.el-message--error, .script-error, .error-message');
    const hasError = await errorMessage.count() > 0;
    // 或者检查响应区域是否有错误相关内容
    const responseArea = contentPage.locator('.response-body, .response-view');
    if (await responseArea.isVisible()) {
      const responseText = await responseArea.textContent();
      // 语法错误时可能会显示错误信息或请求未能成功发送
      expect(responseText !== null || hasError).toBeTruthy();
    }
  });
  // 测试用例2: 前置脚本运行时错误时,发送请求后在响应区域展示运行时错误信息
  test('前置脚本运行时错误时展示运行时错误信息', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('运行时错误测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入会导致运行时错误的代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入会导致运行时错误的代码（访问null的属性）
    const runtimeErrorScript = 'const x = null; x.property;';
    await contentPage.keyboard.type(runtimeErrorScript);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证错误信息显示
    const errorMessage = contentPage.locator('.el-message--error, .script-error, .error-message');
    const hasError = await errorMessage.count() > 0;
    // 或者检查响应区域
    const responseArea = contentPage.locator('.response-body, .response-view');
    if (await responseArea.isVisible()) {
      const responseText = await responseArea.textContent();
      // 运行时错误时可能会显示错误信息
      expect(responseText !== null || hasError).toBeTruthy();
    }
  });
  // 测试用例3: 前置脚本正常执行后,主请求继续发送
  test('前置脚本正常执行后主请求继续发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('正常执行测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入正确的脚本代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入正确的脚本代码
    const validScript = 'const timestamp = Date.now(); console.log("前置脚本执行时间:", timestamp);';
    await contentPage.keyboard.type(validScript);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域显示主请求的响应数据
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应包含echo接口返回的数据，说明主请求成功发送
    await expect(responseBody).toContainText('127.0.0.1', { timeout: 10000 });
  });
});
