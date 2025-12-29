import { test, expect } from '../../../fixtures/electron-online.fixture';

test.describe('Online团队成员权限', () => {
  test('添加成员后可修改权限并移除成员', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName2) throw new Error('缺少 TEST_LOGIN_NAME2 环境变量');

    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    const groupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.el-tabs__item').filter({ hasText: /团队管理|Team/i }).click();
    await groupListResponse;

    const emptyState = contentPage.locator('.empty-state-card');
    if (await emptyState.isVisible({ timeout: 500 }).catch(() => false)) {
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
      const dialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await dialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(`E2E-团队-${Date.now()}`);
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
    }

    await contentPage.locator('.add-item').click();
    const searchResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.getByPlaceholder(/输入用户名查找用户|Search user/i).fill(loginName2);
    await searchResponse;

    const addResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/add') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();
    await addResponse;

    const memberRow = contentPage.locator('.el-table__row').filter({ hasText: loginName2 }).first();
    await expect(memberRow).toBeVisible({ timeout: 5000 });

    await memberRow.locator('.permission').click();
    const permissionResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/permission') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.permission-list .permission-item').filter({ hasText: /只读|Read Only/i }).first().click();
    await permissionResponse;
    await expect(memberRow.locator('.permission')).toContainText(/只读|Read Only/i, { timeout: 5000 });

    const removeResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/remove') && response.status() === 200,
      { timeout: 20000 },
    );
    await memberRow.getByRole('button', { name: /删除|Delete/i }).click();
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').click();
    await removeResponse;
    await expect(contentPage.locator('.el-table__row').filter({ hasText: loginName2 }).first()).toBeHidden({ timeout: 5000 });
  });
});

