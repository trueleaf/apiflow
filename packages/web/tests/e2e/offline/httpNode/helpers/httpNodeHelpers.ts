import { Page, expect } from '@playwright/test';

//等待页面加载完成
export const waitForHttpNodeReady = async (page: Page, timeout = 10000): Promise<void> => {
  await page.waitForSelector('.api-operation', { state: 'visible', timeout });
  await page.waitForLoadState('domcontentloaded');
};

//获取HTTP方法选择器
export const getMethodSelector = (page: Page) => {
  return page.locator('[data-testid="method-select"]');
};

//选择HTTP请求方法
export const selectHttpMethod = async (
  page: Page,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
): Promise<void> => {
  const methodSelect = getMethodSelector(page);
  await methodSelect.click();
  await page.locator(`.el-select-dropdown__item:has-text("${method}")`).click();
  await page.waitForTimeout(200);
};

//获取URL输入框
export const getUrlInput = (page: Page) => {
  return page.locator('[data-testid="url-input"]');
};

//输入请求URL
export const fillUrl = async (page: Page, url: string): Promise<void> => {
  const urlInput = getUrlInput(page);
  await urlInput.clear();
  await urlInput.fill(url);
  await urlInput.blur();
  await page.waitForTimeout(200);
};

//点击发送请求按钮
export const clickSendRequest = async (page: Page): Promise<void> => {
  const sendBtn = page.locator('button:has-text("发送请求")');
  await sendBtn.waitFor({ state: 'visible', timeout: 5000 });
  await sendBtn.click();
};

//发送请求并等待响应
export const sendRequestAndWait = async (page: Page, timeout = 30000): Promise<void> => {
  await clickSendRequest(page);
  await page.waitForSelector('button:has-text("发送请求")', {
    state: 'visible',
    timeout
  });
};

