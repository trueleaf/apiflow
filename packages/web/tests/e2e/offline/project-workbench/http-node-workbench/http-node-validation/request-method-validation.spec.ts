import { test, expect } from '../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestMethodValidation', () => {
  // 验证GET方法能正常发送
  test('验证GET方法能正常发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('GET方法测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // GET方法为默认方法，验证选择器显示GET
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await expect(methodSelect).toContainText('GET');
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('"method": "GET"', { timeout: 10000 });
  });
  // 验证POST方法能正常发送
  test('验证POST方法能正常发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('POST方法测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    await expect(methodSelect).toContainText('POST');
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('"method": "POST"', { timeout: 10000 });
  });
  // 验证PUT方法能正常发送
  test('验证PUT方法能正常发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('PUT方法测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择PUT方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' });
    await putOption.click();
    await expect(methodSelect).toContainText('PUT');
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('"method": "PUT"', { timeout: 10000 });
  });
  // 验证DELETE方法能正常发送
  test('验证DELETE方法能正常发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('DELETE方法测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择DELETE方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const deleteOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^DEL$/ });
    await deleteOption.click();
    await expect(methodSelect).toContainText(/DEL/);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('"method": "DELETE"', { timeout: 10000 });
  });
  // 验证PATCH方法能正常发送
  test('验证PATCH方法能正常发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('PATCH方法测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择PATCH方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const patchOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PATCH' });
    await patchOption.click();
    await expect(methodSelect).toContainText('PATCH');
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('"method": "PATCH"', { timeout: 10000 });
  });
  // 验证HEAD方法响应不包含body
  test('验证HEAD方法响应不包含body', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('HEAD方法测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择HEAD方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const headOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'HEAD' });
    await headOption.click();
    await expect(methodSelect).toContainText('HEAD');
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证HEAD方法响应不包含body（响应体应为空或显示无数据）
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // HEAD请求不应返回响应体内容，可能显示为空或无数据提示
    const hasContent = await responseBody.textContent();
    // HEAD方法返回的body应该是空的或不包含method字段
    expect(hasContent?.includes('"method":')).toBeFalsy();
  });
  // 验证OPTIONS方法能正常发送
  test('验证OPTIONS方法能正常发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('OPTIONS方法测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择OPTIONS方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const optionsOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'OPTIONS' });
    await optionsOption.click();
    await expect(methodSelect).toContainText('OPTIONS');
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('"method": "OPTIONS"', { timeout: 10000 });
  });
  // 验证方法切换后UI立即更新显示新的方法
  test('验证方法切换后UI立即更新显示新的方法', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('方法切换UI测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    // 验证默认为GET
    await expect(methodSelect).toContainText('GET');
    // 切换到POST
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).click();
    await expect(methodSelect).toContainText('POST');
    // 切换到PUT
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' }).click();
    await expect(methodSelect).toContainText('PUT');
    // 切换到DELETE
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^DEL$/ }).click();
    await expect(methodSelect).toContainText(/DEL/);
    // 切换到PATCH
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PATCH' }).click();
    await expect(methodSelect).toContainText('PATCH');
    // 切换回GET
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'GET' }).click();
    await expect(methodSelect).toContainText('GET');
  });
});
