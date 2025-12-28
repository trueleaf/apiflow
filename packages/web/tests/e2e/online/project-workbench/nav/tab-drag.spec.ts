import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('TabDrag', () => {
  // 测试用例1: 拖拽tab页签改变顺序
  test('拖拽tab页签改变顺序', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();/.*#\/workbench.*/
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增多个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('接口1');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('接口2');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('接口3');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 获取初始顺序
    const tabs = contentPage.locator('.nav .drag-wrap .item');
    const initialFirstTabText = await tabs.first().locator('.item-text').textContent();
    // 验证初始第一个是接口1
    expect(initialFirstTabText).toContain('接口1');
    // 拖拽接口3到接口1的位置
    const tab3 = contentPage.locator('.nav .item').filter({ hasText: '接口3' });
    const tab1 = contentPage.locator('.nav .item').filter({ hasText: '接口1' });
    const tab1Box = await tab1.boundingBox();
    if (tab1Box) {
      await tab3.dragTo(tab1, { targetPosition: { x: 10, y: tab1Box.height / 2 } });
    }
    await contentPage.waitForTimeout(500);
    // 验证顺序改变
    const newFirstTabText = await tabs.first().locator('.item-text').textContent();
    expect(newFirstTabText).toContain('接口3');
  });
  // 测试用例2: 拖拽tab页签后激活状态保持
  test('拖拽tab页签后激活状态保持', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();/.*#\/workbench.*/
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增两个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('拖拽A');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('拖拽B');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 选中拖拽A
    const tabA = contentPage.locator('.nav .item').filter({ hasText: '拖拽A' });
    await tabA.click();
    await contentPage.waitForTimeout(300);
    // 验证A是激活状态
    await expect(tabA).toHaveClass(/active/);
    // 拖拽A到B的右边
    const tabB = contentPage.locator('.nav .item').filter({ hasText: '拖拽B' });
    const tabBBox = await tabB.boundingBox();
    if (tabBBox) {
      await tabA.dragTo(tabB, { targetPosition: { x: tabBBox.width - 10, y: tabBBox.height / 2 } });
    }
    await contentPage.waitForTimeout(500);
    // 验证A仍然是激活状态
    const activeTab = contentPage.locator('.nav .item.active');
    await expect(activeTab).toContainText('拖拽A');
  });
  // 测试用例3: 拖拽后页签数量不变
  test('拖拽后页签数量不变', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
/.*#\/workbench.*/
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增三个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    for (let i = 1; i <= 3; i++) {
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      await addFileDialog.locator('input').first().fill(`数量测试${i}`);
      await addFileDialog.locator('.el-button--primary').last().click();
      await contentPage.waitForTimeout(500);
    }
    // 获取初始tab数量
    const initialCount = await contentPage.locator('.nav .drag-wrap .item').count();
    expect(initialCount).toBe(3);
    // 拖拽第一个到最后
    const firstTab = contentPage.locator('.nav .drag-wrap .item').first();
    const lastTab = contentPage.locator('.nav .drag-wrap .item').last();
    const lastTabBox = await lastTab.boundingBox();
    if (lastTabBox) {
      await firstTab.dragTo(lastTab, { targetPosition: { x: lastTabBox.width - 10, y: lastTabBox.height / 2 } });
    }
    await contentPage.waitForTimeout(500);
    // 验证tab数量不变
    const finalCount = await contentPage.locator('.nav .drag-wrap .item').count();
    expect(finalCount).toBe(initialCount);
  });
  // 测试用例4: 拖拽单个tab时无变化
  test('只有单个tab时拖拽无变化', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();/.*#\/workbench.*/

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增一个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('单个拖拽测试');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 验证只有一个tab
    const tabCount = await contentPage.locator('.nav .drag-wrap .item').count();
    expect(tabCount).toBe(1);
    // 尝试拖拽
    const tab = contentPage.locator('.nav .drag-wrap .item').first();
    const tabBox = await tab.boundingBox();
    if (tabBox) {
      await tab.dragTo(tab, { targetPosition: { x: tabBox.width / 2, y: tabBox.height / 2 } });
    }
    await contentPage.waitForTimeout(300);
    // 验证tab仍然存在且激活
    await expect(tab).toHaveClass(/active/);
    await expect(tab).toContainText('单个拖拽测试');
  });
  // 测试用例5: 拖拽后固定状态保持
  test('拖拽后固定状态保持', async ({ cont/.*#\/workbench.*/oject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增两个HTTP节点（新增时为固定状态）
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('固定状态A');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('固定状态B');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 验证A是固定状态
    const tabA = contentPage.locator('.nav .item').filter({ hasText: '固定状态A' });
    const itemTextA = tabA.locator('.item-text');
    await expect(itemTextA).not.toHaveClass(/unfixed/);
    // 拖拽A到B后面
    const tabB = contentPage.locator('.nav .item').filter({ hasText: '固定状态B' });
    const tabBBox = await tabB.boundingBox();
    if (tabBBox) {
      await tabA.dragTo(tabB, { targetPosition: { x: tabBBox.width - 10, y: tabBBox.height / 2 } });
    }
    await contentPage.waitForTimeout(500);
    // 验证A仍然是固定状态
    const movedTabA = contentPage.locator('.nav .item').filter({ hasText: '固定状态A' });
    const movedItemTextA = movedTabA.locator('.item-text');
    await expect(movedItemTextA).not.toHaveClass(/unfixed/);
  });
});