//点击取消请求按钮
export const clickCancelRequest = async (page: Page): Promise<void> => {
  const cancelBtn = page.locator('button:has-text("取消请求")');
  await cancelBtn.waitFor({ state: 'visible', timeout: 5000 });
  await cancelBtn.click();
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

//切换到指定标签
export const switchToTab = async (
  page: Page,
  tabName: 'Params' | 'Body' | 'Headers' | '返回参数' | '前置脚本' | '后置脚本' | '备注信息'
): Promise<void> => {
  const tab = page.locator(`.el-tabs__item:has-text("${tabName}")`);
  await tab.click();
  await page.waitForTimeout(300);
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
  const paramsTable = page.locator('.params-table, .s-params').first();
  const lastRow = paramsTable.locator('tbody tr').last();
  const keyInput = lastRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
  await keyInput.fill(key);
  const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').nth(1);
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

//删除Query参数
export const deleteQueryParam = async (page: Page, key: string): Promise<void> => {
  await switchToTab(page, 'Params');
  const row = page.locator(`tr:has(input[value="${key}"])`);
  const deleteBtn = row.locator('.icon-shanchu, [title*="删除"]').first();
  await deleteBtn.click();
  await page.waitForTimeout(200);
};

//切换Body模式
export const switchBodyMode = async (
  page: Page,
  mode: 'none' | 'JSON' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary'
): Promise<void> => {
  await switchToTab(page, 'Body');
  const modeSelector = page.locator('.body-mode-select, .el-select').first();
  await modeSelector.click();
  await page.locator(`.el-select-dropdown__item:has-text("${mode}")`).click();
  await page.waitForTimeout(300);
};

//填充JSON Body
export const fillJsonBody = async (
  page: Page,
  json: Record<string, unknown> | string
): Promise<void> => {
  await switchBodyMode(page, 'JSON');
  const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
  const editor = page.locator('.monaco-editor').first();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(jsonString);
  await page.waitForTimeout(300);
};

//填充Raw Body
export const fillRawBody = async (page: Page, content: string): Promise<void> => {
  await switchBodyMode(page, 'raw');
  const editor = page.locator('.monaco-editor, textarea').first();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(content);
  await page.waitForTimeout(300);
};

//添加FormData字段
export const addFormDataField = async (
  page: Page,
  key: string,
  value: string,
  options: { type?: 'text' | 'file'; enabled?: boolean } = {}
): Promise<void> => {
  const { type = 'text', enabled = true } = options;
  await switchBodyMode(page, 'form-data');
  const table = page.locator('.form-data-table, .s-params').first();
  const lastRow = table.locator('tbody tr').last();
  const keyInput = lastRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
  await keyInput.fill(key);
  if (type === 'file') {
    const typeSelect = lastRow.locator('.el-select').first();
    await typeSelect.click();
    await page.locator('.el-select-dropdown__item:has-text("file")').click();
  }
  const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
  await valueInput.fill(value);
  if (!enabled) {
    const checkbox = lastRow.locator('input[type="checkbox"]').first();
    await checkbox.uncheck();
  }
  await page.waitForTimeout(200);
};

//添加URL-encoded字段
export const addUrlEncodedField = async (
  page: Page,
  key: string,
  value: string,
  options: { enabled?: boolean } = {}
): Promise<void> => {
  const { enabled = true } = options;
  await switchBodyMode(page, 'x-www-form-urlencoded');
  const table = page.locator('.url-encoded-table, .s-params').first();
  const lastRow = table.locator('tbody tr').last();
  const keyInput = lastRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
  await keyInput.fill(key);
  const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
  await valueInput.fill(value);
  if (!enabled) {
    const checkbox = lastRow.locator('input[type="checkbox"]').first();
    await checkbox.uncheck();
  }
  await page.waitForTimeout(200);
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

//切换到响应标签
export const switchToResponseTab = async (
  page: Page,
  tabName: '基本信息' | '响应体' | '响应头' | 'Cookie' | '请求信息'
): Promise<void> => {
  const responseArea = page.locator('.response-view, .api-response').first();
  const tab = responseArea.locator(`.el-tabs__item:has-text("${tabName}")`);
  await tab.click();
  await page.waitForTimeout(300);
};

//验证响应状态码
export const verifyResponseStatus = async (
  page: Page,
  expectedStatus: number
): Promise<void> => {
  await switchToResponseTab(page, '基本信息');
  const statusElement = page.locator('.status-code, .response-status').first();
  await expect(statusElement).toContainText(expectedStatus.toString());
};

//获取响应体内容
export const getResponseBody = async (page: Page): Promise<string> => {
  await switchToResponseTab(page, '响应体');
  const bodyElement = page.locator('.response-body, .monaco-editor').first();
  const content = await bodyElement.textContent();
  return content || '';
};

//验证响应体包含文本
export const verifyResponseBodyContains = async (
  page: Page,
  expectedText: string
): Promise<void> => {
  const body = await getResponseBody(page);
  expect(body).toContain(expectedText);
};

//获取响应时间
export const getResponseTime = async (page: Page): Promise<string> => {
  await switchToResponseTab(page, '基本信息');
  const timeElement = page.locator('.response-time, .time').first();
  const time = await timeElement.textContent();
  return time || '';
};


//切换布局方向
export const switchLayout = async (
  page: Page,
  layout: 'horizontal' | 'vertical'
): Promise<void> => {
  const layoutBtn = page.locator('[title*="布局"], .layout-btn').first();
  await layoutBtn.click();
  const option = page.locator(`.layout-option:has-text("${layout === 'horizontal' ? '左右' : '上下'}")`);
  await option.click();
  await page.waitForTimeout(300);
};

//填充备注信息
export const fillRemarks = async (page: Page, remarks: string): Promise<void> => {
  await switchToTab(page, '备注信息');
  const editor = page.locator('.monaco-editor, textarea').first();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(remarks);
  await page.waitForTimeout(300);
};

//验证URL输入框的值
export const verifyUrlValue = async (page: Page, expectedUrl: string): Promise<void> => {
  const urlInput = getUrlInput(page);
  await expect(urlInput).toHaveValue(expectedUrl);
};

//验证当前HTTP方法
export const verifyHttpMethod = async (
  page: Page,
  expectedMethod: string
): Promise<void> => {
  const methodSelect = getMethodSelector(page);
  const selectedText = await methodSelect.locator('.el-select__selected-item, input').first().inputValue();
  expect(selectedText).toBe(expectedMethod);
};

//等待请求完成
export const waitForRequestComplete = async (page: Page, timeout = 30000): Promise<void> => {
  await page.waitForSelector('button:has-text("取消请求")', {
    state: 'hidden',
    timeout
  });
};

//验证参数存在
export const verifyQueryParamExists = async (
  page: Page,
  key: string
): Promise<void> => {
  await switchToTab(page, 'Params');
  const row = page.locator(`tr:has(input[value="${key}"])`);
  await expect(row).toBeVisible();
};

//验证请求头存在
export const verifyHeaderExists = async (page: Page, key: string): Promise<void> => {
  await switchToTab(page, 'Headers');
  const row = page.locator(`tr:has(input[value="${key}"])`);
  await expect(row).toBeVisible();
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

//清空所有请求头
export const clearAllHeaders = async (page: Page): Promise<void> => {
  await switchToTab(page, 'Headers');
  const deleteButtons = page.locator('.headers-table tr .icon-shanchu, [title*="删除"]');
  const count = await deleteButtons.count();
  for (let i = 0; i < count; i++) {
    await deleteButtons.first().click();
    await page.waitForTimeout(200);
  }
};

//获取完整请求URL
export const getFullRequestUrl = async (page: Page): Promise<string> => {
  const urlElement = page.locator('.pre-url-wrap .url, .full-url').first();
  const url = await urlElement.textContent();
  return url?.trim() || '';
};

//验证完整请求URL
export const verifyFullRequestUrl = async (
  page: Page,
  expectedUrl: string
): Promise<void> => {
  const actualUrl = await getFullRequestUrl(page);
  expect(actualUrl).toBe(expectedUrl);
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

//使用Mac快捷键重做 (Cmd+Shift+Z)
export const redoByMacShortcut = async (page: Page): Promise<void> => {
  await page.keyboard.press('Meta+Shift+Z');
  await page.waitForTimeout(200);
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
  const urlInput = getUrlInput(page);
  const value = await urlInput.inputValue();
  expect(value).toContain(`{{${variableName}}}`);
};

//切换到前置脚本标签
export const switchToPreRequestTab = async (page: Page): Promise<void> => {
  const preRequestTab = page.locator('.el-tabs__item:has-text("前置"), .pre-request-tab').first();
  await preRequestTab.click();
  await page.waitForTimeout(300);
};

//切换到后置脚本标签
export const switchToAfterRequestTab = async (page: Page): Promise<void> => {
  const afterRequestTab = page.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
  await afterRequestTab.click();
  await page.waitForTimeout(300);
};

//填写前置脚本代码
export const fillPreRequestScript = async (page: Page, script: string): Promise<void> => {
  await switchToPreRequestTab(page);
  const editor = page.locator('.monaco-editor').first();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(script);
  await page.waitForTimeout(300);
};

//填写后置脚本代码
export const fillAfterRequestScript = async (page: Page, script: string): Promise<void> => {
  await switchToAfterRequestTab(page);
  const editor = page.locator('.monaco-editor').first();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(script);
  await page.waitForTimeout(300);
};

//获取脚本编辑器内容
export const getScriptContent = async (page: Page): Promise<string> => {
  const editor = page.locator('.monaco-editor').first();
  const content = await editor.evaluate((el) => {
    const monaco = (window as any).monaco;
    if (monaco) {
      const models = monaco.editor.getModels();
      if (models && models.length > 0) {
        return models[0].getValue();
      }
    }
    return '';
  });
  return content;
};

//验证脚本编辑器显示
export const verifyScriptEditorVisible = async (page: Page): Promise<void> => {
  const editor = page.locator('.monaco-editor').first();
  await expect(editor).toBeVisible();
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

//通过Mac快捷键保存
export const saveByMacShortcut = async (page: Page): Promise<void> => {
  await page.keyboard.press('Meta+S');
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

//获取tab标题的未保存标识
export const getTabUnsavedIndicator = (page: Page) => {
  return page.locator('.tab-title:has-text("*"), .tab-pane[class*="modified"]').first();
};

//验证tab标题显示未保存标识
export const verifyTabUnsavedIndicator = async (page: Page): Promise<void> => {
  const tabIndicator = getTabUnsavedIndicator(page);
  if (await tabIndicator.isVisible()) {
    await expect(tabIndicator).toBeVisible();
  }
};

//点击另存为按钮
export const clickSaveAs = async (page: Page): Promise<void> => {
  const saveAsBtn = page.locator('button:has-text("另存为"), .save-as-btn, [title*="另存为"]').first();
  if (await saveAsBtn.isVisible()) {
    await saveAsBtn.click();
    await page.waitForTimeout(300);
  }
};

//输入另存为名称
export const fillSaveAsName = async (page: Page, name: string): Promise<void> => {
  const nameInput = page.locator('.el-dialog input[placeholder*="名称"], .save-as-dialog input').first();
  await nameInput.fill(name);
  await page.waitForTimeout(200);
};

//确认另存为
export const confirmSaveAs = async (page: Page): Promise<void> => {
  const confirmBtn = page.locator('.el-dialog .el-button--primary:has-text("确定"), .save-as-dialog button:has-text("确定")').first();
  await confirmBtn.click();
  await page.waitForTimeout(500);
};

//选择另存为目标文件夹
export const selectSaveAsFolder = async (page: Page, folderName: string): Promise<void> => {
  const folderSelect = page.locator('.folder-select, .el-select').first();
  if (await folderSelect.isVisible()) {
    await folderSelect.click();
    await page.waitForTimeout(200);
    const folderOption = page.locator(`.el-select-dropdown__item:has-text("${folderName}")`).first();
    await folderOption.click();
    await page.waitForTimeout(200);
  }
};

//切换到返回参数配置标签
export const switchToResponseConfigTab = async (page: Page): Promise<void> => {
  const tab = page.locator('.el-tabs__item:has-text("返回参数"), .response-config-tab').first();
  await tab.click();
  await page.waitForTimeout(300);
};

//添加响应配置
export const addResponseConfig = async (page: Page): Promise<void> => {
  const addBtn = page.locator('button:has-text("添加响应"), .add-response-btn, [title*="添加响应"]').first();
  await addBtn.click();
  await page.waitForTimeout(300);
};

//删除响应配置
export const deleteResponseConfig = async (page: Page, index: number): Promise<void> => {
  const deleteBtn = page.locator('.response-config-item, .response-item').nth(index).locator('.delete-btn, button:has-text("删除"), [title*="删除"]').first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForTimeout(300);
    const confirmBtn = page.locator('.el-message-box .el-button--primary').first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(300);
    }
  }
};

//设置响应状态码
export const setResponseStatusCode = async (page: Page, statusCode: string): Promise<void> => {
  const statusInput = page.locator('input[placeholder*="状态码"], .status-code-input').first();
  await statusInput.fill(statusCode);
  await page.waitForTimeout(200);
};

//设置响应标题
export const setResponseTitle = async (page: Page, title: string): Promise<void> => {
  const titleInput = page.locator('input[placeholder*="标题"], .response-title-input').first();
  await titleInput.fill(title);
  await page.waitForTimeout(200);
};

//选择响应数据类型
export const selectResponseDataType = async (page: Page, dataType: string): Promise<void> => {
  const typeSelect = page.locator('.data-type-select, .el-select').first();
  await typeSelect.click();
  await page.waitForTimeout(200);
  const option = page.locator(`.el-select-dropdown__item:has-text("${dataType}")`).first();
  await option.click();
  await page.waitForTimeout(200);
};

//编辑响应示例
export const editResponseExample = async (page: Page, content: string): Promise<void> => {
  const editor = page.locator('.response-example-editor, .monaco-editor').first();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(content);
  await page.waitForTimeout(300);
};

//获取响应示例内容
export const getResponseExampleContent = async (page: Page): Promise<string> => {
  const editor = page.locator('.response-example-editor, .monaco-editor').first();
  const content = await editor.evaluate((el) => {
    const monaco = (window as any).monaco;
    if (monaco) {
      const models = monaco.editor.getModels();
      if (models && models.length > 0) {
        return models[0].getValue();
      }
    }
    return '';
  });
  return content;
};

//格式化JSON响应示例
export const formatResponseJson = async (page: Page): Promise<void> => {
  const formatBtn = page.locator('button:has-text("格式化"), .format-btn, [title*="格式化"]').first();
  if (await formatBtn.isVisible()) {
    await formatBtn.click();
    await page.waitForTimeout(300);
  }
};

//验证JSON语法错误
export const verifyJsonSyntaxError = async (page: Page): Promise<void> => {
  const errorMarker = page.locator('.squiggly-error, .error-marker, .monaco-error').first();
  if (await errorMarker.isVisible()) {
    await expect(errorMarker).toBeVisible();
  }
};

//获取响应配置列表
export const getResponseConfigList = (page: Page) => {
  return page.locator('.response-config-item, .response-item');
};

//折叠响应配置
export const collapseResponseConfig = async (page: Page, index: number): Promise<void> => {
  const collapseBtn = page.locator('.response-config-item, .response-item').nth(index).locator('.collapse-btn, .el-collapse-item__header').first();
  if (await collapseBtn.isVisible()) {
    await collapseBtn.click();
    await page.waitForTimeout(300);
  }
};

//展开响应配置
export const expandResponseConfig = async (page: Page, index: number): Promise<void> => {
  const expandBtn = page.locator('.response-config-item, .response-item').nth(index).locator('.expand-btn, .el-collapse-item__header').first();
  if (await expandBtn.isVisible()) {
    await expandBtn.click();
    await page.waitForTimeout(300);
  }
};

//验证响应配置折叠状态
export const verifyResponseConfigCollapsed = async (page: Page, index: number): Promise<void> => {
  const detail = page.locator('.response-config-item, .response-item').nth(index).locator('.el-collapse-item__content, .response-detail').first();
  if (await detail.isVisible()) {
    await expect(detail).not.toBeVisible();
  }
};

//验证响应配置展开状态
export const verifyResponseConfigExpanded = async (page: Page, index: number): Promise<void> => {
  const detail = page.locator('.response-config-item, .response-item').nth(index).locator('.el-collapse-item__content, .response-detail').first();
  await expect(detail).toBeVisible();
};

//获取布局切换按钮
export const getLayoutToggleButton = (page: Page) => {
  return page.locator('.layout-toggle-btn, button[title*="布局"], [class*="layout-switch"]').first();
};

//切换到左右布局
export const switchToHorizontalLayout = async (page: Page): Promise<void> => {
  const layoutBtn = page.locator('button:has-text("左右布局"), .horizontal-layout-btn, [title*="左右布局"]').first();
  if (await layoutBtn.isVisible()) {
    await layoutBtn.click();
    await page.waitForTimeout(300);
  }
};

//切换到上下布局
export const switchToVerticalLayout = async (page: Page): Promise<void> => {
  const layoutBtn = page.locator('button:has-text("上下布局"), .vertical-layout-btn, [title*="上下布局"]').first();
  if (await layoutBtn.isVisible()) {
    await layoutBtn.click();
    await page.waitForTimeout(300);
  }
};

//验证水平布局
export const verifyHorizontalLayout = async (page: Page): Promise<void> => {
  const container = page.locator('.layout-container, .http-node-container').first();
  const className = await container.getAttribute('class');
  if (className) {
    expect(className).toContain('horizontal');
  }
};

//验证垂直布局
export const verifyVerticalLayout = async (page: Page): Promise<void> => {
  const container = page.locator('.layout-container, .http-node-container').first();
  const className = await container.getAttribute('class');
  if (className) {
    expect(className).toContain('vertical');
  }
};

//获取面板分隔线
export const getPanelSplitter = (page: Page) => {
  return page.locator('.splitter, .el-split-pane__trigger, .resize-handle').first();
};

//拖拽面板分隔线
export const dragPanelSplitter = async (page: Page, offsetX: number, offsetY: number): Promise<void> => {
  const splitter = getPanelSplitter(page);
  if (await splitter.isVisible()) {
    const box = await splitter.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + offsetX, box.y + box.height / 2 + offsetY);
      await page.mouse.up();
      await page.waitForTimeout(300);
    }
  }
};

//双击面板分隔线
export const doubleClickPanelSplitter = async (page: Page): Promise<void> => {
  const splitter = getPanelSplitter(page);
  if (await splitter.isVisible()) {
    await splitter.dblclick();
    await page.waitForTimeout(300);
  }
};

//获取请求面板宽度
export const getRequestPanelWidth = async (page: Page): Promise<number> => {
  const panel = page.locator('.request-panel, .left-panel').first();
  const box = await panel.boundingBox();
  return box ? box.width : 0;
};

//获取响应面板宽度
export const getResponsePanelWidth = async (page: Page): Promise<number> => {
  const panel = page.locator('.response-panel, .right-panel').first();
  const box = await panel.boundingBox();
  return box ? box.width : 0;
};

//验证面板最小宽度
export const verifyMinPanelWidth = async (page: Page, minWidth: number): Promise<void> => {
  const width = await getRequestPanelWidth(page);
  expect(width).toBeGreaterThanOrEqual(minWidth);
};

//验证拖拽光标样式
export const verifyDragCursor = async (page: Page): Promise<void> => {
  const splitter = getPanelSplitter(page);
  if (await splitter.isVisible()) {
    const cursor = await splitter.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });
    expect(cursor).toBeDefined();
  }
};

//设置窗口大小
export const resizeWindow = async (page: Page, width: number, height: number): Promise<void> => {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(300);
};
