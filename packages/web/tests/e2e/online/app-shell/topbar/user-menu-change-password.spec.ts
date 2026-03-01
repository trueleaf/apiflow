import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('UserMenu ChangePassword', () => {
  test('用户头像菜单显示修改密码选项', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await expect(userMenuBtn).toBeVisible({ timeout: 5000 });
    await userMenuBtn.click();
    // 打开用户菜单并校验修改密码项位于退出登录之前
    const userMenu = contentPage.locator('[data-test-id="user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
    const changePasswordBtn = contentPage.locator('[data-test-id="user-menu-change-password-btn"]');
    const logoutBtn = contentPage.locator('[data-test-id="user-menu-logout-btn"]');
    await expect(changePasswordBtn).toBeVisible({ timeout: 5000 });
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    const changePasswordRect = await changePasswordBtn.boundingBox();
    const logoutRect = await logoutBtn.boundingBox();
    expect(changePasswordRect).not.toBeNull();
    expect(logoutRect).not.toBeNull();
    if (changePasswordRect && logoutRect) {
      expect(changePasswordRect.y).toBeLessThan(logoutRect.y);
    }
  });
  test('点击修改密码选项打开修改密码弹框', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    const changePasswordBtn = contentPage.locator('[data-test-id="user-menu-change-password-btn"]');
    await expect(changePasswordBtn).toBeVisible({ timeout: 5000 });
    await changePasswordBtn.click();
    // 点击菜单项后弹窗出现且菜单收起
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    await expect(contentPage.locator('[data-test-id="user-menu"]')).toBeHidden({ timeout: 5000 });
  });
  test('修改密码弹框显示三个密码输入框', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    await contentPage.locator('[data-test-id="user-menu-change-password-btn"]').click();
    // 校验原密码/新密码/确认密码三个输入框齐全
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    await expect(changePasswordDialog.getByPlaceholder(/请输入原密码/)).toBeVisible({ timeout: 5000 });
    await expect(changePasswordDialog.getByPlaceholder(/请输入新密码/)).toBeVisible({ timeout: 5000 });
    await expect(changePasswordDialog.getByPlaceholder(/请输入确认密码/)).toBeVisible({ timeout: 5000 });
  });
  test('关闭修改密码弹框后可以再次打开', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    await contentPage.locator('[data-test-id="user-menu-change-password-btn"]').click();
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    await changePasswordDialog.locator('.el-dialog__headerbtn').click();
    await expect(changePasswordDialog).toBeHidden({ timeout: 5000 });
    // 关闭后再次打开应仍然可见
    await userMenuBtn.click();
    await contentPage.locator('[data-test-id="user-menu-change-password-btn"]').click();
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
  });
  test('修改密码表单提交后显示成功提示', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const currentPassword = process.env.TEST_LOGIN_PASSWORD || 'Test1234';
    const nextPassword = `Aa${Date.now()}9`;
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    await contentPage.locator('[data-test-id="user-menu-change-password-btn"]').click();
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    await changePasswordDialog.getByPlaceholder(/请输入原密码/).fill(currentPassword);
    await changePasswordDialog.getByPlaceholder(/请输入新密码/).fill(nextPassword);
    await changePasswordDialog.getByPlaceholder(/请输入确认密码/).fill(nextPassword);
    // 提交修改并等待接口返回，再校验成功提示
    const changePasswordResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/user_password'),
      { timeout: 10000 },
    );
    const submitBtn = changePasswordDialog.locator('.el-button--primary').filter({ hasText: /确定|确认|Confirm/i });
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
    await submitBtn.click();
    await changePasswordResponse;
    const successMessage = contentPage.locator('.el-message').filter({ hasText: /密码修改成功|Password Changed Successfully/ });
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    // 用新密码改回原密码，避免污染后续登录场景
    await userMenuBtn.click();
    const changePasswordBtn2 = contentPage.locator('[data-test-id="user-menu-change-password-btn"]');
    await expect(changePasswordBtn2).toBeVisible({ timeout: 5000 });
    await changePasswordBtn2.click();
    const changePasswordDialog2 = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog2).toBeVisible({ timeout: 5000 });
    await changePasswordDialog2.getByPlaceholder(/请输入原密码/).fill(nextPassword);
    await changePasswordDialog2.getByPlaceholder(/请输入新密码/).fill(currentPassword);
    await changePasswordDialog2.getByPlaceholder(/请输入确认密码/).fill(currentPassword);
    const rollbackResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/security/user_password'),
      { timeout: 10000 },
    );
    const rollbackBtn = changePasswordDialog2.locator('.el-button--primary').filter({ hasText: /确定|确认|Confirm/i });
    await expect(rollbackBtn).toBeVisible({ timeout: 5000 });
    await rollbackBtn.click();
    await rollbackResponse;
  });
  test('密码验证规则提示错误信息', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    await contentPage.locator('[data-test-id="user-menu-change-password-btn"]').click();
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    const newPasswordInput = changePasswordDialog.getByPlaceholder(/请输入新密码/);
    // 分别校验复杂度规则与最小长度规则
    await newPasswordInput.fill('12345678');
    await newPasswordInput.blur();
    const errorMessage = changePasswordDialog.locator('.el-form-item__error').first();
    await expect(errorMessage).toContainText(/密码必须包含字母和数字|Password must contain both letters and numbers/, { timeout: 3000 });
    await newPasswordInput.fill('ab123');
    await newPasswordInput.blur();
    await expect(errorMessage).toContainText(/密码至少8位|Password must be at least 8 characters/, { timeout: 3000 });
  });
  test('确认密码不一致提示错误信息', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    await contentPage.locator('[data-test-id="user-menu-change-password-btn"]').click();
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    await changePasswordDialog.getByPlaceholder(/请输入新密码/).fill('Test1234');
    const confirmPasswordInput = changePasswordDialog.getByPlaceholder(/请输入确认密码/);
    await confirmPasswordInput.fill('Test5678');
    await confirmPasswordInput.blur();
    const errorMessage = changePasswordDialog.locator('.el-form-item__error').filter({ hasText: /两次输入的密码不一致|The two passwords do not match/ });
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });
});
