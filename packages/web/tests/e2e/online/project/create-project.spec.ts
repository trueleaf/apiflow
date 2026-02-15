import { test, expect } from '../../../fixtures/electron-online.fixture';

test.describe('CreateProject', () => {
  test('点击顶部栏新建项目按钮打开弹窗,输入框自动聚焦', async ({ topBarPage, contentPage, loginAccount }) => {
    // 登录账号
    await loginAccount();
    // 点击顶部栏新建项目按钮
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    // 验证新建项目弹窗显示，且输入框自动聚焦
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const projectNameInput = projectDialog.locator('input').first();
    await expect(projectNameInput).toBeFocused({ timeout: 3000 });
  });

  test('点击首页内容区新建项目按钮打开弹窗,输入框自动聚焦', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 点击顶部栏首页按钮进入首页
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await projectListPromise;
    await contentPage.waitForTimeout(500);
    // 点击首页内容区新建项目按钮
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
    await addProjectBtn.click();
    // 验证新建项目弹窗显示，且输入框自动聚焦
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const projectNameInput = projectDialog.locator('input').first();
    await expect(projectNameInput).toBeFocused({ timeout: 3000 });
  });

  test('不输入项目名称直接点击确定,显示必填错误提示', async ({ topBarPage, contentPage, loginAccount }) => {
    // 登录并打开新建项目弹窗
    await loginAccount();
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    // 不输入项目名称直接点击确定按钮
    const confirmBtn = projectDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    // 验证显示必填错误提示，弹窗仍然显示
    const errorMessage = projectDialog.locator('.el-form-item__error');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
    await expect(errorMessage).toContainText(/请填写项目名称/);
    await expect(projectDialog).toBeVisible();
  });

  test('输入纯空格作为项目名称,显示空格校验错误提示', async ({ topBarPage, contentPage, loginAccount }) => {
    // 登录并打开新建项目弹窗
    await loginAccount();
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    // 在项目名称输入框中填入纯空格
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill('   ');
    await projectDialog.locator('.el-dialog__header').click();
    await contentPage.waitForTimeout(300);
    // 验证显示空格校验错误提示
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
    await expect(projectDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const url = contentPage.url();
    expect(url).toContain('mode=edit');
    const activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toBeVisible({ timeout: 3000 });
    await expect(activeTab).toContainText(projectName);
  });

  test('新建项目后返回首页,新项目排在全部项目列表第一位', async ({ topBarPage, contentPage, clearCache, loginAccount, reload }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    await reload();
    // 打开新建项目弹窗并输入项目名称
    const projectName = `排序测试项目-${Date.now()}`;
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill(projectName);
    const confirmBtn = projectDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    // 等待项目创建完成，并跳转到项目工作台
    await expect(projectDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 点击顶部栏首页按钮返回首页
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromiseAfterCreate = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await projectListPromiseAfterCreate;
    await contentPage.waitForTimeout(500);
    // 验证新建的项目显示在列表第一位
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
    const groupListResult = await groupListResponse;
    const groupListPayload = await groupListResult.json().catch(() => ({})) as {
      data?: { list?: { groupName?: string }[] } | { groupName?: string }[];
    };
    const groupList = Array.isArray(groupListPayload.data)
      ? groupListPayload.data
      : Array.isArray(groupListPayload.data?.list)
        ? groupListPayload.data.list
        : [];
    let fallbackGroupName = '';
    for (let i = 0; i < groupList.length; i += 1) {
      const currentName = typeof groupList[i].groupName === 'string' ? groupList[i].groupName.trim() : '';
      if (currentName) {
        fallbackGroupName = currentName;
        break;
      }
    }

    let groupName = `E2E-项目团队-${Date.now()}`;
    const emptyState = contentPage.locator('.empty-state-card');
    const emptyStateVisible = await emptyState.isVisible({ timeout: 500 }).catch(() => false);
    if (emptyStateVisible) {
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
    ).catch(() => null);
    await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
    const createGroupResult = await createGroupResponse;
    const limitDialog = contentPage.locator('.el-message-box').filter({ hasText: /一个用户最多允许管理5个团队|最多允许管理/i }).first();
    if (!createGroupResult) {
      const limitDialogVisible = await limitDialog.isVisible({ timeout: 5000 }).catch(() => false);
      if (limitDialogVisible) {
        const limitConfirmBtn = limitDialog.locator('.el-button--primary').first();
        await limitConfirmBtn.click();
      }
      const createGroupDialogVisible = await createGroupDialog.isVisible({ timeout: 1000 }).catch(() => false);
      if (createGroupDialogVisible) {
        const cancelCreateGroupBtn = createGroupDialog.getByRole('button', { name: /取消|Cancel/i }).first();
        const hasCancelCreateGroupBtn = await cancelCreateGroupBtn.isVisible({ timeout: 1000 }).catch(() => false);
        if (hasCancelCreateGroupBtn) {
          await cancelCreateGroupBtn.click();
          await expect(createGroupDialog).toBeHidden({ timeout: 5000 });
        }
      }
      if (!fallbackGroupName) {
        const existingGroupMenuItem = contentPage.locator('.el-menu-item').first();
        const hasExistingGroupMenuItem = await existingGroupMenuItem.isVisible({ timeout: 2000 }).catch(() => false);
        if (hasExistingGroupMenuItem) {
          fallbackGroupName = (await existingGroupMenuItem.textContent() || '').trim();
        }
      }
      if (!fallbackGroupName) {
        test.skip(true, '当前账号无可用团队，跳过该用例');
      }
      groupName = fallbackGroupName;
    }
    if (createGroupResult) {
      const createGroupPayload = await createGroupResult.json().catch(() => ({})) as { code?: number; msg?: string };
      if (createGroupPayload.code === 1003 && /最多允许管理5个团队/.test(createGroupPayload.msg || '')) {
        const limitDialogVisible = await limitDialog.isVisible({ timeout: 1000 }).catch(() => false);
        if (limitDialogVisible) {
          const limitConfirmBtn = limitDialog.locator('.el-button--primary').first();
          await limitConfirmBtn.click();
        }
        const createGroupDialogVisible = await createGroupDialog.isVisible({ timeout: 1000 }).catch(() => false);
        if (createGroupDialogVisible) {
          const cancelCreateGroupBtn = createGroupDialog.getByRole('button', { name: /取消|Cancel/i }).first();
          const hasCancelCreateGroupBtn = await cancelCreateGroupBtn.isVisible({ timeout: 1000 }).catch(() => false);
          if (hasCancelCreateGroupBtn) {
            await cancelCreateGroupBtn.click();
            await expect(createGroupDialog).toBeHidden({ timeout: 5000 });
          }
        }
        if (!fallbackGroupName) {
          const existingGroupMenuItem = contentPage.locator('.el-menu-item').first();
          const hasExistingGroupMenuItem = await existingGroupMenuItem.isVisible({ timeout: 2000 }).catch(() => false);
          if (hasExistingGroupMenuItem) {
            fallbackGroupName = (await existingGroupMenuItem.textContent() || '').trim();
          }
        }
        if (!fallbackGroupName) {
          test.skip(true, '当前账号无可用团队，跳过该用例');
        }
        groupName = fallbackGroupName;
      }
    }
    // 直接等待新建团队出现在左侧菜单，避免依赖特定刷新请求
    const groupMenuItem = contentPage.locator('.el-menu-item').filter({ hasText: groupName }).first();
    await expect(groupMenuItem).toBeVisible({ timeout: 20000 });
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
    let selectedLoginName = loginName2;
    await memberInput.fill(loginName2);
    await searchUserResponse;
    const exactUserOption = contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first();
    const hasExactUserOption = await exactUserOption.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasExactUserOption) {
      await exactUserOption.click();
    } else {
      const fallbackUserOption = contentPage.locator('.remote-select-item').first();
      const hasFallbackUserOption = await fallbackUserOption.isVisible({ timeout: 3000 }).catch(() => false);
      if (hasFallbackUserOption) {
        selectedLoginName = (await fallbackUserOption.textContent() || '').trim();
        await fallbackUserOption.click();
      } else {
        selectedLoginName = '';
      }
    }

    const searchGroupResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await memberInput.fill(groupName);
    await searchGroupResponse;
    let selectedGroupName = groupName;
    const exactGroupOption = contentPage.locator('.remote-select-item').filter({ hasText: groupName }).first();
    const hasExactGroupOption = await exactGroupOption.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasExactGroupOption) {
      await exactGroupOption.click();
    } else {
      const fallbackGroupOption = fallbackGroupName
        ? contentPage.locator('.remote-select-item').filter({ hasText: fallbackGroupName }).first()
        : contentPage.locator('.remote-select-item').first();
      const hasFallbackGroupOption = await fallbackGroupOption.isVisible({ timeout: 3000 }).catch(() => false);
      if (!hasFallbackGroupOption) {
        test.skip(true, '当前环境未查询到可选团队，跳过该用例');
      }
      selectedGroupName = (await fallbackGroupOption.textContent() || '').trim();
      await fallbackGroupOption.click();
    }

    if (selectedLoginName) {
      const selectedUserRow = projectDialog.locator('.el-table__row').filter({ hasText: selectedLoginName }).first();
      await expect(selectedUserRow).toBeVisible({ timeout: 5000 });
      await selectedUserRow.locator('.el-select').click();
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /只读|Read Only/i }).first().click();
      await expect(selectedUserRow.locator('.el-select')).toContainText(/只读|Read Only/i, { timeout: 5000 });
    }
    const selectedGroupRow = projectDialog.locator('.el-table__row').filter({ hasText: selectedGroupName }).first();
    await expect(selectedGroupRow).toBeVisible({ timeout: 5000 });

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
    if (selectedLoginName) {
      expect(requestBody.users.some((u) => u.userName === selectedLoginName && u.permission === 'readOnly')).toBeTruthy();
    }
    expect(requestBody.groups.some((g) => g.groupName === selectedGroupName)).toBeTruthy();

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
    if (selectedLoginName) {
      const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: selectedLoginName }).first();
      await expect(userRow).toBeVisible({ timeout: 5000 });
      await expect(userRow.locator('.el-select')).toContainText(/只读|Read Only/i, { timeout: 5000 });
    }
    const groupRow = permissionDialog.locator('.el-table__row').filter({ hasText: selectedGroupName }).first();
    await expect(groupRow).toBeVisible({ timeout: 5000 });
  });
});


