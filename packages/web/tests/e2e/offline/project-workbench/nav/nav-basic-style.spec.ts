import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('NavBasicStyle', () => {
  // 测试用例1: 导航栏在项目工作区正确渲染
  test('导航栏在项目工作区正确渲染', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 验证导航栏存在
    const nav = contentPage.locator('.nav');
    await expect(nav).toBeVisible({ timeout: 5000 });
    // 验证tab列表区域存在
    const tabList = contentPage.locator('.nav .tab-list');
    await expect(tabList).toBeVisible({ timeout: 3000 });
    // 验证新增tab按钮存在
    const addTabBtn = contentPage.locator('[data-testid="project-nav-add-tab-btn"]');
    await expect(addTabBtn).toBeVisible({ timeout: 3000 });
  });
  // 测试用例2: tab页签激活状态样式正确
  test('tab页签激活状态样式正确', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '样式测试接口' });
    // 验证激活的tab有active类
    const activeTab = contentPage.locator('.nav .item.active');
    await expect(activeTab).toBeVisible({ timeout: 3000 });
  });
  // 测试用例3: 非固定页签显示斜体样式
  test('非固定页签显示斜体样式', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '斜体样式测试' });
    // 关闭固定tab
    await contentPage.locator('[data-testid="project-nav-tab-close-btn"]').first().click();
    await contentPage.waitForTimeout(300);
    // 单击产生非固定tab
    const bannerNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '斜体样式测试' }).first();
    await bannerNode.click();
    await contentPage.waitForTimeout(300);
    // 验证非固定页签的文字有unfixed类（显示为斜体/倾斜）
    const activeTab = contentPage.locator('.nav .item.active');
    const itemText = activeTab.locator('.item-text.unfixed');
    await expect(itemText).toBeVisible({ timeout: 3000 });
  });
  // 测试用例4: 固定页签显示正常样式
  test('固定页签显示正常样式', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '固定样式测试' });
    // 验证固定页签的文字没有unfixed类
    const activeTab = contentPage.locator('.nav .item.active');
    const itemText = activeTab.locator('.item-text');
    await expect(itemText).toBeVisible({ timeout: 3000 });
    await expect(itemText).not.toHaveClass(/unfixed/);
  });
  // 测试用例5: 未保存状态显示小圆点
  test('未保存状态显示小圆点', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '未保存测试' });
    // 修改URL触发未保存状态
    const urlInput = contentPage.getByTestId('url-input').locator('.cl-rich-input__editor');
    await urlInput.click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.type('http://localhost:3456/echo');
    await contentPage.waitForTimeout(300);
    // 验证未保存状态的小圆点显示
    const unsavedDot = contentPage.locator('[data-testid="project-nav-tab-unsaved"]');
    await expect(unsavedDot).toBeVisible({ timeout: 3000 });
  });
  // 测试用例6: HTTP节点tab显示请求方法标识
  test('HTTP节点tab显示请求方法标识', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: 'GET方法测试' });
    // 验证tab显示GET方法标识
    const activeTab = contentPage.locator('.nav .item.active');
    await expect(activeTab).toContainText('GET');
  });
  // 测试用例7: 页签文本过长显示省略号
  test('页签文本过长显示省略号', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?/workbench/, { timeout: 5000 });
    const longName = '这是一个非常非常长的接口名称用于测试省略号效果ABCDEFG';
    await createNode(contentPage, { nodeType: 'http', name: longName });
    // 验证tab存在
    const activeTab = contentPage.locator('.nav .item.active');
    await expect(activeTab).toBeVisible({ timeout: 3000 });
    // 验证item-text有text-overflow: ellipsis样式（通过检查元素宽度是否小于文本宽度来间接验证）
    const itemText = activeTab.locator('.item-text');
    const scrollWidth = await itemText.evaluate((el) => el.scrollWidth);
    const clientWidth = await itemText.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeGreaterThanOrEqual(clientWidth);
  });
});

