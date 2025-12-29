import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('DisplayOrderConfig', () => {
  // 测试用例1: 拖拽调整Body参数模式显示顺序后,Body区域按新顺序展示
  test('拖拽调整Body参数模式显示顺序后Body区域按新顺序展示', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Body顺序配置测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 获取Body参数模式列表
    const modeOrderList = contentPage.locator('.mode-order-list');
    await expect(modeOrderList).toBeVisible({ timeout: 5000 });
    // 获取初始顺序
    const modeItems = contentPage.locator('.mode-order-item');
    const firstModeLabel = await modeItems.first().locator('.mode-label').textContent();
    const lastModeLabel = await modeItems.last().locator('.mode-label').textContent();
    // 拖拽最后一个元素到第一个位置
    const firstItem = modeItems.first();
    const lastItem = modeItems.last();
    const firstBox = await firstItem.boundingBox();
    const lastBox = await lastItem.boundingBox();
    if (firstBox && lastBox) {
      await contentPage.mouse.move(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.waitForTimeout(100);
      await contentPage.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2, { steps: 10 });
      await contentPage.waitForTimeout(100);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    // 验证顺序已改变：原来最后的元素现在应该在第一个位置
    const newFirstModeLabel = await modeItems.first().locator('.mode-label').textContent();
    expect(newFirstModeLabel).toBe(lastModeLabel);
    // 返回Body标签页验证顺序是否生效
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证Body类型radio按钮的顺序
    const radioLabels = contentPage.locator('.body-mode-item');
    const firstRadioText = await radioLabels.first().textContent();
    // 验证第一个radio是我们拖拽到第一位的模式
    expect(firstRadioText?.toLowerCase()).toContain(lastModeLabel?.toLowerCase() || '');
  });
  // 测试用例2: 拖拽调整标签页显示顺序后,标签按新顺序展示
  test('拖拽调整标签页显示顺序后标签按新顺序展示', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('标签页顺序配置测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 获取标签页顺序列表
    const tabOrderList = contentPage.locator('.tab-order-list');
    await expect(tabOrderList).toBeVisible({ timeout: 5000 });
    // 获取初始顺序
    const tabItems = contentPage.locator('.tab-order-item');
    const firstTabLabel = await tabItems.first().locator('.tab-label').textContent();
    const lastTabLabel = await tabItems.last().locator('.tab-label').textContent();
    // 拖拽最后一个元素到第一个位置
    const firstItem = tabItems.first();
    const lastItem = tabItems.last();
    const firstBox = await firstItem.boundingBox();
    const lastBox = await lastItem.boundingBox();
    if (firstBox && lastBox) {
      await contentPage.mouse.move(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.waitForTimeout(100);
      await contentPage.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2, { steps: 10 });
      await contentPage.waitForTimeout(100);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    // 验证顺序已改变
    const newFirstTabLabel = await tabItems.first().locator('.tab-label').textContent();
    expect(newFirstTabLabel).toBe(lastTabLabel);
    // 验证标签页的顺序是否更新
    const tabs = contentPage.locator('.params-tabs .el-tabs__item');
    const tabsCount = await tabs.count();
    expect(tabsCount).toBeGreaterThan(0);
    // 验证第一个标签页是我们拖拽到第一位的标签
    const firstTabText = await tabs.first().textContent();
    expect(firstTabText?.trim()).toContain(lastTabLabel?.trim() || '');
  });
  // 测试用例3: 显示顺序修改后刷新页面,顺序保持不变
  test('显示顺序修改后刷新页面顺序保持不变', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('顺序持久化测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 获取Body参数模式列表
    const modeOrderList = contentPage.locator('.mode-order-list');
    await expect(modeOrderList).toBeVisible({ timeout: 5000 });
    // 获取初始顺序
    const modeItems = contentPage.locator('.mode-order-item');
    const lastModeLabel = await modeItems.last().locator('.mode-label').textContent();
    // 拖拽最后一个元素到第一个位置
    const firstItem = modeItems.first();
    const lastItem = modeItems.last();
    const firstBox = await firstItem.boundingBox();
    const lastBox = await lastItem.boundingBox();
    if (firstBox && lastBox) {
      await contentPage.mouse.move(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.waitForTimeout(100);
      await contentPage.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2, { steps: 10 });
      await contentPage.waitForTimeout(100);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    // 验证顺序已改变
    const newFirstModeLabel = await modeItems.first().locator('.mode-label').textContent();
    expect(newFirstModeLabel).toBe(lastModeLabel);
    // 刷新页面
    await contentPage.reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await contentPage.waitForTimeout(1000);
    // 重新打开设置标签页
    const settingsTabAfterReload = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTabAfterReload.click();
    await contentPage.waitForTimeout(300);
    // 验证顺序保持不变
    const modeOrderListAfterReload = contentPage.locator('.mode-order-list');
    await expect(modeOrderListAfterReload).toBeVisible({ timeout: 5000 });
    const modeItemsAfterReload = contentPage.locator('.mode-order-item');
    const firstModeLabelAfterReload = await modeItemsAfterReload.first().locator('.mode-label').textContent();
    // 验证刷新后顺序仍然保持修改后的状态
    expect(firstModeLabelAfterReload).toBe(lastModeLabel);
  });
});
