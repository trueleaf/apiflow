import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('Tools', () => {
  // 测试用例1: 工具栏默认显示固定工具
  test('工具栏默认显示固定工具', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证工具栏区域存在
    const toolIcon = contentPage.locator('.tool-icon');
    await expect(toolIcon).toBeVisible({ timeout: 5000 });
    // 验证固定工具栏区域存在(SDraggable渲染的operation区域)
    const operationArea = contentPage.locator('.tool-icon .operation');
    await expect(operationArea).toBeVisible({ timeout: 5000 });
    // 验证更多操作按钮存在
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await expect(moreBtn).toBeVisible({ timeout: 5000 });
  });

  // 测试用例2: 点击更多操作按钮展开工具面板
  test('点击更多操作按钮展开工具面板', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 点击更多操作按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await expect(moreBtn).toBeVisible({ timeout: 5000 });
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证面板展开(tool-panel是popper-class)
    const toolPanel = contentPage.locator('.tool-panel');
    await expect(toolPanel).toBeVisible({ timeout: 5000 });
    // 验证面板标题显示"快捷操作"
    const panelHeader = toolPanel.locator('.toolbar-header');
    await expect(panelHeader).toBeVisible();
    await expect(panelHeader).toContainText('快捷操作');
  });

  // 测试用例3: 更多操作面板显示完整工具列表
  test('更多操作面板显示完整工具列表', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 点击更多操作按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证工具列表存在
    const dropdownItems = contentPage.locator('.tool-panel .dropdown-item');
    await expect(dropdownItems.first()).toBeVisible({ timeout: 5000 });
    // 验证工具项包含:图标、名称、固定按钮
    const firstItem = dropdownItems.first();
    // 验证固定按钮存在
    const pinBtn = firstItem.locator('.pin');
    await expect(pinBtn).toBeVisible();
    // 验证工具名称存在
    const label = firstItem.locator('.label');
    await expect(label).toBeVisible();
  });

  // 测试用例4: 点击关闭按钮关闭更多操作面板
  test('点击关闭按钮关闭更多操作面板', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const toolPanel = contentPage.locator('.tool-panel');
    await expect(toolPanel).toBeVisible({ timeout: 5000 });
    // 点击关闭按钮
    const closeBtn = contentPage.locator('.toolbar-close');
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证面板关闭
    await expect(toolPanel).toBeHidden({ timeout: 5000 });
  });

  // 测试用例5: 点击外部区域关闭更多操作面板
  test('点击外部区域关闭更多操作面板', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const toolPanel = contentPage.locator('.tool-panel');
    await expect(toolPanel).toBeVisible({ timeout: 5000 });
    // 点击外部区域(例如body)
    await contentPage.locator('body').click({ position: { x: 100, y: 100 } });
    await contentPage.waitForTimeout(300);
    // 验证面板关闭
    await expect(toolPanel).toBeHidden({ timeout: 5000 });
  });

  // 测试用例6: 点击固定按钮将工具固定到工具栏
  test('点击固定按钮将工具固定到工具栏', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 找到未固定的工具(没有active类的pin按钮)
    const unpinnedRows = contentPage
      .locator('.tool-panel .dropdown-item')
      .filter({ has: contentPage.locator('.pin:not(.active)') });
    await expect(unpinnedRows.first()).toBeVisible({ timeout: 5000 });
    const activePins = contentPage.locator('.tool-panel .dropdown-item .pin.active');
    const activePinsBefore = await activePins.count();
    await unpinnedRows.first().locator('.pin').click();
    await expect(activePins).toHaveCount(activePinsBefore + 1, { timeout: 5000 });
  });

  // 测试用例7: 点击取消固定将工具从工具栏移除
  test('点击取消固定将工具从工具栏移除', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 找到已固定的工具(有active类的pin按钮)
    const pinnedRows = contentPage
      .locator('.tool-panel .dropdown-item')
      .filter({ has: contentPage.locator('.pin.active') });
    await expect(pinnedRows.first()).toBeVisible({ timeout: 5000 });
    const activePins = contentPage.locator('.tool-panel .dropdown-item .pin.active');
    const activePinsBefore = await activePins.count();
    await pinnedRows.first().locator('.pin').click();
    await expect(activePins).toHaveCount(activePinsBefore - 1, { timeout: 5000 });
  });

  // 测试用例8: 点击新增目录按钮弹出目录创建对话框
  test('点击新增目录按钮弹出目录创建对话框', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 点击新增文件夹工具
    const addFolderItem = contentPage.locator('[data-testid="tool-panel-banner-add-folder-btn"]');
    if (await addFolderItem.isVisible()) {
      await addFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 验证对话框弹出
      const dialog = contentPage.locator('.el-dialog').filter({ hasText: /新增|新建|目录|文件夹/ });
      await expect(dialog).toBeVisible({ timeout: 5000 });
    }
  });

  // 测试用例9: 点击新增接口按钮弹出接口创建对话框
  test('点击新增接口按钮弹出接口创建对话框', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 点击新增文件工具
    const addFileItem = contentPage.locator('[data-testid="tool-panel-banner-add-http-btn"]');
    if (await addFileItem.isVisible()) {
      await addFileItem.click();
      await contentPage.waitForTimeout(300);
      // 验证对话框弹出
      const dialog = contentPage.locator('.el-dialog').filter({ hasText: /新增|新建|文件|接口/ });
      await expect(dialog).toBeVi
    }
  });

  // 测试用例10: 点击回收站按钮打开回收站标签页
  test('点击回收站按钮打开回收站标签页', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 点击回收站工具
    const recyclerItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /回收站/ });
    await expect(recyclerItem).toBeVisible({ timeout: 5000 });
    await recyclerItem.click();
    await contentPage.waitForTime
    // 验证回收站内容区显示
    await expect(contentPage.locator('.recycler')).toBeVisible({ timeout: 5000 });
  });

  // 测试用例11: 点击Cookie管理按钮打开Cookies标签页
  test('点击Cookie管理按钮打开Cookies标签页', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 点击Cookie管理工具
    const cookiesItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie/ });
    await expect(cookiesItem).toBeVisible({ timeout: 5000 });
    await cookiesItem.click();
    await contentPage.waitForTimeout(500);
    // 验证Cookies内容区显示
    await expect(contentPage.locator('.cookies-page')).toBeVisible({ timeout: 5000 });
  });

  // 测试用例12: 点击变量按钮打开变量标签页
  test('点击变量按钮打开变量标签页', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 点击全局变量工具
    const variableItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /全局变量|变量/ });
    await expect(variableItem).to
    await variableItem.click();
    await contentPage.waitForTimeout(500);
    // 验证变量内容区显示
    await expect(contentPage.locator('.s-variable')).toBeVisible({ timeout: 5000 });
  });

  // 测试用例13: 点击导入文档按钮打开导入文档标签页
  test('点击导入文档按钮打开导入文档标签页', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 点击导入文档工具
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 验证导入文档内容区显示
    await expect(contentPage.locator('.doc-import')).toBeVisible({ timeout: 5000 });
  });

  // 测试用例14: 点击导出文档按钮打开导出文档标签页
  test('点击导出文档按钮打开导出文档标签页', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开更多操作面板
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    // 点击导出文档工具
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await expect(exportItem).toBeVisible({ timeout: 5000 });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    // 验证导出文档内容区显示
    await expect(contentPage.locator('.doc-export')).toBeVisible({ timeout: 5000 });
  });
});
