import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('LayoutOperation', () => {
  // 测试用例1: 点击水平布局按钮,请求区域和响应区域左右排列
  test('点击水平布局按钮,请求区域和响应区域左右排列', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('水平布局测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击布局下拉按钮
    const layoutDropdown = contentPage.locator('[data-testid="http-params-layout-dropdown"]');
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    // 选择左右布局
    const horizontalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /左右布局|Horizontal/ });
    await horizontalOption.click();
    await contentPage.waitForTimeout(500);
    // 验证布局切换为水平布局
    const apidocContainer = contentPage.locator('.apidoc');
    await expect(apidocContainer).not.toHaveClass(/vertical/, { timeout: 5000 });
    // 验证请求区域在左侧,响应区域在右侧
    const requestLayout = contentPage.locator('.request-layout');
    await expect(requestLayout).toBeVisible({ timeout: 5000 });
    const responseArea = contentPage.locator('.response-wrap');
    await expect(responseArea).toBeVisible({ timeout: 5000 });
  });
  // 测试用例2: 点击垂直布局按钮,请求区域和响应区域上下排列
  test('点击垂直布局按钮,请求区域和响应区域上下排列', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('垂直布局测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击布局下拉按钮
    const layoutDropdown = contentPage.locator('[data-testid="http-params-layout-dropdown"]');
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    // 选择上下布局
    const verticalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /上下布局|Vertical/ });
    await verticalOption.click();
    await contentPage.waitForTimeout(500);
    // 验证布局切换为垂直布局
    const apidocContainer = contentPage.locator('.apidoc');
    await expect(apidocContainer).toHaveClass(/vertical/, { timeout: 5000 });
    // 验证请求区域在上方,响应区域在下方
    const requestLayout = contentPage.locator('.request-layout');
    await expect(requestLayout).toBeVisible({ timeout: 5000 });
    await expect(requestLayout).toHaveClass(/vertical/, { timeout: 5000 });
  });
  // 测试用例3: 切换布局后刷新页面,布局保持不变
  test('切换布局后刷新页面,布局保持不变', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('布局持久化测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击布局下拉按钮,切换到上下布局
    const layoutDropdown = contentPage.locator('[data-testid="http-params-layout-dropdown"]');
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    const verticalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /上下布局|Vertical/ });
    await verticalOption.click();
    await contentPage.waitForTimeout(500);
    // 验证布局已切换为垂直布局
    const apidocContainer = contentPage.locator('.apidoc');
    await expect(apidocContainer).toHaveClass(/vertical/, { timeout: 5000 });
    // 刷新页面
    await contentPage.reload();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 10000 });
    await contentPage.waitForTimeout(1000);
    // 验证刷新后布局保持为垂直布局
    const apidocContainerAfterReload = contentPage.locator('.apidoc');
    await expect(apidocContainerAfterReload).toHaveClass(/vertical/, { timeout: 5000 });
  });
});
