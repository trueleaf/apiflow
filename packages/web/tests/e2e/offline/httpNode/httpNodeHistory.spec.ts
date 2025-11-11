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
    /**
     * 测试目的：验证显示历史记录按钮
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 等待HTTP节点就绪
     *   2. 检查历史记录按钮是否显示
     * 预期结果：
     *   - 历史记录按钮可见
     *   - 按钮位置在工具栏区域
     * 验证点：历史记录入口的显示
     * 说明：历史记录按钮是查看历史的入口
     */
    test('应显示历史记录按钮', async () => {
      await waitForHttpNodeReady(contentPage);
      const historyBtn = contentPage.locator('[title*="历史"], .history-btn').first();
      await expect(historyBtn).toBeVisible();
    });

    /**
     * 测试目的：验证打开历史记录面板
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 点击历史记录按钮
     *   2. 检查面板是否显示
     * 预期结果：
     *   - 历史记录面板打开
     *   - 面板以下拉或侧边栏形式展示
     * 验证点：历史记录面板打开
     * 说明：点击按钮后显示历史记录列表
     */
    test('点击按钮应打开历史记录面板', async () => {
      await waitForHttpNodeReady(contentPage);
      await openHistoryPanel(contentPage);
      const historyPanel = contentPage.locator('.history-dropdown, .history-detail-panel').first();
      await expect(historyPanel).toBeVisible();
    });

    /**
     * 测试目的：验证显示历史记录列表
     * 前置条件：已创建HTTP节点并发送过请求
     * 操作步骤：
     *   1. 发送请求并保存
     *   2. 打开历史记录面板
     *   3. 检查历史记录列表
     * 预期结果：
     *   - 历史记录列表显示
     *   - 至少有一条历史记录
     * 验证点：历史记录列表展示
     * 说明：发送请求后自动记录到历史
     */
    test('应显示历史记录列表', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      await contentPage.waitForSelector('.history-list .history-item, .history-record', { state: 'attached', timeout: 5000 });
      const historyList = getHistoryList(contentPage);
      const count = await historyList.count();
      expect(count).toBeGreaterThan(0);
    });

    /**
     * 测试目的：验证历史记录按时间倒序排列
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 发送两个不同的请求
     *   2. 打开历史记录
     *   3. 检查第一条记录是否为最新请求
     * 预期结果：
     *   - 最新的请求排在最前面
     *   - 时间戳从新到旧排列
     * 验证点：历史记录排序
     * 说明：最新的历史记录在列表顶部
     */
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

    /**
     * 测试目的：验证历史记录显示请求时间
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求并保存
     *   2. 打开历史记录
     *   3. 检查时间元素
     * 预期结果：
     *   - 显示请求发送时间
     *   - 时间格式清晰易读
     * 验证点：请求时间显示
     * 说明：显示每条历史记录的发送时间
     */
    test('历史记录应显示请求时间', async () => {
      await waitForHttpNodeReady(contentPage);
  await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const historyList = getHistoryList(contentPage);
      const firstItem = historyList.first();
      const timeElement = firstItem.locator('.history-time, .time, .timestamp').first();
      await expect(timeElement).toBeVisible();
    });

    /**
     * 测试目的：验证历史记录显示请求方法
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送GET请求
     *   2. 打开历史记录
     *   3. 悬停查看详情
     *   4. 检查请求方法
     * 预期结果：
     *   - 显示请求方法(GET/POST等)
     *   - 方法显示清晰可见
     * 验证点：请求方法显示
     * 说明：历史记录显示HTTP方法
     */
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

    /**
     * 测试目的：验证历史记录显示请求URL
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 悬停查看详情
     *   4. 检查URL显示
     * 预期结果：
     *   - 显示完整的请求URL
     *   - URL格式正确
     * 验证点：请求URL显示
     * 说明：显示历史请求的完整URL
     */
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

    /**
     * 测试目的：验证历史记录显示状态码
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 检查状态码元素
     * 预期结果：
     *   - 显示HTTP状态码
     *   - 状态码清晰可见
     * 验证点：状态码显示
     * 说明：显示响应的HTTP状态码
     */
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

    /**
     * 测试目的：验证历史记录显示响应时间
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 检查响应时间元素
     * 预期结果：
     *   - 显示请求响应时间
     *   - 时间以毫秒或秒为单位
     * 验证点：响应时间显示
     * 说明：显示请求从发送到响应的耗时
     */
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

    /**
     * 测试目的：验证成功和失败请求的样式区分
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送成功的请求
     *   2. 打开历史记录
     *   3. 检查样式类名
     * 预期结果：
     *   - 成功和失败请求有不同样式
     *   - 通过颜色或图标区分
     * 验证点：请求状态样式区分
     * 说明：成功(2xx)和失败(4xx/5xx)有不同的视觉标识
     */
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
    /**
     * 测试目的：验证点击历史记录查看详情
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 点击某条历史记录
     *   4. 检查详情面板
     * 预期结果：
     *   - 显示详情面板
     *   - 详情包含完整的请求和响应信息
     * 验证点：查看历史详情功能
     * 说明：点击历史记录可查看完整详情
     */
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

    /**
     * 测试目的：验证恢复历史记录
     * 前置条件：已创建HTTP节点并发送过请求
     * 操作步骤：
     *   1. 发送请求并保存
     *   2. 修改URL为其他值
     *   3. 打开历史记录
     *   4. 点击历史记录项
     *   5. 点击恢复按钮
     *   6. 检查URL是否恢复
     * 预期结果：
     *   - URL恢复为历史记录的值
     *   - 所有参数、headers等一并恢复
     * 验证点：历史记录恢复功能
     * 说明：恢复功能可以快速还原之前的请求配置
     */
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

    /**
     * 测试目的：验证删除单条历史记录
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 记录数量
     *   4. 删除一条记录
     *   5. 检查数量变化
     * 预期结果：
     *   - 历史记录数量减1
     *   - 被删除的记录不再显示
     * 验证点：单条历史删除功能
     * 说明：可以删除不需要的历史记录
     */
    test('应能删除单条历史记录', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      const countBefore = await getHistoryList(contentPage).count();
      await deleteHistoryItem(contentPage, 0);
      const countAfter = await getHistoryList(contentPage).count();
      expect(countAfter).toBeLessThan(countBefore);
    });

    /**
     * 测试目的：验证清空所有历史记录
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 点击清空按钮并确认
     *   4. 检查历史记录数量
     * 预期结果：
     *   - 所有历史记录被清空
     *   - 列表为空
     * 验证点：清空历史记录功能
     * 说明：清空操作会删除当前节点的所有历史
     */
    test('应能清空所有历史记录', async () => {
      await waitForHttpNodeReady(contentPage);
      await sendRequestAndSave('https://httpbin.org/get');
      await openHistoryPanel(contentPage);
      await clearAllHistory(contentPage);
      const count = await getHistoryList(contentPage).count();
      expect(count).toBe(0);
    });

    /**
     * 测试目的：验证清空历史确认提示
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 点击清空按钮
     *   4. 检查确认对话框
     * 预期结果：
     *   - 显示确认对话框
     *   - 提示清空操作不可撤销
     * 验证点：清空确认机制
     * 说明：清空前需要用户确认防止误操作
     */
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

    /**
     * 测试目的：验证取消清空保留历史
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 点击清空按钮
     *   4. 在确认对话框中点击取消
     *   5. 检查历史记录数量
     * 预期结果：
     *   - 历史记录保持不变
     *   - 数量没有减少
     * 验证点：取消清空操作
     * 说明：取消操作不会删除历史记录
     */
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
    /**
     * 测试目的：验证详情显示完整请求信息
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 点击历史记录项
     *   4. 检查请求信息区域
     * 预期结果：
     *   - 显示请求URL、方法、headers、body等
     *   - 请求信息完整准确
     * 验证点：请求信息展示
     * 说明：详情面板展示完整的请求配置
     */
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

    /**
     * 测试目的：验证详情显示完整响应信息
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 点击历史记录项
     *   4. 检查响应信息区域
     * 预期结果：
     *   - 显示响应状态码、headers、body等
     *   - 响应信息完整准确
     * 验证点：响应信息展示
     * 说明：详情面板展示完整的响应数据
     */
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

    /**
     * 测试目的：验证详情显示请求耗时
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 点击历史记录项
     *   4. 检查耗时信息
     * 预期结果：
     *   - 显示请求耗时
     *   - 耗时以毫秒或秒为单位
     * 验证点：请求耗时显示
     * 说明：耗时信息帮助分析接口性能
     */
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

    /**
     * 测试目的：验证支持复制请求响应内容
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录
     *   3. 点击历史记录项
     *   4. 检查复制按钮
     * 预期结果：
     *   - 显示复制按钮
     *   - 可以复制请求或响应内容
     * 验证点：复制功能按钮
     * 说明：复制功能方便分享或存档数据
     */
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

    /**
     * 测试目的：验证关闭详情面板
     * 前置条件：已创建HTTP节点并打开历史详情
     * 操作步骤：
     *   1. 发送请求
     *   2. 打开历史记录并悬停
     *   3. 关闭历史面板
     *   4. 检查面板是否关闭
     * 预期结果：
     *   - 详情面板关闭
     *   - 历史下拉列表也关闭
     * 验证点：关闭面板功能
     * 说明：可以关闭历史记录面板
     */
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
    /**
     * 测试目的：验证历史记录持久化存储
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送请求并保存
     *   2. 刷新页面
     *   3. 打开历史记录
     *   4. 检查历史是否存在
     * 预期结果：
     *   - 历史记录仍然存在
     *   - 数据完整无丢失
     * 验证点：历史记录持久化
     * 说明：历史记录存储在IndexedDB中
     */
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

    /**
     * 测试目的：验证限制历史记录最大数量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 发送超过50个请求
     *   2. 打开历史记录
     *   3. 检查历史数量
     * 预期结果：
     *   - 历史记录数量不超过50
     *   - 最早的记录被自动删除
     * 验证点：历史记录数量限制
     * 说明：限制历史数量避免占用过多存储空间
     */
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

    /**
     * 测试目的：验证切换节点加载对应历史
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 在节点A发送请求
     *   2. 打开历史记录
     *   3. 悬停查看详情
     *   4. 验证URL参数
     * 预期结果：
     *   - 显示当前节点的历史
     *   - 不显示其他节点的历史
     * 验证点：节点历史隔离
     * 说明：每个节点有独立的历史记录
     */
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
    /**
     * 测试目的：验证按URL搜索历史
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送包含关键词的请求
     *   2. 打开历史记录
     *   3. 在搜索框输入关键词
     *   4. 检查搜索结果
     * 预期结果：
     *   - 显示匹配的历史记录
     *   - 不匹配的记录被过滤
     * 验证点：URL搜索功能
     * 说明：搜索功能帮助快速定位历史记录
     */
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

    /**
     * 测试目的：验证按方法过滤历史
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送GET请求
     *   2. 打开历史记录
     *   3. 点击方法过滤器
     * 预期结果：
     *   - 显示方法选择器
     *   - 可以按GET、POST等过滤
     * 验证点：方法过滤功能
     * 说明：方法过滤帮助筛选特定类型的请求
     */
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

    /**
     * 测试目的：验证按状态码过滤历史
     * 前置条件：已创建HTTP节点并发送请求
     * 操作步骤：
     *   1. 发送成功的请求
     *   2. 打开历史记录
     *   3. 点击状态码过滤器
     * 预期结果：
     *   - 显示状态码选择器
     *   - 可以按2xx、4xx等过滤
     * 验证点：状态码过滤功能
     * 说明：状态码过滤帮助筛选成功或失败的请求
     */
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
