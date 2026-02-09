import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('Online项目成员权限', () => {
  test.describe('模式1: 新建项目时添加成员', () => {
    // 测试在创建项目时添加用户并设置为读写权限
    test('添加用户并设置读写权限', async ({ topBarPage, contentPage }) => {
      // 打开新建项目对话框
      await contentPage.locator('[data-testid="home-add-project-btn"]').click();
      const projectDialog = contentPage.locator('[data-testid="add-project-dialog"]');
      await expect(projectDialog).toBeVisible({ timeout: 5000 });

      // 输入项目名称
      const projectName = `E2E-读写权限-${Date.now()}`;
      await projectDialog.locator('[data-testid="add-project-name-input"]').fill(projectName);

      // 搜索并选择用户
      const memberSelect = projectDialog.locator('[data-testid="add-project-member-select"]');
      const memberInput = memberSelect.locator('input.remote-select-inner');

      const searchUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await memberInput.fill('test');
      await searchUserResponse;
      await contentPage.locator('.remote-select-item').first().click();

      // 设置用户权限为读写
      const selectedUserRow = projectDialog.locator('.el-table__row').first();
      await expect(selectedUserRow).toBeVisible({ timeout: 5000 });
      await selectedUserRow.locator('.el-select').click();
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /读写|Read and Write/i }).first().click();
      await expect(selectedUserRow.locator('.el-select')).toContainText(/读写|Read and Write/i, { timeout: 5000 });

      // 提交创建项目请求并验证请求参数
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

      // 验证请求体包含正确的项目名称和用户权限
      const requestBody = createProjectRequest.postDataJSON() as {
        projectName: string;
        users: { userId: string; userName: string; permission: 'readOnly' | 'readAndWrite' | 'admin' }[];
      };
      expect(requestBody.projectName).toBe(projectName);
      expect(requestBody.users.some((u) => u.permission === 'readAndWrite')).toBeTruthy();

      await expect(projectDialog).toBeHidden({ timeout: 5000 });
    });
    // 测试在创建项目时添加用户并设置为管理员权限
    test('添加用户并设置管理员权限', async ({ topBarPage, contentPage }) => {
      await contentPage.locator('[data-testid="home-add-project-btn"]').click();
      const projectDialog = contentPage.locator('[data-testid="add-project-dialog"]');
      await expect(projectDialog).toBeVisible({ timeout: 5000 });

      const projectName = `E2E-管理员权限-${Date.now()}`;
      await projectDialog.locator('[data-testid="add-project-name-input"]').fill(projectName);

      const memberSelect = projectDialog.locator('[data-testid="add-project-member-select"]');
      const memberInput = memberSelect.locator('input.remote-select-inner');

      const searchUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await memberInput.fill('test');
      await searchUserResponse;
      await contentPage.locator('.remote-select-item').first().click();

      const selectedUserRow = projectDialog.locator('.el-table__row').first();
      await expect(selectedUserRow).toBeVisible({ timeout: 5000 });
      await selectedUserRow.locator('.el-select').click();
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /管理员|Admin/i }).first().click();
      await expect(selectedUserRow.locator('.el-select')).toContainText(/管理员|Admin/i, { timeout: 5000 });

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
        users: { userId: string; userName: string; permission: 'readOnly' | 'readAndWrite' | 'admin' }[];
      };
      expect(requestBody.projectName).toBe(projectName);
      expect(requestBody.users.some((u) => u.permission === 'admin')).toBeTruthy();

      await expect(projectDialog).toBeHidden({ timeout: 5000 });
    });
    // 测试在创建项目时添加组
    test('添加单个组到项目', async ({ topBarPage, contentPage }) => {
      await contentPage.locator('[data-testid="home-add-project-btn"]').click();
      const projectDialog = contentPage.locator('[data-testid="add-project-dialog"]');
      await expect(projectDialog).toBeVisible({ timeout: 5000 });

      const projectName = `E2E-添加组-${Date.now()}`;
      await projectDialog.locator('[data-testid="add-project-name-input"]').fill(projectName);

      const memberSelect = projectDialog.locator('[data-testid="add-project-member-select"]');
      const memberInput = memberSelect.locator('input.remote-select-inner');

      // 搜索并选择组
      const searchGroupResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await memberInput.fill('测试');
      await searchGroupResponse;
      const groupItem = contentPage.locator('.remote-select-item').filter({ hasText: /组|Group/i }).first();
      await expect(groupItem).toBeVisible({ timeout: 5000 });
      await groupItem.click();

      // 验证组已添加到列表
      const selectedGroupRow = projectDialog.locator('.el-table__row').first();
      await expect(selectedGroupRow).toBeVisible({ timeout: 5000 });
      await expect(selectedGroupRow).toContainText(/组|Group/i, { timeout: 5000 });

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

      // 验证请求体包含组信息
      const requestBody = createProjectRequest.postDataJSON() as {
        projectName: string;
        groups: { groupId: string; groupName: string }[];
      };
      expect(requestBody.projectName).toBe(projectName);
      expect(requestBody.groups.length).toBeGreaterThan(0);

      await expect(projectDialog).toBeHidden({ timeout: 5000 });
    });
    // 测试同时添加多个组，然后打开成员管理验证组显示正确
    test('同时添加多个组，点击编辑项目验证组显示正确', async ({ topBarPage, contentPage }) => {
      await contentPage.locator('[data-testid="home-add-project-btn"]').click();
      const projectDialog = contentPage.locator('[data-testid="add-project-dialog"]');
      await expect(projectDialog).toBeVisible({ timeout: 5000 });

      const projectName = `E2E-多组项目-${Date.now()}`;
      await projectDialog.locator('[data-testid="add-project-name-input"]').fill(projectName);

      const memberSelect = projectDialog.locator('[data-testid="add-project-member-select"]');
      const memberInput = memberSelect.locator('input.remote-select-inner');

      // 添加第一个组
      const searchResponse1 = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await memberInput.fill('测试');
      await searchResponse1;
      const groupItems = contentPage.locator('.remote-select-item').filter({ hasText: /组|Group/i });
      const groupCount = await groupItems.count();
      if (groupCount > 0) {
        await groupItems.first().click();
      }

      // 如果有多个组，添加第二个组
      if (groupCount > 1) {
        const searchResponse2 = contentPage.waitForResponse(
          (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
          { timeout: 20000 },
        );
        await memberInput.fill('测试');
        await searchResponse2;
        await contentPage.locator('.remote-select-item').filter({ hasText: /组|Group/i }).nth(1).click();
      }

      const selectedRows = projectDialog.locator('.el-table__row');
      const rowCount = await selectedRows.count();
      expect(rowCount).toBeGreaterThanOrEqual(1);

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
        groups: { groupId: string; groupName: string }[];
      };
      expect(requestBody.groups.length).toBeGreaterThanOrEqual(1);

      await expect(projectDialog).toBeHidden({ timeout: 5000 });
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });

      // 返回首页
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 打开项目成员管理弹窗
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

      // 验证所有组都正确显示在成员列表中
      for (const group of requestBody.groups) {
        const groupRow = permissionDialog.locator('.el-table__row').filter({ hasText: group.groupName }).first();
        await expect(groupRow).toBeVisible({ timeout: 5000 });
        await expect(groupRow).toContainText(/组|Group/i, { timeout: 5000 });
      }
    });

    test('验证组可被搜索到', async ({ contentPage }) => {
      // 打开新建项目对话框
      await contentPage.locator('[data-testid="home-add-project-btn"]').click();
      const projectDialog = contentPage.locator('[data-testid="add-project-dialog"]');
      await expect(projectDialog).toBeVisible({ timeout: 5000 });

      const memberSelect = projectDialog.locator('[data-testid="add-project-member-select"]');
      const memberInput = memberSelect.locator('input.remote-select-inner');

      // 搜索组并验证可以找到
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await memberInput.fill('测试');
      await searchResponse;

      const groupItems = contentPage.locator('.remote-select-item').filter({ hasText: /组|Group/i });
      await expect(groupItems.first()).toBeVisible({ timeout: 5000 });

      await projectDialog.locator('[data-testid="add-project-cancel-btn"]').click();
    });
  });

  test.describe('模式2: 编辑项目成员权限', () => {
    // 测试打开成员管理弹窗并验证成员列表显示正常
    test('打开成员管理弹窗并验证列表', async ({ topBarPage, contentPage, createProject }) => {
      // 创建测试项目
      const projectName = await createProject(`E2E-成员管理-${Date.now()}`);
      
      // 返回首页并打开成员管理
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      // 验证成员列表至少包含创建者
      const memberTable = permissionDialog.locator('.el-table__body');
      await expect(memberTable).toBeVisible({ timeout: 5000 });
      const memberRows = permissionDialog.locator('.el-table__row');
      const rowCount = await memberRows.count();
      expect(rowCount).toBeGreaterThan(0);
    });
    // 测试在成员管理中添加用户并设置只读权限
    test('添加用户-只读权限', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-添加只读用户-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      // 搜索并添加用户
      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('test');
      await searchResponse;

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /用户|User/i }).first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      // 验证用户默认添加为读写权限
      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
        permission: 'readOnly' | 'readAndWrite' | 'admin';
        type: 'user' | 'group';
      };
      expect(requestBody.type).toBe('user');
      expect(requestBody.permission).toBe('readAndWrite');

      // 将权限修改为只读
      const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(userRow).toBeVisible({ timeout: 5000 });

      await userRow.locator('.el-select').click();
      const changePermissionRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/change_permission') && request.method() === 'PUT',
        { timeout: 20000 },
      );
      const changePermissionResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/change_permission') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /只读|Read Only/i }).first().click();
      const changePermissionRequest = await changePermissionRequestPromise;
      await changePermissionResponse;

      const changeBody = changePermissionRequest.postDataJSON() as {
        permission: 'readOnly' | 'readAndWrite' | 'admin';
      };
      expect(changeBody.permission).toBe('readOnly');
      await expect(userRow.locator('.el-select')).toContainText(/只读|Read Only/i, { timeout: 5000 });
    });
    // 测试在成员管理中添加用户并保持默认读写权限
    test('添加用户-读写权限', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-添加读写用户-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('test');
      await searchResponse;

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /用户|User/i }).first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
        permission: 'readOnly' | 'readAndWrite' | 'admin';
        type: 'user' | 'group';
      };
      expect(requestBody.type).toBe('user');
      expect(requestBody.permission).toBe('readAndWrite');

      // 验证用户默认为读写权限
      const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(userRow).toBeVisible({ timeout: 5000 });
      await expect(userRow.locator('.el-select')).toContainText(/读写|Read and Write/i, { timeout: 5000 });
    });
    // 测试在成员管理中添加用户并设置为管理员权限
    test('添加用户-管理员权限', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-添加管理员用户-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('test');
      await searchResponse;

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /用户|User/i }).first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
        permission: 'readOnly' | 'readAndWrite' | 'admin';
        type: 'user' | 'group';
      };
      expect(requestBody.type).toBe('user');

      const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(userRow).toBeVisible({ timeout: 5000 });

      await userRow.locator('.el-select').click();
      const changePermissionRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/change_permission') && request.method() === 'PUT',
        { timeout: 20000 },
      );
      const changePermissionResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/change_permission') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /管理员|Admin/i }).first().click();
      const changePermissionRequest = await changePermissionRequestPromise;
      await changePermissionResponse;

      const changeBody = changePermissionRequest.postDataJSON() as {
        permission: 'readOnly' | 'readAndWrite' | 'admin';
      };
      expect(changeBody.permission).toBe('admin');
      await expect(userRow.locator('.el-select')).toContainText(/管理员|Admin/i, { timeout: 5000 });
    });
    // 测试在成员管理中添加组到项目
    test('添加组到项目', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-添加组-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      // 搜索并添加组
      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('测试');
      await searchResponse;

      const groupItems = contentPage.locator('.remote-select-item').filter({ hasText: /组|Group/i });
      await expect(groupItems.first()).toBeVisible({ timeout: 5000 });

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await groupItems.first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
        type: 'user' | 'group';
      };
      expect(requestBody.type).toBe('group');

      const groupRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(groupRow).toBeVisible({ timeout: 5000 });
      await expect(groupRow).toContainText(/组|Group/i, { timeout: 5000 });
    });
    // 测试将用户权限从只读修改为读写
    test('修改权限-只读改为读写', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-只读改读写-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('test');
      await searchResponse;

      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /用户|User/i }).first().click();
      await addUserResponse;
      await contentPage.waitForTimeout(300);

      // 找到非管理员用户进行权限修改
      const userRows = permissionDialog.locator('.el-table__row').filter({ hasText: /用户|User/i });
      const nonAdminRow = await userRows.evaluateAll((rows) => {
        for (const row of rows) {
          const permissionText = row.querySelector('.el-select')?.textContent?.trim() || '';
          if (!/管理员|Admin/i.test(permissionText)) {
            return row;
          }
        }
        return null;
      });

      if (nonAdminRow) {
        const userRow = permissionDialog.locator('.el-table__row').filter({ has: contentPage.locator(':text-matches("用户|User", "i")') }).first();
        
        // 先将权限设置为只读
        await userRow.locator('.el-select').click();
        await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /只读|Read Only/i }).first().click();
        await contentPage.waitForTimeout(300);

        // 再将只读权限修改为读写
        await userRow.locator('.el-select').click();
        const changePermissionRequestPromise = contentPage.waitForRequest(
          (request) => request.url().includes('/api/project/change_permission') && request.method() === 'PUT',
          { timeout: 20000 },
        );
        const changePermissionResponse = contentPage.waitForResponse(
          (response) => response.url().includes('/api/project/change_permission') && response.status() === 200,
          { timeout: 20000 },
        );
        await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /读写|Read and Write/i }).first().click();
        const changePermissionRequest = await changePermissionRequestPromise;
        await changePermissionResponse;

        const changeBody = changePermissionRequest.postDataJSON() as {
          permission: 'readOnly' | 'readAndWrite' | 'admin';
        };
        expect(changeBody.permission).toBe('readAndWrite');
        await expect(userRow.locator('.el-select')).toContainText(/读写|Read and Write/i, { timeout: 5000 });
      }
    });
    // 测试将用户权限从只读修改为管理员
    test('修改权限-只读改为管理员', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-只读改管理员-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('test');
      await searchResponse;

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /用户|User/i }).first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
      };

      const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(userRow).toBeVisible({ timeout: 5000 });

      await userRow.locator('.el-select').click();
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /只读|Read Only/i }).first().click();
      await contentPage.waitForTimeout(300);

      await userRow.locator('.el-select').click();
      const changePermissionRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/change_permission') && request.method() === 'PUT',
        { timeout: 20000 },
      );
      const changePermissionResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/change_permission') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /管理员|Admin/i }).first().click();
      const changePermissionRequest = await changePermissionRequestPromise;
      await changePermissionResponse;

      const changeBody = changePermissionRequest.postDataJSON() as {
        permission: 'readOnly' | 'readAndWrite' | 'admin';
      };
      expect(changeBody.permission).toBe('admin');
      await expect(userRow.locator('.el-select')).toContainText(/管理员|Admin/i, { timeout: 5000 });
    });
    // 测试将用户权限从读写修改为只读
    test('修改权限-读写改为只读', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-读写改只读-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('test');
      await searchResponse;

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /用户|User/i }).first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
        permission: 'readOnly' | 'readAndWrite' | 'admin';
      };
      expect(requestBody.permission).toBe('readAndWrite');

      const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(userRow).toBeVisible({ timeout: 5000 });

      await userRow.locator('.el-select').click();
      const changePermissionRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/change_permission') && request.method() === 'PUT',
        { timeout: 20000 },
      );
      const changePermissionResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/change_permission') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /只读|Read Only/i }).first().click();
      const changePermissionRequest = await changePermissionRequestPromise;
      await changePermissionResponse;

      const changeBody = changePermissionRequest.postDataJSON() as {
        permission: 'readOnly' | 'readAndWrite' | 'admin';
      };
      expect(changeBody.permission).toBe('readOnly');
      await expect(userRow.locator('.el-select')).toContainText(/只读|Read Only/i, { timeout: 5000 });
    });
    // 测试将用户权限从读写修改为管理员
    test('修改权限-读写改为管理员', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-读写改管理员-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('test');
      await searchResponse;

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /用户|User/i }).first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
        permission: 'readOnly' | 'readAndWrite' | 'admin';
      };
      expect(requestBody.permission).toBe('readAndWrite');

      const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(userRow).toBeVisible({ timeout: 5000 });

      await userRow.locator('.el-select').click();
      const changePermissionRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/change_permission') && request.method() === 'PUT',
        { timeout: 20000 },
      );
      const changePermissionResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/change_permission') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /管理员|Admin/i }).first().click();
      const changePermissionRequest = await changePermissionRequestPromise;
      await changePermissionResponse;

      const changeBody = changePermissionRequest.postDataJSON() as {
        permission: 'readOnly' | 'readAndWrite' | 'admin';
      };
      expect(changeBody.permission).toBe('admin');
      await expect(userRow.locator('.el-select')).toContainText(/管理员|Admin/i, { timeout: 5000 });
    });
    // 测试将管理员权限降级为只读时需要二次确认
    test('修改权限-管理员改为只读需确认', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-管理员改只读-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('test');
      await searchResponse;

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /用户|User/i }).first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
      };

      const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(userRow).toBeVisible({ timeout: 5000 });

      // 先将用户设置为管理员
      await userRow.locator('.el-select').click();
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /管理员|Admin/i }).first().click();
      await contentPage.waitForTimeout(300);

      // 尝试将管理员改为只读，应弹出确认框
      await userRow.locator('.el-select').click();
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /只读|Read Only/i }).first().click();

      const confirmButton = contentPage.locator('[data-testid="确定/EditPermissionChangeAdminPermission"]');
      await expect(confirmButton).toBeVisible({ timeout: 5000 });

      const changePermissionRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/change_permission') && request.method() === 'PUT',
        { timeout: 20000 },
      );
      const changePermissionResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/change_permission') && response.status() === 200,
        { timeout: 20000 },
      );
      await confirmButton.click();
      const changePermissionRequest = await changePermissionRequestPromise;
      await changePermissionResponse;

      const changeBody = changePermissionRequest.postDataJSON() as {
        permission: 'readOnly' | 'readAndWrite' | 'admin';
      };
      expect(changeBody.permission).toBe('readOnly');
      await expect(userRow.locator('.el-select')).toContainText(/只读|Read Only/i, { timeout: 5000 });
    });
    // 测试将管理员权限降级为读写时需要二次确认
    test('修改权限-管理员改为读写需确认', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-管理员改读写-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('test');
      await searchResponse;

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /用户|User/i }).first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
      };

      const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(userRow).toBeVisible({ timeout: 5000 });

      await userRow.locator('.el-select').click();
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /管理员|Admin/i }).first().click();
      await contentPage.waitForTimeout(300);

      await userRow.locator('.el-select').click();
      await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /读写|Read and Write/i }).first().click();

      const confirmButton = contentPage.locator('[data-testid="确定/EditPermissionChangeAdminPermission"]');
      await expect(confirmButton).toBeVisible({ timeout: 5000 });

      const changePermissionRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/change_permission') && request.method() === 'PUT',
        { timeout: 20000 },
      );
      const changePermissionResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/change_permission') && response.status() === 200,
        { timeout: 20000 },
      );
      await confirmButton.click();
      const changePermissionRequest = await changePermissionRequestPromise;
      await changePermissionResponse;

      const changeBody = changePermissionRequest.postDataJSON() as {
        permission: 'readOnly' | 'readAndWrite' | 'admin';
      };
      expect(changeBody.permission).toBe('readAndWrite');
      await expect(userRow.locator('.el-select')).toContainText(/读写|Read and Write/i, { timeout: 5000 });
    });
    // 测试删除普通用户成员
    test('删除普通用户成员', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-删除普通用户-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('test');
      await searchResponse;

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /用户|User/i }).first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
      };

      const userRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(userRow).toBeVisible({ timeout: 5000 });

      // 点击删除按钮并确认
      await userRow.locator('button').filter({ hasText: /删除|Delete/i }).click();

      const confirmButton = contentPage.locator('[data-testid="确定/EditPermissionDeleteMember"]');
      await expect(confirmButton).toBeVisible({ timeout: 5000 });

      const deleteUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/delete_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await confirmButton.click();
      await deleteUserResponse;

      // 验证用户已从列表中移除
      await expect(userRow).toBeHidden({ timeout: 5000 });
    });
    // 测试删除组成员
    test('删除组成员', async ({ topBarPage, contentPage, createProject }) => {
      const projectName = await createProject(`E2E-删除组-${Date.now()}`);
      
      const backHomeProjectListResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
        { timeout: 20000 },
      );
      await topBarPage.locator('[data-testid="header-home-btn"]').click();
      await contentPage.waitForURL(/.*?#?\/home/, { timeout: 10000 });
      await backHomeProjectListResponse;
      await contentPage.waitForTimeout(500);

      // 确保在项目列表tab
      const projectTab = contentPage.locator('[data-testid="home-tab-projects"]');
      await projectTab.click();
      await contentPage.waitForTimeout(300);

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

      const searchInput = permissionDialog.locator('.remote-select-inner');
      const searchResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userOrGroupListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await searchInput.fill('测试');
      await searchResponse;

      const addUserRequestPromise = contentPage.waitForRequest(
        (request) => request.url().includes('/api/project/add_user') && request.method() === 'POST',
        { timeout: 20000 },
      );
      const addUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/add_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await contentPage.locator('.remote-select-item').filter({ hasText: /组|Group/i }).first().click();
      const addUserRequest = await addUserRequestPromise;
      await addUserResponse;

      const requestBody = addUserRequest.postDataJSON() as {
        name: string;
      };

      const groupRow = permissionDialog.locator('.el-table__row').filter({ hasText: requestBody.name }).first();
      await expect(groupRow).toBeVisible({ timeout: 5000 });

      await groupRow.locator('button').filter({ hasText: /删除|Delete/i }).click();

      const confirmButton = contentPage.locator('[data-testid="确定/EditPermissionDeleteMember"]');
      await expect(confirmButton).toBeVisible({ timeout: 5000 });

      const deleteUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/project/delete_user') && response.status() === 200,
        { timeout: 20000 },
      );
      await confirmButton.click();
      await deleteUserResponse;

      await expect(groupRow).toBeHidden({ timeout: 5000 });
    });
  });
});

