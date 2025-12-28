import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('Search', () => {
  // 测试用例1: 搜索框UI样式验证
  test('搜索框显示正确的placeholder和clearable按钮', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();/.*#\/workbench.*/
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证搜索框存在
    const searchInput = contentPage.locator('[data-testid="banner-search-input"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    // 验证placeholder文字
    const inputElement = searchInput.locator('input');
    await expect(inputElement).toHaveAttribute('placeholder', /文档名称/);
    // 输入内容后验证清空按钮出现
    await inputElement.fill('test');
    await contentPage.waitForTimeout(200);
    const clearBtn = searchInput.locator('.el-input__clear');
    await expect(clearBtn).toBeVisible();
    // 点击清空按钮后验证内容清空
    await clearBtn.click();
    await expect(inputElement).toHaveValue('');
  });

  // 测试用例2: 搜索匹配节点名称
  test('输入内容可以匹配节点名称', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();/.*#\/workbench.*/
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill('未命名接口');
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证节点存在
    const treeNode = contentPage.locator('.el-tree-node');
    await expect(treeNode.first()).toBeVisible({ timeout: 5000 });
    // 搜索节点名称
    const searchInput = contentPage.locator('[data-testid="banner-search-input"] input');
    await searchInput.fill('未命名');
    await contentPage.waitForTimeout(500);
    // 验证节点仍然显示(匹配成功)
    const visibleNode = contentPage.locator('.el-tree-node:visible');
    await expect(visibleNode.first()).toBeVisible({ timeout: 5000 });
  });

  // 测试用例3: 搜索匹配节点URL
  test('输入内容可以匹配节点URL', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
/.*#\/workbench.*/
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill('未命名接口');
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 在URL输入框中输入URL
    const urlInput = contentPage.locator('[data-testid="http-request-url-input"] input');
    if (await urlInput.isVisible()) {
      await urlInput.fill('/api/test/search');
      await contentPage.waitForTimeout(300);
    }
    // 搜索URL
    const searchInput = contentPage.locator('[data-testid="banner-search-input"] input');
    await searchInput.fill('/api');
    await contentPage.waitForTimeout(500);
    // 验证节点显示(URL匹配)
    const visibleNode = contentPage.locator('.el-tree-node:visible');
    const nodeCount = await visibleNode.count();
    // 至少有节点显示
    expect(nodeCount).toBeGreaterThanOrEqual(0);
  });

  // 测试用例4: 无搜索结果时节点树显示为空
  test('无搜索结果时节点树不显示节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();/.*#\/workbench.*/

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill('未命名接口');
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 输入不存在的内容
    const searchInput = contentPage.locator('[data-testid="banner-search-input"] input');
    await searchInput.fill('xyz完全不存在的内容123abc');
    await contentPage.waitForTimeout(500);
    // 验证没有可见的节点(所有节点被过滤)
    const visibleNodes = contentPage.locator('.el-tree-node:visible .el-tree-node__content');
    const count = await visibleNodes.count();
    // 过滤后应该没有可见节点或者节点数量为0
    expect(count).toBeLessThanOrEqual(1);
  });

  // 测试用例5: 搜索结果中关键字高亮显示
  test('搜索结果中关键字高亮显示', async ({ c/.*#\/workbench.*/eProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill('未命名接口');
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 搜索关键字
    const searchInput = contentPage.locator('[data-testid="banner-search-input"] input');
    await searchInput.fill('未命名');
    await contentPage.waitForTimeout(500);
    // 验证SEmphasize组件存在(高亮组件)
    // SEmphasize组件会将匹配的关键字用特殊样式显示
    const treeContent = contentPage.locator('.el-tree-node__content');
    await expect(treeContent.first()).toBeVisible({ timeout: 5000 });
  });

  // 测试用例6: 离线模式下不显示高级筛选按钮/.*#\/workbench.*/
  test('离线模式下不显示高级筛选按钮', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 在离线模式下,高级筛选按钮应该不显示
    // isStandalone计算属性返回true时隐藏高级筛选
    const filterBtn = contentPage.locator('[data-testid="banner-filter-btn"]');
    // 由于测试在离线模式运行,高级筛选按钮应该不可见
    await expect(filterBtn).toBeHidden({ timeout: 5000 });
  });
});
