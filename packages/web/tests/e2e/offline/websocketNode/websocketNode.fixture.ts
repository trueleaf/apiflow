import { test, expect, getPages } from '../../../fixtures/fixtures';
import { type Page } from '@playwright/test';
// 创建测试项目
export const createTestProject = async (headerPage: Page, contentPage: Page, projectName: string) => {
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
export const createRootWebSocketNode = async (contentPage: Page, nodeName: string) => {
  await contentPage.waitForSelector('.tool-icon', { timeout: 10000 });
  const addNodeBtn = contentPage.locator('.tool-icon [title="新增文件"]').first();
  await addNodeBtn.click();
  await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { state: 'visible', timeout: 10000 });
  const wsRadio = contentPage.locator('.el-dialog:has-text("新建接口") .el-radio:has-text("WebSocket")').first();
  await wsRadio.click();
  const nodeInput = contentPage.locator('.el-dialog:has-text("新建接口") input[placeholder*="接口名称"], .el-dialog:has-text("新建接口") input[placeholder*="名称"]').first();
  await nodeInput.fill(nodeName);
  await contentPage.locator('.el-dialog:has-text("新建接口") button:has-text("确定")').click();
  await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { state: 'hidden', timeout: 10000 });
  await contentPage.waitForTimeout(500);
};
// Banner 树节点定位
export const getBannerNode = (contentPage: Page, nodeName: string) => contentPage.locator(`.custom-tree-node:has-text("${nodeName}")`).first();
// Banner 树节点点击
export const clickBannerNode = async (contentPage: Page, nodeName: string) => {
  const node = getBannerNode(contentPage, nodeName);
  await node.waitFor({ state: 'visible', timeout: 5000 });
  await node.click();
  await contentPage.waitForTimeout(1500);
};
// 从本地缓存中根据名称定位 WebSocket 节点对象
export const getCachedWsByName = async (page: Page, nodeName: string) => {
  const map = await page.evaluate(() => JSON.parse(localStorage.getItem('websocketNode/websocket') || '{}'));
  const entries = Object.entries(map as Record<string, any>);
  const found = entries.find(([, v]) => v?.info?.name === nodeName);
  return found ? { id: found[0] as string, node: found[1] as any } : null;
};
// 读取 websocketNode/config
export const getProjectConfig = async (page: Page) => {
  const cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('websocketNode/config') || '{}'));
  return cfg as Record<string, any>;
};
// 重新导出通用功能
export { test, expect, getPages };
