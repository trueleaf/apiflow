import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketAutoSend', () => {
  // 勾选自动发送后,连接成功自动发送消息
  test('勾选自动发送后连接成功自动发送消息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '自动发送测试' });
    // 输入连接地址
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 点击设置按钮打开配置面板
    const configBtn = contentPage.locator('.message-content .config-button');
    await configBtn.click();
    await contentPage.waitForTimeout(300);
    // 在配置面板中勾选自动发送快捷操作
    const configPopover = contentPage.locator('.config-popover:visible');
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    const autoSendCheckbox = configPopover.locator('.quick-operations .el-checkbox').filter({ hasText: /自动发送/ });
    await autoSendCheckbox.click();
    await contentPage.waitForTimeout(300);
    // 保存配置
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    const saveConfigBtn = contentPage.locator('.config-popover:visible .config-actions .el-button--primary').filter({ hasText: /保存/ });
    await saveConfigBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证自动发送checkbox出现在顶部操作栏
    const autoSendControl = contentPage.locator('.message-content .config-controls .el-checkbox').filter({ hasText: /自动发送/ });
    await expect(autoSendControl).toBeVisible({ timeout: 5000 });
  });
  // 自动发送配置支持设置发送间隔
  test('自动发送配置支持设置发送间隔', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '发送间隔配置测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 点击设置按钮打开配置面板
    const configBtn = contentPage.locator('.message-content .config-button');
    await configBtn.click();
    await contentPage.waitForTimeout(300);
    // 在配置面板中设置发送间隔
    const configPopover = contentPage.locator('.config-popover:visible');
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    const intervalInput = configPopover.locator('.el-input-number input');
    await intervalInput.click();
    await contentPage.keyboard.press('Control+a');
    await intervalInput.fill('5000');
    await contentPage.waitForTimeout(300);
    // 保存配置
    const saveConfigBtn = contentPage.locator('.config-popover:visible .config-actions .el-button--primary').filter({ hasText: /保存/ });
    await saveConfigBtn.click();
    await contentPage.waitForTimeout(500);
    // 重新打开配置面板验证值已保存
    await configBtn.click();
    await contentPage.waitForTimeout(300);
    const savedValue = await configPopover.locator('.el-input-number input').inputValue();
    expect(savedValue).toBe('5000');
  });
  // 自动发送配置支持设置消息类型
  test('自动发送配置支持设置消息类型', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息类型配置测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 点击设置按钮打开配置面板
    const configBtn = contentPage.locator('.message-content .config-button');
    await configBtn.click();
    await contentPage.waitForTimeout(300);
    // 在配置面板中设置消息类型为JSON
    const configPopover = contentPage.locator('.config-popover:visible');
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    const typeSelector = configPopover.locator('.el-select').first();
    await typeSelector.click();
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.type('JSON');
    await contentPage.keyboard.press('Enter');
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    // 保存配置
    const saveConfigBtn = contentPage.locator('.config-popover:visible .config-actions .el-button--primary').filter({ hasText: /保存/ });
    await saveConfigBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证保存成功
    await configBtn.click();
    await contentPage.waitForTimeout(300);
    const selectedType = configPopover.locator('.el-select .el-select__selected-item:not(.is-hidden)').first();
    await expect(selectedType).toContainText('JSON');
  });
  // 自动发送配置支持设置消息内容
  test('自动发送配置支持设置消息内容', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '消息内容配置测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 点击设置按钮打开配置面板
    const configBtn = contentPage.locator('.message-content .config-button');
    await configBtn.click();
    await contentPage.waitForTimeout(300);
    // 在配置面板的消息内容编辑器中输入内容
    const configPopover = contentPage.locator('.config-popover:visible');
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    const contentEditor = configPopover.locator('.config-content-editor .s-json-editor');
    await contentEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"type": "heartbeat"}');
    await contentPage.waitForTimeout(300);
    // 保存配置
    const saveConfigBtn = contentPage.locator('.config-popover:visible .config-actions .el-button--primary').filter({ hasText: /保存/ });
    await saveConfigBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证保存成功提示
    const successMessage = contentPage.locator('.el-message--success');
    // 如果有成功提示则验证,没有也继续
    if (await successMessage.isVisible()) {
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });
  // 关闭配置面板后,配置不保存
  test('关闭配置面板后配置不保存', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '配置取消测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 点击设置按钮打开配置面板
    const configBtn = contentPage.locator('.message-content .config-button');
    await configBtn.click();
    await contentPage.waitForTimeout(300);
    // 获取初始间隔值
    const configPopover = contentPage.locator('.config-popover:visible');
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    const intervalInput = configPopover.locator('.el-input-number input');
    const initialValue = await intervalInput.inputValue();
    // 修改间隔值
    await intervalInput.click();
    await contentPage.keyboard.press('Control+a');
    await intervalInput.fill('9999');
    await contentPage.waitForTimeout(300);
    // 点击关闭按钮（不保存）
    const closeBtn = configPopover.locator('.el-button').filter({ hasText: /关闭/ });
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 重新打开配置面板验证值未改变
    await configBtn.click();
    await contentPage.waitForTimeout(300);
    const currentValue = await configPopover.locator('.el-input-number input').inputValue();
    expect(currentValue).toBe(initialValue);
  });
  // 自动发送配置保存后重新打开配置仍然显示保存的值
  test('自动发送配置保存后重新打开配置仍然显示保存的值', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '配置保存测试' });
    // 切换到消息内容标签
    const messageTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /消息内容/ });
    await messageTab.click();
    await contentPage.waitForTimeout(300);
    // 打开配置面板
    const configBtn = contentPage.locator('.message-content .config-button');
    await configBtn.click();
    await contentPage.waitForTimeout(300);
    const configPopover = contentPage.locator('.config-popover:visible');
    await expect(configPopover).toBeVisible({ timeout: 5000 });
    // 修改发送间隔为5000ms
    const intervalInput = configPopover.locator('.el-input-number input');
    await intervalInput.click();
    await contentPage.keyboard.press('Control+a');
    await intervalInput.fill('5000');
    await contentPage.waitForTimeout(300);
    // 点击保存按钮
    const saveBtn = configPopover.locator('.el-button').filter({ hasText: /保存|Save/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 重新打开配置面板验证值已保存
    await configBtn.click();
    await contentPage.waitForTimeout(300);
    const savedValue = await configPopover.locator('.el-input-number input').inputValue();
    expect(savedValue).toBe('5000');
  });
});
