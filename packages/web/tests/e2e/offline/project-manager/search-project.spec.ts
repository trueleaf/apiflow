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
    const logo = topBarPage.locator('.logo-img');
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
    const logo = topBarPage.locator('.logo-img');
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
  test('高级搜索可以按节点名称搜索', async ({ topBarPage, contentPage, clearCache, createProject }) => {
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
    const logo = topBarPage.locator('.logo-img');
    await logo.click();
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 });
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
    const logo = topBarPage.locator('.logo-img');
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
    const assertMatch = async (checkboxText: RegExp, keyword: string, expectFieldText: string) => {
      await resetBtn.click();
      await contentPage.waitForTimeout(200);
      await toggleSelectAllBtn.click();
      await contentPage.waitForTimeout(200);
      const checkbox = advancedSearchPanel.locator('.el-checkbox').filter({ hasText: checkboxText }).first();
      await checkbox.click();
      await contentPage.waitForTimeout(200);
      await searchInput.fill('');
      await contentPage.waitForTimeout(100);
      await searchInput.fill(keyword);
      await contentPage.waitForTimeout(500);
      await expect(firstResult).toBeVisible({ timeout: 8000 });
      await expect(firstResult.locator('.field-tag')).toContainText(expectFieldText);
    };
    await assertMatch(/项目名称/, projectKeyword, '项目名称');
    await assertMatch(/文档名称/, docKeyword, '文档名称');
    await assertMatch(/请求URL/, urlKeyword, '请求URL');
    await assertMatch(/请求方法/, methodKeyword, '请求方法');
    await assertMatch(/备注/, remarkKeyword, '备注');
  });

  test('高级搜索节点类型筛选选项均可生效', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    const folderKeyword = `ADV_FOLDER_${Date.now()}`;
    const httpKeyword = `ADV_HTTP_${Date.now()}`;
    const wsKeyword = `ADV_WS_${Date.now()}`;
    const mockKeyword = `ADV_MOCK_${Date.now()}`;
    await createProject(`节点类型项目-${Date.now()}`);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const newFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
    await newFolderItem.click();
    await contentPage.waitForTimeout(300);
    const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
    await expect(folderDialog).toBeVisible({ timeout: 5000 });
    await folderDialog.locator('input').first().fill(`目录-${folderKeyword}`);
    await folderDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await treeWrap.click({ button: 'right', position: { x: 100, y: 240 } });
    await contentPage.waitForTimeout(300);
    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const httpDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(httpDialog).toBeVisible({ timeout: 5000 });
    await httpDialog.locator('input').first().fill(`HTTP节点-${httpKeyword}`);
    await httpDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await treeWrap.click({ button: 'right', position: { x: 100, y: 280 } });
    await contentPage.waitForTimeout(300);
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const wsDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(wsDialog).toBeVisible({ timeout: 5000 });
    await wsDialog.locator('input').first().fill(`WebSocket节点-${wsKeyword}`);
    const wsRadio = wsDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first();
    await wsRadio.click();
    await contentPage.waitForTimeout(200);
    await wsDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await treeWrap.click({ button: 'right', position: { x: 100, y: 320 } });
    await contentPage.waitForTimeout(300);
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const mockDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(mockDialog).toBeVisible({ timeout: 5000 });
    await mockDialog.locator('input').first().fill(`HTTP Mock节点-${mockKeyword}`);
    const mockRadio = mockDialog.locator('.el-radio').filter({ hasText: 'HTTP Mock' }).first();
    await mockRadio.click();
    await contentPage.waitForTimeout(200);
    await mockDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const logo = topBarPage.locator('.logo-img');
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
    const assertNodeType = async (nodeTypeText: RegExp, keyword: string, expectTypeLabel: string) => {
      await resetBtn.click();
      await contentPage.waitForTimeout(200);
      await toggleSelectAllBtn.click();
      await contentPage.waitForTimeout(200);
      const docNameCheckbox = advancedSearchPanel.locator('.el-checkbox').filter({ hasText: /文档名称/ }).first();
      await docNameCheckbox.click();
      await contentPage.waitForTimeout(100);
      const nodeTypeCheckbox = advancedSearchPanel.locator('.el-checkbox').filter({ hasText: nodeTypeText }).first();
      await nodeTypeCheckbox.click();
      await contentPage.waitForTimeout(200);
      await searchInput.fill('');
      await contentPage.waitForTimeout(100);
      await searchInput.fill(keyword);
      await contentPage.waitForTimeout(500);
      await expect(firstResult).toBeVisible({ timeout: 8000 });
      await expect(firstResult.locator('.node-type-label')).toContainText(expectTypeLabel);
      await expect(firstResult.locator('.field-tag')).toContainText('文档名称');
    };
    await assertNodeType(/目录/, folderKeyword, '目录');
    await assertNodeType(/HTTP/, httpKeyword, 'HTTP');
    await assertNodeType(/WebSocket/, wsKeyword, 'WebSocket');
    await assertNodeType(/HTTP Mock/, mockKeyword, 'HTTP Mock');
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
    if (await jsonTip.isVisible()) {
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
    const logo = topBarPage.locator('.logo-img');
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
    const assertParam = async (checkboxText: RegExp, keyword: string, expectFieldText: string) => {
      await resetBtn.click();
      await contentPage.waitForTimeout(200);
      await toggleSelectAllBtn.click();
      await contentPage.waitForTimeout(200);
      const checkbox = advancedSearchPanel.locator('.el-checkbox').filter({ hasText: checkboxText }).first();
      await checkbox.click();
      await contentPage.waitForTimeout(200);
      await searchInput.fill('');
      await contentPage.waitForTimeout(100);
      await searchInput.fill(keyword);
      await contentPage.waitForTimeout(600);
      await expect(firstResult).toBeVisible({ timeout: 8000 });
      await expect(firstResult.locator('.field-tag')).toContainText(expectFieldText);
    };
    await assertParam(/Query参数/, queryKeyword, 'Query参数');
    await assertParam(/Path参数/, pathKeyword, 'Path参数');
    await assertParam(/请求头参数/, headerKeyword, '请求头参数');
    await assertParam(/Body参数/, bodyKeyword, 'Body参数');
    await assertParam(/返回参数/, responseKeyword, '返回参数');
    await assertParam(/前置脚本/, preScriptKeyword, '前置脚本');
    await assertParam(/后置脚本/, afterScriptKeyword, '后置脚本');
    await assertParam(/WebSocket消息/, wsMessageKeyword, 'WebSocket消息');
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
    const logo = topBarPage.locator('.logo-img');
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
    const setDateRangeAndAssert = async (radioText: RegExp, expectEmpty: boolean) => {
      const radio = advancedSearchPanel.locator('.el-radio').filter({ hasText: radioText }).first();
      await radio.click();
      await contentPage.waitForTimeout(300);
      await searchInput.fill(`${docKeyword} `);
      await contentPage.waitForTimeout(100);
      await searchInput.fill(docKeyword);
      await contentPage.waitForTimeout(600);
      if (expectEmpty) {
        const emptyState = contentPage.locator('.search-results .empty-state');
        await expect(emptyState).toBeVisible({ timeout: 8000 });
        return;
      }
      await expect(firstResult).toBeVisible({ timeout: 8000 });
    };
    await setDateRangeAndAssert(/不限制/, false);
    await setDateRangeAndAssert(/最近3天/, false);
    await setDateRangeAndAssert(/最近1周/, false);
    await setDateRangeAndAssert(/最近1月/, false);
    await setDateRangeAndAssert(/最近3月/, false);
    await setDateRangeAndAssert(/自定义/, false);
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
    const logo = topBarPage.locator('.logo-img');
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
    const logo = topBarPage.locator('.logo-img');
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
    const logo = topBarPage.locator('.logo-img');
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
    const logo = topBarPage.locator('.logo-img');
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
    // 点击搜索结果项
    const searchResultItem = contentPage.locator('.search-result-item').first();
    await expect(searchResultItem).toBeVisible({ timeout: 5000 });
    await searchResultItem.click();
    // 验证跳转到项目工作区
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
  });

  test('高级搜索无结果时显示空状态提示', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 返回首页
    const logo = topBarPage.locator('.logo-img');
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
});
