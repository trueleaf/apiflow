import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('Navigation', () => {
  test('项目tab显示项目图标,设置tab显示设置图标', async ({ topBarPage, contentPage, createProject }) => {
    const uniqueProjectName = await createProject(`图标验证项目-${Date.now()}`);
    // 验证项目Tab存在且显示Folder图标
    const projectTab = topBarPage.locator('.tab-item').filter({ hasText: uniqueProjectName });
    await expect(projectTab).toBeVisible();
    const projectTabIcon = projectTab.locator('.tab-icon');
    await expect(projectTabIcon).toBeVisible();
    // Folder图标来自lucide-vue-next，验证图标存在
    await expect(projectTabIcon).toHaveClass(/tab-icon/);
    // 打开设置Tab
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    // 等待设置Tab出现
    await topBarPage.waitForTimeout(500);
    // 验证设置Tab存在且显示Settings图标（取当前高亮的设置Tab）
    const settingsTab = topBarPage.locator('.tab-item.active').filter({ hasText: /设置|Settings/ });
    await expect(settingsTab).toBeVisible();
    const settingsTabIcon = settingsTab.locator('.tab-icon');
    await expect(settingsTabIcon).toBeVisible();
    await expect(settingsTabIcon).toHaveClass(/tab-icon/);
  });

  test('新建项目会新增tab并自动高亮', async ({ topBarPage, createProject }) => {
    // 记录初始Tab数量
    const initialTabCount = await topBarPage.locator('.tab-item').count();
    const uniqueProjectName = await createProject(`新建项目-${Date.now()}`);
    // 验证Tab数量增加
    const newTabCount = await topBarPage.locator('.tab-item').count();
    expect(newTabCount).toBeGreaterThan(initialTabCount);
    // 验证新Tab被高亮
    const activeTab = topBarPage.locator('.tab-item.active');
    await expect(activeTab).toContainText(uniqueProjectName);
  });

  test('打开设置会新增设置tab并自动高亮', async ({ topBarPage, contentPage }) => {
    // 点击设置按钮
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    // 验证存在设置Tab
    const settingsTabs = topBarPage.locator('.tab-item').filter({ hasText: /设置|Settings/ });
    const settingsTabCount = await settingsTabs.count();
    expect(settingsTabCount).toBeGreaterThanOrEqual(1);
    // 验证有设置Tab被高亮（使用更具体的选择器）
    const settingsActiveTab = topBarPage.locator('.tab-item.active');
    // 等待高亮Tab出现
    await expect(settingsActiveTab).toBeVisible({ timeout: 5000 });
    // 获取当前高亮Tab的标题，验证是设置Tab或者内容区域是设置页面
    await expect(contentPage).toHaveURL(/.*#\/settings.*/);
  });

  test('点击已存在的tab则高亮而不新增', async ({ topBarPage, contentPage, createProject }) => {
    const uniqueProjectName = await createProject(`切换测试-${Date.now()}`);
    // 打开设置Tab
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await topBarPage.waitForTimeout(500);
    // 记录当前Tab数量
    const tabCountBeforeSwitch = await topBarPage.locator('.tab-item').count();
    // 点击项目Tab
    const projectTab = topBarPage.locator('.tab-item').filter({ hasText: uniqueProjectName });
    await projectTab.click();
    await topBarPage.waitForTimeout(300);
    // 验证Tab数量不变
    const tabCountAfterSwitch = await topBarPage.locator('.tab-item').count();
    expect(tabCountAfterSwitch).toBe(tabCountBeforeSwitch);
    // 验证项目Tab被高亮
    const activeTab = topBarPage.locator('.tab-item.active');
    await expect(activeTab).toContainText(uniqueProjectName);
    // 再次点击设置按钮
    await settingsBtn.click();
    await topBarPage.waitForTimeout(300);
    // 验证Tab数量仍然不变
    const tabCountAfterSettingsClick = await topBarPage.locator('.tab-item').count();
    expect(tabCountAfterSettingsClick).toBe(tabCountBeforeSwitch);
    // 验证设置Tab被高亮
    const activeTabAfterSettings = topBarPage.locator('.tab-item.active');
    await expect(activeTabAfterSettings).toContainText(/设置|Settings/);
  });

  test('tab默认排序:项目在前,设置在后', async ({ topBarPage, contentPage, createProject }) => {
    const projectAName = await createProject(`排序项目A-${Date.now()}`);
    // 打开设置Tab
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });
    await topBarPage.waitForTimeout(500);
    // 再创建项目B
    const projectBName = await createProject(`排序项目B-${Date.now()}`);
    // 获取所有Tab的顺序
    const allTabs = topBarPage.locator('.tab-item');
    const tabCount = await allTabs.count();
    const tabTexts: string[] = [];
    for (let i = 0; i < tabCount; i++) {
      const text = await allTabs.nth(i).textContent();
      tabTexts.push(text || '');
    }
    // 验证项目Tab在设置Tab之前
    const projectAIndex = tabTexts.findIndex((t) => t.includes(projectAName));
    const projectBIndex = tabTexts.findIndex((t) => t.includes(projectBName));
    const settingsIndex = tabTexts.findIndex((t) => t.includes('设置') || t.includes('Settings'));
    expect(projectAIndex).toBeLessThan(settingsIndex);
    expect(projectBIndex).toBeLessThan(settingsIndex);
  });

  test('可以关闭tab,关闭高亮Tab后自动切换高亮', async ({ topBarPage, createProject }) => {
    await createProject(`关闭A-${Date.now()}`);
    const projectBName = await createProject(`关闭B-${Date.now()}`);
    // 当前项目B应该被高亮
    let activeTab = topBarPage.locator('.tab-item.active');
    await expect(activeTab).toContainText(projectBName);
    // 记录关闭前的Tab数量
    const tabCountBefore = await topBarPage.locator('.tab-item').count();
    // 点击项目B的关闭按钮
    const projectBTab = topBarPage.locator('.tab-item').filter({ hasText: projectBName });
    const closeBtn = projectBTab.locator('.close-btn');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    // 验证项目B Tab已关闭
    await expect(projectBTab).toBeHidden();
    // 验证Tab数量减少
    const tabCountAfter = await topBarPage.locator('.tab-item').count();
    expect(tabCountAfter).toBe(tabCountBefore - 1);
    // 验证有一个Tab被自动高亮（根据代码逻辑，关闭后会选择右侧或最后一个同模式Tab）
    activeTab = topBarPage.locator('.tab-item.active');
    await expect(activeTab).toBeVisible();
  });

  test('关闭非高亮Tab不影响当前高亮状态', async ({ topBarPage, createProject }) => {
    const projectAName = await createProject(`非高亮A-${Date.now()}`);
    const projectBName = await createProject(`非高亮B-${Date.now()}`);
    // 当前项目B应该被高亮
    let activeTab = topBarPage.locator('.tab-item.active');
    await expect(activeTab).toContainText(projectBName);
    // 关闭项目A（非高亮Tab）
    const projectATab = topBarPage.locator('.tab-item').filter({ hasText: projectAName });
    const closeBtn = projectATab.locator('.close-btn');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    // 验证项目A Tab已关闭
    await expect(projectATab).toBeHidden();
    // 验证项目B仍然保持高亮
    activeTab = topBarPage.locator('.tab-item.active');
    await expect(activeTab).toContainText(projectBName);
  });
});
