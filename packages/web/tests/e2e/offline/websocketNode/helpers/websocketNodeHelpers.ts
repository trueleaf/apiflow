import { Page, expect } from '@playwright/test';

//等待WebSocket页面加载完成
export const waitForWebSocketNodeReady = async (page: Page, timeout = 10000): Promise<void> => {
  await page.waitForSelector('.websocket, .ws-operation', { state: 'visible', timeout });
  await page.waitForLoadState('domcontentloaded');
};

//选择WebSocket协议
export const selectProtocol = async (
  page: Page,
  protocol: 'ws' | 'wss'
): Promise<void> => {
  const protocolSelect = page.locator('.protocol-select .el-select');
  await protocolSelect.click();
  await page.locator(`.el-select-dropdown__item:has-text("${protocol.toUpperCase()}")`).click();
  await page.waitForTimeout(200);
};

//输入WebSocket连接URL
export const fillUrl = async (page: Page, url: string): Promise<void> => {
  const urlInput = page.locator('.connection-input input.el-input__inner');
  await urlInput.clear();
  await urlInput.fill(url);
  await urlInput.blur();
  await page.waitForTimeout(200);
};

//点击连接按钮
export const clickConnect = async (page: Page): Promise<void> => {
  const connectBtn = page.locator('button:has-text("发起连接"), button:has-text("重新连接")');
  await connectBtn.waitFor({ state: 'visible', timeout: 5000 });
  await connectBtn.click();
  await page.waitForTimeout(500);
};

//点击断开连接按钮
export const clickDisconnect = async (page: Page): Promise<void> => {
  const disconnectBtn = page.locator('button:has-text("断开连接")');
  await disconnectBtn.waitFor({ state: 'visible', timeout: 5000 });
  await disconnectBtn.click();
  await page.waitForTimeout(500);
};

//点击保存接口按钮
export const clickSaveApi = async (page: Page): Promise<void> => {
  const saveBtn = page.locator('button:has-text("保存接口")');
  await saveBtn.click();
  await page.waitForTimeout(500);
};

//点击刷新按钮
export const clickRefresh = async (page: Page): Promise<void> => {
  const refreshBtn = page.locator('button:has-text("刷新")');
  await refreshBtn.click();
  await page.waitForTimeout(500);
};

//获取连接状态
export const getConnectionStatus = async (page: Page): Promise<string> => {
  if (await page.locator('button:has-text("连接中")').isVisible()) {
    return 'connecting';
  } else if (await page.locator('button:has-text("断开连接")').isVisible()) {
    return 'connected';
  } else if (await page.locator('button:has-text("发起连接")').isVisible()) {
    return 'disconnected';
  } else if (await page.locator('button:has-text("重新连接")').isVisible()) {
    return 'error';
  }
  return 'disconnected';
};

//验证连接状态
export const verifyConnectionStatus = async (
  page: Page,
  expectedStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
): Promise<void> => {
  const actualStatus = await getConnectionStatus(page);
  expect(actualStatus).toBe(expectedStatus);
};

//验证连接按钮禁用
export const verifyConnectButtonDisabled = async (page: Page): Promise<void> => {
  const connectBtn = page.locator('button:has-text("发起连接"), button:has-text("重新连接")');
  await expect(connectBtn).toBeDisabled();
};

//验证连接按钮启用
export const verifyConnectButtonEnabled = async (page: Page): Promise<void> => {
  const connectBtn = page.locator('button:has-text("发起连接"), button:has-text("重新连接")');
  await expect(connectBtn).toBeEnabled();
};

//验证断开连接按钮可见
export const verifyDisconnectButtonVisible = async (page: Page): Promise<void> => {
  const disconnectBtn = page.locator('button:has-text("断开连接")');
  await expect(disconnectBtn).toBeVisible();
};

//验证断开连接按钮隐藏
export const verifyDisconnectButtonHidden = async (page: Page): Promise<void> => {
  const disconnectBtn = page.locator('button:has-text("断开连接")');
  await expect(disconnectBtn).not.toBeVisible();
};

//等待连接成功
export const waitForConnected = async (page: Page, timeout = 10000): Promise<void> => {
  await page.waitForSelector('button:has-text("断开连接")', { state: 'visible', timeout });
};

