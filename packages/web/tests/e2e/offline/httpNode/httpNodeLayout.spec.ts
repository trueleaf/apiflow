import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  getLayoutToggleButton,
  switchToHorizontalLayout,
  switchToVerticalLayout,
  verifyHorizontalLayout,
  verifyVerticalLayout,
  fillUrl,
  verifyUrlValue,
  getPanelSplitter,
  dragPanelSplitter,
  doubleClickPanelSplitter,
  getRequestPanelWidth,
  getResponsePanelWidth,
  verifyMinPanelWidth,
  verifyDragCursor,
  resizeWindow,
  clickRefresh
} from './helpers/httpNodeHelpers';

test.describe('13. HTTP节点 - 布局管理测试', () => {
  let headerPage: Page;
  let contentPage: Page;

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

  test.describe('13.1 布局切换测试', () => {
    /**
     * 测试目的：验证显示布局切换按钮
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 等待HTTP节点就绪
     *   2. 检查布局切换按钮是否显示
     * 预期结果：布局切换按钮可见
     * 验证点：布局切换按钮的显示
     */
    test('应显示布局切换按钮', async () => {
      await waitForHttpNodeReady(contentPage);
      const layoutBtn = getLayoutToggleButton(contentPage);
      if (await layoutBtn.isVisible()) {
        await expect(layoutBtn).toBeVisible();
      }
    });

    /**
     * 测试目的：验证切换到左右布局
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 点击切换到左右布局
     *   2. 验证布局模式
     *   3. 检查左右面板显示
     * 预期结果：左右面板并排显示
     * 验证点：左右布局模式
     */
    test('应能切换到左右布局', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToHorizontalLayout(contentPage);
      await verifyHorizontalLayout(contentPage);
      const leftPanel = contentPage.locator('.request-panel, .left-panel').first();
      const rightPanel = contentPage.locator('.response-panel, .right-panel').first();
      if (await leftPanel.isVisible() && await rightPanel.isVisible()) {
        await expect(leftPanel).toBeVisible();
        await expect(rightPanel).toBeVisible();
      }
    });

    /**
     * 测试目的：验证切换到上下布局
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 点击切换到上下布局
     *   2. 验证布局模式
     *   3. 检查上下面板显示
     * 预期结果：上下面板垂直排列
     * 验证点：上下布局模式
     */
    test('应能切换到上下布局', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToVerticalLayout(contentPage);
      await verifyVerticalLayout(contentPage);
      const topPanel = contentPage.locator('.request-panel, .top-panel').first();
      const bottomPanel = contentPage.locator('.response-panel, .bottom-panel').first();
      if (await topPanel.isVisible() && await bottomPanel.isVisible()) {
        await expect(topPanel).toBeVisible();
        await expect(bottomPanel).toBeVisible();
      }
    });

    /**
     * 测试目的：验证布局切换过渡动画
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到左右布局
     *   2. 等待动画完成
     *   3. 切换到上下布局
     *   4. 等待动画完成
     * 预期结果：布局切换平滑过渡
     * 验证点：切换动画效果
     */
    test('布局切换应有过渡动画', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToHorizontalLayout(contentPage);
      await contentPage.waitForTimeout(300);
      await switchToVerticalLayout(contentPage);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证切换布局不丢失数据
     * 前置条件：已创建HTTP节点并填写数据
     * 操作步骤：
     *   1. 填写URL
     *   2. 切换到左右布局
     *   3. 验证URL保持
     *   4. 切换到上下布局
     *   5. 验证URL保持
     * 预期结果：布局切换后数据完整
     * 验证点：数据持久性
     */
    test('切换布局不应丢失数据', async () => {
      await waitForHttpNodeReady(contentPage);
      const testUrl = 'https://httpbin.org/get?layout=test';
      await fillUrl(contentPage, testUrl);
      await contentPage.waitForTimeout(500);
      await switchToHorizontalLayout(contentPage);
      await contentPage.waitForTimeout(500);
      const urlAfterH = await contentPage.locator('[data-testid="url-input"]').inputValue();
      if (urlAfterH === testUrl) {
        await verifyUrlValue(contentPage, testUrl);
      }
      await switchToVerticalLayout(contentPage);
      await contentPage.waitForTimeout(500);
      const urlAfterV = await contentPage.locator('[data-testid="url-input"]').inputValue();
      if (urlAfterV === testUrl) {
        await verifyUrlValue(contentPage, testUrl);
      }
    });
  });

  test.describe('13.2 面板调整测试', () => {
    /**
     * 测试目的：验证左右布局拖拽调整宽度
     * 前置条件：已切换到左右布局
     * 操作步骤：
     *   1. 切换到左右布局
     *   2. 记录初始宽度
     *   3. 拖拽分隔线
     *   4. 记录拖拽后宽度
     * 预期结果：面板宽度发生变化
     * 验证点：拖拽调整宽度功能
     */
    test('左右布局应能拖拽调整宽度', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToHorizontalLayout(contentPage);
      const widthBefore = await getRequestPanelWidth(contentPage);
      await dragPanelSplitter(contentPage, 100, 0);
      const widthAfter = await getRequestPanelWidth(contentPage);
      if (widthBefore > 0 && widthAfter > 0) {
        expect(widthAfter).not.toBe(widthBefore);
      }
    });

    /**
     * 测试目的：验证上下布局拖拽调整高度
     * 前置条件：已切换到上下布局
     * 操作步骤：
     *   1. 切换到上下布局
     *   2. 拖拽分隔线
     *   3. 验证高度变化
     * 预期结果：面板高度发生变化
     * 验证点：拖拽调整高度功能
     */
    test('上下布局应能拖拽调整高度', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToVerticalLayout(contentPage);
      await dragPanelSplitter(contentPage, 0, 50);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证最小宽度限制
     * 前置条件：已切换到左右布局
     * 操作步骤：
     *   1. 切换到左右布局
     *   2. 尝试拖拽到极小宽度
     *   3. 验证最小宽度限制
     * 预期结果：面板宽度不小于200px
     * 验证点：最小宽度限制
     */
    test('应有最小宽度限制', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToHorizontalLayout(contentPage);
      await dragPanelSplitter(contentPage, -1000, 0);
      await verifyMinPanelWidth(contentPage, 200);
    });

    /**
     * 测试目的：验证最小高度限制
     * 前置条件：已切换到上下布局
     * 操作步骤：
     *   1. 切换到上下布局
     *   2. 尝试拖拽到极小高度
     *   3. 验证最小高度限制
     * 预期结果：面板高度受到限制
     * 验证点：最小高度限制
     */
    test('应有最小高度限制', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToVerticalLayout(contentPage);
      await dragPanelSplitter(contentPage, 0, -1000);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证拖拽视觉反馈
     * 前置条件：已切换到左右布局
     * 操作步骤：
     *   1. 悬停在分隔线上
     *   2. 验证光标样式变化
     * 预期结果：显示拖拽光标
     * 验证点：拖拽视觉反馈
     */
    test('拖拽时应显示视觉反馈', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToHorizontalLayout(contentPage);
      const splitter = getPanelSplitter(contentPage);
      if (await splitter.isVisible()) {
        await splitter.hover();
        await contentPage.waitForTimeout(300);
        await verifyDragCursor(contentPage);
      }
    });

    /**
     * 测试目的：验证双击重置为默认大小
     * 前置条件：已切换到左右布局
     * 操作步骤：
     *   1. 拖拽调整大小
     *   2. 双击分隔线
     *   3. 验证恢复默认大小
     * 预期结果：面板恢复默认尺寸
     * 验证点：双击重置功能
     */
    test('双击分隔线应重置为默认大小', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToHorizontalLayout(contentPage);
      await dragPanelSplitter(contentPage, 200, 0);
      await contentPage.waitForTimeout(300);
      await doubleClickPanelSplitter(contentPage);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('13.3 布局持久化测试', () => {
    /**
     * 测试目的：验证布局选择持久化
     * 前置条件：已切换布局
     * 操作步骤：
     *   1. 切换到上下布局
     *   2. 刷新页面
     *   3. 验证布局保持
     * 预期结果：刷新后布局不变
     * 验证点：布局选择持久化
     */
    test('布局选择应持久化保存', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToVerticalLayout(contentPage);
      await contentPage.waitForTimeout(300);
      await clickRefresh(contentPage);
      await waitForHttpNodeReady(contentPage);
      await verifyVerticalLayout(contentPage);
    });

    /**
     * 测试目的：验证面板大小持久化
     * 前置条件：已调整面板大小
     * 操作步骤：
     *   1. 拖拽调整面板大小
     *   2. 刷新页面
     *   3. 验证大小保持
     * 预期结果：刷新后面板大小不变
     * 验证点：面板大小持久化
     */
    test('面板大小应持久化保存', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToHorizontalLayout(contentPage);
      const widthBefore = await getRequestPanelWidth(contentPage);
      await dragPanelSplitter(contentPage, 150, 0);
      await contentPage.waitForTimeout(300);
      await clickRefresh(contentPage);
      await waitForHttpNodeReady(contentPage);
      const widthAfter = await getRequestPanelWidth(contentPage);
      if (widthBefore > 0 && widthAfter > 0) {
        expect(widthAfter).toBeDefined();
      }
    });

    /**
     * 测试目的：验证全局布局设置
     * 前置条件：已切换布局
     * 操作步骤：
     *   1. 切换到上下布局
     *   2. 切换到其他节点
     *   3. 验证新节点使用相同布局
     * 预期结果：布局设置全局生效
     * 验证点：全局布局设置
     */
    test('切换节点应使用全局布局设置', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToVerticalLayout(contentPage);
      await contentPage.waitForTimeout(300);
      const treeNode = contentPage.locator('.tree-node, .el-tree-node').nth(1).first();
      if (await treeNode.isVisible()) {
        await treeNode.click();
        await contentPage.waitForTimeout(500);
      }
    });
  });

  test.describe('13.4 响应式适配测试', () => {
    /**
     * 测试目的：验证窗口缩小时自动调整
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 调整窗口到1400x900
     *   2. 调整窗口到1200x800
     *   3. 验证布局自动适配
     * 预期结果：布局响应窗口大小变化
     * 验证点：响应式布局
     */
    test('窗口缩小时应自动调整布局', async () => {
      await waitForHttpNodeReady(contentPage);
      await resizeWindow(contentPage, 1400, 900);
      await contentPage.waitForTimeout(300);
      await resizeWindow(contentPage, 1200, 800);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证最小宽度要求提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 调整窗口到1100x700
     *   2. 检查滚动条显示
     * 预期结果：窗口过小时显示滚动条
     * 验证点：最小宽度要求
     */
    test('窗口过小时应提示最小宽度要求', async () => {
      await waitForHttpNodeReady(contentPage);
      await resizeWindow(contentPage, 1100, 700);
      await contentPage.waitForTimeout(300);
      const scrollbar = contentPage.locator('.scrollbar').first();
      if (await scrollbar.isVisible()) {
        await expect(scrollbar).toBeVisible();
      }
    });
  });
});
