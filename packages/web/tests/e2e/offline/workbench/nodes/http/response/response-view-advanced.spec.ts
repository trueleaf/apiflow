import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('ResponseViewAdvanced-Offline', () => {
  test('重定向详情弹窗展示每跳请求与响应信息', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建HTTP节点并发起链式重定向请求
    await createNode(contentPage, { nodeType: 'http', name: '离线-重定向详情专项' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/redirect-chain/3`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 打开重定向详情弹窗并校验每跳结构
    const redirectControl = contentPage.locator('.redirect-control');
    await expect(redirectControl).toBeVisible({ timeout: 10000 });
    const redirectCountLink = redirectControl.locator('.text-underline').first();
    await redirectCountLink.click();
    const redirectDialog = contentPage.locator('.el-dialog.redirect-dialog').first();
    await expect(redirectDialog).toBeVisible({ timeout: 5000 });
    const redirectItems = redirectDialog.locator('.redirect-item');
    await expect.poll(async () => redirectItems.count(), { timeout: 5000 }).toBeGreaterThanOrEqual(3);
    await expect(redirectDialog).toContainText(/第1次重定向/);
    await expect(redirectDialog).toContainText(/请求方法/);
    await expect(redirectDialog).toContainText(/状态码/);
    await expect(redirectDialog).toContainText(/请求URL/);
    await expect(redirectDialog).toContainText(/请求头/);
    await expect(redirectDialog).toContainText(/返回头/);
    await expect(redirectDialog.locator('.header-row').first()).toBeVisible({ timeout: 5000 });
    await expect(redirectDialog).toContainText('/redirect-chain/');
  });

  test('文件响应分支支持预览与下载，未知流式响应展示传输进度', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建HTTP节点并验证PDF预览分支
    await createNode(contentPage, { nodeType: 'http', name: '离线-文件响应专项' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/file/pdf`);
    await sendBtn.click();
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    await expect(responseBody.locator('.pdf-view')).toBeVisible({ timeout: 10000 });
    await expect(responseBody.getByRole('button', { name: /下载文件/ }).first()).toBeVisible({ timeout: 5000 });
    // 切换到强制下载分支，校验下载按钮与类型文案
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/file/force-download`);
    await sendBtn.click();
    await expect(responseBody.locator('.download-icon')).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('application/force-download');
    await expect(responseBody.getByRole('button', { name: /下载文件/ }).first()).toBeVisible({ timeout: 5000 });
    // 发送未知类型分块流，校验传输进度与最终下载视图
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/file/unknown-stream`);
    await sendBtn.click();
    const processWrap = responseBody.locator('.process');
    await expect(processWrap).toBeVisible({ timeout: 10000 });
    await expect(processWrap).toContainText(/总大小/);
    await expect(processWrap).toContainText(/已传输/);
    await expect(processWrap).toContainText(/进度/);
    await expect(processWrap).toBeHidden({ timeout: 15000 });
    await expect(responseBody).toContainText('application/x-custom-binary');
    await expect(responseBody.getByRole('button', { name: /下载文件/ }).first()).toBeVisible({ timeout: 5000 });
  });
  test('文件响应剩余分支（image/video/audio/archive/exe/epub）支持对应展示与下载', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建HTTP节点并按顺序覆盖剩余文件类型分支
    await createNode(contentPage, { nodeType: 'http', name: '离线-文件类型补齐专项' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/file/image`);
    await sendBtn.click();
    await expect(responseBody.locator('.img-view')).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('image/png');
    await expect(responseBody.getByRole('button', { name: /下载文件/ }).first()).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/file/video`);
    await sendBtn.click();
    const videoPlayer = responseBody.locator('.video-view');
    const videoFallbackText = responseBody.locator('.text-center', { hasText: 'video/mp4' });
    await expect.poll(async () => {
      const playerCount = await videoPlayer.count();
      const textCount = await videoFallbackText.count();
      return playerCount + textCount;
    }, { timeout: 10000 }).toBeGreaterThan(0);
    await expect(responseBody.getByRole('button', { name: /下载文件/ }).first()).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/file/audio`);
    await sendBtn.click();
    await expect(responseBody.locator('.audio-view')).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('audio/mpeg');
    await expect(responseBody.getByRole('button', { name: /下载文件/ }).first()).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/file/archive`);
    await sendBtn.click();
    await expect(responseBody).toContainText('application/zip', { timeout: 10000 });
    await expect(responseBody.getByRole('button', { name: /下载文件/ }).first()).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/file/exe`);
    await sendBtn.click();
    await expect(responseBody).toContainText('application/x-msdownload', { timeout: 10000 });
    await expect(responseBody.getByRole('button', { name: /下载文件/ }).first()).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/file/epub`);
    await sendBtn.click();
    await expect(responseBody).toContainText('application/epub+zip', { timeout: 10000 });
    await expect(responseBody.getByRole('button', { name: /下载文件/ }).first()).toBeVisible({ timeout: 5000 });
  });
  test('SSE流式响应支持增量渲染与完成态，取消后保留已接收内容且不报错', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建HTTP节点并验证SSE增量渲染与完成态
    await createNode(contentPage, { nodeType: 'http', name: '离线-SSE增量专项' });
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/sse/chunked`);
    await sendBtn.click();
    const sseMessages = responseBody.locator('.sse-message');
    await expect.poll(async () => sseMessages.count(), { timeout: 10000 }).toBeGreaterThanOrEqual(2);
    await expect.poll(async () => sseMessages.count(), { timeout: 15000 }).toBeGreaterThanOrEqual(5);
    await expect(responseBody.locator('.sse-view .filter-container')).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText('omega');
    // 创建第二个节点并验证中断场景下界面状态
    await createNode(contentPage, { nodeType: 'http', name: '离线-SSE中断专项' });
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/sse/abort`);
    await sendBtn.click();
    const cancelBtn = contentPage.locator('[data-testid="operation-cancel-btn"]');
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    const sseMessagesAfterAbort = responseBody.locator('.sse-message');
    await expect.poll(async () => sseMessagesAfterAbort.count(), { timeout: 10000 }).toBeGreaterThanOrEqual(2);
    await cancelBtn.click();
    await expect(sendBtn).toBeVisible({ timeout: 10000 });
    const partialMessageCount = await sseMessagesAfterAbort.count();
    expect(partialMessageCount).toBeGreaterThan(0);
    expect(partialMessageCount).toBeLessThan(30);
    await expect(responseBody.locator('[data-testid="response-error"]')).toHaveCount(0);
  });

  test('超大响应缓存失效提示在刷新后仍可识别，并可通过重新请求恢复', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建目标节点并预置 cachedBodyIsTooLarge 缓存记录
    const targetNodeName = '离线-超大响应缓存失效';
    const nodeId = await createNode(contentPage, { nodeType: 'http', name: targetNodeName });
    await contentPage.evaluate(async ({ currentNodeId }) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('httpNodeResponseCache', 1);
        request.onerror = () => {
          reject(request.error ?? new Error('open-db-failed'));
        };
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('responseMetadata')) {
            db.createObjectStore('responseMetadata');
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction('responseMetadata', 'readwrite');
          const store = transaction.objectStore('responseMetadata');
          store.put({
            id: '',
            apiId: currentNodeId,
            requestId: '',
            headers: {},
            contentLength: 0,
            finalRequestUrl: '',
            redirectList: [],
            ip: '',
            isFromCache: false,
            statusCode: 200,
            timings: {
              start: 0,
              socket: 0,
              lookup: 0,
              connect: 0,
              secureConnect: 0,
              upload: 0,
              response: 0,
              end: 0,
              error: 0,
              abort: 0,
              phases: {
                wait: 0,
                dns: 0,
                tcp: 0,
                tls: 0,
                request: 0,
                firstByte: 0,
                download: 0,
                total: 0,
              },
            },
            contentType: 'application/json',
            retryCount: 0,
            body: [],
            bodyByteLength: 1024 * 1024 * 256,
            rt: 0,
            requestData: {
              url: '',
              method: 'get',
              body: '',
              headers: {},
              host: '',
            },
            responseData: {
              canApiflowParseType: 'cachedBodyIsTooLarge',
              jsonData: '',
              textData: '',
              errorData: '',
              streamData: [],
              fileData: {
                url: '',
                name: '',
                ext: '',
              },
            },
          }, currentNodeId);
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onerror = () => {
            reject(transaction.error ?? new Error('write-db-failed'));
          };
        };
      });
    }, { currentNodeId: nodeId });
    // 切换节点后回到目标节点，触发从缓存加载并显示失效提示
    const switchNodeName = '离线-缓存切换节点';
    await createNode(contentPage, { nodeType: 'http', name: switchNodeName });
    const targetNode = contentPage.locator('.el-tree-node__content', { hasText: targetNodeName }).first();
    await expect(targetNode).toBeVisible({ timeout: 5000 });
    await targetNode.click();
    const responseBody = contentPage.locator('[data-testid="response-tab-body"]');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    await expect(responseBody).toContainText(/响应缓存已失效/);
    // 刷新页面后再次进入目标节点，失效提示仍可识别
    await reload();
    const targetNodeAfterReload = contentPage.locator('.el-tree-node__content', { hasText: targetNodeName }).first();
    await expect(targetNodeAfterReload).toBeVisible({ timeout: 10000 });
    await targetNodeAfterReload.click();
    await expect(responseBody).toContainText(/响应缓存已失效/);
    // 重新发送请求后应恢复为最新响应并移除失效提示
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?cache=refresh`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await expect(responseBody).toContainText('cache=refresh', { timeout: 10000 });
    await expect(responseBody).not.toContainText('响应缓存已失效');
  });
});