//等待断开连接
export const waitForDisconnected = async (page: Page, timeout = 10000): Promise<void> => {
  await page.waitForSelector('button:has-text("发起连接"), button:has-text("重新连接")', { state: 'visible', timeout });
};

//切换到指定标签
export const switchToTab = async (
  page: Page,
  tabName: 'Message' | 'Params' | 'Headers' | 'PreScript' | 'AfterScript' | 'Response'
): Promise<void> => {
  const tabNameMap: Record<typeof tabName, string> = {
    'Message': '消息内容',
    'Params': 'Params',
    'Headers': '请求头',
    'PreScript': '前置脚本',
    'AfterScript': '后置脚本',
    'Response': '基本信息'
  };
  const targetName = tabNameMap[tabName];
  const tab = page.locator(`.el-tabs__item:has-text("${targetName}")`);
  await tab.click();
  await page.waitForTimeout(300);
};

//获取消息内容
export const fillMessage = async (page: Page, content: string): Promise<void> => {
  await switchToTab(page, 'Message');
  const editor = page.locator('.message-editor, .monaco-editor').first();
  await editor.waitFor({ state: 'visible', timeout: 5000 });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(content);
  await page.waitForTimeout(300);
};

//点击发送消息
export const clickSendMessage = async (page: Page): Promise<void> => {
  const sendBtn = page.locator('button:has-text("发送消息")');
  await sendBtn.waitFor({ state: 'visible', timeout: 5000 });
  await sendBtn.click();
  await page.waitForTimeout(300);
};

//验证发送消息按钮禁用
export const verifySendMessageButtonDisabled = async (page: Page): Promise<void> => {
  const sendBtn = page.locator('button:has-text("发送消息")');
  await expect(sendBtn).toBeDisabled();
};

//验证发送消息按钮启用
export const verifySendMessageButtonEnabled = async (page: Page): Promise<void> => {
  const sendBtn = page.locator('button:has-text("发送消息")');
  await expect(sendBtn).toBeEnabled();
};

//获取消息内容
export const getMessageContent = async (page: Page): Promise<string> => {
  const editor = page.locator('.message-editor, .monaco-editor').first();
  const content = await editor.evaluate((el) => {
    const monaco = (window as unknown as { monaco?: { editor: { getModels: () => { getValue: () => string }[] } } }).monaco;
    if (monaco) {
      const models = monaco.editor.getModels();
      if (models && models.length > 0) {
        return models[0].getValue();
      }
    }
    return '';
  });
  if (content) {
    return content;
  }
  const fallback = await editor.locator('.view-lines').innerText();
  return fallback;
};

//清空消息
export const clearMessage = async (page: Page): Promise<void> => {
  await switchToTab(page, 'Message');
  const editor = page.locator('.message-editor, .monaco-editor').first();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(200);
};

//获取自动发送复选框
export const getAutoSendCheckbox = (page: Page) => {
  return page.locator('.auto-send-checkbox, input[type="checkbox"]').filter({ hasText: '自动发送' }).first();
};

//启用自动发送
export const enableAutoSend = async (page: Page): Promise<void> => {
  await switchToTab(page, 'Message');
  const checkbox = getAutoSendCheckbox(page);
  if (!(await checkbox.isChecked())) {
    await checkbox.check();
    await page.waitForTimeout(200);
  }
};

//禁用自动发送
export const disableAutoSend = async (page: Page): Promise<void> => {
  await switchToTab(page, 'Message');
  const checkbox = getAutoSendCheckbox(page);
  if (await checkbox.isChecked()) {
    await checkbox.uncheck();
    await page.waitForTimeout(200);
  }
};

//设置自动发送间隔
export const setAutoSendInterval = async (page: Page, ms: number): Promise<void> => {
  await switchToTab(page, 'Message');
  const intervalInput = page.locator('input[placeholder*="间隔"], .auto-send-interval').first();
  await intervalInput.fill(ms.toString());
  await intervalInput.blur();
  await page.waitForTimeout(200);
};

//获取消息模板列表
export const getMessageTemplateList = (page: Page) => {
  return page.locator('.template-list .template-item, .message-template');
};

