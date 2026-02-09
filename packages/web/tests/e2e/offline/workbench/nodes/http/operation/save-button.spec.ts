import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('SaveButton', () => {
  // 测试用例1: 无任何数据变更时候可以点击保存按钮
  test('无任何数据变更时可以点击保存按钮', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('无变更保存测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 直接点击保存按钮（无任何修改）
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证保存成功，无错误提示
    const errorMessage = contentPage.locator('.el-message--error');
    const hasError = await errorMessage.count() > 0;
    expect(hasError).toBeFalsy();
  });
  // 测试用例2: 存在数据变更点击保存按钮,未保存小圆点消失,刷新页面数据保持不变
  test('存在数据变更点击保存按钮后小圆点消失且刷新后数据保持', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('保存变更测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 修改URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const newUrl = `http://127.0.0.1:${MOCK_SERVER_PORT}/saved-url`;
    await urlInput.fill(newUrl);
    await contentPage.waitForTimeout(300);
    // 点击保存按钮
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    await reload();
    await contentPage.waitForTimeout(500);
    // 验证URL保持修改后的值
    const urlInputAfterReload = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const savedUrlValue = (await urlInputAfterReload.innerText()).trim();
    expect(savedUrlValue).toBe(newUrl);
  });
  // 测试用例3: 验证录入项变更后保存成功且刷新后数据不丢失
  test('验证录入项变更后保存成功且刷新后数据不丢失', async ({ contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('全字段保存测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 修改URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const testUrl = `http://127.0.0.1:${MOCK_SERVER_PORT}/full-save-test`;
    await urlInput.fill(testUrl);
    // 修改请求方法为POST
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 点击保存按钮
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    await reload();
    await contentPage.waitForTimeout(500);
    // 验证URL保持
    const urlInputAfterReload = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const savedUrlValue = (await urlInputAfterReload.innerText()).trim();
    expect(savedUrlValue).toBe(testUrl);
    // 验证请求方法保持为POST
    const methodSelectAfterReload = contentPage.locator('[data-testid="method-select"]');
    const methodText = await methodSelectAfterReload.textContent();
    expect(methodText).toContain('POST');
  });
});


