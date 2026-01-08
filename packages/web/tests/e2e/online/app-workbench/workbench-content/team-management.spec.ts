import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('Online团队管理', () => {
  test('在线模式显示团队管理Tab并可进入', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
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
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').click();
    await deleteConfirm;
    await afterDeleteRefresh;
    await expect(contentPage.locator('.el-menu-item').filter({ hasText: groupName }).first()).toBeHidden({ timeout: 5000 });
  });

  test('编辑团队名称和描述', async ({ contentPage, clearCache, loginAccount }) => {
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
    const emptyStateVisible = await emptyState.isVisible({ timeout: 500 }).catch(() => false);
    if (emptyStateVisible) {
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

    const firstGroup = contentPage.locator('.el-menu-item').first();
    await firstGroup.click();

    const newName = `E2E-编辑团队-${Date.now()}`;
    const newDesc = `测试描述-${Date.now()}`;

    await contentPage.getByPlaceholder(/请输入团队名称|Team Name/i).fill(newName);
    await contentPage.getByPlaceholder(/请输入团队描述|Description/i).fill(newDesc);

    const updateResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/update') && response.status() === 200,
      { timeout: 20000 },
    );
    const afterUpdateRefresh = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.getByRole('button', { name: /保存|Save/i }).click();
    await updateResponse;
    await afterUpdateRefresh;

    await expect(contentPage.locator('.el-menu-item').filter({ hasText: newName }).first()).toBeVisible({ timeout: 5000 });
  });

  test('创建团队时输入过长的名称（边界测试）', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

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

    const longName = 'A'.repeat(50);
    const nameInput = dialog.getByPlaceholder(/请输入团队名称|Team Name/i);
    await nameInput.fill(longName);

    const inputValue = await nameInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(30);

    await dialog.locator('.el-dialog__headerbtn').click();
  });

  test('创建团队时不输入名称的错误提示', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

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

    await dialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
    await expect(contentPage.locator('.el-message').filter({ hasText: /请输入团队名称|Please enter/i })).toBeVisible({ timeout: 5000 });

    await dialog.locator('.el-dialog__headerbtn').click();
  });

  test('删除团队时的二次确认', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

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
    const groupName = `E2E-删除确认-${Date.now()}`;
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

    await groupItem.locator('.del-icon').click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await expect(confirmDialog).toContainText(/确认删除|Confirm delete/i, { timeout: 2000 });

    await confirmDialog.locator('.el-button:not(.el-button--primary)').click();
    await expect(groupItem).toBeVisible({ timeout: 2000 });
  });

  test('团队列表为空时显示空状态', async ({ contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    const groupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.el-tabs__item').filter({ hasText: /团队管理|Team/i }).click();
    await groupListResponse;

    const groups = await contentPage.locator('.el-menu-item').count();
    if (groups > 0) {
      test.skip(true, '当前环境有团队，无法测试空状态');
    }

    const emptyState = contentPage.locator('.empty-state-card');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
    await expect(emptyState.getByRole('button', { name: /创建团队|Create Team/i })).toBeVisible({ timeout: 2000 });
  });

  test('清空搜索框后显示全部团队', async ({ contentPage, clearCache, loginAccount }) => {
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
    const emptyStateVisible = await emptyState.isVisible({ timeout: 500 }).catch(() => false);
    if (emptyStateVisible) {
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

    const totalGroupsBeforeSearch = await contentPage.locator('.el-menu-item').count();

    const searchInput = contentPage.getByPlaceholder(/搜索团队|Search/i);
    await searchInput.fill('nonexistent');
    await expect(contentPage.locator('.el-menu-item')).toHaveCount(0, { timeout: 2000 });

    await searchInput.clear();
    await expect(contentPage.locator('.el-menu-item')).toHaveCount(totalGroupsBeforeSearch, { timeout: 5000 });
  });

  test('在线模式切换到离线模式时团队管理Tab消失', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();

    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    const groupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.el-tabs__item').filter({ hasText: /团队管理|Team/i }).click();
    await groupListResponse;

    await expect(contentPage.locator('.menu-title').filter({ hasText: /团队列表|Team/i })).toBeVisible({ timeout: 5000 });

    await topBarPage.locator('[data-testid="header-offline-switch"]').click();
    await contentPage.waitForLoadState('networkidle');

    await expect(contentPage.locator('.el-tabs__item').filter({ hasText: /团队管理|Team/i })).toBeHidden({ timeout: 5000 });
  });

  test('创建团队时添加成员并分配权限', async ({ contentPage, clearCache, loginAccount }) => {
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

    await contentPage.locator('.create-icon').click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const groupName = `E2E-带成员团队-${Date.now()}`;
    await dialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(groupName);

    await dialog.locator('.add-item').click();
    const searchResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.getByPlaceholder(/输入用户名查找用户|Search user/i).fill(loginName2);
    await searchResponse;

    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();
    await contentPage.waitForLoadState('networkidle');

    const memberRow = dialog.locator('.el-table__row').filter({ hasText: loginName2 }).first();
    await expect(memberRow).toBeVisible({ timeout: 5000 });

    await memberRow.locator('.permission').click();
    await contentPage.locator('.permission-list .permission-item').filter({ hasText: /管理员|Admin/i }).first().click();
    await contentPage.waitForLoadState('networkidle');

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
  });
});

