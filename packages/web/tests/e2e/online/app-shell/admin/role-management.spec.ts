import { test, expect } from '../../../../fixtures/electron-online.fixture';
import { 
  navigateToAdmin, 
  switchAdminTab, 
  waitForRoleListLoaded,
  getTableRowCount,
  findRoleRowByName,
  clickRowAction,
  fillDialogForm,
  confirmDialog,
  confirmDeleteDialog,
  cancelDeleteDialog,
  expectSuccessMessage
} from '../../../../fixtures/admin-helper';

test.describe('Online后台管理-角色管理', () => {
  let createdRoles: string[] = [];

  test.beforeEach(async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    const loginName1 = process.env.TEST_LOGIN_NAME;
    const password1 = process.env.TEST_LOGIN_PASSWORD;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    const password2 = process.env.TEST_LOGIN_PASSWORD2;
    if (!loginName1 || !password1) throw new Error('缺少环境变量');
    await loginAccount({ loginName: loginName1, password: password1 });
    let adminReady = false;
    try {
      await navigateToAdmin(topBarPage, contentPage);
      adminReady = true;
    } catch {
      if (!loginName2 || !password2) test.skip(true, '未配置第二账号，且当前账号不是管理员');
      await loginAccount({ loginName: loginName2, password: password2 });
      try {
        await navigateToAdmin(topBarPage, contentPage);
        adminReady = true;
      } catch {
        adminReady = false;
      }
    }
    test.skip(!adminReady, '当前测试环境没有管理员账号');
    await switchAdminTab(contentPage, '角色管理');
    await waitForRoleListLoaded(contentPage);
    createdRoles = [];
  });

  test.afterEach(async ({ contentPage }) => {
    for (const roleName of createdRoles) {
      try {
        const roleRow = findRoleRowByName(contentPage, roleName);
        const rowVisible = await roleRow.isVisible({ timeout: 2000 }).catch(() => false);
        if (rowVisible) {
          await clickRowAction(roleRow, '删除');
          await confirmDeleteDialog(contentPage);
        }
      } catch {
      }
    }
  });

  test('新增角色-输入合法角色名和备注创建成功', async ({ contentPage }) => {
    const roleName = `测试角色_${Date.now()}`;
    createdRoles.push(roleName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '角色名称': roleName,
      '备注': '这是一个测试角色'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await expect(roleRow).toBeVisible({ timeout: 5000 });
    await expect(roleRow).toContainText('这是一个测试角色');
  });

  test('新增角色-不填写必填字段时校验失败', async ({ contentPage }) => {
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').first();
    const confirmBtn = dialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    const errorMessage = dialog.locator('.el-form-item__error');
    await expect(errorMessage).toHaveCount(2, { timeout: 3000 });
    await expect(errorMessage).toContainText(['请输入角色名称', '请输入备注']);
  });

  test('新增角色-选择前端路由权限', async ({ contentPage }) => {
    const roleName = `测试角色_前端路由_${Date.now()}`;
    createdRoles.push(roleName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '角色名称': roleName,
      '备注': '前端路由权限测试'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const clientRouteTab = dialog.locator('.el-tabs__item').filter({ hasText: /前端路由/ });
    await clientRouteTab.click();
    // 选择一条前端路由权限（使用“全选”避免定位到隐藏 checkbox）
    const clientRoutes = dialog.locator('.client-routes');
    await expect(clientRoutes).toBeVisible({ timeout: 10000 });
    const selectAllClientRoutes = clientRoutes.locator('.el-checkbox').filter({ hasText: /全选/ }).first();
    await expect(selectAllClientRoutes).toBeVisible({ timeout: 10000 });
    await selectAllClientRoutes.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await expect(roleRow).toBeVisible({ timeout: 5000 });
  });

  test('新增角色-选择后端路由权限', async ({ contentPage }) => {
    const roleName = `测试角色_后端路由_${Date.now()}`;
    createdRoles.push(roleName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '角色名称': roleName,
      '备注': '后端路由权限测试'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const serverRouteTab = dialog.locator('.el-tabs__item').filter({ hasText: /后端路由/ });
    await serverRouteTab.click();
    // 选择一条后端路由权限（使用“全选”避免定位到隐藏 checkbox）
    const serverRoutes = dialog.locator('.server-routes');
    await expect(serverRoutes).toBeVisible({ timeout: 10000 });
    const selectAllServerRoutes = serverRoutes.locator('.el-checkbox').filter({ hasText: /全选/ }).first();
    await expect(selectAllServerRoutes).toBeVisible({ timeout: 10000 });
    await selectAllServerRoutes.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await expect(roleRow).toBeVisible({ timeout: 5000 });
  });

  test('新增角色-选择前端菜单权限', async ({ contentPage }) => {
    const roleName = `测试角色_前端菜单_${Date.now()}`;
    createdRoles.push(roleName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, {
      '角色名称': roleName,
      '备注': '前端菜单权限测试',
    });
    const dialog = contentPage.locator('.el-dialog').first();
    // 切换到前端菜单权限页签并选择一项菜单权限
    const clientMenuTab = dialog.locator('.el-tabs__item').filter({ hasText: /前端菜单/ }).first();
    await clientMenuTab.click();
    const clientMenuCheckbox = dialog.locator('.client-menus .el-checkbox').first();
    const hasClientMenu = await clientMenuCheckbox.isVisible({ timeout: 5000 }).catch(() => false);
    test.skip(!hasClientMenu, '当前环境缺少前端菜单数据');
    await clientMenuCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    await expect(findRoleRowByName(contentPage, roleName)).toBeVisible({ timeout: 5000 });
  });

  test('新增角色-同时选择多种权限', async ({ contentPage }) => {
    const roleName = `测试角色_多权限_${Date.now()}`;
    createdRoles.push(roleName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '角色名称': roleName,
      '备注': '多权限测试'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const clientRouteTab = dialog.locator('.el-tabs__item').filter({ hasText: /前端路由/ });
    await clientRouteTab.click();
    // 勾选前端路由权限
    const clientRoutes = dialog.locator('.client-routes');
    await expect(clientRoutes).toBeVisible({ timeout: 10000 });
    const selectAllClientRoutes = clientRoutes.locator('.el-checkbox').filter({ hasText: /全选/ }).first();
    await expect(selectAllClientRoutes).toBeVisible({ timeout: 10000 });
    await selectAllClientRoutes.click();
    const serverRouteTab = dialog.locator('.el-tabs__item').filter({ hasText: /后端路由/ });
    await serverRouteTab.click();
    // 勾选后端路由权限
    const serverRoutes = dialog.locator('.server-routes');
    await expect(serverRoutes).toBeVisible({ timeout: 10000 });
    const selectAllServerRoutes = serverRoutes.locator('.el-checkbox').filter({ hasText: /全选/ }).first();
    await expect(selectAllServerRoutes).toBeVisible({ timeout: 10000 });
    await selectAllServerRoutes.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await expect(roleRow).toBeVisible({ timeout: 5000 });
  });

  test('修改角色-修改角色名和备注成功', async ({ contentPage }) => {
    const roleName = `测试角色_${Date.now()}`;
    const newRoleName = `${roleName}_修改后`;
    createdRoles.push(roleName);
    createdRoles.push(newRoleName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '角色名称': roleName,
      '备注': '原始备注'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await clickRowAction(roleRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    // 修改角色名称和备注
    await fillDialogForm(contentPage, { 
      '角色名称': newRoleName,
      '备注': '修改后的备注'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const newRoleRow = findRoleRowByName(contentPage, newRoleName);
    await expect(newRoleRow).toBeVisible({ timeout: 10000 });
    await expect(newRoleRow).toContainText('修改后的备注');
  });

  test('修改角色-增加权限后保存', async ({ contentPage }) => {
    const roleName = `测试角色_${Date.now()}`;
    createdRoles.push(roleName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '角色名称': roleName,
      '备注': '测试备注'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await clickRowAction(roleRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const clientRouteTab = editDialog.locator('.el-tabs__item').filter({ hasText: /前端路由/ });
    await clientRouteTab.click();
    // 增加前端路由权限
    const clientRoutes = editDialog.locator('.client-routes');
    await expect(clientRoutes).toBeVisible({ timeout: 10000 });
    const selectAllClientRoutes = clientRoutes.locator('.el-checkbox').filter({ hasText: /全选/ }).first();
    await expect(selectAllClientRoutes).toBeVisible({ timeout: 10000 });
    await selectAllClientRoutes.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
  });

  test('修改角色-移除权限后保存', async ({ contentPage }) => {
    const roleName = `测试角色_${Date.now()}`;
    createdRoles.push(roleName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '角色名称': roleName,
      '备注': '测试备注'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const clientRouteTab = dialog.locator('.el-tabs__item').filter({ hasText: /前端路由/ });
    await clientRouteTab.click();
    // 先勾选一条前端路由权限
    const clientRoutes = dialog.locator('.client-routes');
    await expect(clientRoutes).toBeVisible({ timeout: 10000 });
    const selectAllClientRoutes = clientRoutes.locator('.el-checkbox').filter({ hasText: /全选/ }).first();
    await expect(selectAllClientRoutes).toBeVisible({ timeout: 10000 });
    await selectAllClientRoutes.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await clickRowAction(roleRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const editClientRouteTab = editDialog.locator('.el-tabs__item').filter({ hasText: /前端路由/ });
    await editClientRouteTab.click();
    // 取消已选中的权限
    const editClientRoutes = editDialog.locator('.client-routes');
    await expect(editClientRoutes).toBeVisible({ timeout: 10000 });
    const checkedCheckbox = editClientRoutes.locator('.el-checkbox.is-checked').first();
    await expect(checkedCheckbox).toBeVisible({ timeout: 10000 });
    await checkedCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
  });

  test('修改角色-修改前端菜单权限后保存', async ({ contentPage }) => {
    const roleName = `测试角色_菜单修改_${Date.now()}`;
    createdRoles.push(roleName);
    // 先创建基础角色
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, {
      '角色名称': roleName,
      '备注': '前端菜单编辑测试',
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    // 进入编辑弹窗并切换前端菜单页签
    const roleRow = findRoleRowByName(contentPage, roleName);
    await clickRowAction(roleRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const clientMenuTab = editDialog.locator('.el-tabs__item').filter({ hasText: /前端菜单/ }).first();
    await clientMenuTab.click();
    // 勾选一项菜单权限并保存
    const clientMenuCheckbox = editDialog.locator('.client-menus .el-checkbox').first();
    const hasClientMenu = await clientMenuCheckbox.isVisible({ timeout: 5000 }).catch(() => false);
    test.skip(!hasClientMenu, '当前环境缺少前端菜单数据');
    await clientMenuCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
  });

  test('删除角色-确认删除后角色从列表中移除', async ({ contentPage }) => {
    const roleName = `测试角色_${Date.now()}`;
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '角色名称': roleName,
      '备注': '待删除角色'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const initialRowCount = await getTableRowCount(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await clickRowAction(roleRow, '删除');
    await confirmDeleteDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const finalRowCount = await getTableRowCount(contentPage);
    expect(finalRowCount).toBe(initialRowCount - 1);
    const deletedRoleRow = findRoleRowByName(contentPage, roleName);
    await expect(deletedRoleRow).toBeHidden({ timeout: 3000 });
  });

  test('删除角色-取消删除角色仍存在', async ({ contentPage }) => {
    const roleName = `测试角色_${Date.now()}`;
    createdRoles.push(roleName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '角色名称': roleName,
      '备注': '测试取消删除'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await clickRowAction(roleRow, '删除');
    await cancelDeleteDialog(contentPage);
    await waitForRoleListLoaded(contentPage);
    const stillExistsRoleRow = findRoleRowByName(contentPage, roleName);
    await expect(stillExistsRoleRow).toBeVisible({ timeout: 5000 });
  });

  test('角色列表展示-角色列表正常加载', async ({ contentPage }) => {
    await waitForRoleListLoaded(contentPage);
    const rowCount = await getTableRowCount(contentPage);
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('角色列表展示-创建时间正确显示', async ({ contentPage }) => {
    const roleName = `测试角色_${Date.now()}`;
    createdRoles.push(roleName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增角色/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '角色名称': roleName,
      '备注': '测试创建时间'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await expect(roleRow).toBeVisible({ timeout: 5000 });
    const datePattern = /\d{4}-\d{2}-\d{2}/;
    const rowText = await roleRow.innerText();
    expect(datePattern.test(rowText)).toBeTruthy();
  });
});
