import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestUrlValidation', () => {
  // 测试用例1: 验证localhost格式的url,调用echo接口,能正确请求,并且显示正确的url地址
  test('验证localhost格式的url能正确请求并显示正确的url地址', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('localhost格式URL测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL为localhost格式
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含host信息，确认localhost被正确解析
    await expect(responseBody).toContainText('host', { timeout: 10000 });
    await expect(responseBody).toContainText('127.0.0.1', { timeout: 10000 });
    // 验证响应中包含请求的URL信息
    await expect(responseBody).toContainText('/echo', { timeout: 10000 });
  });
  // 关闭自动转换localhost配置后,请求信息中保留localhost
  test('关闭自动转换localhost后请求地址保留localhost', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('localhost保留测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭localhost自动转换配置
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await expect(settingsTab).toBeVisible({ timeout: 10000 });
    await settingsTab.click();
    const localhostConfigItem = contentPage.locator('.config-item').filter({ hasText: /自动转换localhost为127\.0\.0\.1|Auto-convert localhost to 127\.0\.0\.1/ });
    await expect(localhostConfigItem).toBeVisible({ timeout: 5000 });
    const localhostSwitch = localhostConfigItem.locator('.el-switch').first();
    await expect(localhostSwitch).toHaveClass(/is-checked/);
    await localhostSwitch.click();
    await expect(localhostSwitch).not.toHaveClass(/is-checked/);
    await contentPage.waitForTimeout(700);
    // 设置请求URL为localhost格式
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    // 切换到请求信息标签页并验证请求地址
    const requestInfoTab = responseTabs.getByRole('tab', { name: /请求信息|Request/i }).first();
    await expect(requestInfoTab).toBeVisible({ timeout: 5000 });
    await requestInfoTab.click();
    const requestInfoPanel = contentPage.locator('.request-info');
    await expect(requestInfoPanel).toBeVisible({ timeout: 5000 });
    await expect(requestInfoPanel).toContainText(`http://localhost:${MOCK_SERVER_PORT}/echo`, { timeout: 10000 });
    await expect(requestInfoPanel).not.toContainText(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
  });
  // 测试用例2: 验证127.0.0.1这样的ip url,调用echo接口,能正确请求,并且显示正确的url地址
  test('验证127.0.0.1格式的ip url能正确请求并显示正确的url地址', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('IP格式URL测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL为IP格式
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含host信息，确认IP地址被正确解析
    await expect(responseBody).toContainText('host', { timeout: 10000 });
    await expect(responseBody).toContainText('127.0.0.1', { timeout: 10000 });
    // 验证响应中包含请求的URL信息
    await expect(responseBody).toContainText('/echo', { timeout: 10000 });
  });
  // 验证请求返回非200状态码时正确显示状态码
  test('验证请求返回非200状态码时正确显示状态码', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('状态码测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 请求返回404状态码的端点
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/status/404`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('404', { timeout: 10000 });
  });
});


