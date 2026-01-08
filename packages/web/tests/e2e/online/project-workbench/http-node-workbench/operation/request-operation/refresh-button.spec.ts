import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RefreshButton', () => {
  // 测试用例1: 刷新按钮点击后,清空修改的值
  test('刷新按钮点击后清空修改的值', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('刷新按钮测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置初始URL并保存
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击保存按钮
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 记录保存后的URL值
    const savedUrl = (await urlInput.innerText()).trim();
    // 修改URL
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/modified`);
    await contentPage.waitForTimeout(300);
    // 验证URL已被修改
    const modifiedUrl = (await urlInput.innerText()).trim();
    expect(modifiedUrl).toContain('modified');
    // 点击刷新按钮
    const refreshBtn = contentPage.locator('[data-testid="operation-refresh-btn"]');
    await refreshBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证URL恢复为保存的值
    const restoredUrl = (await urlInput.innerText()).trim();
    expect(restoredUrl).toBe(savedUrl);
  });
  // 测试用例2: 验证录入项变更后刷新页面数据恢复
  test('验证录入项变更后刷新页面数据恢复', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('刷新恢复测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置初始URL并保存
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const initialUrl = `http://127.0.0.1:${MOCK_SERVER_PORT}/initial`;
    await urlInput.fill(initialUrl);
    // 保存
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 修改请求方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 修改URL
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/changed`);
    await contentPage.waitForTimeout(300);
    // 点击刷新按钮
    const refreshBtn = contentPage.locator('[data-testid="operation-refresh-btn"]');
    await refreshBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证URL恢复
    const restoredUrl = (await urlInput.innerText()).trim();
    expect(restoredUrl).toBe(initialUrl);
  });
});

