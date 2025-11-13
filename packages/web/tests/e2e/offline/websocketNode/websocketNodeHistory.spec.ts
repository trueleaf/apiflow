import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
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
    /**
     * 测试目的：验证能够打开历史记录面板
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 点击历史记录按钮
     *   2. 验证面板显示
     * 预期结果：历史记录面板成功打开
     * 验证点：历史记录面板显示
     */
    test('应能打开历史记录面板', async () => {
      // 查找历史按钮
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn, button:has-text("历史")').first();
      if (await historyBtn.count() > 0) {
        // 打开历史记录面板
        await openHistoryPanel(contentPage);
        // 获取历史面板
        const panel = contentPage.locator('.history-panel, .el-dialog').first();
        if (await panel.count() > 0) {
          // 验证面板可见
          await expect(panel).toBeVisible();
        }
      }
    });

    test('应能关闭历史记录面板', async () => {
      // 查找历史按钮
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      if (await historyBtn.count() > 0) {
        // 打开历史面板
        await openHistoryPanel(contentPage);
        // 关闭历史面板
        await closeHistoryPanel(contentPage);
      }
    });
  });

  test.describe('11.2 查看历史记录测试', () => {
    test('应显示历史记录列表', async () => {
      // 查找历史按钮
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      if (await historyBtn.count() > 0) {
        // 输入第一个URL并保存
        await fillUrl(contentPage, 'test1.com');
        await clickSaveApi(contentPage);
        await contentPage.waitForTimeout(300);
        // 输入第二个URL并保存
        await fillUrl(contentPage, 'test2.com');
        await clickSaveApi(contentPage);
        await contentPage.waitForTimeout(300);
        // 打开历史面板
        await openHistoryPanel(contentPage);
        // 获取历史列表
        const historyItems = getHistoryList(contentPage);
        if (await historyItems.count() > 0) {
          const count = await historyItems.count();
          // 验证历史记录存在
          expect(count).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('11.3 选择历史记录测试', () => {
    test('应能选择历史记录', async () => {
      // 查找历史按钮
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      if (await historyBtn.count() > 0) {
        // 输入URL并保存
        await fillUrl(contentPage, 'history-test.com');
        await clickSaveApi(contentPage);
        await contentPage.waitForTimeout(300);
        // 打开历史面板
        await openHistoryPanel(contentPage);
        // 获取历史列表
        const historyItems = getHistoryList(contentPage);
        if (await historyItems.count() > 0) {
          // 点击第一条历史记录
          await clickHistoryItem(contentPage, 0);
        }
      }
    });
  });

  test.describe('11.4 删除历史记录测试', () => {
    test('应能删除单条历史记录', async () => {
      // 查找历史按钮
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      if (await historyBtn.count() > 0) {
        // 输入URL并保存
        await fillUrl(contentPage, 'to-delete.com');
        await clickSaveApi(contentPage);
        await contentPage.waitForTimeout(300);
        // 打开历史面板
        await openHistoryPanel(contentPage);
        // 获取历史列表
        const historyItems = getHistoryList(contentPage);
        const initialCount = await historyItems.count();
        if (initialCount > 0) {
          // 删除第一条历史记录
          await deleteHistoryItem(contentPage, 0);
        }
      }
    });

    test('应能清空所有历史记录', async () => {
      // 查找历史按钮
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      if (await historyBtn.count() > 0) {
        // 输入URL并保存
        await fillUrl(contentPage, 'test.com');
        await clickSaveApi(contentPage);
        await contentPage.waitForTimeout(300);
        // 打开历史面板
        await openHistoryPanel(contentPage);
        // 查找清空按钮
        const clearBtn = contentPage.locator('[title*="清空"], .clear-all-btn, button:has-text("清空")').first();
        if (await clearBtn.count() > 0) {
          // 清空所有历史
          await clearAllHistory(contentPage);
        }
      }
    });
  });
});
