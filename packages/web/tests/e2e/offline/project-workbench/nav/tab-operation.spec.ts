import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('TabOperation', () => {
  // 测试用例1: 点击关闭按钮关闭当前tab
  test('点击关闭按钮关闭当前tab', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('关闭测试接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 验证tab存在
    const tab = contentPage.locator('.nav .item').filter({ hasText: '关闭测试接口' });
    await expect(tab).toBeVisible({ timeout: 3000 });
    // 点击关闭按钮
    const closeBtn = tab.locator('[data-testid="project-nav-tab-close-btn"]');
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证tab不存在
    await expect(tab).not.toBeVisible({ timeout: 3000 });
  });
  // 测试用例2: 右键菜单关闭当前tab
  test('右键菜单关闭当前tab', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('右键关闭测试');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 右键点击tab
    const tab = contentPage.locator('.nav .item').filter({ hasText: '右键关闭测试' });
    await tab.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    // 点击关闭菜单项
    const closeMenuItem = contentPage.locator('[data-testid="contextmenu-item-关闭"], [data-testid="contextmenu-item-Close"]');
    await closeMenuItem.click();
    await contentPage.waitForTimeout(300);
    // 验证tab不存在
    await expect(tab).not.toBeVisible({ timeout: 3000 });
  });
  // 测试用例3: 右键菜单关闭左侧tab
  test('右键菜单关闭左侧tab', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增三个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    for (let i = 1; i <= 3; i++) {
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      await addFileDialog.locator('input').first().fill(`左侧测试${i}`);
      await addFileDialog.locator('.el-button--primary').last().click();
      await contentPage.waitForTimeout(500);
    }
    // 右键点击第三个tab
    const tab3 = contentPage.locator('.nav .item').filter({ hasText: '左侧测试3' });
    await tab3.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    // 点击关闭左侧
    const closeLeftMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: /关闭左侧|Close Left/ });
    await closeLeftMenuItem.click();
    await contentPage.waitForTimeout(300);
    // 验证左侧tab不存在
    await expect(contentPage.locator('.nav .item').filter({ hasText: '左侧测试1' })).not.toBeVisible();
    await expect(contentPage.locator('.nav .item').filter({ hasText: '左侧测试2' })).not.toBeVisible();
    // 验证第三个tab仍然存在
    await expect(tab3).toBeVisible();
  });
  // 测试用例4: 右键菜单关闭右侧tab
  test('右键菜单关闭右侧tab', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增三个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    for (let i = 1; i <= 3; i++) {
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      await addFileDialog.locator('input').first().fill(`右侧测试${i}`);
      await addFileDialog.locator('.el-button--primary').last().click();
      await contentPage.waitForTimeout(500);
    }
    // 右键点击第一个tab
    const tab1 = contentPage.locator('.nav .item').filter({ hasText: '右侧测试1' });
    await tab1.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    // 点击关闭右侧
    const closeRightMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: /关闭右侧|Close Right/ });
    await closeRightMenuItem.click();
    await contentPage.waitForTimeout(300);
    // 验证右侧tab不存在
    await expect(contentPage.locator('.nav .item').filter({ hasText: '右侧测试2' })).not.toBeVisible();
    await expect(contentPage.locator('.nav .item').filter({ hasText: '右侧测试3' })).not.toBeVisible();
    // 验证第一个tab仍然存在
    await expect(tab1).toBeVisible();
  });
  // 测试用例5: 右键菜单关闭其他tab
  test('右键菜单关闭其他tab', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增三个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    for (let i = 1; i <= 3; i++) {
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      await addFileDialog.locator('input').first().fill(`其他测试${i}`);
      await addFileDialog.locator('.el-button--primary').last().click();
      await contentPage.waitForTimeout(500);
    }
    // 右键点击第二个tab
    const tab2 = contentPage.locator('.nav .item').filter({ hasText: '其他测试2' });
    await tab2.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    // 点击关闭其他
    const closeOtherMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: /关闭其他|Close Other/ });
    await closeOtherMenuItem.click();
    await contentPage.waitForTimeout(300);
    // 验证其他tab不存在
    await expect(contentPage.locator('.nav .item').filter({ hasText: '其他测试1' })).not.toBeVisible();
    await expect(contentPage.locator('.nav .item').filter({ hasText: '其他测试3' })).not.toBeVisible();
    // 验证第二个tab仍然存在且是唯一的tab
    await expect(tab2).toBeVisible();
    const tabCount = await contentPage.locator('.nav .drag-wrap .item').count();
    expect(tabCount).toBe(1);
  });
  // 测试用例6: 右键菜单全部关闭
  test('右键菜单全部关闭', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增两个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    for (let i = 1; i <= 2; i++) {
      await addFileBtn.click();
      const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
      await expect(addFileDialog).toBeVisible({ timeout: 5000 });
      await addFileDialog.locator('input').first().fill(`全部关闭${i}`);
      await addFileDialog.locator('.el-button--primary').last().click();
      await contentPage.waitForTimeout(500);
    }
    // 右键点击任意tab
    const tab = contentPage.locator('.nav .item').first();
    await tab.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    // 点击全部关闭
    const closeAllMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: /全部关闭|Close All/ }).first();
    await closeAllMenuItem.click();
    await contentPage.waitForTimeout(500);
    // 验证没有tab
    const tabCount = await contentPage.locator('.nav .drag-wrap .item').count();
    expect(tabCount).toBe(0);
  });
  // 测试用例7: 点击tab切换选中状态
  test('点击tab切换选中状态', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增两个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('选中测试A');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('选中测试B');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 验证B是当前激活的
    const tabB = contentPage.locator('.nav .item').filter({ hasText: '选中测试B' });
    await expect(tabB).toHaveClass(/active/);
    // 点击A
    const tabA = contentPage.locator('.nav .item').filter({ hasText: '选中测试A' });
    await tabA.click();
    await contentPage.waitForTimeout(300);
    // 验证A是当前激活的
    await expect(tabA).toHaveClass(/active/);
    await expect(tabB).not.toHaveClass(/active/);
  });
  // 测试用例8: 新增空白接口按钮功能
  test('新增空白接口按钮功能', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 获取初始tab数量
    const initialCount = await contentPage.locator('.nav .drag-wrap .item').count();
    // 点击新增空白接口按钮
    const addTabBtn = contentPage.locator('[data-testid="project-nav-add-tab-btn"]');
    await addTabBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证tab数量增加
    const newCount = await contentPage.locator('.nav .drag-wrap .item').count();
    expect(newCount).toBe(initialCount + 1);
    // 验证新增的tab是激活状态
    const activeTab = contentPage.locator('.nav .item.active');
    await expect(activeTab).toContainText(/未命名接口|Untitled/);
  });
  // 测试用例9: 双击tab固定非固定页签
  test('双击tab固定非固定页签', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('双击固定测试');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 关闭固定tab
    await contentPage.locator('[data-testid="project-nav-tab-close-btn"]').first().click();
    await contentPage.waitForTimeout(300);
    // 单击产生非固定tab
    const bannerNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '双击固定测试' }).first();
    await bannerNode.click();
    await contentPage.waitForTimeout(300);
    // 验证为非固定状态
    const tab = contentPage.locator('.nav .item.active');
    const itemText = tab.locator('.item-text');
    await expect(itemText).toHaveClass(/unfixed/);
    // 双击tab固定
    await tab.dblclick();
    await contentPage.waitForTimeout(300);
    // 验证变为固定状态
    await expect(itemText).not.toHaveClass(/unfixed/);
  });
});
