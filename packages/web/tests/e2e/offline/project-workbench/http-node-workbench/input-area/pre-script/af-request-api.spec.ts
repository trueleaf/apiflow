import { test, expect } from '../../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('AfRequestApi', () => {
  // 测试用例1: 使用af.request.prefix获取并修改请求前缀,发送请求后验证前缀已更改
  test('使用af.request.prefix修改请求前缀', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.request.prefix测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill('http://invalid-host.local/echo');
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码 - 修改请求前缀
    const scriptCode = `af.request.prefix = "http://127.0.0.1:${MOCK_SERVER_PORT}";`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证实际请求使用了修改后的前缀
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('127.0.0.1');
  });
  // 测试用例2: 使用af.request.path获取并修改请求路径,发送请求后验证路径已更改
  test('使用af.request.path修改请求路径', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.request.path测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/original-path`);
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码 - 修改请求路径
    const scriptCode = `af.request.path = "/echo";`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证实际请求使用了修改后的路径
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('/echo');
  });
  // 测试用例3: 使用af.request.headers获取并修改请求头,发送请求后验证请求头已更改
  test('使用af.request.headers修改请求头', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.request.headers测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码 - 添加自定义请求头
    const scriptCode = `af.request.headers["X-Custom-Header"] = "custom-value-123";`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含自定义请求头
    const responseText = await responseBody.textContent();
    expect(responseText?.toLowerCase()).toContain('x-custom-header');
    expect(responseText).toContain('custom-value-123');
  });
  // 测试用例4: 使用af.request.queryParams获取并修改Query参数,发送请求后验证参数已更改
  test('使用af.request.queryParams修改Query参数', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.request.queryParams测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo?page=1`);
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码 - 修改查询参数
    const scriptCode = `af.request.queryParams["page"] = "999";
af.request.queryParams["newParam"] = "newValue";`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含修改后的查询参数
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('999');
    expect(responseText).toContain('newParam');
    expect(responseText).toContain('newValue');
  });
  // 测试用例5: 使用af.request.pathParams获取并修改Path参数,发送请求后验证参数已更改
  test('使用af.request.pathParams修改Path参数', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.request.pathParams测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL，使用路径参数
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo/users/{userId}`);
    // 点击Params标签页设置路径参数
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 在Path参数区域找到userId参数并设置初始值
    const pathParamsArea = contentPage.locator('.path-params');
    const userIdInput = pathParamsArea.locator('input[placeholder*="参数值"], input[placeholder*="Value"]').first();
    if (await userIdInput.isVisible()) {
      await userIdInput.fill('123');
      await contentPage.waitForTimeout(300);
    }
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码 - 修改路径参数
    const scriptCode = `af.request.pathParams["userId"] = "999";`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中的路径参数已被修改
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('999');
  });
  // 测试用例6: 使用af.request.body.json获取并修改JSON body,发送请求后验证body已更改
  test('使用af.request.body.json修改JSON body', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.request.body.json测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('.method-select');
    await methodSelect.click();
    await contentPage.waitForTimeout(300);
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择JSON类型
    const jsonRadio = contentPage.locator('.el-radio').filter({ hasText: /json/i });
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 在JSON编辑器中输入初始JSON
    const jsonEditor = contentPage.locator('.json-editor .s-monaco-editor, .body-json .s-monaco-editor').first();
    await expect(jsonEditor).toBeVisible({ timeout: 5000 });
    await jsonEditor.click();
    await contentPage.waitForTimeout(300);
    await contentPage.keyboard.type('{"username": "olduser", "email": "old@test.com"}');
    await contentPage.waitForTimeout(300);
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码 - 修改JSON body字段
    const scriptCode = `af.request.body.json.username = "newuser";
af.request.body.json.newField = "addedValue";`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含修改后的JSON数据
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('newuser');
    expect(responseText).toContain('newField');
    expect(responseText).toContain('addedValue');
  });
  // 测试用例7: 使用af.request.body.formdata获取并修改formdata body,发送请求后验证body已更改
  test('使用af.request.body.formdata修改formdata body', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.request.body.formdata测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 选择POST方法
    const methodSelect = contentPage.locator('.method-select');
    await methodSelect.click();
    await contentPage.waitForTimeout(300);
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 点击Body标签页
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择form-data类型
    const formdataRadio = contentPage.locator('.el-radio').filter({ hasText: /form-data/i });
    await formdataRadio.click();
    await contentPage.waitForTimeout(300);
    // 添加一个form-data字段
    const keyInput = contentPage.locator('.formdata-params input[placeholder*="名称"], .formdata-params input[placeholder*="Key"]').first();
    if (await keyInput.isVisible()) {
      await keyInput.fill('fieldname');
      await contentPage.waitForTimeout(200);
      const valueInput = contentPage.locator('.formdata-params input[placeholder*="值"], .formdata-params input[placeholder*="Value"]').first();
      await valueInput.fill('oldvalue');
      await contentPage.waitForTimeout(300);
    }
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码 - 修改formdata字段
    const scriptCode = `af.request.body.formdata["fieldname"] = "newvalue-from-script";`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含修改后的formdata数据
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('newvalue-from-script');
  });
  // 测试用例8: 使用af.request.method获取并修改请求方法,发送请求后验证方法已更改
  test('使用af.request.method修改请求方法', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.request.method测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置请求URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 初始选择GET方法
    const methodSelect = contentPage.locator('.method-select');
    await methodSelect.click();
    await contentPage.waitForTimeout(300);
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'GET' });
    await getOption.click();
    await contentPage.waitForTimeout(300);
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码 - 修改请求方法为PUT
    const scriptCode = `af.request.method = "PUT";`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中的method字段已变为PUT
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('PUT');
  });
  // 测试用例9: 使用af.request.replaceUrl()替换整个URL,发送请求后验证URL已更改
  test('使用af.request.replaceUrl替换整个URL', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 5000 });
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('af.request.replaceUrl测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 设置一个初始的无效URL
    const urlInput = contentPage.locator('.url-input input');
    await urlInput.fill('http://invalid-host.local/invalid-path');
    // 点击前置脚本标签页
    const preScriptTab = contentPage.locator('[data-testid="http-params-tab-prescript"]');
    await preScriptTab.click();
    await contentPage.waitForTimeout(500);
    // 在前置脚本编辑器中输入代码
    const editor = contentPage.locator('.s-monaco-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });
    await editor.click();
    await contentPage.waitForTimeout(300);
    // 输入前置脚本代码 - 替换整个URL
    const scriptCode = `af.request.replaceUrl("http://127.0.0.1:${MOCK_SERVER_PORT}/echo?replaced=true&id=123");`;
    await contentPage.keyboard.type(scriptCode);
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('.send-btn');
    await sendBtn.click();
    await contentPage.waitForTimeout(3000);
    // 验证响应区域存在
    const responseBody = contentPage.locator('.response-body');
    await expect(responseBody).toBeVisible({ timeout: 10000 });
    // 验证响应中包含替换后的URL信息
    const responseText = await responseBody.textContent();
    expect(responseText).toContain('/echo');
    expect(responseText).toContain('replaced');
    expect(responseText).toContain('true');
    expect(responseText).toContain('123');
  });
});
