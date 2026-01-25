import type { Page } from '@playwright/test';
import { expect } from './electron-online.fixture';

// 进入后台管理页面
export const navigateToAdmin = async (topBarPage: Page, contentPage: Page) => {
  const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
  await adminBtn.click();
  await contentPage.waitForURL(/.*#\/admin.*/, { timeout: 10000 });
  await expect(contentPage.locator('.s-permission')).toBeVisible({ timeout: 10000 });
};

// 切换后台管理tab
export const switchAdminTab = async (contentPage: Page, tabName: string) => {
  const tab = contentPage.locator('.el-tabs__item').filter({ hasText: new RegExp(tabName) });
  await tab.click();
  await contentPage.waitForTimeout(500);
};

// 等待用户列表加载完成
export const waitForUserListLoaded = async (contentPage: Page) => {
  const userTable = contentPage.locator('.el-table').first();
  await expect(userTable).toBeVisible({ timeout: 10000 });
  await contentPage.waitForTimeout(500);
};

// 等待角色列表加载完成
export const waitForRoleListLoaded = async (contentPage: Page) => {
  const roleTable = contentPage.locator('.el-table').first();
  await expect(roleTable).toBeVisible({ timeout: 10000 });
  await contentPage.waitForTimeout(500);
};

// 等待路由列表加载完成
export const waitForRouteListLoaded = async (contentPage: Page) => {
  const routeTable = contentPage.locator('.el-table').first();
  await expect(routeTable).toBeVisible({ timeout: 10000 });
  await contentPage.waitForTimeout(500);
};

// 获取表格行数
export const getTableRowCount = async (contentPage: Page) => {
  const rows = contentPage.locator('.el-table__body tbody tr');
  return rows.count();
};

// 根据用户名查找用户行
export const findUserRowByName = (contentPage: Page, loginName: string) => {
  return contentPage.locator('.el-table__row').filter({ hasText: loginName });
};

// 根据角色名查找角色行
export const findRoleRowByName = (contentPage: Page, roleName: string) => {
  return contentPage.locator('.el-table__row').filter({ hasText: roleName });
};

// 根据路由名查找路由行
export const findRouteRowByName = (contentPage: Page, routeName: string) => {
  return contentPage.locator('.el-table__row').filter({ hasText: routeName });
};

// 点击表格行的操作按钮
export const clickRowAction = async (row: ReturnType<Page['locator']>, actionText: string) => {
  const actionBtn = row.locator('.el-button').filter({ hasText: new RegExp(actionText) });
  await actionBtn.click();
};

// 填写对话框表单
export const fillDialogForm = async (contentPage: Page, fields: Record<string, string>) => {
  const dialog = contentPage.locator('.el-dialog').filter({ has: contentPage.locator('.el-form') }).first();
  await expect(dialog).toBeVisible({ timeout: 5000 });
  for (const [label, value] of Object.entries(fields)) {
    const formItem = dialog.locator('.el-form-item').filter({ hasText: new RegExp(label) });
    const input = formItem.locator('input, textarea').first();
    await input.fill(value);
  }
};

// 确认对话框
export const confirmDialog = async (contentPage: Page) => {
  const dialog = contentPage.locator('.el-dialog').first();
  const confirmBtn = dialog.locator('.el-button--primary').last();
  await confirmBtn.click();
  await expect(dialog).toBeHidden({ timeout: 5000 });
  await contentPage.waitForTimeout(500);
};

// 取消对话框
export const cancelDialog = async (contentPage: Page) => {
  const dialog = contentPage.locator('.el-dialog').first();
  const cancelBtn = dialog.locator('.el-button').filter({ hasText: /取消|Cancel/ });
  await cancelBtn.click();
  await expect(dialog).toBeHidden({ timeout: 5000 });
};

// 确认删除对话框
export const confirmDeleteDialog = async (contentPage: Page) => {
  const messageBox = contentPage.locator('.el-message-box');
  await expect(messageBox).toBeVisible({ timeout: 5000 });
  const confirmBtn = messageBox.locator('.el-button--primary');
  await confirmBtn.click();
  await expect(messageBox).toBeHidden({ timeout: 5000 });
  await contentPage.waitForTimeout(500);
};

// 搜索用户
export const searchUser = async (contentPage: Page, searchText: string) => {
  const searchInput = contentPage.locator('input[placeholder*="请输入用户名搜索"], input[placeholder*="搜索"]').first();
  await searchInput.fill(searchText);
  await contentPage.waitForTimeout(500);
};

// 清空搜索
export const clearSearch = async (contentPage: Page) => {
  const searchInput = contentPage.locator('input[placeholder*="请输入用户名搜索"], input[placeholder*="搜索"]').first();
  await searchInput.clear();
  await contentPage.waitForTimeout(500);
};

// 验证成功提示消息
export const expectSuccessMessage = async (contentPage: Page, messageText?: string) => {
  const message = contentPage.locator('.el-message--success');
  await expect(message).toBeVisible({ timeout: 5000 });
  if (messageText) {
    await expect(message).toContainText(messageText);
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