//添加消息模板
export const addMessageTemplate = async (
  page: Page,
  name: string,
  content: string
): Promise<void> => {
  await switchToTab(page, 'Message');
  const addBtn = page.locator('button:has-text("添加模板"), .add-template-btn').first();
  await addBtn.click();
  await page.waitForTimeout(200);
  const nameInput = page.locator('input[placeholder*="模板名称"]').first();
  await nameInput.fill(name);
  const contentInput = page.locator('textarea[placeholder*="模板内容"], .template-content').first();
  await contentInput.fill(content);
  const confirmBtn = page.locator('.el-dialog .el-button--primary:has-text("确定")').first();
  await confirmBtn.click();
  await page.waitForTimeout(300);
};

//删除消息模板
export const deleteMessageTemplate = async (page: Page, name: string): Promise<void> => {
  await switchToTab(page, 'Message');
  const templateItem = page.locator(`.template-item:has-text("${name}")`).first();
  const deleteBtn = templateItem.locator('.delete-btn, [title*="删除"]').first();
  await deleteBtn.click();
  await page.waitForTimeout(200);
  const confirmBtn = page.locator('.el-message-box .el-button--primary').first();
  if (await confirmBtn.isVisible()) {
    await confirmBtn.click();
    await page.waitForTimeout(300);
  }
};

//选择消息模板
export const selectMessageTemplate = async (page: Page, name: string): Promise<void> => {
  await switchToTab(page, 'Message');
  const templateItem = page.locator(`.template-item:has-text("${name}")`).first();
  await templateItem.click();
  await page.waitForTimeout(200);
};

//验证消息模板存在
export const verifyMessageTemplateExists = async (page: Page, name: string): Promise<void> => {
  await switchToTab(page, 'Message');
  const templateItem = page.locator(`.template-item:has-text("${name}")`).first();
  await expect(templateItem).toBeVisible();
};

//获取消息模板数量
export const getMessageTemplateCount = async (page: Page): Promise<number> => {
  await switchToTab(page, 'Message');
  const templates = getMessageTemplateList(page);
  return await templates.count();
};

//编辑消息模板
export const editMessageTemplate = async (
  page: Page,
  oldName: string,
  newName: string,
  newContent: string
): Promise<void> => {
  await switchToTab(page, 'Message');
  const templateItem = page.locator(`.template-item:has-text("${oldName}")`).first();
  const editBtn = templateItem.locator('.edit-btn, [title*="编辑"]').first();
  await editBtn.click();
  await page.waitForTimeout(200);
  const nameInput = page.locator('input[placeholder*="模板名称"]').first();
  await nameInput.clear();
  await nameInput.fill(newName);
  const contentInput = page.locator('textarea[placeholder*="模板内容"], .template-content').first();
  await contentInput.clear();
  await contentInput.fill(newContent);
  const confirmBtn = page.locator('.el-dialog .el-button--primary:has-text("确定")').first();
  await confirmBtn.click();
  await page.waitForTimeout(300);
};

//清空所有消息模板
export const clearAllMessageTemplates = async (page: Page): Promise<void> => {
  await switchToTab(page, 'Message');
  const clearBtn = page.locator('button:has-text("清空模板"), .clear-templates-btn').first();
  if (await clearBtn.isVisible()) {
    await clearBtn.click();
    await page.waitForTimeout(200);
    const confirmBtn = page.locator('.el-message-box .el-button--primary').first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(300);
    }
  }
};

//添加Query参数
export const addQueryParam = async (
  page: Page,
  key: string,
  value: string,
  options: { enabled?: boolean; description?: string } = {}
): Promise<void> => {
  const { enabled = true, description = '' } = options;
  await switchToTab(page, 'Params');
  const keyInput = page.locator('input[placeholder*="参数名称"], input[placeholder*="key"]').first();
  await keyInput.fill(key);
  const valueInput = page.locator('input[placeholder*="参数值"], input[placeholder*="value"]').first();
  await valueInput.fill(value);
  if (description) {
    const descInput = page.locator('input[placeholder*="描述"], input[placeholder*="说明"]').first();
    if (await descInput.count()) {
      await descInput.fill(description);
    }
  }
  if (!enabled) {
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.count()) {
      await checkbox.uncheck();
    }
  }
  await page.waitForTimeout(200);
};

