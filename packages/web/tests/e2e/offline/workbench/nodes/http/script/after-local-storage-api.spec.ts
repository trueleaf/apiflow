import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfLocalStorageApi', () => {
  // 测试用例1: 使用af.localStorage.set(key, value)存储持久数据
  test('使用af.localStorage.set(key, value)存储持久数据', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('localStorage set测试');
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
    // 输入后置脚本
    const monacoEditor = contentPage.locator('#pane-afterRequest .s-monaco-editor, .s-monaco-editor:visible').first();
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.localStorage.set(\"user_id\", \"12345\"); if (af.localStorage.get(\"user_id\") !== \"12345\") { throw new Error(\"localStorage写入失败\") }');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证请求成功（状态码200表示脚本执行无误）
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    await expect(responseArea.getByTestId('response-error')).toBeHidden({ timeout: 10000 });
  });
  // 测试用例2: 使用af.localStorage.get(key)获取持久数据
  test('使用af.localStorage.get(key)获取持久数据', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('localStorage get测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL（使用变量将获取的值传递到请求中验证）
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 输入后置脚本，获取值并存储到变量中
    const monacoEditor = contentPage.locator('#pane-afterRequest .s-monaco-editor, .s-monaco-editor:visible').first();
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.localStorage.set(\"test_key\", \"test_value\"); const value = af.localStorage.get(\"test_key\"); if (value !== \"test_value\") { throw new Error(`localStorage读取失败: ${value}`) }');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证请求成功
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    await expect(responseArea.getByTestId('response-error')).toBeHidden({ timeout: 10000 });
  });
  // 测试用例3: 使用af.localStorage.remove(key)删除持久数据
  test('使用af.localStorage.remove(key)删除持久数据', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('localStorage remove测试');
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
    // 输入后置脚本删除数据
    const monacoEditor = contentPage.locator('#pane-afterRequest .s-monaco-editor, .s-monaco-editor:visible').first();
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.localStorage.set(\"remove_key\", \"remove_value\"); af.localStorage.remove(\"remove_key\"); if (af.localStorage.get(\"remove_key\") !== null) { throw new Error(\"localStorage删除失败\") }');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证请求成功
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    await expect(responseArea.getByTestId('response-error')).toBeHidden({ timeout: 10000 });
  });
  // 测试用例4: 使用af.localStorage.clear()清空所有持久数据
  test('使用af.localStorage.clear()清空所有持久数据', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('localStorage clear测试');
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
    // 输入后置脚本清空所有数据
    const monacoEditor = contentPage.locator('#pane-afterRequest .s-monaco-editor, .s-monaco-editor:visible').first();
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.localStorage.set(\"clear_key1\", \"value1\"); af.localStorage.set(\"clear_key2\", \"value2\"); af.localStorage.set(\"clear_key3\", \"value3\"); af.localStorage.clear(); if (af.localStorage.get(\"clear_key1\") !== null || af.localStorage.get(\"clear_key2\") !== null || af.localStorage.get(\"clear_key3\") !== null) { throw new Error(\"localStorage清空失败\") }');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证请求成功
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    await expect(responseArea.getByTestId('response-error')).toBeHidden({ timeout: 10000 });
  });
  // 测试用例5: 获取不存在的键返回null
  test('获取不存在的键返回null', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('localStorage get不存在的键测试');
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
    // 输入后置脚本，获取不存在的键并存储结果
    const monacoEditor = contentPage.locator('#pane-afterRequest .s-monaco-editor, .s-monaco-editor:visible').first();
    await expect(monacoEditor).toBeVisible({ timeout: 5000 });
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('if (af.localStorage.get(\"non_existent_key\") !== null) { throw new Error(\"预期返回null\") }');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证请求成功
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    await expect(responseArea.getByTestId('response-error')).toBeHidden({ timeout: 10000 });
  });
});


