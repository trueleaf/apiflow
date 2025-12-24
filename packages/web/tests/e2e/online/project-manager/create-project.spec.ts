import { test, expect } from '../../../fixtures/electron-online.fixture';

test.describe('CreateProject', () => {
  test('点击顶部栏新建项目按钮打开弹窗,输入框自动聚焦', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const projectNameInput = projectDialog.locator('input').first();
    await expect(projectNameInput).toBeFocused({ timeout: 3000 });
  });

  test('点击首页内容区新建项目按钮打开弹窗,输入框自动聚焦', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const addProjectBtn = contentPage.locator('[data-testid="home-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const projectNameInput = projectDialog.locator('input').first();
    await expect(projectNameInput).toBeFocused({ timeout: 3000 });
  });

  test('不输入项目名称直接点击确定,显示必填错误提示', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const confirmBtn = projectDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    const errorMessage = projectDialog.locator('.el-form-item__error');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
    await expect(errorMessage).toContainText(/请填写项目名称/);
    await expect(projectDialog).toBeVisible();
  });

  test('输入纯空格作为项目名称,显示空格校验错误提示', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill('   ');
    await projectDialog.locator('.el-dialog__header').click();
    await contentPage.waitForTimeout(300);
    const errorMessage = projectDialog.locator('.el-form-item__error');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
    await expect(errorMessage).toContainText(/项目名称不能为空或仅包含空格/);
  });

  test('新建项目后自动跳转项目详情,顶部新增高亮Tab', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const projectName = `测试新项目-${Date.now()}`;
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill(projectName);
    const confirmBtn = projectDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await expect(projectDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    const url = contentPage.url();
    expect(url).toContain('mode=edit');
    const activeTab = topBarPage.locator('.tab-item.active');
    await expect(activeTab).toBeVisible({ timeout: 3000 });
    await expect(activeTab).toContainText(projectName);
  });

  test('新建项目后返回首页,新项目排在全部项目列表第一位', async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await contentPage.reload();
    await contentPage.waitForTimeout(500);
    const projectName = `排序测试项目-${Date.now()}`;
    const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
    await addProjectBtn.click();
    const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
    await expect(projectDialog).toBeVisible({ timeout: 5000 });
    const projectNameInput = projectDialog.locator('input').first();
    await projectNameInput.fill(projectName);
    const confirmBtn = projectDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await expect(projectDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const firstProjectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(firstProjectCard).toBeVisible({ timeout: 5000 });
    await expect(firstProjectCard).toContainText(projectName);
  });
});