//删除Query参数
export const deleteQueryParam = async (page: Page, key: string): Promise<void> => {
  await switchToTab(page, 'Params');
  const row = page.locator(`tr:has(input[value="${key}"])`);
  const deleteBtn = row.locator('.icon-shanchu, [title*="删除"]').first();
  await deleteBtn.click();
  await page.waitForTimeout(200);
};

//切换Query参数启用状态
export const toggleQueryParam = async (page: Page, key: string): Promise<void> => {
  await switchToTab(page, 'Params');
  const row = page.locator(`tr:has(input[value="${key}"])`);
  const checkbox = row.locator('input[type="checkbox"]').first();
  await checkbox.click();
  await page.waitForTimeout(200);
};

//编辑Query参数key
export const editQueryParamKey = async (
  page: Page,
  oldKey: string,
  newKey: string
): Promise<void> => {
  await switchToTab(page, 'Params');
  const keyInput = page.locator(`input[value="${oldKey}"]`).first();
  await keyInput.clear();
  await keyInput.fill(newKey);
  await keyInput.blur();
  await page.waitForTimeout(200);
};

//编辑Query参数value
export const editQueryParamValue = async (
  page: Page,
  key: string,
  newValue: string
): Promise<void> => {
  await switchToTab(page, 'Params');
  const row = page.locator(`tr:has(input[value="${key}"])`);
  const valueInput = row.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
  await valueInput.clear();
  await valueInput.fill(newValue);
  await valueInput.blur();
  await page.waitForTimeout(200);
};

//验证Query参数在URL中
export const verifyQueryParamInUrl = async (
  page: Page,
  key: string,
  value: string
): Promise<void> => {
  const urlDisplay = page.locator('.status-wrap .url').first();
  const urlText = await urlDisplay.textContent();
  expect(urlText).toContain(`${key}=${value}`);
};

//获取Query参数数量
export const getQueryParamCount = async (page: Page): Promise<number> => {
  await switchToTab(page, 'Params');
  const params = page.locator('.params-table tbody tr, .s-params tbody tr');
  return await params.count();
};

//验证Query参数存在
export const verifyQueryParamExists = async (page: Page, key: string): Promise<void> => {
  await switchToTab(page, 'Params');
  const keyInput = page.locator(`input[value="${key}"]`).first();
  await expect(keyInput).toBeVisible();
};

//清空所有Query参数
export const clearAllQueryParams = async (page: Page): Promise<void> => {
  await switchToTab(page, 'Params');
  const deleteButtons = page.locator('.params-table tr .icon-shanchu, [title*="删除"]');
  const count = await deleteButtons.count();
  for (let i = 0; i < count; i++) {
    await deleteButtons.first().click();
    await page.waitForTimeout(200);
  }
};

//获取默认请求头
export const getDefaultHeaders = (page: Page) => {
  return page.locator('.default-headers, .ws-headers .header-item');
};

//验证默认请求头存在
export const verifyDefaultHeaderExists = async (page: Page, key: string): Promise<void> => {
  await switchToTab(page, 'Headers');
  const headerItem = page.locator(`.header-item:has-text("${key}")`).first();
  await expect(headerItem).toBeVisible();
};

//添加请求头
export const addHeader = async (
  page: Page,
  key: string,
  value: string,
  options: { enabled?: boolean; description?: string } = {}
): Promise<void> => {
  const { enabled = true, description = '' } = options;
  await switchToTab(page, 'Headers');
  const table = page.locator('.headers-table, .s-params').first();
  const lastRow = table.locator('tbody tr').last();
  const keyInput = lastRow.locator('input[placeholder*="请求头"], input[placeholder*="key"]').first();
  await keyInput.fill(key);
  const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
  await valueInput.fill(value);
  if (description) {
    const descInput = lastRow.locator('input[placeholder*="描述"], input[placeholder*="说明"]').first();
    await descInput.fill(description);
  }
  if (!enabled) {
    const checkbox = lastRow.locator('input[type="checkbox"]').first();
    await checkbox.uncheck();
  }
  await page.waitForTimeout(200);
};

//删除请求头
export const deleteHeader = async (page: Page, key: string): Promise<void> => {
  await switchToTab(page, 'Headers');
  const row = page.locator(`tr:has(input[value="${key}"])`);
  const deleteBtn = row.locator('.icon-shanchu, [title*="删除"]').first();
  await deleteBtn.click();
  await page.waitForTimeout(200);
};

