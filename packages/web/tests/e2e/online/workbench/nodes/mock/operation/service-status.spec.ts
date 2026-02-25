import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('MockNodeServiceStatus-Online', () => {
  test('在线HTTP Mock 配置保存后可回填并可启停服务', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建HTTP Mock节点并保存配置
    await createNode(contentPage, { nodeType: 'httpMock', name: '在线-HTTPMock启停测试' });
    const mockNode = bannerTree.locator('.el-tree-node__content', { hasText: '在线-HTTPMock启停测试' }).first();
    await expect(mockNode).toBeVisible({ timeout: 5000 });
    await mockNode.click();
    const mockConfig = contentPage.locator('.mock-config-content');
    await expect(mockConfig).toBeVisible({ timeout: 5000 });
    const portInput = mockConfig.locator('.condition-content .port-input input').first();
    await portInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19141');
    const urlInput = mockConfig.locator('.condition-content .url-input input').first();
    await urlInput.fill('/mock/online-http-status');
    await mockConfig.getByRole('button', { name: /保存配置/ }).click();

    // 切换节点后再返回，验证配置回填
    await createNode(contentPage, { nodeType: 'folder', name: '在线-HTTPMock切换节点' });
    await mockNode.click();
    await expect(mockConfig.locator('.condition-content .port-input input').first()).toHaveValue('19141');
    await expect(mockConfig.locator('.condition-content .url-input input').first()).toHaveValue('/mock/online-http-status');

    // 右键启动与停止服务，验证状态点变化
    await mockNode.click({ button: 'right' });
    const startMockItem = contentPage.locator('.s-contextmenu .s-contextmenu-item').filter({ hasText: /启动mock/ }).first();
    await expect(startMockItem).toBeVisible({ timeout: 10000 });
    await startMockItem.click();
    const runningDot = mockNode.locator('.mock-status .status-dot.running');
    await expect(runningDot).toBeVisible({ timeout: 30000 });

    // 刷新与切换节点后，运行状态应保持
    await mockNode.click();
    await mockConfig.getByRole('button', { name: /^刷新$/ }).click();
    await expect(runningDot).toBeVisible({ timeout: 30000 });
    const switchNode = bannerTree.locator('.el-tree-node__content', { hasText: '在线-HTTPMock切换节点' }).first();
    await expect(switchNode).toBeVisible({ timeout: 5000 });
    await switchNode.click();
    await mockNode.click();
    await expect(runningDot).toBeVisible({ timeout: 30000 });

    await mockNode.click({ button: 'right' });
    const stopMockItem = contentPage.locator('.s-contextmenu .s-contextmenu-item').filter({ hasText: /停止mock/ }).first();
    await expect(stopMockItem).toBeVisible({ timeout: 10000 });
    await stopMockItem.click();
    await expect(runningDot).toBeHidden({ timeout: 30000 });
  });

  test('在线WebSocket Mock 配置保存后可回填并可启停服务', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建WebSocket Mock节点并保存配置
    await createNode(contentPage, { nodeType: 'websocketMock', name: '在线-WebSocketMock启停测试' });
    const wsMockNode = bannerTree.locator('.el-tree-node__content', { hasText: '在线-WebSocketMock启停测试' }).first();
    await expect(wsMockNode).toBeVisible({ timeout: 5000 });
    await wsMockNode.click();
    const wsMockConfig = contentPage.locator('.mock-config-content');
    await expect(wsMockConfig).toBeVisible({ timeout: 5000 });
    const wsPortInput = wsMockConfig.locator('.condition-content .port-input input').first();
    await wsPortInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19142');
    const wsPathInput = wsMockConfig.locator('.condition-content .path-input input').first();
    await wsPathInput.fill('/ws-mock/online-status');
    await wsMockConfig.getByRole('button', { name: /保存配置/ }).click();

    // 切换节点后再返回，验证配置回填
    await createNode(contentPage, { nodeType: 'folder', name: '在线-WebSocketMock切换节点' });
    await wsMockNode.click();
    await expect(wsMockConfig.locator('.condition-content .port-input input').first()).toHaveValue('19142');
    await expect(wsMockConfig.locator('.condition-content .path-input input').first()).toHaveValue('/ws-mock/online-status');

    // 右键启动与停止服务，验证状态点变化
    await wsMockNode.click({ button: 'right' });
    const startMockItem = contentPage.locator('.s-contextmenu .s-contextmenu-item').filter({ hasText: /启动mock/ }).first();
    await expect(startMockItem).toBeVisible({ timeout: 10000 });
    await startMockItem.click();
    const runningDot = wsMockNode.locator('.mock-status .status-dot.running');
    await expect(runningDot).toBeVisible({ timeout: 30000 });

    // 刷新与切换节点后，运行状态应保持
    await wsMockNode.click();
    await wsMockConfig.getByRole('button', { name: /^刷新$/ }).click();
    await expect(runningDot).toBeVisible({ timeout: 30000 });
    const switchNode = bannerTree.locator('.el-tree-node__content', { hasText: '在线-WebSocketMock切换节点' }).first();
    await expect(switchNode).toBeVisible({ timeout: 5000 });
    await switchNode.click();
    await wsMockNode.click();
    await expect(runningDot).toBeVisible({ timeout: 30000 });

    await wsMockNode.click({ button: 'right' });
    const stopMockItem = contentPage.locator('.s-contextmenu .s-contextmenu-item').filter({ hasText: /停止mock/ }).first();
    await expect(stopMockItem).toBeVisible({ timeout: 10000 });
    await stopMockItem.click();
    await expect(runningDot).toBeHidden({ timeout: 30000 });
  });
});
