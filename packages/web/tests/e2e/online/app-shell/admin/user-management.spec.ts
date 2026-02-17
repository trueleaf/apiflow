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
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

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
    await switchAdminTab(contentPage, '用户管理');
    await waitForUserListLoaded(contentPage);
    createdUsers = [];
  });

  test('新增用户-输入合法登录名创建普通用户成功', async ({ contentPage }) => {
    const userName = `test_user_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位新创建用户（避免分页/排序导致行不在当前页）
    await searchUser(contentPage, userName);
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
    const dialog = contentPage.locator('.el-dialog:visible').first();
    // 勾选管理员权限
    const adminCheckbox = dialog.locator('.el-checkbox').filter({ hasText: /是否为管理员/ });
    await expect(adminCheckbox).toBeVisible({ timeout: 5000 });
    await adminCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位新创建用户（避免分页/排序导致行不在当前页）
    await searchUser(contentPage, userName);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await expect(userRow).toBeVisible({ timeout: 5000 });
    await expect(userRow).toContainText('管理员');
  });

  test('新增用户-不填写登录名时显示必填校验', async ({ contentPage }) => {
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog:visible').first();
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
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位待修改用户
    await searchUser(contentPage, userName);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await clickRowAction(userRow, '修改');
    const editDialog = contentPage.locator('.el-dialog:visible').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const nameInput = editDialog.locator('input').first();
    await nameInput.clear();
    await nameInput.fill(newUserName);
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位修改后的用户
    await searchUser(contentPage, newUserName);
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
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位待修改用户
    await searchUser(contentPage, userName);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await clickRowAction(userRow, '修改');
    const editDialog = contentPage.locator('.el-dialog:visible').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    // 勾选管理员权限
    const adminCheckbox = editDialog.locator('.el-checkbox').filter({ hasText: /是否为管理员/ });
    await expect(adminCheckbox).toBeVisible({ timeout: 5000 });
    await adminCheckbox.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位修改后的用户
    await searchUser(contentPage, userName);
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
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位待重置用户
    await searchUser(contentPage, userName);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await clickRowAction(userRow, '重置密码');
    // 输入新密码并提交
    await fillDialogForm(contentPage, { '新密码': 'newpassword123' });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
  });

  test('重置密码-密码长度少于6位时校验失败', async ({ contentPage }) => {
    const userName = `test_user_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位待重置用户
    await searchUser(contentPage, userName);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    await clickRowAction(userRow, '重置密码');
    // 输入短密码触发校验
    await fillDialogForm(contentPage, { '新密码': '123' });
    const resetDialog = contentPage.locator('.el-dialog:visible').first();
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
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位目标用户
    await searchUser(contentPage, userName);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    // 点击“禁用”并确认弹窗
    await clickRowAction(userRow, '禁用');
    await confirmDeleteDialog(contentPage);
    await waitForUserListLoaded(contentPage);
    const disabledTag = userRow.locator('.el-tag').filter({ hasText: /禁用/ }).first();
    await expect(disabledTag).toBeVisible({ timeout: 5000 });
  });

  test('启用禁用用户-启用已禁用的用户', async ({ contentPage }) => {
    const userName = `test_user_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位目标用户
    await searchUser(contentPage, userName);
    await waitForUserListLoaded(contentPage);
    const userRow = findUserRowByName(contentPage, userName);
    // 先禁用
    await clickRowAction(userRow, '禁用');
    await confirmDeleteDialog(contentPage);
    await waitForUserListLoaded(contentPage);
    // 再启用
    await clickRowAction(userRow, '启用');
    await confirmDeleteDialog(contentPage);
    await waitForUserListLoaded(contentPage);
    const enabledTag = userRow.locator('.el-tag').filter({ hasText: /启用/ }).first();
    await expect(enabledTag).toBeVisible({ timeout: 5000 });
  });

  test('搜索用户-按登录名搜索能过滤显示', async ({ contentPage }) => {
    const userName = `test_search_${Date.now()}`;
    createdUsers.push(userName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增用户/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { '登录名': userName });
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
    const importBtn = contentPage.locator('.el-button').filter({ hasText: /导入用户/ });
    await importBtn.click();
    const dialog = contentPage.locator('.el-dialog:visible').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    // 生成唯一 CSV，避免环境里已存在相同用户导致导入失败
    const suffix = String(Date.now());
    const user1 = `import_user_${suffix}_1`;
    const user2 = `import_user_${suffix}_2`;
    const user3 = `import_user_${suffix}_3`;
    const csvPath = join(tmpdir(), `apiflow-user-import-${suffix}.csv`);
    const csvContent = [
      'loginName,role',
      `${user1},user`,
      `${user2},admin`,
      `${user3},user`,
      '',
    ].join('\n');
    await writeFile(csvPath, csvContent, 'utf-8');
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);
    // 等待 csv 解析完成
    await expect(dialog.locator('.el-table')).toBeVisible({ timeout: 10000 });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForUserListLoaded(contentPage);
    // 使用搜索定位导入用户
    await searchUser(contentPage, user1);
    await waitForUserListLoaded(contentPage);
    const user1Row = findUserRowByName(contentPage, user1);
    await expect(user1Row).toBeVisible({ timeout: 5000 });
  });

  test('批量导入用户-下载CSV模板功能', async ({ contentPage }) => {
    const downloadTemplateBtn = contentPage.locator('.el-button').filter({ hasText: /下载模板/ });
    // Electron 场景下 Playwright 的 download 事件不稳定，改为拦截 a.click 校验下载文件名
    await contentPage.evaluate(() => {
      const globalThisWithDownload = globalThis as unknown as {
        __lastDownload?: { download: string; href: string } | null
      }
      globalThisWithDownload.__lastDownload = null
      const originClick = HTMLAnchorElement.prototype.click
      if (!(HTMLAnchorElement.prototype as unknown as { __patched?: boolean }).__patched) {
        ;(HTMLAnchorElement.prototype as unknown as { __patched?: boolean }).__patched = true
        HTMLAnchorElement.prototype.click = function click(this: HTMLAnchorElement) {
          globalThisWithDownload.__lastDownload = { download: this.download, href: this.href }
          return originClick.call(this)
        }
      }
    });
    await downloadTemplateBtn.click();
    const result = await contentPage.evaluate(() => {
      const globalThisWithDownload = globalThis as unknown as {
        __lastDownload?: { download: string; href: string } | null
      }
      return globalThisWithDownload.__lastDownload || null
    });
    expect(result?.download).toContain('.csv');
  });
});
