import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('Online项目成员权限', () => {
  test('项目仅剩一个管理员时不允许退出', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
    await clearCache();
    await loginAccount();

    const loginName = process.env.TEST_LOGIN_NAME;
    if (!loginName) throw new Error('缺少 TEST_LOGIN_NAME 环境变量');

    const projectName = await createProject(`E2E-权限项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

    const projectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await projectListResponse;

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const membersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await expect(projectCard.locator('.operator > div').nth(1)).toBeVisible({ timeout: 5000 });
    await projectCard.locator('.operator > div').nth(1).click();
    await membersResponse;

    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const selfRow = dialog.locator('.el-table__row').filter({ hasText: loginName }).first();
    await expect(selfRow).toBeVisible({ timeout: 5000 });
    await selfRow.getByRole('button', { name: /退出|Leave/i }).click();

    await expect(contentPage.locator('.el-message').filter({ hasText: /团队至少保留一个管理员/ })).toBeVisible({ timeout: 5000 });
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test('添加项目成员（用户）', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
    await clearCache();
    await loginAccount();

    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName2) throw new Error('缺少 TEST_LOGIN_NAME2 环境变量');

    const projectName = await createProject(`E2E-成员项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

    const projectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await projectListResponse;

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const membersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await expect(projectCard.locator('.operator > div').nth(1)).toBeVisible({ timeout: 5000 });
    await projectCard.locator('.operator > div').nth(1).click();
    await membersResponse;

    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('.el-tabs__item').filter({ hasText: /用户|User/i }).click();
    await dialog.locator('.add-item').click();

    const searchResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.getByPlaceholder(/输入用户名查找用户|Search user/i).fill(loginName2);
    await searchResponse;

    const addResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_add') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();
    await addResponse;

    const memberRow = dialog.locator('.el-table__row').filter({ hasText: loginName2 }).first();
    await expect(memberRow).toBeVisible({ timeout: 5000 });
  });

  test('修改项目成员权限（只读/读写/管理员）', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
    await clearCache();
    await loginAccount();

    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName2) throw new Error('缺少 TEST_LOGIN_NAME2 环境变量');

    const projectName = await createProject(`E2E-权限项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

    const projectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await projectListResponse;

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const membersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await expect(projectCard.locator('.operator > div').nth(1)).toBeVisible({ timeout: 5000 });
    await projectCard.locator('.operator > div').nth(1).click();
    await membersResponse;

    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('.el-tabs__item').filter({ hasText: /用户|User/i }).click();
    await dialog.locator('.add-item').click();

    const searchResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.getByPlaceholder(/输入用户名查找用户|Search user/i).fill(loginName2);
    await searchResponse;

    const addResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_add') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();
    await addResponse;

    const memberRow = dialog.locator('.el-table__row').filter({ hasText: loginName2 }).first();
    await expect(memberRow).toBeVisible({ timeout: 5000 });

    await memberRow.locator('.permission').click();
    const permissionResponse1 = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_permission') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.permission-list .permission-item').filter({ hasText: /只读|Read Only/i }).first().click();
    await permissionResponse1;
    await expect(memberRow.locator('.permission')).toContainText(/只读|Read Only/i, { timeout: 5000 });

    await memberRow.locator('.permission').click();
    const permissionResponse2 = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_permission') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.permission-list .permission-item').filter({ hasText: /读写|Read Write/i }).first().click();
    await permissionResponse2;
    await expect(memberRow.locator('.permission')).toContainText(/读写|Read Write/i, { timeout: 5000 });

    await memberRow.locator('.permission').click();
    const permissionResponse3 = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_permission') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.permission-list .permission-item').filter({ hasText: /管理员|Admin/i }).first().click();
    await permissionResponse3;
    await expect(memberRow.locator('.permission')).toContainText(/管理员|Admin/i, { timeout: 5000 });
  });

  test('删除项目成员（非当前用户）', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
    await clearCache();
    await loginAccount();

    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName2) throw new Error('缺少 TEST_LOGIN_NAME2 环境变量');

    const projectName = await createProject(`E2E-成员项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

    const projectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await projectListResponse;

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const membersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await expect(projectCard.locator('.operator > div').nth(1)).toBeVisible({ timeout: 5000 });
    await projectCard.locator('.operator > div').nth(1).click();
    await membersResponse;

    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('.el-tabs__item').filter({ hasText: /用户|User/i }).click();
    await dialog.locator('.add-item').click();

    const searchResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.getByPlaceholder(/输入用户名查找用户|Search user/i).fill(loginName2);
    await searchResponse;

    const addResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_add') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();
    await addResponse;

    const memberRow = dialog.locator('.el-table__row').filter({ hasText: loginName2 }).first();
    await expect(memberRow).toBeVisible({ timeout: 5000 });

    const removeResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_remove') && response.status() === 200,
      { timeout: 20000 },
    );
    await memberRow.getByRole('button', { name: /删除|Delete/i }).click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').click();
    await removeResponse;
    await expect(dialog.locator('.el-table__row').filter({ hasText: loginName2 }).first()).toBeHidden({ timeout: 5000 });
  });

  test('项目有多个管理员时可以正常退出', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
    await clearCache();
    await loginAccount();

    const loginName = process.env.TEST_LOGIN_NAME;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName || !loginName2) throw new Error('缺少 TEST_LOGIN_NAME/TEST_LOGIN_NAME2 环境变量');

    const projectName = await createProject(`E2E-多管理员项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

    const projectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await projectListResponse;

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const membersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await expect(projectCard.locator('.operator > div').nth(1)).toBeVisible({ timeout: 5000 });
    await projectCard.locator('.operator > div').nth(1).click();
    await membersResponse;

    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('.el-tabs__item').filter({ hasText: /用户|User/i }).click();
    await dialog.locator('.add-item').click();

    const searchResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.getByPlaceholder(/输入用户名查找用户|Search user/i).fill(loginName2);
    await searchResponse;

    const addResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_add') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();
    await addResponse;

    const memberRow = dialog.locator('.el-table__row').filter({ hasText: loginName2 }).first();
    await expect(memberRow).toBeVisible({ timeout: 5000 });

    await memberRow.locator('.permission').click();
    const permissionResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_permission') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.permission-list .permission-item').filter({ hasText: /管理员|Admin/i }).first().click();
    await permissionResponse;
    await expect(memberRow.locator('.permission')).toContainText(/管理员|Admin/i, { timeout: 5000 });

    const selfRow = dialog.locator('.el-table__row').filter({ hasText: loginName }).first();
    await expect(selfRow).toBeVisible({ timeout: 5000 });

    const removeResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_remove') && response.status() === 200,
      { timeout: 20000 },
    );
    await selfRow.getByRole('button', { name: /退出|Leave/i }).click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('.el-button--primary').click();
    await removeResponse;
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
  });

  test('重复添加同一成员时显示提示', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
    await clearCache();
    await loginAccount();

    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName2) throw new Error('缺少 TEST_LOGIN_NAME2 环境变量');

    const projectName = await createProject(`E2E-成员项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

    const projectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await projectListResponse;

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const membersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await expect(projectCard.locator('.operator > div').nth(1)).toBeVisible({ timeout: 5000 });
    await projectCard.locator('.operator > div').nth(1).click();
    await membersResponse;

    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('.el-tabs__item').filter({ hasText: /用户|User/i }).click();
    await dialog.locator('.add-item').click();

    const searchResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.getByPlaceholder(/输入用户名查找用户|Search user/i).fill(loginName2);
    await searchResponse;

    const addResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_add') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();
    await addResponse;

    await dialog.locator('.add-item').click();
    await contentPage.getByPlaceholder(/输入用户名查找用户|Search user/i).fill(loginName2);
    await searchResponse;

    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();
    await expect(contentPage.locator('.el-message').filter({ hasText: /已经是项目成员|already a member/i })).toBeVisible({ timeout: 5000 });
  });

  test('降低管理员权限时需要二次确认', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
    await clearCache();
    await loginAccount();

    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName2) throw new Error('缺少 TEST_LOGIN_NAME2 环境变量');

    const projectName = await createProject(`E2E-权限项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

    const projectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await projectListResponse;

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const membersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await expect(projectCard.locator('.operator > div').nth(1)).toBeVisible({ timeout: 5000 });
    await projectCard.locator('.operator > div').nth(1).click();
    await membersResponse;

    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('.add-item').click();
    const searchResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.getByPlaceholder(/输入.*用户名.*组名/i).fill(loginName2);
    await searchResponse;

    const addResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_add') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();
    await addResponse;

    const memberRow = dialog.locator('.el-table__row').filter({ hasText: loginName2 }).first();
    await expect(memberRow).toBeVisible({ timeout: 5000 });

    await memberRow.locator('.el-select').click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /管理员|Admin/i }).first().click();
    await contentPage.waitForLoadState('networkidle');

    await memberRow.locator('.el-select').click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /只读|Read Only/i }).first().click();

    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await expect(confirmDialog).toContainText(/确认改变当前管理员权限|Confirm change admin/i, { timeout: 2000 });
    await confirmDialog.locator('.el-button:not(.el-button--primary)').click();
  });

  test('最后一个管理员降权时拦截并提示', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
    await clearCache();
    await loginAccount();

    const loginName = process.env.TEST_LOGIN_NAME;
    if (!loginName) throw new Error('缺少 TEST_LOGIN_NAME 环境变量');

    const projectName = await createProject(`E2E-权限项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

    const projectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await projectListResponse;

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const membersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await expect(projectCard.locator('.operator > div').nth(1)).toBeVisible({ timeout: 5000 });
    await projectCard.locator('.operator > div').nth(1).click();
    await membersResponse;

    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const selfRow = dialog.locator('.el-table__row').filter({ hasText: loginName }).first();
    await expect(selfRow).toBeVisible({ timeout: 5000 });

    await selfRow.locator('.el-select').click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /只读|Read Only/i }).first().click();

    await expect(contentPage.locator('.el-message').filter({ hasText: /团队至少保留一个管理员|at least one admin/i })).toBeVisible({ timeout: 5000 });
  });

  test('添加项目成员（组）', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
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
    const groupName = await firstGroup.textContent();

    await contentPage.locator('.el-tabs__item').filter({ hasText: /我的项目|My Projects/i }).click();

    const projectName = await createProject(`E2E-组成员项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

    const projectListResponse2 = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await projectListResponse2;

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const membersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await expect(projectCard.locator('.operator > div').nth(1)).toBeVisible({ timeout: 5000 });
    await projectCard.locator('.operator > div').nth(1).click();
    await membersResponse;

    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('.add-item').click();
    const searchResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.getByPlaceholder(/输入.*用户名.*组名/i).fill(groupName?.trim() || '');
    await searchResponse;

    const addResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_member_add') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.remote-select-item').filter({ hasText: /组|Group/i }).first().click();
    await addResponse;

    const groupRow = dialog.locator('.el-table__row').filter({ hasText: groupName?.trim() || '' }).first();
    await expect(groupRow).toBeVisible({ timeout: 5000 });
    await expect(groupRow.locator('.el-tag--success')).toContainText(/组|Group/i, { timeout: 2000 });
  });
});

