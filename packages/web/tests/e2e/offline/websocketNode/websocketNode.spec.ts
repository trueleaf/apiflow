
import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { test, resolveHeaderAndContentPages } from '../../../fixtures/enhanced-electron-fixtures';

// 创建测试项目
const createTestProject = async (headerPage: Page, contentPage: Page, projectName: string) => {
  await contentPage.locator('button:has-text("新建项目")').click();
  await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible', timeout: 10000 });
  const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]').first();
  await nameInput.fill(projectName);
  await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
  await contentPage.waitForURL(/doc-edit/, { timeout: 15000 });
  await contentPage.waitForLoadState('domcontentloaded');
  await contentPage.waitForSelector('.banner', { timeout: 10000 });
};

// 新建根级 WebSocket 节点
const createRootWebSocketNode = async (contentPage: Page, nodeName: string) => {
  await contentPage.waitForSelector('.tool-icon', { timeout: 10000 });
  const addNodeBtn = contentPage.locator('.tool-icon [title="新增文件"]').first();
  await addNodeBtn.click();
  await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { state: 'visible', timeout: 10000 });
  // 选择 WebSocket 类型
  const wsRadio = contentPage.locator('.el-dialog:has-text("新建接口") .el-radio:has-text("WebSocket")').first();
  await wsRadio.click();
  // 填名称并确定
  const nodeInput = contentPage.locator('.el-dialog:has-text("新建接口") input[placeholder*="接口名称"], .el-dialog:has-text("新建接口") input[placeholder*="名称"]').first();
  await nodeInput.fill(nodeName);
  await contentPage.locator('.el-dialog:has-text("新建接口") button:has-text("确定")').click();
  await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { state: 'hidden', timeout: 10000 });
  await contentPage.waitForTimeout(500);
};

// Banner 树节点定位/点击
const getBannerNode = (contentPage: Page, nodeName: string) => contentPage.locator(`.custom-tree-node:has-text("${nodeName}")`).first();
const clickBannerNode = async (contentPage: Page, nodeName: string) => {
  const node = getBannerNode(contentPage, nodeName);
  await node.waitFor({ state: 'visible', timeout: 5000 });
  await node.click();
  await contentPage.waitForTimeout(1500);
};

// 从本地缓存中根据名称定位 WebSocket 节点对象
const getCachedWsByName = async (page: Page, nodeName: string) => {
  const map = await page.evaluate(() => JSON.parse(localStorage.getItem('websocketNode/websocket') || '{}'));
  const entries = Object.entries(map as Record<string, any>);
  const found = entries.find(([, v]) => v?.info?.name === nodeName);
  return found ? { id: found[0] as string, node: found[1] as any } : null;
};

// 读取 websocketNode/config
const getProjectConfig = async (page: Page) => {
  const cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('websocketNode/config') || '{}'));
  return cfg as Record<string, any>;
};

// ==================== WebSocket Node 配置与持久化测试 ====================

