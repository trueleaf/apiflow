import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('CodeRepoImport', () => {
  // 测试用例1: 打开导入页面验证代码仓库识别选项存在
  test('打开导入页面验证代码仓库识别选项存在', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
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
    // 验证代码仓库识别选项存在
    const repoSource = contentPage.locator('.source-item').filter({ hasText: /代码仓库识别|Repository/ });
    await expect(repoSource).toBeVisible({ timeout: 3000 });
  });
  // 测试用例2: 选择代码仓库识别导入方式
  test('选择代码仓库识别导入方式', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 点击代码仓库识别选项
    const repoSource = contentPage.locator('.source-item').filter({ hasText: /代码仓库识别|Repository/ });
    await repoSource.click();
    await contentPage.waitForTimeout(300);
    // 验证代码仓库识别选项被选中
    await expect(repoSource).toHaveClass(/active/);
  });
  // 测试用例3: 代码仓库导入界面显示正确
  test('代码仓库导入界面显示正确', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
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
    // 验证代码仓库选项有正确的描述
    const repoSource = contentPage.locator('.source-item').filter({ hasText: /代码仓库|Repository/ });
    await expect(repoSource).toContainText(/提取|Extract|API/);
  });
  // 测试用例4: 切换不同导入方式
  test('从代码仓库导入切换到其他导入方式', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 点击代码仓库识别选项
    const repoSource = contentPage.locator('.source-item').filter({ hasText: /代码仓库识别|Repository/ });
    await repoSource.click();
    await contentPage.waitForTimeout(300);
    // 验证选项被选中
    await expect(repoSource).toHaveClass(/active/);
    // 切换到URL导入
    const urlSource = contentPage.locator('.source-item').filter({ hasText: /URL导入|URL/ });
    await urlSource.click();
    await contentPage.waitForTimeout(300);
    // 验证URL导入选项被选中
    await expect(urlSource).toHaveClass(/active/);
    await expect(repoSource).not.toHaveClass(/active/);
  });
  // 测试用例5: 验证所有五种导入方式选项都存在
  test('验证所有五种导入方式选项都存在', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/workbench.*/, { timeout: 5000 });
    // 点击导入文档按钮
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    await contentPage.waitForTimeout(300);
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();
    await contentPage.waitForTimeout(500);
    // 验证五种导入方式都存在
    const sourceItems = contentPage.locator('.source-item');
    const count = await sourceItems.count();
    expect(count).toBe(5);
    // 验证本地文件选项
    await expect(contentPage.locator('.source-item').filter({ hasText: /本地文件|Local File/ })).toBeVisible();
    // 验证URL导入选项
    await expect(contentPage.locator('.source-item').filter({ hasText: /URL导入|URL/ })).toBeVisible();
    // 验证粘贴内容选项
    await expect(contentPage.locator('.source-item').filter({ hasText: /粘贴内容|Paste/ })).toBeVisible();
    // 验证AI智能识别选项
    await expect(contentPage.locator('.source-item').filter({ hasText: /AI智能识别|AI/ })).toBeVisible();
    // 验证代码仓库识别选项
    await expect(contentPage.locator('.source-item').filter({ hasText: /代码仓库识别|Repository/ })).toBeVisible();
  });
});
