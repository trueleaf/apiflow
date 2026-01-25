import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketMessageType', () => {
  // 切换消息类型为JSON,编辑器语言切换为JSON
  test('切换消息类型为JSON编辑器语言切换为JSON', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'JSON类型测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 选择JSON类型
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const typeSelector = messageBlock.locator('.type-selector');
    await typeSelector.click();
    await contentPage.waitForTimeout(300);
    const jsonOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^JSON$/ });
    await jsonOption.click();
    await contentPage.waitForTimeout(300);
    // 验证类型选择器显示JSON
    const selectedType = typeSelector.locator('.el-select__selected-item');
    await expect(selectedType).toContainText('JSON');
  });
  // 切换消息类型为XML,编辑器语言切换为XML
  test('切换消息类型为XML编辑器语言切换为XML', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'XML类型测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 选择XML类型
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const typeSelector = messageBlock.locator('.type-selector');
    await typeSelector.click();
    await contentPage.waitForTimeout(300);
    const xmlOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^XML$/ });
    await xmlOption.click();
    await contentPage.waitForTimeout(300);
    // 验证类型选择器显示XML
    const selectedType = typeSelector.locator('.el-select__selected-item');
    await expect(selectedType).toContainText('XML');
  });
  // 切换消息类型为HTML,编辑器语言切换为HTML
  test('切换消息类型为HTML编辑器语言切换为HTML', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'HTML类型测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 选择HTML类型
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const typeSelector = messageBlock.locator('.type-selector');
    await typeSelector.click();
    await contentPage.waitForTimeout(300);
    const htmlOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^HTML$/ });
    await htmlOption.click();
    await contentPage.waitForTimeout(300);
    // 验证类型选择器显示HTML
    const selectedType = typeSelector.locator('.el-select__selected-item');
    await expect(selectedType).toContainText('HTML');
  });
  // 切换消息类型为文本,编辑器语言切换为纯文本
  test('切换消息类型为文本编辑器语言切换为纯文本', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '文本类型测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 选择文本类型
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const typeSelector = messageBlock.locator('.type-selector');
    await typeSelector.click();
    await contentPage.waitForTimeout(300);
    const textOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /文本/ });
    await textOption.click();
    await contentPage.waitForTimeout(300);
    // 验证类型选择器显示文本
    const selectedType = typeSelector.locator('.el-select__selected-item');
    await expect(selectedType).toContainText(/文本/);
  });
  // 切换消息类型为二进制(Base64),编辑器支持Base64输入
  test('切换消息类型为二进制Base64编辑器支持Base64输入', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Base64类型测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 选择二进制(Base64)类型
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const typeSelector = messageBlock.locator('.type-selector');
    await typeSelector.click();
    await contentPage.waitForTimeout(300);
    const base64Option = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /Base64/ });
    await base64Option.click();
    await contentPage.waitForTimeout(300);
    // 验证类型选择器显示二进制(Base64)
    const selectedType = typeSelector.locator('.el-select__selected-item');
    await expect(selectedType).toContainText(/Base64/);
  });
  // 切换消息类型为二进制(Hex),编辑器支持Hex输入
  test('切换消息类型为二进制Hex编辑器支持Hex输入', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'Hex类型测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 选择二进制(Hex)类型
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const typeSelector = messageBlock.locator('.type-selector');
    await typeSelector.click();
    await contentPage.waitForTimeout(300);
    const hexOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /Hex/ });
    await hexOption.click();
    await contentPage.waitForTimeout(300);
    // 验证类型选择器显示二进制(Hex)
    const selectedType = typeSelector.locator('.el-select__selected-item');
    await expect(selectedType).toContainText(/Hex/);
  });
  // JSON类型消息块显示格式化按钮
  test('JSON类型消息块显示格式化按钮', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: 'JSON格式化按钮测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 添加消息块
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);
    // 选择JSON类型
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const typeSelector = messageBlock.locator('.type-selector');
    await typeSelector.click();
    await contentPage.waitForTimeout(300);
    const jsonOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^JSON$/ });
    await jsonOption.click();
    await contentPage.waitForTimeout(300);
    // 验证格式化按钮可见
    const formatBtn = messageBlock.locator('.format-op .btn');
    await expect(formatBtn).toBeVisible({ timeout: 5000 });
  });
});
