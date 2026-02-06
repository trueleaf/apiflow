import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('Navigation', () => {
  test('点击刷新按钮后Tab状态保持', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    const projectName = await createProject(`刷新测试-${Date.now()}`);
    // 验证项目Tab存在且被高亮
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible();
    await expect(projectTab).toHaveClass(/active/);
    // 记录刷新前的Tab数量
    const tabCountBefore = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    // 点击刷新按钮
    const refreshBtn = topBarPage.locator('[data-testid="header-refresh-btn"]');
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    // 等待页面刷新完成（开发模式下执行reloadIgnoringCache）
    await topBarPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForLoadState('domcontentloaded');
    // 等待Tab列表从localStorage恢复
    await topBarPage.waitForTimeout(1000);
    // 验证Tab列表恢复，项目Tab仍然存在
    const projectTabAfterRefresh = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTabAfterRefresh).toBeVisible({ timeout: 10000 });
    // 验证Tab数量保持不变
    const tabCountAfter = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    expect(tabCountAfter).toBe(tabCountBefore);
    // 验证之前高亮的Tab保持高亮状态
    await expect(projectTabAfterRefresh).toHaveClass(/active/);
  });

  test('项目tab显示项目图标,设置tab显示设置图标', async ({ topBarPage, contentPage, createProject, loginAccount, jumpToSettings }) => {
    await loginAccount();
    const uniqueProjectName = await createProject(`图标验证项目-${Date.now()}`);
    // 验证项目Tab存在且显示Folder图标
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: uniqueProjectName });
    await expect(projectTab).toBeVisible();
    const projectTabIcon = projectTab.locator('.tab-icon');
    await expect(projectTabIcon).toBeVisible();
    // Folder图标来臯lucide-vue-next，验证图标存在
    await expect(projectTabIcon).toHaveClass(/tab-icon/);
    // 打开设置Tab
    await jumpToSettings();
    // 等待设置Tab出现
    await topBarPage.waitForTimeout(500);
    // 验证设置Tab存在且显示Settings图标（取当前高亮的设置Tab）
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active').filter({ hasText: /设置|Settings/ });
    await expect(settingsTab).toBeVisible();
    const settingsTabIcon = settingsTab.locator('.tab-icon');
    await expect(settingsTabIcon).toBeVisible();
    await expect(settingsTabIcon).toHaveClass(/tab-icon/);
  });

  test('新建项目会新增tab并自动高亮', async ({ topBarPage, createProject, loginAccount }) => {
    await loginAccount();
    // 记录初始Tab数量
    const initialTabCount = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    const uniqueProjectName = await createProject(`新建项目-${Date.now()}`);
    // 验证Tab数量增加
    const newTabCount = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    expect(newTabCount).toBeGreaterThan(initialTabCount);
    // 验证新Tab被高亮
    const activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(uniqueProjectName);
  });

  test('打开设置会新增设置tab并自动高亮', async ({ topBarPage, contentPage, loginAccount, jumpToSettings }) => {
    await loginAccount();
    await jumpToSettings();
    // 等待设置Tab创建并高亮（避免点击后渲染/缓存同步延迟导致的偶发失败）
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"][data-id^="settings-"]').first();
    await expect(settingsTab).toBeVisible({ timeout: 10000 });
    await expect(settingsTab).toHaveClass(/active/, { timeout: 10000 });
    await expect(contentPage).toHaveURL(/.*#\/settings.*/);
  });

  test('点击编辑按钮打开不存在的项目tab会新增tab并高亮', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    // 首先创建一个项目
    const projectName = await createProject(`编辑按钮测试-${Date.now()}`);
    // 关闭当前项目Tab
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    const closeBtn = projectTab.locator('[data-test-id^="header-tab-close-btn-"]');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    // 验证Tab已关闭
    await expect(projectTab).toBeHidden();
    // 跳转到首页
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    const urlPromise = contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await homeBtn.click();
    await Promise.all([projectListPromise, urlPromise]);
    // 等待页面完全加载
    await topBarPage.waitForTimeout(500);
    // 等待项目列表加载 (使用 data-testid 选择器)
    await expect(contentPage.locator('[data-testid="home-project-card-0"]')).toBeVisible({ timeout: 5000 });
    // 记录当前Tab数量
    const tabCountBefore = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    // 在项目列表中找到该项目并点击编辑按钮 (使用 .project-list 类)
    const projectCard = contentPage.locator('.project-list').filter({ hasText: projectName });
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    const editBtn = projectCard.locator('[data-testid="home-project-enter-btn"]');
    await editBtn.click();
    await topBarPage.waitForTimeout(500);
    // 验证Tab数量增加了1
    const tabCountAfter = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    expect(tabCountAfter).toBe(tabCountBefore + 1);
    // 验证新Tab被高亮
    const activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(projectName);
  });

  test('点击已存在的tab高亮而不新增', async ({ topBarPage, contentPage, createProject, loginAccount, jumpToSettings }) => {
    await loginAccount();
    const uniqueProjectName = await createProject(`切换测试-${Date.now()}`);
    await jumpToSettings();
    await topBarPage.waitForTimeout(500);
    // 记录当前Tab数量
    const tabCountBeforeSwitch = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    // 点击项目Tab
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: uniqueProjectName });
    await projectTab.click();
    await topBarPage.waitForTimeout(300);
    // 验证Tab数量不变
    const tabCountAfterSwitch = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    expect(tabCountAfterSwitch).toBe(tabCountBeforeSwitch);
    // 验证项目Tab被高亮
    const activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(uniqueProjectName);
    await jumpToSettings();
    await topBarPage.waitForTimeout(300);
    // 验证Tab数量仍然不变
    const tabCountAfterSettingsClick = await topBarPage.locator('[data-test-id^="header-tab-item-"]').count();
    expect(tabCountAfterSettingsClick).toBe(tabCountBeforeSwitch);
    // 验证设置Tab被高亮
    const activeTabAfterSettings = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTabAfterSettings).toContainText(/设置|Settings/);
  });

  test('tab默认排序:项目在前,设置在后', async ({ topBarPage, contentPage, createProject, loginAccount, jumpToSettings }) => {
    await loginAccount();
    // 验证后台管理按钮存在（online模式下管理员登录）
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    const projectAName = await createProject(`排序项目A-${Date.now()}`);
    await jumpToSettings();
    await topBarPage.waitForTimeout(500);
    // 再创建项目B
    const projectBName = await createProject(`排序项目B-${Date.now()}`);
    // 获取所有Tab的顺序
    const allTabs = topBarPage.locator('[data-test-id^="header-tab-item-"]');
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
    // 验证后台管理按钮依然存在（不影响tab排序）
    await expect(adminBtn).toBeVisible();
  });

  test('可以拖拽tab改变顺序', async ({ topBarPage, contentPage, createProject, loginAccount, jumpToSettings }) => {
    await loginAccount();
    // 创建3个项目和设置tab
    const projectAName = await createProject(`拖拽A-${Date.now()}`);
    const projectBName = await createProject(`拖拽B-${Date.now()}`);
    const projectCName = await createProject(`拖拽C-${Date.now()}`);
    await jumpToSettings();
    await topBarPage.waitForTimeout(500);
    // 获取初始顺序
    const allTabs = topBarPage.locator('[data-test-id^="header-tab-item-"]');
    const initialTabTexts: string[] = [];
    const initialTabCount = await allTabs.count();
    for (let i = 0; i < initialTabCount; i++) {
      const text = await allTabs.nth(i).textContent();
      initialTabTexts.push(text || '');
    }
    // 验证初始顺序：A, B, C, 设置
    const initialAIndex = initialTabTexts.findIndex((t) => t.includes(projectAName));
    const initialBIndex = initialTabTexts.findIndex((t) => t.includes(projectBName));
    const initialCIndex = initialTabTexts.findIndex((t) => t.includes(projectCName));
    const initialSettingsIndex = initialTabTexts.findIndex((t) => t.includes('设置') || t.includes('Settings'));
    expect(initialAIndex).toBeLessThan(initialBIndex);
    expect(initialBIndex).toBeLessThan(initialCIndex);
    expect(initialCIndex).toBeLessThan(initialSettingsIndex);
    // 拖拽Tab B到Tab C之后
    const tabB = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    const tabC = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    await tabB.dragTo(tabC);
    await topBarPage.waitForTimeout(500);
    // 获取拖拽后的顺序
    const afterDragTabTexts: string[] = [];
    const afterDragTabCount = await allTabs.count();
    for (let i = 0; i < afterDragTabCount; i++) {
      const text = await allTabs.nth(i).textContent();
      afterDragTabTexts.push(text || '');
    }
    // 验证拖拽后顺序：A, C, B, 设置
    const afterAIndex = afterDragTabTexts.findIndex((t) => t.includes(projectAName));
    const afterBIndex = afterDragTabTexts.findIndex((t) => t.includes(projectBName));
    const afterCIndex = afterDragTabTexts.findIndex((t) => t.includes(projectCName));
    const afterSettingsIndex = afterDragTabTexts.findIndex((t) => t.includes('设置') || t.includes('Settings'));
    expect(afterAIndex).toBeLessThan(afterCIndex);
    expect(afterCIndex).toBeLessThan(afterBIndex);
    expect(afterBIndex).toBeLessThan(afterSettingsIndex);
    // 刷新页面验证顺序保持不变
    const refreshBtn = topBarPage.locator('[data-testid="header-refresh-btn"]');
    await refreshBtn.click();
    await topBarPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForLoadState('domcontentloaded');
    await topBarPage.waitForTimeout(1000);
    // 获取刷新后的顺序
    const afterRefreshTabTexts: string[] = [];
    const afterRefreshTabCount = await allTabs.count();
    for (let i = 0; i < afterRefreshTabCount; i++) {
      const text = await allTabs.nth(i).textContent();
      afterRefreshTabTexts.push(text || '');
    }
    // 验证刷新后顺序仍然是：A, C, B, 设置
    const refreshAIndex = afterRefreshTabTexts.findIndex((t) => t.includes(projectAName));
    const refreshBIndex = afterRefreshTabTexts.findIndex((t) => t.includes(projectBName));
    const refreshCIndex = afterRefreshTabTexts.findIndex((t) => t.includes(projectCName));
    const refreshSettingsIndex = afterRefreshTabTexts.findIndex((t) => t.includes('设置') || t.includes('Settings'));
    expect(refreshAIndex).toBeLessThan(refreshCIndex);
    expect(refreshCIndex).toBeLessThan(refreshBIndex);
    expect(refreshBIndex).toBeLessThan(refreshSettingsIndex);
  });

  test('关闭高亮Tab后自动高亮右侧Tab', async ({ topBarPage, createProject, loginAccount }) => {
    await loginAccount();
    const projectAName = await createProject(`高亮右侧A-${Date.now()}`);
    const projectBName = await createProject(`高亮右侧B-${Date.now()}`);
    const projectCName = await createProject(`高亮右侧C-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 点击项目B使其高亮
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    await projectBTab.click();
    await topBarPage.waitForTimeout(300);
    // 验证项目B被高亮
    let activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(projectBName);
    // 关闭项目B
    const closeBtn = projectBTab.locator('[data-test-id^="header-tab-close-btn-"]');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    // 验证项目B Tab已关闭
    await expect(projectBTab).toBeHidden();
    // 验证右侧Tab（项目C）被高亮
    activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(projectCName);
  });

  test('关闭最右侧高亮Tab后高亮左侧最近的Tab', async ({ topBarPage, contentPage, createProject, clearCache, loginAccount, jumpToSettings }) => {
    await clearCache();
    await loginAccount();
    const projectAName = await createProject(`最右侧A-${Date.now()}`);
    const projectBName = await createProject(`最右侧B-${Date.now()}`);
    const projectCName = await createProject(`最右侧C-${Date.now()}`);
    const projectDName = await createProject(`最右侧D-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 场景1：关闭最右侧的项目Tab
    let activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(projectDName);
    const projectDTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectDName });
    let closeBtn = projectDTab.locator('[data-test-id^="header-tab-close-btn-"]');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectDTab).toBeHidden();
    activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(projectCName);
    // 场景2：添加Settings tab到最右侧，然后关闭它
    await jumpToSettings();
    await topBarPage.waitForTimeout(500);
    activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(/设置|Settings/);
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: /设置|Settings/ });
    closeBtn = settingsTab.locator('[data-test-id^="header-tab-close-btn-"]');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(settingsTab).toBeHidden();
    activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(projectCName);
    // 场景3：激活Admin按钮，关闭最右侧的项目Tab，验证Admin保持active
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    await adminBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(contentPage).toHaveURL(/.*#\/admin/, { timeout: 5000 });
    await expect(adminBtn).toHaveClass(/active/);
    const projectCTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    closeBtn = projectCTab.locator('[data-test-id^="header-tab-close-btn-"]');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectCTab).toBeHidden();
    await expect(adminBtn).toHaveClass(/active/);
    await expect(contentPage).toHaveURL(/.*#\/admin/, { timeout: 5000 });
  });

  test('关闭非高亮Tab不影响当前高亮状态', async ({ topBarPage, contentPage, createProject, loginAccount, jumpToSettings }) => {
    await loginAccount();
    const projectAName = await createProject(`非高亮A-${Date.now()}`);
    const projectBName = await createProject(`非高亮B-${Date.now()}`);
    const projectCName = await createProject(`非高亮C-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 场景1：项目C高亮，关闭项目A
    let activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(projectCName);
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    let closeBtn = projectATab.locator('[data-test-id^="header-tab-close-btn-"]');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectATab).toBeHidden();
    activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(projectCName);
    // 场景2：切换到Settings tab高亮，关闭项目B
    await jumpToSettings();
    await topBarPage.waitForTimeout(500);
    activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(/设置|Settings/);
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    closeBtn = projectBTab.locator('[data-test-id^="header-tab-close-btn-"]');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectBTab).toBeHidden();
    activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(/设置|Settings/);
    // 场景3：切换到项目C高亮，关闭Settings tab
    const projectCTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    await projectCTab.click();
    await topBarPage.waitForTimeout(300);
    activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(projectCName);
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: /设置|Settings/ });
    closeBtn = settingsTab.locator('[data-test-id^="header-tab-close-btn-"]');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(settingsTab).toBeHidden();
    activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).toContainText(projectCName);
    // 场景4：激活Admin按钮，关闭项目C tab，验证Admin保持active
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    await adminBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(contentPage).toHaveURL(/.*#\/admin/, { timeout: 5000 });
    await expect(adminBtn).toHaveClass(/active/);
    closeBtn = projectCTab.locator('[data-test-id^="header-tab-close-btn-"]');
    await closeBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectCTab).toBeHidden();
    await expect(adminBtn).toHaveClass(/active/);
    await expect(contentPage).toHaveURL(/.*#\/admin/, { timeout: 5000 });
  });

  test('更新项目名称后tab页签名称同步更新', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    const originalName = `原名称-${Date.now()}`;
    const newName = `新名称-${Date.now()}`;
    // 创建项目
    await createProject(originalName);
    // 验证Tab显示原名称
    let projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: originalName });
    await expect(projectTab).toBeVisible();
    // 跳转到首页修改项目名称
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    const urlPromise = contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await homeBtn.click();
    await Promise.all([projectListPromise, urlPromise]);
    await topBarPage.waitForTimeout(500);
    // 等待项目列表加载
    await expect(contentPage.locator('[data-testid="home-project-card-0"]')).toBeVisible({ timeout: 5000 });
    // 找到项目卡片并点击编辑按钮（修改项目名称的按钮，不是进入编辑的按钮）
    const projectCard = contentPage.locator('.project-list').filter({ hasText: originalName });
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 悬停显示操作按钮
    await projectCard.hover();
    await topBarPage.waitForTimeout(300);
    // 点击编辑图标打开编辑对话框
    const editIconBtn = projectCard.locator('[title="编辑"], [title="Edit"]').first();
    await editIconBtn.click();
    await topBarPage.waitForTimeout(500);
    // 在编辑对话框中修改项目名称
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /修改项目|Edit Project/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const nameInput = editDialog.locator('input').first();
    await nameInput.clear();
    await nameInput.fill(newName);
    const confirmBtn = editDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await topBarPage.waitForTimeout(500);
    // 验证Tab名称已更新
    projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: newName });
    await expect(projectTab).toBeVisible({ timeout: 5000 });
    // 验证原名称的Tab不存在
    const oldTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: originalName });
    await expect(oldTab).toBeHidden();
  });

  test('删除项目后对应的tab页签关闭', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    const projectAName = await createProject(`删除测试A-${Date.now()}`);
    const projectBName = await createProject(`删除测试B-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 验证两个Tab都存在
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    await expect(projectATab).toBeVisible();
    await expect(projectBTab).toBeVisible();
    // 跳转到首页删除项目A
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    const projectListPromise = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    const urlPromise = contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await homeBtn.click();
    await Promise.all([projectListPromise, urlPromise]);
    await topBarPage.waitForTimeout(500);
    // 关闭可能的提示弹窗
    const msgBoxConfirmBtn = contentPage.locator('.cl-confirm-footer-right .el-button--primary');
    const msgBoxConfirmBtnVisible = await msgBoxConfirmBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (msgBoxConfirmBtnVisible) {
      await msgBoxConfirmBtn.click();
      await topBarPage.waitForTimeout(300);
    }
    // 等待项目列表加载
    await expect(contentPage.locator('[data-testid="home-project-card-0"]')).toBeVisible({ timeout: 5000 });
    // 找到项目A卡片
    const projectCard = contentPage.locator('.project-list').filter({ hasText: projectAName });
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 悬停显示操作按钮
    await projectCard.hover();
    await topBarPage.waitForTimeout(300);
    // 点击删除按钮
    const deleteBtn = projectCard.locator('[data-testid="home-project-delete-btn"]');
    await deleteBtn.click();
    await topBarPage.waitForTimeout(300);
    // 确认删除对话框
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const confirmBtn = confirmDialog.locator('.el-button--primary');
    await confirmBtn.click();
    await topBarPage.waitForTimeout(500);
    // 验证项目A的Tab已关闭
    await expect(projectATab).toBeHidden({ timeout: 5000 });
    // 验证项目B的Tab仍然存在
    await expect(projectBTab).toBeVisible();
  });

  test('管理员登录后显示后台管理按钮', async ({ topBarPage, loginAccount }) => {
    await loginAccount();
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    await expect(adminBtn).toContainText(/后台管理|Admin/);
  });

  test('点击后台管理按钮跳转并高亮', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    await adminBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(contentPage).toHaveURL(/.*#\/admin/, { timeout: 5000 });
    await expect(adminBtn).toHaveClass(/active/);
  });

  test('后台管理页面刷新后状态保持', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    await adminBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(contentPage).toHaveURL(/.*#\/admin/, { timeout: 5000 });
    await expect(adminBtn).toHaveClass(/active/);
    const refreshBtn = topBarPage.locator('[data-testid="header-refresh-btn"]');
    await refreshBtn.click();
    await topBarPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForLoadState('domcontentloaded');
    await topBarPage.waitForTimeout(1000);
    await expect(contentPage).toHaveURL(/.*#\/admin/, { timeout: 5000 });
    await expect(adminBtn).toHaveClass(/active/);
  });

  test('后台管理按钮与主页按钮切换', async ({ topBarPage, contentPage, loginAccount }) => {
    await loginAccount();
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    await adminBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(contentPage).toHaveURL(/.*#\/admin/, { timeout: 5000 });
    await expect(adminBtn).toHaveClass(/active/);
    await expect(homeBtn).not.toHaveClass(/active/);
    await homeBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(contentPage).toHaveURL(/.*#\/home/, { timeout: 5000 });
    await expect(homeBtn).toHaveClass(/active/);
    await expect(adminBtn).not.toHaveClass(/active/);
    await adminBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(contentPage).toHaveURL(/.*#\/admin/, { timeout: 5000 });
    await expect(adminBtn).toHaveClass(/active/);
    await expect(homeBtn).not.toHaveClass(/active/);
  });

  test('后台管理按钮与项目tab切换', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    const projectName = await createProject(`后台管理切换-${Date.now()}`);
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible();
    await expect(projectTab).toHaveClass(/active/);
    await adminBtn.click();
    await topBarPage.waitForTimeout(500);
    await expect(contentPage).toHaveURL(/.*#\/admin/, { timeout: 5000 });
    await expect(adminBtn).toHaveClass(/active/);
    await expect(projectTab).not.toHaveClass(/active/);
    await projectTab.click();
    await topBarPage.waitForTimeout(500);
    await expect(projectTab).toHaveClass(/active/);
    await expect(adminBtn).not.toHaveClass(/active/);
  });

  test('切换到离线模式后后台管理按钮消失', async ({ topBarPage, loginAccount }) => {
    await loginAccount();
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    await expect(adminBtn).toBeVisible({ timeout: 5000 });
    const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
    await expect(networkToggle).toBeVisible({ timeout: 5000 });
    await networkToggle.click();
    await topBarPage.waitForTimeout(1000);
    await expect(adminBtn).toBeHidden();
  });

  test('右键点击tab显示右键菜单', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    // 创建一个项目并验证tab存在
    const projectName = await createProject(`右键菜单-${Date.now()}`);
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible();
    // 在tab上右键点击
    await projectTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(500);
    // 验证右键菜单显示
    const contextMenu = contentPage.locator('[data-test-id="header-tab-contextmenu-overlay"]');
    await expect(contextMenu).toBeVisible();
    // 验证所有菜单项都显示
    const closeMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close"]');
    const closeLeftMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-left"]');
    const closeRightMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-right"]');
    const closeOtherMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-other"]');
    const closeAllMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: '全部关闭' });
    await expect(closeMenuItem).toBeVisible();
    await expect(closeLeftMenuItem).toBeVisible();
    await expect(closeRightMenuItem).toBeVisible();
    await expect(closeOtherMenuItem).toBeVisible();
    await expect(closeAllMenuItem).toBeVisible();
  });

  test('右键菜单关闭当前tab', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    // 创建两个项目tab
    const projectAName = await createProject(`关闭A-${Date.now()}`);
    const projectBName = await createProject(`关闭B-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 右键点击项目A的tab
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    await expect(projectATab).toBeVisible();
    await projectATab.click({ button: 'right' });
    await topBarPage.waitForTimeout(500);
    // 点击关闭菜单项
    const closeMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close"]');
    await closeMenuItem.click();
    await topBarPage.waitForTimeout(500);
    // 验证项目A的tab已关闭，项目B的tab仍然存在
    await expect(projectATab).toBeHidden();
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    await expect(projectBTab).toBeVisible();
  });

  test('右键菜单关闭左侧tab', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    // 创建三个项目tab，顺序为A、B、C
    const projectAName = await createProject(`左侧A-${Date.now()}`);
    const projectBName = await createProject(`左侧B-${Date.now()}`);
    const projectCName = await createProject(`左侧C-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 右键点击项目C的tab
    const projectCTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    await projectCTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(500);
    // 点击“关闭左侧”菜单项
    const closeLeftMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-left"]');
    await closeLeftMenuItem.click();
    await topBarPage.waitForTimeout(500);
    // 验证项目A和B的tab已关闭，项目C的tab保留
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    await expect(projectATab).toBeHidden();
    await expect(projectBTab).toBeHidden();
    await expect(projectCTab).toBeVisible();
  });

  test('右键菜单关闭右侧tab', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    // 创建三个项目tab，顺序为A、B、C
    const projectAName = await createProject(`右侧A-${Date.now()}`);
    const projectBName = await createProject(`右侧B-${Date.now()}`);
    const projectCName = await createProject(`右侧C-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 右键点击项目A的tab
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    await projectATab.click({ button: 'right' });
    await topBarPage.waitForTimeout(500);
    // 点击“关闭右侧”菜单项
    const closeRightMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-right"]');
    await closeRightMenuItem.click();
    await topBarPage.waitForTimeout(500);
    // 验证项目A的tab保留，项目B和C的tab已关闭
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    const projectCTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    await expect(projectATab).toBeVisible();
    await expect(projectBTab).toBeHidden();
    await expect(projectCTab).toBeHidden();
  });

  test('右键菜单关闭其他tab', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    // 创建三个项目tab
    const projectAName = await createProject(`其他A-${Date.now()}`);
    const projectBName = await createProject(`其他B-${Date.now()}`);
    const projectCName = await createProject(`其他C-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 右键点击项目B的tab
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    await projectBTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(500);
    // 点击“关闭其他”菜单项
    const closeOtherMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-other"]');
    await closeOtherMenuItem.click();
    await topBarPage.waitForTimeout(500);
    // 验证只有项目B的tab保留，项目A和C的tab已关闭
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    const projectCTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    await expect(projectATab).toBeHidden();
    await expect(projectBTab).toBeVisible();
    await expect(projectCTab).toBeHidden();
  });

  test('右键菜单全部关闭tab后跳转到主页', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    // 创建两个项目tab
    await createProject(`全部关闭A-${Date.now()}`);
    await createProject(`全部关闭B-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 右键点击第一个tab
    const firstTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').first();
    await firstTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(500);
    // 点击“全部关闭”菜单项
    const closeAllMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: '全部关闭' });
    await closeAllMenuItem.click();
    await topBarPage.waitForTimeout(500);
    // 验证所有tab都已关闭，并且页面跳转到主页
    const allTabs = topBarPage.locator('[data-test-id^="header-tab-item-"]');
    await expect(allTabs).toHaveCount(0);
    await expect(contentPage).toHaveURL(/.*#\/home/, { timeout: 5000 });
  });

  test('右键菜单项禁用状态正确', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    // 创建三个项目tab
    const projectAName = await createProject(`禁用A-${Date.now()}`);
    const projectBName = await createProject(`禁用B-${Date.now()}`);
    const projectCName = await createProject(`禁用C-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 右键点击第一个tab，验证"关闭左侧"菜单项被禁用
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    await projectATab.click({ button: 'right' });
    await topBarPage.waitForTimeout(500);
    const closeLeftMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-left"]');
    await expect(closeLeftMenuItem).toHaveClass(/disabled/);
    // 关闭菜单
    const contextMenuOverlay = contentPage.locator('[data-test-id="header-tab-contextmenu-overlay"]');
    await contextMenuOverlay.click();
    await topBarPage.waitForTimeout(300);
    // 右键点击最后一个tab，验证“关闭右侧”菜单项被禁用
    const projectCTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    await projectCTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(500);
    const closeRightMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-right"]');
    await expect(closeRightMenuItem).toHaveClass(/disabled/);
  });

  test('右键关闭后tab高亮状态正确', async ({ topBarPage, contentPage, createProject, loginAccount }) => {
    await loginAccount();
    // 创建三个项目tab
    const projectAName = await createProject(`高亮A-${Date.now()}`);
    const projectBName = await createProject(`高亮B-${Date.now()}`);
    const projectCName = await createProject(`高亮C-${Date.now()}`);
    await topBarPage.waitForTimeout(500);
    // 点击项目B使其高亮
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    await projectBTab.click();
    await topBarPage.waitForTimeout(300);
    await expect(projectBTab).toHaveClass(/active/);
    // 右键点击项目B，关闭右侧的tab
    await projectBTab.click({ button: 'right' });
    await topBarPage.waitForTimeout(500);
    const closeRightMenuItem = contentPage.locator('[data-test-id="header-tab-contextmenu-close-right"]');
    await closeRightMenuItem.click();
    await topBarPage.waitForTimeout(500);
    // 验证项目B保持高亮状态，项目C已关闭
    await expect(projectBTab).toHaveClass(/active/);
    const projectCTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectCName });
    await expect(projectCTab).toBeHidden();
  });
});

