import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('VariableDialog', () => {
  // 测试用例1: 点击变量按钮打开变量管理页签,页签展示变量维护页面
  test('点击变量按钮打开变量管理页签', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '变量弹窗测试接口' });
    // 查找并点击变量管理按钮
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const variablePage = contentPage.locator('.s-variable');
    await expect(variablePage).toBeVisible({ timeout: 5000 });
    const confirmAddBtn2 = variablePage.locator('.left .el-button--primary').filter({ hasText: /确认添加|Add|Confirm/ }).first();
    await expect(confirmAddBtn2).toBeVisible({ timeout: 5000 });
  });
  // 测试用例2: 变量管理页签可关闭并再次打开
  test('变量管理页签可关闭并再次打开', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '弹窗拖拽测试接口' });
    // 打开变量管理弹窗
    const variableBtn = contentPage.locator('[data-testid="http-params-variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    const variableTab = contentPage.locator('[data-testid="project-nav-tab-variable"]');
    await expect(variableTab).toHaveClass(/active/, { timeout: 5000 });
    const closeBtn = variableTab.locator('[data-testid="project-nav-tab-close-btn"]').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(variableTab).toBeHidden({ timeout: 5000 });
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(variableTab).toBeVisible({ timeout: 5000 });
  });
});


