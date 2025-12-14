import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('NoneParams', () => {
  // none类型表示没有请求体，适用于GET、DELETE等无body的请求方法
  test('None参数发送请求body为空', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('None参数测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('.el-tabs__item', { hasText: 'Body' });
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证默认为none类型
    const noneRadio = contentPage.locator('.body-params .el-radio', { hasText: /none/i });
    await expect(noneRadio).toBeVisible();
    // 点击发送按钮
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应区域有内容（请求成功发送）
    const responseArea = contentPage.locator('.response-area, .response-wrap, .response-content');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
  });
});
