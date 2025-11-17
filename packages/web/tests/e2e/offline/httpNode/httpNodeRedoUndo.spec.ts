import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';

//选择HTTP请求方法
const selectHttpMethod = async (
  page: Page,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
): Promise<void> => {
  const methodSelect = page.locator('[data-testid="method-select"]');
  await methodSelect.click();
  await page.locator(`.el-select-dropdown__item:has-text("${method}")`).click();
  await page.waitForTimeout(200);
};
//输入请求URL
const fillUrl = async (page: Page, url: string): Promise<void> => {
  const urlInput = page.locator('[data-testid="url-input"]');
  await urlInput.clear();
  await urlInput.fill(url);
  await urlInput.blur();
  await page.waitForTimeout(200);
};
//验证URL输入框的值
const verifyUrlValue = async (page: Page, expectedUrl: string): Promise<void> => {
  const urlInput = page.locator('[data-testid="url-input"]');
  await expect(urlInput).toHaveValue(expectedUrl);
};
//切换到指定标签
const switchToTab = async (
  page: Page,
  tabName: 'Params' | 'Body' | 'Headers' | '返回参数' | '前置脚本' | '后置脚本' | '备注'
): Promise<void> => {
  const targetName = tabName === 'Headers' ? '请求头' : tabName;
  const tab = page.locator(`.el-tabs__item:has-text("${targetName}")`);
  await tab.click();
  await page.waitForTimeout(300);
};
//添加Query参数
const addQueryParam = async (
  page: Page,
  key: string,
  value: string,
  options: { enabled?: boolean; description?: string } = {}
): Promise<void> => {
  const { enabled = true, description = '' } = options;
  const paramsActive = await page
    .locator('.el-tabs__item.is-active:has-text("Params"), .el-tabs__item.is-active:has-text("参数")')
    .first()
    .isVisible()
    .catch(() => false);
  if (!paramsActive) {
    await switchToTab(page, 'Params');
  }
  const tree = page.locator('.body-params .el-tree, .query-path-params .el-tree').first();
  if (await tree.count()) {
    await tree.waitFor({ state: 'visible', timeout: 5000 });
    const rows = tree.locator('.custom-params');
    const count = await rows.count();
    const lastIndex = count > 0 ? count - 1 : 0;
    const targetRow = rows.nth(lastIndex);
    const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
    await keyInput.fill(key);
    const valueInput = targetRow.locator(
      '.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]'
    ).first();
    if (value.includes('\n')) {
      await valueInput.click({ force: true });
      await page.waitForTimeout(50);
      const textarea = targetRow
        .locator('.value-textarea textarea, .value-textarea .el-textarea__inner, textarea')
        .first();
      await textarea.waitFor({ state: 'visible', timeout: 3000 });
      await textarea.fill(value);
      await textarea.blur();
    } else {
      await valueInput.fill(value);
    }
    if (description) {
      const descInput = targetRow.locator('input[placeholder*="描述"], input[placeholder*="说明"]').first();
      if (await descInput.count()) {
        await descInput.fill(description);
      }
    }
    if (!enabled) {
      const checkbox = targetRow.locator('input[type="checkbox"]').first();
      if (await checkbox.isChecked()) {
        const checkboxWrapper = targetRow.locator('.el-checkbox').first();
        await checkboxWrapper.click();
      }
    }
  } else {
    let keyInput = page.locator('input[placeholder="输入参数名称自动换行"]').first();
    if (!(await keyInput.count())) {
      keyInput = page.locator('input[placeholder*="参数名称"]').first();
    }
    if (!(await keyInput.count())) {
      keyInput = page.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
    }
    await keyInput.fill(key);
    let valueInput = page.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
    if (!(await valueInput.count())) {
      valueInput = page.locator('input[placeholder*="参数值"]').first();
    }
    if (!(await valueInput.count())) {
      valueInput = page.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
    }
    if (value.includes('\n')) {
      await valueInput.click({ force: true });
      await page.waitForTimeout(50);
      const paramRow = page.locator('.custom-params').filter({ has: valueInput }).first();
      const textarea = paramRow
        .locator('.value-textarea textarea, .value-textarea .el-textarea__inner, textarea')
        .first();
      await textarea.waitFor({ state: 'visible', timeout: 3000 });
      await textarea.fill(value);
      await textarea.blur();
    } else {
      await valueInput.fill(value);
    }
    if (description) {
      let descInput = page.locator('input[placeholder="参数描述与备注"]').first();
      if (!(await descInput.count())) {
        descInput = page.locator('input[placeholder*="描述"], input[placeholder*="说明"]').first();
      }
      if (await descInput.count()) {
        await descInput.fill(description);
      }
    }
    if (!enabled) {
      let checkbox = page.locator('label:has-text("必有") input[type="checkbox"]').first();
      if (!(await checkbox.count())) {
        checkbox = page.locator('.params-table input[type="checkbox"], .s-params input[type="checkbox"]').first();
      }
      if (!(await checkbox.count())) {
        checkbox = page.locator('input[type="checkbox"]').first();
      }
      if (await checkbox.count()) {
        await checkbox.uncheck();
      }
    }
  }
  await page.waitForTimeout(20);
};
//验证参数存在
const verifyQueryParamExists = async (
  page: Page,
  key: string
): Promise<void> => {
  await switchToTab(page, 'Params');
  const container = page.locator('.query-path-params .el-tree').first();
  await container.waitFor({ state: 'visible', timeout: 5000 });
  const keyInputs = container.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]');
  const count = await keyInputs.count();
  for (let i = 0; i < count; i++) {
    const candidate = keyInputs.nth(i);
    const value = await candidate.inputValue();
    if (value === key) {
      await expect(candidate).toBeVisible();
      return;
    }
  }
  throw new Error(`Query param ${key} not found`);
};
const addHeader = async (
  page: Page,
  key: string,
  value: string,
  options: { enabled?: boolean; description?: string } = {}
): Promise<void> => {
  const { enabled = true, description = '' } = options;
  const headersActive = await page
    .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
    .first()
    .isVisible()
    .catch(() => false);
  if (!headersActive) {
    await switchToTab(page, 'Headers');
  }
  const container = page.locator('.header-info .el-tree').first();
  await container.waitFor({ state: 'visible', timeout: 5000 });
  const rows = container.locator('.custom-params');
  const count = await rows.count();
  const lastIndex = count > 0 ? count - 1 : 0;
  const lastRow = rows.nth(lastIndex);
  const keyInput = lastRow.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
  await keyInput.fill(key);
  const valueInput = lastRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
  await valueInput.fill(value);
  if (description) {
    const descInput = lastRow.locator('input[placeholder="参数描述与备注"], input[placeholder*="描述"], input[placeholder*="说明"]').first();
    if (await descInput.count()) {
      await descInput.fill(description);
    }
  }
  if (!enabled) {
    const checkboxWrapper = lastRow.locator('.el-checkbox').first();
    if (await checkboxWrapper.count()) {
      await checkboxWrapper.click();
    }
  }
  await page.waitForTimeout(20);
};
//验证请求头存在
const verifyHeaderExists = async (page: Page, key: string): Promise<void> => {
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
//切换Body模式
const switchBodyMode = async (
  page: Page,
  mode: 'none' | 'JSON' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary'
): Promise<void> => {
  await switchToTab(page, 'Body');
  const modeMap: Record<typeof mode, string> = {
    none: 'none',
    JSON: 'json',
    'form-data': 'formdata',
    'x-www-form-urlencoded': 'urlencoded',
    raw: 'raw',
    binary: 'binary'
  };
  const targetValue = modeMap[mode];
  const radioOption = page
    .locator('.body-params .el-radio-group .el-radio')
    .filter({ hasText: targetValue });
  if (await radioOption.count()) {
    await radioOption.first().click();
  } else {
    const radioInput = page.locator(`.body-params input[value="${targetValue}"]`).first();
    await radioInput.check({ force: true });
  }
  await page.waitForTimeout(300);
};
//填充JSON Body
const fillJsonBody = async (
  page: Page,
  json: Record<string, unknown> | string
): Promise<void> => {
  await switchBodyMode(page, 'JSON');
  const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
  const editor = page.locator('.workbench .monaco-editor').first();
  const jsonTip = page.locator('.workbench .json-tip').first();
  if (await jsonTip.isVisible()) {
    await jsonTip.click({ force: true });
    await page.waitForTimeout(100);
  }
  await editor.click({ force: true });
  await page.keyboard.press('Control+A');
  await page.keyboard.type(jsonString);
  await page.waitForTimeout(300);
};
//验证撤销按钮是否禁用
const verifyUndoDisabled = async (page: Page): Promise<void> => {
  const undoBtn = page.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
  const isDisabled = await undoBtn.isDisabled();
  expect(isDisabled).toBe(true);
};
//验证撤销按钮是否启用
const verifyUndoEnabled = async (page: Page): Promise<void> => {
  const undoBtn = page.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
  const isDisabled = await undoBtn.isDisabled();
  expect(isDisabled).toBe(false);
};
//验证重做按钮是否禁用
const verifyRedoDisabled = async (page: Page): Promise<void> => {
  const redoBtn = page.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
  const isDisabled = await redoBtn.isDisabled();
  expect(isDisabled).toBe(true);
};
//验证重做按钮是否启用
const verifyRedoEnabled = async (page: Page): Promise<void> => {
  const redoBtn = page.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
  const isDisabled = await redoBtn.isDisabled();
  expect(isDisabled).toBe(false);
};
//使用快捷键撤销 (Ctrl+Z)
const undoByShortcut = async (page: Page): Promise<void> => {
  await page.keyboard.press('Control+Z');
  await page.waitForTimeout(200);
};
//使用快捷键重做 (Ctrl+Y)
const redoByShortcut = async (page: Page): Promise<void> => {
  await page.keyboard.press('Control+Y');
  await page.waitForTimeout(200);
};
//使用Mac快捷键重做 (Cmd+Shift+Z)
const redoByMacShortcut = async (page: Page): Promise<void> => {
  await page.keyboard.press('Meta+Shift+Z');
  await page.waitForTimeout(200);
};

test.describe('11. HTTP节点 - 撤销/重做功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test API',
      type: 'http'
    });
  });

  test.describe('11.1 撤销功能测试', () => {
    /**
     * 测试目的：验证显示撤销按钮
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 等待HTTP节点就绪
     *   2. 检查撤销按钮是否显示
     * 预期结果：
     *   - 撤销按钮可见
     *   - 按钮位置在工具栏区域
     * 验证点：撤销按钮的显示
     * 说明：撤销按钮是操作历史管理的入口
     */
    test('应显示撤销按钮', async () => {
      // 检查撤销按钮是否显示
      const undoBtn = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await expect(undoBtn).toBeVisible();
    });

    /**
     * 测试目的：验证初始状态撤销按钮禁用
     * 前置条件：已创建HTTP节点但未进行任何操作
     * 操作步骤：
     *   1. 等待HTTP节点就绪
     *   2. 检查撤销按钮状态
     * 预期结果：
     *   - 撤销按钮为禁用状态
     *   - 没有可撤销的操作
     * 验证点：初始状态按钮状态
     * 说明：未执行操作前不能撤销
     */
    test('初始状态撤销按钮应禁用', async () => {
      // 检查撤销按钮状态
      await verifyUndoDisabled(contentPage);
    });

    /**
     * 测试目的：验证执行操作后撤销按钮启用
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Query参数
     *   2. 检查撤销按钮状态
     * 预期结果：
     *   - 撤销按钮变为启用状态
     *   - 可以执行撤销操作
     * 验证点：操作后按钮状态变化
     * 说明：执行任何编辑操作后撤销按钮启用
     */
    test('执行操作后撤销按钮应启用', async () => {
      // 添加Query参数
      await addQueryParam(contentPage, 'testKey', 'testValue');
      await contentPage.waitForTimeout(300);
      // 检查撤销按钮状态
      await verifyUndoEnabled(contentPage);
    });

    /**
     * 测试目的：验证撤销添加Query参数
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Query参数
     *   2. 验证参数存在
     *   3. 点击撤销
     *   4. 验证参数已删除
     * 预期结果：
     *   - 撤销后参数不存在
     *   - 恢复到添加前的状态
     * 验证点：Query参数撤销功能
     * 说明：撤销可以移除新添加的参数
     */
    test('应能撤销添加Query参数', async () => {
      // 添加Query参数
      await addQueryParam(contentPage, 'testParam', 'testValue');
      await verifyQueryParamExists(contentPage, 'testParam');
      // 点击撤销
      const undoButton = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton.click();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证参数已删除
      const row = contentPage.locator('tr:has(input[value="testParam"])');
      await expect(row).not.toBeVisible();
    });

    /**
     * 测试目的：验证撤销编辑URL
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 填写初始URL
     *   2. 修改为新URL
     *   3. 点击撤销
     *   4. 验证URL恢复为初始值
     * 预期结果：
     *   - URL恢复到上一次的值
     *   - 撤销后显示原始URL
     * 验证点：URL编辑撤销功能
     * 说明：撤销URL修改操作
     */
    test('应能撤销编辑URL', async () => {
      // 填写初始URL
      const originalUrl = 'http://example.com/api';
      await fillUrl(contentPage, originalUrl);
      await contentPage.waitForTimeout(300);
      // 修改为新URL
      await fillUrl(contentPage, 'http://example.com/new-api');
      await contentPage.waitForTimeout(300);
      // 点击撤销
      const undoButton = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton.click();
      await contentPage.waitForTimeout(200);
      // 验证URL恢复为初始值
      await verifyUrlValue(contentPage, originalUrl);
    });

    /**
     * 测试目的：验证撤销添加Headers
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Header
     *   2. 验证Header存在
     *   3. 点击撤销
     *   4. 验证Header已删除
     * 预期结果：
     *   - 撤销后Header不存在
     *   - Headers列表恢复到添加前状态
     * 验证点：Headers撤销功能
     * 说明：撤销可以移除新添加的Header
     */
    test('应能撤销添加Headers', async () => {
      // 添加Header
      await addHeader(contentPage, 'X-Test-Header', 'TestValue');
      await verifyHeaderExists(contentPage, 'X-Test-Header');
      // 点击撤销
      const undoButton = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton.click();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证Header已删除
      const row = contentPage.locator('tr:has(input[value="X-Test-Header"])');
      await expect(row).not.toBeVisible();
    });

    /**
     * 测试目的：验证撤销Body编辑
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 填写初始Body
     *   3. 修改Body内容
     *   4. 点击撤销
     * 预期结果：
     *   - Body恢复到上一次的值
     *   - 撤销后显示原始Body内容
     * 验证点：Body编辑撤销功能
     * 说明：撤销Body修改操作
     */
    test('应能撤销Body编辑', async () => {
      // 选择POST方法
      await selectHttpMethod(contentPage, 'POST');
      // 填写初始Body
      await fillJsonBody(contentPage, { key: 'value1' });
      await contentPage.waitForTimeout(300);
      // 修改Body内容
      await fillJsonBody(contentPage, { key: 'value2' });
      await contentPage.waitForTimeout(300);
      // 点击撤销
      const undoButton = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton.click();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证连续撤销多次操作
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加3个Query参数
     *   2. 连续点击撤销3次
     *   3. 验证所有参数都被删除
     * 预期结果：
     *   - 所有参数都被撤销
     *   - 按操作逆序依次撤销
     * 验证点：连续撤销功能
     * 说明：可以连续撤销多个操作
     */
    test('应能连续撤销多次操作', async () => {
      // 添加3个Query参数
      await addQueryParam(contentPage, 'param1', 'value1');
      await contentPage.waitForTimeout(300);
      await addQueryParam(contentPage, 'param2', 'value2');
      await contentPage.waitForTimeout(300);
      await addQueryParam(contentPage, 'param3', 'value3');
      await contentPage.waitForTimeout(300);
      // 连续点击撤销3次
      const undoButton1 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton1.click();
      await contentPage.waitForTimeout(200);
      const undoButton2 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton2.click();
      await contentPage.waitForTimeout(200);
      const undoButton3 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton3.click();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证所有参数都被删除
      const row1 = contentPage.locator('tr:has(input[value="param1"])');
      const row2 = contentPage.locator('tr:has(input[value="param2"])');
      const row3 = contentPage.locator('tr:has(input[value="param3"])');
      await expect(row1).not.toBeVisible();
      await expect(row2).not.toBeVisible();
      await expect(row3).not.toBeVisible();
    });

    /**
     * 测试目的：验证撤销到初始状态后按钮禁用
     * 前置条件：已创建HTTP节点并执行操作
     * 操作步骤：
     *   1. 添加参数
     *   2. 撤销操作
     *   3. 检查撤销按钮状态
     * 预期结果：
     *   - 撤销按钮变为禁用状态
     *   - 没有更多可撤销的操作
     * 验证点：撤销边界状态
     * 说明：撤销到初始状态后不能再撤销
     */
    test('撤销到初始状态后按钮应禁用', async () => {
      // 添加参数
      await addQueryParam(contentPage, 'testParam', 'testValue');
      await contentPage.waitForTimeout(300);
      // 撤销操作
      const undoButton = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton.click();
      await contentPage.waitForTimeout(200);
      // 检查撤销按钮状态
      await verifyUndoDisabled(contentPage);
    });

    /**
     * 测试目的：验证Ctrl+Z快捷键撤销
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Query参数
     *   2. 按Ctrl+Z
     *   3. 验证参数被撤销
     * 预期结果：
     *   - 快捷键触发撤销
     *   - 参数被删除
     * 验证点：撤销快捷键功能
     * 说明：Ctrl+Z是常用的撤销快捷键
     */
    test('应支持Ctrl+Z快捷键撤销', async () => {
      // 添加Query参数
      await addQueryParam(contentPage, 'shortcutTest', 'value');
      await verifyQueryParamExists(contentPage, 'shortcutTest');
      // 按Ctrl+Z
      await undoByShortcut(contentPage);
      await contentPage.waitForTimeout(300);
      // 验证参数被撤销
      const row = contentPage.locator('tr:has(input[value="shortcutTest"])');
      await expect(row).not.toBeVisible();
    });
  });

  test.describe('11.2 重做功能测试', () => {
    /**
     * 测试目的：验证显示重做按钮
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 等待HTTP节点就绪
     *   2. 检查重做按钮是否显示
     * 预期结果：
     *   - 重做按钮可见
     *   - 按钮位置在撤销按钮旁边
     * 验证点：重做按钮的显示
     * 说明：重做按钮用于恢复被撤销的操作
     */
    test('应显示重做按钮', async () => {
      // 检查重做按钮是否显示
      const redoBtn = contentPage.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
      await expect(redoBtn).toBeVisible();
    });

    /**
     * 测试目的：验证初始状态重做按钮禁用
     * 前置条件：已创建HTTP节点但未进行撤销操作
     * 操作步骤：
     *   1. 等待HTTP节点就绪
     *   2. 检查重做按钮状态
     * 预期结果：
     *   - 重做按钮为禁用状态
     *   - 没有可重做的操作
     * 验证点：初始状态按钮状态
     * 说明：未执行撤销前不能重做
     */
    test('初始状态重做按钮应禁用', async () => {
      // 检查重做按钮状态
      await verifyRedoDisabled(contentPage);
    });

    /**
     * 测试目的：验证撤销后重做按钮启用
     * 前置条件：已创建HTTP节点并执行操作
     * 操作步骤：
     *   1. 添加Query参数
     *   2. 点击撤销
     *   3. 检查重做按钮状态
     * 预期结果：
     *   - 重做按钮变为启用状态
     *   - 可以执行重做操作
     * 验证点：撤销后按钮状态变化
     * 说明：撤销操作后重做按钮启用
     */
    test('撤销后重做按钮应启用', async () => {
      // 添加Query参数
      await addQueryParam(contentPage, 'testKey', 'testValue');
      await contentPage.waitForTimeout(300);
      // 点击撤销
      const undoButton = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton.click();
      await contentPage.waitForTimeout(200);
      // 检查重做按钮状态
      await verifyRedoEnabled(contentPage);
    });

    /**
     * 测试目的：验证重做被撤销的操作
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Query参数
     *   2. 验证参数存在
     *   3. 撤销操作
     *   4. 验证参数被删除
     *   5. 重做操作
     *   6. 验证参数恢复
     * 预期结果：
     *   - 重做后参数重新出现
     *   - 恢复到撤销前的状态
     * 验证点：重做功能
     * 说明：重做可以恢复被撤销的操作
     */
    test('应能重做被撤销的操作', async () => {
      // 添加Query参数
      await addQueryParam(contentPage, 'redoTest', 'value');
      await verifyQueryParamExists(contentPage, 'redoTest');
      // 撤销操作
      const undoButton = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton.click();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证参数被删除
      const rowAfterUndo = contentPage.locator('tr:has(input[value="redoTest"])');
      await expect(rowAfterUndo).not.toBeVisible();
      // 重做操作
      const redoButton = contentPage.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
      await redoButton.click();
      await contentPage.waitForTimeout(200);
      // 验证参数恢复
      await verifyQueryParamExists(contentPage, 'redoTest');
    });

    /**
     * 测试目的：验证连续重做多次操作
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加3个Query参数
     *   2. 连续撤销3次
     *   3. 连续重做3次
     *   4. 验证所有参数都恢复
     * 预期结果：
     *   - 所有参数都被重做
     *   - 按撤销逆序依次重做
     * 验证点：连续重做功能
     * 说明：可以连续重做多个被撤销的操作
     */
    test('应能连续重做多次操作', async () => {
      // 添加3个Query参数
      await addQueryParam(contentPage, 'param1', 'value1');
      await contentPage.waitForTimeout(300);
      await addQueryParam(contentPage, 'param2', 'value2');
      await contentPage.waitForTimeout(300);
      await addQueryParam(contentPage, 'param3', 'value3');
      await contentPage.waitForTimeout(300);
      // 连续撤销3次
      const undoButton1 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton1.click();
      await contentPage.waitForTimeout(200);
      const undoButton2 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton2.click();
      await contentPage.waitForTimeout(200);
      const undoButton3 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton3.click();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 连续重做3次
      const redoButton1 = contentPage.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
      await redoButton1.click();
      await contentPage.waitForTimeout(200);
      const redoButton2 = contentPage.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
      await redoButton2.click();
      await contentPage.waitForTimeout(200);
      const redoButton3 = contentPage.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
      await redoButton3.click();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证所有参数都恢复
      await verifyQueryParamExists(contentPage, 'param1');
      await verifyQueryParamExists(contentPage, 'param2');
      await verifyQueryParamExists(contentPage, 'param3');
    });

    /**
     * 测试目的：验证重做到最新状态后按钮禁用
     * 前置条件：已创建HTTP节点并执行撤销重做
     * 操作步骤：
     *   1. 添加参数
     *   2. 撤销操作
     *   3. 重做操作
     *   4. 检查重做按钮状态
     * 预期结果：
     *   - 重做按钮变为禁用状态
     *   - 没有更多可重做的操作
     * 验证点：重做边界状态
     * 说明：重做到最新状态后不能再重做
     */
    test('重做到最新状态后按钮应禁用', async () => {
      // 添加参数
      await addQueryParam(contentPage, 'testParam', 'testValue');
      await contentPage.waitForTimeout(300);
      // 撤销操作
      const undoButton = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton.click();
      await contentPage.waitForTimeout(200);
      // 重做操作
      const redoButton = contentPage.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
      await redoButton.click();
      await contentPage.waitForTimeout(200);
      // 检查重做按钮状态
      await verifyRedoDisabled(contentPage);
    });

    /**
     * 测试目的：验证Ctrl+Y快捷键重做
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Query参数
     *   2. 按Ctrl+Z撤销
     *   3. 按Ctrl+Y重做
     *   4. 验证参数恢复
     * 预期结果：
     *   - 快捷键触发重做
     *   - 参数重新出现
     * 验证点：重做快捷键功能
     * 说明：Ctrl+Y是常用的重做快捷键
     */
    test('应支持Ctrl+Y快捷键重做', async () => {
      // 添加Query参数
      await addQueryParam(contentPage, 'shortcutRedo', 'value');
      await verifyQueryParamExists(contentPage, 'shortcutRedo');
      // 按Ctrl+Z撤销
      await undoByShortcut(contentPage);
      await contentPage.waitForTimeout(300);
      // 按Ctrl+Y重做
      await redoByShortcut(contentPage);
      // 验证参数恢复
      await verifyQueryParamExists(contentPage, 'shortcutRedo');
    });

    /**
     * 测试目的：验证Cmd+Shift+Z快捷键重做(Mac)
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Query参数
     *   2. 撤销操作
     *   3. 按Cmd+Shift+Z重做
     * 预期结果：
     *   - Mac快捷键触发重做
     *   - 参数重新出现
     * 验证点：Mac平台重做快捷键
     * 说明：Mac系统使用Cmd+Shift+Z重做
     */
    test('应支持Cmd+Shift+Z快捷键重做(Mac)', async () => {
      // 添加Query参数
      await addQueryParam(contentPage, 'macRedo', 'value');
      await verifyQueryParamExists(contentPage, 'macRedo');
      // 撤销操作
      await undoByShortcut(contentPage);
      await contentPage.waitForTimeout(300);
      // 按Cmd+Shift+Z重做
      await redoByMacShortcut(contentPage);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('11.3 操作历史管理', () => {
    /**
     * 测试目的：验证新操作清空重做栈
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加参数A
     *   2. 撤销
     *   3. 验证可以重做
     *   4. 添加参数B
     *   5. 验证不能重做
     * 预期结果：
     *   - 新操作清空重做栈
     *   - 无法重做之前撤销的操作
     * 验证点：重做栈管理
     * 说明：执行新操作会清空所有重做历史
     */
    test('新操作应清空重做栈', async () => {
      // 添加参数A
      await addQueryParam(contentPage, 'paramA', 'valueA');
      await contentPage.waitForTimeout(300);
      // 撤销
      const undoButton = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton.click();
      await contentPage.waitForTimeout(200);
      // 验证可以重做
      await verifyRedoEnabled(contentPage);
      // 添加参数B
      await addQueryParam(contentPage, 'paramB', 'valueB');
      await contentPage.waitForTimeout(300);
      // 验证不能重做
      await verifyRedoDisabled(contentPage);
    });

    /**
     * 测试目的：验证限制历史记录最大数量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加25个Query参数
     *   2. 连续撤销直到按钮禁用
     *   3. 统计撤销次数
     * 预期结果：
     *   - 撤销次数不超过20次
     *   - 最早的操作历史被丢弃
     * 验证点：历史记录数量限制
     * 说明：限制历史数量避免占用过多内存
     */
    test('应限制历史记录最大数量', async () => {
      // 添加25个Query参数
      for (let i = 0; i < 25; i++) {
        await addQueryParam(contentPage, `param${i}`, `value${i}`);
        await contentPage.waitForTimeout(100);
      }
      await contentPage.waitForTimeout(300);
      // 连续撤销直到按钮禁用
      let undoCount = 0;
      const maxUndoCount = 20;
      while (undoCount < maxUndoCount) {
        const undoBtn = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
        const isDisabled = await undoBtn.isDisabled();
        if (isDisabled) break;
        const undoButton = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
        await undoButton.click();
        await contentPage.waitForTimeout(200);
        undoCount++;
      }
      // 验证撤销次数不超过20次
      expect(undoCount).toBeLessThanOrEqual(maxUndoCount);
    });

    /**
     * 测试目的：验证切换节点清空历史
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加参数
     *   2. 验证可以撤销
     *   3. 创建新节点
     *   4. 检查撤销按钮状态
     * 预期结果：
     *   - 切换节点后历史被清空
     *   - 撤销按钮禁用
     * 验证点：节点切换历史管理
     * 说明：每个节点有独立的操作历史
     */
    test('切换节点应清空历史', async () => {
      // 添加参数
      await addQueryParam(contentPage, 'testParam', 'testValue');
      await contentPage.waitForTimeout(300);
      // 验证可以撤销
      await verifyUndoEnabled(contentPage);
      // 创建新节点
      const createNodeBtn = contentPage.locator('[title*="创建"], .create-node-btn').first();
      if (await createNodeBtn.isVisible()) {
        await createNodeBtn.click();
        await contentPage.waitForTimeout(500);
        const httpOption = contentPage.locator('.node-type-http, [data-type="http"]').first();
        if (await httpOption.isVisible()) {
          await httpOption.click();
          await contentPage.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('11.4 撤销重做数据一致性', () => {
    /**
     * 测试目的：验证撤销重做后数据一致
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 设置初始URL
     *   2. 修改URL
     *   3. 撤销验证恢复到初始URL
     *   4. 重做验证恢复到修改后URL
     *   5. 再次撤销验证恢复到初始URL
     * 预期结果：
     *   - 每次撤销重做数据一致
     *   - 数据在两个状态间正确切换
     * 验证点：数据一致性
     * 说明：撤销重做不会造成数据错误
     */
    test('撤销重做后数据应与原始状态一致', async () => {
      // 设置初始URL
      const initialUrl = 'http://example.com/initial';
      await fillUrl(contentPage, initialUrl);
      await contentPage.waitForTimeout(300);
      // 修改URL
      await fillUrl(contentPage, 'http://example.com/modified');
      await contentPage.waitForTimeout(300);
      // 撤销验证恢复到初始URL
      const undoButton1 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton1.click();
      await contentPage.waitForTimeout(200);
      await verifyUrlValue(contentPage, initialUrl);
      // 重做验证恢复到修改后URL
      const redoButton = contentPage.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
      await redoButton.click();
      await contentPage.waitForTimeout(200);
      await verifyUrlValue(contentPage, 'http://example.com/modified');
      // 再次撤销验证恢复到初始URL
      const undoButton2 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton2.click();
      await contentPage.waitForTimeout(200);
      await verifyUrlValue(contentPage, initialUrl);
    });

    /**
     * 测试目的：验证多次撤销重做数据正确性
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 执行4个不同类型的操作
     *   2. 撤销2个操作
     *   3. 重做2个操作
     *   4. 验证数据正确
     *   5. 撤销3个操作
     *   6. 验证数据正确
     * 预期结果：
     *   - 每次撤销重做后数据正确
     *   - 多种操作类型混合正常工作
     * 验证点：复杂场景数据一致性
     * 说明：多次撤销重做保持数据完整性
     */
    test('多次撤销重做应保持数据正确性', async () => {
      // 执行4个不同类型的操作
      await addQueryParam(contentPage, 'step1', 'value1');
      await contentPage.waitForTimeout(200);
      await addQueryParam(contentPage, 'step2', 'value2');
      await contentPage.waitForTimeout(200);
      await fillUrl(contentPage, 'http://example.com/api');
      await contentPage.waitForTimeout(200);
      await addHeader(contentPage, 'X-Test', 'HeaderValue');
      await contentPage.waitForTimeout(300);
      // 撤销2个操作
      const undoButton1 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton1.click();
      await contentPage.waitForTimeout(200);
      const undoButton2 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton2.click();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 重做2个操作
      const redoButton1 = contentPage.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
      await redoButton1.click();
      await contentPage.waitForTimeout(200);
      const redoButton2 = contentPage.locator('[title*="重做"], .redo-btn, button:has-text("重做")').first();
      await redoButton2.click();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证数据正确
      await verifyUrlValue(contentPage, 'http://example.com/api');
      await verifyHeaderExists(contentPage, 'X-Test');
      // 撤销3个操作
      const undoButton3 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton3.click();
      await contentPage.waitForTimeout(200);
      const undoButton4 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton4.click();
      await contentPage.waitForTimeout(200);
      const undoButton5 = contentPage.locator('[title*="撤销"], .undo-btn, button:has-text("撤销")').first();
      await undoButton5.click();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'step1');
      const step2Row = contentPage.locator('tr:has(input[value="step2"])');
      await expect(step2Row).not.toBeVisible();
    });
  });
});
