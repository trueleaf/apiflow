import { test, expect } from '../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('CookieBusiness', () => {
  test('Set-Cookie 保存后续请求自动携带(含覆盖更新)', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie业务测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 发送第一个请求设置cookie(old_value)
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/override/old_value`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 发送第二个请求覆盖cookie(new_value)
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/override/new_value`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 发送echo请求验证自动携带的cookie值
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 验证cookie已被更新为new_value，而不是old_value
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('af_override=new_value', { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_override=old_value', { timeout: 10000 });
  });

  test('Path 匹配：仅在匹配路径下携带 Cookie', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie Path 匹配测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    // 设置带有path属性的cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/path`);
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 发送匹配path的请求，应携带cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/path-only/1`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('af_path=path_value', { timeout: 10000 });
    // 发送不匹配path的请求，不应携带cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/other`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_path=path_value', { timeout: 10000 });
  });

  test('手动 Cookie 请求头完全覆盖自动注入', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie 手动覆盖测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    // 发送请求设置自动cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/basic`);
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 切换到Headers页签手动添加Cookie请求头
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    const headerKeyAutocomplete = contentPage.getByTestId('params-tree-key-autocomplete');
    const headerKeyInputs = contentPage.getByTestId('params-tree-key-input');
    const headerValueInputs = contentPage.getByTestId('params-tree-value-input');
    const headerKeyAutocompleteCount = await headerKeyAutocomplete.count();
    if (headerKeyAutocompleteCount > 0) {
      await headerKeyAutocomplete.first().locator('input').fill('Cookie');
    } else {
      await headerKeyInputs.first().fill('Cookie');
    }
    // 输入手动cookie值
    await headerValueInputs.first().click();
    await contentPage.keyboard.type('manual_cookie=1');
    await contentPage.waitForTimeout(300);
    // 发送请求验证手动cookie完全覆盖自动cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('manual_cookie=1', { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_basic=basic_value', { timeout: 10000 });
  });

  test('跨 host 不携带 Cookie', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie 跨 host 测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/basic`);
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await urlInput.fill(`http://[::1]:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).not.toContainText('af_basic=basic_value', { timeout: 10000 });
  });

  test('Domain 属性不匹配时忽略 Cookie', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie Domain 不匹配测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/domain-mismatch`);
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).not.toContainText('af_domain_mismatch=1', { timeout: 10000 });
  });

  test('Max-Age=0 删除 Cookie', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie 删除测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/basic`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('af_basic=basic_value', { timeout: 10000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/delete-basic`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_basic=basic_value', { timeout: 10000 });
  });

  test('同名不同 Path 发送顺序：更长 Path 在前', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie Path 顺序测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/order`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/path-only/1`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('af_order=long; af_order=short', { timeout: 10000 });
  });

  test('默认 Path：未设置 Path 使用目录', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie 默认 Path 测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/set-cookie/default-path/dir/leaf`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/set-cookie/default-path/dir/next`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('af_default_path=1', { timeout: 10000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/set-cookie/default-path/other`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_default_path=1', { timeout: 10000 });
  });

  test('手动添加Cookie-Domain属性精确匹配', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 手动添加Cookie: domain=127.0.0.1
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog:visible').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('domain_exact');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('exact_value');
    const domainInput = addDialog.locator('.el-form-item').filter({ hasText: /^域名/ }).locator('input');
    await domainInput.fill('127.0.0.1');
    const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 再添加一个不匹配域名的Cookie，用于精确匹配对比
    await addBtn.click();
    const mismatchDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(mismatchDialog).toBeVisible({ timeout: 5000 });
    const mismatchNameInput = mismatchDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await mismatchNameInput.fill('domain_mismatch_manual');
    const mismatchValueInput = mismatchDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await mismatchValueInput.fill('mismatch_value');
    const mismatchDomainInput = mismatchDialog.locator('.el-form-item').filter({ hasText: /^域名/ }).locator('input');
    await mismatchDomainInput.fill('localhost');
    const mismatchSaveBtn = mismatchDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await mismatchSaveBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭Cookie管理页面
    const cookieTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: /Cookies/i }).first();
    const closeBtn = cookieTab.locator('[data-testid="project-nav-tab-close-btn"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Domain精确匹配测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 发送请求到127.0.0.1，只携带精确匹配域名Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).toContainText('domain_exact=exact_value', { timeout: 10000 });
    await expect(responseBody).not.toContainText('domain_mismatch_manual=mismatch_value', { timeout: 10000 });
  });

  test('手动添加Cookie-Path属性路径匹配', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面手动添加Cookie
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 添加Cookie: path=/echo/sub
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('path_test');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('path_value');
    const pathInput = addDialog.locator('.el-form-item').filter({ hasText: /^路径/ }).locator('input');
    await pathInput.fill('/echo/sub');
    const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭Cookie管理页面
    const cookieTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: /Cookies/i }).first();
    const closeBtn = cookieTab.locator('[data-testid="project-nav-tab-close-btn"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Path匹配测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 发送请求到/echo/sub/page，应携带Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/sub/page`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).toContainText('path_test=path_value', { timeout: 10000 });
    // 发送请求到/echo，不应携带Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).not.toContainText('path_test=path_value', { timeout: 10000 });
    // 发送请求到/echo/other，不应携带Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/other`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).not.toContainText('path_test=path_value', { timeout: 10000 });
  });

  test('手动添加Cookie-Expires属性过期Cookie不发送', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 添加过期Cookie: expires设置为1小时前
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('expired');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('expired_value');
    // 通过输入框直接设置过期时间为1小时前
    const expiresInput = addDialog.locator('.el-date-editor input').first();
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const year = oneHourAgo.getFullYear();
    const month = `${oneHourAgo.getMonth() + 1}`.padStart(2, '0');
    const day = `${oneHourAgo.getDate()}`.padStart(2, '0');
    const hour = `${oneHourAgo.getHours()}`.padStart(2, '0');
    const minute = `${oneHourAgo.getMinutes()}`.padStart(2, '0');
    const second = `${oneHourAgo.getSeconds()}`.padStart(2, '0');
    await expiresInput.click();
    await expiresInput.fill(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
    await addDialog.locator('.el-dialog__title').click();
    await contentPage.waitForTimeout(300);
    const saveBtn = addDialog.locator('.el-dialog__footer .el-button--primary').first();
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭Cookie管理页面
    const cookieTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: /Cookies/i }).first();
    const closeBtn = cookieTab.locator('[data-testid="project-nav-tab-close-btn"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Expires过期测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 发送请求，不应携带过期Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).not.toContainText('expired=expired_value', { timeout: 10000 });
  });

  test('手动添加Cookie-Expires属性未过期Cookie正常发送', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 添加未过期Cookie: expires设置为24小时后
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('valid');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('valid_value');
    // 使用快捷方式设置24小时后过期
    const datePicker = addDialog.locator('.el-date-editor').first();
    await datePicker.click();
    await contentPage.waitForTimeout(300);
    const shortcut24h = contentPage.locator('.el-picker-panel__shortcut').filter({ hasText: /24小时后/ });
    await shortcut24h.click();
    await contentPage.waitForTimeout(300);
    const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭Cookie管理页面
    const cookieTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: /Cookies/i }).first();
    const closeBtn = cookieTab.locator('[data-testid="project-nav-tab-close-btn"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Expires未过期测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 发送请求，应携带未过期Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).toContainText('valid=valid_value', { timeout: 10000 });
  });

  test('手动添加Cookie-Secure属性HTTP请求不携带', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 添加secure=true的Cookie
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('secure_test');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('secure_value');
    // 开启Secure开关
    const secureSwitch = addDialog.locator('.el-form-item').filter({ hasText: /^Secure/ }).locator('.el-switch');
    await secureSwitch.click();
    const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭Cookie管理页面
    const cookieTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: /Cookies/i }).first();
    const closeBtn = cookieTab.locator('[data-testid="project-nav-tab-close-btn"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Secure属性测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 发送HTTP请求，不应携带secure=true的Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).not.toContainText('secure_test=secure_value', { timeout: 10000 });
  });

  test('手动添加Cookie-万能域名匹配所有请求', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 添加万能域名Cookie: domain为空
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('wildcard');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('wildcard_value');
    // domain留空，不填写
    const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭Cookie管理页面
    const cookieTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: /Cookies/i }).first();
    const closeBtn = cookieTab.locator('[data-testid="project-nav-tab-close-btn"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('万能域名测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 发送请求到127.0.0.1，应携带Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).toContainText('wildcard=wildcard_value', { timeout: 10000 });
    // 发送请求到localhost，也应携带Cookie
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).toContainText('wildcard=wildcard_value', { timeout: 10000 });
  });

  test('手动添加Cookie-特殊字符编码测试', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    // 添加包含空格和中文的Cookie
    await addBtn.click();
    let addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    let nameInput = addDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('special_chars');
    let valueInput = addDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('包含空格 和中文');
    let saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 添加包含emoji的Cookie
    await addBtn.click();
    addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    nameInput = addDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('emoji_test');
    valueInput = addDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('%F0%9F%98%80%F0%9F%8E%89');
    saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭Cookie管理页面
    const cookieTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: /Cookies/i }).first();
    const closeBtn = cookieTab.locator('[data-testid="project-nav-tab-close-btn"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('特殊字符编码测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 发送请求验证Cookie已正确编码
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 验证包含URL编码的Cookie字符串
    await expect(responseBody).toContainText('special_chars=', { timeout: 10000 });
    await expect(responseBody).toContainText('emoji_test=', { timeout: 10000 });
  });

  test('手动添加Cookie-多属性组合匹配', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 添加复杂组合Cookie: domain=127.0.0.1, path=/echo, secure=false
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('combo');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('combo_value');
    const domainInput = addDialog.locator('.el-form-item').filter({ hasText: /^域名/ }).locator('input');
    await domainInput.fill('127.0.0.1');
    const pathInput = addDialog.locator('.el-form-item').filter({ hasText: /^路径/ }).locator('input');
    await pathInput.fill('/echo/path-only');
    const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭Cookie管理页面
    const cookieTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: /Cookies/i }).first();
    const closeBtn = cookieTab.locator('[data-testid="project-nav-tab-close-btn"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('多属性组合测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 场景1: 完全匹配，应携带Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/path-only/value`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).toContainText('combo=combo_value', { timeout: 10000 });
    // 场景2: path不匹配，不应携带Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/other`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).not.toContainText('combo=combo_value', { timeout: 10000 });
    // 场景3: domain不匹配，不应携带Cookie
    await urlInput.fill(`http://localhost:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).not.toContainText('combo=combo_value', { timeout: 10000 });
  });

  test('手动添加Cookie-Cookie数量和大小', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    // 添加10个Cookie
    for (let i = 1; i <= 10; i++) {
      await addBtn.click();
      const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
      await expect(addDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
      await nameInput.fill(`cookie_${i}`);
      const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
      await valueInput.fill(`value_${i}`);
      const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
      await saveBtn.click();
      await contentPage.waitForTimeout(300);
    }
    // 关闭Cookie管理页面
    const cookieTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: /Cookies/i }).first();
    const closeBtn = cookieTab.locator('[data-testid="project-nav-tab-close-btn"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增HTTP请求文件
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie数量测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    // 发送请求验证所有Cookie都被携带
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 验证部分Cookie存在
    await expect(responseBody).toContainText('cookie_1=value_1', { timeout: 10000 });
    await expect(responseBody).toContainText('cookie_5=value_5', { timeout: 10000 });
    await expect(responseBody).toContainText('cookie_10=value_10', { timeout: 10000 });
  });
});


