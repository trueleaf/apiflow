import { test, expect } from '../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('EnvironmentManageOnline', () => {
  test('在线模式下切换可见性后请求使用对应环境变量值', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 准备在线项目与请求节点，并在 URL 中写入环境变量占位符
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: '在线环境变量可见性测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{{baseHost}}');
    // 创建同时包含本地值与团队可见值的环境变量
    await contentPage.locator('[data-testid="project-nav-env-trigger"]').click();
    await contentPage.locator('.env-action').filter({ hasText: /环境管理|Environment/ }).click();
    const envDialog = contentPage.locator('.env-manage-dialog');
    await expect(envDialog).toBeVisible({ timeout: 5000 });
    await envDialog.locator('.side-add-btn').click();
    const editingNameInput = envDialog.locator('.env-list .env-item input[data-env-edit-id]').first();
    await expect(editingNameInput).toBeVisible({ timeout: 5000 });
    await editingNameInput.fill('在线环境A');
    await editingNameInput.press('Enter');
    await envDialog.locator('.table-add-btn').click();
    const firstVariableRow = envDialog.locator('.table-wrap tbody tr').first();
    await expect(firstVariableRow).toBeVisible({ timeout: 5000 });
    await firstVariableRow.locator('td').nth(1).locator('input').fill('baseHost');
    await firstVariableRow.locator('td').nth(2).locator('input').fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?mode=local-online`);
    await firstVariableRow.locator('td').nth(3).locator('input').fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?mode=shared-online`);
    await envDialog.locator('.env-dialog-close').click();
    await expect(envDialog).toBeHidden({ timeout: 10000 });
    // 默认可见性下优先使用团队可见值
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toContainText('mode=shared-online', { timeout: 15000 });
    await contentPage.locator('[data-testid="project-nav-env-trigger"]').click();
    await contentPage.locator('.env-action').filter({ hasText: /环境管理|Environment/ }).click();
    await expect(envDialog).toBeVisible({ timeout: 5000 });
    await envDialog.locator('.value-mode-trigger').click();
    await contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /仅自己可见|Only Me/ }).first().click();
    await envDialog.locator('.env-dialog-close').click();
    await expect(envDialog).toBeHidden({ timeout: 10000 });
    // 切换为仅自己可见后应使用本地值
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    await expect(responseTabs).toContainText('mode=local-online', { timeout: 15000 });
  });
  test('在线模式删除当前环境后自动回退到相邻环境', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    // 创建两个在线环境，确保删除当前环境时存在可回退目标
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await contentPage.locator('[data-testid="project-nav-env-trigger"]').click();
    await contentPage.locator('.env-action').filter({ hasText: /环境管理|Environment/ }).click();
    const envDialog = contentPage.locator('.env-manage-dialog');
    await expect(envDialog).toBeVisible({ timeout: 5000 });
    await envDialog.locator('.side-add-btn').click();
    const firstEditingInput = envDialog.locator('.env-list .env-item input[data-env-edit-id]').first();
    await expect(firstEditingInput).toBeVisible({ timeout: 5000 });
    await firstEditingInput.fill('在线环境A');
    await firstEditingInput.press('Enter');
    await envDialog.locator('.side-add-btn').click();
    const secondEditingInput = envDialog.locator('.env-list .env-item input[data-env-edit-id]').first();
    await expect(secondEditingInput).toBeVisible({ timeout: 5000 });
    await secondEditingInput.fill('在线环境B');
    await secondEditingInput.press('Enter');
    const targetItem = envDialog.locator('.env-list .env-item').filter({ hasText: '在线环境B' }).first();
    await expect(targetItem).toBeVisible({ timeout: 5000 });
    await targetItem.locator('.env-action-btn').nth(1).click();
    const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary').filter({ hasText: /删除|Delete/ }).first();
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    // 校验删除后当前使用环境自动回退到相邻环境
    await expect(envDialog.locator('.env-list .env-item').filter({ hasText: '在线环境B' })).toHaveCount(0, { timeout: 5000 });
    const fallbackItem = envDialog.locator('.env-list .env-item').filter({ hasText: '在线环境A' }).first();
    await expect(fallbackItem.locator('.env-item-tag')).toContainText(/当前使用|In Use/, { timeout: 5000 });
    await envDialog.locator('.env-dialog-close').click();
    await expect(envDialog).toBeHidden({ timeout: 10000 });
    await contentPage.locator('[data-testid="project-nav-env-trigger"]').click();
    await expect(contentPage.locator('.env-trigger .env-name')).toContainText('在线环境A', { timeout: 5000 });
  });
});
