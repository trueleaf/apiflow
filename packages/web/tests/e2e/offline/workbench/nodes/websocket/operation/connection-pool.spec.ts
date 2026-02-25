import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketConnectionPool-Offline', () => {
  test('连接池接口与页面连接状态保持一致', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建第一个 WebSocket 节点并建立连接
    const firstNodeId = await createNode(contentPage, { nodeType: 'websocket', name: '离线-连接池-节点1' });
    const firstNode = bannerTree.locator('.el-tree-node__content', { hasText: '离线-连接池-节点1' }).first();
    await expect(firstNode).toBeVisible({ timeout: 5000 });
    await firstNode.click();
    const firstUrlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(firstUrlEditor).toBeVisible({ timeout: 5000 });
    await firstUrlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await expect(contentPage.locator('.ws-operation .status-wrap .url')).toContainText(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`, { timeout: 10000 });
    const firstConnectButton = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(firstConnectButton).toBeVisible({ timeout: 5000 });
    await firstConnectButton.click();
    await expect(contentPage.getByRole('button', { name: /断开连接/ })).toBeVisible({ timeout: 10000 });

    // 断言连接池中已记录当前连接
    const firstConnections = await contentPage.evaluate(async () => {
      const api = (window as unknown as {
        electronAPI?: {
          websocket?: {
            getAllConnections: () => Promise<Array<{ connectionId: string; state: number }>>;
          };
        };
      }).electronAPI;
      if (!api?.websocket?.getAllConnections) {
        return [];
      }
      return api.websocket.getAllConnections();
    });
    expect(firstConnections.length).toBe(1);

    // 调用 disconnectByNode 后，页面需回到可连接状态
    const disconnectByNodeResult = await contentPage.evaluate(async (nodeId: string) => {
      const api = (window as unknown as {
        electronAPI?: {
          websocket?: {
            disconnectByNode: (id: string) => Promise<{ code: number; msg: string; data: null }>;
          };
        };
      }).electronAPI;
      if (!api?.websocket?.disconnectByNode) {
        return { code: 1, msg: 'disconnectByNode 不可用', data: null };
      }
      return api.websocket.disconnectByNode(nodeId);
    }, firstNodeId);
    expect(disconnectByNodeResult.code).toBe(0);
    await expect(contentPage.getByRole('button', { name: /发起连接|重新连接/ })).toBeVisible({ timeout: 10000 });

    // 重新连接第一个节点，并创建第二个节点建立连接
    await contentPage.getByRole('button', { name: /发起连接|重新连接/ }).click();
    await expect(contentPage.getByRole('button', { name: /断开连接/ })).toBeVisible({ timeout: 10000 });
    await createNode(contentPage, { nodeType: 'websocket', name: '离线-连接池-节点2' });
    const secondNode = bannerTree.locator('.el-tree-node__content', { hasText: '离线-连接池-节点2' }).first();
    await expect(secondNode).toBeVisible({ timeout: 5000 });
    await secondNode.click();
    const secondUrlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(secondUrlEditor).toBeVisible({ timeout: 5000 });
    await secondUrlEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`);
    await contentPage.keyboard.press('Enter');
    await expect(contentPage.locator('.ws-operation .status-wrap .url')).toContainText(`ws://127.0.0.1:${MOCK_SERVER_PORT}/ws`, { timeout: 10000 });
    const secondConnectButton = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(secondConnectButton).toBeVisible({ timeout: 5000 });
    await secondConnectButton.click();
    await expect(contentPage.getByRole('button', { name: /断开连接/ })).toBeVisible({ timeout: 10000 });

    // 清空所有连接后，所有节点都应回到未连接状态
    const clearAllResult = await contentPage.evaluate(async () => {
      const api = (window as unknown as {
        electronAPI?: {
          websocket?: {
            clearAllConnections: () => Promise<{ code: number; msg: string; data: { closedCount: number } }>;
          };
        };
      }).electronAPI;
      if (!api?.websocket?.clearAllConnections) {
        return { code: 1, msg: 'clearAllConnections 不可用', data: { closedCount: 0 } };
      }
      return api.websocket.clearAllConnections();
    });
    expect(clearAllResult.code).toBe(0);
    await expect(contentPage.getByRole('button', { name: /发起连接|重新连接/ })).toBeVisible({ timeout: 10000 });
    await firstNode.click();
    await expect(contentPage.getByRole('button', { name: /发起连接|重新连接/ })).toBeVisible({ timeout: 10000 });

    // 连接池清空后连接数量应为 0
    const finalConnections = await contentPage.evaluate(async () => {
      const api = (window as unknown as {
        electronAPI?: {
          websocket?: {
            getAllConnections: () => Promise<Array<{ connectionId: string; state: number }>>;
          };
        };
      }).electronAPI;
      if (!api?.websocket?.getAllConnections) {
        return [];
      }
      return api.websocket.getAllConnections();
    });
    expect(finalConnections.length).toBe(0);
  });
});
