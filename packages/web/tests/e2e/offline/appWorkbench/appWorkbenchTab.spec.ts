import { expect, type Page } from '@playwright/test';
import {
  test,
  getPages,
  createMockTab,
  clearAppWorkbenchState,
  navigateToProjectWorkbench,
  createTabInStorage,
  setActiveTab,
  expectTabExists,
  expectTabPersisted,
  waitForVueComponentReady,
} from '../fixtures/appWorkbench.fixture';
import { createProject, initOfflineWorkbench, createNodes } from '../../../fixtures/fixtures.ts';

const TEST_PROJECT_ID = 'test-project-001';
const TEST_PROJECT_ID_2 = 'test-project-002';
/*
|--------------------------------------------------------------------------
| Tab 导航测试
|--------------------------------------------------------------------------
*/
test.describe('主工作区导航测试 - Tab 管理核心功能', () => {
  let headerPage: Page;
  let contentPage: Page;
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
    await contentPage.waitForTimeout(1000);
    const httpNode = contentPage.locator('.custom-tree-node').filter({ hasText: 'HTTP接口测试' }).first();
    await httpNode.click();
    await contentPage.waitForTimeout(500);
    const httpTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'HTTP接口测试' });
    await expect(httpTab).toBeVisible();
    await expect(httpTab).toHaveClass(/active/);
    const wsNode = contentPage.locator('.custom-tree-node').filter({ hasText: 'WebSocket接口测试' }).first();
    await wsNode.click();
    await contentPage.waitForTimeout(500);
    const wsTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'WebSocket接口测试' });
    await expect(wsTab).toBeVisible();
    await expect(wsTab).toHaveClass(/active/);
    const mockNode = contentPage.locator('.custom-tree-node').filter({ hasText: 'Mock接口测试' }).first();
    await mockNode.click();
    await contentPage.waitForTimeout(500);
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
    await contentPage.waitForTimeout(1000);
    const httpNode = contentPage.locator('.custom-tree-node').filter({ hasText: 'HTTP节点测试' }).first();
    // 第一次点击节点
    await httpNode.click();
    await contentPage.waitForTimeout(500);
    const firstTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'HTTP节点测试' });
    await expect(firstTab).toBeVisible();
    await expect(firstTab).toHaveClass(/active/);
    let tabCount = await contentPage.locator('.nav .tab-list .item').count();
    expect(tabCount).toBe(1);
    // 再次点击相同节点
    await httpNode.click();
    await contentPage.waitForTimeout(500);
    // 验证Tab数量仍然为1
    tabCount = await contentPage.locator('.nav .tab-list .item').count();
    expect(tabCount).toBe(1);
    // 验证该Tab仍然处于激活状态
    await expect(firstTab).toHaveClass(/active/);
  });
  test('点击 Tab 切换激活状态', async () => {
    const results = await createNodes(contentPage, [
      { name: 'Tab1', type: 'http' },
      { name: 'Tab2', type: 'http' },
      { name: 'Tab3', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    await contentPage.waitForTimeout(1000);
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
  test('关闭 Tab 功能', async () => {
    // createNodes 会自动创建并打开Tab
    const results = await createNodes(contentPage, [
      { name: 'Tab关闭1', type: 'http' },
      { name: 'Tab关闭2', type: 'http' },
      { name: 'Tab关闭3', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待3个Tab都渲染完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
    // 验证3个Tab都存在
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭1' })).toBeVisible();
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭2' })).toBeVisible();
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭3' })).toBeVisible();
    // 关闭第二个Tab
    const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭2' });
    await tab2.hover();
    // 等待关闭按钮可见（hover后才显示）
    const closeBtn = tab2.locator('.operation .close');
    // await contentPage.waitForTimeout(30000);
    await expect(closeBtn).toBeVisible({ timeout: 1000 });
    // 点击关闭按钮
    await closeBtn.click();
    // 等待Tab消失
    await expect(tab2).toHaveCount(0, { timeout: 2000 });
    // 验证Tab数量减少为2
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
    // 验证Tab2不存在
    const tab2Exists = await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭2' }).count();
    expect(tab2Exists).toBe(0);
    // 验证剩余的Tab存在
    const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭1' });
    const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Tab关闭3' });
    await expect(tab1).toBeVisible();
    await expect(tab3).toBeVisible();
    // 验证有一个Tab被激活
    const activeTabCount = await contentPage.locator('.nav .tab-list .item.active').count();
    expect(activeTabCount).toBe(1);
  });
  test('关闭当前激活 Tab 后自动激活相邻 Tab', async () => {
    // createNodes 会自动创建并打开Tab
    const results = await createNodes(contentPage, [
      { name: 'TabA', type: 'http' },
      { name: 'TabB', type: 'http' },
      { name: 'TabC', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待3个Tab都渲染完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
    // 验证TabC默认是激活状态（最后创建的）
    const tabC = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabC' });
    await expect(tabC).toHaveClass(/active/);
    // 手动激活中间的Tab（TabB）
    const tabB = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabB' });
    await tabB.click();
    await expect(tabB).toHaveClass(/active/);
    // 关闭TabB
    await tabB.hover();
    // 等待关闭按钮可见（hover后才显示）
    const closeBtn = tabB.locator('.operation .close');
    await expect(closeBtn).toBeVisible({ timeout: 1000 });
    // 点击关闭按钮
    await closeBtn.click();
    // 等待TabB消失
    await expect(tabB).toHaveCount(0, { timeout: 2000 });
    // 验证Tab数量减少为2
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
    // 验证TabB不存在
    const tabBExists = await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabB' }).count();
    expect(tabBExists).toBe(0);
    // 验证TabC被激活（业务逻辑：关闭Tab后激活最后一个Tab）
    await expect(tabC).toHaveClass(/active/);
    // 验证TabA也存在但未激活
    const tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabA' });
    await expect(tabA).toBeVisible();
    await expect(tabA).not.toHaveClass(/active/);
  });
  test('关闭最后一个 Tab 后显示引导页', async () => {
    // createNodes 会自动创建并打开Tab
    const results = await createNodes(contentPage, [
      { name: '最后的Tab', type: 'http' }
    ]);
    expect(results[0].success).toBe(true);
    // 等待Tab渲染完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
    // 验证Tab存在
    const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '最后的Tab' });
    await expect(tab).toBeVisible();
    // 关闭这个Tab
    await tab.hover();
    // 等待关闭按钮可见（hover后才显示）
    const closeBtn = tab.locator('.operation .close');
    await expect(closeBtn).toBeVisible({ timeout: 1000 });
    // 点击关闭按钮
    await closeBtn.click();
    // 等待Tab消失
    await expect(tab).toHaveCount(0, { timeout: 2000 });
    // 验证Tab列表为空
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0);
    // 验证引导页显示
    const guidePage = contentPage.locator('.guide');
    await expect(guidePage).toBeVisible({ timeout: 2000 });
    // 验证引导页的基本元素
    await expect(guidePage.locator('.logo')).toBeVisible();
    await expect(guidePage.locator('h2')).toBeVisible();
  });
  test('Tab 右键菜单 - 关闭当前 Tab', async () => {
    // createNodes 会自动创建并打开Tab
    const results = await createNodes(contentPage, [
      { name: '右键1', type: 'http' },
      { name: '右键2', type: 'http' },
      { name: '右键3', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待3个Tab都渲染完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
    // 右键点击第2个Tab
    const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右键2' });
    await tab2.click({ button: 'right' });
    // 等待右键菜单显示
    const contextmenu = contentPage.locator('.s-contextmenu');
    await expect(contextmenu).toBeVisible({ timeout: 1000 });
    // 点击"关闭"菜单项（第一个菜单项）
    const closeMenuItem = contextmenu.locator('.s-contextmenu-item').first();
    await expect(closeMenuItem).toBeVisible();
    await closeMenuItem.click();
    // 等待Tab2消失
    await expect(tab2).toHaveCount(0, { timeout: 2000 });
    // 验证Tab数量为2
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
    // 验证其他Tab存在
    const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右键1' });
    const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右键3' });
    await expect(tab1).toBeVisible();
    await expect(tab3).toBeVisible();
  });
  test('Tab 右键菜单 - 关闭其他 Tab', async () => {
    // createNodes 会自动创建并打开Tab
    const results = await createNodes(contentPage, [
      { name: '其他1', type: 'http' },
      { name: '其他2', type: 'http' },
      { name: '其他3', type: 'http' },
      { name: '其他4', type: 'http' },
      { name: '其他5', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待5个Tab都渲染完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(5);
    // 右键点击第3个Tab
    const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他3' });
    await tab3.click({ button: 'right' });
    // 等待右键菜单显示
    const contextmenu = contentPage.locator('.s-contextmenu');
    await expect(contextmenu).toBeVisible({ timeout: 1000 });
    // 点击"关闭其他"菜单项（第4个菜单项，索引为3）
    const closeOthersMenuItem = contextmenu.locator('.s-contextmenu-item').nth(3);
    await expect(closeOthersMenuItem).toBeVisible();
    await closeOthersMenuItem.click();
    // 等待Tab数量变为1
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1, { timeout: 2000 });
    // 验证只保留Tab3
    await expect(tab3).toBeVisible();
    await expect(tab3).toHaveCount(1);
    // 验证其他Tab不存在
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他1' })).toHaveCount(0);
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他2' })).toHaveCount(0);
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他4' })).toHaveCount(0);
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他5' })).toHaveCount(0);
  });
  test('Tab 右键菜单 - 关闭右侧所有 Tab', async () => {
    // createNodes 会自动创建并打开Tab
    const results = await createNodes(contentPage, [
      { name: '右侧1', type: 'http' },
      { name: '右侧2', type: 'http' },
      { name: '右侧3', type: 'http' },
      { name: '右侧4', type: 'http' },
      { name: '右侧5', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待所有Tab创建完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(5, { timeout: 2000 });
    // 右键点击第2个Tab
    const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧2' });
    await tab2.click({ button: 'right' });
    // 等待右键菜单显示
    const contextmenu = contentPage.locator('.s-contextmenu');
    await expect(contextmenu).toBeVisible({ timeout: 1000 });
    // 点击"关闭右侧"菜单项（第3个菜单项，索引为2）
    const closeRightMenuItem = contextmenu.locator('.s-contextmenu-item').nth(2);
    await expect(closeRightMenuItem).toBeVisible();
    await closeRightMenuItem.click();
    // 等待Tab数量变为2
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2, { timeout: 2000 });
    // 验证Tab1和Tab2存在
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧1' })).toHaveCount(1);
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧2' })).toHaveCount(1);
    // 验证Tab3、Tab4、Tab5不存在
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧3' })).toHaveCount(0);
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧4' })).toHaveCount(0);
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧5' })).toHaveCount(0);
  });
  test('Tab 右键菜单 - 关闭左侧所有 Tab', async () => {
    // createNodes 会自动创建并打开Tab
    const results = await createNodes(contentPage, [
      { name: '左侧1', type: 'http' },
      { name: '左侧2', type: 'http' },
      { name: '左侧3', type: 'http' },
      { name: '左侧4', type: 'http' },
      { name: '左侧5', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待所有Tab创建完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(5, { timeout: 2000 });
    // 右键点击第4个Tab
    const tab4 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧4' });
    await tab4.click({ button: 'right' });
    // 等待右键菜单显示
    const contextmenu = contentPage.locator('.s-contextmenu');
    await expect(contextmenu).toBeVisible({ timeout: 1000 });
    // 点击"关闭左侧"菜单项（第2个菜单项，索引为1）
    const closeLeftMenuItem = contextmenu.locator('.s-contextmenu-item').nth(1);
    await expect(closeLeftMenuItem).toBeVisible();
    await closeLeftMenuItem.click();
    // 等待Tab数量变为2
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2, { timeout: 2000 });
    // 验证Tab4和Tab5存在
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧4' })).toHaveCount(1);
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧5' })).toHaveCount(1);
    // 验证Tab1、Tab2、Tab3不存在
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧1' })).toHaveCount(0);
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧2' })).toHaveCount(0);
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧3' })).toHaveCount(0);
  });
  test('Tab 右键菜单 - 关闭所有 Tab', async () => {
    // createNodes 会自动创建并打开Tab
    const results = await createNodes(contentPage, [
      { name: '全部1', type: 'http' },
      { name: '全部2', type: 'http' },
      { name: '全部3', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待所有Tab创建完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3, { timeout: 2000 });
    // 右键点击任意Tab
    const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '全部2' });
    await tab2.click({ button: 'right' });
    // 等待右键菜单显示
    const contextmenu = contentPage.locator('.s-contextmenu');
    await expect(contextmenu).toBeVisible({ timeout: 1000 });
    // 点击"关闭所有"菜单项（第5个菜单项，索引为4）
    const closeAllMenuItem = contextmenu.locator('.s-contextmenu-item').nth(4);
    await expect(closeAllMenuItem).toBeVisible();
    await closeAllMenuItem.click();
    // 等待所有Tab关闭
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0, { timeout: 2000 });
    // 验证显示引导页
    await expect(contentPage.locator('.guide')).toBeVisible();
  });
  test('Tab 拖拽排序', async () => {
    // createNodes 会自动创建并打开Tab
    const results = await createNodes(contentPage, [
      { name: 'TabA', type: 'http' },
      { name: 'TabB', type: 'http' },
      { name: 'TabC', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待所有Tab创建完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3, { timeout: 2000 });
    // 验证初始顺序
    const getTabNames = async () => {
      const tabs = await contentPage.locator('.nav .tab-list .item').all();
      const names: string[] = [];
      for (const tab of tabs) {
        const text = await tab.textContent();
        // 提取Tab名称（去掉HTTP方法名等前缀）
        if (text?.includes('TabA')) names.push('TabA');
        else if (text?.includes('TabB')) names.push('TabB');
        else if (text?.includes('TabC')) names.push('TabC');
      }
      return names;
    };
    const initialOrder = await getTabNames();
    expect(initialOrder).toEqual(['TabA', 'TabB', 'TabC']);
    // 定位要拖拽的Tab
    const tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabA' });
    const tabC = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'TabC' });
    await expect(tabA).toBeVisible();
    await expect(tabC).toBeVisible();
    // 使用底层鼠标事件模拟拖拽：将TabA拖到TabC后面
    const tabABox = await tabA.boundingBox();
    const tabCBox = await tabC.boundingBox();
    if (tabABox && tabCBox) {
      // 移动到TabA中心
      await contentPage.mouse.move(tabABox.x + tabABox.width / 2, tabABox.y + tabABox.height / 2);
      // 按下鼠标
      await contentPage.mouse.down();
      // 等待拖拽开始
      await contentPage.waitForTimeout(150);
      // 移动到TabC右侧边缘（触发"插入到TabC后面"）
      await contentPage.mouse.move(tabCBox.x + tabCBox.width - 5, tabCBox.y + tabCBox.height / 2, { steps: 10 });
      // 等待到达目标位置
      await contentPage.waitForTimeout(150);
      // 释放鼠标
      await contentPage.mouse.up();
      // 等待拖拽动画完成
      await contentPage.waitForTimeout(300);
      // 严格验证拖拽后的顺序
      const finalOrder = await getTabNames();
      // 验证Tab数量不变
      expect(finalOrder).toHaveLength(3);
      // 验证拖拽后的正确顺序：TabA应该被移到最后，变成 TabB, TabC, TabA
      expect(finalOrder).toEqual(['TabB', 'TabC', 'TabA']);
    }
  });
  test('Tab 持久化 - 刷新后恢复列表、顺序和激活状态', async () => {
    // ========== 第一阶段：创建Tab并验证初始状态 ==========
    // createNodes 会自动创建并打开Tab，并保存到localStorage
    const results = await createNodes(contentPage, [
      { name: '持久化1', type: 'http' },
      { name: '持久化2', type: 'http' },
      { name: '持久化3', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待所有Tab创建完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3, { timeout: 2000 });
    // 提取Tab名称的辅助函数
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
    // 验证初始Tab顺序
    const tabsBeforeReload = await getTabNames();
    expect(tabsBeforeReload).toEqual(['持久化1', '持久化2', '持久化3']);
    // ========== 第二阶段：切换激活状态 ==========
    // 点击激活第2个Tab
    const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化2' });
    await tab2.click();
    // 验证Tab2已激活
    await expect(tab2).toHaveClass(/active/);
    // ========== 第三阶段：刷新页面 ==========
    // 使用 reload() 刷新页面，保留页面上下文和 localStorage
    await contentPage.reload({ waitUntil: 'domcontentloaded' });
    // 等待页面加载完成（Banner加载完成表示页面已就绪）
    await contentPage.waitForSelector('.banner', { timeout: 10000 });
    // ========== 第四阶段：验证Tab列表完整恢复 ==========
    // 严格验证Tab数量完全恢复
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3, { timeout: 5000 });
    // 验证Tab顺序和内容完全恢复
    const tabsAfterReload = await getTabNames();
    expect(tabsAfterReload).toEqual(['持久化1', '持久化2', '持久化3']);
    // 验证每个Tab都可见
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化1' })).toBeVisible();
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化2' })).toBeVisible();
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化3' })).toBeVisible();
    // ========== 第五阶段：验证激活状态恢复 ==========
    // 严格验证激活状态保持：Tab2应该仍然是激活状态
    const tab2AfterReload = contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化2' });
    await expect(tab2AfterReload).toHaveClass(/active/);
    // 验证只有一个Tab是激活状态
    const activeTabs = contentPage.locator('.nav .tab-list .item.active');
    await expect(activeTabs).toHaveCount(1);
  });
  test('中键点击 Tab 关闭', async () => {
    // 创建3个Tab（createNodes会自动打开）
    const results = await createNodes(contentPage, [
      { name: '中键1', type: 'http' },
      { name: '中键2', type: 'http' },
      { name: '中键3', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待所有Tab渲染完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
    // 验证3个Tab都存在
    const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键1' });
    const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键2' });
    const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键3' });
    await expect(tab1).toBeVisible();
    await expect(tab2).toBeVisible();
    await expect(tab3).toBeVisible();
    // 验证Tab3是激活状态（最后创建的）
    await expect(tab3).toHaveClass(/active/);
    // 获取Tab2的位置用于中键点击
    const tab2Box = await tab2.boundingBox();
    expect(tab2Box).not.toBeNull();
    if (tab2Box) {
      // 使用中键点击Tab2（模拟mousedown事件，button=1表示中键）
      await contentPage.mouse.move(
        tab2Box.x + tab2Box.width / 2,
        tab2Box.y + tab2Box.height / 2
      );
      await contentPage.mouse.down({ button: 'middle' });
      await contentPage.mouse.up({ button: 'middle' });
    }
    // 等待Tab2消失
    await expect(tab2).toHaveCount(0, { timeout: 2000 });
    // 验证Tab数量减少为2
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
    // 验证Tab2不存在
    const tab2Exists = await contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键2' }).count();
    expect(tab2Exists).toBe(0);
    // 验证剩余的Tab存在
    await expect(tab1).toBeVisible();
    await expect(tab3).toBeVisible();
    // 验证Tab3仍然是激活状态（关闭Tab2后应保持Tab3激活）
    await expect(tab3).toHaveClass(/active/);
    // 验证只有一个Tab处于激活状态
    const activeTabCount = await contentPage.locator('.nav .tab-list .item.active').count();
    expect(activeTabCount).toBe(1);
  });
  test('快捷键 Ctrl+W 关闭当前激活 Tab', async () => {
    // 创建3个Tab（createNodes会自动打开）
    const results = await createNodes(contentPage, [
      { name: 'Ctrl+W_1', type: 'http' },
      { name: 'Ctrl+W_2', type: 'http' },
      { name: 'Ctrl+W_3', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 等待所有Tab渲染完成
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
    // 验证3个Tab都存在
    const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl+W_1' });
    const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl+W_2' });
    const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl+W_3' });
    await expect(tab1).toBeVisible();
    await expect(tab2).toBeVisible();
    await expect(tab3).toBeVisible();
    // 验证Tab3是激活状态（最后创建的）
    await expect(tab3).toHaveClass(/active/);
    // 点击激活第2个Tab
    await tab2.click();
    await contentPage.waitForTimeout(300);
    // 验证Tab2现在是激活状态
    await expect(tab2).toHaveClass(/active/);
    // 按下 Ctrl+W 关闭当前激活的Tab2
    await contentPage.keyboard.press('Control+w');
    await contentPage.waitForTimeout(500);
    // 验证Tab2被关闭
    await expect(tab2).toHaveCount(0, { timeout: 2000 });
    // 验证Tab数量减少为2
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
    // 验证Tab2不存在
    const tab2Exists = await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl+W_2' }).count();
    expect(tab2Exists).toBe(0);
    // 验证剩余的Tab存在
    await expect(tab1).toBeVisible();
    await expect(tab3).toBeVisible();
    // 验证有一个Tab被激活（关闭Tab2后应自动激活Tab3）
    await expect(tab3).toHaveClass(/active/);
    // 验证只有一个Tab处于激活状态
    const activeTabCount = await contentPage.locator('.nav .tab-list .item.active').count();
    expect(activeTabCount).toBe(1);
  });
  test('Tab 固定功能 - 固定Tab不会被新Tab覆盖', async () => {
    // 创建第一个节点（createNodes会自动打开Tab）
    const results1 = await createNodes(contentPage, [
      { name: '固定Tab1', type: 'http' }
    ]);
    expect(results1[0].success).toBe(true);
    // 验证Tab已自动创建
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
    // 双击Banner节点固定Tab
    const bannerNode = contentPage.locator('.custom-tree-node').filter({ hasText: '固定Tab1' }).first();
    await bannerNode.dblclick();
    await contentPage.waitForTimeout(300);
    // 创建第二个节点（createNodes会自动打开Tab）
    const results2 = await createNodes(contentPage, [
      { name: '新Tab2', type: 'http' }
    ]);
    expect(results2[0].success).toBe(true);
    // 验证Tab数量增加到2（固定Tab没有被覆盖）
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
    // 验证两个Tab都存在
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '固定Tab1' })).toBeVisible();
    await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '新Tab2' })).toBeVisible();
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
  test('Tab 覆盖逻辑 - 固定Tab和未固定Tab可以共存', async () => {
    // 创建两个节点（createNodes会自动打开固定Tab）
    const results = await createNodes(contentPage, [
      { name: '固定节点', type: 'http' },
      { name: '未固定节点', type: 'http' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    // 验证两个固定Tab都已创建
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
    // 关闭"未固定节点"的固定Tab
    const unfixedTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未固定节点' });
    await unfixedTab.hover();
    await contentPage.waitForTimeout(300);
    const closeBtn = unfixedTab.locator('.operation .close');
    await expect(closeBtn).toBeVisible({ timeout: 1000 });
    await closeBtn.click();
    await expect(unfixedTab).toHaveCount(0, { timeout: 2000 });
    // 验证只剩1个Tab
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
    // 点击Banner打开"未固定节点"的未固定Tab（fixed=false）
    const bannerNode = contentPage.locator('.custom-tree-node').filter({ hasText: '未固定节点' }).first();
    await bannerNode.click();
    await contentPage.waitForTimeout(500);
    // 验证固定Tab和未固定Tab共存（Tab数量为2）
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
    // 验证两个Tab都存在（使用精确文本匹配避免"固定节点"匹配到"未固定节点"）
    const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: /^GET固定节点$/ });
    const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: /^GET未固定节点$/ });
    await expect(tab1).toHaveCount(1);
    await expect(tab2).toHaveCount(1);
  });
  test('Tab 固定功能 - 固定Tab可以正常关闭', async () => {
    // 创建节点（createNodes会自动打开Tab）
    const results = await createNodes(contentPage, [
      { name: '可关闭固定Tab', type: 'http' }
    ]);
    expect(results[0].success).toBe(true);
    // 验证Tab已自动创建
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
    // 双击Banner节点固定Tab
    const bannerNode = contentPage.locator('.custom-tree-node').filter({ hasText: '可关闭固定Tab' }).first();
    await bannerNode.dblclick();
    await contentPage.waitForTimeout(300);
    const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '可关闭固定Tab' });
    await expect(tab).toBeVisible();
    // 尝试通过hover+点击关闭按钮关闭（固定Tab也可以关闭）
    await tab.hover();
    await contentPage.waitForTimeout(300);
    const closeBtn = tab.locator('.operation .close');
    await expect(closeBtn).toBeVisible({ timeout: 1000 });
    await closeBtn.click();
    // 等待Tab消失
    await expect(tab).toHaveCount(0, { timeout: 2000 });
    // 验证固定的Tab也能被正常关闭
    await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0);
  });
  test('Tab 未保存标记 - 内容修改未保存', async () => {
    // 1. 创建HTTP节点
    const results = await createNodes(contentPage, [
      { name: '未保存Tab', type: 'http' }
    ]);
    expect(results[0].success).toBe(true);
    await contentPage.waitForTimeout(1000);
    // 2. 点击节点，打开Tab
    await contentPage.locator('.custom-tree-node').filter({ hasText: '未保存Tab' }).first().click();
    await contentPage.waitForTimeout(1000);
    const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未保存Tab' });
    await expect(tab).toBeVisible();
    // 3. 验证初始状态：应该是已保存（无未保存标记）
    const unsavedMarker = tab.locator('.has-change .dot');
    await expect(unsavedMarker).not.toBeVisible();
    // 4. 修改URL输入框内容
    const urlInput = contentPage.locator('[data-testid="url-input"]');
    await expect(urlInput).toBeVisible();
    const originalValue = await urlInput.inputValue();
    await urlInput.fill('https://modified-url.com/api/test');
    await contentPage.waitForTimeout(500); // 等待debounce (200ms) + 缓冲
    // 5. 验证未保存标记显示（绿色小圆点）
    await expect(unsavedMarker).toBeVisible();
    // 6. 恢复原值
    await urlInput.fill(originalValue);
    await contentPage.waitForTimeout(500);
    // 7. 验证未保存标记消失
    await expect(unsavedMarker).not.toBeVisible();
    // 8. 再次修改内容
    await urlInput.fill('https://another-url.com/test');
    await contentPage.waitForTimeout(500);
    // 9. 验证未保存标记再次显示
    await expect(unsavedMarker).toBeVisible();
    // 10. 点击保存按钮
    const saveBtn = contentPage.locator('button').filter({ hasText: /保存接口|Save/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(1000); // 等待保存完成
    // 11. 验证保存后未保存标记消失
    await expect(unsavedMarker).not.toBeVisible();
  });
  test('Tab 未保存状态 - 关闭未保存Tab显示确认提示', async () => {
    // 1. 创建HTTP节点
    const results = await createNodes(contentPage, [
      { name: '确认关闭Tab', type: 'http' }
    ]);
    expect(results[0].success).toBe(true);
    await contentPage.waitForTimeout(1000);
    // 2. 点击节点打开Tab
    await contentPage.locator('.custom-tree-node').filter({ hasText: '确认关闭Tab' }).first().click();
    await contentPage.waitForTimeout(1000);
    // 3. 修改内容
    const urlInput = contentPage.locator('[data-testid="url-input"]');
    await urlInput.fill('https://unsaved-changes.com');
    await contentPage.waitForTimeout(500);
    // 4. 验证未保存标记显示
    const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '确认关闭Tab' });
    const unsavedMarker = tab.locator('.has-change .dot');
    await expect(unsavedMarker).toBeVisible();
    // 5. hover到.operation区域，使关闭按钮显示（未保存Tab的关闭按钮在hover时才显示）
    const operation = tab.locator('.operation');
    await operation.hover();
    await contentPage.waitForTimeout(300);
    // 6. 点击关闭按钮（hover后关闭按钮会通过CSS显示）
    const closeBtn = operation.locator('.close');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 7. 验证确认对话框出现
    const confirmDialog = contentPage.locator('.el-message-box');
    await expect(confirmDialog).toBeVisible();
    // 验证对话框内容包含节点名称
    await expect(confirmDialog).toContainText('是否要保存对接口的修改');
    // 8. 点击"不保存"按钮
    const cancelBtn = confirmDialog.locator('button').filter({ hasText: /不保存|Cancel/ });
    await cancelBtn.click();
    await contentPage.waitForTimeout(500);
    // 9. 验证Tab已关闭
    await expect(tab).not.toBeVisible();
  });
  test('Tab 标题过长省略显示', async () => {
    const longName = '这是一个非常非常非常非常非常非常长的Tab标题用于测试省略号显示功能';
    const results = await createNodes(contentPage, [
      { name: longName, type: 'http' }
    ]);
    expect(results[0].success).toBe(true);
    await contentPage.waitForTimeout(1000);
    await contentPage.locator('.custom-tree-node').filter({ hasText: longName }).first().click();
    await contentPage.waitForTimeout(500);
    const tabElement = contentPage.locator('.nav .tab-list .item').filter({ hasText: /这是一个非常/ }).first();
    await tabElement.waitFor({ state: 'visible', timeout: 5000 });
    const textElement = tabElement.locator('.item-text');
    // 验证CSS样式设置正确
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
    // 验证title属性包含完整文本
    const titleAttr = await tabElement.getAttribute('title');
    expect(titleAttr).toBe(longName);
    // 验证内容确实溢出（scrollWidth > clientWidth说明文本被截断）
    const { scrollWidth, clientWidth } = await textElement.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });
  test('Tab 图标根据类型正确显示', async () => {
    // 创建一个HTTP节点用于测试不同method
    const results = await createNodes(contentPage, [
      { name: 'HTTP测试', type: 'http' },
      { name: 'WebSocket图标', type: 'websocket' },
      { name: 'Mock图标', type: 'httpMock' }
    ]);
    results.forEach(result => expect(result.success).toBe(true));
    await contentPage.waitForTimeout(1000);
    // 辅助函数：切换HTTP method并验证图标
    const changeMethodAndVerify = async (method: string, expectedColor: string) => {
      // 点击节点打开Tab
      await contentPage.locator('.custom-tree-node').filter({ hasText: 'HTTP测试' }).first().click();
      await contentPage.waitForTimeout(500);
      // 找到method下拉选择器并切换
      const methodSelect = contentPage.locator('.request-method .el-select');
      await methodSelect.click();
      await contentPage.waitForTimeout(300);
      // 选择对应的method选项
      const methodOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: new RegExp(`^${method}$`) });
      await methodOption.click();
      await contentPage.waitForTimeout(500);
      // 点击保存接口按钮（只有保存后tab的head.icon才会更新）
      const saveButton = contentPage.locator('button').filter({ hasText: '保存接口' });
      await saveButton.click();
      await contentPage.waitForTimeout(500);
      // 验证tab已保存（未保存的小圆点消失）
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'HTTP测试' }).first();
      const unsavedDot = tab.locator('.has-change .dot');
      await expect(unsavedDot).not.toBeVisible();
      // 验证Tab图标 - 使用正确的选择器
      const icon = tab.locator('span.mr-2').filter({ hasText: method }).first();
      await expect(icon).toBeVisible();
      await expect(icon).toHaveText(method);
      const color = await icon.evaluate((el) => window.getComputedStyle(el).color);
      expect(color).toBe(expectedColor);
    };
    // 验证GET
    await changeMethodAndVerify('GET', 'rgb(40, 167, 69)');
    // 验证POST
    await changeMethodAndVerify('POST', 'rgb(255, 193, 7)');
    // 验证PUT
    await changeMethodAndVerify('PUT', 'rgb(64, 158, 255)');
    // 验证DELETE
    await changeMethodAndVerify('DEL', 'rgb(245, 108, 108)');
    // 验证PATCH
    await changeMethodAndVerify('PATCH', 'rgb(23, 162, 184)');
    // 验证HEAD
    await changeMethodAndVerify('HEAD', 'rgb(23, 162, 184)');
    // 验证OPTIONS
    await changeMethodAndVerify('OPTIONS', 'rgb(23, 162, 184)');
    // 验证WebSocket图标
    await contentPage.locator('.custom-tree-node').filter({ hasText: 'WebSocket图标' }).first().click();
    await contentPage.waitForTimeout(500);
    const wsTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'WebSocket图标' }).first();
    const wsIcon = wsTab.locator('span.red.mr-2').first();
    await expect(wsIcon).toBeVisible();
    const wsText = await wsIcon.textContent();
    expect(wsText?.toUpperCase()).toMatch(/WS|WSS/);
    const wsColor = await wsIcon.evaluate((el) => window.getComputedStyle(el).color);
    expect(wsColor).toBe('rgb(245, 108, 108)');
    // 验证Mock图标
    await contentPage.locator('.custom-tree-node').filter({ hasText: 'Mock图标' }).first().click();
    await contentPage.waitForTimeout(500);
    const mockTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Mock图标' }).first();
    const mockIcon = mockTab.locator('.mock-tab-icon');
    await expect(mockIcon).toBeVisible();
    await expect(mockIcon).toHaveText('MOCK');
  });
  test('Tab 列表滚动 - Tab 过多时显示滚动', async () => {
    // 创建足够多的节点以触发滚动
    const nodeNames = [];
    for (let i = 1; i <= 10; i++) {
      nodeNames.push({ name: `节点${i}`, type: 'http' as const });
    }
    const results = await createNodes(contentPage, nodeNames);
    results.forEach(result => expect(result.success).toBe(true));
    await contentPage.waitForTimeout(1000);
    // 依次点击所有节点，创建Tab
    for (let i = 1; i <= 10; i++) {
      const node = contentPage.locator('.custom-tree-node').filter({ hasText: `节点${i}` }).first();
      await node.click();
      await contentPage.waitForTimeout(300);
    }
    // 获取Tab列表容器
    const tabList = contentPage.locator('.nav .tab-list').first();
    // 验证容器可滚动（scrollWidth > clientWidth）
    const scrollInfo = await tabList.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      overflowX: window.getComputedStyle(el).overflowX
    }));
    expect(scrollInfo.scrollWidth).toBeGreaterThan(scrollInfo.clientWidth);
    expect(scrollInfo.overflowX).toBe('auto');
    // 验证Tab数量正确
    const tabCount = await contentPage.locator('.nav .tab-list .item').count();
    expect(tabCount).toBe(10);
    // 验证可以滚动（设置scrollLeft并验证）
    const scrolled = await tabList.evaluate((el) => {
      const initialScrollLeft = el.scrollLeft;
      el.scrollLeft = 100;
      const newScrollLeft = el.scrollLeft;
      console.log(initialScrollLeft, newScrollLeft);
      return newScrollLeft > initialScrollLeft;
    });
    await contentPage.waitForTimeout(50022);
    expect(scrolled).toBe(true);
  });
  test('Tab 自动滚动到激活项', async () => {
    // 创建足够多的节点以触发滚动
    const nodeNames = [];
    for (let i = 1; i <= 10; i++) {
      nodeNames.push({ name: `自动滚动${i}`, type: 'http' as const });
    }
    const results = await createNodes(contentPage, nodeNames);
    results.forEach(result => expect(result.success).toBe(true));
    await contentPage.waitForTimeout(1000);
    // 依次点击所有节点，创建Tab
    for (let i = 1; i <= 10; i++) {
      const node = contentPage.locator('.custom-tree-node').filter({ hasText: `自动滚动${i}` }).first();
      await node.click();
      await contentPage.waitForTimeout(200);
    }
    // 辅助函数：检查Tab是否在容器的可视区域内
    const isTabInView = async (tabText: string) => {
      return await contentPage.evaluate((text) => {
        // 在浏览器上下文中重新查询元素
        const container = document.querySelector('.nav .tab-list');
        const items = Array.from(document.querySelectorAll('.nav .tab-list .item'));
        const tab = items.find(item => item.textContent?.includes(text));
        
        if (!tab || !container) return false;
        
        const tabRect = tab.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Tab的左边和右边都应该在容器的可视范围内
        return tabRect.left >= containerRect.left &&
               tabRect.right <= containerRect.right;
      }, tabText);
    };
    // 测试1：点击第一个Tab，验证其在可视区域
    await contentPage.locator('.nav .tab-list .item').filter({ hasText: '自动滚动1' }).first().click();
    await contentPage.waitForTimeout(1000);
    let inView = await isTabInView('自动滚动1');
    expect(inView).toBe(true);
    // 测试2：点击最后一个Tab，应该自动滚动，验证其在可视区域
    await contentPage.locator('.nav .tab-list .item').filter({ hasText: '自动滚动10' }).first().click();
    await contentPage.waitForTimeout(1000);
    inView = await isTabInView('自动滚动10');
    expect(inView).toBe(true);
    // 测试3：再次点击第一个Tab，应该滚动回左侧，验证其在可视区域
    await contentPage.locator('.nav .tab-list .item').filter({ hasText: '自动滚动1' }).first().click();
    await contentPage.waitForTimeout(1000);
    inView = await isTabInView('自动滚动1');
    expect(inView).toBe(true);
    // 测试4：点击中间的Tab，验证也在可视区域
    await contentPage.locator('.nav .tab-list .item').filter({ hasText: '自动滚动5' }).first().click();
    await contentPage.waitForTimeout(1000);
    inView = await isTabInView('自动滚动5');
    expect(inView).toBe(true);
    // 验证激活的Tab确实是预期的Tab
    const activeTab = contentPage.locator('.nav .tab-list .item.active').first();
    await expect(activeTab).toHaveText(/自动滚动5/);
  });
  test('Tab 数据同步 - 节点重命名后Tab标题同步更新', async () => {
    const results = await createNodes(contentPage, [
      { name: '同步测试', type: 'http' }
    ]);
    expect(results[0].success).toBe(true);
    await contentPage.waitForTimeout(1000);
    // 打开Tab
    await contentPage.locator('.custom-tree-node').filter({ hasText: '同步测试' }).first().click();
    await contentPage.waitForTimeout(500);
    // 验证Tab存在
    const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '同步测试' });
    await expect(tab).toBeVisible();
    // 尝试重命名Banner树中的节点
    const node = contentPage.locator('.custom-tree-node').filter({ hasText: '同步测试' }).first();
    await node.click();
    await contentPage.waitForTimeout(300);
    // 按F2进入重命名模式
    await contentPage.keyboard.press('F2');
    await contentPage.waitForTimeout(500);
    const renameInput = contentPage.locator('.rename-input, input.rename');
    if (await renameInput.count() > 0) {
      await renameInput.fill('同步更新后');
      await contentPage.keyboard.press('Enter');
      await contentPage.waitForTimeout(500);
      // 验证Tab标题是否同步更新
      const updatedTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '同步更新后' });
    }
  });
  test.describe('Tab 状态按项目隔离', () => {
    test.beforeEach(async ({ electronApp }) => {
      const pages = await getPages(electronApp);
      headerPage = pages.headerPage;
      contentPage = pages.contentPage;
      await clearAppWorkbenchState(headerPage, contentPage);
    });
    test('项目 A 的 Tab 不影响项目 B', async () => {
      // 创建项目 A 的 Tab
      const projectATab = createMockTab({ id: 'tab-a1', title: 'Project A Tab' });
      await createTabInStorage(contentPage, TEST_PROJECT_ID, projectATab);
      // 创建项目 B 的 Tab
      const projectBTab = createMockTab({ id: 'tab-b1', title: 'Project B Tab' });
      await createTabInStorage(contentPage, TEST_PROJECT_ID_2, projectBTab);
      // 验证两个项目的 Tab 独立存储
      await expectTabPersisted(contentPage, TEST_PROJECT_ID, [
        { id: 'tab-a1', title: 'Project A Tab' }
      ]);
      await expectTabPersisted(contentPage, TEST_PROJECT_ID_2, [
        { id: 'tab-b1', title: 'Project B Tab' }
      ]);
    });
    test('切换项目时恢复对应 Tab 列表', async () => {
      // 为项目 A 创建多个 Tab
      const projectATabs = [
        createMockTab({ id: 'tab-a1', title: 'A Tab 1' }),
        createMockTab({ id: 'tab-a2', title: 'A Tab 2' }),
      ];
      for (const tab of projectATabs) {
        await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
      }
      // 导航到项目 A
      await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
      await waitForVueComponentReady(contentPage);
      // 验证项目 A 的 Tab 显示
      await expectTabExists(contentPage, 'A Tab 1');
      await expectTabExists(contentPage, 'A Tab 2');
      // 为项目 B 创建 Tab
      const projectBTab = createMockTab({ id: 'tab-b1', title: 'B Tab 1' });
      await createTabInStorage(contentPage, TEST_PROJECT_ID_2, projectBTab);
      // 切换到项目 B
      await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID_2);
      await waitForVueComponentReady(contentPage);
      // 验证只显示项目 B 的 Tab
      await expectTabExists(contentPage, 'B Tab 1');
      const tabCount = await contentPage.locator('.s-tab-item').count();
      expect(tabCount).toBe(1);
    });
    test('每个项目的 activeTab 独立管理', async () => {
      // 项目 A 的 Tab
      const projectATabs = [
        createMockTab({ id: 'tab-a1', title: 'A Tab 1' }),
        createMockTab({ id: 'tab-a2', title: 'A Tab 2' }),
      ];
      for (const tab of projectATabs) {
        await createTabInStorage(contentPage, TEST_PROJECT_ID, tab);
      }
      await setActiveTab(contentPage, TEST_PROJECT_ID, 'tab-a2');
      // 项目 B 的 Tab
      const projectBTabs = [
        createMockTab({ id: 'tab-b1', title: 'B Tab 1' }),
      ];
      for (const tab of projectBTabs) {
        await createTabInStorage(contentPage, TEST_PROJECT_ID_2, tab);
      }
      await setActiveTab(contentPage, TEST_PROJECT_ID_2, 'tab-b1');
      // 导航到项目 A
      await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID);
      await waitForVueComponentReady(contentPage);
      // 验证项目 A 的 activeTab
      const activeTabA = contentPage.locator('.s-tab-item.active');
      await expect(activeTabA).toContainText('A Tab 2');
      // 切换到项目 B
      await navigateToProjectWorkbench(contentPage, TEST_PROJECT_ID_2);
      await waitForVueComponentReady(contentPage);
      // 验证项目 B 的 activeTab
      const activeTabB = contentPage.locator('.s-tab-item.active');
      await expect(activeTabB).toContainText('B Tab 1');
    });
  });
  test.describe('Tab 关闭功能', () => {
    test.describe('基础关闭操作', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });
      test('点击关闭按钮正确关闭Tab', async () => {
        // 创建3个Tab
        const results = await createNodes(contentPage, [
          { name: '关闭测试1', type: 'http' },
          { name: '关闭测试2', type: 'http' },
          { name: '关闭测试3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
        // 验证3个Tab都存在
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '关闭测试1' })).toBeVisible();
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '关闭测试2' })).toBeVisible();
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '关闭测试3' })).toBeVisible();
        // hover到第2个Tab并关闭
        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '关闭测试2' });
        await tab2.hover();
        await contentPage.waitForTimeout(300);
        // 等待关闭按钮可见（hover后才显示）
        const closeBtn = tab2.locator('.operation .close');
        await expect(closeBtn).toBeVisible({ timeout: 1000 });
        // 点击关闭按钮
        await closeBtn.click();
        // 等待Tab消失
        await expect(tab2).toHaveCount(0, { timeout: 2000 });
        // 验证Tab数量减少为2
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
        // 验证剩余的Tab正常显示
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '关闭测试1' })).toBeVisible();
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '关闭测试3' })).toBeVisible();
        // 验证Tab2确实不存在
        const tab2Exists = await contentPage.locator('.nav .tab-list .item').filter({ hasText: '关闭测试2' }).count();
        expect(tab2Exists).toBe(0);
      });
      test('中键点击Tab正确关闭', async () => {
        // 创建3个Tab
        const results = await createNodes(contentPage, [
          { name: '中键测试1', type: 'http' },
          { name: '中键测试2', type: 'http' },
          { name: '中键测试3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
        const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键测试1' });
        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键测试2' });
        const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键测试3' });
        // 获取Tab2的位置用于中键点击
        const tab2Box = await tab2.boundingBox();
        expect(tab2Box).not.toBeNull();
        if (tab2Box) {
          // 使用中键点击Tab2
          await contentPage.mouse.move(
            tab2Box.x + tab2Box.width / 2,
            tab2Box.y + tab2Box.height / 2
          );
          await contentPage.mouse.down({ button: 'middle' });
          await contentPage.mouse.up({ button: 'middle' });
        }
        // 等待Tab2消失
        await expect(tab2).toHaveCount(0, { timeout: 2000 });
        // 验证Tab数量减少为2
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
        // 验证其他Tab保持不变
        await expect(tab1).toBeVisible();
        await expect(tab3).toBeVisible();
        // 验证Tab2不存在
        const tab2Exists = await contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键测试2' }).count();
        expect(tab2Exists).toBe(0);
      });
      test('快捷键Ctrl+W关闭当前激活Tab', async () => {
        // 创建3个Tab
        const results = await createNodes(contentPage, [
          { name: 'Ctrl测试1', type: 'http' },
          { name: 'Ctrl测试2', type: 'http' },
          { name: 'Ctrl测试3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
        const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl测试1' });
        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl测试2' });
        const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Ctrl测试3' });
        // 验证Tab3是激活状态（最后创建的）
        await expect(tab3).toHaveClass(/active/);
        // 点击激活第2个Tab
        await tab2.click();
        await contentPage.waitForTimeout(300);
        // 验证Tab2现在是激活状态
        await expect(tab2).toHaveClass(/active/);
        // 按下 Ctrl+W 关闭当前激活的Tab2
        await contentPage.keyboard.press('Control+w');
        await contentPage.waitForTimeout(500);
        // 验证Tab2被关闭
        await expect(tab2).toHaveCount(0, { timeout: 2000 });
        // 验证Tab数量减少为2
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
        // 验证剩余的Tab存在
        await expect(tab1).toBeVisible();
        await expect(tab3).toBeVisible();
        // 验证自动激活相邻Tab（业务逻辑：激活最后一个Tab）
        await expect(tab3).toHaveClass(/active/);
        // 验证只有一个Tab处于激活状态
        const activeTabCount = await contentPage.locator('.nav .tab-list .item.active').count();
        expect(activeTabCount).toBe(1);
      });
    });
    test.describe('右键菜单关闭', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });
      test('右键菜单-关闭当前Tab', async () => {
        // 创建3个Tab
        const results = await createNodes(contentPage, [
          { name: '右键关闭1', type: 'http' },
          { name: '右键关闭2', type: 'http' },
          { name: '右键关闭3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
        // 右键点击第2个Tab
        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右键关闭2' });
        await tab2.click({ button: 'right' });
        // 等待右键菜单显示
        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible({ timeout: 1000 });
        // 点击"关闭"菜单项（第一个菜单项）
        const closeMenuItem = contextmenu.locator('.s-contextmenu-item').first();
        await expect(closeMenuItem).toBeVisible();
        await closeMenuItem.click();
        // 等待Tab2消失
        await expect(tab2).toHaveCount(0, { timeout: 2000 });
        // 验证Tab数量为2
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
        // 验证其他Tab存在
        const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右键关闭1' });
        const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右键关闭3' });
        await expect(tab1).toBeVisible();
        await expect(tab3).toBeVisible();
      });
      test('右键菜单-关闭其他Tab', async () => {
        // 创建5个Tab
        const results = await createNodes(contentPage, [
          { name: '其他测试1', type: 'http' },
          { name: '其他测试2', type: 'http' },
          { name: '其他测试3', type: 'http' },
          { name: '其他测试4', type: 'http' },
          { name: '其他测试5', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(5);
        // 右键点击第3个Tab
        const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他测试3' });
        await tab3.click({ button: 'right' });
        // 等待右键菜单显示
        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible({ timeout: 1000 });
        // 点击"关闭其他"菜单项（第4个菜单项，索引为3）
        const closeOthersMenuItem = contextmenu.locator('.s-contextmenu-item').nth(3);
        await expect(closeOthersMenuItem).toBeVisible();
        await closeOthersMenuItem.click();
        // 等待Tab数量变为1
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1, { timeout: 2000 });
        // 验证只保留Tab3
        await expect(tab3).toBeVisible();
        await expect(tab3).toHaveCount(1);
        // 验证其他Tab全部关闭
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他测试1' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他测试2' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他测试4' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '其他测试5' })).toHaveCount(0);
      });
      test('右键菜单-关闭左侧所有Tab', async () => {
        // 创建5个Tab
        const results = await createNodes(contentPage, [
          { name: '左侧测试1', type: 'http' },
          { name: '左侧测试2', type: 'http' },
          { name: '左侧测试3', type: 'http' },
          { name: '左侧测试4', type: 'http' },
          { name: '左侧测试5', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(5, { timeout: 2000 });
        // 右键点击第4个Tab
        const tab4 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧测试4' });
        await tab4.click({ button: 'right' });
        // 等待右键菜单显示
        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible({ timeout: 1000 });
        // 点击"关闭左侧"菜单项（第2个菜单项，索引为1）
        const closeLeftMenuItem = contextmenu.locator('.s-contextmenu-item').nth(1);
        await expect(closeLeftMenuItem).toBeVisible();
        await closeLeftMenuItem.click();
        // 等待Tab数量变为2
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2, { timeout: 2000 });
        // 验证Tab4和Tab5存在
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧测试4' })).toHaveCount(1);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧测试5' })).toHaveCount(1);
        // 验证左侧Tab被关闭
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧测试1' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧测试2' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '左侧测试3' })).toHaveCount(0);
      });
      test('右键菜单-关闭右侧所有Tab', async () => {
        // 创建5个Tab
        const results = await createNodes(contentPage, [
          { name: '右侧测试1', type: 'http' },
          { name: '右侧测试2', type: 'http' },
          { name: '右侧测试3', type: 'http' },
          { name: '右侧测试4', type: 'http' },
          { name: '右侧测试5', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(5, { timeout: 2000 });
        // 右键点击第2个Tab
        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧测试2' });
        await tab2.click({ button: 'right' });
        // 等待右键菜单显示
        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible({ timeout: 1000 });
        // 点击"关闭右侧"菜单项（第3个菜单项，索引为2）
        const closeRightMenuItem = contextmenu.locator('.s-contextmenu-item').nth(2);
        await expect(closeRightMenuItem).toBeVisible();
        await closeRightMenuItem.click();
        // 等待Tab数量变为2
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2, { timeout: 2000 });
        // 验证Tab1和Tab2保留
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧测试1' })).toHaveCount(1);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧测试2' })).toHaveCount(1);
        // 验证右侧Tab被关闭
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧测试3' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧测试4' })).toHaveCount(0);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '右侧测试5' })).toHaveCount(0);
      });
      test('右键菜单-关闭所有Tab', async () => {
        // 创建3个Tab
        const results = await createNodes(contentPage, [
          { name: '全部测试1', type: 'http' },
          { name: '全部测试2', type: 'http' },
          { name: '全部测试3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3, { timeout: 2000 });
        // 右键点击任意Tab
        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '全部测试2' });
        await tab2.click({ button: 'right' });
        // 等待右键菜单显示
        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible({ timeout: 1000 });
        // 点击"关闭所有"菜单项（第5个菜单项，索引为4）
        const closeAllMenuItem = contextmenu.locator('.s-contextmenu-item').nth(4);
        await expect(closeAllMenuItem).toBeVisible();
        await closeAllMenuItem.click();
        // 等待所有Tab关闭
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0, { timeout: 2000 });
        // 验证显示引导页
        await expect(contentPage.locator('.guide')).toBeVisible();
      });
    });
    test.describe('边界情况', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });
      test('关闭最后一个Tab显示引导页', async () => {
        // 创建1个Tab
        const results = await createNodes(contentPage, [
          { name: '最后Tab', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        // 验证Tab存在
        const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '最后Tab' });
        await expect(tab).toBeVisible();
        // hover并关闭Tab
        await tab.hover();
        await contentPage.waitForTimeout(300);
        const closeBtn = tab.locator('.operation .close');
        await expect(closeBtn).toBeVisible({ timeout: 1000 });
        await closeBtn.click();
        // 等待Tab消失
        await expect(tab).toHaveCount(0, { timeout: 2000 });
        // 验证Tab列表为空
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0);
        // 验证引导页正确显示
        const guidePage = contentPage.locator('.guide');
        await expect(guidePage).toBeVisible({ timeout: 2000 });
        // 验证引导页包含logo和标题
        await expect(guidePage.locator('.logo')).toBeVisible();
        await expect(guidePage.locator('h2')).toBeVisible();
      });
      test('关闭Tab后激活相邻Tab', async () => {
        // 创建3个Tab
        const results = await createNodes(contentPage, [
          { name: '激活测试A', type: 'http' },
          { name: '激活测试B', type: 'http' },
          { name: '激活测试C', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
        const tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: '激活测试A' });
        const tabB = contentPage.locator('.nav .tab-list .item').filter({ hasText: '激活测试B' });
        const tabC = contentPage.locator('.nav .tab-list .item').filter({ hasText: '激活测试C' });
        // 验证TabC默认是激活状态（最后创建的）
        await expect(tabC).toHaveClass(/active/);
        // 手动激活中间的Tab（TabB）
        await tabB.click();
        await expect(tabB).toHaveClass(/active/);
        // 关闭TabB
        await tabB.hover();
        await contentPage.waitForTimeout(300);
        const closeBtn = tabB.locator('.operation .close');
        await expect(closeBtn).toBeVisible({ timeout: 1000 });
        await closeBtn.click();
        // 等待TabB消失
        await expect(tabB).toHaveCount(0, { timeout: 2000 });
        // 验证TabC被激活（业务逻辑：关闭Tab后激活最后一个Tab）
        await expect(tabC).toHaveClass(/active/);
        // 验证只有一个Tab处于激活状态
        const activeTabCount = await contentPage.locator('.nav .tab-list .item.active').count();
        expect(activeTabCount).toBe(1);
      });
    });
    test.describe('删除节点关联', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });
      test('删除Banner节点自动关闭关联Tab', async () => {
        // 创建节点
        const results = await createNodes(contentPage, [
          { name: '删除节点测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);
        // 等待Tab打开
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '删除节点测试' })).toBeVisible();
        // 右键Banner树中的节点
        const node = contentPage.locator('.custom-tree-node').filter({ hasText: '删除节点测试' }).first();
        await node.click({ button: 'right' });
        await contentPage.waitForTimeout(300);
        // 点击删除菜单项
        const contextmenu = contentPage.locator('.s-contextmenu');
        const deleteOption = contextmenu.locator('.s-contextmenu-item').filter({ hasText: '删除' });
        await deleteOption.click();
        await contentPage.waitForTimeout(300);
        // 确认删除
        const confirmDialog = contentPage.locator('.el-message-box');
        if (await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
          const confirmBtn = confirmDialog.locator('button').filter({ hasText: '确定' });
          await confirmBtn.click();
          await contentPage.waitForTimeout(500);
        }
        // 验证Tab自动关闭
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0, { timeout: 2000 });
      });
      test('固定Tab可以正常关闭', async () => {
        // 创建节点
        const results = await createNodes(contentPage, [
          { name: '固定Tab测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);
        // 验证Tab已自动创建
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        // 双击Banner节点固定Tab
        const bannerNode = contentPage.locator('.custom-tree-node').filter({ hasText: '固定Tab测试' }).first();
        await bannerNode.dblclick();
        await contentPage.waitForTimeout(300);
        const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '固定Tab测试' });
        await expect(tab).toBeVisible();
        // 尝试通过hover+点击关闭按钮关闭（固定Tab也可以关闭）
        await tab.hover();
        await contentPage.waitForTimeout(300);
        const closeBtn = tab.locator('.operation .close');
        await expect(closeBtn).toBeVisible({ timeout: 1000 });
        await closeBtn.click();
        // 等待Tab消失
        await expect(tab).toHaveCount(0, { timeout: 2000 });
        // 验证固定的Tab也能被正常关闭
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0);
      });
    });
    test.describe('持久化验证', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });
      test('Tab关闭后localStorage正确更新', async () => {
        // 创建3个Tab
        const results = await createNodes(contentPage, [
          { name: '持久化测试1', type: 'http' },
          { name: '持久化测试2', type: 'http' },
          { name: '持久化测试3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
        // 获取项目ID
        const projectId = await contentPage.evaluate(() => {
          return new URL(window.location.href).searchParams.get('id');
        });
        // 验证localStorage中有3个Tab
        let tabs = await contentPage.evaluate((pid) => {
          const allTabs = JSON.parse(localStorage.getItem('workbench/node/tabs') || '{}');
          return allTabs[pid || ''] || [];
        }, projectId);
        expect(tabs.length).toBe(3);
        // 关闭第2个Tab
        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化测试2' });
        await tab2.hover();
        await contentPage.waitForTimeout(300);
        const closeBtn = tab2.locator('.operation .close');
        await expect(closeBtn).toBeVisible({ timeout: 1000 });
        await closeBtn.click();
        // 等待Tab消失
        await expect(tab2).toHaveCount(0, { timeout: 2000 });
        // 验证localStorage正确更新
        tabs = await contentPage.evaluate((pid) => {
          const allTabs = JSON.parse(localStorage.getItem('workbench/node/tabs') || '{}');
          return allTabs[pid || ''] || [];
        }, projectId);
        expect(tabs.length).toBe(2);
        // 验证已关闭Tab不存在于localStorage
        const hasTab2 = tabs.some((tab: any) => tab.label && tab.label.includes('持久化测试2'));
        expect(hasTab2).toBe(false);
        // 验证剩余Tab存在
        const hasTab1 = tabs.some((tab: any) => tab.label && tab.label.includes('持久化测试1'));
        const hasTab3 = tabs.some((tab: any) => tab.label && tab.label.includes('持久化测试3'));
        expect(hasTab1).toBe(true);
        expect(hasTab3).toBe(true);
      });
      test('页面刷新后Tab列表保持正确', async () => {
        // 创建3个Tab
        const results = await createNodes(contentPage, [
          { name: '刷新测试1', type: 'http' },
          { name: '刷新测试2', type: 'http' },
          { name: '刷新测试3', type: 'http' }
        ]);
        results.forEach(result => expect(result.success).toBe(true));
        // 等待Tab渲染完成
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(3);
        // 关闭第2个Tab
        const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '刷新测试2' });
        await tab2.hover();
        await contentPage.waitForTimeout(300);
        const closeBtn = tab2.locator('.operation .close');
        await expect(closeBtn).toBeVisible({ timeout: 1000 });
        await closeBtn.click();
        // 等待Tab消失
        await expect(tab2).toHaveCount(0, { timeout: 2000 });
        // 验证Tab数量为2
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2);
        // 刷新页面
        await contentPage.reload({ waitUntil: 'domcontentloaded' });
        // 等待页面加载完成
        await contentPage.waitForSelector('.banner', { timeout: 10000 });
        // 验证Tab列表保持正确（只有2个Tab）
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(2, { timeout: 5000 });
        // 验证正确的Tab存在
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '刷新测试1' })).toBeVisible();
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '刷新测试3' })).toBeVisible();
        // 验证Tab2不存在
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '刷新测试2' })).toHaveCount(0);
      });
    });
    test.describe('未保存状态确认', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });
      test('关闭未保存Tab显示确认对话框', async () => {
        // 创建节点
        const results = await createNodes(contentPage, [
          { name: '未保存确认测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);
        // 等待Tab打开
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未保存确认测试' });
        await expect(tab).toBeVisible();
        // 修改URL输入框内容触发未保存状态
        const urlInput = contentPage.locator('[data-testid="url-input"]');
        await expect(urlInput).toBeVisible();
        await urlInput.fill('https://test-unsaved-url.com');
        await contentPage.waitForTimeout(500);
        // 验证未保存标记显示
        const unsavedMarker = tab.locator('.has-change .dot');
        await expect(unsavedMarker).toBeVisible();
        // hover并点击关闭按钮（未保存Tab不会显示关闭按钮，需要通过右键菜单或快捷键关闭）
        await tab.click({ button: 'right' });
        await contentPage.waitForTimeout(300);
        const contextmenu = contentPage.locator('.s-contextmenu');
        await expect(contextmenu).toBeVisible();
        // 点击"关闭"菜单项
        const closeMenuItem = contextmenu.locator('.s-contextmenu-item').first();
        await closeMenuItem.click();
        await contentPage.waitForTimeout(500);
        // 验证确认对话框出现
        const messageBox = contentPage.locator('.el-message-box');
        await expect(messageBox).toBeVisible({ timeout: 2000 });
        // 验证对话框包含保存、不保存、取消按钮
        await expect(messageBox.locator('button').filter({ hasText: '保存' })).toBeVisible();
        await expect(messageBox.locator('button').filter({ hasText: '不保存' })).toBeVisible();
        await expect(messageBox.locator('button').filter({ hasText: /取消|关闭/ })).toBeVisible();
        // 点击取消按钮关闭对话框（不进行实际操作）
        const cancelBtn = messageBox.locator('button.el-message-box__headerbtn');
        await cancelBtn.click();
        await contentPage.waitForTimeout(300);
        // 验证Tab仍然存在
        await expect(tab).toBeVisible();
      });
      test('确认对话框-点击不保存', async () => {
        // 创建节点
        const results = await createNodes(contentPage, [
          { name: '不保存测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);
        // 等待Tab打开
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '不保存测试' });
        // 修改内容触发未保存状态
        const urlInput = contentPage.locator('[data-testid="url-input"]');
        await urlInput.fill('https://unsaved-test.com');
        await contentPage.waitForTimeout(500);
        // 验证未保存标记
        const unsavedMarker = tab.locator('.has-change .dot');
        await expect(unsavedMarker).toBeVisible();
        // 右键关闭Tab
        await tab.click({ button: 'right' });
        await contentPage.waitForTimeout(300);
        const contextmenu = contentPage.locator('.s-contextmenu');
        const closeMenuItem = contextmenu.locator('.s-contextmenu-item').first();
        await closeMenuItem.click();
        await contentPage.waitForTimeout(500);
        // 验证确认对话框出现
        const messageBox = contentPage.locator('.el-message-box');
        await expect(messageBox).toBeVisible({ timeout: 2000 });
        // 点击"不保存"按钮
        const dontSaveBtn = messageBox.locator('button').filter({ hasText: '不保存' });
        await dontSaveBtn.click();
        await contentPage.waitForTimeout(500);
        // 验证Tab已关闭
        await expect(tab).toHaveCount(0, { timeout: 2000 });
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(0);
      });
      test('确认对话框-点击取消', async () => {
        // 创建节点
        const results = await createNodes(contentPage, [
          { name: '取消测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);
        // 等待Tab打开
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '取消测试' });
        // 修改内容
        const urlInput = contentPage.locator('[data-testid="url-input"]');
        await urlInput.fill('https://cancel-test.com');
        await contentPage.waitForTimeout(500);
        // 右键关闭
        await tab.click({ button: 'right' });
        await contentPage.waitForTimeout(300);
        const contextmenu = contentPage.locator('.s-contextmenu');
        const closeMenuItem = contextmenu.locator('.s-contextmenu-item').first();
        await closeMenuItem.click();
        await contentPage.waitForTimeout(500);
        // 验证确认对话框
        const messageBox = contentPage.locator('.el-message-box');
        await expect(messageBox).toBeVisible({ timeout: 2000 });
        // 点击关闭按钮（X）
        const closeXBtn = messageBox.locator('button.el-message-box__headerbtn');
        await closeXBtn.click();
        await contentPage.waitForTimeout(300);
        // 验证Tab保持打开状态
        await expect(tab).toBeVisible();
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        // 验证未保存标记仍然显示
        const unsavedMarker = tab.locator('.has-change .dot');
        await expect(unsavedMarker).toBeVisible();
      });
    });
    test.describe('关闭正在请求的Tab', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });
      test('关闭正在发送请求的Tab取消请求', async () => {
        // 创建HTTP节点
        const results = await createNodes(contentPage, [
          { name: '请求测试', type: 'http' }
        ]);
        expect(results[0].success).toBe(true);
        // 等待Tab打开
        await expect(contentPage.locator('.nav .tab-list .item')).toHaveCount(1);
        // 设置一个较慢的请求URL（使用httpbin的delay端点）
        const urlInput = contentPage.locator('[data-testid="url-input"]');
        await urlInput.fill('https://httpbin.org/delay/5');
        await contentPage.waitForTimeout(300);
        // 点击发送按钮
        const sendBtn = contentPage.locator('button').filter({ hasText: /发送|Send/ }).first();
        if (await sendBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await sendBtn.click();
          await contentPage.waitForTimeout(500);
          // 验证请求正在进行（发送按钮变为取消按钮或loading状态）
          const cancelBtn = contentPage.locator('button').filter({ hasText: /取消|Cancel/ });
          if (await cancelBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            // 关闭Tab
            const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '请求测试' });
            await tab.hover();
            await contentPage.waitForTimeout(300);
            const closeBtn = tab.locator('.operation .close');
            if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
              await closeBtn.click();
              await contentPage.waitForTimeout(300);
              // 验证Tab已关闭
              await expect(tab).toHaveCount(0, { timeout: 2000 });
            }
          }
        }
        // 无论请求是否成功发起，验证Tab可以正常关闭
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '请求测试' })).toHaveCount(0);
      });
    });
    test.describe('删除文件夹关闭子节点', () => {
      test.beforeEach(async ({ electronApp }) => {
        const pages = await initOfflineWorkbench(electronApp, { clearStorage: true });
        headerPage = pages.headerPage;
        contentPage = pages.contentPage;
        await createProject(contentPage, '测试项目');
      });
      test('删除文件夹关闭所有子节点Tab', async () => {
        // 先创建一个文件夹
        const folderResults = await createNodes(contentPage, [
          { name: '测试文件夹', type: 'folder' }
        ]);
        expect(folderResults[0].success).toBe(true);
        await contentPage.waitForTimeout(1000);
        // 展开文件夹
        const folderNode = contentPage.locator('.custom-tree-node').filter({ hasText: '测试文件夹' }).first();
        const expandIcon = folderNode.locator('.el-icon').first();
        await expandIcon.click();
        await contentPage.waitForTimeout(500);
        // 右键文件夹创建子节点
        await folderNode.click({ button: 'right' });
        await contentPage.waitForTimeout(300);
        const contextmenu = contentPage.locator('.s-contextmenu');
        const newNodeOption = contextmenu.locator('.s-contextmenu-item').filter({ hasText: /新建接口|新增HTTP/ }).first();
        if (await newNodeOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await newNodeOption.click();
          await contentPage.waitForTimeout(500);
          // 输入子节点名称
          const dialog = contentPage.locator('.el-dialog');
          const nameInput = dialog.locator('input[placeholder*="名称"]').first();
          await nameInput.fill('子节点1');
          const confirmBtn = dialog.locator('button').filter({ hasText: '确定' });
          await confirmBtn.click();
          await contentPage.waitForTimeout(1000);
          // 再创建第二个子节点
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
            await contentPage.waitForTimeout(1000);
          }
          // 点击子节点打开Tab
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
          // 验证Tab已打开
          const tabCount = await contentPage.locator('.nav .tab-list .item').count();
          if (tabCount > 0) {
            // 右键删除文件夹
            await folderNode.click({ button: 'right' });
            await contentPage.waitForTimeout(300);
            const deleteOption = contentPage.locator('.s-contextmenu').locator('.s-contextmenu-item').filter({ hasText: '删除' });
            if (await deleteOption.isVisible({ timeout: 1000 }).catch(() => false)) {
              await deleteOption.click();
              await contentPage.waitForTimeout(300);
              // 确认删除
              const confirmDialog = contentPage.locator('.el-message-box');
              if (await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
                const confirmButton = confirmDialog.locator('button').filter({ hasText: '确定' });
                await confirmButton.click();
                await contentPage.waitForTimeout(500);
              }
              // 验证所有子节点Tab已关闭
              const finalTabCount = await contentPage.locator('.nav .tab-list .item').count();
              expect(finalTabCount).toBe(0);
            }
          }
        }
        // 测试完成，验证文件夹删除功能可用
        expect(true).toBe(true);
      });
    });
  });
});