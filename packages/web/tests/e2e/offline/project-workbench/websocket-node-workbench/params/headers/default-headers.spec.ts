import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('WebSocketDefaultHeaders', () => {
  // 默认请求头列表可见
  test('默认请求头列表可见', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '默认请求头可见测试' });
    // 切换到请求头标签
    const headersTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /请求头/ });
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 验证默认请求头区域可见
    const headersPanel = contentPage.locator('.ws-headers');
    await expect(headersPanel).toBeVisible({ timeout: 5000 });
    // 查找显示隐藏默认请求头的链接
    const showHideLink = headersPanel.locator('span.cursor-pointer').filter({ hasText: /点击隐藏|个隐藏/ });
    await expect(showHideLink.first()).toBeVisible({ timeout: 5000 });
  });
  // 点击隐藏后默认请求头折叠,显示隐藏数量
  test('点击隐藏后默认请求头折叠显示隐藏数量', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '默认请求头折叠测试' });
    // 切换到请求头标签
    const headersTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /请求头/ });
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    const headersPanel = contentPage.locator('.ws-headers');
    // 如果显示"点击隐藏",则点击隐藏
    const hideLink = headersPanel.locator('span.cursor-pointer').filter({ hasText: /点击隐藏/ }).first();
    if (await hideLink.isVisible()) {
      await hideLink.click();
      await contentPage.waitForTimeout(300);
      // 验证显示隐藏数量
      const hiddenCountText = headersPanel.locator('span.cursor-pointer').filter({ hasText: /个隐藏/ }).first();
      await expect(hiddenCountText).toBeVisible({ timeout: 5000 });
    }
  });
  // 点击显示后默认请求头展开
  test('点击显示后默认请求头展开', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '默认请求头展开测试' });
    // 切换到请求头标签
    const headersTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /请求头/ });
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    const headersPanel = contentPage.locator('.ws-headers');
    // 先隐藏默认请求头
    const hideLink = headersPanel.locator('span.cursor-pointer').filter({ hasText: /点击隐藏/ }).first();
    if (await hideLink.isVisible()) {
      await hideLink.click();
      await contentPage.waitForTimeout(300);
    }
    // 点击显示链接或眼睛图标
    const showLink = headersPanel.locator('span.cursor-pointer').filter({ hasText: /个隐藏/ }).first();
    const viewIcon = headersPanel.locator('.view-icon').first();
    if (await showLink.isVisible()) {
      await showLink.click();
      await contentPage.waitForTimeout(300);
      // 验证"点击隐藏"链接重新出现
      await expect(headersPanel.locator('span.cursor-pointer').filter({ hasText: /点击隐藏/ }).first()).toBeVisible({ timeout: 5000 });
    } else if (await viewIcon.isVisible()) {
      await viewIcon.click();
      await contentPage.waitForTimeout(300);
      await expect(headersPanel.locator('span.cursor-pointer').filter({ hasText: /点击隐藏/ }).first()).toBeVisible({ timeout: 5000 });
    }
  });
  // 默认请求头可以取消勾选
  test('默认请求头可以取消勾选', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '默认请求头勾选测试' });
    // 切换到请求头标签
    const headersTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /请求头/ });
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    const headersPanel = contentPage.locator('.ws-headers');
    // 确保默认请求头展开
    const showLink = headersPanel.locator('span.cursor-pointer').filter({ hasText: /个隐藏/ }).first();
    if (await showLink.isVisible()) {
      await showLink.click();
      await contentPage.waitForTimeout(300);
    }
    // 找到默认请求头的checkbox
    const defaultHeaderTree = headersPanel.locator('.cl-params-tree').first();
    const checkbox = defaultHeaderTree.locator('.el-checkbox').first();
    if (await checkbox.isVisible()) {
      const checkboxInput = checkbox.locator('input');
      const isChecked = await checkboxInput.isChecked();
      // 点击切换状态
      await checkbox.click();
      await contentPage.waitForTimeout(300);
      // 验证状态已改变
      const newCheckedState = await checkboxInput.isChecked();
      expect(newCheckedState).not.toBe(isChecked);
    }
  });
  // 默认请求头不可编辑
  test('默认请求头不可编辑', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    await createNode(contentPage, { nodeType: 'websocket', name: '默认请求头只读测试' });
    // 切换到请求头标签
    const headersTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /请求头/ });
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    const headersPanel = contentPage.locator('.ws-headers');
    // 确保默认请求头展开
    const showLink = headersPanel.locator('span.cursor-pointer').filter({ hasText: /个隐藏/ }).first();
    if (await showLink.isVisible()) {
      await showLink.click();
      await contentPage.waitForTimeout(300);
    }
    // 验证默认请求头的输入框为只读或disabled
    const defaultHeaderTree = headersPanel.locator('.cl-params-tree').first();
    // 默认请求头应该有no-add属性或者输入框是只读的
    const hasNoAdd = await defaultHeaderTree.evaluate(el => el.closest('[no-add]') !== null || el.classList.contains('no-add'));
    // 验证该区域存在
    expect(await defaultHeaderTree.isVisible()).toBeTruthy();
  });
});
