import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestUrlRedo', () => {
  // 测试用例1: 请求url中输入字符串ab,按ctrl+z撤销到a,再按ctrl+shift+z重做,url值为ab
  test('请求url输入后撤销再按ctrl+shift+z重做,url值恢复', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'URL重做快捷键测试' });
    // 在url输入框中输入可请求URL，并在末尾追加字符
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?token=a`);
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.type('b');
    await contentPage.waitForTimeout(300);
    // 验证url值为...token=ab
    await expect(urlInput).toHaveText(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?token=ab`, { timeout: 5000 });
    // 按ctrl+z快捷键撤销
    await contentPage.keyboard.press('Control+z');
    await contentPage.waitForTimeout(300);
    // 验证撤销后url值回到...token=a
    await expect(urlInput).toHaveText(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?token=a`, { timeout: 5000 });
    // 按ctrl+shift+z快捷键重做
    await contentPage.keyboard.press('Control+y');
    await contentPage.waitForTimeout(300);
    // 验证重做后url值恢复为...token=ab，并可正常请求
    await expect(urlInput).toHaveText(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?token=ab`, { timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('token', { timeout: 10000 });
    await expect(responseBody).toContainText('ab', { timeout: 10000 });
  });
  // 测试用例2: 请求url中输入字符串ab,点击撤销按钮撤销到a,再点击重做按钮,url值为ab
  test('请求url输入后点击撤销按钮再点击重做按钮,url值恢复', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'URL重做按钮测试' });
    // 在url输入框中输入可请求URL，并在末尾追加字符
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill('');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?id=1`);
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.type('2');
    await contentPage.waitForTimeout(300);
    // 验证url值为...id=12
    await expect(urlInput).toHaveText(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?id=12`, { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证撤销后url值为...id=1
    await expect(urlInput).toHaveText(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?id=1`, { timeout: 5000 });
    // 点击重做按钮
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证重做后url值恢复为...id=12，并可正常请求
    await expect(urlInput).toHaveText(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?id=12`, { timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseBody = contentPage.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('id', { timeout: 10000 });
    await expect(responseBody).toContainText('12', { timeout: 10000 });
  });
});


