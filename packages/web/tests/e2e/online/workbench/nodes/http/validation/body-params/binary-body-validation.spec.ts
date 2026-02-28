import { test, expect } from '../../../../../../../fixtures/electron-online.fixture';

test.describe('BinaryBodyValidation', () => {
  // 切换到 Binary 后应展示二级模式入口
  test('切换Body类型为Binary后显示Binary选项', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'Binary测试接口' });
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first();
    await binaryRadio.click();
    const binaryWrap = contentPage.locator('.binary-wrap');
    await expect(binaryWrap).toBeVisible({ timeout: 5000 });
    await expect(binaryWrap.locator('.el-radio', { hasText: /变量模式/ })).toBeVisible({ timeout: 5000 });
    await expect(binaryWrap.locator('.el-radio', { hasText: /文件模式/ })).toBeVisible({ timeout: 5000 });
  });
  // Binary 变量模式下应展示变量输入框
  test('Binary变量模式输入框可见', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'Binary变量模式测试' });
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first().click();
    const binaryWrap = contentPage.locator('.binary-wrap');
    await binaryWrap.locator('.el-radio', { hasText: /变量模式/ }).click();
    await expect(contentPage.locator('.var-mode .el-input input')).toBeVisible({ timeout: 5000 });
  });
  // Binary 变量模式应可录入变量表达式
  test('Binary变量模式可以输入变量', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'Binary变量输入测试' });
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first().click();
    await contentPage.locator('.binary-wrap .el-radio', { hasText: /变量模式/ }).click();
    const varInput = contentPage.locator('.var-mode .el-input input');
    await varInput.fill('{{fileValue}}');
    await expect(varInput).toHaveValue('{{fileValue}}');
  });
  // Binary 文件模式应展示文件选择区域
  test('Binary文件模式选择文件按钮可见', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'Binary文件模式测试' });
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first().click();
    await contentPage.locator('.binary-wrap .el-radio', { hasText: /文件模式/ }).click();
    const fileModeDiv = contentPage.locator('.file-mode');
    await expect(fileModeDiv).toBeVisible({ timeout: 5000 });
    await expect(fileModeDiv).toContainText(/选择文件/);
  });
  // Binary 应支持在变量模式和文件模式间切换
  test('Binary模式切换在变量和文件之间', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'Binary模式切换测试' });
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first().click();
    const binaryWrap = contentPage.locator('.binary-wrap');
    await binaryWrap.locator('.el-radio', { hasText: /文件模式/ }).click();
    const fileModeDiv = contentPage.locator('.file-mode');
    await expect(fileModeDiv).toBeVisible({ timeout: 5000 });
    await binaryWrap.locator('.el-radio', { hasText: /变量模式/ }).click();
    await expect(contentPage.locator('.var-mode')).toBeVisible({ timeout: 5000 });
    await expect(fileModeDiv).toBeHidden({ timeout: 5000 });
  });
  // POST 方法下应允许使用 Binary Body
  test('POST方法下可以选择Binary类型', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'POST Binary测试' });
    // 切换请求方法后验证 Binary 仍可用
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.getByRole('option', { name: 'POST' }).click();
    await contentPage.locator('[data-testid="http-params-tab-body"]').click();
    await contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first().click();
    await expect(contentPage.locator('.binary-wrap')).toBeVisible({ timeout: 5000 });
  });
  // PUT 方法下应允许使用 Binary Body
  test('PUT方法下可以选择Binary类型', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'PUT Binary测试' });
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.getByRole('option', { name: 'PUT' }).click();
    await contentPage.locator('[data-testid="http-params-tab-body"]').click();
    await contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first().click();
    await expect(contentPage.locator('.binary-wrap')).toBeVisible({ timeout: 5000 });
  });
  // PATCH 方法下应允许使用 Binary Body
  test('PATCH方法下可以选择Binary类型', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'PATCH Binary测试' });
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.getByRole('option', { name: 'PATCH' }).click();
    await contentPage.locator('[data-testid="http-params-tab-body"]').click();
    await contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first().click();
    await expect(contentPage.locator('.binary-wrap')).toBeVisible({ timeout: 5000 });
  });
  // Binary 变量值在标签切换后应保持
  test('Binary变量模式输入值在切换tab后保持', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'Binary值保持测试' });
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    const queryTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await bodyTab.click();
    await contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first().click();
    await contentPage.locator('.binary-wrap .el-radio', { hasText: /变量模式/ }).click();
    const varInput = contentPage.locator('.var-mode .el-input input');
    await varInput.fill('{{testBinaryVar}}');
    // 在参数标签间来回切换验证输入持久化
    await queryTab.click();
    await bodyTab.click();
    await expect(varInput).toHaveValue('{{testBinaryVar}}');
  });
  // Binary 模式选择在标签切换后应保持
  test('Binary模式选择在切换tab后保持', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'Binary模式保持测试' });
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    const queryTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await bodyTab.click();
    await contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first().click();
    await contentPage.locator('.binary-wrap .el-radio', { hasText: /文件模式/ }).click();
    const fileModeDiv = contentPage.locator('.file-mode');
    await expect(fileModeDiv).toBeVisible({ timeout: 5000 });
    await queryTab.click();
    await bodyTab.click();
    await expect(fileModeDiv).toBeVisible({ timeout: 5000 });
  });
  // Binary 与 JSON 来回切换后应恢复之前的 Binary 输入值
  test('从Binary切换到JSON类型后再切回Binary', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'Binary切换测试' });
    await contentPage.locator('[data-testid="http-params-tab-body"]').click();
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first();
    const jsonRadio = contentPage.locator('.body-params .el-radio', { hasText: /json/i }).first();
    await binaryRadio.click();
    await contentPage.locator('.binary-wrap .el-radio', { hasText: /变量模式/ }).click();
    const varInput = contentPage.locator('.var-mode .el-input input');
    await expect(varInput).toBeVisible({ timeout: 5000 });
    await varInput.fill('{{myBinaryData}}');
    await jsonRadio.click();
    await expect(contentPage.locator('.binary-wrap')).toBeHidden({ timeout: 5000 });
    await binaryRadio.click();
    await expect(contentPage.locator('.binary-wrap')).toBeVisible({ timeout: 5000 });
    await expect(contentPage.locator('.var-mode .el-input input')).toHaveValue('{{myBinaryData}}');
  });
  // Binary 变量模式输入框应提供变量格式提示
  test('Binary变量模式输入框有正确的placeholder提示', async ({ contentPage, clearCache, loginAccount, createProject, createNode }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 10000 });
    await createNode(contentPage, { nodeType: 'http', name: 'Binary placeholder测试' });
    await contentPage.locator('[data-testid="http-params-tab-body"]').click();
    await contentPage.locator('.body-params .el-radio', { hasText: /binary/i }).first().click();
    await contentPage.locator('.binary-wrap .el-radio', { hasText: /变量模式/ }).click();
    const placeholder = await contentPage.locator('.var-mode .el-input input').getAttribute('placeholder');
    expect(placeholder || '').toContain('{{');
    expect(placeholder || '').toContain('}}');
  });
});
