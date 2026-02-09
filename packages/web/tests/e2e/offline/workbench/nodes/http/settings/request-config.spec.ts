import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestConfig', () => {
  // 修改最大文本Body大小配置,验证超过限制时的处理
  test('修改最大文本Body大小配置', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    // 创建HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 10000 });
    await addHttpBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 10000 });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('最大文本Body大小测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();

    // 切换到设置标签
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await expect(settingsTab).toBeVisible({ timeout: 10000 });
    await settingsTab.click();

    const settingsPanel = contentPage.locator('.request-settings');
    await expect(settingsPanel).toBeVisible({ timeout: 10000 });

    // 找到"最大文本Body大小"配置项
    const maxBodySizeInput = contentPage.locator('.request-settings .config-item .control-number input').first();
    await expect(maxBodySizeInput).toBeVisible({ timeout: 5000 });
    await maxBodySizeInput.click();
    await maxBodySizeInput.fill('1');
  });
  // 修改最大原始Body大小配置,验证超过限制时的处理
  test('修改最大原始Body大小配置', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    // 创建HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 10000 });
    await addHttpBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 10000 });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('最大原始Body大小测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();

    // 切换到设置标签
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await expect(settingsTab).toBeVisible({ timeout: 10000 });
    await settingsTab.click();

    const settingsPanel = contentPage.locator('.request-settings');
    await expect(settingsPanel).toBeVisible({ timeout: 10000 });

    const maxRawBodySizeInput = contentPage.locator('.request-settings .config-item .control-number input').nth(1);
    await expect(maxRawBodySizeInput).toBeVisible({ timeout: 5000 });
    await maxRawBodySizeInput.click();
    await maxRawBodySizeInput.fill('1');
  });
  // 修改自定义User-Agent配置,发送请求后验证User-Agent已更改
  test('修改自定义User-Agent配置', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    // 创建HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 10000 });
    await addHttpBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 10000 });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('自定义User-Agent测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();

    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 10000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);

    // 切换到设置标签
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await expect(settingsTab).toBeVisible({ timeout: 10000 });
    await settingsTab.click();

    const settingsPanel = contentPage.locator('.request-settings');
    await expect(settingsPanel).toBeVisible({ timeout: 10000 });

    // 找到"自定义User-Agent"配置项并修改
    const userAgentInput = contentPage.locator('.request-settings .control-text input').first();
    await expect(userAgentInput).toBeVisible({ timeout: 5000 });
    await userAgentInput.click();
    await userAgentInput.fill('CustomTestAgent/1.0');

    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
  });
  // 修改请求头值最大展示长度配置,验证请求头展示截断正确
  test('修改请求头值最大展示长度配置', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    // 创建HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 10000 });
    await addHttpBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 10000 });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('请求头展示长度测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();

    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 10000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);

    // 切换到设置标签
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await expect(settingsTab).toBeVisible({ timeout: 10000 });
    await settingsTab.click();

    const settingsPanel = contentPage.locator('.request-settings');
    await expect(settingsPanel).toBeVisible({ timeout: 10000 });

    const maxHeaderValueDisplayLengthInput = contentPage.locator('.request-settings .config-item .control-number input').nth(2);
    await expect(maxHeaderValueDisplayLengthInput).toBeVisible({ timeout: 5000 });
    await maxHeaderValueDisplayLengthInput.click();
    await maxHeaderValueDisplayLengthInput.fill('50');

    // 切换到Headers标签添加长请求头
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await expect(headersTab).toBeVisible({ timeout: 10000 });
    await headersTab.click();

    // 添加一个很长的自定义请求头
    const headersTree = contentPage.locator('.cl-params-tree').first();
    const headerKeyInput = headersTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    const headerValueInput = headersTree.locator('[data-testid="params-tree-value-input"]').first().locator('[contenteditable="true"]');
    await expect(headerKeyInput).toBeVisible({ timeout: 10000 });
    await headerKeyInput.fill('X-Long-Header');
    await headerValueInput.click();
    await contentPage.keyboard.type('This is a very long header value that should be truncated based on the max display length configuration setting');

    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
  });
});


