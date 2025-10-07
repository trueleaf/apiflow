import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { test } from '../../../fixtures/enhanced-electron-fixtures';

type HeaderAndContentPages = {
  headerPage: Page;
  contentPage: Page;
};

const HEADER_URL_HINTS = ['header.html', '/header'];

const isHeaderUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }
  return HEADER_URL_HINTS.some((hint) => url.includes(hint));
};

const resolveHeaderAndContentPages = async (
  electronApp: ElectronApplication,
  timeout = 10000
): Promise<HeaderAndContentPages> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const windows = electronApp.windows();
    let headerPage: Page | undefined;
    let contentPage: Page | undefined;

    windows.forEach((page) => {
      const url = page.url();
      if (isHeaderUrl(url)) {
        headerPage = page;
        return;
      }
      if (url && url !== 'about:blank') {
        contentPage = page;
      }
    });

    if (headerPage && contentPage) {
      return { headerPage, contentPage };
    }

    try {
      await electronApp.waitForEvent('window', {
        timeout: 500,
        predicate: (page) => {
          const pageUrl = page.url();
          return isHeaderUrl(pageUrl) || (!!pageUrl && pageUrl !== 'about:blank');
        }
      });
    } catch {
      // 忽略短暂超时，继续轮询
    }
  }
  throw new Error('未能定位 header 与 content 页面');
};

const createUniqueName = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
};

test.describe.serial('离线模式WebSocket节点操作', () => {
  let headerPage: Page;
  let contentPage: Page;

  const ensureOfflineMode = async () => {
    await headerPage.evaluate(() => {
      localStorage.clear();
    });
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
      localStorage.setItem('history/lastVisitePage', '/home');
    });
    await contentPage.evaluate(() => {
      window.location.hash = '#/home';
    });
    await contentPage.waitForURL(/home/, { timeout: 5000 });
    await contentPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForTimeout(1000);
  };

  const createOfflineProject = async (projectName: string) => {
    await contentPage.locator('button:has-text("新建项目")').click();
    await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible' });

    const projectInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
    await projectInput.fill(projectName);

    await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
    await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' });

    await contentPage.waitForURL(/doc-edit/, { timeout: 10000 });
    await contentPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForTimeout(1000);
    await contentPage.waitForSelector('.banner', { state: 'visible' });
  };

  const createOfflineWebsocketNode = async (nodeName: string) => {
    await contentPage.locator('.tool .operation [title="新增文件"]').first().click();
    await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { state: 'visible' });

    await contentPage.locator('.el-dialog .el-radio:has-text("WebSocket")').click();

    const nameInput = contentPage.locator('.el-dialog input[placeholder="请输入接口名称"]').first();
    await nameInput.fill(nodeName);

    await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
    await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { state: 'hidden' });
    await contentPage.waitForSelector('.ws-operation', { state: 'visible' });
    await contentPage.waitForTimeout(500);
  };

  const goToTab = async (tabText: string) => {
    await contentPage.locator(`.el-tabs__item:has-text("${tabText}")`).click();
    await contentPage.waitForTimeout(200);
  };

  test.beforeEach(async ({ electronApp }) => {
    const pages = await resolveHeaderAndContentPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await Promise.all([
      headerPage.waitForLoadState('domcontentloaded'),
      contentPage.waitForLoadState('domcontentloaded')
    ]);

    await ensureOfflineMode();
  });

  test('新建WebSocket节点后默认展示正确', async () => {
    const projectName = createUniqueName('离线WS项目');
    const nodeName = createUniqueName('WS节点');

    await createOfflineProject(projectName);
    await createOfflineWebsocketNode(nodeName);

    await expect(contentPage).toHaveURL(/doc-edit/);
    await expect(contentPage.locator('.tab-list .item.active .item-text')).toContainText(nodeName);

    await expect(contentPage.locator('.protocol-select')).toContainText('WS');
    await expect(contentPage.locator('.connection-input input')).toHaveValue('');

    await expect(contentPage.locator('.action-buttons button:has-text("发起连接")')).toBeVisible();
    await expect(contentPage.locator('.status-wrap .url')).toContainText('ws://');

    await goToTab('连接配置');
    const autoReconnectSwitch = contentPage.locator('.ws-config button[role="switch"]').first();
    await expect(autoReconnectSwitch).toHaveAttribute('aria-checked', 'false');
  });

  test('WebSocket连接地址格式化并写入查询参数', async () => {
    const projectName = createUniqueName('离线WS项目');
    const nodeName = createUniqueName('WS节点');

    await createOfflineProject(projectName);
    await createOfflineWebsocketNode(nodeName);

    const connectionInput = contentPage.locator('.connection-input input');
    await connectionInput.fill('echo.example.com/live?token=abc123');
    await connectionInput.press('Enter');
    await contentPage.waitForTimeout(600);

    await expect(connectionInput).toHaveValue('ws://echo.example.com/live');
    await expect(contentPage.locator('.status-wrap .url')).toContainText('ws://echo.example.com/live');

    await goToTab('Params');

    const paramKeyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
    const paramValueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
    await expect(paramKeyInput).toHaveValue('token');
    await expect(paramValueInput).toHaveValue('abc123');

    await expect(contentPage.locator('.tab-list .item.active .has-change')).toBeVisible();
  });

  test('请求头与连接配置修改后保持状态', async () => {
    const projectName = createUniqueName('离线WS项目');
    const nodeName = createUniqueName('WS节点');

    await createOfflineProject(projectName);
    await createOfflineWebsocketNode(nodeName);

    await goToTab('请求头');
    const headerKeyInput = contentPage.locator('.ws-headers input[placeholder="输入参数名称自动换行"]').first();
    const headerValueInput = contentPage.locator('.ws-headers input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();

    await headerKeyInput.fill('Authorization');
    await headerValueInput.fill('Bearer offline');
    await contentPage.waitForTimeout(300);

    await goToTab('连接配置');
    const autoReconnectSwitch = contentPage.locator('.ws-config button[role="switch"]').first();
    const switchState = await autoReconnectSwitch.getAttribute('aria-checked');
    if (switchState !== 'true') {
      await autoReconnectSwitch.click();
    }
    await expect(autoReconnectSwitch).toHaveAttribute('aria-checked', 'true');

    await goToTab('消息内容');
    await contentPage.waitForTimeout(300);

    await goToTab('请求头');
    await expect(headerKeyInput).toHaveValue('Authorization');
    await expect(headerValueInput).toHaveValue('Bearer offline');

    await goToTab('连接配置');
    await expect(autoReconnectSwitch).toHaveAttribute('aria-checked', 'true');

    await expect(contentPage.locator('.tab-list .item.active .has-change')).toBeVisible();
  });
});