test.describe('WebSocket Node - 配置与持久化', () => {
  let headerPage: Page; let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await resolveHeaderAndContentPages(electronApp);
    headerPage = result.headerPage; contentPage = result.contentPage;
    await Promise.all([
      headerPage.waitForLoadState('domcontentloaded'),
      contentPage.waitForLoadState('domcontentloaded')
    ]);
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
      localStorage.setItem('history/lastVisitePage', '/home');
    });
    await contentPage.evaluate(() => { (window as any).location.hash = '#/home'; });
    await contentPage.waitForURL(/home/, { timeout: 10000 });
    await contentPage.waitForLoadState('domcontentloaded');
    const testProject = `WSNode-${Date.now()}`;
    await createTestProject(headerPage, contentPage, testProject);
    await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
    await contentPage.waitForSelector('.banner', { timeout: 10000 });
  });

  test('应能创建 WebSocket 节点并打开编辑页', async () => {
    const nodeName = `WS-${Date.now()}`;
    await createRootWebSocketNode(contentPage, nodeName);
    const node = getBannerNode(contentPage, nodeName);
    await expect(node).toBeVisible();
    await clickBannerNode(contentPage, nodeName);
    // 验证存在"连接配置"标签
    await expect(contentPage.locator('.el-tabs__item:has-text("连接配置")').first()).toBeVisible();
  });

  test('应能切换消息类型并持久化到缓存', async () => {
    const nodeName = `WS-${Date.now()}`;
    await createRootWebSocketNode(contentPage, nodeName);
    await clickBannerNode(contentPage, nodeName);

    // 等待页面加载
    await contentPage.waitForTimeout(1000);

    // 打开右上角消息类型选择器并选择 JSON
    const typeSelector = contentPage.locator('.message-type-selector .type-selector .el-select').first();
    await typeSelector.waitFor({ state: 'visible', timeout: 10000 });
    await typeSelector.click();
    await contentPage.locator('.el-select-dropdown .el-select-dropdown__item:has-text("JSON")').first().click();
    await contentPage.waitForTimeout(300);

    const cached = await getCachedWsByName(contentPage, nodeName);
    expect(cached).not.toBeNull();
    expect(cached!.node?.config?.messageType).toBe('json');
  });

  test('应能设置自动发送配置与快捷操作并持久化', async () => {
    const nodeName = `WS-${Date.now()}`;
    await createRootWebSocketNode(contentPage, nodeName);
    await clickBannerNode(contentPage, nodeName);

    // 打开设置 Popover
    await contentPage.locator('.content-actions .config-button').click();
    // 修改发送间隔
    const intervalInput = contentPage.locator('.config-popover .el-input-number input');
    await intervalInput.click();
    await intervalInput.fill('1234');
    // 填默认消息
    const defaultMsg = contentPage.locator('.config-popover textarea');
    await defaultMsg.fill('ping');
    // 勾选/取消快捷操作（确保模板选择开启）
    const templateCheckbox = contentPage.locator('.config-popover .quick-operations .el-checkbox:has-text("模板选择")');
    await templateCheckbox.click(); // 切换一次确保写入
    await templateCheckbox.click(); // 再切换回开启
    // 关闭浮层
    await contentPage.locator('.config-popover .config-actions button:has-text("关闭")').click();

    // 勾选自动发送
    const autoSend = contentPage.locator('.content-actions .config-controls .el-checkbox:has-text("自动发送")');
    await autoSend.click();
    await contentPage.waitForTimeout(400);

    const cached = await getCachedWsByName(contentPage, nodeName);
    expect(cached).not.toBeNull();
    expect(cached!.node?.config?.autoSend).toBe(true);
    expect(cached!.node?.config?.autoSendInterval).toBe(1234);
    expect(cached!.node?.config?.defaultAutoSendContent).toBe('ping');

    // 校验项目级 quickOperations
    const cfg = await getProjectConfig(contentPage);
    // 从 URL 解析 projectId
    const hash = await contentPage.evaluate(() => window.location.hash);
    const idMatch = /id=([^&]+)/.exec(hash);
    const projectId = idMatch ? idMatch[1] : Object.keys(cfg)[0];
    expect(cfg[projectId]?.quickOperations).toBeTruthy();
    expect(cfg[projectId].quickOperations).toContain('template');
  });

  test('应能开启自动重连并持久化', async () => {
    const nodeName = `WS-${Date.now()}`;
    await createRootWebSocketNode(contentPage, nodeName);
    await clickBannerNode(contentPage, nodeName);

    // 切换到“连接配置”页
    await contentPage.locator('.el-tabs__item:has-text("连接配置")').click();
    // 切换开关
    const switchEl = contentPage.locator('.ws-config .el-switch');
    await switchEl.click();
    await contentPage.waitForTimeout(300);

    const cached = await getCachedWsByName(contentPage, nodeName);
    expect(cached).not.toBeNull();
    expect(cached!.node?.config?.autoReconnect).toBe(true);
  });
});
