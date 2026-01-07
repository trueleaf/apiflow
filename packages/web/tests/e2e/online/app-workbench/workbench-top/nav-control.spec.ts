import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('NavControl', () => {

  test('前进后退按钮按历史栈导航', async ({ topBarPage, contentPage, createProject, loginAccount, jumpToSettings }) => {
    await loginAccount();
    // 创建三个项目
    const projectAName = await createProject(`项目A-${Date.now()}`);
    await createProject(`项目B-${Date.now()}`);
    await createProject(`项目C-${Date.now()}`);
    // 当前在项目C，切换到项目A
    const projectATab = topBarPage.locator('.tab-item').filter({ hasText: projectAName });
    await projectATab.click();
    await topBarPage.waitForTimeout(300);
    await expect(projectATab).toHaveClass(/active/);
    await jumpToSettings();
    const settingsTab = topBarPage.locator('.tab-item[data-id="settings-online"]');
    await expect(settingsTab).toHaveClass(/active/);
    // 导航历史栈现在是: 项目C -> 项目A -> 设置
    // 点击后退按钮，应回到项目A
    const backBtn = topBarPage.locator('[data-testid="header-back-btn"]');      
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await topBarPage.waitForTimeout(500);
    // 验证回到项目A（URL 包含 apidoc/doc-edit）
    await expect(projectATab).toHaveClass(/active/);
    await expect(contentPage).toHaveURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 点击前进按钮，应回到设置页面
    const forwardBtn = topBarPage.locator('[data-testid="header-forward-btn"]');
    await expect(forwardBtn).toBeVisible();
    await forwardBtn.click();
    await contentPage.waitForURL(/.*?#?\/settings/, { timeout: 5000 });
    // 等待 Tab 高亮状态同步
    await topBarPage.waitForTimeout(500);
    // 验证回到设置页面
    await expect(settingsTab).toBeVisible();
    await expect(settingsTab).toHaveClass(/active/);
  });

  test('多次后退和前进验证完整历史栈', async ({ topBarPage, contentPage, createProject, loginAccount, jumpToSettings }) => {
    await loginAccount();
    // 创建三个项目
    const projectAName = await createProject(`历史A-${Date.now()}`);
    const projectBName = await createProject(`历史B-${Date.now()}`);
    const projectCName = await createProject(`历史C-${Date.now()}`);
    // 切换到项目A
    const projectATab = topBarPage.locator('.tab-item').filter({ hasText: projectAName });
    await projectATab.click();
    await topBarPage.waitForTimeout(300);
    await jumpToSettings();
    const settingsTab = topBarPage.locator('.tab-item[data-id="settings-online"]');
    await expect(settingsTab).toHaveClass(/active/);
    // 导航历史栈: 项目C -> 项目A -> 设置
    const backBtn = topBarPage.locator('[data-testid="header-back-btn"]');      
    const forwardBtn = topBarPage.locator('[data-testid="header-forward-btn"]');
    // 后退：设置 -> 项目A
    await backBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectATab).toHaveClass(/active/);
    // 后退：项目A -> 项目C
    await backBtn.click();
    await topBarPage.waitForTimeout(500);
    const projectCTab = topBarPage.locator('.tab-item').filter({ hasText: projectCName });
    await expect(projectCTab).toHaveClass(/active/);
    // 前进：项目C -> 项目A
    await forwardBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectATab).toHaveClass(/active/);
    // 前进：项目A -> 设置
    await forwardBtn.click();
    await contentPage.waitForURL(/.*?#?\/settings/, { timeout: 5000 });
    // 等待 Tab 高亮状态同步
    await topBarPage.waitForTimeout(500);
    await expect(settingsTab).toBeVisible();
    await expect(settingsTab).toHaveClass(/active/);
  });

  test('历史栈为空时后退到主页面', async ({ topBarPage, contentPage, clearCache, loginAccount, reload, jumpToSettings }) => {
    await clearCache();

    await loginAccount();
    await reload();
    await jumpToSettings();
    // 点击后退按钮，应回到主页面
    const backBtn = topBarPage.locator('[data-testid="header-back-btn"]');
    await backBtn.click();
    // 验证回到主页面
    await contentPage.waitForURL(/.*#\/(home)?$/, { timeout: 5000 });
  });
});
