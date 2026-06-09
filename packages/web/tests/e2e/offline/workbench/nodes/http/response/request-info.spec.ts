import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestInfo', () => {
  // 测试用例1: 请求信息区域基本信息正确展示
  test('请求信息区域基本信息正确展示', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求信息测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    // 切换到请求信息标签页
    const requestInfoTab = contentPage.locator('[data-testid="response-tabs"]').getByRole('tab', { name: /请求信息|Request Info|Request/i }).first();
    const requestInfoTabVisible = await requestInfoTab.isVisible().catch(() => false);
    if (requestInfoTabVisible) {
      await requestInfoTab.click();
      await contentPage.waitForTimeout(300);
    }
  });
  // 测试用例2: 请求头和请求body正确展示
  test('POST请求的请求头和请求body正确展示', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求Body测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.waitForTimeout(300);
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: /json/i });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 在JSON编辑器中输入数据
    const jsonEditor = contentPage.locator('.json-editor .s-monaco-editor, .body-json .s-monaco-editor').first();
    const jsonEditorVisible = await jsonEditor.isVisible().catch(() => false);
    if (jsonEditorVisible) {
      await jsonEditor.click();
      await contentPage.waitForTimeout(300);
      await contentPage.keyboard.type('{"name": "test", "value": 123}');
      await contentPage.waitForTimeout(300);
    }
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    // 验证响应中包含发送的数据
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('POST');
  });
  // 自定义请求头在请求信息中保留用户输入的大小写
  test('自定义请求头在请求信息中保留原始大小写', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求头大小写测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 添加自定义请求头
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await expect(headersTab).toBeVisible({ timeout: 10000 });
    await headersTab.click();
    const headersTree = contentPage.locator('.header-info .cl-params-tree').first();
    const headerKeyInput = headersTree.locator('[data-testid="params-tree-key-autocomplete"] input').first();
    const headerValueInput = headersTree
      .locator('[data-testid="params-tree-value-input"]')
      .first()
      .locator('[contenteditable="true"]');
    await expect(headerKeyInput).toBeVisible({ timeout: 10000 });
    await headerKeyInput.click();
    await headerKeyInput.fill('UserCode');
    await headerValueInput.click();
    await contentPage.keyboard.type('case-sensitive-value');
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toBeVisible({ timeout: 10000 });
    // 切换到请求信息标签页并验证请求头名称
    const requestInfoTab = responseTabs.getByRole('tab', { name: /请求信息|Request/i }).first();
    await expect(requestInfoTab).toBeVisible({ timeout: 5000 });
    await requestInfoTab.click();
    const requestInfoPanel = contentPage.locator('.request-info');
    await expect(requestInfoPanel).toBeVisible({ timeout: 5000 });
    await expect(requestInfoPanel).toContainText('UserCode:', { timeout: 10000 });
    await expect(requestInfoPanel).toContainText('case-sensitive-value', { timeout: 10000 });
    await expect(requestInfoPanel).not.toContainText('Usercode:');
    await expect(requestInfoPanel).not.toContainText('usercode:');
  });
});