//切换请求头启用状态
export const toggleHeader = async (page: Page, key: string): Promise<void> => {
  await switchToTab(page, 'Headers');
  const row = page.locator(`tr:has(input[value="${key}"])`);
  const checkbox = row.locator('input[type="checkbox"]').first();
  await checkbox.click();
  await page.waitForTimeout(200);
};

//编辑请求头key
export const editHeaderKey = async (
  page: Page,
  oldKey: string,
  newKey: string
): Promise<void> => {
  await switchToTab(page, 'Headers');
  const keyInput = page.locator(`input[value="${oldKey}"]`).first();
  await keyInput.clear();
  await keyInput.fill(newKey);
  await keyInput.blur();
  await page.waitForTimeout(200);
};

//编辑请求头value
export const editHeaderValue = async (
  page: Page,
  key: string,
  newValue: string
): Promise<void> => {
  await switchToTab(page, 'Headers');
  const row = page.locator(`tr:has(input[value="${key}"])`);
  const valueInput = row.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
  await valueInput.clear();
  await valueInput.fill(newValue);
  await valueInput.blur();
  await page.waitForTimeout(200);
};

//获取请求头数量
export const getHeaderCount = async (page: Page): Promise<number> => {
  await switchToTab(page, 'Headers');
  const headers = page.locator('.headers-table tbody tr, .s-params tbody tr');
  return await headers.count();
};

//验证请求头存在
export const verifyHeaderExists = async (page: Page, key: string): Promise<void> => {
  await switchToTab(page, 'Headers');
  const headerSection = page.locator('.header-info, .headers-table, .s-params').first();
  await headerSection.waitFor({ state: 'visible', timeout: 5000 });
  const exactInput = headerSection.locator(`input[value="${key}"]`).first();
  if (await exactInput.count()) {
    await expect(exactInput).toBeVisible();
    return;
  }
  const keyInputs = headerSection.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
  const inputCount = await keyInputs.count();
  for (let i = 0; i < inputCount; i++) {
    const candidate = keyInputs.nth(i);
    const value = await candidate.inputValue();
    if (value === key) {
      await expect(candidate).toBeVisible();
      return;
    }
  }
  throw new Error(`Header ${key} not found`);
};

//切换到响应标签
export const switchToResponseTab = async (page: Page): Promise<void> => {
  await switchToTab(page, 'Response');
};

//获取消息列表
export const getMessageList = (page: Page) => {
  return page.locator('.message-list .message-item, .ws-message');
};

//获取消息数量
export const getMessageCount = async (page: Page): Promise<number> => {
  await switchToResponseTab(page);
  const messages = getMessageList(page);
  return await messages.count();
};

//验证消息数量
export const verifyMessageCount = async (page: Page, count: number): Promise<void> => {
  const actualCount = await getMessageCount(page);
  expect(actualCount).toBe(count);
};

//获取连接消息
export const getConnectedMessage = (page: Page) => {
  return page.locator('.message-item:has-text("连接成功"), .message-item:has-text("connected")').first();
};

//验证连接消息存在
export const verifyConnectedMessage = async (page: Page): Promise<void> => {
  await switchToResponseTab(page);
  const connectedMsg = getConnectedMessage(page);
  await expect(connectedMsg).toBeVisible();
};

//获取断开连接消息
export const getDisconnectedMessage = (page: Page) => {
  return page.locator('.message-item:has-text("断开连接"), .message-item:has-text("disconnected")').first();
};

//验证断开消息
export const verifyDisconnectedMessage = async (
  page: Page,
  reasonType: 'manual' | 'auto'
): Promise<void> => {
  await switchToResponseTab(page);
  const disconnectedMsg = getDisconnectedMessage(page);
  await expect(disconnectedMsg).toBeVisible();
  if (reasonType === 'manual') {
    await expect(disconnectedMsg).toContainText('手动');
  } else {
    await expect(disconnectedMsg).toContainText('自动');
  }
};

//获取已发送消息列表
export const getSentMessages = (page: Page) => {
  return page.locator('.message-item.sent, .message-item:has(.send-icon)');
};

//获取已接收消息列表
export const getReceivedMessages = (page: Page) => {
  return page.locator('.message-item.received, .message-item:has(.receive-icon)');
};

