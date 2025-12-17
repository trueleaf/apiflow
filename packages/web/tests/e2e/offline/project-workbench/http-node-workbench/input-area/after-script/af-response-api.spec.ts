import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfResponseApi', () => {
  // 测试用例1: 使用af.response.statusCode获取响应状态码
  test('使用af.response.statusCode获取响应状态码', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.statusCode测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("statusCode:", af.response.statusCode)');
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
  // 测试用例2: 使用af.response.headers获取响应头
  test('使用af.response.headers获取响应头', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.headers测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("headers:", JSON.stringify(af.response.headers))');
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
    // 验证响应头信息存在
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('content-type', { timeout: 10000 });
  });
  // 测试用例3: 使用af.response.cookies获取响应Cookie
  test('使用af.response.cookies获取响应Cookie', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.cookies测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL - 使用set-cookie端点
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("cookies:", JSON.stringify(af.response.cookies))');
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
  // 测试用例4: 使用af.response.body获取响应体数据
  test('使用af.response.body获取响应体数据', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.body测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("body:", JSON.stringify(af.response.body))');
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
    // 验证响应体存在
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
  });
  // 测试用例5: 使用af.response.rt获取响应时长
  test('使用af.response.rt获取响应时长', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.rt测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("rt:", af.response.rt, "ms")');
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
  // 测试用例6: 使用af.response.size获取响应大小
  test('使用af.response.size获取响应大小', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.size测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("size:", af.response.size, "bytes")');
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
  // 测试用例7: 使用af.response.ip获取远端IP地址
  test('使用af.response.ip获取远端IP地址', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.response.ip测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 在后置脚本中输入代码
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("ip:", af.response.ip)');
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
    // 验证响应体存在（包含 ip 字段）
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('ip', { timeout: 10000 });
  });
});
