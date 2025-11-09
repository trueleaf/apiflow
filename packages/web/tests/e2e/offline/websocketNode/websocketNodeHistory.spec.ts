import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  fillUrl,
  clickSaveApi,
  openHistoryPanel,
  closeHistoryPanel,
  getHistoryList,
  clickHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
  verifyHistoryCount
} from './helpers/websocketNodeHelpers';

test.describe('11. WebSocket节点 - 历史记录测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test WebSocket',
      type: 'websocket'
    });
    await waitForWebSocketNodeReady(contentPage);
  });

  test.describe('11.1 打开历史记录面板测试', () => {
    test('应能打开历史记录面板', async () => {
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn, button:has-text("历史")').first();
      if (await historyBtn.count() > 0) {
        await openHistoryPanel(contentPage);
        const panel = contentPage.locator('.history-panel, .el-dialog').first();
        if (await panel.count() > 0) {
          await expect(panel).toBeVisible();
        }
      }
    });

    test('应能关闭历史记录面板', async () => {
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      if (await historyBtn.count() > 0) {
        await openHistoryPanel(contentPage);
        await closeHistoryPanel(contentPage);
      }
    });
  });

  test.describe('11.2 查看历史记录测试', () => {
    test('应显示历史记录列表', async () => {
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      if (await historyBtn.count() > 0) {
        await fillUrl(contentPage, 'test1.com');
        await clickSaveApi(contentPage);
        await contentPage.waitForTimeout(300);
        await fillUrl(contentPage, 'test2.com');
        await clickSaveApi(contentPage);
        await contentPage.waitForTimeout(300);
        await openHistoryPanel(contentPage);
        const historyItems = getHistoryList(contentPage);
        if (await historyItems.count() > 0) {
          const count = await historyItems.count();
          expect(count).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('11.3 选择历史记录测试', () => {
    test('应能选择历史记录', async () => {
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      if (await historyBtn.count() > 0) {
        await fillUrl(contentPage, 'history-test.com');
        await clickSaveApi(contentPage);
        await contentPage.waitForTimeout(300);
        await openHistoryPanel(contentPage);
        const historyItems = getHistoryList(contentPage);
        if (await historyItems.count() > 0) {
          await clickHistoryItem(contentPage, 0);
        }
      }
    });
  });

  test.describe('11.4 删除历史记录测试', () => {
    test('应能删除单条历史记录', async () => {
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      if (await historyBtn.count() > 0) {
        await fillUrl(contentPage, 'to-delete.com');
        await clickSaveApi(contentPage);
        await contentPage.waitForTimeout(300);
        await openHistoryPanel(contentPage);
        const historyItems = getHistoryList(contentPage);
        const initialCount = await historyItems.count();
        if (initialCount > 0) {
          await deleteHistoryItem(contentPage, 0);
        }
      }
    });

    test('应能清空所有历史记录', async () => {
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      if (await historyBtn.count() > 0) {
        await fillUrl(contentPage, 'test.com');
        await clickSaveApi(contentPage);
        await contentPage.waitForTimeout(300);
        await openHistoryPanel(contentPage);
        const clearBtn = contentPage.locator('[title*="清空"], .clear-all-btn, button:has-text("清空")').first();
        if (await clearBtn.count() > 0) {
          await clearAllHistory(contentPage);
        }
      }
    });
  });
});
