import { test, expect } from '../../../../../../../fixtures/electron.fixture';

test.describe('WebSocketMessageBlockCRUD', () => {
  // 点击添加消息块按钮,新增一个消息块
  test('点击添加消息块按钮新增一个消息块', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息块添加测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 获取初始消息块数量
    const initialBlocks = await contentPage.locator('.message-content .message-block').count();
    // 点击添加消息块按钮
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await expect(addBlockBtn).toBeVisible({ timeout: 5000 });
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证消息块数量增加
    const newBlocks = await contentPage.locator('.message-content .message-block').count();
    expect(newBlocks).toBe(initialBlocks + 1);
  });
  // 删除消息块后,消息块列表减少一个
  test('删除消息块后消息块列表减少一个', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息块删除测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加两个消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 获取当前消息块数量
    const blocksBeforeDelete = await contentPage.locator('.message-content .message-block').count();
    expect(blocksBeforeDelete).toBeGreaterThanOrEqual(2);
    // 点击第一个消息块的删除按钮
    const deleteBtn = contentPage.locator('.message-content .message-block').first().locator('.el-button--danger');
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证消息块数量减少
    const blocksAfterDelete = await contentPage.locator('.message-content .message-block').count();
    expect(blocksAfterDelete).toBe(blocksBeforeDelete - 1);
  });
  // 修改消息块名称后,名称显示更新
  test('修改消息块名称后名称显示更新', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息块名称修改测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 修改消息块名称
    const blockNameInput = contentPage.locator('.message-content .message-block').first().locator('.block-name-input input');
    await blockNameInput.click();
    await contentPage.keyboard.press('Control+a');
    await blockNameInput.fill('自定义消息块名称');
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 验证名称已更新
    const inputValue = await blockNameInput.inputValue();
    expect(inputValue).toBe('自定义消息块名称');
  });
  // 修改消息块内容后,内容保存成功
  test('修改消息块内容后内容保存成功', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息块内容修改测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 在消息块编辑器中输入内容
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"message": "test content"}');
    await contentPage.waitForTimeout(300);
    // 点击保存按钮
    const saveBtn = contentPage.locator('[data-testid="websocket-operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 通过历史记录验证保存成功
    const historyBtn = contentPage.locator('[data-testid="ws-params-history-btn"]');
    await historyBtn.click();
    await contentPage.waitForTimeout(300);
    const historyDropdown = contentPage.locator('.ws-params .history-dropdown');
    await expect(historyDropdown).toBeVisible({ timeout: 5000 });
    const historyItems = historyDropdown.locator('.history-item');
    await expect(historyItems.first()).toBeVisible({ timeout: 5000 });
  });
  // 空状态下显示添加消息块按钮
  test('空状态下显示添加消息块按钮', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '空状态测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 验证空状态下的添加按钮可见
    const emptyStateBtn = contentPage.locator('.message-content .empty-state .el-button, .message-content .add-block-button');
    await expect(emptyStateBtn.first()).toBeVisible({ timeout: 5000 });
  });
  // 折叠消息块后,编辑器区域隐藏
  test('折叠消息块后编辑器区域隐藏', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息块折叠测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证编辑器可见
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const blockEditor = messageBlock.locator('.block-editor');
    await expect(blockEditor).toBeVisible({ timeout: 5000 });
    // 点击折叠图标
    const collapseIcon = messageBlock.locator('.collapse-icon');
    await collapseIcon.click();
    await contentPage.waitForTimeout(300);
    // 验证编辑器隐藏
    await expect(blockEditor).not.toBeVisible();
  });
  // 添加多个消息块后列表正确显示
  test('添加多个消息块后列表正确显示', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '多消息块测试' });
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    // 添加3个消息块
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证消息块数量至少为3（可能已有默认消息块）
    const messageBlocks = contentPage.locator('.message-content .message-block');
    const count = await messageBlocks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
