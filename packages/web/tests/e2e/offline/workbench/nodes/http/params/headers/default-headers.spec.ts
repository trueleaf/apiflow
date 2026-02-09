import { test, expect } from '../../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('DefaultHeaders', () => {
  // 测试用例1: 未设置任何body参数,默认请求头:Host,Accept-Encoding,Connection,User-Agent,Accept,调用echo接口返回结果请求头参数正确
  test('未设置body参数时默认请求头正确发送', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('默认请求头测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应中包含默认请求头
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    // 验证请求包含Host请求头
    await expect(responseBody).toContainText('host', { timeout: 10000 });
    // 验证请求包含Accept-Encoding请求头
    await expect(responseBody).toContainText('accept-encoding', { timeout: 10000 });
    // 验证请求包含Connection请求头
    await expect(responseBody).toContainText('connection', { timeout: 10000 });
    // 验证请求包含User-Agent请求头
    await expect(responseBody).toContainText('user-agent', { timeout: 10000 });
    // 验证请求包含Accept请求头
    await expect(responseBody).toContainText('accept', { timeout: 10000 });
  });
  // 测试用例2: 隐藏请求头中user-agent和accept值可以更改,更改后调用echo接口返回结果请求头参数正确
  test('隐藏请求头user-agent和accept值可以更改', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('隐藏请求头修改测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击Header标签页
    const headerTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await expect(headerTab).toBeVisible({ timeout: 5000 });
    await headerTab.click();
    // 等待toggle-hidden-headers按钮存在（说明Header标签页已激活）
    const toggleHiddenHeadersBtn = contentPage.locator('[data-testid="toggle-hidden-headers"]');
    await expect(toggleHiddenHeadersBtn).toBeVisible({ timeout: 5000 });
    // 展开隐藏请求头列表
    await toggleHiddenHeadersBtn.click();
    // 等待隐藏请求头区域出现
    const defaultHeadersWrap = contentPage.locator('.default-headers-wrap');
    await expect(defaultHeadersWrap).toBeVisible({ timeout: 5000 });
    // 找到User-Agent并修改值
    const userAgentRow = defaultHeadersWrap.locator('[data-testid="params-tree-row"][data-row-key="User-Agent"]');
    await expect(userAgentRow).toBeVisible({ timeout: 5000 });
    const userAgentValueInput = userAgentRow.locator('[data-testid="params-tree-value-input"]');
    await expect(userAgentValueInput).toBeVisible({ timeout: 5000 });
    await userAgentValueInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('CustomUserAgent/1.0');
    await contentPage.waitForTimeout(300);
    // 找到Accept并修改值
    const acceptRow = defaultHeadersWrap.locator('[data-testid="params-tree-row"][data-row-key="Accept"]');
    await expect(acceptRow).toBeVisible({ timeout: 5000 });
    const acceptValueInput = acceptRow.locator('[data-testid="params-tree-value-input"]');
    await expect(acceptValueInput).toBeVisible({ timeout: 5000 });
    await acceptValueInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('application/json');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应中包含修改后的请求头
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    await expect(responseBody).toContainText('CustomUserAgent/1.0', { timeout: 10000 });
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
  });
  // 测试用例3: 点击隐藏请求头图标展示隐藏请求头,再次点击收起隐藏请求头
  test('隐藏请求头展开和收起功能正常', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('隐藏请求头展开收起测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 点击Header标签页
    const headerTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headerTab.click();
    await contentPage.waitForTimeout(300);
    // 验证初始状态隐藏请求头不可见
    const defaultHeadersWrap = contentPage.locator('.default-headers-wrap');
    await expect(defaultHeadersWrap).not.toBeVisible();
    // 点击展开隐藏请求头
    const toggleHiddenHeadersBtn = contentPage.locator('[data-testid="toggle-hidden-headers"]');
    await toggleHiddenHeadersBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证隐藏请求头列表展开显示
    await expect(defaultHeadersWrap).toBeVisible();
    // 验证分割线存在
    const divider = contentPage.locator('.header-divider');
    await expect(divider).toBeVisible();
    // 再次点击收起隐藏请求头
    await toggleHiddenHeadersBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证隐藏请求头列表收起
    await expect(defaultHeadersWrap).not.toBeVisible();
  });
  // 测试用例4: body中不同mode会自动添加content-type,调用echo接口返回请求头参数正确
  test('body中json类型自动添加content-type请求头', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('ContentType自动添加测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.getByRole('option', { name: 'POST' }).click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 在JSON编辑器中输入数据
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    const monacoInner = monacoEditor.locator('.monaco-editor').first();
    await expect(monacoInner).toBeVisible({ timeout: 10000 });
    await monacoInner.click({ position: { x: 10, y: 10 } });
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{"name": "test"}');
    await contentPage.waitForTimeout(500);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应中包含application/json的Content-Type
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    await expect(responseBody).toContainText('application/json', { timeout: 10000 });
  });
  // 测试用例5: 自动添加的content-type值允许修改,调用echo接口返回请求头参数正确
  test('自动添加的content-type值允许修改', async ({ contentPage, clearCache, createProject }) => {
    test.setTimeout(60000);
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('ContentType覆盖测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await expect(addFileDialog).toBeHidden({ timeout: 10000 });
    // 设置请求URL
    const urlEditor = contentPage.locator('[data-testid="url-input"] .ProseMirror').first();
    await expect(urlEditor).toBeVisible({ timeout: 10000 });
    await urlEditor.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.getByRole('option', { name: 'POST' }).click();
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: 'json' });
    await jsonRadio.click();
    // 在JSON编辑器中输入数据
    const monacoEditor = contentPage.locator('.s-json-editor').first();
    const monacoInner = monacoEditor.locator('.monaco-editor').first();
    await expect(monacoInner).toBeVisible({ timeout: 10000 });
    await monacoInner.click({ position: { x: 10, y: 10 } });
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('{"name": "test"}');
    // 点击Header标签页
    const headerTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headerTab.click();
    // 等待请求头区域的参数行出现
    const paramsTreeRow = contentPage.locator('[data-testid="params-tree-row"]').first();
    await expect(paramsTreeRow).toBeVisible({ timeout: 5000 });
    // 在自定义请求头中添加Content-Type覆盖自动值（使用autocomplete组件）
    const keyAutocomplete = paramsTreeRow.locator('[data-testid="params-tree-key-autocomplete"]');
    await expect(keyAutocomplete).toBeVisible({ timeout: 5000 });
    const keyInput = keyAutocomplete.locator('input');
    await keyInput.fill('Content-Type');
    await contentPage.keyboard.press('Enter');
    const valueInput = paramsTreeRow.locator('[data-testid="params-tree-value-input"]');
    await expect(valueInput).toBeVisible({ timeout: 5000 });
    await valueInput.click();
    await contentPage.keyboard.press('ControlOrMeta+a');
    await contentPage.keyboard.type('application/custom');
    await contentPage.keyboard.press('Enter');
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证响应中包含自定义的Content-Type
    const responseArea = contentPage.getByTestId('response-area');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(responseArea.getByTestId('status-code')).toContainText('200', { timeout: 10000 });
    const responseBody = responseArea.locator('.s-json-editor').first();
    await expect(responseBody).toContainText('application/custom', { timeout: 10000 });
  });
});


