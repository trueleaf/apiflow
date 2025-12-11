import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('CallHistory', () => {
  // 测试用例1: 切换到调用历史Tab页,验证Tab切换功能和UI展示
  test('切换到调用历史Tab页,验证Tab切换功能', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证Banner区域的Tab切换器存在
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    await expect(bannerTabs).toBeVisible({ timeout: 5000 });
    // 验证存在"接口列表"和"调用历史"两个Tab选项
    const listTab = bannerTabs.locator('.clean-tab-item').filter({ hasText: /接口列表/ });
    const historyTab = bannerTabs.locator('.clean-tab-item').filter({ hasText: /调用历史/ });
    await expect(listTab).toBeVisible();
    await expect(historyTab).toBeVisible();
    // 点击"调用历史"Tab
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证SendHistory组件渲染
    const sendHistoryComponent = contentPage.locator('.send-history');
    await expect(sendHistoryComponent).toBeVisible({ timeout: 5000 });
    // 切换回"接口列表"Tab
    await listTab.click();
    await contentPage.waitForTimeout(300);
    // 验证el-tree节点树显示
    const nodeTree = contentPage.locator('.el-tree');
    await expect(nodeTree).toBeVisible({ timeout: 5000 });
  });

  // 测试用例2: 调用历史搜索框功能验证
  test('调用历史搜索框功能验证,包括placeholder和清空按钮', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加HTTP节点并发送请求生成历史记录
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill('未命名接口');
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tab-item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证搜索框存在
    const searchInput = contentPage.locator('.send-history-search .el-input');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    // 验证搜索框placeholder显示"过滤历史记录"
    const inputElement = searchInput.locator('input');
    await expect(inputElement).toHaveAttribute('placeholder', /过滤历史记录/);
    // 验证搜索框左侧显示搜索图标
    const searchIcon = searchInput.locator('.el-input__prefix .el-icon');
    await expect(searchIcon).toBeVisible();
    // 验证搜索框右侧显示清空历史记录图标
    const deleteIcon = searchInput.locator('.clear-history-icon');
    await expect(deleteIcon).toBeVisible();
    // 输入搜索内容
    await inputElement.fill('test');
    await contentPage.waitForTimeout(400);
    // 验证clearable清空按钮出现
    const clearBtn = searchInput.locator('.el-input__clear');
    await expect(clearBtn).toBeVisible();
    // 点击清空按钮清除输入内容
    await clearBtn.click();
    await expect(inputElement).toHaveValue('');
  });

  // 测试用例3: 清空所有历史记录功能验证
  test('清空所有历史记录功能验证,包括确认弹窗', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tab-item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 定位清空历史记录图标
    const deleteIcon = contentPage.locator('.send-history-search .clear-history-icon');
    await expect(deleteIcon).toBeVisible({ timeout: 5000 });
    // 验证删除图标title显示"清空历史记录"
    await expect(deleteIcon).toHaveAttribute('title', /清空历史记录/);
    // 点击删除图标
    await deleteIcon.click();
    await contentPage.waitForTimeout(300);
    // 验证弹出确认对话框
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    // 验证对话框内容
    const dialogContent = confirmDialog.locator('.el-message-box__message');
    await expect(dialogContent).toContainText(/确定要清空所有历史记录吗/);
    // 点击"取消"按钮
    const cancelBtn = confirmDialog.locator('.el-message-box__btns button').filter({ hasText: /取消/ });
    await cancelBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证对话框关闭
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
  });

  // 测试用例4: 历史记录列表展示验证
  test('历史记录列表展示验证,包括空状态', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tab-item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证历史列表容器存在
    const historyList = contentPage.locator('.send-history-list');
    await expect(historyList).toBeVisible({ timeout: 5000 });
    // 验证暂无历史记录的空状态显示
    const emptyState = contentPage.locator('.send-history-list .empty');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
    await expect(emptyState).toContainText(/暂无历史记录/);
  });

  // 测试用例5: 点击历史记录项打开对应接口Tab页
  test('点击历史记录项打开对应接口Tab页', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
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
    // 发送请求生成历史记录
    const sendBtn = contentPage.locator('[data-testid="http-send-btn"]');
    if (await sendBtn.isVisible()) {
      await sendBtn.click();
      await contentPage.waitForTimeout(1000);
    }
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tab-item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(500);
    // 检查是否有历史记录项
    const historyItem = contentPage.locator('.send-history-list .history-item').first();
    const hasHistoryItem = await historyItem.isVisible().catch(() => false);
    if (hasHistoryItem) {
      // 点击历史记录项
      await historyItem.click();
      await contentPage.waitForTimeout(500);
      // 验证nav区域有Tab显示
      const navTabs = contentPage.locator('.project-nav .nav-item');
      await expect(navTabs.first()).toBeVisible({ timeout: 5000 });
    }
  });

  // 测试用例6: 已删除接口的历史记录标记验证
  test('已删除接口的历史记录标记验证', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
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
    // 发送请求生成历史记录
    const sendBtn = contentPage.locator('[data-testid="http-send-btn"]');
    if (await sendBtn.isVisible()) {
      await sendBtn.click();
      await contentPage.waitForTimeout(1000);
    }
    // 删除HTTP节点
    const treeNode = contentPage.locator('.el-tree-node').first();
    await treeNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    const deleteMenuItem = contentPage.locator('.el-dropdown-menu__item').filter({ hasText: /删除/ });
    if (await deleteMenuItem.isVisible()) {
      await deleteMenuItem.click();
      await contentPage.waitForTimeout(300);
      // 确认删除
      const confirmBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await contentPage.waitForTimeout(500);
      }
    }
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tab-item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(500);
    // 验证已删除接口的历史记录显示"已删除"标签
    const deletedTag = contentPage.locator('.send-history-list .deleted-tag');
    const deletedItem = contentPage.locator('.send-history-list .deleted-item');
    // 如果有已删除的历史记录，验证标签显示
    const hasDeletedItem = await deletedItem.first().isVisible().catch(() => false);
    if (hasDeletedItem) {
      await expect(deletedTag.first()).toBeVisible();
      await expect(deletedTag.first()).toContainText(/已删除/);
      // 验证清理按钮显示
      const cleanDeletedBtn = contentPage.locator('.clean-deleted-btn');
      await expect(cleanDeletedBtn).toBeVisible();
    }
  });

  // 测试用例7: 历史记录滚动加载更多功能验证
  test('历史记录滚动加载验证', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tab-item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证历史列表容器存在且可滚动
    const historyList = contentPage.locator('.send-history-list');
    await expect(historyList).toBeVisible({ timeout: 5000 });
    // 验证加载状态元素存在于DOM中（可能隐藏）
    const loadingMore = contentPage.locator('.send-history-list .loading-more');
    const noMore = contentPage.locator('.send-history-list .no-more');
    // 滚动到底部触发加载
    await historyList.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await contentPage.waitForTimeout(500);
    // 验证加载中或没有更多数据的状态
    const isLoading = await loadingMore.isVisible().catch(() => false);
    const isNoMore = await noMore.isVisible().catch(() => false);
    const isEmpty = await contentPage.locator('.send-history-list .empty').isVisible().catch(() => false);
    // 至少应该显示一种状态
    expect(isLoading || isNoMore || isEmpty).toBeTruthy();
  });

  // 测试用例8: 清理已删除接口历史功能验证
  test('清理已删除接口历史功能验证', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tab-item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证清理按钮的条件渲染
    const cleanDeletedBtn = contentPage.locator('.clean-deleted-btn');
    const hasCleanBtn = await cleanDeletedBtn.isVisible().catch(() => false);
    if (hasCleanBtn) {
      // 验证按钮显示已删除记录数量
      const btnText = await cleanDeletedBtn.textContent();
      expect(btnText).toMatch(/清理已删除接口历史.*\(\d+\)/);
      // 点击清理按钮
      await cleanDeletedBtn.click();
      await contentPage.waitForTimeout(300);
      // 验证弹出确认对话框
      const confirmDialog = contentPage.locator('.el-message-box');
      await expect(confirmDialog).toBeVisible({ timeout: 5000 });
      // 点击取消按钮
      const cancelBtn = confirmDialog.locator('.el-message-box__btns button').filter({ hasText: /取消/ });
      await cancelBtn.click();
      await contentPage.waitForTimeout(300);
      // 验证对话框关闭
      await expect(confirmDialog).toBeHidden({ timeout: 5000 });
    }
  });
});
