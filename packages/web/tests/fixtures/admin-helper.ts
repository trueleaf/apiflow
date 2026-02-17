import type { Locator, Page } from '@playwright/test';
import { expect } from './electron-online.fixture';

const getSettingsContentArea = (contentPage: Page) => {
  return contentPage.locator('.settings .content-area');
};

const getAdminMenuItem = (contentPage: Page, action: 'admin-user' | 'admin-role' | 'admin-client-routes' | 'admin-server-routes' | 'admin-system-config') => {
  return contentPage.locator(`[data-testid="settings-menu-${action}"]`).first();
};

const getAdminActionByName = (tabName: string): 'admin-user' | 'admin-role' | 'admin-client-routes' | 'admin-server-routes' | 'admin-system-config' => {
  if (/用户管理|User/i.test(tabName)) return 'admin-user';
  if (/角色管理|Role/i.test(tabName)) return 'admin-role';
  if (/客户端路由|Client/i.test(tabName)) return 'admin-client-routes';
  if (/服务端路由|Server|Route/i.test(tabName)) return 'admin-server-routes';
  if (/系统配置|System/i.test(tabName)) return 'admin-system-config';
  throw new Error(`未知后台菜单名称: ${tabName}`);
};

// 打开设置页面
export const openSettings = async (topBarPage: Page, contentPage: Page) => {
  const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
  await expect(settingsBtn).toBeVisible({ timeout: 10000 });
  await settingsBtn.click();
  await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 15000 });
};

// 判断当前账号是否可访问系统管理菜单
export const hasAdminMenu = async (contentPage: Page) => {
  const adminMenu = getAdminMenuItem(contentPage, 'admin-user');
  return await adminMenu.isVisible({ timeout: 1500 }).catch(() => false);
};

// 进入后台管理页面
export const navigateToAdmin = async (topBarPage: Page, contentPage: Page) => {
  await openSettings(topBarPage, contentPage);
  const canAccessAdmin = await hasAdminMenu(contentPage);
  if (!canAccessAdmin) {
    throw new Error('当前账号不是管理员，无法进入系统管理');
  }
  await switchAdminTab(contentPage, '用户管理');
};

// 切换后台管理菜单
export const switchAdminTab = async (contentPage: Page, tabName: string) => {
  const action = getAdminActionByName(tabName);
  const menuItem = getAdminMenuItem(contentPage, action);
  await expect(menuItem).toBeVisible({ timeout: 10000 });
  await menuItem.click();
  await expect(menuItem).toHaveClass(/active/, { timeout: 10000 });
};

// 等待用户列表加载完成
export const waitForUserListLoaded = async (contentPage: Page) => {
  const userTable = getSettingsContentArea(contentPage).locator('.el-table').first();
  await expect(userTable).toBeVisible({ timeout: 10000 });
};

// 等待角色列表加载完成
export const waitForRoleListLoaded = async (contentPage: Page) => {
  const roleTable = getSettingsContentArea(contentPage).locator('.el-table').first();
  await expect(roleTable).toBeVisible({ timeout: 10000 });
};

// 等待路由列表加载完成
export const waitForRouteListLoaded = async (contentPage: Page) => {
  const routeTable = getSettingsContentArea(contentPage).locator('.el-table').first();
  await expect(routeTable).toBeVisible({ timeout: 10000 });
};

// 获取表格行数
export const getTableRowCount = async (contentPage: Page) => {
  const rows = getSettingsContentArea(contentPage).locator('.el-table__body tbody tr');
  return await rows.count();
};

// 根据用户名查找用户行
export const findUserRowByName = (contentPage: Page, loginName: string) => {
  return getSettingsContentArea(contentPage).locator('.el-table__row').filter({ hasText: loginName });
};

// 根据角色名查找角色行
export const findRoleRowByName = (contentPage: Page, roleName: string) => {
  return getSettingsContentArea(contentPage).locator('.el-table__row').filter({ hasText: roleName });
};

// 根据路由名查找路由行
export const findRouteRowByName = (contentPage: Page, routeName: string) => {
  return getSettingsContentArea(contentPage).locator('.el-table__row').filter({ hasText: routeName });
};

// 点击表格行的操作按钮
export const clickRowAction = async (row: Locator, actionText: string) => {
  const actionBtn = row.locator('.el-button').filter({ hasText: new RegExp(actionText) }).first();
  await expect(actionBtn).toBeVisible({ timeout: 5000 });
  await actionBtn.click();
};

// 填写对话框表单
export const fillDialogForm = async (contentPage: Page, fields: Record<string, string>) => {
  const dialog = contentPage.locator('.el-dialog:visible').filter({ has: contentPage.locator('.el-form') }).first();
  await expect(dialog).toBeVisible({ timeout: 5000 });
  for (const [label, value] of Object.entries(fields)) {
    const formItem = dialog.locator('.el-form-item').filter({ hasText: new RegExp(label) });
    const input = formItem.locator('input, textarea').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(value);
  }
};

// 确认对话框
export const confirmDialog = async (contentPage: Page) => {
  const dialog = contentPage.locator('.el-dialog:visible').first();
  const confirmBtn = dialog.locator('.el-button--primary').last();
  await confirmBtn.click();
  await expect(dialog).toBeHidden({ timeout: 10000 });
};

