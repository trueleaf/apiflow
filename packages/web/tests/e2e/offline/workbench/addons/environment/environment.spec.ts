import { test, expect } from '../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('EnvironmentManageOffline', () => {
  test('离线模式环境管理仅显示本地值并可参与请求替换', async ({ contentPage, clearCache, createProject, createNode }) => {
    // 准备项目与请求节点，并在 URL 中写入环境变量占位符
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: '离线环境变量替换测试' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{{baseHost}}');
    // 打开环境管理并创建离线环境变量
    await contentPage.locator('[data-testid="project-nav-env-trigger"]').click();
    await contentPage.locator('.env-action').filter({ hasText: /环境管理|Environment/ }).click();
    const envDialog = contentPage.locator('.env-manage-dialog');
    await expect(envDialog).toBeVisible({ timeout: 5000 });
    await expect(envDialog.locator('.value-mode-trigger')).toHaveCount(0);
    await expect(envDialog.locator('th').filter({ hasText: /团队可见值（Shared）|Team Visible Value/ })).toHaveCount(0);
    await envDialog.locator('.side-add-btn').click();
    const editingNameInput = envDialog.locator('.env-list .env-item input[data-env-edit-id]').first();
    await expect(editingNameInput).toBeVisible({ timeout: 5000 });
    await editingNameInput.fill('离线环境A');
    await editingNameInput.press('Enter');
    await envDialog.locator('.table-add-btn').click();
    const firstVariableRow = envDialog.locator('.table-wrap tbody tr').first();
    await expect(firstVariableRow).toBeVisible({ timeout: 5000 });
    await firstVariableRow.locator('td').nth(1).locator('input').fill('baseHost');
    await firstVariableRow.locator('td').nth(2).locator('input').fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?mode=offline-a`);
    // 发送请求并校验占位符已被离线环境值替换
    await envDialog.locator('.env-dialog-close').click();
    await expect(envDialog).toBeHidden({ timeout: 10000 });
    await contentPage.locator('[data-testid="operation-send-btn"]').click();
    const responseTabs = contentPage.locator('[data-testid="response-tabs"]');
    await expect(responseTabs).toContainText('mode=offline-a', { timeout: 15000 });
  });
  test('离线模式删除当前环境后自动回退到相邻环境', async ({ contentPage, clearCache, createProject }) => {
    // 创建两个离线环境，确保删除当前环境时存在可回退目标
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await contentPage.locator('[data-testid="project-nav-env-trigger"]').click();
    await contentPage.locator('.env-action').filter({ hasText: /环境管理|Environment/ }).click();
    const envDialog = contentPage.locator('.env-manage-dialog');
    await expect(envDialog).toBeVisible({ timeout: 5000 });
    await envDialog.locator('.side-add-btn').click();
    const firstEditingInput = envDialog.locator('.env-list .env-item input[data-env-edit-id]').first();
    await expect(firstEditingInput).toBeVisible({ timeout: 5000 });
    await firstEditingInput.fill('离线环境A');
    await firstEditingInput.press('Enter');
    await envDialog.locator('.side-add-btn').click();
    const secondEditingInput = envDialog.locator('.env-list .env-item input[data-env-edit-id]').first();
    await expect(secondEditingInput).toBeVisible({ timeout: 5000 });
    await secondEditingInput.fill('离线环境B');
    await secondEditingInput.press('Enter');
    const targetItem = envDialog.locator('.env-list .env-item').filter({ hasText: '离线环境B' }).first();
    await expect(targetItem).toBeVisible({ timeout: 5000 });
    await targetItem.locator('.env-action-btn').nth(1).click();
    const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary').filter({ hasText: /删除|Delete/ }).first();
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    // 校验删除后当前使用环境自动回退到相邻环境
    await expect(envDialog.locator('.env-list .env-item').filter({ hasText: '离线环境B' })).toHaveCount(0, { timeout: 5000 });
    const fallbackItem = envDialog.locator('.env-list .env-item').filter({ hasText: '离线环境A' }).first();
    await expect(fallbackItem.locator('.env-item-tag')).toContainText(/当前使用|In Use/, { timeout: 5000 });
    await envDialog.locator('.env-dialog-close').click();
    await expect(envDialog).toBeHidden({ timeout: 10000 });
    await contentPage.locator('[data-testid="project-nav-env-trigger"]').click();
    await expect(contentPage.locator('.env-trigger .env-name')).toContainText('离线环境A', { timeout: 5000 });
  });
});
