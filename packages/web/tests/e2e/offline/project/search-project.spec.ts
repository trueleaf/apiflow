import { test, expect } from '../../../fixtures/electron.fixture';

test.describe('SearchProject', () => {
  // 测试用例1: 搜索无结果展示
  test('输入不存在的项目名称,显示空状态提示', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject();
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
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
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
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
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(300);
    const project2 = await createProject('另一个项目BBB');
    await contentPage.waitForTimeout(300);
    // 返回首页
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
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
  test('点击高级搜索按钮后,高级搜索面板与选项正确展示', async ({ contentPage, clearCache }) => {
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
    // 验证基础信息区域存在
    const basicInfoSection = advancedSearchPanel.locator('.search-section').first();
    await expect(basicInfoSection).toBeVisible();
    // 验证基础信息复选框选项(离线模式下不包含创建者和维护者)
    const basicInfoCheckboxLabels = basicInfoSection.locator('.el-checkbox');
    // 离线模式应该显示5个选项: 项目名称,文档名称,请求URL,请求方法,备注
    await expect(basicInfoCheckboxLabels.first()).toBeVisible();
    // 验证节点类型区域存在
    const nodeTypeSection = advancedSearchPanel.locator('.search-section').nth(1);
    await expect(nodeTypeSection).toBeVisible();
    // 验证节点类型复选框选项
    const nodeTypeLabels = nodeTypeSection.locator('.el-checkbox');
    await expect(nodeTypeLabels).toHaveCount(4);
    // 验证请求参数区域存在
    const requestParamsSection = advancedSearchPanel.locator('.search-section').nth(2);
    await expect(requestParamsSection).toBeVisible();
    // 验证请求参数复选框选项: Query,Path,请求头,Body,返回参数,前置脚本,后置脚本,WebSocket消息
    const requestParamsLabels = requestParamsSection.locator('.el-checkbox');
    await expect(requestParamsLabels).toHaveCount(8);
    // 验证更新日期区域存在
    const dateRangeSection = advancedSearchPanel.locator('.search-section').nth(3);
    await expect(dateRangeSection).toBeVisible();
    // 验证日期单选按钮: 不限制,最近3天,最近1周,最近1月,最近3月,自定义
    const dateRadios = dateRangeSection.locator('.el-radio');
    await expect(dateRadios).toHaveCount(6);
    // 默认不显示日期选择器
    const datePicker = advancedSearchPanel.locator('.custom-date-picker');
    await expect(datePicker).toBeHidden();
    // 点击自定义单选按钮
    const customRadio = dateRangeSection.locator('.el-radio').filter({ hasText: /自定义/ });
    await customRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证日期选择器显示
    await expect(datePicker).toBeVisible({ timeout: 5000 });
    // 验证操作按钮区域存在
    const searchActions = advancedSearchPanel.locator('.search-actions');
    await expect(searchActions).toBeVisible();
    // 验证全选/取消全选和重置按钮
    const actionButtons = searchActions.locator('.el-button');
    await expect(actionButtons).toHaveCount(2);
  });

  // 测试用例3: 搜索条件功能验证
  test('高级搜索可以按节点名称搜索', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    const projectName = await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 添加一个HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '未命名接口' });
    // 返回首页
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    // 输入搜索关键词
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('未命名接口');
    // 验证搜索结果显示
    const searchResults = contentPage.locator('.search-results');
    await expect(searchResults).toBeVisible({ timeout: 5000 });
    const groupTitle = searchResults.locator('.group-title').first();
    await expect(groupTitle).toContainText(projectName, { timeout: 5000 });
    const searchResultItem = searchResults.locator('.search-result-item').first();
    await expect(searchResultItem).toBeVisible({ timeout: 8000 });
    await expect(searchResultItem.locator('.node-name')).toContainText('未命名接口', { timeout: 8000 });
    await expect(searchResultItem.locator('.node-type-label')).toContainText('HTTP', { timeout: 8000 });
  });

  test('高级搜索基础信息选项均可生效', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectKeyword = `ADV_PROJECT_${Date.now()}`;
    const docKeyword = `ADV_DOC_${Date.now()}`;
    const urlKeyword = `ADV_URL_${Date.now()}`;
    const remarkKeyword = `ADV_REMARK_${Date.now()}`;
    const methodKeyword = 'PATCH';
    await createProject(`高级搜索项目-${projectKeyword}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill(`基础信息节点-${docKeyword}`);
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await expect(methodSelect).toBeVisible({ timeout: 5000 });
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    const patchOption = contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: methodKeyword }).first();
    await patchOption.click();
    await contentPage.waitForTimeout(200);
    const urlInputEditable = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInputEditable).toBeVisible({ timeout: 5000 });
    await urlInputEditable.fill(`http://127.0.0.1:3456/${urlKeyword}`);
    await contentPage.waitForTimeout(200);
    const remarksTab = contentPage.locator('[data-testid="http-params-tab-remarks"]');
    await remarksTab.click();
    await contentPage.waitForTimeout(300);
    const editorContent = contentPage.locator('.markdown-editor .ProseMirror');
    await editorContent.click();
    await editorContent.pressSequentially(`这是备注内容-${remarkKeyword}`, { delay: 20 });
    await contentPage.waitForTimeout(200);
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click();
    await contentPage.waitForTimeout(800);
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    const toggleSelectAllBtn = advancedSearchPanel.locator('.search-actions .el-button').first();
    const resetBtn = advancedSearchPanel.locator('.search-actions .el-button').last();
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    const firstResult = contentPage.locator('.search-result-item').first();
    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /项目名称/ }).first().click();
    await searchInput.fill(projectKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('项目名称', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /文档名称/ }).first().click();
    await searchInput.fill(docKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('文档名称', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /请求URL/ }).first().click();
    await searchInput.fill(urlKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('请求URL', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /请求方法/ }).first().click();
    await searchInput.fill(methodKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('请求方法', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /备注/ }).first().click();
    await searchInput.fill(remarkKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('备注', { timeout: 8000 });
  });

  test('高级搜索节点类型筛选选项均可生效', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    const folderKeyword = `ADV_FOLDER_${Date.now()}`;
    const httpKeyword = `ADV_HTTP_${Date.now()}`;
    const wsKeyword = `ADV_WS_${Date.now()}`;
    const mockKeyword = `ADV_MOCK_${Date.now()}`;
    await createProject(`节点类型项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 使用createNode fixture创建4种类型节点
    await createNode(contentPage, { nodeType: 'folder', name: `目录-${folderKeyword}` });
    await createNode(contentPage, { nodeType: 'http', name: `HTTP节点-${httpKeyword}` });
    await createNode(contentPage, { nodeType: 'websocket', name: `WebSocket节点-${wsKeyword}` });
    await createNode(contentPage, { nodeType: 'httpMock', name: `HTTP Mock节点-${mockKeyword}` });
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    const toggleSelectAllBtn = advancedSearchPanel.locator('.search-actions .el-button').first();
    const resetBtn = advancedSearchPanel.locator('.search-actions .el-button').last();
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    const firstResult = contentPage.locator('.search-result-item').first();
    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /文档名称/ }).first().click();
    await contentPage.waitForTimeout(100);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /目录/ }).first().click();
    await searchInput.fill(folderKeyword);
    await expect(firstResult.locator('.node-type-label')).toContainText('目录', { timeout: 8000 });
    await expect(firstResult.locator('.field-tag')).toContainText('文档名称', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /文档名称/ }).first().click();
    await contentPage.waitForTimeout(100);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /HTTP节点/ }).first().click();
    await searchInput.fill(httpKeyword);
    await expect(firstResult.locator('.node-type-label')).toContainText('HTTP', { timeout: 8000 });
    await expect(firstResult.locator('.field-tag')).toContainText('文档名称', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /文档名称/ }).first().click();
    await contentPage.waitForTimeout(100);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /WebSocket节点/ }).first().click();
    await searchInput.fill(wsKeyword);
    await expect(firstResult.locator('.node-type-label')).toContainText('WebSocket', { timeout: 8000 });
    await expect(firstResult.locator('.field-tag')).toContainText('文档名称', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /文档名称/ }).first().click();
    await contentPage.waitForTimeout(100);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /HTTP Mock节点/ }).first().click();
    await searchInput.fill(mockKeyword);
    await expect(firstResult.locator('.node-type-label')).toContainText('HTTP Mock', { timeout: 8000 });
    await expect(firstResult.locator('.field-tag')).toContainText('文档名称', { timeout: 8000 });
  });

  test('高级搜索请求参数选项均可生效', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    test.setTimeout(120000);
    await clearCache();
    const queryKeyword = `ADV_QUERY_${Date.now()}`;
    const pathKeyword = `ADV_PATH_${Date.now()}`;
    const headerKeyword = `ADV_HEADER_${Date.now()}`;
    const bodyKeyword = `ADV_BODY_${Date.now()}`;
    const responseKeyword = `ADV_RESPONSE_${Date.now()}`;
    const preScriptKeyword = `ADV_PRESCRIPT_${Date.now()}`;
    const afterScriptKeyword = `ADV_AFTERSCRIPT_${Date.now()}`;
    const wsMessageKeyword = `ADV_WSMESSAGE_${Date.now()}`;
    await createProject(`请求参数项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill(`请求参数HTTP节点-${Date.now()}`);
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const url = `http://127.0.0.1:3456/users/{${pathKeyword}}?q=${queryKeyword}`;
    const urlInputEditable = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInputEditable).toBeVisible({ timeout: 5000 });
    await urlInputEditable.fill(url);
    await contentPage.waitForTimeout(200);
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    const headerKeyInput = contentPage.locator('[data-testid="params-tree-key-autocomplete"] input, [data-testid="params-tree-key-input"] input').first();
    await expect(headerKeyInput).toBeVisible({ timeout: 5000 });
    await headerKeyInput.click();
    await headerKeyInput.fill('X-ADV-HEADER');
    await contentPage.waitForTimeout(200);
    const headerValueInput = contentPage.locator('[data-testid="params-tree-value-input"]').first();
    await expect(headerValueInput).toBeVisible({ timeout: 5000 });
    await headerValueInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(headerKeyword);
    await contentPage.waitForTimeout(200);
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    const bodyPanel = contentPage.locator('.body-params');
    await expect(bodyPanel).toBeVisible({ timeout: 5000 });
    const jsonRadio = bodyPanel.locator('.el-radio').filter({ hasText: /json/i }).first();
    await jsonRadio.click();
    await expect(bodyPanel.locator('.json-wrap')).toBeVisible({ timeout: 15000 });
    const jsonTip = bodyPanel.locator('.json-tip');
    const jsonTipVisible = await jsonTip.isVisible();
    if (jsonTipVisible) {
      const hideTipBtn = jsonTip.locator('.no-tip');
      await hideTipBtn.click();
      await expect(jsonTip).toBeHidden({ timeout: 5000 });
    }
    const bodyEditor = bodyPanel.locator('.json-wrap .monaco-editor').first();
    await expect(bodyEditor).toBeVisible({ timeout: 15000 });
    await bodyEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`{"keyword":"${bodyKeyword}"}`);
    await contentPage.waitForTimeout(300);
    const responseTab = contentPage.locator('[data-testid="http-params-tab-response"]');
    await responseTab.click();
    await contentPage.waitForTimeout(300);
    const responseParams = contentPage.locator('.response-params');
    await expect(responseParams).toBeVisible({ timeout: 5000 });
    const firstCard = responseParams.locator('.response-collapse-card').first();
    const editIcon = firstCard.locator('.edit-icon').first();
    await editIcon.click();
    await contentPage.waitForTimeout(200);
    const editInput = firstCard.locator('.edit-input');
    await editInput.fill(responseKeyword);
    const confirmTitleBtn = firstCard.locator('span').filter({ hasText: /确定|Confirm/ }).first();
    await confirmTitleBtn.click();
    await contentPage.waitForTimeout(300);
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(400);
    const preEditor = contentPage.locator('.editor-wrap .s-monaco-editor').first();
    await expect(preEditor).toBeVisible({ timeout: 5000 });
    await preEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`const advPre = "${preScriptKeyword}";`);
    await contentPage.waitForTimeout(200);
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(400);
    const afterEditor = contentPage.locator('.editor-wrap .s-monaco-editor').first();
    await expect(afterEditor).toBeVisible({ timeout: 5000 });
    await afterEditor.click();
    await contentPage.waitForTimeout(200);
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`const advAfter = "${afterScriptKeyword}";`);
    await contentPage.waitForTimeout(200);
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click();
    await contentPage.waitForTimeout(800);
    await addHttpBtn.click();
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill(`请求参数WS节点-${Date.now()}`);
    await addApiDialog.locator('.el-radio').filter({ hasText: /^WebSocket$/ }).click();
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(800);
    const addBlockBtn = contentPage.locator('.add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    const blockNameInput = contentPage.locator('.message-block .block-name-input input').first();
    await expect(blockNameInput).toBeVisible({ timeout: 5000 });
    await blockNameInput.fill(wsMessageKeyword);
    await contentPage.waitForTimeout(600);
    const wsSaveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await expect(wsSaveBtn).toBeVisible({ timeout: 5000 });
    await wsSaveBtn.click();
    await contentPage.waitForTimeout(800);
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    const toggleSelectAllBtn = advancedSearchPanel.locator('.search-actions .el-button').first();
    const resetBtn = advancedSearchPanel.locator('.search-actions .el-button').last();
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    const firstResult = contentPage.locator('.search-result-item').first();
    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /Query参数/ }).first().click();
    await searchInput.fill(queryKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('Query参数', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /Path参数/ }).first().click();
    await searchInput.fill(pathKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('Path参数', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /请求头参数/ }).first().click();
    await searchInput.fill(headerKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('请求头参数', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /Body参数/ }).first().click();
    await searchInput.fill(bodyKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('Body参数', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /返回参数/ }).first().click();
    await searchInput.fill(responseKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('返回参数', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /前置脚本/ }).first().click();
    await searchInput.fill(preScriptKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('前置脚本', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /后置脚本/ }).first().click();
    await searchInput.fill(afterScriptKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('后置脚本', { timeout: 8000 });

    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    await advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /WebSocket消息/ }).first().click();
    await searchInput.fill(wsMessageKeyword);
    await expect(firstResult.locator('.field-tag')).toContainText('WebSocket消息', { timeout: 8000 });
  });

  test('高级搜索更新日期选项均可生效', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const docKeyword = `ADV_DATE_${Date.now()}`;
    await createProject(`更新日期项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill(`更新日期节点-${docKeyword}`);
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(800);
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    const advancedSearchPanel = contentPage.locator('.advanced-search-panel');
    await expect(advancedSearchPanel).toBeVisible({ timeout: 5000 });
    const toggleSelectAllBtn = advancedSearchPanel.locator('.search-actions .el-button').first();
    const resetBtn = advancedSearchPanel.locator('.search-actions .el-button').last();
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    const firstResult = contentPage.locator('.search-result-item').first();
    await resetBtn.click();
    await contentPage.waitForTimeout(200);
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    const docNameCheckbox = advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /文档名称/ }).first();
    await docNameCheckbox.click();
    await contentPage.waitForTimeout(200);
    await searchInput.fill(docKeyword);
    await contentPage.waitForTimeout(600);
    await expect(firstResult).toBeVisible({ timeout: 8000 });
    await advancedSearchPanel.locator('.el-radio').filter({ hasText: /不限制/ }).first().click();
    await expect(firstResult).toBeVisible({ timeout: 8000 });

    await advancedSearchPanel.locator('.el-radio').filter({ hasText: /最近3天/ }).first().click();
    await expect(firstResult).toBeVisible({ timeout: 8000 });

    await advancedSearchPanel.locator('.el-radio').filter({ hasText: /最近1周/ }).first().click();
    await expect(firstResult).toBeVisible({ timeout: 8000 });

    await advancedSearchPanel.locator('.el-radio').filter({ hasText: /最近1月/ }).first().click();
    await expect(firstResult).toBeVisible({ timeout: 8000 });

    await advancedSearchPanel.locator('.el-radio').filter({ hasText: /最近3月/ }).first().click();
    await expect(firstResult).toBeVisible({ timeout: 8000 });

    await advancedSearchPanel.locator('.el-radio').filter({ hasText: /自定义/ }).first().click();
    await expect(firstResult).toBeVisible({ timeout: 8000 });
    const dateInputs = advancedSearchPanel.locator('.custom-date-picker input');
    await expect(dateInputs).toHaveCount(2, { timeout: 5000 });
    await dateInputs.nth(0).fill('2000-01-01');
    await dateInputs.nth(1).fill('2000-01-02');
    await dateInputs.nth(1).press('Enter');
    await contentPage.waitForTimeout(300);
    await searchInput.fill(`${docKeyword} `);
    await contentPage.waitForTimeout(100);
    await searchInput.fill(docKeyword);
    await contentPage.waitForTimeout(600);
    const emptyState = contentPage.locator('.search-results .empty-state');
    await expect(emptyState).toBeVisible({ timeout: 8000 });
  });

  // 测试用例4: 搜索结果UI显示
  test('搜索结果按项目分组显示', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const projectName = await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加一个HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill('未命名接口');
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
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
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加一个HTTP节点
    const addHttpBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill('未命名接口');
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
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
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 添加一个HTTP节点
    await contentPage.getByTestId('banner-add-http-btn').click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill('未命名接口');
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    // 返回首页
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    // 输入搜索关键词
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('未命名');
    // 验证搜索结果项
    const searchResultItem = contentPage.locator('.search-result-item').first();
    await expect(searchResultItem).toBeVisible({ timeout: 5000 });
    // 验证匹配信息区域
    const matchInfo = searchResultItem.locator('.match-info');
    await expect(matchInfo).toBeVisible();
    // 验证匹配标签
    const matchLabel = matchInfo.locator('.match-label');
    await expect(matchLabel).toBeVisible();
    await expect(matchLabel).toContainText(/匹配/, { timeout: 5000 });
    const fieldTag = matchInfo.locator('.field-tag').first();
    await expect(fieldTag).toContainText(/文档名称/, { timeout: 8000 });
  });

  test('点击搜索结果项跳转到对应节点', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 添加一个HTTP节点
    const nodeName = `跳转节点-${Date.now()}`;
    const nodeId = await createNode(contentPage, { nodeType: 'http', name: nodeName });
    // 返回首页
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    // 展开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    // 输入搜索关键词
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill(nodeName);
    // 点击搜索结果项
    const searchResultItem = contentPage.locator('.search-result-item').filter({ hasText: nodeName }).first();
    await expect(searchResultItem).toBeVisible({ timeout: 5000 });
    await searchResultItem.click();
    // 验证跳转到项目工作区
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await expect(contentPage).toHaveURL(new RegExp(`nodeId=${encodeURIComponent(nodeId)}`), { timeout: 10000 });
    const activeNavTab = contentPage.locator('[data-testid^="project-nav-tab-"].active').first();
    await expect(activeNavTab).toContainText(nodeName, { timeout: 10000 });
  });

  test('高级搜索无结果时显示空状态提示', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
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
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    const keyword = `reset_${Date.now()}`;
    await searchInput.fill(keyword);
    await contentPage.waitForTimeout(400);
    const toggleSelectAllBtn = advancedSearchPanel.locator('.search-actions .el-button').first();
    await toggleSelectAllBtn.click();
    await contentPage.waitForTimeout(200);
    const customRadio = advancedSearchPanel.locator('.el-radio').filter({ hasText: /自定义/ }).first();
    await customRadio.click();
    await contentPage.waitForTimeout(300);
    const dateInputs = advancedSearchPanel.locator('.custom-date-picker input');
    await expect(dateInputs).toHaveCount(2, { timeout: 5000 });
    await dateInputs.nth(0).fill('2000-01-01');
    await dateInputs.nth(1).fill('2000-01-02');
    await dateInputs.nth(1).press('Enter');
    await contentPage.waitForTimeout(200);
    // 点击重置按钮
    const resetBtn = advancedSearchPanel.locator('.search-actions .el-button').last();
    await resetBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证复选框恢复选中状态
    const checkboxInput = advancedSearchPanel.locator('.el-checkbox').first().locator('input');
    await expect(checkboxInput).toBeChecked();
    await expect(searchInput).toHaveValue(keyword);
    const checkedRadio = advancedSearchPanel.locator('.el-radio.is-checked').first();
    await expect(checkedRadio).toContainText(/不限制/);
    const datePicker = advancedSearchPanel.locator('.custom-date-picker');
    await expect(datePicker).toBeHidden();
  });

  test('点击搜索结果项跳转后,header正确创建并高亮tab', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    const projectName = await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '搜索测试HTTP' });
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 打开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    // 搜索节点
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('搜索测试HTTP');
    await contentPage.waitForTimeout(500);
    // 点击搜索结果项
    const searchResultItem = contentPage.locator('.search-result-item').first();
    await expect(searchResultItem).toBeVisible({ timeout: 5000 });
    await searchResultItem.click();
    // 验证跳转到项目工作区
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 验证header中创建了项目tab
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTab).toBeVisible({ timeout: 5000 });
    // 验证tab处于激活状态
    await expect(projectTab).toHaveClass(/active/);
  });

  test('点击不同节点类型的搜索结果,tab正确创建并跳转到对应节点', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    const projectName = await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const httpNodeId = await createNode(contentPage, { nodeType: 'http', name: 'HTTP搜索节点' });
    await contentPage.waitForTimeout(300);
    // 创建WebSocket节点
    const wsNodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'WebSocket搜索节点' });
    await contentPage.waitForTimeout(300);
    // 创建HTTP Mock节点
    const mockNodeId = await createNode(contentPage, { nodeType: 'httpMock', name: 'Mock搜索节点' });
    await contentPage.waitForTimeout(300);
    // 返回首页
    const logo = topBarPage.locator('[data-test-id="header-logo"]');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 打开高级搜索面板
    const advancedSearchBtn = contentPage.locator('[data-testid="home-advanced-search-btn"]');
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    // 搜索HTTP节点
    const searchInput = contentPage.locator('[data-testid="home-project-search-input"]');
    await searchInput.fill('HTTP搜索节点');
    await contentPage.waitForTimeout(500);
    const httpResultItem = contentPage.locator('.search-result-item').filter({ hasText: /HTTP搜索节点/ }).first();
    await expect(httpResultItem).toBeVisible({ timeout: 5000 });
    await httpResultItem.click();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证跳转到对应节点
    const url1 = contentPage.url();
    const nodeId1Match = /[?&]nodeId=([^&]+)/.exec(url1);
    const nodeId1 = decodeURIComponent(nodeId1Match?.[1] || '');
    expect(nodeId1).toBe(httpNodeId);
    const activeNavTab1 = contentPage.locator('[data-testid^="project-nav-tab-"].active').first();
    await expect(activeNavTab1).toContainText(/HTTP搜索节点/, { timeout: 10000 });
    // 返回首页搜索WebSocket节点
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await searchInput.fill('WebSocket搜索节点');
    await contentPage.waitForTimeout(500);
    const wsResultItem = contentPage.locator('.search-result-item').filter({ hasText: /WebSocket搜索节点/ }).first();
    await expect(wsResultItem).toBeVisible({ timeout: 5000 });
    await wsResultItem.click();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证跳转到对应节点
    const url2 = contentPage.url();
    const nodeId2Match = /[?&]nodeId=([^&]+)/.exec(url2);
    const nodeId2 = decodeURIComponent(nodeId2Match?.[1] || '');
    expect(nodeId2).toBe(wsNodeId);
    const activeNavTab2 = contentPage.locator('[data-testid^="project-nav-tab-"].active').first();
    await expect(activeNavTab2).toContainText(/WebSocket搜索节点/, { timeout: 10000 });
    // 验证tab始终只有一个项目tab(没有重复创建)
    const projectTabs = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName });
    await expect(projectTabs).toHaveCount(1);

    // 返回首页搜索Mock节点
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await advancedSearchBtn.click();
    await contentPage.waitForTimeout(300);
    await searchInput.fill('Mock搜索节点');
    await contentPage.waitForTimeout(500);
    const mockResultItem = contentPage.locator('.search-result-item').filter({ hasText: /Mock搜索节点/ }).first();
    await expect(mockResultItem).toBeVisible({ timeout: 5000 });
    await mockResultItem.click();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证跳转到对应节点
    const url3 = contentPage.url();
    const nodeId3Match = /[?&]nodeId=([^&]+)/.exec(url3);
    const nodeId3 = decodeURIComponent(nodeId3Match?.[1] || '');
    expect(nodeId3).toBe(mockNodeId);
    const activeNavTab3 = contentPage.locator('[data-testid^="project-nav-tab-"].active').first();
    await expect(activeNavTab3).toContainText(/Mock搜索节点/, { timeout: 10000 });
  });
});
