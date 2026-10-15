import { test as base, chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import type { Browser, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { startServer, isServerRunning, isMockServerOnPort, PORT } from '../mock-server/index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Tauri 测试 fixtures 类型定义
type DesktopFixtures = {
  remoteContentUrl: string;
  desktopApp: Browser;
  topBarPage: Page;
  contentPage: Page;
  clearCache: (options?: { skipExampleProject?: boolean }) => Promise<void>;
  createProject: (name?: string) => Promise<string>;
  createNode: (contentPage: Page, options: { nodeType: 'http' | 'httpMock' | 'websocket' | 'websocketMock' | 'folder', name?: string, pid?: string }) => Promise<string>;
  jumpToSettings: () => Promise<void>;
  reload: () => Promise<void>;
};

// 启动隔离的 Tauri 应用并连接 WebView2 调试端口
export const test = base.extend<DesktopFixtures>({
  remoteContentUrl: ['', { option: true }],
  desktopApp: async ({ remoteContentUrl }, use) => {
    if (process.platform !== 'win32') throw new Error('Tauri 界面测试使用 Windows WebView2 CDP；其他平台由原生测试和构建验证');
    const portServer = createServer();
    await new Promise<void>(resolve => portServer.listen(Number(process.env.APIFLOW_TEST_CDP_PORT || 0), '127.0.0.1', resolve));
    const address = portServer.address();
    if (!address || typeof address === 'string') throw new Error('无法分配调试端口');
    const port = address.port;
    await new Promise<void>((resolve, reject) => portServer.close(error => error ? reject(error) : resolve()));
    const testUserDataDir = await mkdtemp(path.join(tmpdir(), 'apiflow-e2e-'));
    if (remoteContentUrl) await writeFile(path.join(testUserDataDir, 'desktop.json'), JSON.stringify({ onlineUrl: remoteContentUrl }));
    const executable = path.resolve(__dirname, '../../src-tauri/target/debug/apiflow-desktop.exe');
    const child = spawn(executable, [], { windowsHide: true, env: {
      ...process.env, APIFLOW_TEST_DATA_DIR: testUserDataDir,
      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: '--remote-debugging-port=' + port + ' --disable-backgrounding-occluded-windows --disable-renderer-backgrounding --disable-background-timer-throttling',
    }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout?.on('data', bytes => { output += String(bytes); });
    child.stderr?.on('data', bytes => { output += String(bytes); });
    let app: Browser | undefined;
    try {
      const deadline = Date.now() + 20000;
      while (Date.now() < deadline) {
        if (child.exitCode !== null) throw new Error('Tauri 启动失败: ' + output);
        try { app = await chromium.connectOverCDP('http://127.0.0.1:' + port, { timeout: 1000 }); break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
      }
      if (!app) throw new Error('连接 Tauri 超时: ' + output);
      // 固定初始测试语言，保留测试中切换语言后的持久化结果
      if (!remoteContentUrl) {
        for (const context of app.contexts()) {
          await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://tauri.localhost' });
          await context.addInitScript(() => {
            if (!localStorage.getItem('runtime/language')) localStorage.setItem('runtime/language', 'zh-cn');
          });
          for (const page of context.pages().filter(page => page.url().includes('tauri.localhost') && !page.url().includes('mcp.html'))) {
            await page.evaluate(() => localStorage.setItem('runtime/language', 'zh-cn'));
            await page.reload();
          }
        }
      }
      const disconnect = app.close.bind(app);
      app.close = async options => {
        if (child.exitCode === null && !child.killed) {
          const exited = new Promise<void>(resolve => child.once('exit', () => resolve()));
          child.kill();
          await exited;
        }
        await disconnect(options);
      };
      await use(app);
    } finally {
      await app?.close().catch(() => undefined);
      if (child.exitCode === null && !child.killed) {
        const exited = new Promise<void>(resolve => child.once('exit', () => resolve()));
        child.kill();
        await exited;
      }
      const directory = path.resolve(testUserDataDir);
      if (path.dirname(directory) !== path.resolve(tmpdir()) || !path.basename(directory).startsWith('apiflow-e2e-')) throw new Error('拒绝清理非测试目录');
      await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
    }
  },
  topBarPage: async ({ desktopApp }, use) => {
    let page: Page | undefined;
    await expect.poll(() => {
      page = desktopApp.contexts().flatMap(context => context.pages()).find(item => item.url().includes('header.html'));
      return !!page;
    }, { timeout: 15000 }).toBe(true);
    if (!page) throw new Error('未找到顶部栏');
    await page.waitForLoadState('domcontentloaded');
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await use(page);
  },
  contentPage: async ({ desktopApp, remoteContentUrl }, use, testInfo) => {
    let page: Page | undefined;
    await expect.poll(() => {
      page = desktopApp.contexts().flatMap(context => context.pages()).find(item => item.url().includes('tauri.localhost') && !item.url().includes('header.html') && !item.url().includes('mcp.html'));
      return !!page;
    }, { timeout: remoteContentUrl ? 45000 : 15000 }).toBe(true);
    if (!page) throw new Error('未找到内容视图');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('domcontentloaded');
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setFocusEmulationEnabled', { enabled: true });
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.stack || error.message));
    page.on('console', message => { if (message.type() === 'error') pageErrors.push(message.text()); });
    if (!remoteContentUrl) {
      await page.waitForFunction(() => !!window.desktopAPI);
      const directory = await page.evaluate(async () => {
        const internals = (window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string) => Promise<{ testDataDirectory: string }> } }).__TAURI_INTERNALS__;
        return (await internals.invoke('desktop_info')).testDataDirectory;
      });
      expect(path.dirname(directory)).toBe(path.resolve(tmpdir()));
      expect(path.basename(directory)).toMatch(/^apiflow-e2e-/);
    }
    await use(page);
    if (testInfo.status !== testInfo.expectedStatus) await testInfo.attach('content-dom', { body: await page.content().catch(() => ''), contentType: 'text/html' });
    if (pageErrors.length) await testInfo.attach('webview-errors', { body: pageErrors.join('\n'), contentType: 'text/plain' });
  },
  // 重置应用（localStorage、sessionStorage、IndexedDB）并重置到首页
  clearCache: async ({ contentPage, topBarPage }, use) => {
    const clear = async (options?: { skipExampleProject?: boolean }) => {
      const skipExampleProject = options?.skipExampleProject ?? true;
      // 清库前关闭同源 MCP 执行页，避免后台连接阻塞 IndexedDB 删除和路由初始化
      const mcpSettings = await contentPage.evaluate(async () => {
        const manager = window.desktopAPI?.mcpManager;
        if (!manager) return null;
        const { enabled, port, readOnly, allowDestructive } = await manager.getStatus();
        await manager.updateSettings({ enabled: false, port, readOnly, allowDestructive });
        return { enabled, port, readOnly, allowDestructive };
      });
      try {
        // 两个视图共享 localStorage，先清理顶部栏再设置内容页的初始化标记
        await topBarPage.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        await contentPage.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
          localStorage.setItem('runtime/hasCreatedExampleProject', 'true');
        });
        // 清空 tabs 并跳转到首页
        await contentPage.evaluate(() => {
          (window as unknown as { desktopAPI?: { ipcManager?: { sendToMain: (channel: string, payload: { tabs: unknown[]; activeTabId: string; language: string; networkMode: string }) => void } } }).desktopAPI?.ipcManager?.sendToMain('apiflow:content:to:topbar:init-tabs', {
            tabs: [],
            activeTabId: '',
            language: 'zh-cn',
            networkMode: 'offline'
          });
        });
        await expect(topBarPage.locator('[data-test-id^="header-tab-item-"]')).toHaveCount(0);
        const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]');
        await homeBtn.click();
        await contentPage.waitForURL(/#\/home/);
        // 先 reload 页面以关闭所有数据库连接
        await contentPage.reload();
        await contentPage.waitForLoadState('domcontentloaded');
        await contentPage.waitForTimeout(500);
        // 通过版本变更通知其他视图释放缓存连接，等待全部数据库完成删除
        await contentPage.evaluate(async () => {
          await Promise.all((await indexedDB.databases()).filter(database => database.name).map(database => new Promise<void>((resolve, reject) => {
            const request = indexedDB.deleteDatabase(database.name!);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })));
        });
        await contentPage.evaluate(skip => {
          if (!skip) {
            localStorage.removeItem('runtime/hasCreatedExampleProject');
          }
        }, skipExampleProject);
        // 再次 reload 以应用缓存清除
        await contentPage.reload();
        await contentPage.waitForLoadState('domcontentloaded');
        await contentPage.waitForTimeout(500);
      } finally {
        if (mcpSettings) await contentPage.evaluate(settings => window.desktopAPI?.mcpManager.updateSettings(settings), mcpSettings);
      }
    };
    await use(clear);
  },
  // 创建项目
  createProject: async ({ topBarPage, contentPage }, use) => {
    const create = async (name?: string) => {
      const projectName = name || `测试项目-${Date.now()}`;
      const addProjectBtn = topBarPage.locator('[data-testid="header-add-project-btn"]');
      await addProjectBtn.click();
      await topBarPage.waitForTimeout(300);
      const projectDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建项目|新增项目|Create Project/ });
      await expect(projectDialog).toBeVisible({ timeout: 8000 });
      const projectNameInput = projectDialog.locator('input').first();
      await projectNameInput.fill(projectName);
      const confirmBtn = projectDialog.locator('.el-button--primary').last();
      await confirmBtn.click();
      await expect(projectDialog).toBeHidden({ timeout: 5000 });
      await topBarPage.waitForTimeout(500);
      return projectName;
    };
    await use(create);
  },
  // 创建节点
  createNode: async ({ contentPage }, use) => {
    const create = async (page: Page, options: { nodeType: 'http' | 'httpMock' | 'websocket' | 'websocketMock' | 'folder', name?: string, pid?: string }) => {
      const { nodeType, name, pid } = options;
      const nodeName = name || `测试节点-${Date.now()}`;
      await page.waitForLoadState('domcontentloaded');
      const bannerTree = page.getByTestId('banner-doc-tree');
      await expect(bannerTree).toBeVisible({ timeout: 10000 });
      if (pid) {
        const parentNode = page.locator(`[data-test-node-id="${pid}"]`);
        await expect(parentNode).toBeVisible({ timeout: 5000 });
        await parentNode.click({ button: 'right' });
        const contextMenu = page.locator('.s-contextmenu');
        await expect(contextMenu).toBeVisible({ timeout: 5000 });
        if (nodeType === 'folder') {
          const newFolderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建文件夹/ });
          await newFolderItem.click();
        } else {
          const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ }).first();
          const newInterfaceItemVisible = await newInterfaceItem.isVisible({ timeout: 500 }).catch(() => false);
          if (newInterfaceItemVisible) {
            await newInterfaceItem.click();
          } else {
            const newWebsocketItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建WebSocket/ }).first();
            const newWebsocketItemVisible = await newWebsocketItem.isVisible({ timeout: 500 }).catch(() => false);
            if (newWebsocketItemVisible) {
              await newWebsocketItem.click();
            } else {
              const newMockItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建Mock/ }).first();
              await newMockItem.click();
            }
          }
        }
      } else {
        if (nodeType === 'folder') {
          const addFolderBtn = page.getByTestId('banner-add-folder-btn');
          await expect(addFolderBtn).toBeVisible({ timeout: 10000 });
          await addFolderBtn.click();
        } else {
          const addFileBtn = page.getByTestId('banner-add-http-btn');
          await expect(addFileBtn).toBeVisible({ timeout: 10000 });
          await addFileBtn.click();
        }
      }
      const dialogPattern = nodeType === 'folder' ? /新建文件夹|新增文件夹/ : /新建接口|新增接口|Create/;
      const dialog = page.locator('.el-dialog').filter({ hasText: dialogPattern });
      await expect(dialog).toBeVisible({ timeout: 10000 });
      const nameInput = dialog.locator('input').first();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
      await nameInput.fill(nodeName);
      if (nodeType !== 'folder') {
        const radioText = nodeType === 'http' ? /^HTTP$/ : nodeType === 'websocket' ? /^WebSocket$/ : nodeType === 'httpMock' ? /HTTP Mock/ : /WebSocket Mock/;
        const typeRadio = dialog.locator('.el-radio').filter({ hasText: radioText }).first();
        const typeRadioVisible = await typeRadio.isVisible({ timeout: 500 }).catch(() => false);
        if (typeRadioVisible) {
          const isChecked = await typeRadio.evaluate((el) => el.classList.contains('is-checked')).catch(() => false);
          if (!isChecked) {
            await typeRadio.click({ force: true });
            await expect(typeRadio).toHaveClass(/is-checked/, { timeout: 5000 });
          }
        }
      }
      const confirmBtn = dialog.locator('.el-button--primary').last();
      await expect(confirmBtn).toBeVisible({ timeout: 5000 });
      await confirmBtn.click();
      await expect(dialog).toBeHidden({ timeout: 5000 });
      await page.waitForTimeout(500);
      const escapedNodeName = nodeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const createdNode = page.locator('.custom-tree-node').filter({ hasText: new RegExp(escapedNodeName) }).first();
      await expect(createdNode).toBeVisible({ timeout: 10000 });
      const nodeId = await createdNode.getAttribute('data-test-node-id');
      if (!nodeId) {
        throw new Error(`创建节点失败：无法获取 nodeId`);
      }
      return nodeId;
    };
    await use(create);
  },
  jumpToSettings: async ({ topBarPage, contentPage }, use) => {
    const jump = async () => {
      const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
      await expect(settingsBtn).toBeVisible({ timeout: 5000 });
      await settingsBtn.click();
      const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"][data-id^="settings-"]').first();
      // 设置tab由IPC驱动创建，可能存在竞态导致tab未出现，3秒后重试点击
      try {
        await expect(settingsTab).toBeVisible({ timeout: 3000 });
      } catch {
        await settingsBtn.click();
      }
      await expect(settingsTab).toBeVisible({ timeout: 10000 });
      await expect(settingsTab).toHaveClass(/active/, { timeout: 10000 });
      await contentPage.waitForURL(/.*?#?\/settings/, { timeout: 10000 });
      await expect.poll(async () => {
        return await contentPage.evaluate(() => localStorage.getItem('appWorkbench/header/activeTab') || '');
      }, { timeout: 10000 }).toMatch(/^settings-/);
    };
    await use(jump);
  },
  reload: async ({ topBarPage, contentPage }, use) => {
    const doReload = async () => {
      const refreshBtn = topBarPage.locator('[data-testid="header-refresh-btn"]');
      // 在点击刷新前开始监听 load 事件，确保能捕获 IPC 驱动的 reload 完成
      await Promise.all([
        contentPage.waitForEvent('load', { timeout: 15000 }),
        refreshBtn.click(),
      ]);
      await contentPage.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await contentPage.waitForTimeout(1500);
    };
    await use(doReload);
  },
});
test.beforeAll(async () => {
  if (!isServerRunning()) {
    const isMockRunning = await isMockServerOnPort(PORT);
    if (!isMockRunning) {
      await startServer();
    }
  }
});
test.beforeEach(async ({ topBarPage }) => {
  const networkToggle = topBarPage.locator('[data-testid="header-network-toggle"]');
  await expect(networkToggle).toBeVisible({ timeout: 5000 });
  const networkText = networkToggle.locator('.icon-text');
  const currentText = await networkText.innerText();
  if (!/离线模式|Offline/i.test(currentText)) {
    await networkToggle.click();
    await expect(networkText).toContainText(/离线模式|Offline/);
  }
});
export { expect };
