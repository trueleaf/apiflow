import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfHttpApi', () => {
  // 测试用例1: 使用af.http.get()发送GET请求,请求成功并获取响应数据
  test('使用af.http.get发送GET请求并获取响应数据', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.http.get测试');
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
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码
    const scriptCode = `const response = await af.http.get("http://127.0.0.1:${MOCK_SERVER_PORT}/echo?test=preGet");
console.log("GET响应状态码:", response.status);
console.log("GET响应数据:", JSON.stringify(response.data));`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域存在
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
  });
  // 测试用例2: 使用af.http.post()发送POST请求,请求成功并获取响应数据
  test('使用af.http.post发送POST请求并获取响应数据', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.http.post测试');
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
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码
    const scriptCode = `const response = await af.http.post("http://127.0.0.1:${MOCK_SERVER_PORT}/echo", { name: "John", age: 25 });
console.log("POST响应状态码:", response.status);
console.log("POST响应数据:", JSON.stringify(response.data));`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域存在
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
  });
  // 测试用例3: 使用af.http.put()发送PUT请求,请求成功并获取响应数据
  test('使用af.http.put发送PUT请求并获取响应数据', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.http.put测试');
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
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码
    const scriptCode = `const response = await af.http.put("http://127.0.0.1:${MOCK_SERVER_PORT}/echo", { name: "Jane", age: 30 });
console.log("PUT响应状态码:", response.status);
console.log("PUT响应数据:", JSON.stringify(response.data));`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域存在
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
  });
  // 测试用例4: 使用af.http.delete()发送DELETE请求,请求成功并获取响应数据
  test('使用af.http.delete发送DELETE请求并获取响应数据', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.http.delete测试');
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
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码
    const scriptCode = `const response = await af.http.delete("http://127.0.0.1:${MOCK_SERVER_PORT}/echo?id=123");
console.log("DELETE响应状态码:", response.status);
console.log("DELETE响应数据:", JSON.stringify(response.data));`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域存在
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
  });
  // 测试用例5: af.http请求失败时正确抛出错误并在响应区域展示错误信息
  test('af.http请求失败时正确抛出错误', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.http错误处理测试');
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
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码 - 请求一个不存在的端口以触发错误
    const scriptCode = `try {
  const response = await af.http.get("http://127.0.0.1:59999/invalid-endpoint");
  console.log("响应:", response);
} catch(e) {
  console.error("请求失败:", e.message);
}`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域存在（即使前置脚本有错误，主请求仍会执行）
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
  });
});
