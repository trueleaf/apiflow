import { test, expect } from '../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketNodeRequest', () => {
  test('连接并收发消息', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);

    const treeWrap = contentPage.locator('.tree-wrap');
    await expect(treeWrap).toBeVisible({ timeout: 5000 });
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);

    const newInterfaceItem = contentPage.locator('.s-contextmenu .s-contextmenu-item', { hasText: /新建接口/ });
    await expect(newInterfaceItem).toBeVisible({ timeout: 5000 });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);

    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('WebSocket收发测试接口');
    const wsRadio = addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first();
    await wsRadio.click();
    await contentPage.waitForTimeout(200);
    await addFileDialog.locator('.el-button--primary').last().click();
    await expect(addFileDialog).toBeHidden({ timeout: 5000 });

    const wsNode = contentPage.locator('.el-tree-node__content').filter({ hasText: 'WebSocket收发测试接口' });
    await expect(wsNode).toBeVisible({ timeout: 5000 });
    await wsNode.click();
    await contentPage.waitForTimeout(500);

    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await contentPage.waitForTimeout(300);

    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(connectBtn).toBeVisible({ timeout: 5000 });
    await connectBtn.click();

    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });

    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await expect(addBlockBtn).toBeVisible({ timeout: 5000 });
    await addBlockBtn.click();
    await contentPage.waitForTimeout(300);

    const messageBlock = contentPage.locator('.message-block').first();
    await expect(messageBlock).toBeVisible({ timeout: 5000 });
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('ping');
    await contentPage.waitForTimeout(200);

    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click();

    await expect(wsView).toContainText('pong', { timeout: 10000 });
  });
});


