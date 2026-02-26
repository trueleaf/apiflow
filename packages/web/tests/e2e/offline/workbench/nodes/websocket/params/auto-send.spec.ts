import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketAutoSend', () => {
  // 保存自动发送配置后，顶部快捷控制应展示“自动发送”开关
  test('自动发送配置保存后展示快捷开关', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '自动发送测试' });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    const configBtn = contentPage.locator('.message-content .config-button');
    await configBtn.click();
    const configPopover = contentPage.locator('.config-popover:visible');
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    const autoSendCheckbox = configPopover.locator('.quick-operations .el-checkbox').filter({ hasText: /自动发送/ });
    await autoSendCheckbox.click();
    await configPopover.locator('.config-actions .el-button--primary').filter({ hasText: /保存/ }).click();
    const autoSendControl = contentPage.locator('.message-content .config-controls .el-checkbox').filter({ hasText: /自动发送/ });
    await expect(autoSendControl).toBeVisible({ timeout: 5000 });
  });
  // 设置发送间隔并保存后，重新打开配置应保留已保存值
  test('自动发送间隔保存后重开保持', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '发送间隔配置测试' });
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    const configBtn = contentPage.locator('.message-content .config-button');
    await configBtn.click();
    const configPopover = contentPage.locator('.config-popover:visible');
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    const intervalInput = configPopover.locator('.el-input-number input');
    await intervalInput.click();
    await contentPage.keyboard.press('Control+a');
    await intervalInput.fill('5000');
    await configPopover.locator('.config-actions .el-button--primary').filter({ hasText: /保存/ }).click();
    await configBtn.click();
    const reopenedPopover = contentPage.locator('.config-popover:visible');
    await expect(reopenedPopover).toBeVisible({ timeout: 5000 });
    await expect(reopenedPopover.locator('.el-input-number input')).toHaveValue('5000');
  });
  // 修改配置后点击关闭，不应污染已保存值
  test('关闭配置面板不保存变更', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '配置取消测试' });
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    const configBtn = contentPage.locator('.message-content .config-button');
    await configBtn.click();
    const configPopover = contentPage.locator('.config-popover:visible');
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    const intervalInput = configPopover.locator('.el-input-number input');
    const initialValue = await intervalInput.inputValue();
    await intervalInput.click();
    await contentPage.keyboard.press('Control+a');
    await intervalInput.fill('9999');
    await configPopover.locator('.el-button').filter({ hasText: /关闭/ }).click();
    await configBtn.click();
    const reopenedPopover = contentPage.locator('.config-popover:visible');
    await expect(reopenedPopover).toBeVisible({ timeout: 5000 });
    await expect(reopenedPopover.locator('.el-input-number input')).toHaveValue(initialValue);
  });
});

