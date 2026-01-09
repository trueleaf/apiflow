import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('AiDataImport', () => {
  // 测试用例1: 打开导入页面验证AI智能识别选项存在
  test('打开导入页面验证AI智能识别选项存在', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 验证导入页面正确渲染
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    // 验证AI智能识别选项存在
    const aiSource = contentPage.locator('.source-item').filter({ hasText: /AI智能识别|AI/ });
    await expect(aiSource).toBeVisible({ timeout: 3000 });
  });
  // 测试用例2: 选择AI智能识别导入方式
  test('选择AI智能识别导入方式', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 点击AI智能识别选项
    const aiSource = contentPage.locator('.source-item').filter({ hasText: /AI智能识别|AI/ });
    await aiSource.click();
    await contentPage.waitForTimeout(300);
    // 验证AI智能识别选项被选中
    await expect(aiSource).toHaveClass(/active/);
  });
  // 测试用例3: AI导入界面显示正确
  test('AI导入界面显示正确', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 验证导入页面正确渲染
    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });
    // 验证数据来源选项区域存在
    const sourceWrap = contentPage.locator('.source-wrap');
    await expect(sourceWrap).toBeVisible({ timeout: 3000 });
    // 验证AI选项有正确的描述
    const aiSource = contentPage.locator('.source-item').filter({ hasText: /AI/ });
    await expect(aiSource).toContainText(/自动识别|Auto/);
  });
  // 测试用例4: 切换回其他导入方式
  test('从AI导入切换回其他导入方式', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 点击AI智能识别选项
    const aiSource = contentPage.locator('.source-item').filter({ hasText: /AI智能识别|AI/ });
    await aiSource.click();
    await contentPage.waitForTimeout(300);
    // 验证AI选项被选中
    await expect(aiSource).toHaveClass(/active/);
    // 切换回本地文件
    const fileSource = contentPage.locator('.source-item').filter({ hasText: /本地文件|Local File/ });
    await fileSource.click();
    await contentPage.waitForTimeout(300);
    // 验证本地文件选项被选中
    await expect(fileSource).toHaveClass(/active/);
    await expect(aiSource).not.toHaveClass(/active/);
  });
});


