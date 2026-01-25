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
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    const adminBtnVisible = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (!adminBtnVisible) {
      if (!loginName2 || !password2) test.skip(true, '未配置第二账号，且当前账号不是管理员');
      await loginAccount({ loginName: loginName2, password: password2 });
    }
    const finalAdminBtnVisible = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false);
    test.skip(!finalAdminBtnVisible, '当前测试环境没有管理员账号');
    await navigateToAdmin(topBarPage, contentPage);
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
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
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
    await contentPage.waitForTimeout(500);
    const firstCheckbox = dialog.locator('.el-checkbox').first();
    await firstCheckbox.click();
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
    await contentPage.waitForTimeout(500);
    const firstCheckbox = dialog.locator('.el-checkbox').first();
    await firstCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await expect(roleRow).toBeVisible({ timeout: 5000 });
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
    await contentPage.waitForTimeout(500);
    const clientCheckbox = dialog.locator('.el-checkbox').first();
    await clientCheckbox.click();
    const serverRouteTab = dialog.locator('.el-tabs__item').filter({ hasText: /后端路由/ });
    await serverRouteTab.click();
    await contentPage.waitForTimeout(500);
    const serverCheckbox = dialog.locator('.el-checkbox').first();
    await serverCheckbox.click();
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
    const nameInput = editDialog.locator('input').first();
    await nameInput.clear();
    await nameInput.fill(newRoleName);
    const remarkInput = editDialog.locator('textarea, input').nth(1);
    await remarkInput.clear();
    await remarkInput.fill('修改后的备注');
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const newRoleRow = findRoleRowByName(contentPage, newRoleName);
    await expect(newRoleRow).toBeVisible({ timeout: 5000 });
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
    await contentPage.waitForTimeout(500);
    const firstCheckbox = editDialog.locator('.el-checkbox').first();
    await firstCheckbox.click();
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
    await contentPage.waitForTimeout(500);
    const firstCheckbox = dialog.locator('.el-checkbox').first();
    await firstCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRoleListLoaded(contentPage);
    const roleRow = findRoleRowByName(contentPage, roleName);
    await clickRowAction(roleRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const editClientRouteTab = editDialog.locator('.el-tabs__item').filter({ hasText: /前端路由/ });
    await editClientRouteTab.click();
    await contentPage.waitForTimeout(500);
    const checkedCheckbox = editDialog.locator('.el-checkbox.is-checked').first();
    await checkedCheckbox.click();
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
    const messageBox = contentPage.locator('.el-message-box');
    await expect(messageBox).toBeVisible({ timeout: 5000 });
    const cancelBtn = messageBox.locator('.el-button').filter({ hasText: /取消/ });
    await cancelBtn.click();
    await expect(messageBox).toBeHidden({ timeout: 5000 });
    await waitForRoleListLoaded(contentPage);
    const stillExistsRoleRow = findRoleRowByName(contentPage, roleName);
    await expect(stillExistsRoleRow).toBeVisible({ timeout: 5000 });
  });

  test('角色列表展示-角色列表正常加载', async ({ contentPage }) => {
    const roleTable = contentPage.locator('.el-table').first();
    await expect(roleTable).toBeVisible({ timeout: 5000 });
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
