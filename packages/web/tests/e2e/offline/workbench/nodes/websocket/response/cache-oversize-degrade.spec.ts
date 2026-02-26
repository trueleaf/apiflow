import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('WebSocketResponseCacheOversize-Offline', () => {
  test('单条消息超限时仅展示在当前会话且不写入缓存', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const wsNodeName = `WebSocket-超限缓存降级-${Date.now()}`;
    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: wsNodeName });

    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first();
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.fill(`127.0.0.1:${String(MOCK_SERVER_PORT)}/ws`);
    await contentPage.keyboard.press('Enter');

    // 仅对带标记的发送消息与 receive 消息强制触发超限分支，避免依赖超大真实载荷
    await contentPage.evaluate(() => {
      const runtime = window as Window & {
        __afBlobPatchedForWsCache?: boolean;
        __afOriginBlob?: typeof Blob;
      };
      if (runtime.__afBlobPatchedForWsCache) {
        return;
      }
      runtime.__afOriginBlob = Blob;
      class BlobWithOversizeForWsCache extends runtime.__afOriginBlob {
        private __forceOversize = false;
        constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
          super(blobParts, options);
          const serializedText = (blobParts ?? []).map(part => typeof part === 'string' ? part : '').join('');
          this.__forceOversize = serializedText.includes('AF_WS_OVERSIZE_CASE') || serializedText.includes('"type":"receive"');
        }
        get size(): number {
          if (this.__forceOversize) {
            return 1024 * 1024 * 51;
          }
          return super.size;
        }
      }
      window.Blob = BlobWithOversizeForWsCache;
      runtime.__afBlobPatchedForWsCache = true;
    });

    const connectBtn = contentPage.getByRole('button', { name: /发起连接|重新连接/ });
    await expect(connectBtn).toBeVisible({ timeout: 5000 });
    await connectBtn.click();

    const wsView = contentPage.locator('.websocket-view');
    await expect(wsView).toContainText('已连接到：', { timeout: 10000 });

    // 记录发送前缓存条数，后续用于断言超限消息未入库
    const cacheCountBeforeSend = await contentPage.evaluate(async (currentNodeId) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('websocketNodeResponseCache');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const transaction = db.transaction('responses', 'readonly');
      const store = transaction.objectStore('responses');
      const index = store.index('nodeId');
      const records = await new Promise<unknown[]>((resolve, reject) => {
        const request = index.getAll(currentNodeId);
        request.onsuccess = () => resolve(request.result as unknown[]);
        request.onerror = () => reject(request.error);
      });
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      db.close();
      return records.length;
    }, nodeId);

    const addBlockBtn = contentPage.locator('.message-content .add-block-button').first();
    await expect(addBlockBtn).toBeVisible({ timeout: 5000 });
    await addBlockBtn.click();

    const messageBlock = contentPage.locator('.message-block').first();
    await expect(messageBlock).toBeVisible({ timeout: 5000 });
    const messageEditor = messageBlock.locator('.s-json-editor').first();
    await messageEditor.click();
    await contentPage.keyboard.press('Control+a');

    const oversizeMarkerMessage = `AF_WS_OVERSIZE_CASE_${Date.now()}`;
    await contentPage.keyboard.type(oversizeMarkerMessage);

    const sendBtn = messageBlock.getByRole('button', { name: /^发送$/ });
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click();

    await expect(wsView).toContainText(oversizeMarkerMessage, { timeout: 10000 });

    const cacheCountAfterSend = await contentPage.evaluate(async (currentNodeId) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('websocketNodeResponseCache');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const transaction = db.transaction('responses', 'readonly');
      const store = transaction.objectStore('responses');
      const index = store.index('nodeId');
      const records = await new Promise<unknown[]>((resolve, reject) => {
        const request = index.getAll(currentNodeId);
        request.onsuccess = () => resolve(request.result as unknown[]);
        request.onerror = () => reject(request.error);
      });
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      db.close();
      return records.length;
    }, nodeId);

    expect(cacheCountAfterSend).toBe(cacheCountBeforeSend);

    // 刷新后仅从缓存恢复历史，超限消息不应回显
    await reload();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const wsNode = bannerTree.locator('.el-tree-node__content', { hasText: wsNodeName }).first();
    await expect(wsNode).toBeVisible({ timeout: 5000 });
    await wsNode.click();

    const messageItemsAfterReload = contentPage.locator('.websocket-message .message-content').filter({ hasText: oversizeMarkerMessage });
    await expect(messageItemsAfterReload).toHaveCount(0, { timeout: 10000 });
  });
});
