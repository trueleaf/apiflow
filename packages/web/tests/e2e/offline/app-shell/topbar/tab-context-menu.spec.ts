import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('TabContextMenu', () => {
  test('右键Tab显示上下文菜单', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject(`右键菜单测试-${Date.now()}`);
    // 右键点击项目Tab
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible();
    await projectTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(300);
    // 验证contentView中显示上下文菜单
    const contextMenu = contentPage.locator('[data-test-id="header-tab-contextmenu"]');
    await expect(contextMenu).toBeVisible({ timeout: 5000 });
  });

  test('上下文菜单包含所有操作选项', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject(`菜单选项测试-${Date.now()}`);
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await projectTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('[data-test-id="header-tab-contextmenu"]');
    await expect(contextMenu).toBeVisible({ timeout: 5000 });
    // 验证菜单项存在
    await expect(contentPage.locator('[data-test-id="header-tab-contextmenu-close"]')).toBeVisible();
    await expect(contentPage.locator('[data-test-id="header-tab-contextmenu-close-other"]')).toBeVisible();
    await expect(contentPage.locator('[data-test-id="header-tab-contextmenu-close-left"]')).toBeVisible();
    await expect(contentPage.locator('[data-test-id="header-tab-contextmenu-close-right"]')).toBeVisible();
    await expect(contentPage.locator('[data-test-id="header-tab-contextmenu-close-all"]')).toBeVisible();
  });

  test('点击关闭菜单项关闭Tab', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject(`关闭测试-${Date.now()}`);
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible();
    // 右键并点击关闭
    await projectTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(300);
    const closeMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close"]');
    await closeMenuItem.click();
    await topBarPage.waitForTimeout(500);
    // 验证Tab已关闭
    await expect(projectTab).toBeHidden();
  });

  test('点击关闭其他菜单项保留当前Tab', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    // 创建三个项目
    const projectAName = await createProject(`其他A-${Date.now()}`);
    const projectBName = await createProject(`其他B-${Date.now()}`);
    const projectCName = await createProject(`其他C-${Date.now()}`);
    // 验证三个Tab都存在
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    const projectCTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    await expect(projectATab).toBeVisible();
    await expect(projectBTab).toBeVisible();
    await expect(projectCTab).toBeVisible();
    // 右键点击项目B，选择关闭其他
    await projectBTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(300);
    const closeOtherMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-other"]');
    await closeOtherMenuItem.click();
    await topBarPage.waitForTimeout(500);
    // 验证只有项目B的Tab存在
    await expect(projectBTab).toBeVisible();
    await expect(projectATab).toBeHidden();
    await expect(projectCTab).toBeHidden();
  });

  test('点击关闭左侧菜单项关闭左边所有Tab', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    // 创建三个项目
    const projectAName = await createProject(`左侧A-${Date.now()}`);
    const projectBName = await createProject(`左侧B-${Date.now()}`);
    const projectCName = await createProject(`左侧C-${Date.now()}`);
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    const projectCTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    // 右键点击项目C，选择关闭左侧
    await projectCTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(300);
    const closeLeftMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-left"]');
    await closeLeftMenuItem.click();
    await topBarPage.waitForTimeout(500);
    // 验证项目A和B已关闭，项目C保留
    await expect(projectATab).toBeHidden();
    await expect(projectBTab).toBeHidden();
    await expect(projectCTab).toBeVisible();
  });

  test('点击关闭右侧菜单项关闭右边所有Tab', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    // 创建三个项目
    const projectAName = await createProject(`右侧A-${Date.now()}`);
    const projectBName = await createProject(`右侧B-${Date.now()}`);
    const projectCName = await createProject(`右侧C-${Date.now()}`);
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    const projectCTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    // 右键点击项目A，选择关闭右侧
    await projectATab.click({ button: 'right' });
    await topBarPage.waitForTimeout(300);
    const closeRightMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-right"]');
    await closeRightMenuItem.click();
    await topBarPage.waitForTimeout(500);
    // 验证项目B和C已关闭，项目A保留
    await expect(projectATab).toBeVisible();
    await expect(projectBTab).toBeHidden();
    await expect(projectCTab).toBeHidden();
  });

  test('点击遮罩层关闭上下文菜单', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject(`遮罩测试-${Date.now()}`);
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await projectTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('[data-test-id="header-tab-contextmenu"]');
    await expect(contextMenu).toBeVisible({ timeout: 5000 });
    // 点击遮罩层
    const overlay = contentPage.locator('[data-test-id="header-tab-contextmenu-overlay"]');
    await overlay.click();
    await topBarPage.waitForTimeout(300);
    // 验证菜单已关闭
    await expect(contextMenu).toBeHidden({ timeout: 3000 });
  });

  test('右键不同Tab切换菜单位置', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    // 创建两个项目
    const projectAName = await createProject(`位置A-${Date.now()}`);
    const projectBName = await createProject(`位置B-${Date.now()}`);
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    // 右键项目A
    await projectATab.click({ button: 'right' });
    await topBarPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('[data-test-id="header-tab-contextmenu"]');
    await expect(contextMenu).toBeVisible({ timeout: 5000 });
    // 点击遮罩层关闭
    const overlay = contentPage.locator('[data-test-id="header-tab-contextmenu-overlay"]');
    await overlay.click();
    await topBarPage.waitForTimeout(300);
    // 右键项目B
    await projectBTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(300);
    // 验证菜单重新出现
    await expect(contextMenu).toBeVisible({ timeout: 5000 });
  });
});
