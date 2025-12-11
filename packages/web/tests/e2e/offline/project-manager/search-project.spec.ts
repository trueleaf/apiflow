import { test, expect } from '../../../fixtures/electron.fixture';

test.describe('SearchProject', () => {
  // 测试用例1: 搜索无结果展示
  test('输入不存在的项目名称,显示空状态提示', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证项目卡片存在
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    // 定位搜索输入框
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await expect(searchInput).toBeVisible();
    // 输入不存在的项目名称
    await searchInput.fill('不存在的项目xyz123');
    // 等待300ms防抖延迟
    await contentPage.waitForTimeout(400);
    // 验证项目卡片列表为空
    await expect(projectCard).toBeHidden({ timeout: 5000 });
    // 验证空状态组件显示
    const emptyContainer = contentPage.locator('.empty-container .el-empty');
    await expect(emptyContainer).toBeVisible({ timeout: 5000 });
  });

  test('清空搜索框后,项目列表恢复显示', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 定位搜索输入框
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('不存在的项目xyz123');
    await contentPage.waitForTimeout(400);
    // 验证项目卡片隐藏
    const projectCard = contentPage.locator('[data-testid="home-project-card-0"]');
    await expect(projectCard).toBeHidden({ timeout: 5000 });
    // 点击清空按钮
    const clearBtn = contentPage.locator('[data-testid="home-search-clear-btn"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await contentPage.waitForTimeout(400);
    // 验证项目卡片恢复显示
    await expect(projectCard).toBeVisible({ timeout: 5000 });
  });

  test('搜索匹配项目名称,项目列表正确过滤', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    // 创建两个项目
    const project1 = await createProject('测试项目AAA');
    await contentPage.waitForTimeout(300);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(300);
    const project2 = await createProject('另一个项目BBB');
    await contentPage.waitForTimeout(300);
    // 返回首页
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 搜索第一个项目
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('AAA');
    await contentPage.waitForTimeout(400);
    // 验证只显示匹配的项目
    const projectCards = contentPage.locator('[data-testid^="home-project-card-"]');
    await expect(projectCards).toHaveCount(1);
    // 验证显示的是正确的项目
    const projectNameEl = contentPage.locator('[data-testid="home-project-card-0"] .project-name');
    await expect(projectNameEl).toContainText('AAA');
  });

  // 测试用例2: 高级搜索面板展示
  test('点击高级搜索按钮,展开高级搜索面板', async ({ contentPage, clearCache }) => {
    await clearCache();
    await contentPage.waitForTimeout(500);
    // 点击高级搜索按钮
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await expect(advancedSearchBtn).toBeVisible();
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证高级搜索面板显示
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
  });

  test('高级搜索面板显示基础信息搜索选项', async ({ contentPage, clearCache }) => {
    await clearCache();
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    // 验证基础信息区域存在
    const basicInfoSection = advancedSearchPanel.locator('.search-section').first();
    await expect(basicInfoSection).toBeVisible();
    // 验证基础信息复选框选项(离线模式下不包含创建者和维护者)
    const checkboxLabels = advancedSearchPanel.locator('.search-section').first().locator('.el-checkbox');
    // 离线模式应该显示5个选项: 项目名称,文档名称,请求URL,请求方法,备注
    await expect(checkboxLabels.first()).toBeVisible();
  });

  test('高级搜索面板显示节点类型搜索选项', async ({ contentPage, clearCache }) => {
    await clearCache();
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    // 验证节点类型区域存在
    const nodeTypeSection = advancedSearchPanel.locator('.search-section').nth(1);
    await expect(nodeTypeSection).toBeVisible();
    // 验证节点类型复选框选项
    const nodeTypeLabels = nodeTypeSection.locator('.el-checkbox');
    await expect(nodeTypeLabels).toHaveCount(4);
  });

  test('高级搜索面板显示请求参数搜索选项', async ({ contentPage, clearCache }) => {
    await clearCache();
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    // 验证请求参数区域存在
    const requestParamsSection = advancedSearchPanel.locator('.search-section').nth(2);
    await expect(requestParamsSection).toBeVisible();
    // 验证请求参数复选框选项: Query,Path,请求头,Body,返回参数,前置脚本,后置脚本,WebSocket消息
    const requestParamsLabels = requestParamsSection.locator('.el-checkbox');
    await expect(requestParamsLabels).toHaveCount(8);
  });

  test('高级搜索面板显示更新日期搜索选项', async ({ contentPage, clearCache }) => {
    await clearCache();
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    // 验证更新日期区域存在
    const dateRangeSection = advancedSearchPanel.locator('.search-section').nth(3);
    await expect(dateRangeSection).toBeVisible();
    // 验证日期单选按钮: 不限制,最近3天,最近1周,最近1月,最近3月,自定义
    const dateRadios = dateRangeSection.locator('.el-radio');
    await expect(dateRadios).toHaveCount(6);
  });

  test('选择自定义日期后显示日期选择器', async ({ contentPage, clearCache }) => {
    await clearCache();
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    // 默认不显示日期选择器
    const datePicker = advancedSearchPanel.locator('.custom-date-picker');
    await expect(datePicker).toBeHidden();
    // 点击自定义单选按钮
    const customRadio = advancedSearchPanel.locator('.el-radio').filter({ hasText: /自定义/ });
    await customRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证日期选择器显示
    await expect(datePicker).toBeVisible({ timeout: 5000 });
  });

  test('高级搜索面板显示全选和重置按钮', async ({ contentPage, clearCache }) => {
    await clearCache();
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    // 验证操作按钮区域存在
    const searchActions = advancedSearchPanel.locator('.search-actions');
    await expect(searchActions).toBeVisible();
    // 验证全选/取消全选和重置按钮
    const actionButtons = searchActions.locator('.el-button');
    await expect(actionButtons).toHaveCount(2);
  });

  // 测试用例3: 搜索条件功能验证
  test('高级搜索可以按节点名称搜索', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加一个HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    // 输入搜索关键词
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('未命名接口');
    await contentPage.waitForTimeout(500);
    // 验证搜索结果显示
    const searchResults = contentPage.locator('.search-results');
    await expect(searchResults).toBeVisible({ timeout: 5000 });
  });

  // 测试用例4: 搜索结果UI显示
  test('搜索结果按项目分组显示', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加一个HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    // 输入搜索关键词
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('未命名');
    await contentPage.waitForTimeout(500);
    // 验证搜索结果显示
    const searchResults = contentPage.locator('.search-results');
    await expect(searchResults).toBeVisible({ timeout: 5000 });
    // 验证结果分组标题包含项目名称
    const groupHeader = searchResults.locator('.group-header');
    await expect(groupHeader).toBeVisible({ timeout: 5000 });
    // 验证分组标题格式包含项目名称
    const groupTitle = groupHeader.locator('.group-title');
    await expect(groupTitle).toContainText(projectName);
    // 验证分组标题包含数量
    const groupCount = groupHeader.locator('.group-count');
    await expect(groupCount).toBeVisible();
  });

  test('搜索结果项显示节点类型和名称', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加一个HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    // 输入搜索关键词
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('未命名');
    await contentPage.waitForTimeout(500);
    // 验证搜索结果项
    const searchResultItem = contentPage.locator('.search-result-item').first();
    await expect(searchResultItem).toBeVisible({ timeout: 5000 });
    // 验证节点类型标签
    const nodeTypeLabel = searchResultItem.locator('.node-type-label');
    await expect(nodeTypeLabel).toBeVisible();
    await expect(nodeTypeLabel).toContainText('HTTP');
    // 验证节点名称
    const nodeName = searchResultItem.locator('.node-name');
    await expect(nodeName).toBeVisible();
  });

  test('搜索结果项显示匹配字段信息', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加一个HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    // 输入搜索关键词
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('未命名');
    await contentPage.waitForTimeout(500);
    // 验证搜索结果项
    const searchResultItem = contentPage.locator('.search-result-item').first();
    await expect(searchResultItem).toBeVisible({ timeout: 5000 });
    // 验证匹配信息区域
    const matchInfo = searchResultItem.locator('.match-info');
    await expect(matchInfo).toBeVisible();
    // 验证匹配标签
    const matchLabel = matchInfo.locator('.match-label');
    await expect(matchLabel).toBeVisible();
  });

  test('点击搜索结果项跳转到对应节点', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加一个HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    // 输入搜索关键词
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('未命名');
    await contentPage.waitForTimeout(500);
    // 点击搜索结果项
    const searchResultItem = contentPage.locator('.search-result-item').first();
    await expect(searchResultItem).toBeVisible({ timeout: 5000 });
    await searchResultItem.click();
    // 验证跳转到项目工作区
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
  });

  test('高级搜索无结果时显示空状态提示', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    // 输入不存在的搜索关键词
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('完全不存在的内容xyz789');
    await contentPage.waitForTimeout(500);
    // 验证空状态显示
    const emptyState = contentPage.locator('.search-results .empty-state');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
    // 验证空状态包含el-empty组件
    const elEmpty = emptyState.locator('.el-empty');
    await expect(elEmpty).toBeVisible();
  });

  test('重置按钮恢复所有搜索条件为默认值', async ({ contentPage, clearCache }) => {
    await clearCache();
    await contentPage.waitForTimeout(500);
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    // 修改一些搜索条件 - 取消勾选第一个复选框
    const firstCheckbox = advancedSearchPanel.locator('.el-checkbox').first();
    await firstCheckbox.click();
    await contentPage.waitForTimeout(200);
    // 点击重置按钮
    const resetBtn = advancedSearchPanel.locator('.search-actions .el-button').last();
    await resetBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证复选框恢复选中状态
    const checkboxInput = advancedSearchPanel.locator('.el-checkbox').first().locator('input');
    await expect(checkboxInput).toBeChecked();
  });
});
