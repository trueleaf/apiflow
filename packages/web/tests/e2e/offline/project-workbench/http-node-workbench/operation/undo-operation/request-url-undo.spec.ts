import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('RequestUrlUndo', () => {
  // 快速输入URL后撤销一次恢复初始值
  test('快速输入URL后点击撤销按钮恢复初始值', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('URL撤销-快速输入测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    // 记录初始值
    const initialValue = (await urlInput.innerText()).trim();
    // 使用键盘快速输入URL（逐字符触发v-model）
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('http://example.com/api/test');
    await contentPage.locator('.api-operation').click();
    await contentPage.waitForTimeout(300);
    await expect(urlInput).toHaveText(/example\.com\/api\/test/, { timeout: 5000 });
    // 点击撤销按钮应一次恢复为初始值
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]').first();
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlInput).toHaveText(initialValue === '' ? /^\s*$/ : initialValue, { timeout: 5000 });
  });
});
