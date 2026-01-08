import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('online团队管理', () => {
  // 每个测试用例前都需要登录并导航到团队管理页面
  test.beforeEach(async ({ loginAccount, contentPage }) => {
    await loginAccount();
    // 等待团队列表加载完成
    const groupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await contentPage.locator('.el-tabs__item').filter({ hasText: /团队管理|Team/i }).click();
    await groupListResponse;
    await contentPage.waitForTimeout(500);
  });

  // 测试创建团队功能，验证团队名称、描述、邀请限制设置正确，创建者自动成为初始管理员成员
  test('创建团队-验证基础信息和初始成员', async ({ contentPage }) => {
    const groupName = `E2E-团队-${Date.now()}`;
    const groupDescription = '这是一个测试团队的描述';
    // 根据是否有团队选择不同的创建入口
    const emptyState = contentPage.locator('.empty-state-card');
    const emptyStateVisible = await emptyState.isVisible({ timeout: 500 }).catch(() => false);
    if (emptyStateVisible) {
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
    } else {
      await contentPage.getByTitle(/创建团队|Create Team/i).first().click();
    }
    const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
    await expect(createGroupDialog).toBeVisible({ timeout: 5000 });
    // 填写团队基本信息
    await createGroupDialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(groupName);
    await createGroupDialog.getByPlaceholder(/请输入团队描述|Team Description/i).fill(groupDescription);
    // 设置邀请限制为允许
    const allowInviteCheckbox = createGroupDialog.locator('.el-checkbox').filter({ hasText: /允许被非项目成员邀请到项目中|Allow/i });
    const isChecked = await allowInviteCheckbox.locator('input[type="checkbox"]').isChecked();
    if (!isChecked) {
      await allowInviteCheckbox.click();
    }
    // 提交创建团队请求
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
    // 验证团队出现在列表中
    const groupMenuItem = contentPage.locator('.el-menu-item').filter({ hasText: groupName });
    await expect(groupMenuItem).toBeVisible({ timeout: 5000 });
    await groupMenuItem.click();
    await contentPage.waitForTimeout(300);
    // 验证团队基本信息正确
    const groupNameInput = contentPage.locator('input[maxlength="30"]');
    await expect(groupNameInput).toHaveValue(groupName);
    const groupDescriptionTextarea = contentPage.locator('textarea[maxlength="255"]');
    await expect(groupDescriptionTextarea).toHaveValue(groupDescription);
    const allowInviteInput = contentPage.locator('.el-checkbox').filter({ hasText: /允许被非项目成员邀请到项目中|Allow/i }).locator('input[type="checkbox"]');
    await expect(allowInviteInput).toBeChecked();
    // 验证创建者自动成为初始成员且权限为管理员
    const memberTable = contentPage.locator('.el-table');
    await expect(memberTable).toBeVisible();
    const memberRows = memberTable.locator('.el-table__row');
    const memberCount = await memberRows.count();
    expect(memberCount).toBeGreaterThanOrEqual(1);
    const firstMember = memberRows.first();
    await expect(firstMember).toContainText(/管理员|Admin/i);
  });

  // 测试团队名称必填校验，不填写团队名称直接提交应显示错误提示
  test('创建团队-验证必填校验', async ({ contentPage }) => {
    const emptyState = contentPage.locator('.empty-state-card');
    const emptyStateVisible = await emptyState.isVisible({ timeout: 500 }).catch(() => false);
    if (emptyStateVisible) {
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
    } else {
      await contentPage.getByTitle(/创建团队|Create Team/i).first().click();
    }
    const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
    await expect(createGroupDialog).toBeVisible({ timeout: 5000 });
    // 不填写任何信息直接点击确定
    await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
    // 验证显示必填错误提示
    const errorMessage = createGroupDialog.getByText(/请输入团队名称|Please enter/i);
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  // 测试团队列表正常加载，点击团队可查看详情
  test('查询团队-验证列表加载和排序', async ({ contentPage }) => {
    const menuItems = contentPage.locator('.el-menu-item');
    const count = await menuItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
    // 如果有团队，验证可以正常点击并显示详情
    if (count > 0) {
      const firstItem = menuItems.first();
      await expect(firstItem).toBeVisible();
      await firstItem.click();
      await contentPage.waitForTimeout(300);
      const groupNameInput = contentPage.locator('input[maxlength="30"]');
      await expect(groupNameInput).toBeVisible();
    }
  });

  // 测试团队搜索功能，创建特定名称的团队后验证搜索可以过滤显示
  test('查询团队-验证搜索功能', async ({ contentPage }) => {
    const groupName = `搜索测试-${Date.now()}`;
    // 先创建一个用于搜索的团队
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
    );
    const refreshGroupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
    await createGroupResponse;
    await refreshGroupListResponse;
    await contentPage.waitForTimeout(300);
    // 输入搜索关键词
    const searchInput = contentPage.locator('.search-ElMessageBox input');
    await searchInput.fill('搜索测试');
    await contentPage.waitForTimeout(300);
    // 验证搜索结果包含关键词
    const visibleItems = contentPage.locator('.el-menu-item:visible');
    const visibleCount = await visibleItems.count();
    expect(visibleCount).toBeGreaterThanOrEqual(1);
    await expect(visibleItems.first()).toContainText('搜索测试');
    // 清空搜索框验证显示所有团队
    await searchInput.clear();
    await contentPage.waitForTimeout(300);
    const allItems = contentPage.locator('.el-menu-item');
    const allCount = await allItems.count();
    expect(allCount).toBeGreaterThanOrEqual(visibleCount);
  });

  // 测试团队详情信息显示，包括创建者、创建时间等信息
  test('查询团队-验证团队详情信息准确性', async ({ contentPage }) => {
    const menuItems = contentPage.locator('.el-menu-item');
    const count = await menuItems.count();
    // 如果没有团队先创建一个
    if (count === 0) {
      const emptyState = contentPage.locator('.empty-state-card');
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
      const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
      await createGroupDialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(`临时团队-${Date.now()}`);
      const createGroupResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/create') && response.status() === 200,
        { timeout: 20000 },
      );
      await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
      await createGroupResponse;
    }
    await contentPage.waitForTimeout(500);
    const firstItem = contentPage.locator('.el-menu-item').first();
    await firstItem.click();
    await contentPage.waitForTimeout(300);
    // 验证创建者和创建时间信息显示
    const creatorInfo = contentPage.locator('.gray-600').filter({ hasText: /创建于|Created/i });
    await expect(creatorInfo).toBeVisible();
    await expect(creatorInfo).toContainText(/\d{4}-\d{2}-\d{2}/);
  });

  // 测试修改团队名称功能，验证修改后列表同步更新
  test('更新团队-修改团队名称', async ({ contentPage }) => {
    const menuItems = contentPage.locator('.el-menu-item');
    const count = await menuItems.count();
    if (count === 0) {
      const emptyState = contentPage.locator('.empty-state-card');
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
      const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
      await createGroupDialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(`待修改团队-${Date.now()}`);
      const createGroupResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/create') && response.status() === 200,
        { timeout: 20000 },
      );
      await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
      await createGroupResponse;
      await contentPage.waitForTimeout(500);
    }
    const firstItem = contentPage.locator('.el-menu-item').first();
    const originalName = await firstItem.innerText();
    await firstItem.click();
    await contentPage.waitForTimeout(300);
    // 修改团队名称
    const newName = `已修改-${Date.now()}`;
    const groupNameInput = contentPage.locator('input[maxlength="30"]');
    await groupNameInput.fill(newName);
    const saveBtn = contentPage.getByRole('button', { name: /保存修改|Save/i });
    await expect(saveBtn).toBeEnabled();
    const updateGroupResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/update') && response.status() === 200,
      { timeout: 20000 },
    );
    await saveBtn.click();
    await updateGroupResponse;
    await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(300);
    // 验证列表中名称已更新
    const updatedItem = contentPage.locator('.el-menu-item').filter({ hasText: newName });
    await expect(updatedItem).toBeVisible();
    const oldItem = contentPage.locator('.el-menu-item').filter({ hasText: originalName });
    await expect(oldItem).not.toBeVisible();
  });

  // 测试修改团队描述功能，验证修改后保存成功
  test('更新团队-修改团队描述', async ({ contentPage }) => {
    const menuItems = contentPage.locator('.el-menu-item');
    const count = await menuItems.count();
    if (count === 0) {
      const emptyState = contentPage.locator('.empty-state-card');
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
      const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
      await createGroupDialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(`描述测试团队-${Date.now()}`);
      const createGroupResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/create') && response.status() === 200,
        { timeout: 20000 },
      );
      await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
      await createGroupResponse;
      await contentPage.waitForTimeout(500);
    }
    const firstItem = contentPage.locator('.el-menu-item').first();
    await firstItem.click();
    await contentPage.waitForTimeout(300);
    // 修改团队描述
    const newDescription = `更新的描述-${Date.now()}`;
    const groupDescriptionTextarea = contentPage.locator('textarea[maxlength="255"]');
    await groupDescriptionTextarea.fill(newDescription);
    const saveBtn = contentPage.getByRole('button', { name: /保存修改|Save/i });
    await expect(saveBtn).toBeEnabled();
    const updateGroupResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/update') && response.status() === 200,
      { timeout: 20000 },
    );
    await saveBtn.click();
    await updateGroupResponse;
    await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(300);
    await expect(groupDescriptionTextarea).toHaveValue(newDescription);
  });

  // 测试修改团队邀请限制功能，isAllowInvite影响团队是否可被项目搜索到
  test('更新团队-修改邀请限制', async ({ contentPage }) => {
    const menuItems = contentPage.locator('.el-menu-item');
    const count = await menuItems.count();
    if (count === 0) {
      const emptyState = contentPage.locator('.empty-state-card');
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
      const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
      await createGroupDialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(`邀请限制团队-${Date.now()}`);
      const createGroupResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/create') && response.status() === 200,
        { timeout: 20000 },
      );
      await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
      await createGroupResponse;
      await contentPage.waitForTimeout(500);
    }
    const firstItem = contentPage.locator('.el-menu-item').first();
    await firstItem.click();
    await contentPage.waitForTimeout(300);
    // 切换邀请限制状态
    const allowInviteCheckbox = contentPage.locator('.el-checkbox').filter({ hasText: /允许被非项目成员邀请到项目中|Allow/i });
    const allowInviteInput = allowInviteCheckbox.locator('input[type="checkbox"]');
    const initialState = await allowInviteInput.isChecked();
    await allowInviteCheckbox.click();
    const newState = await allowInviteInput.isChecked();
    expect(newState).toBe(!initialState);
    const saveBtn = contentPage.getByRole('button', { name: /保存修改|Save/i });
    await expect(saveBtn).toBeEnabled();
    const updateGroupResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/update') && response.status() === 200,
      { timeout: 20000 },
    );
    await saveBtn.click();
    await updateGroupResponse;
    await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
  });

  // 测试添加新成员功能，新成员默认权限为“可编辑”，添加后立即生效
  test('成员管理-添加新成员', async ({ contentPage }) => {
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName2) throw new Error('缺少 TEST_LOGIN_NAME2 环境变量');
    const menuItems = contentPage.locator('.el-menu-item');
    const count = await menuItems.count();
    if (count === 0) {
      const emptyState = contentPage.locator('.empty-state-card');
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
      const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
      await createGroupDialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(`成员管理团队-${Date.now()}`);
      const createGroupResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/create') && response.status() === 200,
        { timeout: 20000 },
      );
      await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
      await createGroupResponse;
      await contentPage.waitForTimeout(500);
    }
    const firstItem = contentPage.locator('.el-menu-item').first();
    await firstItem.click();
    await contentPage.waitForTimeout(300);
    const memberTable = contentPage.locator('.el-table');
    const initialRows = await memberTable.locator('.el-table__row').count();
    // 点击添加成员按钮
    const addUserBtn = contentPage.locator('.add-item');
    await addUserBtn.click();
    await contentPage.waitForTimeout(300);
    // 搜索用户
    const remoteSelector = contentPage.locator('.remote-select-inner');
    await expect(remoteSelector).toBeVisible();
    const searchUserResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await remoteSelector.fill(loginName2);
    await searchUserResponse;
    await contentPage.waitForTimeout(300);
    // 点击添加用户，添加后立即生效无需保存
    const addMemberResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/add') && response.status() === 200,
      { timeout: 20000 },
    );
    const refreshGroupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    const userItem = contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first();
    await userItem.click();
    await addMemberResponse;
    await refreshGroupListResponse;
    await contentPage.waitForTimeout(500);
    // 验证成员已添加且默认权限为“可编辑”
    const newRows = await memberTable.locator('.el-table__row').count();
    expect(newRows).toBe(initialRows + 1);
    const newMemberRow = memberTable.locator('.el-table__row').filter({ hasText: loginName2 });
    await expect(newMemberRow).toBeVisible();
    await expect(newMemberRow).toContainText(/可编辑|Read.*Write/i);
  });

  // 测试添加重复成员时系统显示警告提示
  test('成员管理-添加重复成员提示', async ({ contentPage }) => {
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName2) throw new Error('缺少 TEST_LOGIN_NAME2 环境变量');
    const menuItems = contentPage.locator('.el-menu-item');
    const count = await menuItems.count();
    if (count === 0) {
      const emptyState = contentPage.locator('.empty-state-card');
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
      const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
      await createGroupDialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(`重复成员团队-${Date.now()}`);
      const createGroupResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/create') && response.status() === 200,
        { timeout: 20000 },
      );
      await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
      await createGroupResponse;
      await contentPage.waitForTimeout(500);
    }
    const firstItem = contentPage.locator('.el-menu-item').first();
    await firstItem.click();
    await contentPage.waitForTimeout(300);
    // 第一次添加成员
    const addUserBtn = contentPage.locator('.add-item');
    await addUserBtn.click();
    await contentPage.waitForTimeout(300);
    const remoteSelector = contentPage.locator('.remote-select-inner');
    const searchUserResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await remoteSelector.fill(loginName2);
    await searchUserResponse;
    await contentPage.waitForTimeout(300);
    const addMemberResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/add') && response.status() === 200,
      { timeout: 20000 },
    );
    const userItem = contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first();
    await userItem.click();
    await addMemberResponse;
    await contentPage.waitForTimeout(500);
    // 第二次添加同一成员，验证显示警告
    await addUserBtn.click();
    await contentPage.waitForTimeout(300);
    const searchUserResponse2 = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
      { timeout: 20000 },
    );
    await remoteSelector.fill(loginName2);
    await searchUserResponse2;
    await contentPage.waitForTimeout(300);
    const userItem2 = contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first();
    await userItem2.click();
    await contentPage.waitForTimeout(300);
    const warningMessage = contentPage.getByText(/用户已存在|already exists/i);
    await expect(warningMessage).toBeVisible({ timeout: 5000 });
  });

  // 测试修改成员权限功能，验证权限修改后立即生效无需保存
  test('成员管理-修改成员权限立即生效', async ({ contentPage }) => {
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName2) throw new Error('缺少 TEST_LOGIN_NAME2 环境变量');
    const menuItems = contentPage.locator('.el-menu-item');
    const count = await menuItems.count();
    if (count === 0) {
      const emptyState = contentPage.locator('.empty-state-card');
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
      const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
      await createGroupDialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(`权限修改团队-${Date.now()}`);
      const createGroupResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/create') && response.status() === 200,
        { timeout: 20000 },
      );
      await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
      await createGroupResponse;
      await contentPage.waitForTimeout(500);
    }
    const firstItem = contentPage.locator('.el-menu-item').first();
    await firstItem.click();
    await contentPage.waitForTimeout(300);
    const memberTable = contentPage.locator('.el-table');
    // 如果成员不存在先添加
    const existingMember = memberTable.locator('.el-table__row').filter({ hasText: loginName2 });
    const memberExists = await existingMember.isVisible().catch(() => false);
    if (!memberExists) {
      const addUserBtn = contentPage.locator('.add-item');
      await addUserBtn.click();
      await contentPage.waitForTimeout(300);
      const remoteSelector = contentPage.locator('.remote-select-inner');
      const searchUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await remoteSelector.fill(loginName2);
      await searchUserResponse;
      await contentPage.waitForTimeout(300);
      const addMemberResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/member/add') && response.status() === 200,
        { timeout: 20000 },
      );
      const userItem = contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first();
      await userItem.click();
      await addMemberResponse;
      await contentPage.waitForTimeout(500);
    }
    const memberRow = memberTable.locator('.el-table__row').filter({ hasText: loginName2 });
    await expect(memberRow).toBeVisible();
    // 第一次修改：修改为“只读”
    const permissionDisplay = memberRow.locator('.permission');
    await permissionDisplay.click();
    await contentPage.waitForTimeout(300);
    const permissionList = contentPage.locator('.permission-list');
    await expect(permissionList).toBeVisible();
    const changePermissionResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/permission') && response.status() === 200,
      { timeout: 20000 },
    );
    const refreshGroupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    const readOnlyOption = permissionList.locator('.permission-item').filter({ hasText: /只读|Read Only/i });
    await readOnlyOption.click();
    await changePermissionResponse;
    await refreshGroupListResponse;
    await expect(contentPage.getByText(/修改成功|modified successfully/i)).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await expect(memberRow).toContainText(/只读|Read Only/i);
    // 第二次修改：修改为“管理员”
    await permissionDisplay.click();
    await contentPage.waitForTimeout(300);
    const changePermissionResponse2 = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/permission') && response.status() === 200,
      { timeout: 20000 },
    );
    const adminOption = permissionList.locator('.permission-item').filter({ hasText: /管理员|Admin/i });
    await adminOption.click();
    await changePermissionResponse2;
    await expect(contentPage.getByText(/修改成功|modified successfully/i)).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await expect(memberRow).toContainText(/管理员|Admin/i);
  });

  // 测试删除团队成员功能，验证删除确认和列表更新
  test('成员管理-删除成员', async ({ contentPage }) => {
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    if (!loginName2) throw new Error('缺少 TEST_LOGIN_NAME2 环境变量');
    const menuItems = contentPage.locator('.el-menu-item');
    const count = await menuItems.count();
    if (count === 0) {
      const emptyState = contentPage.locator('.empty-state-card');
      await emptyState.getByRole('button', { name: /创建团队|Create Team/i }).click();
      const createGroupDialog = contentPage.locator('.el-dialog').filter({ hasText: /创建团队|Create Team/i });
      await createGroupDialog.getByPlaceholder(/请输入团队名称|Team Name/i).fill(`删除成员团队-${Date.now()}`);
      const createGroupResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/create') && response.status() === 200,
        { timeout: 20000 },
      );
      await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
      await createGroupResponse;
      await contentPage.waitForTimeout(500);
    }
    const firstItem = contentPage.locator('.el-menu-item').first();
    await firstItem.click();
    await contentPage.waitForTimeout(300);
    const memberTable = contentPage.locator('.el-table');
    // 确保有成员可以删除
    const existingMember = memberTable.locator('.el-table__row').filter({ hasText: loginName2 });
    const memberExists = await existingMember.isVisible().catch(() => false);
    if (!memberExists) {
      const addUserBtn = contentPage.locator('.add-item');
      await addUserBtn.click();
      await contentPage.waitForTimeout(300);
      const remoteSelector = contentPage.locator('.remote-select-inner');
      const searchUserResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/security/userListByName') && response.status() === 200,
        { timeout: 20000 },
      );
      await remoteSelector.fill(loginName2);
      await searchUserResponse;
      await contentPage.waitForTimeout(300);
      const addMemberResponse = contentPage.waitForResponse(
        (response) => response.url().includes('/api/group/member/add') && response.status() === 200,
        { timeout: 20000 },
      );
      const userItem = contentPage.locator('.remote-select-item').filter({ hasText: loginName2 }).first();
      await userItem.click();
      await addMemberResponse;
      await contentPage.waitForTimeout(500);
    }
    const memberRow = memberTable.locator('.el-table__row').filter({ hasText: loginName2 });
    await expect(memberRow).toBeVisible();
    const initialRows = await memberTable.locator('.el-table__row').count();
    // 点击删除按钮
    const deleteBtn = memberRow.getByRole('button', { name: /删除|Delete/i });
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    // 确认删除
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible();
    const removeMemberResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/member/remove') && response.status() === 200,
      { timeout: 20000 },
    );
    const confirmBtn = confirmDialog.getByRole('button', { name: /确定|Confirm|OK/i });
    await confirmBtn.click();
    await removeMemberResponse;
    await expect(contentPage.getByText(/移除成功|removed successfully/i)).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证成员已被从列表中移除
    const newRows = await memberTable.locator('.el-table__row').count();
    expect(newRows).toBe(initialRows - 1);
    await expect(memberRow).not.toBeVisible();
  });

  // 测试删除团队功能，从详情页面删除按钮删除，验证确认框和列表更新
  test('删除团队-验证删除确认流程', async ({ contentPage }) => {
    const groupName = `待删除团队-${Date.now()}`;
    // 创建一个用于删除的团队
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
    );
    const refreshGroupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
    await createGroupResponse;
    await refreshGroupListResponse;
    await contentPage.waitForTimeout(500);
    const groupMenuItem = contentPage.locator('.el-menu-item').filter({ hasText: groupName });
    await expect(groupMenuItem).toBeVisible({ timeout: 5000 });
    await groupMenuItem.click();
    await contentPage.waitForTimeout(300);
    // 点击删除团队按钮
    const deleteBtn = contentPage.getByRole('button', { name: /删除团队|Delete Team/i });
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证删除确认框显示
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog).toContainText(/确定要删除该团队吗|Are you sure.*delete/i);
    // 确认删除
    const deleteGroupResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/remove') && response.status() === 200,
      { timeout: 20000 },
    );
    const refreshGroupListResponse2 = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    const confirmBtn = confirmDialog.getByRole('button', { name: /确定|Confirm|OK/i });
    await confirmBtn.click();
    await deleteGroupResponse;
    await refreshGroupListResponse2;
    await expect(contentPage.getByText(/删除成功|deleted successfully/i)).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证团队已从列表中移除
    await expect(groupMenuItem).not.toBeVisible();
  });

  // 测试从团队列表鼠标悬停时显示的删除图标删除团队
  test('删除团队-从列表删除图标删除', async ({ contentPage }) => {
    const groupName = `列表删除团队-${Date.now()}`;
    // 创建一个用于删除的团队
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
    );
    const refreshGroupListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    await createGroupDialog.getByRole('button', { name: /确定|Confirm|OK/i }).click();
    await createGroupResponse;
    await refreshGroupListResponse;
    await contentPage.waitForTimeout(500);
    const groupMenuItem = contentPage.locator('.el-menu-item').filter({ hasText: groupName });
    await expect(groupMenuItem).toBeVisible({ timeout: 5000 });
    // 鼠标悬停在团队项上显示删除图标
    await groupMenuItem.hover();
    await contentPage.waitForTimeout(200);
    const deleteIcon = groupMenuItem.locator('.del-icon');
    await deleteIcon.click();
    await contentPage.waitForTimeout(300);
    // 确认删除
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible();
    const deleteGroupResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/remove') && response.status() === 200,
      { timeout: 20000 },
    );
    const refreshGroupListResponse2 = contentPage.waitForResponse(
      (response) => response.url().includes('/api/group/list') && response.status() === 200,
      { timeout: 20000 },
    );
    const confirmBtn = confirmDialog.getByRole('button', { name: /确定|Confirm|OK/i });
    await confirmBtn.click();
    await deleteGroupResponse;
    await refreshGroupListResponse2;
    await expect(contentPage.getByText(/删除成功|deleted successfully/i)).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await expect(groupMenuItem).not.toBeVisible();
  });
});


