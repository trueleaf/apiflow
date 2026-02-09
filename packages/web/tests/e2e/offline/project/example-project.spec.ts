import { test, expect } from '../../../fixtures/electron.fixture';

test.describe('ExampleProject', () => {
  test('首次启动离线模式自动创建示例项目', async ({ contentPage, topBarPage, clearCache }) => {
    await clearCache({ skipExampleProject: false });
    // 验证示例项目Tab存在
    const exampleProjectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: /示例项目|Example Project/ });
    await expect(exampleProjectTab).toBeVisible({ timeout: 10000 });
    // 验证已跳转到项目详情页
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
  });

  test('示例项目包含两个主文件夹', async ({ contentPage, clearCache }) => {
    await clearCache({ skipExampleProject: false });
    await contentPage.waitForTimeout(2000);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await contentPage.waitForTimeout(1000);
    // 验证文档树可见
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    // 验证存在"真实API示例"文件夹
    const realApiFolder = bannerTree.locator('.el-tree-node__content').filter({ hasText: /真实API示例|Real API Examples/ }).first();
    await expect(realApiFolder).toBeVisible({ timeout: 5000 });
    // 验证存在"Mock示例"文件夹
    const mockFolder = bannerTree.locator('.el-tree-node__content').filter({ hasText: /Mock示例|Mock Examples/ }).first();
    await expect(mockFolder).toBeVisible({ timeout: 5000 });
  });

  test('真实API示例文件夹包含6个接口节点', async ({ contentPage, clearCache }) => {
    await clearCache({ skipExampleProject: false });
    await contentPage.waitForTimeout(2000);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await contentPage.waitForTimeout(1000);
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    // 展开"真实API示例"文件夹
    const realApiFolder = bannerTree.locator('.el-tree-node__content').filter({ hasText: /真实API示例|Real API Examples/ }).first();
    const expandIcon = realApiFolder.locator('.el-tree-node__expand-icon');
    await expandIcon.click();
    await contentPage.waitForTimeout(500);
    // 验证包含"获取用户列表"
    const getUserList = bannerTree.locator('.el-tree-node__content').filter({ hasText: /获取用户列表|Get User List/ });
    await expect(getUserList).toBeVisible();
    // 验证包含"获取用户详情"
    const getUserDetail = bannerTree.locator('.el-tree-node__content').filter({ hasText: /获取用户详情|Get User Detail/ });
    await expect(getUserDetail).toBeVisible();
    // 验证包含"创建用户"
    const createUser = bannerTree.locator('.el-tree-node__content').filter({ hasText: /创建用户|Create User/ });
    await expect(createUser).toBeVisible();
    // 验证包含"更新用户"
    const updateUser = bannerTree.locator('.el-tree-node__content').filter({ hasText: /更新用户|Update User/ });
    await expect(updateUser).toBeVisible();
    // 验证包含"删除用户"
    const deleteUser = bannerTree.locator('.el-tree-node__content').filter({ hasText: /删除用户|Delete User/ });
    await expect(deleteUser).toBeVisible();
    // 验证包含"获取文章列表"
    const getPostList = bannerTree.locator('.el-tree-node__content').filter({ hasText: /获取文章列表|Get Posts List/ });
    await expect(getPostList).toBeVisible();
  });

  test('Mock示例文件夹包含2个Mock节点', async ({ contentPage, clearCache }) => {
    await clearCache({ skipExampleProject: false });
    await contentPage.waitForTimeout(2000);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await contentPage.waitForTimeout(1000);
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    // 展开"Mock示例"文件夹
    const mockFolder = bannerTree.locator('.el-tree-node__content').filter({ hasText: /Mock示例|Mock Examples/ }).first();
    const expandIcon = mockFolder.locator('.el-tree-node__expand-icon');
    await expandIcon.click();
    await contentPage.waitForTimeout(500);
    // 验证包含"HTTP Mock示例"
    const httpMock = bannerTree.locator('.el-tree-node__content').filter({ hasText: /HTTP Mock示例|HTTP Mock Example/ });
    await expect(httpMock).toBeVisible();
    // 验证包含"WebSocket Mock示例"
    const wsMock = bannerTree.locator('.el-tree-node__content').filter({ hasText: /WebSocket Mock示例|WebSocket Mock Example/ });
    await expect(wsMock).toBeVisible();
  });

  test('示例项目标记设置后不会重复创建', async ({ contentPage, topBarPage, clearCache, reload }) => {
    await clearCache({ skipExampleProject: false });
    await contentPage.waitForTimeout(2000);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    // 获取示例项目Tab
    const exampleProjectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: /示例项目|Example Project/ }).first();
    await expect(exampleProjectTab).toBeVisible({ timeout: 5000 });
    // 关闭示例项目Tab
    const closeBtn = exampleProjectTab.locator('.close-btn');
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
    await homeBtn.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(1000);
    // 删除示例项目
    const exampleProjectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: /示例项目|Example Project/ }).first();
    await expect(exampleProjectCard).toBeVisible({ timeout: 5000 });
    const deleteBtn = exampleProjectCard.locator('[data-testid="home-project-delete-btn"]');
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    // 确认删除
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const confirmBtn = confirmDialog.locator('.el-button--primary');
    await confirmBtn.click();
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
    await expect(exampleProjectCard).toBeHidden({ timeout: 10000 });
    await contentPage.waitForTimeout(1000);
    // 重新加载应用
    await reload();
    await contentPage.waitForTimeout(2000);
    // 验证没有自动创建新的示例项目（停留在首页）
    const url = contentPage.url();
    expect(url).toContain('home');
    const exampleProjectTabAfterReload = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: /示例项目|Example Project/ });
    await expect(exampleProjectTabAfterReload).toHaveCount(0);
  });

  test('在线模式下不创建示例项目', async ({ contentPage, topBarPage, clearCache }) => {
    await clearCache();
    await contentPage.waitForTimeout(1000);
    // 切换到在线模式
    const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]');
    await networkBtn.click();
    await contentPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForTimeout(1000);
    // 验证网络模式切换成功
    const networkText = networkBtn.locator('.icon-text');
    await expect(networkText).toContainText(/联网模式|Online|Internet/, { timeout: 5000 });
    // 验证没有示例项目Tab
    const exampleProjectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: /示例项目|Example Project/ });
    await expect(exampleProjectTab).toHaveCount(0);
    // 切回离线模式，避免影响后续用例
    await networkBtn.click();
    await contentPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForTimeout(1000);
    await expect(networkText).toContainText(/离线模式|Offline/, { timeout: 5000 });
  });

  test('点击示例HTTP接口可以正常打开并展示接口信息', async ({ contentPage, clearCache }) => {
    await clearCache({ skipExampleProject: false });
    await contentPage.waitForTimeout(2000);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 20000 });
    await contentPage.waitForTimeout(1000);
    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 10000 });
    // 展开真实API示例文件夹
    const realApiFolder = bannerTree.locator('.el-tree-node__content').filter({ hasText: /真实API示例|Real API Examples/ }).first();
    const expandIcon = realApiFolder.locator('.el-tree-node__expand-icon');
    await expandIcon.click();
    await contentPage.waitForTimeout(500);
    // 点击"获取用户列表"接口
    const getUserList = bannerTree.locator('.el-tree-node__content').filter({ hasText: /获取用户列表|Get User List/ }).first();
    await getUserList.click();
    await contentPage.waitForTimeout(500);
    // 验证URL输入框包含正确的接口地址
    const urlInput = contentPage.getByTestId('url-input').locator('[contenteditable]').first();
    await expect(urlInput).toContainText(/jsonplaceholder\.typicode\.com\/users/, { timeout: 10000 });
  });
});
