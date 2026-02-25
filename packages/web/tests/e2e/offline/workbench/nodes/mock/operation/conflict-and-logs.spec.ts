import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('MockNodeConflictAndLogs-Offline', () => {
  test('HTTP Mock 在端口被占用时展示错误态', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 启动一个 WebSocket Mock 占用端口，为 HTTP Mock 制造端口冲突
    await createNode(contentPage, { nodeType: 'websocketMock', name: '离线-占用端口-WSMock' });
    const holderWsNode = bannerTree.locator('.el-tree-node__content', { hasText: '离线-占用端口-WSMock' }).first();
    await expect(holderWsNode).toBeVisible({ timeout: 5000 });
    await holderWsNode.click();
    const wsHolderConfig = contentPage.locator('.mock-config-content');
    await expect(wsHolderConfig).toBeVisible({ timeout: 5000 });
    const wsHolderPortInput = wsHolderConfig.locator('.condition-content .port-input input').first();
    await wsHolderPortInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19171');
    const wsHolderPathInput = wsHolderConfig.locator('.condition-content .path-input input').first();
    await wsHolderPathInput.fill('/ws-mock/holder');
    await wsHolderConfig.getByRole('button', { name: /保存配置/ }).click();
    const wsHolderEnableRow = wsHolderConfig.locator('.form-item').filter({ hasText: /启用Mock服务/ }).first();
    await expect(wsHolderEnableRow.locator('.el-switch').first()).toBeVisible({ timeout: 5000 });
    await wsHolderEnableRow.locator('.el-switch').first().click();
    await expect(holderWsNode.locator('.mock-status .status-dot.running')).toBeVisible({ timeout: 30000 });

    // 启动同端口的 HTTP Mock，验证错误提示与红点状态
    await createNode(contentPage, { nodeType: 'httpMock', name: '离线-HTTP端口冲突' });
    const conflictHttpNode = bannerTree.locator('.el-tree-node__content', { hasText: '离线-HTTP端口冲突' }).first();
    await expect(conflictHttpNode).toBeVisible({ timeout: 5000 });
    await conflictHttpNode.click();
    const httpConflictConfig = contentPage.locator('.mock-config-content');
    await expect(httpConflictConfig).toBeVisible({ timeout: 5000 });
    const httpConflictPortInput = httpConflictConfig.locator('.condition-content .port-input input').first();
    await httpConflictPortInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19171');
    const httpConflictUrlInput = httpConflictConfig.locator('.condition-content .url-input input').first();
    await httpConflictUrlInput.fill('/mock/http-conflict');
    await httpConflictConfig.getByRole('button', { name: /保存配置/ }).click();
    const httpEnableRow = httpConflictConfig.locator('.form-item').filter({ hasText: /启用Mock API/ }).first();
    await expect(httpEnableRow.locator('.el-switch').first()).toBeVisible({ timeout: 5000 });
    await httpEnableRow.locator('.el-switch').first().click();
    await expect(httpConflictConfig.locator('.mock-error').first()).toContainText(/端口|占用/, { timeout: 10000 });
    await expect(conflictHttpNode.locator('.mock-status .status-dot.error')).toBeVisible({ timeout: 10000 });
  });

  test('WebSocket Mock 路径冲突后可通过修改路径恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 先启动第一个 WebSocket Mock
    await createNode(contentPage, { nodeType: 'websocketMock', name: '离线-路径冲突-节点A' });
    const wsMockNodeA = bannerTree.locator('.el-tree-node__content', { hasText: '离线-路径冲突-节点A' }).first();
    await expect(wsMockNodeA).toBeVisible({ timeout: 5000 });
    await wsMockNodeA.click();
    const wsMockConfigA = contentPage.locator('.mock-config-content');
    await expect(wsMockConfigA).toBeVisible({ timeout: 5000 });
    const wsPortInputA = wsMockConfigA.locator('.condition-content .port-input input').first();
    await wsPortInputA.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19172');
    const wsPathInputA = wsMockConfigA.locator('.condition-content .path-input input').first();
    await wsPathInputA.fill('/ws-mock/path-conflict');
    await wsMockConfigA.getByRole('button', { name: /保存配置/ }).click();
    const wsEnableRowA = wsMockConfigA.locator('.form-item').filter({ hasText: /启用Mock服务/ }).first();
    await wsEnableRowA.locator('.el-switch').first().click();
    await expect(wsMockNodeA.locator('.mock-status .status-dot.running')).toBeVisible({ timeout: 30000 });

    // 启动第二个同端口同路径节点，验证路径冲突错误
    await createNode(contentPage, { nodeType: 'websocketMock', name: '离线-路径冲突-节点B' });
    const wsMockNodeB = bannerTree.locator('.el-tree-node__content', { hasText: '离线-路径冲突-节点B' }).first();
    await expect(wsMockNodeB).toBeVisible({ timeout: 5000 });
    await wsMockNodeB.click();
    const wsMockConfigB = contentPage.locator('.mock-config-content');
    await expect(wsMockConfigB).toBeVisible({ timeout: 5000 });
    const wsPortInputB = wsMockConfigB.locator('.condition-content .port-input input').first();
    await wsPortInputB.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19172');
    const wsPathInputB = wsMockConfigB.locator('.condition-content .path-input input').first();
    await wsPathInputB.fill('/ws-mock/path-conflict');
    await wsMockConfigB.getByRole('button', { name: /保存配置/ }).click();
    const wsEnableRowB = wsMockConfigB.locator('.form-item').filter({ hasText: /启用Mock服务/ }).first();
    await wsEnableRowB.locator('.el-switch').first().click();
    await expect(wsMockConfigB.locator('.mock-error').first()).toContainText(/路径|已被使用/, { timeout: 10000 });
    await expect(wsMockNodeB.locator('.mock-status .status-dot.error')).toBeVisible({ timeout: 10000 });

    // 修改路径后再次启用，验证可以恢复到运行中
    await wsPathInputB.fill('/ws-mock/path-conflict-2');
    await wsMockConfigB.getByRole('button', { name: /保存配置/ }).click();
    await wsEnableRowB.locator('.el-switch').first().click();
    await expect(wsMockNodeB.locator('.mock-status .status-dot.running')).toBeVisible({ timeout: 30000 });
  });

  test('WebSocket Mock 日志与 HTTP Mock 日志可随请求实时更新', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建并启动 WebSocket Mock，开启 Echo 方便验证收发日志
    await createNode(contentPage, { nodeType: 'websocketMock', name: '离线-WSMock日志联动' });
    const wsLogNode = bannerTree.locator('.el-tree-node__content', { hasText: '离线-WSMock日志联动' }).first();
    await expect(wsLogNode).toBeVisible({ timeout: 5000 });
    await wsLogNode.click();
    const wsLogConfig = contentPage.locator('.mock-config-content');
    await expect(wsLogConfig).toBeVisible({ timeout: 5000 });
    const wsLogPortInput = wsLogConfig.locator('.condition-content .port-input input').first();
    await wsLogPortInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19173');
    const wsLogPathInput = wsLogConfig.locator('.condition-content .path-input input').first();
    await wsLogPathInput.fill('/ws-mock/logs-batch');
    await wsLogConfig.getByRole('button', { name: /保存配置/ }).click();
    const wsEchoSwitch = wsLogConfig.locator('.echo-header .el-switch').first();
    await expect(wsEchoSwitch).toBeVisible({ timeout: 5000 });
    await wsEchoSwitch.click();
    const wsLogEnableRow = wsLogConfig.locator('.form-item').filter({ hasText: /启用Mock服务/ }).first();
    await wsLogEnableRow.locator('.el-switch').first().click();
    await expect(wsLogNode.locator('.mock-status .status-dot.running')).toBeVisible({ timeout: 30000 });
    const wsLogTab = contentPage.locator('.clean-tabs__item').filter({ hasText: /^日志$/ }).first();
    await wsLogTab.click();

    // 保持在日志页时触发 WebSocket 收发，确保 logsBatch 监听已挂载
    const wsClientResult = await contentPage.evaluate(async () => {
      return new Promise<{ received: string }>((resolve, reject) => {
        const ws = new WebSocket('ws://127.0.0.1:19173/ws-mock/logs-batch');
        const timeoutId = window.setTimeout(() => {
          ws.close();
          reject(new Error('WebSocket Mock 日志场景超时'));
        }, 10000);
        ws.onopen = () => {
          ws.send('batch-3-log-message');
        };
        ws.onerror = () => {
          window.clearTimeout(timeoutId);
          reject(new Error('WebSocket 客户端连接失败'));
        };
        ws.onmessage = (event) => {
          const receivedText = typeof event.data === 'string' ? event.data : '';
          ws.close(1000, 'done');
          window.clearTimeout(timeoutId);
          resolve({ received: receivedText });
        };
      });
    });
    expect(wsClientResult.received).toContain('batch-3-log-message');

    // 验证 logsBatch 已被渲染到 UI
    const wsLogItems = contentPage.locator('.log-item');
    await expect(wsLogItems.first()).toBeVisible({ timeout: 10000 });
    await expect(contentPage.locator('.log-list')).toContainText(/连接/, { timeout: 10000 });
    await expect(contentPage.locator('.log-list')).toContainText(/收到/, { timeout: 10000 });
    await expect(contentPage.locator('.log-list')).toContainText(/发送/, { timeout: 10000 });
    await expect(contentPage.locator('.log-list')).toContainText(/断开/, { timeout: 10000 });

    // 创建并启动 HTTP Mock，然后发起真实请求触发 HTTP 日志
    await createNode(contentPage, { nodeType: 'httpMock', name: '离线-HTTPMock日志联动' });
    const httpLogNode = bannerTree.locator('.el-tree-node__content', { hasText: '离线-HTTPMock日志联动' }).first();
    await expect(httpLogNode).toBeVisible({ timeout: 5000 });
    await httpLogNode.click();
    const httpLogConfig = contentPage.locator('.mock-config-content');
    await expect(httpLogConfig).toBeVisible({ timeout: 5000 });
    const httpLogPortInput = httpLogConfig.locator('.condition-content .port-input input').first();
    await httpLogPortInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19174');
    const httpLogUrlInput = httpLogConfig.locator('.condition-content .url-input input').first();
    await httpLogUrlInput.fill('/mock/http-logs-batch');
    await httpLogConfig.getByRole('button', { name: /保存配置/ }).click();
    const httpLogEnableRow = httpLogConfig.locator('.form-item').filter({ hasText: /启用Mock API/ }).first();
    await httpLogEnableRow.locator('.el-switch').first().click();
    await expect(httpLogNode.locator('.mock-status .status-dot.running')).toBeVisible({ timeout: 30000 });
    const httpResponse = await contentPage.request.get('http://127.0.0.1:19174/mock/http-logs-batch?source=batch-3');
    expect(httpResponse.status()).toBe(200);

    // 切到 HTTP Mock 日志页验证请求日志落地
    const httpLogTab = contentPage.locator('.clean-tabs__item').filter({ hasText: /^日志$/ }).first();
    await httpLogTab.click();
    const httpPlainLogLine = contentPage.locator('.plain-log-line').first();
    await expect(httpPlainLogLine).toBeVisible({ timeout: 10000 });
    await expect(httpPlainLogLine).toContainText('/mock/http-logs-batch');
  });
});
