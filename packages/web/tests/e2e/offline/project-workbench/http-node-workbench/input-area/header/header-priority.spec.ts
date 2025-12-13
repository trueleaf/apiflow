import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('HeaderPriority', () => {
  // 测试用例1: 自定义请求头优先级大于公共请求头,相同key时自定义header值被发送
  test('自定义请求头优先级大于公共请求头,相同key时自定义header值被发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 打开公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    // 添加公共请求头: X-Custom=from-common
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('X-Custom');
    await valueInputs.first().click();
    await contentPage.keyboard.type('from-common');
    await contentPage.waitForTimeout(300);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('请求头优先级测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义请求头: X-Custom=from-custom
    const headerKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const headerValueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await headerKeyInputs.first().fill('X-Custom');
    await headerValueInputs.first().click();
    await contentPage.keyboard.type('from-custom');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    // 验证自定义请求头的值优先级最高,服务器接收到X-Custom=from-custom
    await expect(responseBody).toContainText('from-custom', { timeout: 10000 });
  });
  // 测试用例2: 公共请求头优先级大于可更改的默认请求头(User-Agent)
  test('公共请求头优先级大于可更改的默认请求头', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 打开公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    // 添加公共请求头覆盖User-Agent
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('User-Agent');
    await valueInputs.first().click();
    await contentPage.keyboard.type('CustomAgent/1.0');
    await contentPage.waitForTimeout(300);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('公共请求头优先级测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    // 验证公共请求头覆盖了默认的User-Agent
    await expect(responseBody).toContainText('CustomAgent/1.0', { timeout: 10000 });
  });
  // 测试用例3: 自定义请求头优先级大于默认请求头(User-Agent)
  test('自定义请求头优先级大于默认请求头', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('自定义请求头覆盖默认值测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义请求头覆盖User-Agent
    const headerKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const headerValueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await headerKeyInputs.first().fill('User-Agent');
    await headerValueInputs.first().click();
    await contentPage.keyboard.type('MyCustomAgent/2.0');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    // 验证自定义请求头覆盖了默认的User-Agent
    await expect(responseBody).toContainText('MyCustomAgent/2.0', { timeout: 10000 });
  });
  // 测试用例4: 完整优先级链验证 - 自定义header > 公共header > 默认header
  test('完整优先级链验证 - 自定义header优先级高于公共header优先级高于默认header', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 打开公共请求头设置
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const commonHeaderItem = contextMenu.locator('.s-contextmenu-item', { hasText: /设置公共请求头/ });
    await commonHeaderItem.click();
    await contentPage.waitForTimeout(500);
    // 添加公共请求头覆盖User-Agent
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const valueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await keyInputs.first().fill('User-Agent');
    await valueInputs.first().click();
    await contentPage.keyboard.type('CommonAgent/1.0');
    await contentPage.waitForTimeout(300);
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('完整优先级链测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Headers标签页
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    // 添加自定义请求头覆盖User-Agent
    const headerKeyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    const headerValueInputs = contentPage.locator('[data-testid="params-tree-value-input"]');
    await headerKeyInputs.first().fill('User-Agent');
    await headerValueInputs.first().click();
    await contentPage.keyboard.type('CustomAgent/2.0');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(2000);
    // 验证响应
    const responseBody = contentPage.locator('.response-body');
    // 验证自定义请求头优先级最高,即使公共请求头也设置了相同的key
    await expect(responseBody).toContainText('CustomAgent/2.0', { timeout: 10000 });
  });
});