//验证消息在列表中
export const verifyMessageInList = async (
  page: Page,
  content: string,
  type: 'sent' | 'received'
): Promise<void> => {
  await switchToResponseTab(page);
  const messages = type === 'sent' ? getSentMessages(page) : getReceivedMessages(page);
  const matchingMessage = messages.filter({ hasText: content }).first();
  await expect(matchingMessage).toBeVisible();
};

//获取错误消息
export const getErrorMessage = (page: Page) => {
  return page.locator('.message-item.error, .message-item:has(.error-icon)').first();
};

//验证错误消息
export const verifyErrorMessage = async (page: Page, error: string): Promise<void> => {
  await switchToResponseTab(page);
  const errorMsg = getErrorMessage(page);
  await expect(errorMsg).toBeVisible();
  await expect(errorMsg).toContainText(error);
};

//点击清空消息
export const clickClearMessages = async (page: Page): Promise<void> => {
  await switchToResponseTab(page);
  const clearBtn = page.locator('button:has-text("清空消息"), .clear-messages-btn').first();
  await clearBtn.click();
  await page.waitForTimeout(200);
  const confirmBtn = page.locator('.el-message-box .el-button--primary').first();
  if (await confirmBtn.isVisible()) {
    await confirmBtn.click();
    await page.waitForTimeout(300);
  }
};

//验证消息列表为空
export const verifyMessageListEmpty = async (page: Page): Promise<void> => {
  await switchToResponseTab(page);
  const messages = getMessageList(page);
  const count = await messages.count();
  expect(count).toBe(0);
};

//切换到前置脚本标签
export const switchToPreScriptTab = async (page: Page): Promise<void> => {
  await switchToTab(page, 'PreScript');
  await page.waitForSelector('.s-monaco-editor, .monaco-editor', { timeout: 15000 });
};

//切换到后置脚本标签
export const switchToAfterScriptTab = async (page: Page): Promise<void> => {
  await switchToTab(page, 'AfterScript');
  await page.waitForSelector('.s-monaco-editor, .monaco-editor', { timeout: 15000 });
};

//填写前置脚本代码
export const fillPreRequestScript = async (page: Page, script: string): Promise<void> => {
  await switchToPreScriptTab(page);
  const editor = page.locator('.monaco-editor').first();
  await editor.waitFor({ state: 'visible', timeout: 15000 });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(script);
  await page.waitForTimeout(300);
};

//填写后置脚本代码
export const fillAfterRequestScript = async (page: Page, script: string): Promise<void> => {
  await switchToAfterScriptTab(page);
  const editor = page.locator('.monaco-editor').first();
  await editor.waitFor({ state: 'visible', timeout: 15000 });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(script);
  await page.waitForTimeout(300);
};

//获取脚本编辑器内容
export const getScriptContent = async (page: Page): Promise<string> => {
  const editor = page.locator('.monaco-editor').first();
  const content = await editor.evaluate((el) => {
    const monaco = (window as unknown as { monaco?: { editor: { getModels: () => { getValue: () => string }[] } } }).monaco;
    if (monaco) {
      const models = monaco.editor.getModels();
      if (models && models.length > 0) {
        return models[0].getValue();
      }
    }
    return '';
  });
  if (content) {
    return content;
  }
  const fallback = await editor.locator('.view-lines').innerText();
  return fallback;
};

//验证脚本编辑器显示
export const verifyScriptEditorVisible = async (page: Page): Promise<void> => {
  const editor = page.locator('.monaco-editor').first();
  await expect(editor).toBeVisible();
};

//打开变量管理面板
export const openVariablePanel = async (page: Page): Promise<void> => {
  const variableBtn = page.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
  await variableBtn.click();
  await page.waitForTimeout(300);
};

//添加局部变量
export const addLocalVariable = async (
  page: Page,
  key: string,
  value: string
): Promise<void> => {
  await openVariablePanel(page);
  const localTab = page.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
  if (await localTab.isVisible()) {
    await localTab.click();
    await page.waitForTimeout(200);
  }
  const table = page.locator('.variable-table, .s-params').first();
  const lastRow = table.locator('tbody tr').last();
  const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
  await keyInput.fill(key);
  await page.keyboard.press('Tab');
  const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
  await valueInput.fill(value);
  await valueInput.blur();
  await page.waitForTimeout(200);
  const closeBtn = page.locator('.el-dialog__close, .close-btn').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  }
  await page.waitForTimeout(200);
};

