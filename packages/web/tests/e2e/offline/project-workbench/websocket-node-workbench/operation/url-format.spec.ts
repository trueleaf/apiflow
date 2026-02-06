import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('WebSocketUrlFormat', () => {
  // 输入URL后blur自动添加ws://前缀，验证格式化操作不进入撤销栈
  test('输入URL后blur自动添加ws://前缀，撤销不会回到格式化前', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL格式化测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 输入不带协议前缀的URL
    await urlEditor.click();
    await contentPage.keyboard.type('127.0.0.1:8080/test');
    await contentPage.waitForTimeout(200);
    await expect(urlEditor).toHaveText('127.0.0.1:8080/test', { timeout: 5000 });
    // blur触发格式化，自动添加ws://前缀
    await contentPage.locator('.ws-operation .status-wrap').click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/ws:\/\/127\.0\.0\.1:8080\/test/, { timeout: 5000 });
    // 撤销操作应该回到空值，而不是格式化前的值
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 输入URL后按Enter键触发格式化
  test('输入URL后按Enter键触发格式化，验证格式化不进入撤销栈', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL Enter格式化测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 输入不带协议前缀的URL
    await urlEditor.click();
    await contentPage.keyboard.type('localhost:3000/socket');
    await contentPage.waitForTimeout(200);
    // 按Enter键触发格式化
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/ws:\/\/localhost:3000\/socket/, { timeout: 5000 });
    // 撤销应该回到空值
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 输入带query参数的URL，格式化后query参数被提取并移除
  test('输入带query参数的URL，格式化后query参数被移除且不进入撤销栈', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL Query格式化测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 输入带query参数的URL
    await urlEditor.click();
    await contentPage.keyboard.type('ws://test.com/path?name=test&id=123');
    await contentPage.waitForTimeout(200);
    // blur触发格式化
    await contentPage.locator('.ws-operation .status-wrap').click();
    await contentPage.waitForTimeout(300);
    // 验证query参数被移除
    await expect(urlEditor).toHaveText('ws://test.com/path', { timeout: 5000 });
    // 撤销应该回到空值，不会有带query的中间状态
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/^\s*$/, { timeout: 5000 });
  });
  // 输入已有ws://前缀的URL，格式化不会重复添加前缀
  test('输入已有ws://前缀的URL，格式化不会重复添加前缀', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL重复前缀测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 输入已有ws://前缀的URL
    await urlEditor.click();
    await contentPage.keyboard.type('ws://example.com:9000/api');
    await contentPage.waitForTimeout(200);
    // blur触发格式化
    await contentPage.locator('.ws-operation .status-wrap').click();
    await contentPage.waitForTimeout(300);
    // 验证前缀没有重复
    await expect(urlEditor).toHaveText('ws://example.com:9000/api', { timeout: 5000 });
  });
  // 逐字符输入后格式化，验证撤销只能回到逐字符输入的状态
  test('逐字符输入后格式化，撤销回到逐字符输入前的状态', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'URL逐字符格式化测试' });
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first();
    await expect(createdNode).toBeVisible({ timeout: 5000 });
    await createdNode.click();
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 });
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    // 逐字符输入
    await urlEditor.click();
    await urlEditor.pressSequentially('a', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await urlEditor.pressSequentially('b', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await urlEditor.pressSequentially('c', { delay: 100 });
    await contentPage.waitForTimeout(200);
    await expect(urlEditor).toHaveText('abc', { timeout: 5000 });
    // blur触发格式化（添加ws://前缀）
    await contentPage.locator('.ws-operation .status-wrap').click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/ws:\/\/abc/, { timeout: 5000 });
    // 撤销三次应该回到空值（每个字符一次撤销），格式化不占用撤销栈
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('ab', { timeout: 5000 });
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText('a', { timeout: 5000 });
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    await expect(urlEditor).toHaveText(/^\s*$/, { timeout: 5000 });
  });
});
