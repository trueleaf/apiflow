import type { Page } from '@playwright/test';
import { expect } from './electron-online.fixture';

// 获取指定后台管理 tab 的内容面板
const getAdminTabPanelByName = (contentPage: Page, tabName: string) => {
  return contentPage.getByRole('tabpanel', { name: new RegExp(tabName) }).first();
};
// 获取当前选中的后台管理 tab 的内容面板
const getActiveAdminTabPanel = async (contentPage: Page) => {
  const activeTab = contentPage.getByRole('tab', { selected: true }).first();
  const panelId = await activeTab.getAttribute('aria-controls');
  if (!panelId) {
    throw new Error('无法获取当前后台管理 tabpanel');
  }
  return contentPage.locator(`#${panelId}`);
};
// 进入后台管理页面
export const navigateToAdmin = async (topBarPage: Page, contentPage: Page) => {
  const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
  await adminBtn.click();
  await contentPage.waitForURL(/.*#\/admin.*/, { timeout: 15000 });
  const permissionWrap = contentPage.locator('.s-permission');
  await expect(permissionWrap).toBeVisible({ timeout: 15000 });
  const tabs = permissionWrap.locator('.el-tabs');
  const tabsVisible = await tabs.isVisible({ timeout: 1000 }).catch(() => false);
  if (!tabsVisible) {
    // 展开“更多管理”，展示完整后台管理 tabs
    const expandBtn = permissionWrap.locator('.el-button').filter({ hasText: /更多管理|More/i }).first();
    const expandVisible = await expandBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (expandVisible) {
      await expandBtn.click();
      await expect(tabs).toBeVisible({ timeout: 10000 });
    }
  }
};
// 切换后台管理tab
export const switchAdminTab = async (contentPage: Page, tabName: string) => {
  const tab = contentPage.getByRole('tab', { name: new RegExp(tabName) }).first();
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });
};
// 等待用户列表加载完成
export const waitForUserListLoaded = async (contentPage: Page) => {
  const panel = getAdminTabPanelByName(contentPage, '用户管理|User');
  const userTable = panel.locator('.el-table').first();
  await expect(userTable).toBeVisible({ timeout: 10000 });
  await contentPage.waitForTimeout(500);
};
// 等待角色列表加载完成
export const waitForRoleListLoaded = async (contentPage: Page) => {
  const panel = getAdminTabPanelByName(contentPage, '角色管理|Role');
  const roleTable = panel.locator('.el-table').first();
  await expect(roleTable).toBeVisible({ timeout: 10000 });
  await contentPage.waitForTimeout(500);
};
// 等待路由列表加载完成
export const waitForRouteListLoaded = async (contentPage: Page) => {
  const panel = getAdminTabPanelByName(contentPage, '服务端路由|Route');
  const routeTable = panel.locator('.el-table').first();
  await expect(routeTable).toBeVisible({ timeout: 10000 });
  await contentPage.waitForTimeout(500);
};
// 获取表格行数
export const getTableRowCount = async (contentPage: Page) => {
  const panel = await getActiveAdminTabPanel(contentPage);
  const rows = panel.locator('.el-table__body tbody tr');
  return await rows.count();
};
// 根据用户名查找用户行
export const findUserRowByName = (contentPage: Page, loginName: string) => {
  const panel = getAdminTabPanelByName(contentPage, '用户管理|User');
  return panel.locator('.el-table__row').filter({ hasText: loginName });
};
// 根据角色名查找角色行
export const findRoleRowByName = (contentPage: Page, roleName: string) => {
  const panel = getAdminTabPanelByName(contentPage, '角色管理|Role');
  return panel.locator('.el-table__row').filter({ hasText: roleName });
};
// 根据路由名查找路由行
export const findRouteRowByName = (contentPage: Page, routeName: string) => {
  const panel = getAdminTabPanelByName(contentPage, '服务端路由|Route');
  return panel.locator('.el-table__row').filter({ hasText: routeName });
};
// 点击表格行的操作按钮
export const clickRowAction = async (row: ReturnType<Page['locator']>, actionText: string) => {
  const actionBtn = row.locator('.el-button').filter({ hasText: new RegExp(actionText) });
  await actionBtn.click();
};
// 填写对话框表单
export const fillDialogForm = async (contentPage: Page, fields: Record<string, string>) => {
  const dialog = contentPage.locator('.el-dialog:visible').filter({ has: contentPage.locator('.el-form') }).first();
  await expect(dialog).toBeVisible({ timeout: 5000 });
  for (const [label, value] of Object.entries(fields)) {
    const formItem = dialog.locator('.el-form-item').filter({ hasText: new RegExp(label) });
    const input = formItem.locator('input, textarea').first();
    await input.fill(value);
  }
};
// 确认对话框
export const confirmDialog = async (contentPage: Page) => {
  const dialog = contentPage.locator('.el-dialog:visible').first();
  const confirmBtn = dialog.locator('.el-button--primary').last();
  await confirmBtn.click();
  await expect(dialog).toBeHidden({ timeout: 5000 });
  await contentPage.waitForTimeout(500);
};
// 取消对话框
export const cancelDialog = async (contentPage: Page) => {
  const dialog = contentPage.locator('.el-dialog:visible').first();
  const cancelBtn = dialog.locator('.el-button').filter({ hasText: /取消|Cancel/ });
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
  await contentPage.waitForTimeout(200);
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
  await contentPage.waitForTimeout(200);
};
// 搜索用户
export const searchUser = async (contentPage: Page, searchText: string) => {
  const searchInput = contentPage.locator('input[placeholder*="请输入登录名称"], input[placeholder*="登录名称"], input[placeholder*="请输入用户名搜索"], input[placeholder*="搜索"]').first();
  await searchInput.fill(searchText);
  const searchBtn = contentPage.locator('.el-button').filter({ hasText: /搜索/ }).first();
  await expect(searchBtn).toBeVisible({ timeout: 5000 });
  await searchBtn.click();
  await contentPage.waitForTimeout(200);
};
// 清空搜索
export const clearSearch = async (contentPage: Page) => {
  const searchInput = contentPage.locator('input[placeholder*="请输入登录名称"], input[placeholder*="登录名称"], input[placeholder*="请输入用户名搜索"], input[placeholder*="搜索"]').first();
  await searchInput.clear();
  const resetBtn = contentPage.locator('.el-button').filter({ hasText: /重置/ }).first();
  const resetVisible = await resetBtn.isVisible({ timeout: 1000 }).catch(() => false);
  if (resetVisible) {
    await resetBtn.click();
  } else {
    const searchBtn = contentPage.locator('.el-button').filter({ hasText: /搜索/ }).first();
    await expect(searchBtn).toBeVisible({ timeout: 5000 });
    await searchBtn.click();
  }
  await contentPage.waitForTimeout(200);
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
  const message = contentPage.locator('.el-message--error');
  await expect(message).toBeVisible({ timeout: 5000 });
  if (messageText) {
    await expect(message).toContainText(messageText);
  }
};
