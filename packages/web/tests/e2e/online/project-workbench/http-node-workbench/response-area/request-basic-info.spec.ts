import { test, expect } from '../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('RequestBasicInfo', () => {
  // 测试用例1: 发送请求后,基本信息区域内容展示,需要展示请求地址,请求方式,维护人员,创建人员等
  test('发送请求后基本信息区域内容正确展示', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '基本信息测试接口' });
    // 设置URL并发送请求
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(200);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证基本信息区域
    const baseInfoView = contentPage.locator('.request-view');
    await expect(baseInfoView).toBeVisible({ timeout: 5000 });
    // 验证请求地址显示
    await expect(baseInfoView).toContainText(/请求地址|Request URL/);
    await expect(baseInfoView).toContainText(new RegExp(`http://(localhost|127\\.0\\.0\\.1):${MOCK_SERVER_PORT}/echo`));
    // 验证请求方式显示
    await expect(baseInfoView).toContainText(/请求方式|Request Method/);
    await expect(baseInfoView).toContainText('GET');
  });
  // 测试用例2: 发送请求后,验证请求方法颜色,验证各种请求方法颜色
  test('发送不同请求方法验证颜色显示正确', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: '请求方法颜色测试' });
    // 设置URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.click();
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await contentPage.waitForTimeout(200);
    // 测试GET方法 - 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证GET方法在基本信息区域显示并有颜色
    const baseInfoView = contentPage.locator('.request-view');
    await expect(baseInfoView).toBeVisible({ timeout: 5000 });
    const getMethodLabel = baseInfoView.locator('.label').filter({ hasText: 'GET' });
    await expect(getMethodLabel).toBeVisible({ timeout: 3000 });
    // 验证GET方法有颜色样式(style属性包含color)
    const getMethodStyle = await getMethodLabel.getAttribute('style');
    expect(getMethodStyle).toContain('color');
    // 切换为POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]').first();
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first();
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 发送POST请求
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证POST方法颜色
    const postMethodLabel = baseInfoView.locator('.label').filter({ hasText: 'POST' });
    await expect(postMethodLabel).toBeVisible({ timeout: 3000 });
    const postMethodStyle = await postMethodLabel.getAttribute('style');
    expect(postMethodStyle).toContain('color');
  });
});

