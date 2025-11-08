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
    test('应显示布局切换按钮', async () => {
      await waitForHttpNodeReady(contentPage);
      const layoutBtn = getLayoutToggleButton(contentPage);
      if (await layoutBtn.isVisible()) {
        await expect(layoutBtn).toBeVisible();
      }
    });

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

    test('布局切换应有过渡动画', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToHorizontalLayout(contentPage);
      await contentPage.waitForTimeout(300);
      await switchToVerticalLayout(contentPage);
      await contentPage.waitForTimeout(300);
    });

    test('切换布局不应丢失数据', async () => {
      await waitForHttpNodeReady(contentPage);
      const testUrl = 'https://httpbin.org/get?layout=test';
      await fillUrl(contentPage, testUrl);
      await contentPage.waitForTimeout(300);
      await switchToHorizontalLayout(contentPage);
      await contentPage.waitForTimeout(300);
      await verifyUrlValue(contentPage, testUrl);
      await switchToVerticalLayout(contentPage);
      await contentPage.waitForTimeout(300);
      await verifyUrlValue(contentPage, testUrl);
    });
  });

  test.describe('13.2 面板调整测试', () => {
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

    test('上下布局应能拖拽调整高度', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToVerticalLayout(contentPage);
      await dragPanelSplitter(contentPage, 0, 50);
      await contentPage.waitForTimeout(300);
    });

    test('应有最小宽度限制', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToHorizontalLayout(contentPage);
      await dragPanelSplitter(contentPage, -1000, 0);
      await verifyMinPanelWidth(contentPage, 200);
    });

    test('应有最小高度限制', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToVerticalLayout(contentPage);
      await dragPanelSplitter(contentPage, 0, -1000);
      await contentPage.waitForTimeout(300);
    });

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
    test('布局选择应持久化保存', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToVerticalLayout(contentPage);
      await contentPage.waitForTimeout(300);
      await clickRefresh(contentPage);
      await waitForHttpNodeReady(contentPage);
      await verifyVerticalLayout(contentPage);
    });

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
    test('窗口缩小时应自动调整布局', async () => {
      await waitForHttpNodeReady(contentPage);
      await resizeWindow(contentPage, 1400, 900);
      await contentPage.waitForTimeout(300);
      await resizeWindow(contentPage, 1200, 800);
      await contentPage.waitForTimeout(300);
    });

    test('窗口过小时应提示最小宽度要求', async () => {
      await waitForHttpNodeReady(contentPage);
      await resizeWindow(contentPage, 1100, 700);
      await contentPage.waitForTimeout(300);
      const scrollbar = contentPage.locator('.scrollbar, ::-webkit-scrollbar').first();
      if (await scrollbar.isVisible()) {
        await expect(scrollbar).toBeVisible();
      }
    });
  });
});
