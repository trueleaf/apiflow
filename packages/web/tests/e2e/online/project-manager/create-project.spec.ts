import { test, expect } from '../../../fixtures/electron-online.fixture';

test.describe('CreateProject', () => {
  test('点击顶部栏新建项目按钮打开弹窗,输入框自动聚焦', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const projectNameInput = projectDialog.locator('input').first();
    await expect(projectNameInput).toBeFocused({ timeout: 3000 });
  });

  test('点击首页内容区新建项目按钮打开弹窗,输入框自动聚焦', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();

    await loginAccount();
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await projectListPromise;
    await contentPage.waitForTimeout(500);
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const projectNameInput = projectDialog.locator('input').first();
    await expect(projectNameInput).toBeFocused({ timeout: 3000 });
  });

  test('不输入项目名称直接点击确定,显示必填错误提示', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const confirmBtn = projectDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    const errorMessage = projectDialog.locator('.el-form-item__error');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
    await expect(errorMessage).toContainText(/请填写项目名称/);
    await expect(projectDialog).toBeVisible();
  });

  test('输入纯空格作为项目名称,显示空格校验错误提示', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill('   ');
    await projectDialog.locator('.el-dialog__header').click();
    await contentPage.waitForTimeout(300);
    const errorMessage = projectDialog.locator('.el-form-item__error');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
    await expect(errorMessage).toContainText(/项目名称不能为空或仅包含空格/);
  });

  test('新建项目后自动跳转项目详情,顶部新增高亮Tab', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const projectName = `测试新项目-${Date.now()}`;
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill(projectName);
    const confirmBtn = projectDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await expect(projectDialog).t
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const url = contentPage.url();
    expect(url).toContain('mode=edit');
    const activeTab = topBarPage.locator('.tab-item.active');
    await expect(activeTab).toBeVisible({ timeout: 3000 });
    await expect(activeTab).toContainText(projectName);
  });

  test('新建项目后返回首页,新项目排在全部项目列表第一位', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await contentPage.reload();
    await contentPage.waitForTimeout(500);
    const projectName = `排序测试项目-${Date.now()}`;
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill(projectName);
    const confirmBtn = projectDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await expect(projectDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromiseAfterCreate = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await projectListPromiseAfterCreate;
    await contentPage.waitForTimeout(500);
    const firstProjectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(firstProjectCard).toBeVisible({ timeout: 5000 });
    await expect(firstProjectCard).toContainText(projectName);
  });

  test('选择成员或组: 创建成功后成员管理可见', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
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

    const groupName = `E2E-项目团队-${Date.now()}`;
    const emptyState = contentPage.locator('.empty-state-card');
    if (await emptyState.isVisible({ timeout: 500 }).catch(() => false)) {
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
    } else {
      await contentPage.getByTitle(/创建团队|Create Team/i).first().click();
    }

    const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
    await expect(createGroupDialog).toBeVisible({ timeout: 5000 });
    await createGroupDialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(groupName);

    const createGroupResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/create') && response.status() === 200,
      { timeout: 20000 },
    );
    const refreshGroupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
    await createGroupResponse;
    await refreshGroupListResponse;

    const groupMenuItem = contentPage.locator('.el-menu-item').filter({ hasText: groupName }).first();
    await expect(groupMenuItem).toBeVisible({ timeout: 5000 });
    await groupMenuItem.click();

    const allowInviteCheckbox = contentPage.locator('.el-checkbox').filter({ hasText: /允许被非项目成员邀请到项目中|Allow/i }).first();
    const allowInviteInput = allowInviteCheckbox.locator('input[type="checkbox"]').first();
    const isAllowInviteChecked = await allowInviteInput.isChecked().catch(() => false);
    if (!isAllowInviteChecked) {
      await allowInviteCheckbox.click();
      const updateGroupResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/update') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.getByRole('button', { name: /保存修改|Save/i }).click();
      await updateGroupResponse;
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }

    const projectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.el-tabs__item').filter({ hasText: /项目列表|Project/i }).click();
    await projectListResponse;

    await contentPage.locator('[data-testid="home-add-project-btn"]').click();
    const projectDialog = contentPage.locator('[data-testid="add-project-dialog"]');
    await expect(projectDialog).toBeVisible({ timeout: 5000 });

    const projectName = `E2E-成员项目-${Date.now()}`;
    await projectDialog.locator('[data-testid="add-project-name-input"]').fill(projectName);

    const memberSelect = projectDialog.locator('[data-testid="add-project-member-select"]');
    const memberInput = memberSelect.locator('input.remote-select-inner');

    const searchUserResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await memberInput.fill(loginName2);
    await searchUserResponse;
    await contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first().click();

    const searchGroupResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await memberInput.fill(groupName);
    await searchGroupResponse;
    await contentPage.locator('.remote-select-item').filter({ hasText: groupName }).first().click();

    const selectedUserRow = projectDialog.locator('.el-table__row').filter({ hasText: loginName2 }).first();
    await expect(selectedUserRow).toBeVisible({ timeout: 5000 });
    const selectedGroupRow = projectDialog.locator('.el-table__row').filter({ hasText: groupName }).first();
    await expect(selectedGroupRow).toBeVisible({ timeout: 5000 });

    await selectedUserRow.locator('.el-select').click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /只读|Read Only/i }).first().click();
    await expect(selectedUserRow.locator('.el-select')).toContainText(/只读|Read Only/i, { timeout: 5000 });

    const createProjectRequestPromise = contentPage.waitForRequest(
      (request) => request.url().includes('/api/project/add_project') && request.method() === 'POST',
      { timeout: 20000 },
    );
    const createProjectResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/add_project') && response.status() === 200,
      { timeout: 20000 },
    );
    await projectDialog.locator('[data-testid="add-project-confirm-btn"]').click();
    const createProjectRequest = await createProjectRequestPromise;
    await createProjectResponse;

    const requestBody = createProjectRequest.postDataJSON() as {
      projectName: string;
      remark: string;
      users: { userId: string; userName: string; permission: 'readOnly' | 'readAndWrite' | 'admin' }[];
      groups: { groupId: string; groupName: string }[];
    };
    expect(requestBody.projectName).toBe(projectName);
    expect(requestBody.users.some((u) => u.userName === loginName2 && u.permission === 'readOnly')).toBeTruthy();
    expect(requestBody.groups.some((g) => g.groupName === groupName)).toBeTruthy();

    await expect(projectDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

    const backHomeProjectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
    await backHomeProjectListResponse;
    await contentPage.waitForTimeout(500);

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const projectMembersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await projectCard.getByTitle(/成员管理|Member/i).click();
    await projectMembersResponse;

    const permissionDialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(permissionDialog).toBeVisible({ timeout: 5000 });
    const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: loginName2 }).first();
    await expect(userRow).toBeVisible({ timeout: 5000 });
    await expect(userRow.locator('.el-select')).toContainText(/只读|Read Only/i, { timeout: 5000 });
    const groupRow = permissionDialog.locator('.el-table__row').filter({ hasText: groupName }).first();
    await expect(groupRow).toBeVisible({ timeout: 5000 });
  });
});
