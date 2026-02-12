import { test, expect } from '../../../../../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;
const STORAGE_CACHE_KEY = 'httpNodeCache/preRequest/localStorage';

test.describe('AfLocalStorageApi', () => {
  // 测试用例1: 使用af.localStorage.set(key, value)存储持久数据
  test('使用af.localStorage.set(key, value)存储持久数据', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'localStorage set测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 输入后置脚本
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.localStorage.set("user_id", "12345")');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证请求成功（状态码200表示脚本执行无误）
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    // 验证af.localStorage已写入项目级缓存
    await expect.poll(async () => contentPage.evaluate((cacheKey) => {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
      const firstProjectStorage = Object.values(parsed)[0] ?? {};
      return (firstProjectStorage.user_id as string | undefined) ?? null;
    }, STORAGE_CACHE_KEY), { timeout: 10000 }).toBe('12345');
  });
  // 测试用例2: 使用af.localStorage.get(key)获取持久数据
  test('使用af.localStorage.get(key)获取持久数据', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'localStorage get测试' });
    // 设置请求URL（使用变量将获取的值传递到请求中验证）
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 输入后置脚本，先写入再读取并回写，验证get逻辑
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.localStorage.set("test_key", "test_value"); const value = af.localStorage.get("test_key"); af.localStorage.set("retrieved_value", value);');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证请求成功
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    // 验证读取到的值已被写回缓存
    await expect.poll(async () => contentPage.evaluate((cacheKey) => {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
      const firstProjectStorage = Object.values(parsed)[0] ?? {};
      return (firstProjectStorage.retrieved_value as string | undefined) ?? null;
    }, STORAGE_CACHE_KEY), { timeout: 10000 }).toBe('test_value');
  });
  // 测试用例3: 使用af.localStorage.remove(key)删除持久数据
  test('使用af.localStorage.remove(key)删除持久数据', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'localStorage remove测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 先写入待删除数据
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.localStorage.set("remove_key", "remove_value")');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    // 再执行删除操作
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.localStorage.remove("remove_key")');
    await contentPage.waitForTimeout(300);
    // 发送请求
    await sendBtn.click();
    // 验证请求成功
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    // 验证项目级缓存中的key已被移除
    await expect.poll(async () => contentPage.evaluate((cacheKey) => {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
      const firstProjectStorage = Object.values(parsed)[0] ?? {};
      return (firstProjectStorage.remove_key as string | undefined) ?? null;
    }, STORAGE_CACHE_KEY), { timeout: 10000 }).toBeNull();
  });
  // 测试用例4: 使用af.localStorage.clear()清空所有持久数据
  test('使用af.localStorage.clear()清空所有持久数据', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'localStorage clear测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 先写入多个键，构造待清空数据
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.localStorage.set("clear_key1", "value1"); af.localStorage.set("clear_key2", "value2"); af.localStorage.set("clear_key3", "value3");');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    // 再执行clear操作
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('af.localStorage.clear()');
    await contentPage.waitForTimeout(300);
    // 发送请求
    await sendBtn.click();
    // 验证请求成功
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    // 验证项目级缓存已被清空
    await expect.poll(async () => contentPage.evaluate((cacheKey) => {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) {
        return 0;
      }
      const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
      const firstProjectStorage = Object.values(parsed)[0] ?? {};
      return Object.keys(firstProjectStorage).length;
    }, STORAGE_CACHE_KEY), { timeout: 10000 }).toBe(0);
  });
  // 测试用例5: 获取不存在的键返回null
  test('获取不存在的键返回null', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    await createNode(contentPage, { nodeType: 'http', name: 'localStorage get不存在的键测试' });
    // 设置请求URL
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/echo`);
    // 点击后置脚本标签页
    const afterScriptTab = contentPage.locator('[data-testid="http-params-tab-afterscript"]');
    await afterScriptTab.click();
    await contentPage.waitForTimeout(300);
    // 输入后置脚本，获取不存在的键并存储结果
    const monacoEditor = contentPage.locator('.s-monaco-editor').first();
    await monacoEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('const value = af.localStorage.get("non_existent_key"); af.localStorage.set("result", value === null ? "is_null" : "not_null");');
    await contentPage.waitForTimeout(300);
    // 发送请求
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await sendBtn.click();
    // 验证请求成功
    const responseArea = contentPage.locator('[data-testid="response-area"]');
    await expect(responseArea).toBeVisible({ timeout: 10000 });
    const statusCode = responseArea.locator('[data-testid="status-code"]').first();
    await expect(statusCode).toContainText('200', { timeout: 10000 });
    // 验证获取不存在键时返回null分支
    await expect.poll(async () => contentPage.evaluate((cacheKey) => {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
      const firstProjectStorage = Object.values(parsed)[0] ?? {};
      return (firstProjectStorage.result as string | undefined) ?? null;
    }, STORAGE_CACHE_KEY), { timeout: 10000 }).toBe('is_null');
  });
});


