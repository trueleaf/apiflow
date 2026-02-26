import { test, expect } from '../../../../../../../fixtures/electron.fixture';

test.describe('WebSocketMessageBlockCRUD', () => {
  // 添加与删除消息块后，列表数量应正确变化
  test('消息块添加与删除', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '消息块增删测试' });
    // 进入消息内容区并连续添加两个消息块
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await expect(addBlockBtn).toBeVisible({ timeout: 5000 });
    const blockList = contentPage.locator('.message-content .message-block');
    const initialCount = await blockList.count();
    await addBlockBtn.click();
    await addBlockBtn.click();
    await expect.poll(async () => {
      return await contentPage.locator('.message-content .message-block').count();
    }, { timeout: 5000 }).toBe(initialCount + 2);
    // 删除第一条消息块并验证数量回落
    await blockList.first().locator('.el-button--danger').click();
    await expect.poll(async () => {
      return await contentPage.locator('.message-content .message-block').count();
    }, { timeout: 5000 }).toBe(initialCount + 1);
  });
  // 修改消息块名称和内容后，保存入口应可正常触发
  test('消息块名称与内容编辑后可保存', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '消息块编辑测试' });
    // 创建消息块并编辑名称
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const blockNameInput = messageBlock.locator('.block-name-input input');
    await blockNameInput.click();
    await contentPage.keyboard.press('Control+a');
    await blockNameInput.fill('自定义消息块名称');
    await contentPage.keyboard.press('Enter');
    await expect(blockNameInput).toHaveValue('自定义消息块名称', { timeout: 5000 });
    // 编辑消息体并执行保存
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"message":"test content"}');
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await saveBtn.click();
    // 通过历史面板可见性确认保存链路可用
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    await expect(historyDropdown.locator('.history-item').first()).toBeVisible({ timeout: 5000 });
  });
  // 折叠消息块后编辑区应隐藏，展开后恢复可见
  test('消息块折叠与展开', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '消息块折叠测试' });
    // 创建消息块并验证初始编辑区可见
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const blockEditor = messageBlock.locator('.block-editor');
    await expect(blockEditor).toBeVisible({ timeout: 5000 });
    // 折叠后隐藏编辑区，再次点击恢复
    const collapseIcon = messageBlock.locator('.collapse-icon');
    await collapseIcon.click();
    await expect(blockEditor).toBeHidden({ timeout: 5000 });
    await collapseIcon.click();
    await expect(blockEditor).toBeVisible({ timeout: 5000 });
  });
});

