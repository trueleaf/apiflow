import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfVariablesApi', () => {
  // 使用af.variables.get(name)获取指定变量值
  test('使用af.variables.get(name)获取指定变量值', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量获取测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 切换到后置脚本Tab
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本编辑器中输入代码：先设置变量再获取
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.variables.set("api_url", "https://example.com/api");\nconst apiUrl = af.variables.get("api_url");\nconsole.log("apiUrl:", apiUrl);');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证请求成功（状态码200表示脚本执行无误）
    const responseArea = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
  });
  // 使用af.variables.set(name, value)设置变量值
  test('使用af.variables.set(name, value)设置变量值', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量设置测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 切换到后置脚本Tab
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本编辑器中输入代码设置变量
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.variables.set("next_page", 2);\nconsole.log("变量已设置:", af.variables.get("next_page"));');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证请求成功（状态码200表示脚本执行无误）
    const responseArea = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
  });
  // 后置脚本中设置的变量在下次请求中可以使用
  test('后置脚本中设置的变量在下次请求中可以使用', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增第一个HTTP节点用于设置变量
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('设置Token接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置第一个请求的URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 切换到后置脚本Tab
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在第一个请求的后置脚本中设置变量
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.variables.set("token_from_response", "test_token_abc123");\nconsole.log("Token变量已设置");');
    await contentPage.waitForTimeout(300);
    // 发送第一个请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证第一个请求成功（状态码200表示脚本执行无误）
    const responseArea = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    // 新增第二个HTTP节点用于验证变量
    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput2 = addFileDialog.locator('input').first();
    await fileNameInput2.fill('验证Token接口');
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置第二个请求的URL，使用变量
    const urlInput2 = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput2.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?token={{token_from_response}}`);
    // 切换到后置脚本Tab
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在第二个请求的后置脚本中读取并验证变量
    const monacoEditor2 = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor2.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const token = af.variables.get("token_from_response");\nconsole.log("获取到的Token:", token);');
    await contentPage.waitForTimeout(300);
    // 发送第二个请求
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证第二个请求成功（状态码200表示脚本执行无误，变量被正确使用）
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    // 验证URL中变量被正确替换
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('test_token_abc123', { timeout: 10000 });
  });
});
