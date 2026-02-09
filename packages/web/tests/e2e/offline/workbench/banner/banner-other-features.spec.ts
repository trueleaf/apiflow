import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('BannerOtherFeatures', () => {
  // ========================= 拖拽功能测试 =========================
  // 测试用例1: banner区域拖拽条可见
  test('banner区域拖拽条可见', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证SResizeX组件的拖拽条存在
    const dragBar = contentPage.locator('.banner .bar');
    await expect(dragBar).toBeVisible({ timeout: 5000 });
  });

  // 测试用例2: 拖拽改变banner宽度
  test('拖拽改变banner宽度', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 获取拖拽条和banner容器
    const dragBar = contentPage.locator('.banner .bar');
    const banner = contentPage.locator('.banner.drag-wrap');
    // 获取初始宽度
    const initialWidth = await banner.evaluate(el => el.getBoundingClientRect().width);
    // 执行拖拽操作(向右拖拽50px)
    const barBox = await dragBar.boundingBox();
    if (barBox) {
      await contentPage.mouse.move(barBox.x + barBox.width / 2, barBox.y + barBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(barBox.x + 50, barBox.y + barBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(300);
    // 验证宽度发生变化
    const newWidth = await banner.evaluate(el => el.getBoundingClientRect().width);
    expect(newWidth).not.toBe(initialWidth);
  });

  // 测试用例3: 拖拽时显示宽度指示器
  test('拖拽时显示宽度指示器', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 获取拖拽条
    const dragBar = contentPage.locator('.banner .bar');
    const indicator = contentPage.locator('.banner .indicator');
    // 开始拖拽
    const barBox = await dragBar.boundingBox();
    if (barBox) {
      await contentPage.mouse.move(barBox.x + barBox.width / 2, barBox.y + barBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(barBox.x + 20, barBox.y + barBox.height / 2);
      // 验证拖拽时指示器显示
      await expect(indicator).toBeVisible({ timeout: 5000 });
      // 验证指示器包含"双击还原"提示
      await expect(indicator).toContainText('双击还原');
      await contentPage.mouse.up();
    }
  });

  // 测试用例4: 宽度不会小于最小值
  test('宽度不会小于最小值', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 获取拖拽条和banner容器
    const dragBar = contentPage.locator('.banner .bar');
    const banner = contentPage.locator('.banner.drag-wrap');
    // 向左拖拽很大距离(尝试超过最小值限制)
    const barBox = await dragBar.boundingBox();
    if (barBox) {
      await contentPage.mouse.move(barBox.x + barBox.width / 2, barBox.y + barBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(barBox.x - 500, barBox.y + barBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(300);
    // 验证宽度不小于最小值280px
    const width = await banner.evaluate(el => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThanOrEqual(280);
  });

  // 测试用例5: 宽度不会大于最大值
  test('宽度不会大于最大值', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 获取拖拽条和banner容器
    const dragBar = contentPage.locator('.banner .bar');
    const banner = contentPage.locator('.banner.drag-wrap');
    // 向右拖拽很大距离(尝试超过最大值限制)
    const barBox = await dragBar.boundingBox();
    if (barBox) {
      await contentPage.mouse.move(barBox.x + barBox.width / 2, barBox.y + barBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(barBox.x + 500, barBox.y + barBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(300);
    // 验证宽度不大于最大值450px
    const width = await banner.evaluate(el => el.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(450);
  });

  // 测试用例6: 双击拖拽条还原默认宽度
  test('双击拖拽条还原默认宽度', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 获取拖拽条和banner容器
    const dragBar = contentPage.locator('.banner .bar');
    const banner = contentPage.locator('.banner.drag-wrap');
    // 先拖拽改变宽度
    const barBox = await dragBar.boundingBox();
    if (barBox) {
      await contentPage.mouse.move(barBox.x + barBox.width / 2, barBox.y + barBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(barBox.x + 80, barBox.y + barBox.height / 2);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(300);
    const changedWidth = await banner.evaluate(el => el.getBoundingClientRect().width);
    // 双击拖拽条还原
    await dragBar.dblclick();
    await contentPage.waitForTimeout(300);
    // 验证宽度还原为默认值300px
    const restoredWidth = await banner.evaluate(el => el.getBoundingClientRect().width);
    expect(restoredWidth).toBe(300);
    expect(restoredWidth).not.toBe(changedWidth);
  });

  // 测试用例7: 拖拽时拖拽条高亮
  test('拖拽时拖拽条高亮', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 获取拖拽条
    const dragBar = contentPage.locator('.banner .bar');
    // 开始拖拽
    const barBox = await dragBar.boundingBox();
    if (barBox) {
      await contentPage.mouse.move(barBox.x + barBox.width / 2, barBox.y + barBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.mouse.move(barBox.x + 20, barBox.y + barBox.height / 2);
      // 验证拖拽时拖拽条有active类
      await expect(dragBar).toHaveClass(/active/);
      await contentPage.mouse.up();
    }
  });

  // ========================= Mock呼吸动画测试 =========================
  // 测试用例8: httpMockNode存在时可以创建Mock节点
  test('httpMockNode启动后显示呼吸动画', async ({ contentPage, clearCache, createProject, createNode }) => {
    test.setTimeout(120000);
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'httpMock', name: '呼吸Mock' });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 10000 });
    const mockNode = bannerTree.locator('.el-tree-node__content', { hasText: '呼吸Mock' }).first();
    await expect(mockNode).toBeVisible({ timeout: 10000 });

    // 启动 Mock 服务
    await mockNode.click({ button: 'right' });
    const startMockItem = contentPage.locator('.s-contextmenu .s-contextmenu-item').filter({ hasText: /启动mock/ }).first();
    await expect(startMockItem).toBeVisible({ timeout: 10000 });
    await startMockItem.click();

    const runningDot = mockNode.locator('.mock-status .status-dot.running');
    await expect(runningDot).toBeVisible({ timeout: 30000 });
    await expect(runningDot).toHaveClass(/running/);

    // 停止 Mock 服务，避免影响后续用例
    await mockNode.click({ button: 'right' });
    const stopMockItem = contentPage.locator('.s-contextmenu .s-contextmenu-item').filter({ hasText: /停止mock/ }).first();
    await expect(stopMockItem).toBeVisible({ timeout: 10000 });
    await stopMockItem.click();
    await expect(runningDot).toBeHidden({ timeout: 30000 });
  });
  test('切换到调用历史标签页后显示历史列表', async ({ contentPage, clearCache, createProject }) => {
    test.setTimeout(60000);
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(1000);
    // 点击调用历史标签页（tab header 由 CleanTabs 渲染，class 为 clean-tabs__item）
    const bannerTabs = contentPage.getByTestId('banner-tabs');
    await expect(bannerTabs).toBeVisible({ timeout: 5000 });
    const historyTab = bannerTabs.locator('.clean-tabs__item', { hasText: /调用历史/ });
    await expect(historyTab).toBeVisible({ timeout: 5000 });
    await historyTab.click();
    await contentPage.waitForTimeout(500);
    // 验证调用历史组件显示
    const sendHistory = contentPage.locator('.send-history');
    await expect(sendHistory).toBeVisible({ timeout: 10000 });
  });
});


