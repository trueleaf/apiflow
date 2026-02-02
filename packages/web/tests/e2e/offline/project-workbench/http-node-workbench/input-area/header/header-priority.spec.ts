import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('HeaderPriority', () => {
  // 测试用例1: 自定义请求头优先级大于公共请求头,相同key时自定义header值被发送
  test('自定义请求头优先级大于公共请求头,相同key时自定义header值被发送', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建 folder 节点，并在该节点上打开公共请求头设置
    const folderId = await createNode(contentPage, { nodeType: 'folder', name: '公共请求头目录-优先级1' });
    const folderNodeContent = contentPage
      .locator('.el-tree-node__content', { has: contentPage.locator(`[data-test-node-id="${folderId}"]`) })
      .first();
    await folderNodeContent.click();
    await folderNodeContent.click({ button: 'right' });
    const commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 多行编辑模式写入公共请求头
    const modeToggleBtn = commonHeaderPage.locator('.mode-toggle-icon');
    await modeToggleBtn.click();
    const multilineTextarea = commonHeaderPage.locator('[data-testid="params-tree-multiline-textarea"]');
    await expect(multilineTextarea).toBeVisible({ timeout: 20000 });
    await multilineTextarea.fill('X-Custom=from-common');
    const applyBtn = commonHeaderPage.locator('[data-testid="params-tree-apply-btn"]');
    await applyBtn.click();
    await contentPage.waitForTimeout(300);
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '请求头优先级测试', pid: folderId });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义请求头: X-Custom=from-custom
    const headerKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"] input, [data-testid="params-tree-key-autocomplete"] input');
    const headerValueInputs = contentPage.locator('[data-testid="params-tree-value-input"] [contenteditable]');
    await headerKeyInputs.first().fill('X-Custom');
    await headerValueInputs.first().click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.insertText('from-custom');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 20000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证自定义请求头的值优先级最高,服务器接收到X-Custom=from-custom
    await expect(responseBody).toContainText('from-custom', { timeout: 10000 });
  });
  // 测试用例2: 公共请求头优先级大于可更改的默认请求头(User-Agent)
  test('公共请求头优先级大于可更改的默认请求头', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建 folder 节点，并在该节点上打开公共请求头设置
    const folderId = await createNode(contentPage, { nodeType: 'folder', name: '公共请求头目录-优先级2' });
    const folderNodeContent = contentPage
      .locator('.el-tree-node__content', { has: contentPage.locator(`[data-test-node-id="${folderId}"]`) })
      .first();
    await folderNodeContent.click();
    await folderNodeContent.click({ button: 'right' });
    const commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 多行编辑模式写入公共请求头
    const modeToggleBtn = commonHeaderPage.locator('.mode-toggle-icon');
    await modeToggleBtn.click();
    const multilineTextarea = commonHeaderPage.locator('[data-testid="params-tree-multiline-textarea"]');
    await expect(multilineTextarea).toBeVisible({ timeout: 20000 });
    await multilineTextarea.fill('User-Agent=CustomAgent/1.0');
    const applyBtn = commonHeaderPage.locator('[data-testid="params-tree-apply-btn"]');
    await applyBtn.click();
    await contentPage.waitForTimeout(300);
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '公共请求头优先级测试', pid: folderId });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 20000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证公共请求头覆盖了默认的User-Agent
    await expect(responseBody).toContainText('CustomAgent/1.0', { timeout: 10000 });
  });
  // 测试用例3: 自定义请求头优先级大于默认请求头(User-Agent)
  test('自定义请求头优先级大于默认请求头', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('自定义请求头覆盖默认值测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义请求头覆盖User-Agent
    const headerKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"] input, [data-testid="params-tree-key-autocomplete"] input');
    const headerValueInputs = contentPage.locator('[data-testid="params-tree-value-input"] [contenteditable]');
    await headerKeyInputs.first().fill('User-Agent');
    await headerValueInputs.first().click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.insertText('MyCustomAgent/2.0');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 20000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证自定义请求头覆盖了默认的User-Agent
    await expect(responseBody).toContainText('MyCustomAgent/2.0', { timeout: 10000 });
  });
  // 测试用例4: 完整优先级链验证 - 自定义header > 公共header > 默认header
  test('完整优先级链验证 - 自定义header优先级高于公共header优先级高于默认header', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建 folder 节点，并在该节点上打开公共请求头设置
    const folderId = await createNode(contentPage, { nodeType: 'folder', name: '公共请求头目录-优先级4' });
    const folderNodeContent = contentPage
      .locator('.el-tree-node__content', { has: contentPage.locator(`[data-test-node-id="${folderId}"]`) })
      .first();
    await folderNodeContent.click();
    await folderNodeContent.click({ button: 'right' });
    const commonHeaderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    const commonHeaderPage = contentPage.locator('.common-header');
    await expect(commonHeaderPage).toBeVisible({ timeout: 5000 });
    // 多行编辑模式写入公共请求头
    const modeToggleBtn = commonHeaderPage.locator('.mode-toggle-icon');
    await modeToggleBtn.click();
    const multilineTextarea = commonHeaderPage.locator('[data-testid="params-tree-multiline-textarea"]');
    await expect(multilineTextarea).toBeVisible({ timeout: 20000 });
    await multilineTextarea.fill('User-Agent=CommonAgent/1.0');
    const applyBtn = commonHeaderPage.locator('[data-testid="params-tree-apply-btn"]');
    await applyBtn.click();
    await contentPage.waitForTimeout(300);
    const confirmBtn = commonHeaderPage.locator('.el-button--success').filter({ hasText: /确认修改/ });
    await confirmBtn.click();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '完整优先级链测试', pid: folderId });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义请求头覆盖User-Agent
    const headerKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"] input, [data-testid="params-tree-key-autocomplete"] input');
    const headerValueInputs = contentPage.locator('[data-testid="params-tree-value-input"] [contenteditable]');
    await headerKeyInputs.first().fill('User-Agent');
    await headerValueInputs.first().click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.insertText('CustomAgent/2.0');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.getByTestId('status-code');
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证自定义请求头优先级最高,即使公共请求头也设置了相同的key
    await expect(responseBody).toContainText('CustomAgent/2.0', { timeout: 10000 });
  });
});


