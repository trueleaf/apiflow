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

  test('修改团队成员为管理员权限', async ({ contentPage, clearCache, loginAccount }) => {
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
    await contentPage.locator('.permission-list .permission-item').filter({ hasText: /管理员|Admin/i }).first().click();
    await permissionResponse;
    await expect(memberRow.locator('.permission')).toContainText(/管理员|Admin/i, { timeout: 5000 });

    const removeResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/remove') && response.status() === 200,
      { timeout: 20000 },
    );
    await memberRow.getByRole('button', { name: /删除|Delete/i }).click();
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').click();
    await removeResponse;
  });

  test('重复添加同一成员时显示错误提示', async ({ contentPage, clearCache, loginAccount }) => {
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

    await contentPage.locator('.add-item').click();
    await contentPage.getByPlaceholder(/输入用户名查找用户|Search user/i).fill(loginName2);
    await searchResponse;

    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();
    await expect(contentPage.locator('.el-message').filter({ hasText: /已经是团队成员|already a member/i })).toBeVisible({ timeout: 5000 });

    const memberRow = contentPage.locator('.el-table__row').filter({ hasText: loginName2 }).first();
    const removeResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/remove') && response.status() === 200,
      { timeout: 20000 },
    );
    await memberRow.getByRole('button', { name: /删除|Delete/i }).click();
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').click();
    await removeResponse;
  });

  test('自己退出团队的场景', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

    const loginName = process.env.TEST_LOGIN_NAME;
    if (!loginName) throw new Error('缺少 TEST_LOGIN_NAME 环境变量');

    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    const groupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.el-tabs__item').filter({ hasText: /团队管理|Team/i }).click();
    await groupListResponse;

    const emptyState = contentPage.locator('.empty-state-card');
    if (await emptyState.isVisible({ timeout: 500 }).catch(() => false)) {
      test.skip(true, '没有团队可以退出');
    }

    const selfRow = contentPage.locator('.el-table__row').filter({ hasText: loginName }).first();
    await expect(selfRow).toBeVisible({ timeout: 5000 });
    await selfRow.getByRole('button', { name: /退出|Leave/i }).click();
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await expect(confirmDialog).toContainText(/退出|Leave/i, { timeout: 2000 });
    await confirmDialog.locator('.el-button:not(.el-button--primary)').click();
  });

  test('搜索用户时处理无结果情况', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

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
    await contentPage.getByPlaceholder(/输入用户名查找用户|Search user/i).fill('nonexistent_user_999');
    await searchResponse;

    await expect(contentPage.locator('.remote-select-empty')).toBeVisible({ timeout: 5000 });
  });

  test('团队最后一个管理员可以被降权（与项目不同）', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

    const loginName = process.env.TEST_LOGIN_NAME;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName || !loginName2) throw new Error('缺少 TEST_LOGIN_NAME/TEST_LOGIN_NAME2 环境变量');

    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    const groupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.el-tabs__item').filter({ hasText: /团队管理|Team/i }).click();
    await groupListResponse;

    await contentPage.locator('.create-icon').click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const groupName = `E2E-降权测试-${Date.now()}`;
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

    const groupItem = contentPage.locator('.el-menu-item').filter({ hasText: groupName }).first();
    await expect(groupItem).toBeVisible({ timeout: 5000 });
    await groupItem.click();

    const selfRow = contentPage.locator('.el-table__row').filter({ hasText: loginName }).first();
    await expect(selfRow).toBeVisible({ timeout: 5000 });

    await selfRow.locator('.permission').click();
    const permissionResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/permission') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.permission-list .permission-item').filter({ hasText: /只读|Read Only/i }).first().click();
    await permissionResponse;

    await expect(selfRow.locator('.permission')).toContainText(/只读|Read Only/i, { timeout: 5000 });
  });
});

