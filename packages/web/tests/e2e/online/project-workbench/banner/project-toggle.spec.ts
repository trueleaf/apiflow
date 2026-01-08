import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('ProjectToggle', () => {
  // 测试用例1: 显示当前项目名称
  test('显示当前项目名称', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证Tool.vue中h2元素显示项目名称
    const projectName = contentPage.locator('.tool h2');
    await expect(projectName).toBeVisible({ timeout: 5000 });
    // 验证项目名称不为空
    const text = await projectName.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  // 测试用例2: 点击切换按钮弹出项目面板
  test('点击切换按钮弹出项目面板', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 点击切换项目按钮
    const toggleBtn = contentPage.locator('[data-testid="banner-toggle-project-btn"]');
    await expect(toggleBtn).toBeVisible({ timeout: 5000 });
    await toggleBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证el-popover弹出层显示
    const popover = contentPage.locator('.el-popover').filter({ has: contentPage.locator('.tool-toggle-project') });
    await expect(popover).toBeVisible({ timeout: 5000 });
  });

  // 测试用例3: 项目面板显示项目列表标题
  test('项目面板显示项目列表标题', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 点击切换项目按钮
    const toggleBtn = contentPage.locator('[data-testid="banner-toggle-project-btn"]');
    await toggleBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证弹出层中显示"项目列表"标题
    const projectListTitle = contentPage.locator('.tool-toggle-project h3').filter({ hasText: /项目列表/ });
    await expect(projectListTitle).toBeVisible({ timeout: 5000 });
  });

  // 测试用例4: 项目面板显示项目列表
  test('项目面板显示项目列表', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 点击切换项目按钮
    const toggleBtn = contentPage.locator('[data-testid="banner-toggle-project-btn"]');
    await toggleBtn.click();
    await contentPage.waitForTimeout(300);
    const popover = contentPage.locator('.el-popover').filter({ has: contentPage.locator('.tool-toggle-project') });
    await expect(popover).toBeVisible({ timeout: 5000 });
    // 验证项目列表区域存在
    const projectWrap = popover.locator('.project-wrap:visible').first();
    await expect(projectWrap).toBeVisible({ timeout: 5000 });
    // 验证项目列表中有项目项
    const projectItems = projectWrap.locator('.item');
    const count = await projectItems.count();
    expect(count).toBeGreaterThan(0);
  });

  // 测试用例5: 项目项显示项目名称和创建者
  test('项目项显示项目名称和创建者', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 点击切换项目按钮
    const toggleBtn = contentPage.locator('[data-testid="banner-toggle-project-btn"]');
    await toggleBtn.click();
    await contentPage.waitForTimeout(300);
    const popover = contentPage.locator('.el-popover').filter({ has: contentPage.locator('.tool-toggle-project') });
    await expect(popover).toBeVisible({ timeout: 5000 });
    // 验证项目项包含项目名称
    const firstItem = popover.locator('.project-wrap .item').first();
    const itemTitle = firstItem.locator('.item-title');
    await expect(itemTitle).toBeVisible({ timeout: 5000 });
    // 验证项目项包含创建者名称
    const itemContent = firstItem.locator('.item-content');
    await expect(itemContent).toBeVisible({ timeout: 5000 });
  });

  // 测试用例6: 点击外部区域关闭项目面板
  test('点击外部区域关闭项目面板', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 点击切换项目按钮打开面板
    const toggleBtn = contentPage.locator('[data-testid="banner-toggle-project-btn"]');
    await toggleBtn.click();
    await contentPage.waitForTimeout(300);
    const popover = contentPage.locator('.el-popover').filter({ has: contentPage.locator('.tool-toggle-project') });
    await expect(popover).toBeVisible({ timeout: 5000 });
    // 点击外部区域关闭面板
    await contentPage.locator('body').click({ position: { x: 800, y: 100 } });
    await contentPage.waitForTimeout(300);
    // 验证面板关闭
    await expect(popover).toBeHidden({ timeout: 5000 });
  });

  // 测试用例7: 点击项目触发切换
  test('点击项目触发切换', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 点击切换项目按钮
    const toggleBtn = contentPage.locator('[data-testid="banner-toggle-project-btn"]');
    await toggleBtn.click();
    await contentPage.waitForTimeout(300);
    const popover = contentPage.locator('.el-popover').filter({ has: contentPage.locator('.tool-toggle-project') });
    await expect(popover).toBeVisible({ timeout: 5000 });
    // 点击第一个项目
    const firstItem = popover.locator('.project-wrap .item').first();
    await expect(firstItem).toBeVisible({ timeout: 5000 });
    await firstItem.click();
    await contentPage.waitForTimeout(500);
    // 验证点击后面板关闭(项目切换后面板应自动关闭)
    await expect(popover).toBeHidden({ timeout: 5000 });
  });
});

