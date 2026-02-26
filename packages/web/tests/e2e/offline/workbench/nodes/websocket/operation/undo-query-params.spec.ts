import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketQueryParamsUndo', () => {
  // 添加 Query 参数后点击撤销按钮应回退 URL 拼接
  test('添加Query参数后点击撤销恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数-撤销按钮' });
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    const queryPanel = contentPage.locator('.ws-query-params');
    await expect(queryPanel).toBeVisible({ timeout: 5000 });
    // 先设置基础地址，再录入 Query 参数
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('ws://127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    const row = queryPanel.locator('[data-testid="params-tree-row"]').first();
    await expect(row).toBeVisible({ timeout: 5000 });
    const checkbox = row.locator('.el-checkbox').first();
    if (!((await checkbox.getAttribute('class')) || '').includes('is-checked')) {
      await checkbox.click();
    }
    await row.getByPlaceholder(/参数名称/).first().fill('undoKey');
    const valueEditor = row.locator('[data-testid="params-tree-value-input"]').first().locator('[contenteditable], textarea, input').first();
    await valueEditor.click();
    await contentPage.keyboard.type('undoValue');
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('undoKey=undoValue');
    // 失焦后触发撤销按钮，验证 Query 拼接回退
    await paramsTab.click();
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await expect(undoBtn).toBeVisible({ timeout: 5000 });
    await undoBtn.click();
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).not.toContain('undoKey=undoValue');
  });
  // 使用 Ctrl+Z 触发撤销应与撤销按钮行为一致
  test('使用Ctrl+Z撤销Query参数编辑', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数-快捷键撤销' });
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    const queryPanel = contentPage.locator('.ws-query-params');
    await expect(queryPanel).toBeVisible({ timeout: 5000 });
    // 录入 Query 参数并确认已拼接到 URL
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('ws://127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    const row = queryPanel.locator('[data-testid="params-tree-row"]').first();
    const checkbox = row.locator('.el-checkbox').first();
    if (!((await checkbox.getAttribute('class')) || '').includes('is-checked')) {
      await checkbox.click();
    }
    await row.getByPlaceholder(/参数名称/).first().fill('hotkeyKey');
    const valueEditor = row.locator('[data-testid="params-tree-value-input"]').first().locator('[contenteditable], textarea, input').first();
    await valueEditor.click();
    await contentPage.keyboard.type('hotkeyValue');
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('hotkeyKey=hotkeyValue');
    // 将焦点切回非输入区，避免 Ctrl+Z 仅影响富文本输入框
    await paramsTab.click();
    await contentPage.keyboard.press('Control+z');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).not.toContain('hotkeyKey=hotkeyValue');
  });
  // 删除参数后撤销应恢复被删除的 Query 行与 URL 拼接
  test('删除Query参数后撤销恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数-删除撤销' });
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    const queryPanel = contentPage.locator('.ws-query-params');
    await expect(queryPanel).toBeVisible({ timeout: 5000 });
    // 先创建一条可识别的 Query 记录
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('ws://127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    const firstRow = queryPanel.locator('[data-testid="params-tree-row"]').first();
    const checkbox = firstRow.locator('.el-checkbox').first();
    if (!((await checkbox.getAttribute('class')) || '').includes('is-checked')) {
      await checkbox.click();
    }
    await firstRow.getByPlaceholder(/参数名称/).first().fill('deleteKey');
    const valueEditor = firstRow.locator('[data-testid="params-tree-value-input"]').first().locator('[contenteditable], textarea, input').first();
    await valueEditor.click();
    await contentPage.keyboard.type('deleteValue');
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('deleteKey=deleteValue');
    // 删除该记录后 URL 应立即移除对应参数
    const rows = queryPanel.locator('[data-testid="params-tree-row"]');
    const rowCount = await rows.count();
    let matchedIndex = -1;
    for (let index = 0; index < rowCount; index += 1) {
      const keyValue = await rows.nth(index).getByPlaceholder(/参数名称/).first().inputValue();
      if (keyValue === 'deleteKey') {
        matchedIndex = index;
        break;
      }
    }
    expect(matchedIndex).toBeGreaterThanOrEqual(0);
    await rows.nth(matchedIndex).locator('[data-testid="params-tree-delete-btn"]').first().click();
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).not.toContain('deleteKey=deleteValue');
    // Ctrl+Z 撤销删除后，参数应恢复
    await queryPanel.locator('.title').first().click();
    await contentPage.keyboard.press('Control+z');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('deleteKey=deleteValue');
    const restoredRows = queryPanel.locator('[data-testid="params-tree-row"]');
    const restoredCount = await restoredRows.count();
    let restored = false;
    for (let index = 0; index < restoredCount; index += 1) {
      const keyValue = await restoredRows.nth(index).getByPlaceholder(/参数名称/).first().inputValue();
      if (keyValue === 'deleteKey') {
        restored = true;
        break;
      }
    }
    expect(restored).toBe(true);
  });
  // 修改 Query 值后撤销应使值回退，不再保持最新输入
  test('撤销Query参数值编辑后参数值回退', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数值撤销测试' });
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /^Params$/ });
    await paramsTab.click();
    const queryPanel = contentPage.locator('.ws-query-params');
    await expect(queryPanel).toBeVisible({ timeout: 5000 });
    // 先写入原始值，再修改为新值
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await urlEditor.fill('ws://127.0.0.1:8080/ws');
    await contentPage.keyboard.press('Enter');
    const row = queryPanel.locator('[data-testid="params-tree-row"]').first();
    const checkbox = row.locator('.el-checkbox').first();
    if (!((await checkbox.getAttribute('class')) || '').includes('is-checked')) {
      await checkbox.click();
    }
    await row.getByPlaceholder(/参数名称/).first().fill('valueKey');
    const valueEditor = row.locator('[data-testid="params-tree-value-input"]').first().locator('[contenteditable], textarea, input').first();
    await valueEditor.click();
    await contentPage.keyboard.type('originalVal');
    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('valueKey=originalVal');
    await valueEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('changedVal', { delay: 30 });
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('valueKey=changedVal');
    // 将焦点切出编辑器后撤销，验证值发生回退
    await queryPanel.locator('.title').first().click();
    await contentPage.keyboard.press('Control+z');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).not.toContain('valueKey=changedVal');
    await expect.poll(async () => {
      return (await statusUrl.textContent()) || '';
    }, { timeout: 5000 }).toContain('valueKey=');
  });
});
