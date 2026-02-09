import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketLayoutOperation', () => {
  // 点击水平布局按钮,参数区域和响应区域左右排列
  test('点击水平布局按钮参数区域和响应区域左右排列', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '水平布局测试' });
    // 点击布局下拉按钮
    const layoutDropdown = contentPage.locator('.ws-params .action-item').filter({ hasText: /布局/ });
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    // 选择左右布局
    const horizontalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /左右布局|Horizontal/ });
    await horizontalOption.click();
    await contentPage.waitForTimeout(500);
    // 验证布局切换为水平布局
    const websocketRoot = contentPage.locator('.websocket');
    await expect(websocketRoot).not.toHaveClass(/vertical/, { timeout: 5000 });
  });
  // 点击垂直布局按钮,参数区域和响应区域上下排列
  test('点击垂直布局按钮参数区域和响应区域上下排列', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '垂直布局测试' });
    // 点击布局下拉按钮
    const layoutDropdown = contentPage.locator('.ws-params .action-item').filter({ hasText: /布局/ });
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    // 选择上下布局
    const verticalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /上下布局|Vertical/ });
    await verticalOption.click();
    await contentPage.waitForTimeout(500);
    // 验证布局切换为垂直布局
    const websocketRoot = contentPage.locator('.websocket');
    await expect(websocketRoot).toHaveClass(/vertical/, { timeout: 5000 });
  });
  // 切换布局后刷新页面,布局保持不变
  test('切换布局后刷新页面布局保持不变', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '布局持久化测试' });
    // 点击布局下拉按钮
    const layoutDropdown = contentPage.locator('.ws-params .action-item').filter({ hasText: /布局/ });
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    // 选择上下布局
    const verticalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /上下布局|Vertical/ });
    await verticalOption.click();
    await contentPage.waitForTimeout(500);
    // 验证布局切换为垂直布局
    const websocketRoot = contentPage.locator('.websocket');
    await expect(websocketRoot).toHaveClass(/vertical/, { timeout: 5000 });
    // 刷新页面
    await reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(1000);
    // 验证布局仍然为垂直布局
    const websocketRootAfter = contentPage.locator('.websocket');
    await expect(websocketRootAfter).toHaveClass(/vertical/, { timeout: 5000 });
  });
  // 切换为垂直布局后再切换回水平布局验证样式正确
  test('切换为垂直布局后再切换回水平布局验证样式正确', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '布局切换回水平测试' });
    const layoutDropdown = contentPage.locator('.ws-params .action-item').filter({ hasText: /布局/ });
    // 切换为垂直布局
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    const verticalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /上下布局|Vertical/ });
    await verticalOption.click();
    await contentPage.waitForTimeout(500);
    const websocketRoot = contentPage.locator('.websocket');
    await expect(websocketRoot).toHaveClass(/vertical/, { timeout: 5000 });
    // 再切换回水平布局
    await layoutDropdown.click();
    await contentPage.waitForTimeout(300);
    const horizontalOption = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /左右布局|Horizontal/ });
    await horizontalOption.click();
    await contentPage.waitForTimeout(500);
    await expect(websocketRoot).not.toHaveClass(/vertical/, { timeout: 5000 });
  });
});
