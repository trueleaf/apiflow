import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('AddNode', () => {
  test.describe('添加HTTP节点', () => {
    // 测试用例1: 鼠标右键空白区域添加http节点
    test('鼠标右键空白区域添加http节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 在空白区域右键
      const treeWrap = contentPage.locator('.tree-wrap');
      await expect(treeWrap).toBeVisible({ timeout: 5000 });
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      // 验证右键菜单出现
      const contextMenu = contentPage.locator('.s-contextmenu');
      await expect(contextMenu).toBeVisible({ timeout: 3000 });
      // 点击"新建接口"选项
      const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      await expect(newInterfaceItem).toBeVisible();
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 验证新建接口对话框出现
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      // 输入接口名称
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('测试HTTP接口');
      // 确保HTTP类型被选中(默认选中)
      const httpRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'HTTP' }).first();
      await expect(httpRadio).toBeVisible();
      // 点击确定按钮
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证对话框关闭
      await expect(addFileDialog).toBeHidden({ timeout: 5000 });
      // 验证新节点出现在树中
      const newNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试HTTP接口' });
      await expect(newNode).toBeVisible({ timeout: 5000 });
    });
    // 测试用例2: 鼠标右键目录添加http节点
    test('鼠标右键目录添加http节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 首先创建一个文件夹
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写文件夹名称
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('测试文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证文件夹创建成功
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试文件夹' });
      await expect(folderNode).toBeVisible({ timeout: 5000 });
      // 右键文件夹节点
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 点击"新建接口"
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await expect(newInterfaceItem).toBeVisible();
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 填写HTTP接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('目录下HTTP接口');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证新HTTP节点出现在文件夹下
      const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目录下HTTP接口' });
      await expect(httpNode).toBeVisible({ timeout: 5000 });
    });
    // 测试用例3: 点击新增按钮添加http节点
    test('点击新增按钮添加http节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 点击更多操作按钮
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await expect(moreBtn).toBeVisible({ timeout: 5000 });
      await moreBtn.click();
      await contentPage.waitForTimeout(300);
      // 点击新增文件选项
      const toolPanel = contentPage.locator('.tool-panel');
      await expect(toolPanel).toBeVisible({ timeout: 5000 });
      const addFileItem = toolPanel.locator('[data-testid="tool-panel-banner-add-http-btn"]');
      await expect(addFileItem).toBeVisible({ timeout: 5000 });
      await addFileItem.click();
      await contentPage.waitForTimeout(300);
      // 填写接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('工具栏添加HTTP接口');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现
      const newNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '工具栏添加HTTP接口' });
      await expect(newNode).toBeVisible({ timeout: 5000 });
    });
    // 测试用例4: 鼠标右键空白区域添加http节点(AI) - 需要配置AI
    test('鼠标右键空白区域添加http节点(AI)', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 配置AI设置
      const aiApiUrl = process.env.TEST_AI_API_URL;
      const aiApiKey = process.env.TEST_AI_API_KEY;
      if (!aiApiUrl || !aiApiKey) {
        test.skip();
        return;
      }
      await contentPage.evaluate(({ apiUrl, apiKey }) => {
        const llmConfig = {
          baseURL: apiUrl,
          apiKey: apiKey,
          model: 'deepseek-chat',
          customHeaders: []
        };
        localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify(llmConfig));
      }, { apiUrl: aiApiUrl, apiKey: aiApiKey });
      await contentPage.waitForTimeout(300);
      // 在空白区域右键
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      // 点击"新建接口"选项
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 验证新建接口对话框出现
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      // 输入接口名称
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('AI生成的HTTP接口');
      // 验证AI提示词输入框存在
      const aiPromptEditor = addFileDialog.locator('[data-testid="add-file-ai-prompt-editor"] .monaco-editor');
      await expect(aiPromptEditor).toBeVisible({ timeout: 5000 });
      // 输入AI提示词
      await aiPromptEditor.click();
      await contentPage.keyboard.type('创建一个获取用户列表的接口,GET请求,路径/api/users');
      await contentPage.waitForTimeout(300);
      // 点击确定按钮
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      // 等待AI处理(较长超时)
      await expect(addFileDialog).toBeHidden({ timeout: 60000 });
      // 验证新节点出现
      const newNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'AI生成的HTTP接口' });
      await expect(newNode).toBeVisible({ timeout: 5000 });
    });
  });
  test.describe('添加WebSocket节点', () => {
    // 测试用例5: 鼠标右键空白区域添加websocket节点
    test('鼠标右键空白区域添加websocket节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 在空白区域右键
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      // 点击"新建接口"选项
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 验证新建接口对话框出现
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      // 输入接口名称
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('测试WebSocket接口');
      // 选择WebSocket类型
      const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first();
      await wsRadio.click();
      await contentPage.waitForTimeout(200);
      // 点击确定按钮
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证对话框关闭
      await expect(addFileDialog).toBeHidden({ timeout: 5000 });
      // 验证新WebSocket节点出现在树中
      const newNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试WebSocket接口' });
      await expect(newNode).toBeVisible({ timeout: 5000 });
    });
    // 测试用例6: 鼠标右键目录添加websocket节点
    test('鼠标右键目录添加websocket节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 首先创建一个文件夹
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写文件夹名称
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('WebSocket文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键文件夹节点
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'WebSocket文件夹' });
      await expect(folderNode).toBeVisible({ timeout: 5000 });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 点击"新建接口"
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 填写WebSocket接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('目录下WebSocket接口');
      // 选择WebSocket类型
      const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first();
      await wsRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证新WebSocket节点出现
      const wsNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目录下WebSocket接口' });
      await expect(wsNode).toBeVisible({ timeout: 5000 });
    });
    // 测试用例7: 点击新增按钮添加websocket节点
    test('点击新增按钮添加websocket节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 点击更多操作按钮
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await moreBtn.click();
      await contentPage.waitForTimeout(300);
      // 点击新增文件选项
      const toolPanel = contentPage.locator('.tool-panel');
      await expect(toolPanel).toBeVisible({ timeout: 5000 });
      const addFileItem = toolPanel.locator('[data-testid="tool-panel-banner-add-http-btn"]');
      await expect(addFileItem).toBeVisible({ timeout: 5000 });
      await addFileItem.click();
      await contentPage.waitForTimeout(300);
      // 填写接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('工具栏添加WebSocket接口');
      // 选择WebSocket类型
      const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first();
      await wsRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现
      const newNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '工具栏添加WebSocket接口' });
      await expect(newNode).toBeVisible({ timeout: 5000 });
    });
  });
  test.describe('添加HTTP Mock节点', () => {
    // 测试用例8: 鼠标右键空白区域添加httpMock节点
    test('鼠标右键空白区域添加httpMock节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 在空白区域右键
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      // 点击"新建接口"选项
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 验证新建接口对话框出现
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      // 输入接口名称
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('测试HTTP Mock接口');
      // 选择HTTP Mock类型
      const mockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'HTTP Mock' });
      await mockRadio.click();
      await contentPage.waitForTimeout(200);
      // 点击确定按钮
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证对话框关闭
      await expect(addFileDialog).toBeHidden({ timeout: 5000 });
      // 验证新HTTP Mock节点出现在树中
      const newNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试HTTP Mock接口' });
      await expect(newNode).toBeVisible({ timeout: 5000 });
    });
    // 测试用例9: 鼠标右键目录添加httpMock节点
    test('鼠标右键目录添加httpMock节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 首先创建一个文件夹
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写文件夹名称
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('Mock文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键文件夹节点
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'Mock文件夹' });
      await expect(folderNode).toBeVisible({ timeout: 5000 });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 点击"新建接口"
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 填写HTTP Mock接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('目录下HTTP Mock接口');
      // 选择HTTP Mock类型
      const mockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'HTTP Mock' });
      await mockRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证新HTTP Mock节点出现
      const mockNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目录下HTTP Mock接口' });
      await expect(mockNode).toBeVisible({ timeout: 5000 });
    });
    // 测试用例10: 点击新增按钮添加httpMock节点
    test('点击新增按钮添加httpMock节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 点击更多操作按钮
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await moreBtn.click();
      await contentPage.waitForTimeout(300);
      // 点击新增文件选项
      const toolPanel = contentPage.locator('.tool-panel');
      await expect(toolPanel).toBeVisible({ timeout: 5000 });
      const addFileItem = toolPanel.locator('[data-testid="tool-panel-banner-add-http-btn"]');
      await expect(addFileItem).toBeVisible({ timeout: 5000 });
      await addFileItem.click();
      await contentPage.waitForTimeout(300);
      // 填写接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('工具栏添加HTTP Mock接口');
      // 选择HTTP Mock类型
      const mockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'HTTP Mock' });
      await mockRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现
      const newNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '工具栏添加HTTP Mock接口' });
      await expect(newNode).toBeVisible({ timeout: 5000 });
    });
  });
  test.describe('添加WebSocket Mock节点', () => {
    // 测试用例11: 鼠标右键空白区域添加websocketMock节点
    test('鼠标右键空白区域添加websocketMock节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 在空白区域右键
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      // 点击"新建接口"选项
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 验证新建接口对话框出现
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      // 输入接口名称
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('测试WebSocket Mock接口');
      // 选择WebSocket Mock类型
      const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket Mock' });
      await wsMockRadio.click();
      await contentPage.waitForTimeout(200);
      // 点击确定按钮
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证对话框关闭
      await expect(addFileDialog).toBeHidden({ timeout: 5000 });
      // 验证新WebSocket Mock节点出现在树中
      const newNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试WebSocket Mock接口' });
      await expect(newNode).toBeVisible({ timeout: 5000 });
    });
    // 测试用例12: 鼠标右键目录添加websocketMock节点
    test('鼠标右键目录添加websocketMock节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 首先创建一个文件夹
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写文件夹名称
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('WebSocket Mock文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键文件夹节点
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'WebSocket Mock文件夹' });
      await expect(folderNode).toBeVisible({ timeout: 5000 });
      await folderNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 点击"新建接口"
      const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 填写WebSocket Mock接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('目录下WebSocket Mock接口');
      // 选择WebSocket Mock类型
      const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket Mock' });
      await wsMockRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证新WebSocket Mock节点出现
      const wsMockNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '目录下WebSocket Mock接口' });
      await expect(wsMockNode).toBeVisible({ timeout: 5000 });
    });
    // 测试用例13: 点击新增按钮添加websocketMock节点
    test('点击新增按钮添加websocketMock节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 点击更多操作按钮
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await moreBtn.click();
      await contentPage.waitForTimeout(300);
      // 点击新增文件选项
      const toolPanel = contentPage.locator('.tool-panel');
      await expect(toolPanel).toBeVisible({ timeout: 5000 });
      const addFileItem = toolPanel.locator('[data-testid="tool-panel-banner-add-http-btn"]');
      await expect(addFileItem).toBeVisible({ timeout: 5000 });
      await addFileItem.click();
      await contentPage.waitForTimeout(300);
      // 填写接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('工具栏添加WebSocket Mock接口');
      // 选择WebSocket Mock类型
      const wsMockRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket Mock' });
      await wsMockRadio.click();
      await contentPage.waitForTimeout(200);
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证新节点出现
      const newNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '工具栏添加WebSocket Mock接口' });
      await expect(newNode).toBeVisible({ timeout: 5000 });
    });
  });
  test.describe('添加Folder节点', () => {
    // 测试用例14: 鼠标右键空白区域添加folder节点
    test('鼠标右键空白区域添加folder节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 在空白区域右键
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      // 点击"新建文件夹"选项
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
      await expect(newFolderItem).toBeVisible();
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 验证新建文件夹对话框出现
      const addFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
      // 输入文件夹名称
      const nameInput = addFolderDialog.locator('input').first();
      await nameInput.fill('测试文件夹');
      // 点击确定按钮
      const confirmBtn = addFolderDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证对话框关闭
      await expect(addFolderDialog).toBeHidden({ timeout: 5000 });
      // 验证新文件夹节点出现在树中
      const newFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试文件夹' });
      await expect(newFolder).toBeVisible({ timeout: 5000 });
    });
    // 测试用例15: 鼠标右键目录添加folder节点
    test('鼠标右键目录添加folder节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 首先创建一个父文件夹
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写父文件夹名称
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('父文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键父文件夹节点
      const parentFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '父文件夹' });
      await expect(parentFolder).toBeVisible({ timeout: 5000 });
      await parentFolder.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 点击"新建文件夹"
      const newSubFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await newSubFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写子文件夹名称
      const subFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(subFolderDialog).toBeVisible({ timeout: 5000 });
      const subFolderNameInput = subFolderDialog.locator('input').first();
      await subFolderNameInput.fill('子文件夹');
      const subFolderConfirmBtn = subFolderDialog.locator('.el-button--primary').last();
      await subFolderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证子文件夹出现
      const subFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '子文件夹' });
      await expect(subFolder).toBeVisible({ timeout: 5000 });
    });
    // 测试用例16: 点击新增按钮添加folder节点
    test('点击新增按钮添加folder节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 点击更多操作按钮
      const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
      await moreBtn.click();
      await contentPage.waitForTimeout(300);
      // 点击新增文件夹选项
      const toolPanel = contentPage.locator('.tool-panel');
      await expect(toolPanel).toBeVisible({ timeout: 5000 });
      const addFolderItem = toolPanel.locator('[data-testid="tool-panel-banner-add-folder-btn"]');
      await expect(addFolderItem).toBeVisible({ timeout: 5000 });
      await addFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写文件夹名称
      const addFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFolderDialog.locator('input').first();
      await nameInput.fill('工具栏添加文件夹');
      const confirmBtn = addFolderDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证新文件夹出现
      const newFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '工具栏添加文件夹' });
      await expect(newFolder).toBeVisible({ timeout: 5000 });
    });
    // 测试用例17: 在folder节点上点击更多按钮添加folder节点
    test('在folder节点上点击更多按钮添加folder节点', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 首先创建一个文件夹
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
      await newFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写文件夹名称
      const folderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(folderDialog).toBeVisible({ timeout: 5000 });
      const folderNameInput = folderDialog.locator('input').first();
      await folderNameInput.fill('更多按钮测试文件夹');
      const folderConfirmBtn = folderDialog.locator('.el-button--primary').last();
      await folderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 鼠标悬停在文件夹节点上并点击更多按钮
      const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '更多按钮测试文件夹' });
      await expect(folderNode).toBeVisible({ timeout: 5000 });
      await folderNode.hover();
      await contentPage.waitForTimeout(200);
      const moreBtn = folderNode.locator('[data-testid="banner-node-more-btn"]');
      await moreBtn.click();
      await contentPage.waitForTimeout(300);
      // 点击"新建文件夹"
      const newSubFolderItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建文件夹/ });
      await expect(newSubFolderItem).toBeVisible();
      await newSubFolderItem.click();
      await contentPage.waitForTimeout(300);
      // 填写子文件夹名称
      const subFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建文件夹|新增文件夹/ });
      await expect(subFolderDialog).toBeVisible({ timeout: 5000 });
      const subFolderNameInput = subFolderDialog.locator('input').first();
      await subFolderNameInput.fill('更多按钮添加的子文件夹');
      const subFolderConfirmBtn = subFolderDialog.locator('.el-button--primary').last();
      await subFolderConfirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证子文件夹出现
      const subFolder = contentPage.locator('.el-tree-node__content').filter({ hasText: '更多按钮添加的子文件夹' });
      await expect(subFolder).toBeVisible({ timeout: 5000 });
    });
  });
  test.describe('边界情况测试', () => {
    // 测试用例18: 鼠标右键非folder节点不出现新建接口选项
    test('鼠标右键非folder节点不出现新建接口选项', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 首先创建一个HTTP节点
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 填写HTTP接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('边界测试HTTP接口');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 右键HTTP节点
      const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '边界测试HTTP接口' });
      await expect(httpNode).toBeVisible({ timeout: 5000 });
      await httpNode.click({ button: 'right' });
      await contentPage.waitForTimeout(300);
      // 验证右键菜单中没有"新建接口"和"新建文件夹"选项
      const nodeContextMenu = contentPage.locator('.s-contextmenu');
      await expect(nodeContextMenu).toBeVisible({ timeout: 3000 });
      const newInterfaceOption = nodeContextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      const newFolderOption = nodeContextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
      // 这些选项应该隐藏(v-show=false)
      await expect(newInterfaceOption).toBeHidden();
      await expect(newFolderOption).toBeHidden();
    });
    // 测试用例19: 非folder节点点击更多按钮不出现新建接口选项
    test('非folder节点点击更多按钮不出现新建接口选项', async ({ contentPage, clearCache, createProject, loginAccount }) => {
      await clearCache();

      await loginAccount();
      await createProject();
      await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
      await contentPage.waitForTimeout(500);
      // 首先创建一个HTTP节点
      const treeWrap = contentPage.locator('.tree-wrap');
      await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
      await contentPage.waitForTimeout(300);
      const contextMenu = contentPage.locator('.s-contextmenu');
      const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      await newInterfaceItem.click();
      await contentPage.waitForTimeout(300);
      // 填写HTTP接口信息
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addFileDialog.locator('input').first();
      await nameInput.fill('更多按钮边界测试');
      const confirmBtn = addFileDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await contentPage.waitForTimeout(500);
      // 鼠标悬停在HTTP节点上并点击更多按钮
      const httpNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '更多按钮边界测试' });
      await expect(httpNode).toBeVisible({ timeout: 5000 });
      await httpNode.hover();
      await contentPage.waitForTimeout(200);
      const moreBtn = httpNode.locator('[data-testid="banner-node-more-btn"]');
      await moreBtn.click();
      await contentPage.waitForTimeout(300);
      // 验证菜单中没有"新建接口"和"新建文件夹"选项
      const nodeContextMenu = contentPage.locator('.s-contextmenu');
      await expect(nodeContextMenu).toBeVisible({ timeout: 3000 });
      const newInterfaceOption = nodeContextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
      const newFolderOption = nodeContextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
      await expect(newInterfaceOption).toBeHidden();
      await expect(newFolderOption).toBeHidden();
    });
  });
});
