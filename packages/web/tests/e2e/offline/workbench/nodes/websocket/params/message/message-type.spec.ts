import { test, expect } from '../../../../../../../fixtures/electron.fixture';

test.describe('WebSocketMessageType', () => {
  // 消息块类型切换后，下拉框应反映当前类型，覆盖 JSON/XML/HTML/文本/Base64/Hex
  test('消息块类型切换后类型显示正确', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '消息类型切换测试' });
    // 进入消息内容标签并创建一个消息块
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await expect(addBlockBtn).toBeVisible({ timeout: 5000 });
    await addBlockBtn.click();
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    await expect(messageBlock).toBeVisible({ timeout: 5000 });
    const typeSelector = messageBlock.locator('.type-selector');
    // 顺序切换所有核心类型并校验选中值
    const typeCases = [
      { option: /^JSON$/, expectText: 'JSON' },
      { option: /^XML$/, expectText: 'XML' },
      { option: /^HTML$/, expectText: 'HTML' },
      { option: /文本/, expectText: '文本' },
      { option: /Base64/, expectText: 'Base64' },
      { option: /Hex/, expectText: 'Hex' },
    ];
    for (let i = 0; i < typeCases.length; i += 1) {
      await typeSelector.click();
      const option = contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: typeCases[i].option }).first();
      await expect(option).toBeVisible({ timeout: 5000 });
      await option.click();
      const selectedType = typeSelector.locator('.el-select__selected-item:not(.is-hidden)').first();
      await expect(selectedType).toContainText(typeCases[i].expectText, { timeout: 5000 });
    }
  });
  // JSON 类型应展示格式化操作入口，保证 JSON 编辑体验可用
  test('JSON 类型显示格式化按钮', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: 'JSON格式化按钮测试' });
    // 创建消息块并切换到 JSON 类型
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await addBlockBtn.click();
    const messageBlock = contentPage.locator('.message-content .message-block').first();
    const typeSelector = messageBlock.locator('.type-selector');
    await typeSelector.click();
    const jsonOption = contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: /^JSON$/ }).first();
    await jsonOption.click();
    // 校验格式化按钮可见
    const formatBtn = messageBlock.locator('.format-op .btn');
    await expect(formatBtn).toBeVisible({ timeout: 5000 });
  });
});

