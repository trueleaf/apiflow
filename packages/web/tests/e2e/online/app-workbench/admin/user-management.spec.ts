import { test, expect } from '../../../../fixtures/electron-online.fixture';
import { 
  navigateToAdmin, 
  switchAdminTab, 
  waitForUserListLoaded,
  getTableRowCount,
  findUserRowByName,
  clickRowAction,
  fillDialogForm,
  confirmDialog,
  confirmDeleteDialog,
  searchUser,
  clearSearch,
  expectSuccessMessage
} from '../../../../fixtures/admin-helper';
import path from 'path';

test.describe('Online后台管理-用户管理', () => {
  let createdUsers: string[] = [];

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
    await switchAdminTab(contentPage, '用户管理');
    await waitForUserListLoaded(contentPage);
    createdUsers = [];
  });

  test.afterEach(async ({ contentPage }) => {
    for (const userName of createdUsers) {
      try {
        const userRow = findUserRowByName(contentPage, userName);
        const rowVisible = await userRow.isVisible({ timeout: 2000 }).catch(() => false);
        if (rowVisible) {
          await clickRowAction(userRow, '删除');
          await confirmDeleteDialog(contentPage);
        }
      } catch {
      }
    }
  });

  test('新增用户-输入合法登录名创建普通用户成功', async ({ contentPage }) => {
    const userName = `test_user_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    const dialog = contentPage.locator('.el-dialog').first();
    const userRoleCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /普通用户/ });
    await userRoleCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await expect(userRow).toBeVisible({ timeout: 5000 });
  });

  test('新增用户-选择管理员角色创建成功', async ({ contentPage }) => {
    const userName = `test_admin_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    const dialog = contentPage.locator('.el-dialog').first();
    const adminCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /管理员/ });
    await adminCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await expect(userRow).toBeVisible({ timeout: 5000 });
    await expect(userRow).toContainText('管理员');
  });

  test('新增用户-不填写登录名时显示必填校验', async ({ contentPage }) => {
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').first();
    const confirmBtn = dialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    const errorMessage = dialog.locator('.el-form-item__error');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('修改用户-修改登录名成功', async ({ contentPage }) => {
    const userName = `test_user_${Date.now()}`;
    const newUserName = `${userName}_modified`;
    createdUsers.push(userName);
    createdUsers.push(newUserName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    const dialog = contentPage.locator('.el-dialog').first();
    const userRoleCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /普通用户/ });
    await userRoleCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await clickRowAction(userRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const nameInput = editDialog.locator('input').first();
    await nameInput.clear();
    await nameInput.fill(newUserName);
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const newUserRow = findUserRowByName(contentPage, newUserName);
    await expect(newUserRow).toBeVisible({ timeout: 5000 });
  });

  test('修改用户-从普通用户改为管理员', async ({ contentPage }) => {
    const userName = `test_user_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    const dialog = contentPage.locator('.el-dialog').first();
    const userRoleCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /普通用户/ });
    await userRoleCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await clickRowAction(userRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const adminCheckbox = editDialog.locator('.el-checkbox').filter({ hasText: /管理员/ });
    await adminCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const updatedUserRow = findUserRowByName(contentPage, userName);
    await expect(updatedUserRow).toContainText('管理员');
  });

  test('重置密码-输入新密码重置成功', async ({ contentPage }) => {
    const userName = `test_user_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    const dialog = contentPage.locator('.el-dialog').first();
    const userRoleCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /普通用户/ });
    await userRoleCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await clickRowAction(userRow, '重置密码');
    const resetDialog = contentPage.locator('.el-dialog').first();
    await expect(resetDialog).toBeVisible({ timeout: 5000 });
    const passwordInput = resetDialog.locator('input[type="password"]');
    await passwordInput.fill('newpassword123');
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
  });

  test('重置密码-密码长度少于6位时校验失败', async ({ contentPage }) => {
    const userName = `test_user_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    const dialog = contentPage.locator('.el-dialog').first();
    const userRoleCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /普通用户/ });
    await userRoleCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await clickRowAction(userRow, '重置密码');
    const resetDialog = contentPage.locator('.el-dialog').first();
    await expect(resetDialog).toBeVisible({ timeout: 5000 });
    const passwordInput = resetDialog.locator('input[type="password"]');
    await passwordInput.fill('123');
    const confirmBtn = resetDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    const errorMessage = resetDialog.locator('.el-form-item__error');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('启用禁用用户-禁用已启用的用户', async ({ contentPage }) => {
    const userName = `test_user_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    const dialog = contentPage.locator('.el-dialog').first();
    const userRoleCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /普通用户/ });
    await userRoleCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    const enableSwitch = userRow.locator('.el-switch');
    await enableSwitch.click();
    await contentPage.waitForTimeout(1000);
    await expect(enableSwitch).toHaveClass(/is-disabled/, { timeout: 3000 });
  });

  test('启用禁用用户-启用已禁用的用户', async ({ contentPage }) => {
    const userName = `test_user_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    const dialog = contentPage.locator('.el-dialog').first();
    const userRoleCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /普通用户/ });
    await userRoleCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    const enableSwitch = userRow.locator('.el-switch');
    await enableSwitch.click();
    await contentPage.waitForTimeout(1000);
    await enableSwitch.click();
    await contentPage.waitForTimeout(1000);
    await expect(enableSwitch).not.toHaveClass(/is-disabled/, { timeout: 3000 });
  });

  test('搜索用户-按登录名搜索能过滤显示', async ({ contentPage }) => {
    const userName = `test_search_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    const dialog = contentPage.locator('.el-dialog').first();
    const userRoleCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /普通用户/ });
    await userRoleCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    await searchUser(contentPage, userName);
    await waitForUserListLoaded(contentPage);
    const rowCount = await getTableRowCount(contentPage);
    expect(rowCount).toBeGreaterThanOrEqual(1);
    const userRow = findUserRowByName(contentPage, userName);
    await expect(userRow).toBeVisible({ timeout: 5000 });
  });

  test('搜索用户-清空搜索条件恢复全部用户', async ({ contentPage }) => {
    const userName = `test_search_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    const dialog = contentPage.locator('.el-dialog').first();
    const userRoleCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /普通用户/ });
    await userRoleCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    const originalRowCount = await getTableRowCount(contentPage);
    await searchUser(contentPage, userName);
    await waitForUserListLoaded(contentPage);
    await clearSearch(contentPage);
    await waitForUserListLoaded(contentPage);
    const restoredRowCount = await getTableRowCount(contentPage);
    expect(restoredRowCount).toBeGreaterThanOrEqual(originalRowCount);
  });

  test('批量导入用户-上传合法CSV文件导入成功', async ({ contentPage }) => {
    const importBtn = contentPage.locator('.el-button').filter({ hasText: /批量导入/ });
    await importBtn.click();
    const dialog = contentPage.locator('.el-dialog').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const csvPath = path.resolve(__dirname, '../../../../fixtures/admin/user-import-template.csv');
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);
    await contentPage.waitForTimeout(1000);
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    createdUsers.push('test_user_001', 'test_user_002', 'test_user_003');
    const user1Row = findUserRowByName(contentPage, 'test_user_001');
    await expect(user1Row).toBeVisible({ timeout: 5000 });
  });

  test('批量导入用户-下载CSV模板功能', async ({ contentPage }) => {
    const importBtn = contentPage.locator('.el-button').filter({ hasText: /批量导入/ });
    await importBtn.click();
    const dialog = contentPage.locator('.el-dialog').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const downloadTemplateBtn = dialog.locator('.el-button').filter({ hasText: /下载模板/ });
    const downloadPromise = contentPage.waitForEvent('download');
    await downloadTemplateBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
    const cancelBtn = dialog.locator('.el-button').filter({ hasText: /取消/ });
    await cancelBtn.click();
  });
});