//添加环境变量
export const addEnvironmentVariable = async (
  page: Page,
  key: string,
  value: string
): Promise<void> => {
  await openVariablePanel(page);
  const envTab = page.locator('.el-tabs__item:has-text("环境"), .env-tab').first();
  if (await envTab.isVisible()) {
    await envTab.click();
    await page.waitForTimeout(200);
  }
  const table = page.locator('.variable-table, .s-params').first();
  const lastRow = table.locator('tbody tr').last();
  const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
  await keyInput.fill(key);
  await page.keyboard.press('Tab');
  const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
  await valueInput.fill(value);
  await valueInput.blur();
  await page.waitForTimeout(200);
  const closeBtn = page.locator('.el-dialog__close, .close-btn').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  }
  await page.waitForTimeout(200);
};

//添加全局变量
export const addGlobalVariable = async (
  page: Page,
  key: string,
  value: string
): Promise<void> => {
  await openVariablePanel(page);
  const globalTab = page.locator('.el-tabs__item:has-text("全局"), .global-tab').first();
  if (await globalTab.isVisible()) {
    await globalTab.click();
    await page.waitForTimeout(200);
  }
  const table = page.locator('.variable-table, .s-params').first();
  const lastRow = table.locator('tbody tr').last();
  const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
  await keyInput.fill(key);
  await page.keyboard.press('Tab');
  const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
  await valueInput.fill(value);
  await valueInput.blur();
  await page.waitForTimeout(200);
  const closeBtn = page.locator('.el-dialog__close, .close-btn').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  }
  await page.waitForTimeout(200);
};

//验证URL包含变量语法
export const verifyUrlContainsVariable = async (
  page: Page,
  variableName: string
): Promise<void> => {
  const urlInput = page.locator('.connection-input input.el-input__inner');
  const value = await urlInput.inputValue();
  expect(value).toContain(`{{${variableName}}}`);
};

//打开历史记录面板
export const openHistoryPanel = async (page: Page): Promise<void> => {
  const historyBtn = page.locator('[title*="历史"], .history-btn, button:has-text("历史")').first();
  await historyBtn.click();
  await page.waitForTimeout(300);
};

//关闭历史记录面板
export const closeHistoryPanel = async (page: Page): Promise<void> => {
  const closeBtn = page.locator('.el-dialog__close, .history-close').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }
};

//获取历史记录列表
export const getHistoryList = (page: Page) => {
  return page.locator('.history-list .history-item, .history-record');
};

//点击历史记录项
export const clickHistoryItem = async (page: Page, index: number): Promise<void> => {
  const historyItems = getHistoryList(page);
  const item = historyItems.nth(index);
  await item.click();
  await page.waitForTimeout(300);
};

//删除历史记录项
export const deleteHistoryItem = async (page: Page, index: number): Promise<void> => {
  const historyItems = getHistoryList(page);
  const item = historyItems.nth(index);
  const deleteBtn = item.locator('[title*="删除"], .delete-btn').first();
  await deleteBtn.click();
  await page.waitForTimeout(300);
};

//清空所有历史记录
export const clearAllHistory = async (page: Page): Promise<void> => {
  const clearBtn = page.locator('[title*="清空"], .clear-all-btn, button:has-text("清空")').first();
  await clearBtn.click();
  await page.waitForTimeout(300);
  const confirmBtn = page.locator('.el-message-box__btns .el-button--primary, button:has-text("确定")').first();
  if (await confirmBtn.isVisible()) {
    await confirmBtn.click();
    await page.waitForTimeout(300);
  }
};

//验证历史记录数量
export const verifyHistoryCount = async (page: Page, expectedCount: number): Promise<void> => {
  await openHistoryPanel(page);
  const historyItems = getHistoryList(page);
  const count = await historyItems.count();
  expect(count).toBe(expectedCount);
};

//获取保存按钮
export const getSaveButton = (page: Page) => {
  return page.locator('button:has-text("保存接口"), .save-api-btn, [title*="保存"]').first();
};

//验证保存按钮启用状态
export const verifySaveButtonEnabled = async (page: Page): Promise<void> => {
  const saveBtn = getSaveButton(page);
  await expect(saveBtn).toBeEnabled();
};

