import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('UserMenu ChangePassword', () => {
  test('用户头像菜单显示修改密码选项', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await expect(userMenuBtn).toBeVisible();
    await userMenuBtn.click();
    await contentPage.waitForTimeout(300);
    const userMenu = contentPage.locator('[data-test-id="user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
    const changePasswordBtn = contentPage.locator('[data-test-id="user-menu-change-password-btn"]');
    await expect(changePasswordBtn).toBeVisible();
    const logoutBtn = contentPage.locator('[data-test-id="user-menu-logout-btn"]');
    await expect(logoutBtn).toBeVisible();
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
    await contentPage.waitForTimeout(300);
    const changePasswordBtn = contentPage.locator('[data-test-id="user-menu-change-password-btn"]');
    await expect(changePasswordBtn).toBeVisible({ timeout: 5000 });
    await changePasswordBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    const userMenu = contentPage.locator('[data-test-id="user-menu"]');
    await expect(userMenu).toBeHidden();
  });

  test('修改密码弹框显示三个密码输入框', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordBtn = contentPage.locator('[data-test-id="user-menu-change-password-btn"]');
    await changePasswordBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    const oldPasswordInput = changePasswordDialog.getByPlaceholder(/请输入原密码/);
    await expect(oldPasswordInput).toBeVisible();
    const newPasswordInput = changePasswordDialog.getByPlaceholder(/请输入新密码/);
    await expect(newPasswordInput).toBeVisible();
    const confirmPasswordInput = changePasswordDialog.getByPlaceholder(/请输入确认密码/);
    await expect(confirmPasswordInput).toBeVisible();
  });

  test('关闭修改密码弹框后可以再次打开', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordBtn = contentPage.locator('[data-test-id="user-menu-change-password-btn"]');
    await changePasswordBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    const closeBtn = changePasswordDialog.locator('.el-dialog__headerbtn');
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(changePasswordDialog).toBeHidden();
    await userMenuBtn.click();
    await contentPage.waitForTimeout(300);
    await changePasswordBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
  });

  test('修改密码表单提交后显示成功提示', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordBtn = contentPage.locator('[data-test-id="user-menu-change-password-btn"]');
    await changePasswordBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    const oldPasswordInput = changePasswordDialog.getByPlaceholder(/请输入原密码/);
    await oldPasswordInput.fill('Test1234');
    const newPasswordInput = changePasswordDialog.getByPlaceholder(/请输入新密码/);
    await newPasswordInput.fill('Test5678');
    const confirmPasswordInput = changePasswordDialog.getByPlaceholder(/请输入确认密码/);
    await confirmPasswordInput.fill('Test5678');
    const submitBtn = changePasswordDialog.locator('.el-button--primary').filter({ hasText: /确认|Confirm/ });
    await submitBtn.click();
    await contentPage.waitForTimeout(500);
    const successMessage = contentPage.locator('.el-message').filter({ hasText: /密码修改成功|Password Changed Successfully/ });
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('密码验证规则提示错误信息', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordBtn = contentPage.locator('[data-test-id="user-menu-change-password-btn"]');
    await changePasswordBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    const newPasswordInput = changePasswordDialog.getByPlaceholder(/请输入新密码/);
    await newPasswordInput.fill('12345678');
    await newPasswordInput.blur();
    await contentPage.waitForTimeout(300);
    const errorMessage = changePasswordDialog.locator('.el-form-item__error').filter({ hasText: /密码必须包含字母和数字|Password must contain both letters and numbers/ });
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
    await newPasswordInput.fill('abcd');
    await newPasswordInput.blur();
    await contentPage.waitForTimeout(300);
    const lengthError = changePasswordDialog.locator('.el-form-item__error').filter({ hasText: /密码至少8位|Password must be at least 8 characters/ });
    await expect(lengthError).toBeVisible({ timeout: 3000 });
  });

  test('确认密码不一致提示错误信息', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const userMenuBtn = topBarPage.locator('[data-testid="header-user-menu-btn"]');
    await userMenuBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordBtn = contentPage.locator('[data-test-id="user-menu-change-password-btn"]');
    await changePasswordBtn.click();
    await contentPage.waitForTimeout(300);
    const changePasswordDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改密码|Change Password/ });
    await expect(changePasswordDialog).toBeVisible({ timeout: 5000 });
    const newPasswordInput = changePasswordDialog.getByPlaceholder(/请输入新密码/);
    await newPasswordInput.fill('Test1234');
    const confirmPasswordInput = changePasswordDialog.getByPlaceholder(/请输入确认密码/);
    await confirmPasswordInput.fill('Test5678');
    await confirmPasswordInput.blur();
    await contentPage.waitForTimeout(300);
    const errorMessage = changePasswordDialog.locator('.el-form-item__error').filter({ hasText: /两次输入的密码不一致|The two passwords do not match/ });
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });
});
