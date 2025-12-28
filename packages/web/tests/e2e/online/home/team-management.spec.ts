import { test, expect } from '../../../fixtures/electron-online.fixture';

test.describe('Online团队管理', () => {
  test('在线模式显示团队管理Tab并可进入', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const groupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.el-tabs__item').filter({ hasText: /团队管理|Team/i }).click();
    await groupListResponse;

    await expect(contentPage.locator('.menu-title').filter({ hasText: /团队列表|Team/i })).toBeVisible({ timeout: 5000 });
  });

  test('创建团队后可搜索并删除', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    const groupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.el-tabs__item').filter({ hasText: /团队管理|Team/i }).click();
    await groupListResponse;

    await contentPage.locator('.create-icon').click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const groupName = `E2E-团队-${Date.now()}`;
    await dialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(groupName);

    const createResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/create') && response.status() === 200,
      { timeout: 20000 },
    );
    const refreshResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await dialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
    await createResponse;
    await refreshResponse;
    await expect(contentPage.locator('.el-menu-item').filter({ hasText: groupName }).first()).toBeVisible({ timeout: 5000 });

    const searchInput = contentPage.getByPlaceholder(/搜索团队|Search/i);
    await searchInput.fill(groupName.slice(0, 6));
    await expect(contentPage.locator('.el-menu-item').filter({ hasText: groupName }).first()).toBeVisible({ timeout: 5000 });

    await searchInput.fill('');
    const groupItem = contentPage.locator('.el-menu-item').filter({ hasText: groupName }).first();
    await expect(groupItem).toBeVisible({ timeout: 5000 });
    await groupItem.click();

    const deleteConfirm = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/remove') && response.status() === 200,
      { timeout: 20000 },
    );
    const afterDeleteRefresh = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await groupItem.locator('.del-icon').click();
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').click();
    await deleteConfirm;
    await afterDeleteRefresh;
    await expect(contentPage.locator('.el-menu-item').filter({ hasText: groupName }).first()).toBeHidden({ timeout: 5000 });
  });
});