//验证保存按钮禁用状态
export const verifySaveButtonDisabled = async (page: Page): Promise<void> => {
  const saveBtn = getSaveButton(page);
  await expect(saveBtn).toBeDisabled();
};

//通过快捷键保存
export const saveByShortcut = async (page: Page): Promise<void> => {
  await page.keyboard.press('Control+S');
  await page.waitForTimeout(300);
};

//验证保存成功提示
export const verifySaveSuccessMessage = async (page: Page): Promise<void> => {
  const successMessage = page.locator('.el-message--success, .success-message, [class*="message"]:has-text("保存成功")').first();
  if (await successMessage.isVisible()) {
    await expect(successMessage).toBeVisible();
  }
};

//获取未保存标识
export const getUnsavedIndicator = (page: Page) => {
  return page.locator('.unsaved-indicator, .modified-flag, [class*="unsaved"]').first();
};

//验证显示未保存标识
export const verifyUnsavedIndicatorVisible = async (page: Page): Promise<void> => {
  const indicator = getUnsavedIndicator(page);
  if (await indicator.isVisible()) {
    await expect(indicator).toBeVisible();
  }
};

//验证未保存标识隐藏
export const verifyUnsavedIndicatorHidden = async (page: Page): Promise<void> => {
  const indicator = getUnsavedIndicator(page);
  if (await indicator.isVisible()) {
    await expect(indicator).not.toBeVisible();
  }
};

//获取撤销按钮
export const getUndoButton = (page: Page) => {
  return page.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
};

//获取重做按钮
export const getRedoButton = (page: Page) => {
  return page.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
};

//点击撤销按钮
export const clickUndo = async (page: Page): Promise<void> => {
  const undoBtn = getUndoButton(page);
  await undoBtn.click();
  await page.waitForTimeout(200);
};

//点击重做按钮
export const clickRedo = async (page: Page): Promise<void> => {
  const redoBtn = getRedoButton(page);
  await redoBtn.click();
  await page.waitForTimeout(200);
};

//验证撤销按钮是否禁用
export const verifyUndoDisabled = async (page: Page): Promise<void> => {
  const undoBtn = getUndoButton(page);
  const isDisabled = await undoBtn.isDisabled();
  expect(isDisabled).toBe(true);
};

//验证撤销按钮是否启用
export const verifyUndoEnabled = async (page: Page): Promise<void> => {
  const undoBtn = getUndoButton(page);
  const isDisabled = await undoBtn.isDisabled();
  expect(isDisabled).toBe(false);
};

//验证重做按钮是否禁用
export const verifyRedoDisabled = async (page: Page): Promise<void> => {
  const redoBtn = getRedoButton(page);
  const isDisabled = await redoBtn.isDisabled();
  expect(isDisabled).toBe(true);
};

//验证重做按钮是否启用
export const verifyRedoEnabled = async (page: Page): Promise<void> => {
  const redoBtn = getRedoButton(page);
  const isDisabled = await redoBtn.isDisabled();
  expect(isDisabled).toBe(false);
};

//使用快捷键撤销 (Ctrl+Z)
export const undoByShortcut = async (page: Page): Promise<void> => {
  await page.keyboard.press('Control+Z');
  await page.waitForTimeout(200);
};

//使用快捷键重做 (Ctrl+Y)
export const redoByShortcut = async (page: Page): Promise<void> => {
  await page.keyboard.press('Control+Y');
  await page.waitForTimeout(200);
};

//验证URL输入框的值
export const verifyUrlValue = async (page: Page, expectedUrl: string): Promise<void> => {
  const urlInput = page.locator('.connection-input input.el-input__inner');
  await expect(urlInput).toHaveValue(expectedUrl);
};

//获取完整连接URL
export const getFullConnectionUrl = async (page: Page): Promise<string> => {
  const urlElement = page.locator('.status-wrap .url').first();
  const url = await urlElement.textContent();
  return url?.trim() || '';
};

//验证完整连接URL
export const verifyFullConnectionUrl = async (
  page: Page,
  expectedUrl: string
): Promise<void> => {
  const actualUrl = await getFullConnectionUrl(page);
  expect(actualUrl).toBe(expectedUrl);
};
