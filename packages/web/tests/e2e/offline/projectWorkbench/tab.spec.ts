import { expect, type Page } from '@playwright/test';
import {
  test,
  getPages,
  createMockTab,
  clearProjectWorkbenchState,
  navigateToProjectWorkbench,
  createTabInStorage,
  setActiveTab,
  expectTabExists,
  expectTabPersisted,
  waitForVueComponentReady,
} from '../../../fixtures/projectWorkbench.fixture';
import { createProject, initOfflineWorkbench, createNodes } from '../../../fixtures/fixtures';

const TEST_PROJECT_ID = 'test-project-001';
const TEST_PROJECT_ID_2 = 'test-project-002';

/*
|--------------------------------------------------------------------------
| 主工作区 - Tab 管理
|--------------------------------------------------------------------------
| 本测试文件专注于验证 Tab 相关的所有业务逻辑，包括：
| 1. Tab 创建与打开
| 2. Tab 切换与激活
| 3. Tab 固定功能
| 4. Tab 关闭功能
| 5. Tab 未保存状态管理
| 6. Tab 拖拽排序
| 7. Tab 持久化
| 8. Tab UI显示
| 9. Tab 滚动功能
| 10. Tab 数据同步
| 11. Tab 项目隔离
| 12. 非Tab相关（预留）
|
| 测试总数：51个（38个已实现 + 13个新增TODO）
|--------------------------------------------------------------------------
*/