test.describe('项目同步', () => {
  test('删除项目后topBar移除对应Tab', async ({ topBarPage, contentPage, createProject, loginAccount, clearCache }) => {
    await clearCache();
    await loginAccount();
    // 创建两个项目
    const projectAName = await createProject(`删除测试A-${Date.now()}`);
    const projectBName = await createProject(`删除测试B-${Date.now()}`);
    // 验证两个Tab都存在
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    const projectBTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName });
    await expect(projectATab).toBeVisible();
    await expect(projectBTab).toBeVisible();
    // 切换到项目A
    await projectATab.click();
    await contentPage.waitForTimeout(300);
    await expect(projectATab).toHaveClass(/active/);
    // 在contentView中删除项目A（通过导航到首页，找到项目卡片删除）
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 等待项目列表加载
    await expect(contentPage.locator('[data-testid="home-project-card-0"]')).toBeVisible({ timeout: 5000 });
    // 找到项目A的卡片
    const projectACard = contentPage.locator('.project-list').filter({ hasText: projectAName });
    await expect(projectACard).toBeVisible({ timeout: 5000 });
    // 点击删除按钮
    const deleteBtn = projectACard.locator('[data-testid="home-project-delete-btn"]');
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    // 确认删除
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    const confirmBtn = confirmDialog.locator('.el-button--primary');
    await confirmBtn.click();
    await contentPage.waitForTimeout(1000);
    // 验证topBar中项目A的Tab已被移除
    await expect(projectATab).toBeHidden({ timeout: 5000 });
    // 验证项目B的Tab仍然存在
    await expect(projectBTab).toBeVisible();
  });

  test('重命名项目后topBar更新Tab标题', async ({ topBarPage, contentPage, createProject, loginAccount, clearCache }) => {
    await clearCache();
    await loginAccount();
    const originalName = `重命名测试-${Date.now()}`;
    await createProject(originalName);
    // 验证原始名称的Tab存在
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: originalName });
    await expect(projectTab).toBeVisible();
    // 导航到首页
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 等待项目列表加载
    await expect(contentPage.locator('[data-testid="home-project-card-0"]')).toBeVisible({ timeout: 5000 });
    // 找到项目卡片
    const projectCard = contentPage.locator('.project-list').filter({ hasText: originalName });
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 点击重命名按钮
    const renameBtn = projectCard.locator('[data-testid="home-project-rename-btn"]');
    await renameBtn.click();
    await contentPage.waitForTimeout(300);
    // 在弹窗中输入新名称
    const renameDialog = contentPage.locator('.el-dialog').filter({ hasText: /重命名项目|Rename Project/ });
    await expect(renameDialog).toBeVisible({ timeout: 3000 });
    const newName = `重命名后-${Date.now()}`;
    const nameInput = renameDialog.locator('input').first();
    await nameInput.fill('');
    await nameInput.fill(newName);
    // 确认重命名
    const confirmBtn = renameDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(1000);
    // 验证topBar中Tab标题已更新
    const updatedTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: newName });
    await expect(updatedTab).toBeVisible({ timeout: 5000 });
    // 验证旧名称的Tab不存在
    const oldTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: originalName });
    await expect(oldTab).toBeHidden();
  });

  test('项目删除后切换到其他Tab', async ({ topBarPage, contentPage, createProject, loginAccount, clearCache }) => {
    await clearCache();
    await loginAccount();
    // 创建两个项目
    const projectAName = await createProject(`切换测试A-${Date.now()}`);
    const projectBName = await createProject(`切换测试B-${Date.now()}`);
    // 切换到项目A并删除
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName });
    await projectATab.click();
    await contentPage.waitForTimeout(300);
    // 导航到首页删除项目A
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const projectACard = contentPage.locator('.project-list').filter({ hasText: projectAName });
    await expect(projectACard).toBeVisible({ timeout: 5000 });
    const deleteBtn = projectACard.locator('[data-testid="home-project-delete-btn"]');
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    const confirmDialog = contentPage.locator('.el-message-box');
    const confirmBtn = confirmDialog.locator('.el-button--primary');
    await confirmBtn.click();
    await contentPage.waitForTimeout(1000);
    // 验证项目A的Tab已删除
    await expect(projectATab).toBeHidden({ timeout: 5000 });
    // 验证当前高亮Tab不是已删除的项目
    const activeTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active');
    await expect(activeTab).not.toContainText(projectAName);
  });
});