// 取消对话框
export const cancelDialog = async (contentPage: Page) => {
  const dialog = contentPage.locator('.el-dialog:visible').first();
  const cancelBtn = dialog.locator('.el-button').filter({ hasText: /取消|Cancel/ }).first();
  await cancelBtn.click();
  await expect(dialog).toBeHidden({ timeout: 5000 });
};

// 确认删除对话框
export const confirmDeleteDialog = async (contentPage: Page) => {
  const clConfirm = contentPage.locator('.cl-confirm-wrapper').first();
  const messageBox = contentPage.locator('.el-message-box').first();
  const confirmType = await Promise.race([
    clConfirm.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'cl-confirm' as const).catch(() => null),
    messageBox.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'message-box' as const).catch(() => null),
  ]) as 'cl-confirm' | 'message-box' | null;
  if (!confirmType) {
    throw new Error('未找到删除确认弹窗');
  }
  const container = confirmType === 'cl-confirm' ? clConfirm : messageBox;
  const confirmBtn = container.locator('.el-button--primary').first();
  await expect(confirmBtn).toBeVisible({ timeout: 5000 });
  await confirmBtn.click();
  if (confirmType === 'cl-confirm') {
    await expect(clConfirm).toBeHidden({ timeout: 5000 });
  } else {
    await expect(messageBox).toBeHidden({ timeout: 5000 });
  }
};

// 取消删除确认弹窗
export const cancelDeleteDialog = async (contentPage: Page) => {
  const clConfirm = contentPage.locator('.cl-confirm-wrapper').first();
  const messageBox = contentPage.locator('.el-message-box').first();
  const confirmType = await Promise.race([
    clConfirm.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'cl-confirm' as const).catch(() => null),
    messageBox.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'message-box' as const).catch(() => null),
  ]) as 'cl-confirm' | 'message-box' | null;
  if (!confirmType) {
    throw new Error('未找到删除确认弹窗');
  }
  const container = confirmType === 'cl-confirm' ? clConfirm : messageBox;
  const cancelBtn = container.locator('.el-button').filter({ hasText: /取消|Cancel/i }).first();
  await expect(cancelBtn).toBeVisible({ timeout: 5000 });
  await cancelBtn.click();
  if (confirmType === 'cl-confirm') {
    await expect(clConfirm).toBeHidden({ timeout: 5000 });
  } else {
    await expect(messageBox).toBeHidden({ timeout: 5000 });
  }
};

// 搜索用户
export const searchUser = async (contentPage: Page, searchText: string) => {
  const searchInput = contentPage.locator('input[placeholder*="请输入登录名称"], input[placeholder*="登录名称"], input[placeholder*="请输入用户名搜索"], input[placeholder*="搜索"]').first();
  await searchInput.fill(searchText);
  const searchBtn = getSettingsContentArea(contentPage).locator('.el-button').filter({ hasText: /搜索/ }).first();
  await expect(searchBtn).toBeVisible({ timeout: 5000 });
  await searchBtn.click();
};

// 清空搜索
export const clearSearch = async (contentPage: Page) => {
  const searchInput = contentPage.locator('input[placeholder*="请输入登录名称"], input[placeholder*="登录名称"], input[placeholder*="请输入用户名搜索"], input[placeholder*="搜索"]').first();
  await searchInput.clear();
  const resetBtn = getSettingsContentArea(contentPage).locator('.el-button').filter({ hasText: /重置/ }).first();
  const resetVisible = await resetBtn.isVisible({ timeout: 1000 }).catch(() => false);
  if (resetVisible) {
    await resetBtn.click();
    return;
  }
  const searchBtn = getSettingsContentArea(contentPage).locator('.el-button').filter({ hasText: /搜索/ }).first();
  await expect(searchBtn).toBeVisible({ timeout: 5000 });
  await searchBtn.click();
};

// 验证成功提示消息
export const expectSuccessMessage = async (contentPage: Page, messageText?: string) => {
  const successMessage = contentPage.locator('.el-message--success').first();
  const successNotification = contentPage.locator('.el-notification--success').first();
  const errorMessage = contentPage.locator('.el-message--error').first();
  const errorNotification = contentPage.locator('.el-notification--error').first();
  const warningMessage = contentPage.locator('.el-message--warning').first();
  const messageType = await Promise.race([
    successMessage.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'success' as const).catch(() => null),
    successNotification.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'success' as const).catch(() => null),
    errorMessage.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'error' as const).catch(() => null),
    errorNotification.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'error' as const).catch(() => null),
    warningMessage.waitFor({ state: 'visible', timeout: 5000 }).then(() => 'warning' as const).catch(() => null),
  ]) as 'success' | 'error' | 'warning' | null;
  if (messageType === 'error' || messageType === 'warning') {
    const errorToast = contentPage.locator('.el-message--error, .el-message--warning, .el-notification--error').first();
    throw new Error(`检测到失败提示：${(await errorToast.textContent()) || ''}`);
  }
  if (messageType === 'success' && messageText) {
    const successToast = contentPage.locator('.el-message--success, .el-notification--success').first();
    await expect(successToast).toContainText(messageText);
  }
};

// 验证错误提示消息
export const expectErrorMessage = async (contentPage: Page, messageText?: string) => {
  const message = contentPage.locator('.el-message--error').first();
  await expect(message).toBeVisible({ timeout: 5000 });
  if (messageText) {
    await expect(message).toContainText(messageText);
  }
};
