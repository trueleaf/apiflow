import { test, expect } from '../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('CookieBusiness', () => {
  test('Set-Cookie 保存后续请求自动携带(含覆盖更新)', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建测试接口
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie业务测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    // 发送第一个请求，设置 af_override=old_value
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/override/old_value`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 发送第二个请求，设置 af_override=new_value 覆盖旧值
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/override/new_value`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 发送请求验证自动携带最新的 Cookie 值
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo"/, { timeout: 10000 });
    // 验证携带的是新值而非旧值
    await expect(responseBody).toContainText('af_override=new_value', { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_override=old_value', { timeout: 10000 });
  });

  test('Path 匹配：仅在匹配路径下携带 Cookie', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建测试接口
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie Path 匹配测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    // 设置带 Path=/echo/path-only 限制的 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/path`);
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 访问匹配路径，应该携带 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/path-only/1`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo\/path-only\/1"/, { timeout: 10000 });
    await expect(responseBody).toContainText('af_path=path_value', { timeout: 10000 });
    // 访问不匹配路径，不应该携带 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/other`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo\/other"/, { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_path=path_value', { timeout: 10000 });
  });

  test('手动 Cookie 请求头完全覆盖自动注入', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建测试接口
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie 手动覆盖测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    // 先设置一个自动保存的 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/basic`);
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 切换到 Headers 标签页，手动添加 Cookie 请求头
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    const headerKeyAutocomplete = contentPage.getByTestId('params-tree-key-autocomplete');
    const headerKeyInputs = contentPage.getByTestId('params-tree-key-input');
    const headerValueInputs = contentPage.getByTestId('params-tree-value-input');
    await expect(headerValueInputs.first()).toBeVisible({ timeout: 5000 });
    const headerKeyAutocompleteCount = await headerKeyAutocomplete.count();
    if (headerKeyAutocompleteCount > 0) {
      await headerKeyAutocomplete.first().locator('input').fill('Cookie');
    } else {
      await headerKeyInputs.first().fill('Cookie');
    }
    await headerValueInputs.first().click();
    await contentPage.keyboard.type('manual_cookie=1');
    // 发送请求验证手动 Cookie 完全覆盖自动注入
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo"/, { timeout: 10000 });
    // 验证只有手动 Cookie，自动 Cookie 被完全覆盖
    await expect(responseBody).toContainText('manual_cookie=1', { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_basic=basic_value', { timeout: 10000 });
  });

  test('跨 host 不携带 Cookie', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建测试接口
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie 跨 host 测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    // 在 127.0.0.1 域名下设置 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/basic`);
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 访问不同的 host (::1 IPv6 地址)，验证不携带 Cookie
    await urlInput.fill(`http://[::1]:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo"/, { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_basic=basic_value', { timeout: 10000 });
  });

  test('Domain 属性不匹配时忽略 Cookie', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建测试接口
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie Domain 不匹配测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    // 设置一个 Domain 属性不匹配的 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/domain-mismatch`);
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 发送请求验证 Domain 不匹配的 Cookie 不会被携带
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo"/, { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_domain_mismatch=1', { timeout: 10000 });
  });

  test('Max-Age=0 删除 Cookie', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建测试接口
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie 删除测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    // 设置一个基础 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/basic`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 验证 Cookie 已保存并自动携带
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo"/, { timeout: 10000 });
    await expect(responseBody).toContainText('af_basic=basic_value', { timeout: 10000 });
    // 发送请求删除 Cookie (通过 Max-Age=0)
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/delete-basic`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 验证 Cookie 已被删除，不再自动携带
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo"/, { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_basic=basic_value', { timeout: 10000 });
  });

  test('同名不同 Path 发送顺序：更长 Path 在前', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建测试接口
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie Path 顺序测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    // 设置两个同名不同 Path 的 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/order`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 验证 Cookie 发送顺序：Path 更长的在前
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/path-only/1`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo\/path-only\/1"/, { timeout: 10000 });
    await expect(responseBody).toContainText('af_order=long; af_order=short', { timeout: 10000 });
  });

  test('默认 Path：未设置 Path 使用目录', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建测试接口
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie 默认 Path 测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    // 设置一个未指定 Path 的 Cookie，默认使用请求路径的目录部分
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/set-cookie/default-path/dir/leaf`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 访问同目录下的其他路径，应该携带 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/set-cookie/default-path/dir/next`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo\/set-cookie\/default-path\/dir\/next"/, { timeout: 10000 });
    await expect(responseBody).toContainText('af_default_path=1', { timeout: 10000 });
    // 访问不同目录，不应该携带 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/set-cookie/default-path/other`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo\/set-cookie\/default-path\/other"/, { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_default_path=1', { timeout: 10000 });
  });

  test('手动创建万能域名Cookie在实际请求中被自动携带', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 通过Cookie管理页面手动创建一个空domain(万能域名)Cookie
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const nameInput = dialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('af_universal');
    const valueInput = dialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('universal_val');
    // 不填domain,保持默认空(万能域名)
    const saveBtn = dialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    // 创建接口发送请求,验证万能域名Cookie被自动携带
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('万能域名测试');
    await addFileDialog.locator('.el-button--primary').last().click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText('af_universal=universal_val', { timeout: 10000 });
  });

  test('Expires 已过期的 Cookie 不应被携带', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建测试接口
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Cookie 过期测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    const responseArea = contentPage.getByTestId('response-area');
    // 设置一个已过期的 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/set-cookie/expired`);
    await sendBtn.click();
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    // 验证后续请求不携带该 Cookie
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    await sendBtn.click();
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.getByTestId('response-tab-body').locator('.s-json-editor').first();
    await expect(responseBody).toContainText(/"path"\s*:\s*"\/echo"/, { timeout: 10000 });
    await expect(responseBody).not.toContainText('af_expired=1', { timeout: 10000 });
  });
});