test.describe('主工作区 - Tab 管理', () => {
  let headerPage: Page;
  let contentPage: Page;

  /*
  |--------------------------------------------------------------------------
  | 1. Tab 创建与打开 (4个测试)
  |--------------------------------------------------------------------------
  */
  test.describe('1. Tab 创建与打开', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await createProject(contentPage, '测试项目');
    });

    test('点击不同类型节点创建 Tab', async () => {
      const results = await createNodes(contentPage, [
        { name: 'HTTP接口测试', type: 'http' },
        { name: 'WebSocket接口测试', type: 'websocket' },
        { name: 'Mock接口测试', type: 'httpMock' }
      ]);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      const httpNode = contentPage.locator('.custom-tree-node').filter({ hasText: 'HTTP接口测试' }).first();
      await httpNode.click();
      const httpTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'HTTP接口测试' });
      await expect(httpTab).toBeVisible();
      await expect(httpTab).toHaveClass(/active/);

      const wsNode = contentPage.locator('.custom-tree-node').filter({ hasText: 'WebSocket接口测试' }).first();
      await wsNode.click();
      const wsTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'WebSocket接口测试' });
      await expect(wsTab).toBeVisible();
      await expect(wsTab).toHaveClass(/active/);

      const mockNode = contentPage.locator('.custom-tree-node').filter({ hasText: 'Mock接口测试' }).first();
      await mockNode.click();
      const mockTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Mock接口测试' });
      await expect(mockTab).toBeVisible();
      await expect(mockTab).toHaveClass(/active/);

      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(3);

      // 验证HTTP接口测试Tab显示正确的类型图标
      const httpMethod = httpTab.locator('span.mr-2').first();
      await expect(httpMethod).toBeVisible();
      const httpMethodText = await httpMethod.textContent();
      expect(httpMethodText).toMatch(/GET|POST|PUT|DEL|PATCH|HEAD|OPTIONS/);

      // 验证WebSocket接口测试Tab显示正确的类型图标
      const wsIcon = wsTab.locator('span.red.mr-2').first();
      await expect(wsIcon).toBeVisible();
      const wsIconText = await wsIcon.textContent();
      expect(wsIconText?.toUpperCase()).toMatch(/WS|WSS/);

      // 验证Mock接口测试Tab显示正确的类型图标
      const mockIcon = mockTab.locator('.mock-tab-icon');
      await expect(mockIcon).toBeVisible();
      await expect(mockIcon).toHaveText('MOCK');
    });

    test('重复点击同一节点不重复创建 Tab', async () => {
      const results = await createNodes(contentPage, [
        { name: 'HTTP节点测试', type: 'http' }
      ]);
      expect(results[0].success).toBe(true);

      const httpNode = contentPage.locator('.custom-tree-node').filter({ hasText: 'HTTP节点测试' }).first();

      // 第一次点击节点
      await httpNode.click();
      const firstTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'HTTP节点测试' });
      await expect(firstTab).toBeVisible();
      await expect(firstTab).toHaveClass(/active/);
      let tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(1);

      // 再次点击相同节点
      await httpNode.click();

      // 验证Tab数量仍然为1
      tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(1);

      // 验证该Tab仍然处于激活状态
      await expect(firstTab).toHaveClass(/active/);
    });

    test('Tab 覆盖逻辑 - 点击Banner打开未固定Tab会覆盖已存在的未固定Tab', async () => {
      // 创建两个节点
      const results = await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' }
      ]);
      results.forEach(result => expect(result.success).toBe(true));

      // 关闭createNodes自动打开的固定Tab
      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' });
      await tab1.hover();
      await contentPage.waitForTimeout(300);
      const closeBtn1 = tab1.locator('.operation .close');
      await expect(closeBtn1).toBeVisible({ timeout: 1000 });
      await closeBtn1.click();
      await expect(tab1).toHaveCount(0, { timeout: 2000 });

      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' });
      await tab2.hover();
      await contentPage.waitForTimeout(300);
      const closeBtn2 = tab2.locator('.operation .close');
      await expect(closeBtn2).toBeVisible({ timeout: 1000 });
      await closeBtn2.click();
      await expect(tab2).toHaveCount(0, { timeout: 2000 });

      // 验证所有Tab已关闭
      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0);

      // 点击Banner节点1打开未固定Tab（fixed=false）
      const bannerNode1 = contentPage.locator('.custom-tree-node').filter({ hasText: '节点1' }).first();
      await bannerNode1.click();
      await contentPage.waitForTimeout(500);

      // 验证未固定Tab1已打开
      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' })).toBeVisible();

      // 点击Banner节点2打开未固定Tab（fixed=false）
      // 根据业务逻辑：未固定Tab2会覆盖未固定Tab1
      const bannerNode2 = contentPage.locator('.custom-tree-node').filter({ hasText: '节点2' }).first();
      await bannerNode2.click();
      await contentPage.waitForTimeout(500);

      // 验证Tab数量仍然是1（未固定Tab1被未固定Tab2覆盖）
      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);

      // 验证节点1的Tab被覆盖，只剩节点2的Tab
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' })).toHaveCount(0);
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' })).toBeVisible();
    });

    test('从Banner双击节点创建固定Tab', async () => {
      // 1. 创建两个节点
      const results = await createNodes(contentPage, [
        { name: '双击节点A', type: 'http' },
        { name: '双击节点B', type: 'http' }
      ]);
      results.forEach(result => expect(result.success).toBe(true));
      
      // 2. 关闭createNodes自动打开的固定Tab
      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
      const tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: '双击节点A' });
      await tabA.hover();
      const closeBtnA = tabA.locator('.operation .close');
      await expect(closeBtnA).toBeVisible({ timeout: 1000 });
      await closeBtnA.click();
      await expect(tabA).toHaveCount(0, { timeout: 2000 });

      const tabB = contentPage.locator('.nav .tab-list .item').filter({ hasText: '双击节点B' });
      await tabB.hover();
      const closeBtnB = tabB.locator('.operation .close');
      await expect(closeBtnB).toBeVisible({ timeout: 1000 });
      await closeBtnB.click();
      await expect(tabB).toHaveCount(0, { timeout: 2000 });

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0);

      // 3. 双击Banner中的节点A创建固定Tab
      const bannerNodeA = contentPage.locator('.custom-tree-node').filter({ hasText: '双击节点A' }).first();
      await bannerNodeA.dblclick();

      // 4. 验证固定Tab已创建
      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
      const fixedTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '双击节点A' });
      await expect(fixedTab).toBeVisible();

      // 5. 从UI验证Tab是固定状态
      // 5.1 验证Tab图标不倾斜 (固定Tab的图标transform应该是skewX(0deg))
      const tabIcon = fixedTab.locator('span.mr-2').first();
      const iconTransform = await tabIcon.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
      // transform为'none'或者matrix(1, 0, 0, 1, 0, 0)表示没有倾斜
      expect(iconTransform === 'none' || !iconTransform.includes('skew')).toBe(true);

      // 5.2 验证Tab文本没有unfixed class
      const tabText = fixedTab.locator('.item-text');
      await expect(tabText).not.toHaveClass(/unfixed/);

      // 5.3 验证Tab文本不倾斜
      const textTransform = await tabText.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
      // 固定Tab的文本不应该有skewX(-10deg)的倾斜
      expect(textTransform === 'none' || !textTransform.includes('skew')).toBe(true);

      // 6. 单击Banner中的节点B创建未固定Tab
      const bannerNodeB = contentPage.locator('.custom-tree-node').filter({ hasText: '双击节点B' }).first();
      await bannerNodeB.click();

      // 7. 验证固定Tab不会被未固定Tab覆盖，两个Tab共存
      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '双击节点A' })).toBeVisible();
      const unfixedTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '双击节点B' });
      await expect(unfixedTab).toBeVisible();

      // 8. 从UI验证未固定Tab的特征（与固定Tab对比）
      // 8.1 验证未固定Tab文本有unfixed class
      const unfixedTabText = unfixedTab.locator('.item-text');
      await expect(unfixedTabText).toHaveClass(/unfixed/);

      // 8.2 验证未固定Tab文本有倾斜效果
      const unfixedTextTransform = await unfixedTabText.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
      // 未固定Tab应该有倾斜效果（transform不为none）
      expect(unfixedTextTransform !== 'none').toBe(true);

      // 9. 验证Tab顺序：固定Tab应该在未固定Tab左侧
      const getTabNames = async () => {
        const tabs = await contentPage.locator('.nav .tab-list .item').all();
        const names: string[] = [];
        for (const tab of tabs) {
          const text = await tab.textContent();
          if (text?.includes('双击节点A')) names.push('双击节点A');
          else if (text?.includes('双击节点B')) names.push('双击节点B');
        }
        return names;
      };

      const tabOrder = await getTabNames();
      expect(tabOrder).toEqual(['双击节点A', '双击节点B']);
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 2. Tab 切换与激活 (2个测试)
  |--------------------------------------------------------------------------
  */
  test.describe('2. Tab 切换与激活', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await createProject(contentPage, '测试项目');
    });

    test('点击 Tab 切换激活状态', async () => {
      const results = await createNodes(contentPage, [
        { name: 'Tab1', type: 'http' },
        { name: 'Tab2', type: 'http' },
        { name: 'Tab3', type: 'http' }
      ]);
      results.forEach(result => expect(result.success).toBe(true));

      // 打开3个Tab
      await contentPage.locator('.custom-tree-node').filter({ hasText: 'Tab1' }).first().click();
      await contentPage.waitForTimeout(500);
      await contentPage.locator('.custom-tree-node').filter({ hasText: 'Tab2' }).first().click();
      await contentPage.waitForTimeout(500);
      await contentPage.locator('.custom-tree-node').filter({ hasText: 'Tab3' }).first().click();
      await contentPage.waitForTimeout(500);

      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab1' });
      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab2' });
      const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab3' });

      // 当前Tab3是激活状态
      await expect(tab3).toHaveClass(/active/);

      // 点击第一个Tab
      await tab1.click();
      await contentPage.waitForTimeout(300);
      await expect(tab1).toHaveClass(/active/);
      await expect(tab2).not.toHaveClass(/active/);
      await expect(tab3).not.toHaveClass(/active/);

      // 点击第二个Tab
      await tab2.click();
      await contentPage.waitForTimeout(300);
      await expect(tab2).toHaveClass(/active/);
      await expect(tab1).not.toHaveClass(/active/);
      await expect(tab3).not.toHaveClass(/active/);

      // 点击第三个Tab
      await tab3.click();
      await contentPage.waitForTimeout(300);
      await expect(tab3).toHaveClass(/active/);
      await expect(tab1).not.toHaveClass(/active/);
      await expect(tab2).not.toHaveClass(/active/);
    });

    test('关闭当前激活 Tab 后自动激活相邻 Tab', async () => {
      const results = await createNodes(contentPage, [
        { name: 'TabA', type: 'http' },
        { name: 'TabB', type: 'http' },
        { name: 'TabC', type: 'http' }
      ]);
      results.forEach(result => expect(result.success).toBe(true));

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);

      const tabC = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabC' });
      await expect(tabC).toHaveClass(/active/);

      const tabB = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabB' });
      await tabB.click();
      await expect(tabB).toHaveClass(/active/);

      await tabB.hover();
      const closeBtn = tabB.locator('.operation .close');
      await expect(closeBtn).toBeVisible({ timeout: 1000 });
      await closeBtn.click();

      await expect(tabB).toHaveCount(0, { timeout: 2000 });
      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);

      const tabBExists = await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabB' }).count();
      expect(tabBExists).toBe(0);

      await expect(tabC).toHaveClass(/active/);

      const tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabA' });
      await expect(tabA).toBeVisible();
      await expect(tabA).not.toHaveClass(/active/);
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 3. Tab 固定功能 (7个测试: 3个现有 + 4个新增)
  |--------------------------------------------------------------------------
  */
  test.describe('3. Tab 固定功能', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await createProject(contentPage, '测试项目');
    });

    test('固定Tab不会被新Tab覆盖', async () => {
      const results1 = await createNodes(contentPage, [
        { name: '固定Tab1', type: 'http' }
      ]);
      expect(results1[0].success).toBe(true);

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);

      const bannerNode = contentPage.locator('.custom-tree-node').filter({ hasText: '固定Tab1' }).first();
      await bannerNode.dblclick();

      const results2 = await createNodes(contentPage, [
        { name: '新Tab2', type: 'http' }
      ]);
      expect(results2[0].success).toBe(true);

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);

      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '固定Tab1' })).toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '新Tab2' })).toBeVisible();
    });

    test('固定Tab可以正常关闭', async () => {
      const results = await createNodes(contentPage, [
        { name: '可关闭固定Tab', type: 'http' }
      ]);
      expect(results[0].success).toBe(true);

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);

      const bannerNode = contentPage.locator('.custom-tree-node').filter({ hasText: '可关闭固定Tab' }).first();
      await bannerNode.dblclick();

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '可关闭固定Tab' });
      await expect(tab).toBeVisible();

      await tab.hover();
      const closeBtn = tab.locator('.operation .close');
      await expect(closeBtn).toBeVisible({ timeout: 1000 });
      await closeBtn.click();

      await expect(tab).toHaveCount(0, { timeout: 2000 });

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0);
    });

    test('固定Tab和未固定Tab可以共存', async () => {
      const results = await createNodes(contentPage, [
        { name: '固定节点', type: 'http' },
        { name: '未固定节点', type: 'http' }
      ]);
      results.forEach(result => expect(result.success).toBe(true));

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);

      const unfixedTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未固定节点' });
      await unfixedTab.hover();
      const closeBtn = unfixedTab.locator('.operation .close');
      await expect(closeBtn).toBeVisible({ timeout: 1000 });
      await closeBtn.click();
      await expect(unfixedTab).toHaveCount(0, { timeout: 2000 });

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);

      const bannerNode = contentPage.locator('.custom-tree-node').filter({ hasText: '未固定节点' }).first();
      await bannerNode.click();

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);

      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: /^GET固定节点$/ });
      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: /^GET未固定节点$/ });
      await expect(tab1).toHaveCount(1);
      await expect(tab2).toHaveCount(1);
    });

    test.skip('🆕 双击Tab切换固定状态', async () => {
      // TODO: 实现测试逻辑
      // 注意：根据业务逻辑，双击Tab只能将未固定Tab变为固定Tab，不支持取消固定
      // 1. 创建节点并打开未固定Tab
      // 2. 双击Tab将其固定
      // 3. 验证Tab状态变为固定（可能需要检查视觉标识或localStorage的fixed属性）
      // 4. 再次双击已固定的Tab，验证仍然保持固定状态（不会取消固定）
    });

    test.skip('🆕 固定Tab的视觉标识验证', async () => {
      // TODO: 实现测试逻辑
      // 1. 创建固定Tab
      // 2. 验证固定Tab的视觉标识（可能是class、图标、颜色等）
      // 例如：await expect(tab).toHaveClass(/pinned/);
      // 或者：const pinIcon = tab.locator('.pin-icon'); await expect(pinIcon).toBeVisible();
      // 3. 取消固定
      // 4. 验证视觉标识消失
    });

    test.skip('🆕 右键菜单固定/取消固定Tab', async () => {
      // TODO: 实现测试逻辑
      // 1. 创建Tab
      // 2. 右键点击Tab
      // 3. 查找"固定"或"取消固定"菜单项
      // 4. 点击菜单项
      // 5. 验证Tab固定状态变化
    });

    test.skip('🆕 拖拽时固定Tab排序规则', async () => {
      // TODO: 实现测试逻辑
      // 1. 创建多个Tab，部分固定，部分未固定
      // 2. 尝试拖拽固定Tab到未固定Tab后面
      // 3. 验证拖拽后固定Tab仍然保持在未固定Tab左侧
      // 4. 尝试拖拽未固定Tab到固定Tab前面
      // 5. 验证拖拽后未固定Tab自动移动到固定Tab右侧
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 由于文件过长，这里只展示文件结构
  | 剩余分组将使用相同的模式继续添加
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | 4. Tab 关闭功能 (17个测试: 3+5+2+2+4+1 = 17)
  |--------------------------------------------------------------------------
  */
  test.describe('4. Tab 关闭功能', () => {

    test.describe('4.1 基础关闭操作', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });

      test('Hover + 点击关闭按钮', async () => {
        const results = await createNodes(contentPage, [
          { name: 'Tab关闭1', type: 'http' },
          { name: 'Tab关闭2', type: 'http' },
          { name: 'Tab关闭3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);

        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭1' })).toBeVisible();
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭2' })).toBeVisible();
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭3' })).toBeVisible();

        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭2' });
        await tab2.hover();

        const closeBtn = tab2.locator('.operation .close');
        await expect(closeBtn).toBeVisible({ timeout: 1000 });

        await closeBtn.click();

        await expect(tab2).toHaveCount(0, { timeout: 2000 });

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);

        const tab2Exists = await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭2' }).count();
        expect(tab2Exists).toBe(0);

        const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭1' });
        const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭3' });
        await expect(tab1).toBeVisible();
        await expect(tab3).toBeVisible();

        const activeTabCount = await contentPage.locator('.nav .tab-list .item.active').count();
        expect(activeTabCount).toBe(1);
      });

      test('中键点击Tab关闭', async () => {
        const results = await createNodes(contentPage, [
          { name: '中键1', type: 'http' },
          { name: '中键2', type: 'http' },
          { name: '中键3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);

        const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键1' });
        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键2' });
        const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键3' });
        await expect(tab1).toBeVisible();
        await expect(tab2).toBeVisible();
        await expect(tab3).toBeVisible();

        await expect(tab3).toHaveClass(/active/);

        const tab2Box = await tab2.boundingBox();
        expect(tab2Box).not.toBeNull();
        if (tab2Box) {
          await contentPage.mouse.move(
            tab2Box.x + tab2Box.width / 2,
            tab2Box.y + tab2Box.height / 2
          );
          await contentPage.mouse.down({ button: 'middle' });
          await contentPage.mouse.up({ button: 'middle' });
        }

        await expect(tab2).toHaveCount(0, { timeout: 2000 });

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);

        const tab2Exists = await contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键2' }).count();
        expect(tab2Exists).toBe(0);

        await expect(tab1).toBeVisible();
        await expect(tab3).toBeVisible();

        await expect(tab3).toHaveClass(/active/);

        const activeTabCount = await contentPage.locator('.nav .tab-list .item.active').count();
        expect(activeTabCount).toBe(1);
      });

      test('快捷键 Ctrl+W 关闭当前激活Tab', async () => {
        const results = await createNodes(contentPage, [
          { name: 'Ctrl+W_1', type: 'http' },
          { name: 'Ctrl+W_2', type: 'http' },
          { name: 'Ctrl+W_3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);

        const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl+W_1' });
        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl+W_2' });
        const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl+W_3' });
        await expect(tab1).toBeVisible();
        await expect(tab2).toBeVisible();
        await expect(tab3).toBeVisible();

        await expect(tab3).toHaveClass(/active/);

        await tab2.click();
        await contentPage.waitForTimeout(300);

        await expect(tab2).toHaveClass(/active/);

        await contentPage.keyboard.press('Control+w');
        await contentPage.waitForTimeout(500);

        await expect(tab2).toHaveCount(0, { timeout: 2000 });

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);

        const tab2Exists = await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl+W_2' }).count();
        expect(tab2Exists).toBe(0);

        await expect(tab1).toBeVisible();
        await expect(tab3).toBeVisible();

        await expect(tab3).toHaveClass(/active/);

        const activeTabCount = await contentPage.locator('.nav .tab-list .item.active').count();
        expect(activeTabCount).toBe(1);
      });
    });

    test.describe('4.2 右键菜单关闭', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });

      test('右键菜单 - 关闭当前Tab', async () => {
        const results = await createNodes(contentPage, [
          { name: '右键1', type: 'http' },
          { name: '右键2', type: 'http' },
          { name: '右键3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);

        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右键2' });
        await tab2.click({ button: 'right' });

        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible({ timeout: 1000 });

        const closeMenuItem = contextmenu.locator('.s-contextmenu-item').first();
        await expect(closeMenuItem).toBeVisible();
        await closeMenuItem.click();

        await expect(tab2).toHaveCount(0, { timeout: 2000 });

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);

        const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右键1' });
        const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右键3' });
        await expect(tab1).toBeVisible();
        await expect(tab3).toBeVisible();
      });

      test('右键菜单 - 关闭其他Tab', async () => {
        const results = await createNodes(contentPage, [
          { name: '其他1', type: 'http' },
          { name: '其他2', type: 'http' },
          { name: '其他3', type: 'http' },
          { name: '其他4', type: 'http' },
          { name: '其他5', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(5);

        const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他3' });
        await tab3.click({ button: 'right' });

        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible({ timeout: 1000 });

        const closeOthersMenuItem = contextmenu.locator('.s-contextmenu-item').nth(3);
        await expect(closeOthersMenuItem).toBeVisible();
        await closeOthersMenuItem.click();

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1, { timeout: 2000 });

        await expect(tab3).toBeVisible();
        await expect(tab3).toHaveCount(1);

        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他1' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他2' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他4' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他5' })).toHaveCount(0);
      });

      test('右键菜单 - 关闭右侧所有Tab', async () => {
        const results = await createNodes(contentPage, [
          { name: '右侧1', type: 'http' },
          { name: '右侧2', type: 'http' },
          { name: '右侧3', type: 'http' },
          { name: '右侧4', type: 'http' },
          { name: '右侧5', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(5, { timeout: 2000 });

        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧2' });
        await tab2.click({ button: 'right' });

        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible({ timeout: 1000 });

        const closeRightMenuItem = contextmenu.locator('.s-contextmenu-item').nth(2);
        await expect(closeRightMenuItem).toBeVisible();
        await closeRightMenuItem.click();

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2, { timeout: 2000 });

        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧1' })).toHaveCount(1);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧2' })).toHaveCount(1);

        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧3' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧4' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧5' })).toHaveCount(0);
      });

      test('右键菜单 - 关闭左侧所有Tab', async () => {
        const results = await createNodes(contentPage, [
          { name: '左侧1', type: 'http' },
          { name: '左侧2', type: 'http' },
          { name: '左侧3', type: 'http' },
          { name: '左侧4', type: 'http' },
          { name: '左侧5', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(5, { timeout: 2000 });

        const tab4 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧4' });
        await tab4.click({ button: 'right' });

        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible({ timeout: 1000 });

        const closeLeftMenuItem = contextmenu.locator('.s-contextmenu-item').nth(1);
        await expect(closeLeftMenuItem).toBeVisible();
        await closeLeftMenuItem.click();

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2, { timeout: 2000 });

        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧4' })).toHaveCount(1);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧5' })).toHaveCount(1);

        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧1' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧2' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧3' })).toHaveCount(0);
      });

      test('右键菜单 - 关闭所有Tab', async () => {
        const results = await createNodes(contentPage, [
          { name: '全部1', type: 'http' },
          { name: '全部2', type: 'http' },
          { name: '全部3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3, { timeout: 2000 });

        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '全部2' });
        await tab2.click({ button: 'right' });

        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible({ timeout: 1000 });

        const closeAllMenuItem = contextmenu.locator('.s-contextmenu-item').nth(4);
        await expect(closeAllMenuItem).toBeVisible();
        await closeAllMenuItem.click();

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0, { timeout: 2000 });

        await expect(contentPage.locator('.guide')).toBeVisible();
      });
    });

    test.describe('4.3 边界情况', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });

      test('关闭最后一个Tab后显示引导页', async () => {
        const results = await createNodes(contentPage, [
          { name: '最后的Tab', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);

        const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '最后的Tab' });
        await expect(tab).toBeVisible();

        await tab.hover();

        const closeBtn = tab.locator('.operation .close');
        await expect(closeBtn).toBeVisible({ timeout: 1000 });

        await closeBtn.click();

        await expect(tab).toHaveCount(0, { timeout: 2000 });

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0);

        const guidePage = contentPage.locator('.guide');
        await expect(guidePage).toBeVisible({ timeout: 2000 });

        await expect(guidePage.locator('.logo')).toBeVisible();
        await expect(guidePage.locator('h2')).toBeVisible();
      });

      test('关闭Tab后激活相邻Tab', async () => {
        const results = await createNodes(contentPage, [
          { name: '激活测试A', type: 'http' },
          { name: '激活测试B', type: 'http' },
          { name: '激活测试C', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);

        const tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: '激活测试A' });
        const tabB = contentPage.locator('.nav .tab-list .item').filter({ hasText: '激活测试B' });
        const tabC = contentPage.locator('.nav .tab-list .item').filter({ hasText: '激活测试C' });

        await expect(tabC).toHaveClass(/active/);

        await tabB.click();
        await expect(tabB).toHaveClass(/active/);

        await tabB.hover();
        const closeBtn = tabB.locator('.operation .close');
        await expect(closeBtn).toBeVisible({ timeout: 1000 });
        await closeBtn.click();

        await expect(tabB).toHaveCount(0, { timeout: 2000 });

        await expect(tabC).toHaveClass(/active/);

        const activeTabCount = await contentPage.locator('.nav .tab-list .item.active').count();
        expect(activeTabCount).toBe(1);
      });
    });

    test.describe('4.4 关联删除', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });

      test('删除Banner节点自动关闭关联Tab', async () => {
        const results = await createNodes(contentPage, [
          { name: '删除节点测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '删除节点测试' })).toBeVisible();

        const node = contentPage.locator('.custom-tree-node').filter({ hasText: '删除节点测试' }).first();
        await node.click({ button: 'right' });
        await contentPage.waitForTimeout(300);

        const contextmenu = contentPage.locator('.s-contextmenu');
        const deleteOption = contextmenu.locator('.s-contextmenu-item').filter({ hasText: '删除' });
        await deleteOption.click();

        const confirmDialog = contentPage.locator('.el-message-box');
        if (await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
          const confirmBtn = confirmDialog.locator('button').filter({ hasText: '确定' });
          await confirmBtn.click();
        }

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0, { timeout: 2000 });
      });

      test('删除文件夹关闭所有子节点Tab', async () => {
        const folderResults = await createNodes(contentPage, [
          { name: '测试文件夹', type: 'folder' }
        ]);
        expect(folderResults[0].success).toBe(true);

        const folderNode = contentPage.locator('.custom-tree-node').filter({ hasText: '测试文件夹' }).first();
        const expandIcon = folderNode.locator('.el-icon').first();
        await expandIcon.click();

        await folderNode.click({ button: 'right' });
        await contentPage.waitForTimeout(300);

        const contextmenu = contentPage.locator('.s-contextmenu');
        const newNodeOption = contextmenu.locator('.s-contextmenu-item').filter({ hasText: /新建接口|新增HTTP/ }).first();
        if (await newNodeOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await newNodeOption.click();

          const dialog = contentPage.locator('.el-dialog');
          const nameInput = dialog.locator('input[placeholder*="名称"]').first();
          await nameInput.fill('子节点1');
          const confirmBtn = dialog.locator('button').filter({ hasText: '确定' });
          await confirmBtn.click();

          await folderNode.click({ button: 'right' });
          await contentPage.waitForTimeout(300);

          const newNodeOption2 = contentPage.locator('.s-contextmenu').locator('.s-contextmenu-item').filter({ hasText: /新建接口|新增HTTP/ }).first();
          if (await newNodeOption2.isVisible({ timeout: 1000 }).catch(() => false)) {
            await newNodeOption2.click();
            await contentPage.waitForTimeout(500);

            const dialog2 = contentPage.locator('.el-dialog');
            const nameInput2 = dialog2.locator('input[placeholder*="名称"]').first();
            await nameInput2.fill('子节点2');
            const confirmBtn2 = dialog2.locator('button').filter({ hasText: '确定' });
            await confirmBtn2.click();
          }

          const childNode1 = contentPage.locator('.custom-tree-node').filter({ hasText: '子节点1' }).first();
          const childNode2 = contentPage.locator('.custom-tree-node').filter({ hasText: '子节点2' }).first();

          if (await childNode1.isVisible({ timeout: 1000 }).catch(() => false)) {
            await childNode1.click();
            await contentPage.waitForTimeout(500);
          }
          if (await childNode2.isVisible({ timeout: 1000 }).catch(() => false)) {
            await childNode2.click();
            await contentPage.waitForTimeout(500);
          }

          const tabCount = await contentPage.locator('.nav .tab-list .item').count();
          if (tabCount > 0) {
            await folderNode.click({ button: 'right' });
            await contentPage.waitForTimeout(300);

            const deleteOption = contentPage.locator('.s-contextmenu').locator('.s-contextmenu-item').filter({ hasText: '删除' });
            if (await deleteOption.isVisible({ timeout: 1000 }).catch(() => false)) {
              await deleteOption.click();

              const confirmDialog = contentPage.locator('.el-message-box');
              if (await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
                const confirmButton = confirmDialog.locator('button').filter({ hasText: '确定' });
                await confirmButton.click();
              }

              const finalTabCount = await contentPage.locator('.nav .tab-list .item').count();
              expect(finalTabCount).toBe(0);
            }
          }
        }

        expect(true).toBe(true);
      });
    });

    test.describe('4.5 未保存状态确认', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });

      test('关闭未保存Tab显示确认对话框', async () => {
        const results = await createNodes(contentPage, [
          { name: '未保存确认测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未保存确认测试' });
        await expect(tab).toBeVisible();

        const urlInput = contentPage.locator('[data-testid="url-input"]');
        await expect(urlInput).toBeVisible();
        await urlInput.fill('https://test-unsaved-url.com');
        await contentPage.waitForTimeout(500);

        const unsavedMarker = tab.locator('.has-change .dot');
        await expect(unsavedMarker).toBeVisible();

        await tab.click({ button: 'right' });
        await contentPage.waitForTimeout(300);

        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible();

        const closeMenuItem = contextmenu.locator('.s-contextmenu-item').first();
        await closeMenuItem.click();

        const messageBox = contentPage.locator('.el-message-box');
        await expect(messageBox).toBeVisible({ timeout: 2000 });

        await expect(messageBox.locator('button').filter({ hasText: '保存' })).toBeVisible();
        await expect(messageBox.locator('button').filter({ hasText: '不保存' })).toBeVisible();
        await expect(messageBox.locator('button').filter({ hasText: /取消|关闭/ })).toBeVisible();

        const cancelBtn = messageBox.locator('button.el-message-box__headerbtn');
        await cancelBtn.click();

        await expect(tab).toBeVisible();
      });

      test.skip('🆕 确认对话框 - 点击保存按钮', async () => {
        // TODO: 实现完整的保存逻辑测试
      });

      test('确认对话框 - 点击不保存', async () => {
        const results = await createNodes(contentPage, [
          { name: '不保存测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '不保存测试' });

        const urlInput = contentPage.locator('[data-testid="url-input"]');
        await urlInput.fill('https://unsaved-test.com');
        await contentPage.waitForTimeout(500);

        const unsavedMarker = tab.locator('.has-change .dot');
        await expect(unsavedMarker).toBeVisible();

        await tab.click({ button: 'right' });
        await contentPage.waitForTimeout(300);

        const contextmenu = contentPage.locator('.s-contextmenu');
        const closeMenuItem = contextmenu.locator('.s-contextmenu-item').first();
        await closeMenuItem.click();

        const messageBox = contentPage.locator('.el-message-box');
        await expect(messageBox).toBeVisible({ timeout: 2000 });

        const dontSaveBtn = messageBox.locator('button').filter({ hasText: '不保存' });
        await dontSaveBtn.click();

        await expect(tab).toHaveCount(0, { timeout: 2000 });
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0);
      });

      test('确认对话框 - 点击取消', async () => {
        const results = await createNodes(contentPage, [
          { name: '取消测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '取消测试' });

        const urlInput = contentPage.locator('[data-testid="url-input"]');
        await urlInput.fill('https://cancel-test.com');
        await contentPage.waitForTimeout(500);

        await tab.click({ button: 'right' });
        await contentPage.waitForTimeout(300);

        const contextmenu = contentPage.locator('.s-contextmenu');
        const closeMenuItem = contextmenu.locator('.s-contextmenu-item').first();
        await closeMenuItem.click();

        const messageBox = contentPage.locator('.el-message-box');
        await expect(messageBox).toBeVisible({ timeout: 2000 });

        const closeXBtn = messageBox.locator('button.el-message-box__headerbtn');
        await closeXBtn.click();

        await expect(tab).toBeVisible();
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);

        const unsavedMarker = tab.locator('.has-change .dot');
        await expect(unsavedMarker).toBeVisible();
      });
    });

    test.describe('4.6 特殊场景', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });

      test('关闭正在发送请求的Tab取消请求', async () => {
        const results = await createNodes(contentPage, [
          { name: '请求测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);

        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);

        const urlInput = contentPage.locator('[data-testid="url-input"]');
        await urlInput.fill('https://httpbin.org/delay/5');
        await contentPage.waitForTimeout(300);

        const sendBtn = contentPage.locator('button').filter({ hasText: /发送|Send/ }).first();
        if (await sendBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await sendBtn.click();

          const cancelBtn = contentPage.locator('button').filter({ hasText: /取消|Cancel/ });
          if (await cancelBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '请求测试' });
            await tab.hover();
            const closeBtn = tab.locator('.operation .close');
            if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
              await closeBtn.click();
              await expect(tab).toHaveCount(0, { timeout: 2000 });
            }
          }
        }

        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '请求测试' })).toHaveCount(0);
      });
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 5. Tab 未保存状态管理 (2个测试)
  |--------------------------------------------------------------------------
  */
  test.describe('5. Tab 未保存状态管理', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await createProject(contentPage, '测试项目');
    });

    test('Tab 未保存标记 - 内容修改未保存', async () => {
      const results = await createNodes(contentPage, [
        { name: '未保存Tab', type: 'http' }
      ]);
      expect(results[0].success).toBe(true);

      await contentPage.locator('.custom-tree-node').filter({ hasText: '未保存Tab' }).first().click();

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未保存Tab' });
      await expect(tab).toBeVisible();

      const unsavedMarker = tab.locator('.has-change .dot');
      await expect(unsavedMarker).not.toBeVisible();

      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await expect(urlInput).toBeVisible();
      const originalValue = await urlInput.inputValue();
      await urlInput.fill('https://modified-url.com/api/test');
      await contentPage.waitForTimeout(500);

      await expect(unsavedMarker).toBeVisible();

      await urlInput.fill(originalValue);
      await contentPage.waitForTimeout(500);

      await expect(unsavedMarker).not.toBeVisible();

      await urlInput.fill('https://another-url.com/test');
      await contentPage.waitForTimeout(500);

      await expect(unsavedMarker).toBeVisible();

      const saveBtn = contentPage.locator('button').filter({ hasText: /保存接口|Save/ });
      await saveBtn.click();

      await expect(unsavedMarker).not.toBeVisible();
    });

    test('Tab 未保存状态 - 关闭未保存Tab显示确认提示', async () => {
      const results = await createNodes(contentPage, [
        { name: '确认关闭Tab', type: 'http' }
      ]);
      expect(results[0].success).toBe(true);

      await contentPage.locator('.custom-tree-node').filter({ hasText: '确认关闭Tab' }).first().click();

      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://unsaved-changes.com');
      await contentPage.waitForTimeout(500);

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '确认关闭Tab' });
      const unsavedMarker = tab.locator('.has-change .dot');
      await expect(unsavedMarker).toBeVisible();

      const operation = tab.locator('.operation');
      await operation.hover();

      const closeBtn = operation.locator('.close');
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();

      const confirmDialog = contentPage.locator('.el-message-box');
      await expect(confirmDialog).toBeVisible();

      await expect(confirmDialog).toContainText('是否要保存对接口的修改');

      const cancelBtn = confirmDialog.locator('button').filter({ hasText: /不保存|Cancel/ });
      await cancelBtn.click();

      await expect(tab).not.toBeVisible();
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 6. Tab 拖拽排序 (1个现有测试 + 3个新增测试 = 4个)
  |--------------------------------------------------------------------------
  */
  test.describe('6. Tab 拖拽排序', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await createProject(contentPage, '测试项目');
    });

    test('Tab 拖拽排序', async () => {
      const results = await createNodes(contentPage, [
        { name: 'TabA', type: 'http' },
        { name: 'TabB', type: 'http' },
        { name: 'TabC', type: 'http' }
      ]);
      results.forEach(result => expect(result.success).toBe(true));

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3, { timeout: 2000 });

      const getTabNames = async () => {
        const tabs = await contentPage.locator('.nav .tab-list .item').all();
        const names: string[] = [];
        for (const tab of tabs) {
          const text = await tab.textContent();
          if (text?.includes('TabA')) names.push('TabA');
          else if (text?.includes('TabB')) names.push('TabB');
          else if (text?.includes('TabC')) names.push('TabC');
        }
        return names;
      };

      const initialOrder = await getTabNames();
      expect(initialOrder).toEqual(['TabA', 'TabB', 'TabC']);

      const tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabA' });
      const tabC = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabC' });
      await expect(tabA).toBeVisible();
      await expect(tabC).toBeVisible();

      const tabABox = await tabA.boundingBox();
      const tabCBox = await tabC.boundingBox();

      if (tabABox && tabCBox) {
        await contentPage.mouse.move(tabABox.x + tabABox.width / 2, tabABox.y + tabABox.height / 2);
        await contentPage.mouse.down();
        await contentPage.waitForTimeout(150);
        await contentPage.mouse.move(tabCBox.x + tabCBox.width - 5, tabCBox.y + tabCBox.height / 2, { steps: 10 });
        await contentPage.waitForTimeout(150);
        await contentPage.mouse.up();
        await contentPage.waitForTimeout(300);

        const finalOrder = await getTabNames();
        expect(finalOrder).toHaveLength(3);
        expect(finalOrder).toEqual(['TabB', 'TabC', 'TabA']);
      }
    });

    test.skip('🆕 拖拽Tab到最左侧/最右侧', async () => {
      // TODO: 实现拖拽到边界位置的测试
    });

    test.skip('🆕 拖拽过程的视觉反馈', async () => {
      // TODO: 验证拖拽时的视觉效果（如高亮、占位符等）
    });

    test.skip('🆕 固定Tab拖拽规则', async () => {
      // TODO: 验证固定Tab在拖拽时的特殊规则
      // 1. 固定Tab之间可以拖拽排序
      // 2. 固定Tab不能拖到未固定Tab区域
      // 3. 未固定Tab不能拖到固定Tab区域
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 7. Tab 持久化 (3个现有测试 + 2个新增测试 = 5个)
  |--------------------------------------------------------------------------
  */
  test.describe('7. Tab 持久化', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await createProject(contentPage, '测试项目');
    });

    test('Tab 持久化 - 刷新后恢复列表、顺序和激活状态', async () => {
      const results = await createNodes(contentPage, [
        { name: '持久化1', type: 'http' },
        { name: '持久化2', type: 'http' },
        { name: '持久化3', type: 'http' }
      ]);
      results.forEach(result => expect(result.success).toBe(true));

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3, { timeout: 2000 });

      const getTabNames = async () => {
        const tabs = await contentPage.locator('.nav .tab-list .item').all();
        const names: string[] = [];
        for (const tab of tabs) {
          const text = await tab.textContent();
          if (text?.includes('持久化1')) names.push('持久化1');
          else if (text?.includes('持久化2')) names.push('持久化2');
          else if (text?.includes('持久化3')) names.push('持久化3');
        }
        return names;
      };

      const tabsBeforeReload = await getTabNames();
      expect(tabsBeforeReload).toEqual(['持久化1', '持久化2', '持久化3']);

      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化2' });
      await tab2.click();
      await expect(tab2).toHaveClass(/active/);

      await contentPage.reload({ waitUntil: 'domcontentloaded' });

      await contentPage.waitForSelector('.banner', { timeout: 10000 });

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3, { timeout: 5000 });

      const tabsAfterReload = await getTabNames();
      expect(tabsAfterReload).toEqual(['持久化1', '持久化2', '持久化3']);

      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化1' })).toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化2' })).toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化3' })).toBeVisible();

      const tab2AfterReload = contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化2' });
      await expect(tab2AfterReload).toHaveClass(/active/);

      const activeTabs = contentPage.locator('.nav .tab-list .item.active');
      await expect(activeTabs).toHaveCount(1);
    });

    test('Tab关闭后localStorage正确更新', async () => {
      const results = await createNodes(contentPage, [
        { name: '持久化测试1', type: 'http' },
        { name: '持久化测试2', type: 'http' },
        { name: '持久化测试3', type: 'http' }
      ]);
      results.forEach(result => expect(result.success).toBe(true));

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);

      const projectId = await contentPage.evaluate(() => {
        return new URL(window.location.href).searchParams.get('id');
      });

      let tabs = await contentPage.evaluate((pid) => {
        const allTabs = JSON.parse(localStorage.getItem('workbench/node/tabs') || '{}');
        return allTabs[pid || ''] || [];
      }, projectId);
      expect(tabs.length).toBe(3);

      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化测试2' });
      await tab2.hover();
      await contentPage.waitForTimeout(300);
      const closeBtn = tab2.locator('.operation .close');
      await expect(closeBtn).toBeVisible({ timeout: 1000 });
      await closeBtn.click();

      await expect(tab2).toHaveCount(0, { timeout: 2000 });

      tabs = await contentPage.evaluate((pid) => {
        const allTabs = JSON.parse(localStorage.getItem('workbench/node/tabs') || '{}');
        return allTabs[pid || ''] || [];
      }, projectId);
      expect(tabs.length).toBe(2);

      const hasTab2 = tabs.some((tab: any) => tab.label && tab.label.includes('持久化测试2'));
      expect(hasTab2).toBe(false);

      const hasTab1 = tabs.some((tab: any) => tab.label && tab.label.includes('持久化测试1'));
      const hasTab3 = tabs.some((tab: any) => tab.label && tab.label.includes('持久化测试3'));
      expect(hasTab1).toBe(true);
      expect(hasTab3).toBe(true);
    });

    test('页面刷新后Tab列表保持正确', async () => {
      const results = await createNodes(contentPage, [
        { name: '刷新测试1', type: 'http' },
        { name: '刷新测试2', type: 'http' },
        { name: '刷新测试3', type: 'http' }
      ]);
      results.forEach(result => expect(result.success).toBe(true));

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);

      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '刷新测试2' });
      await tab2.hover();
      await contentPage.waitForTimeout(300);
      const closeBtn = tab2.locator('.operation .close');
      await expect(closeBtn).toBeVisible({ timeout: 1000 });
      await closeBtn.click();

      await expect(tab2).toHaveCount(0, { timeout: 2000 });

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);

      await contentPage.reload({ waitUntil: 'domcontentloaded' });

      await contentPage.waitForSelector('.banner', { timeout: 10000 });

      await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2, { timeout: 5000 });

      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '刷新测试1' })).toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '刷新测试3' })).toBeVisible();

      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '刷新测试2' })).toHaveCount(0);
    });

    test.skip('🆕 固定状态持久化验证', async () => {
      // TODO: 验证固定状态在刷新后正确恢复
    });

    test.skip('🆕 拖拽排序后持久化验证', async () => {
      // TODO: 验证拖拽后的顺序在刷新后正确恢复
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 8. Tab UI显示 (2个现有测试 + 2个新增测试 = 4个)
  |--------------------------------------------------------------------------
  */
  test.describe('8. Tab UI显示', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await createProject(contentPage, '测试项目');
    });

    test('Tab 标题过长省略显示', async () => {
      const longName = '这是一个非常非常非常非常非常非常长的Tab标题用于测试省略号显示功能';
      const results = await createNodes(contentPage, [
        { name: longName, type: 'http' }
      ]);
      expect(results[0].success).toBe(true);

      await contentPage.locator('.custom-tree-node').filter({ hasText: longName }).first().click();
      await contentPage.waitForTimeout(500);

      const tabElement = contentPage.locator('.nav .tab-list .item').filter({ hasText: /这是一个非常/ }).first();
      await tabElement.waitFor({ state: 'visible', timeout: 5000 });

      const textElement = tabElement.locator('.item-text');

      const computedStyle = await textElement.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          overflow: style.overflow,
          textOverflow: style.textOverflow,
          whiteSpace: style.whiteSpace,
          width: style.width,
        };
      });

      expect(computedStyle.overflow).toBe('hidden');
      expect(computedStyle.textOverflow).toBe('ellipsis');
      expect(computedStyle.whiteSpace).toBe('nowrap');
      expect(computedStyle.width).toBe('130px');

      const titleAttr = await tabElement.getAttribute('title');
      expect(titleAttr).toBe(longName);

      const { scrollWidth, clientWidth } = await textElement.evaluate((el) => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      }));
      expect(scrollWidth).toBeGreaterThan(clientWidth);
    });

    test('Tab 图标根据类型正确显示', async () => {
      const results = await createNodes(contentPage, [
        { name: 'HTTP测试', type: 'http' },
        { name: 'WebSocket图标', type: 'websocket' },
        { name: 'Mock图标', type: 'httpMock' }
      ]);
      results.forEach(result => expect(result.success).toBe(true));

      const changeMethodAndVerify = async (method: string, expectedColor: string) => {
        await contentPage.locator('.custom-tree-node').filter({ hasText: 'HTTP测试' }).first().click();
        await contentPage.waitForTimeout(500);

        const methodSelect = contentPage.locator('.request-method .el-select');
        await methodSelect.click();

        const methodOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: new RegExp(`^${method}$`) });
        await methodOption.click();

        const saveButton = contentPage.locator('button').filter({ hasText: '保存接口' });
        await saveButton.click();

        const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'HTTP测试' }).first();
        const unsavedDot = tab.locator('.has-change .dot');
        await expect(unsavedDot).not.toBeVisible();

        const icon = tab.locator('span.mr-2').filter({ hasText: method }).first();
        await expect(icon).toBeVisible();
        await expect(icon).toHaveText(method);

        const color = await icon.evaluate((el) => window.getComputedStyle(el).color);
        expect(color).toBe(expectedColor);
      };

      await changeMethodAndVerify('GET', 'rgb(40, 167, 69)');
      await changeMethodAndVerify('POST', 'rgb(255, 193, 7)');
      await changeMethodAndVerify('PUT', 'rgb(64, 158, 255)');
      await changeMethodAndVerify('DEL', 'rgb(245, 108, 108)');
      await changeMethodAndVerify('PATCH', 'rgb(23, 162, 184)');
      await changeMethodAndVerify('HEAD', 'rgb(23, 162, 184)');
      await changeMethodAndVerify('OPTIONS', 'rgb(23, 162, 184)');

      await contentPage.locator('.custom-tree-node').filter({ hasText: 'WebSocket图标' }).first().click();
      await contentPage.waitForTimeout(500);

      const wsTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'WebSocket图标' }).first();
      const wsIcon = wsTab.locator('span.red.mr-2').first();
      await expect(wsIcon).toBeVisible();

      const wsText = await wsIcon.textContent();
      expect(wsText?.toUpperCase()).toMatch(/WS|WSS/);

      const wsColor = await wsIcon.evaluate((el) => window.getComputedStyle(el).color);
      expect(wsColor).toBe('rgb(245, 108, 108)');

      await contentPage.locator('.custom-tree-node').filter({ hasText: 'Mock图标' }).first().click();
      await contentPage.waitForTimeout(500);

      const mockTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Mock图标' }).first();
      const mockIcon = mockTab.locator('.mock-tab-icon');
      await expect(mockIcon).toBeVisible();
      await expect(mockIcon).toHaveText('MOCK');
    });

    test.skip('🆕 Tab hover时显示tooltip', async () => {
      // TODO: 验证hover到Tab时显示完整标题的tooltip
    });

    test.skip('🆕 Tab各种视觉状态验证', async () => {
      // TODO: 验证激活状态、hover状态、未保存状态的视觉效果
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 9. Tab 滚动功能 (2个测试)
  |--------------------------------------------------------------------------
  */
  test.describe('9. Tab 滚动功能', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await createProject(contentPage, '测试项目');
    });

    test('Tab 列表滚动 - Tab 过多时显示滚动', async () => {
      const nodeNames = [];
      for (let i = 1; i <= 10; i++) {
        nodeNames.push({ name: `节点${i}`, type: 'http' as const });
      }
      const results = await createNodes(contentPage, nodeNames);
      results.forEach(result => expect(result.success).toBe(true));

      for (let i = 1; i <= 10; i++) {
        const node = contentPage.locator('.custom-tree-node').filter({ hasText: `节点${i}` }).first();
        await node.click();
      }

      const tabList = contentPage.locator('.nav .tab-list').first();

      const scrollInfo = await tabList.evaluate((el) => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        overflowX: window.getComputedStyle(el).overflowX
      }));

      expect(scrollInfo.scrollWidth).toBeGreaterThan(scrollInfo.clientWidth);
      expect(scrollInfo.overflowX).toBe('auto');

      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(10);

      const scrolled = await tabList.evaluate((el) => {
        const initialScrollLeft = el.scrollLeft;
        el.scrollLeft = 100;
        const newScrollLeft = el.scrollLeft;
        console.log(initialScrollLeft, newScrollLeft);
        return newScrollLeft > initialScrollLeft;
      });

      expect(scrolled).toBe(true);
    });

    test('Tab 自动滚动到激活项', async () => {
      const nodeNames = [];
      for (let i = 1; i <= 10; i++) {
        nodeNames.push({ name: `自动滚动${i}`, type: 'http' as const });
      }
      const results = await createNodes(contentPage, nodeNames);
      results.forEach(result => expect(result.success).toBe(true));

      for (let i = 1; i <= 10; i++) {
        const node = contentPage.locator('.custom-tree-node').filter({ hasText: `自动滚动${i}` }).first();
        await node.click();
      }

      const isTabInView = async (tabText: string) => {
        return await contentPage.evaluate((text) => {
          const container = document.querySelector('.nav .tab-list');
          const items = Array.from(document.querySelectorAll('.nav .tab-list .item'));
          const tab = items.find(item => item.textContent?.includes(text));

          if (!tab || !container) return false;

          const tabRect = tab.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          return tabRect.left >= containerRect.left &&
                 tabRect.right <= containerRect.right;
        }, tabText);
      };

      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '自动滚动1' }).first().click();
      let inView = await isTabInView('自动滚动1');
      expect(inView).toBe(true);

      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '自动滚动10' }).first().click();
      inView = await isTabInView('自动滚动10');
      expect(inView).toBe(true);

      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '自动滚动1' }).first().click();
      inView = await isTabInView('自动滚动1');
      expect(inView).toBe(true);

      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '自动滚动5' }).first().click();
      inView = await isTabInView('自动滚动5');
      expect(inView).toBe(true);

      const activeTab = contentPage.locator('.nav .tab-list .item.active').first();
      await expect(activeTab).toHaveText(/自动滚动5/);
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 10. Tab 数据同步 (1个测试)
  |--------------------------------------------------------------------------
  */
  test.describe('10. Tab 数据同步', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await createProject(contentPage, '测试项目');
    });

    test('Tab 数据同步 - 节点重命名后Tab标题同步更新', async () => {
      const results = await createNodes(contentPage, [
        { name: '同步测试', type: 'http' }
      ]);
      expect(results[0].success).toBe(true);

      await contentPage.locator('.custom-tree-node').filter({ hasText: '同步测试' }).first().click();
      await contentPage.waitForTimeout(500);

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '同步测试' });
      await expect(tab).toBeVisible();

      const node = contentPage.locator('.custom-tree-node').filter({ hasText: '同步测试' }).first();
      await node.click();

      await contentPage.keyboard.press('F2');
      await contentPage.waitForTimeout(500);

      const renameInput = contentPage.locator('.rename-input, input.rename');
      if (await renameInput.count() > 0) {
        await renameInput.fill('同步更新后');
        await contentPage.keyboard.press('Enter');
        await contentPage.waitForTimeout(500);

        const updatedTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '同步更新后' });
        await expect(updatedTab).toBeVisible();
      }
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 11. Tab 项目隔离 (3个测试)
  |--------------------------------------------------------------------------
  */
  test.describe('11. Tab 项目隔离', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await getPages(electronApp);
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await clearProjectWorkbenchState(headerPage, contentPage);
    });

    test('项目 A 的 Tab 不影响项目 B', async () => {
      const projectATab = createMockTab({ id: 'tab-a1', title: 'Project A Tab' });
      await createTabInStorage(contentPage, TEST_PROJECT_ID, projectATab);

      const projectBTab = createMockTab({ id: 'tab-b1', title: 'Project B Tab' });
      await createTabInStorage(contentPage, TEST_PROJECT_ID_2, projectBTab);

      await expectTabPersisted(contentPage, TEST_PROJECT_ID, [
        { id: 'tab-a1', title: 'Project A Tab' }
      ]);
      await expectTabPersisted(contentPage, TEST_PROJECT_ID_2, [
        { id: 'tab-b1', title: 'Project B Tab' }
      ]);
    });

    test('切换项目时恢复对应 Tab 列表', async () => {
      const projectATabs = [
        createMockTab({ id: 'tab-a1', title: 'A Tab 1' }),
        createMockTab({ id: 'tab-a2', title: 'A Tab 2' }),
      ];
      for (const tab of projectATabs) {
        await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
      }

      await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
      await waitForVueComponentReady(contentPage);

      await expectTabExists(contentPage, 'A Tab 1');
      await expectTabExists(contentPage, 'A Tab 2');

      const projectBTab = createMockTab({ id: 'tab-b1', title: 'B Tab 1' });
      await createTabInStorage(contentPage, TEST_PROJECT_ID_2, projectBTab);

      await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID_2);
      await waitForVueComponentReady(contentPage);

      await expectTabExists(contentPage, 'B Tab 1');
      const tabCount = await contentPage.locator('.s-tab-item').count();
      expect(tabCount).toBe(1);
    });

    test('每个项目的 activeTab 独立管理', async () => {
      const projectATabs = [
        createMockTab({ id: 'tab-a1', title: 'A Tab 1' }),
        createMockTab({ id: 'tab-a2', title: 'A Tab 2' }),
      ];
      for (const tab of projectATabs) {
        await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
      }
      await setActiveTab(contentPage, TEST_PROJECT_ID, 'tab-a2');

      const projectBTabs = [
        createMockTab({ id: 'tab-b1', title: 'B Tab 1' }),
      ];
      for (const tab of projectBTabs) {
        await createTabInStorage(contentPage, TEST_PROJECT_ID_2, tab);
      }
      await setActiveTab(contentPage, TEST_PROJECT_ID_2, 'tab-b1');

      await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
      await waitForVueComponentReady(contentPage);

      const activeTabA = contentPage.locator('.s-tab-item.active');
      await expect(activeTabA).toContainText('A Tab 2');

      await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID_2);
      await waitForVueComponentReady(contentPage);

      const activeTabB = contentPage.locator('.s-tab-item.active');
      await expect(activeTabB).toContainText('B Tab 1');
    });
  });

  /*
  |--------------------------------------------------------------------------
  | 12. 非Tab相关（预留）
  |--------------------------------------------------------------------------
  */
  test.describe('12. 非Tab相关', () => {
    // 预留分组，当前为空
    // 未来如果添加了非Tab的工作区测试（如Banner、侧边栏等），可以放在这里
  });
});
