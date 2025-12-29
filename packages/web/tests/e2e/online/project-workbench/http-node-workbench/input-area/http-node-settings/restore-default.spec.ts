import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('RestoreDefault', () => {
  // 测试用例1: 点击恢复默认按钮,所有配置项恢复为默认值
  test('点击恢复默认按钮所有配置项恢复为默认值', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('恢复默认测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 修改User-Agent配置
    const userAgentInput = contentPage.locator('.config-item').filter({ hasText: 'User-Agent' }).locator('input');
    const originalUserAgent = await userAgentInput.inputValue();
    await userAgentInput.fill('ModifiedAgent/1.0');
    await contentPage.waitForTimeout(300);
    // 验证User-Agent已被修改
    const modifiedUserAgent = await userAgentInput.inputValue();
    expect(modifiedUserAgent).toBe('ModifiedAgent/1.0');
    // 点击User-Agent的恢复按钮
    const userAgentResetBtn = contentPage.locator('.config-item').filter({ hasText: 'User-Agent' }).locator('.reset-btn');
    await userAgentResetBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证User-Agent已恢复为默认值
    const restoredUserAgent = await userAgentInput.inputValue();
    expect(restoredUserAgent).toBe(originalUserAgent);
  });
  // 测试用例2: 修改重定向配置后点击恢复按钮,配置恢复为默认值
  test('修改重定向配置后点击恢复按钮配置恢复为默认值', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('重定向恢复默认测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 修改最大重定向次数配置
    const maxRedirectsInput = contentPage.locator('.config-item').filter({ hasText: /最大重定向次数|Max Redirects/ }).locator('.el-input-number input');
    const originalMaxRedirects = await maxRedirectsInput.inputValue();
    await maxRedirectsInput.fill('15');
    await contentPage.waitForTimeout(300);
    // 验证最大重定向次数已被修改
    const modifiedMaxRedirects = await maxRedirectsInput.inputValue();
    expect(modifiedMaxRedirects).toBe('15');
    // 点击最大重定向次数的恢复按钮
    const maxRedirectsResetBtn = contentPage.locator('.config-item').filter({ hasText: /最大重定向次数|Max Redirects/ }).locator('.reset-btn');
    await maxRedirectsResetBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证最大重定向次数已恢复为默认值
    const restoredMaxRedirects = await maxRedirectsInput.inputValue();
    expect(restoredMaxRedirects).toBe(originalMaxRedirects);
  });
  // 测试用例3: 恢复默认后刷新页面,配置保持为默认值
  test('恢复默认后刷新页面配置保持为默认值', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('恢复默认持久化测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击设置标签页
    const settingsTab = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTab.click();
    await contentPage.waitForTimeout(300);
    // 修改User-Agent配置
    const userAgentInput = contentPage.locator('.config-item').filter({ hasText: 'User-Agent' }).locator('input');
    const originalUserAgent = await userAgentInput.inputValue();
    await userAgentInput.fill('TempAgent/1.0');
    await contentPage.waitForTimeout(300);
    // 点击User-Agent的恢复按钮
    const userAgentResetBtn = contentPage.locator('.config-item').filter({ hasText: 'User-Agent' }).locator('.reset-btn');
    await userAgentResetBtn.click();
    await contentPage.waitForTime
    // 刷新页面
    await contentPage.reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await contentPage.waitForTimeout(1000);
    // 重新打开设置标签页
    const settingsTabAfterReload = contentPage.locator('[data-testid="http-params-tab-settings"]');
    await settingsTabAfterReload.click();
    await contentPage.waitForTimeout(300);
    // 验证User-Agent仍然是默认值
    const userAgentInputAfterReload = contentPage.locator('.config-item').filter({ hasText: 'User-Agent' }).locator('input');
    const userAgentAfterReload = await userAgentInputAfterReload.inputValue();
    expect(userAgentAfterReload).toBe(originalUserAgent);
  });
  // 测试用例4: Body参数显示顺序恢复默认后,顺序恢复为初始状态
  test('Body参数显示顺序恢复默认后顺序恢复为初始状态', async ({ contentPage, clearCache, createProject, loginAccount }) => {
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
    await fileNameInput.fill('Body顺序恢复默认测试');
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
    const originalFirstModeLabel = await modeItems.first().locator('.mode-label').textContent();
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
    const modifiedFirstModeLabel = await modeItems.first().locator('.mode-label').textContent();
    expect(modifiedFirstModeLabel).toBe(lastModeLabel);
    // 点击Body参数显示顺序的恢复按钮
    const bodyModeResetBtn = contentPage.locator('.config-item').filter({ hasText: /Body参数显示顺序|Body Mode Order/ }).locator('.reset-btn');
    await bodyModeResetBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证顺序已恢复为初始状态
    const restoredFirstModeLabel = await modeItems.first().locator('.mode-label').textContent();
    expect(restoredFirstModeLabel).toBe(originalFirstModeLabel);
  });
});
