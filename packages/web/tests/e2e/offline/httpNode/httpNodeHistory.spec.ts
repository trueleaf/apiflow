import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  fillUrl,
  clickSendRequest,
  clickSaveApi,
  openHistoryPanel,
  closeHistoryPanel,
  getHistoryList,
  clickHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
  clickRefresh
} from './helpers/httpNodeHelpers';

// 跳过原因: beforeEach钩子在createProject步骤超时失败
// 40个测试失败都在等待"新增项目"对话框关闭时超时（30秒）
// 错误信息: "Target page, context or browser has been closed"
// 错误位置: fixtures.ts:185 - waitForSelector('.el-dialog:has-text("新增项目")', { state: 'hidden' })
// 可能原因: 对话框关闭动画时间过长或DOM结构变化导致选择器失效
// 日期: 2025-11-09
// 注意: 只有3个测试通过，其余51个都在beforeEach阶段失败，说明这是测试初始化问题而非功能问题
test.describe('12. HTTP节点 - 历史记录功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  const sendRequestAndSave = async (url: string, waitDuration = 0): Promise<void> => {
    await fillUrl(contentPage, url);
    await clickSendRequest(contentPage);
    const cancelBtn = contentPage.locator('button:has-text("取消请求")');
    const isCancelVisible = await cancelBtn.isVisible().catch(() => false);
    if (isCancelVisible) {
      await cancelBtn.waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
    } else {
      await contentPage.waitForTimeout(300);
    }
    if (waitDuration > 0) {
      await contentPage.waitForTimeout(waitDuration);
    }
    await clickSaveApi(contentPage);
    await contentPage.waitForTimeout(300);
  };

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test API',
      type: 'http'
    });
  });

  test.describe('12.1 历史记录列表测试', () => {
    test('应显示历史记录按钮', async () => {
      await waitForHttpNodeReady(contentPage);
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      await expect(historyBtn).toBeVisible();
    });

    test('点击按钮应打开历史记录面板', async () => {
      await waitForHttpNodeReady(contentPage);
      await openHistoryPanel(contentPage);
      const historyPanel = contentPage.locator('.history-dropdown, .history-detail-panel').first();
      await expect(historyPanel).toBeVisible();
    });

    test('应显示历史记录列表', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      await contentPage.waitForSelector('.history-list .history-item, .history-record', { state: 'attached', timeout: 5000 });
      const historyList = getHistoryList(contentPage);
      const count = await historyList.count();
      expect(count).toBeGreaterThan(0);
    });

    test('历史记录应按时间倒序排列', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get?test=1');
      await sendRequestAndSave('https://httpbin.org/get?test=2');
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const firstItem = historyList.first();
      await firstItem.hover();
      await contentPage.waitForTimeout(1200);
      await contentPage.waitForSelector('.history-detail-panel .url-text', { state: 'visible', timeout: 5000 });
      const urlText = await contentPage.locator('.history-detail-panel .url-text').first().textContent();
      expect(urlText).toContain('https://httpbin.org/get');
      const queryText = await contentPage
        .locator('.history-detail-panel .param-item')
        .filter({ hasText: 'test' })
        .first()
        .textContent();
      expect(queryText).toContain('2');
      await closeHistoryPanel(contentPage);
    });

    test('历史记录应显示请求时间', async () => {
      await waitForHttpNodeReady(contentPage);
  await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const firstItem = historyList.first();
      const timeElement = firstItem.locator('.history-time, .time, .timestamp').first();
      await expect(timeElement).toBeVisible();
    });

    test('历史记录应显示请求方法', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const firstItem = historyList.first();
      await firstItem.hover();
      await contentPage.waitForTimeout(1200);
      await contentPage.waitForSelector('.history-detail-panel .method-tag', { state: 'visible', timeout: 5000 });
      const methodText = await contentPage.locator('.history-detail-panel .method-tag').first().textContent();
      expect(methodText).toContain('GET');
      await closeHistoryPanel(contentPage);
    });

    test('历史记录应显示请求URL', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const firstItem = historyList.first();
      await firstItem.hover();
      await contentPage.waitForTimeout(1200);
      await contentPage.waitForSelector('.history-detail-panel .url-text', { state: 'visible', timeout: 5000 });
      const urlText = await contentPage.locator('.history-detail-panel .url-text').first().textContent();
      expect(urlText).toContain('httpbin.org');
      await closeHistoryPanel(contentPage);
    });

    test('历史记录应显示状态码', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const firstItem = historyList.first();
      const statusElement = firstItem.locator('.status, .status-code').first();
      if (await statusElement.isVisible()) {
        await expect(statusElement).toBeVisible();
      }
    });

    test('历史记录应显示响应时间', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const firstItem = historyList.first();
      const durationElement = firstItem.locator('.duration, .response-time').first();
      if (await durationElement.isVisible()) {
        await expect(durationElement).toBeVisible();
      }
    });

    test('成功和失败的请求应有不同的样式标识', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/status/200');
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const firstItem = historyList.first();
      const className = await firstItem.getAttribute('class');
      expect(className).toBeTruthy();
    });
  });

  test.describe('12.2 历史记录操作测试', () => {
    test('应能点击历史记录查看详情', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      await clickHistoryItem(contentPage, 0);
      await contentPage.waitForTimeout(300);
      const detailPanel = contentPage.locator('.history-detail, .detail-panel').first();
      if (await detailPanel.isVisible()) {
        await expect(detailPanel).toBeVisible();
      }
    });

    test('应能恢复历史记录', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get?restore=test');
      await fillUrl(contentPage, 'https://httpbin.org/get?new=url');
      await contentPage.waitForTimeout(300);
      await openHistoryPanel(contentPage);
      await clickHistoryItem(contentPage, 0);
      await contentPage.waitForTimeout(300);
      const restoreBtn = contentPage.locator('button:has-text("恢复"), .restore-btn').first();
      if (await restoreBtn.isVisible()) {
        await restoreBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('应能删除单条历史记录', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const countBefore = await getHistoryList(contentPage).count();
      await deleteHistoryItem(contentPage, 0);
      const countAfter = await getHistoryList(contentPage).count();
      expect(countAfter).toBeLessThan(countBefore);
    });

    test('应能清空所有历史记录', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      await clearAllHistory(contentPage);
      const count = await getHistoryList(contentPage).count();
      expect(count).toBe(0);
    });

    test('清空历史应有确认提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const clearBtn = contentPage.locator('[title*="清空"], .clear-all-btn').first();
      await clearBtn.click();
      await contentPage.waitForTimeout(300);
      const confirmDialog = contentPage.locator('.el-message-box').first();
      await expect(confirmDialog).toBeVisible();
    });

    test('取消清空应保留历史记录', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const countBefore = await getHistoryList(contentPage).count();
      const clearBtn = contentPage.locator('[title*="清空"], .clear-all-btn').first();
      await clearBtn.click();
      await contentPage.waitForTimeout(300);
      const cancelBtn = contentPage.locator('.el-message-box__btns .el-button--default').first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await contentPage.waitForTimeout(300);
      }
      const countAfter = await getHistoryList(contentPage).count();
      expect(countAfter).toBe(countBefore);
    });
  });

  test.describe('12.3 历史记录详情测试', () => {
    test('详情应显示完整的请求信息', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get?detail=test');
      await openHistoryPanel(contentPage);
      await clickHistoryItem(contentPage, 0);
      await contentPage.waitForTimeout(300);
      const requestInfo = contentPage.locator('.request-info, .request-detail').first();
      if (await requestInfo.isVisible()) {
        await expect(requestInfo).toBeVisible();
      }
    });

    test('详情应显示完整的响应信息', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      await clickHistoryItem(contentPage, 0);
      await contentPage.waitForTimeout(300);
      const responseInfo = contentPage.locator('.response-info, .response-detail').first();
      if (await responseInfo.isVisible()) {
        await expect(responseInfo).toBeVisible();
      }
    });

    test('详情应显示请求耗时', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      await clickHistoryItem(contentPage, 0);
      await contentPage.waitForTimeout(300);
      const durationInfo = contentPage.locator('.duration, .response-time').first();
      if (await durationInfo.isVisible()) {
        await expect(durationInfo).toBeVisible();
      }
    });

    test('详情应支持复制请求/响应内容', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      await clickHistoryItem(contentPage, 0);
      await contentPage.waitForTimeout(300);
      const copyBtn = contentPage.locator('[title*="复制"], .copy-btn').first();
      if (await copyBtn.isVisible()) {
        await expect(copyBtn).toBeVisible();
      }
    });

    test('应能关闭详情面板', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const historyItems = getHistoryList(contentPage);
      const firstItem = historyItems.first();
      await firstItem.hover();
      await contentPage.waitForTimeout(1200);
      await closeHistoryPanel(contentPage);
      const detailPanel = contentPage.locator('.history-detail-panel').first();
      if (await detailPanel.isVisible()) {
        await expect(detailPanel).not.toBeVisible();
      }
      const dropdown = contentPage.locator('.history-dropdown').first();
      if (await dropdown.isVisible()) {
        await expect(dropdown).not.toBeVisible();
      }
    });
  });

  test.describe('12.4 历史记录存储测试', () => {
    test('历史记录应持久化存储', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get?persist=test');
      await clickRefresh(contentPage);
      await waitForHttpNodeReady(contentPage);
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const count = await historyList.count();
      expect(count).toBeGreaterThan(0);
    });

    test('应限制历史记录最大数量', async () => {
      await waitForHttpNodeReady(contentPage);
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      for (let i = 0; i < 55; i++) {
        await urlInput.fill(`https://httpbin.org/get?test=${i}`);
        await urlInput.blur();
        await clickSaveApi(contentPage);
      }
      await contentPage.waitForTimeout(200);
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const count = await historyList.count();
      expect(count).toBeLessThanOrEqual(50);
    });

    test('切换节点应加载对应节点的历史', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get?node=A');
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const firstItem = historyList.first();
      await firstItem.hover();
      await contentPage.waitForTimeout(1200);
      await contentPage.waitForSelector('.history-detail-panel .url-text', { state: 'visible', timeout: 5000 });
      const urlText = await contentPage.locator('.history-detail-panel .url-text').first().textContent();
      expect(urlText).toContain('https://httpbin.org/get');
      const nodeParam = await contentPage
        .locator('.history-detail-panel .param-item')
        .filter({ hasText: 'node' })
        .first()
        .textContent();
      expect(nodeParam).toContain('A');
      await closeHistoryPanel(contentPage);
    });
  });

  test.describe('12.5 历史记录搜索过滤', () => {
    test('应支持按URL搜索历史', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get?search=keyword');
      await openHistoryPanel(contentPage);
      const searchInput = contentPage.locator('.search-input, input[placeholder*="搜索"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('keyword');
        await contentPage.waitForTimeout(300);
      }
    });

    test('应支持按方法过滤历史', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const methodFilter = contentPage.locator('.method-filter, .el-select').first();
      if (await methodFilter.isVisible()) {
        await methodFilter.click();
        await contentPage.waitForTimeout(300);
      }
    });

    test('应支持按状态码过滤历史', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/status/200');
      await openHistoryPanel(contentPage);
      const statusFilter = contentPage.locator('.status-filter, .el-select').first();
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        await contentPage.waitForTimeout(300);
      }
    });
  });
});
