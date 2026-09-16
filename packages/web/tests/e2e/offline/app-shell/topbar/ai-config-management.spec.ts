import { test, expect } from '../../../../fixtures/electron.fixture';
import { createServer } from 'node:http';

test.describe('AiConfigManagement', () => {
  test('官方厂商和模型切换保留独立 Key，重启后恢复并同步完整设置页', async ({ topBarPage, contentPage, clearCache }) => {
    test.setTimeout(60000);
    await clearCache();
    await topBarPage.getByTestId('header-ai-btn').click();
    const dialog = contentPage.locator('.ai-dialog');
    await dialog.getByRole('button', { name: '设置', exact: true }).click();
    const form = dialog.locator('.ai-config-view');
    await expect(form.getByTestId('llm-vendor-select')).toContainText('DeepSeek');
    await expect(form.getByTestId('llm-model-select')).toContainText('deepseek-v4-pro');
    await expect(form.getByTestId('llm-save')).toBeDisabled();
    await expect(form.getByPlaceholder('请输入 API Base URL')).toHaveCount(0);
    // 同厂商切换模型复用密钥
    await form.getByPlaceholder('请输入 API Key').fill('sk-deepseek-e2e');
    await form.getByTestId('llm-model-select').click();
    await contentPage.getByRole('option', { name: 'deepseek-v4-pro', exact: true }).click();
    await expect(form.getByPlaceholder('请输入 API Key')).toHaveValue('sk-deepseek-e2e');
    await form.getByTestId('llm-save').click();
    await form.getByTestId('llm-vendor-select').click();
    await contentPage.getByRole('option', { name: '通义千问（阿里云百炼）', exact: true }).click();
    await expect(form.getByPlaceholder('请输入 API Key')).toHaveValue('');
    await expect(form.getByTestId('llm-model-select')).toContainText('qwen3.7-plus');
    await expect(form.getByTestId('llm-preset-info')).toContainText('北京');
    await form.getByPlaceholder('请输入 API Key').fill('sk-qwen-e2e');
    await form.getByTestId('llm-model-select').click();
    await contentPage.getByRole('option', { name: 'qwen3.8-max', exact: true }).click();
    await form.getByTestId('llm-save').click();
    // 重置仅作用于当前表单，其他厂商密钥不受影响
    await form.getByTestId('llm-reset').click();
    await expect(form.getByPlaceholder('请输入 API Key')).toHaveValue('');
    await form.getByTestId('llm-vendor-select').click();
    await contentPage.getByRole('option', { name: 'DeepSeek', exact: true }).click();
    await expect(form.getByPlaceholder('请输入 API Key')).toHaveValue('sk-deepseek-e2e');
    await expect(form.getByTestId('llm-model-select')).toContainText('deepseek-v4-pro');
    // 通过应用刷新按钮验证已保存的当前厂商恢复
    await Promise.all([contentPage.waitForEvent('load'), topBarPage.getByTestId('header-refresh-btn').click()]);
    await expect(contentPage.getByRole('button', { name: '新建项目', exact: true })).toBeVisible();
    await expect(dialog).toBeHidden();
    await topBarPage.getByTestId('header-ai-btn').click();
    await dialog.getByRole('button', { name: '设置', exact: true }).click();
    await expect(form.getByTestId('llm-vendor-select')).toContainText('通义千问');
    await expect(form.getByPlaceholder('请输入 API Key')).toHaveValue('sk-qwen-e2e');
    await expect(form.getByTestId('llm-model-select')).toContainText('qwen3.8-max');
    await form.getByRole('button', { name: '更多设置' }).click();
    const settings = contentPage.locator('.ai-settings-container');
    await expect(settings).toBeVisible();
    await expect(settings.getByTestId('llm-model-select')).toContainText('qwen3.8-max');
    await expect(settings.getByPlaceholder('请输入 API Key')).toHaveValue('sk-qwen-e2e');
    await settings.screenshot({ path: 'output/playwright/llm-qwen-settings.png' });
  });
  test('旧配置无损迁移为自定义，官方切换不携带扩展参数', async ({ topBarPage, contentPage, clearCache }) => {
    test.setTimeout(60000);
    await clearCache();
    // 模拟升级前的缓存，不通过页面伪造配置迁移结果
    await contentPage.evaluate(() => localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({
      id: 'legacy-id', name: 'Legacy', provider: 'OpenAICompatible',
      baseURL: 'http://127.0.0.1:8080/chat/completions', model: 'legacy-model', apiKey: 'legacy-key',
      customHeaders: [{ key: 'X-Legacy', value: 'legacy-header' }], extraBody: '{"temperature":0.2}',
    })));
    await Promise.all([contentPage.waitForEvent('load'), topBarPage.getByTestId('header-refresh-btn').click()]);
    await expect(contentPage.getByRole('button', { name: '新建项目', exact: true })).toBeVisible();
    await topBarPage.getByTestId('header-ai-btn').click();
    const dialog = contentPage.locator('.ai-dialog');
    await dialog.getByRole('button', { name: '设置', exact: true }).click();
    const form = dialog.locator('.ai-config-view');
    await expect(form.getByTestId('llm-vendor-select')).toContainText('自定义');
    await expect(form.getByPlaceholder('请输入 API Base URL')).toHaveValue('http://127.0.0.1:8080');
    await expect(form.getByPlaceholder('请输入模型 ID')).toHaveValue('legacy-model');
    await form.getByTestId('llm-vendor-select').click();
    await contentPage.getByRole('option', { name: 'DeepSeek', exact: true }).click();
    await expect(form.getByPlaceholder('请输入 API Key')).toHaveValue('');
    await form.getByPlaceholder('请输入 API Key').fill('new-deepseek-key');
    await form.getByTestId('llm-save').click();
    const cache = await contentPage.evaluate(() => JSON.parse(localStorage.getItem('apiflow/ai/llmProvider') || '{}'));
    expect(cache).toMatchObject({ version: 2 });
    expect(cache.profiles.custom).toMatchObject({ id: 'legacy-id', apiKey: 'legacy-key', customHeaders: [{ key: 'X-Legacy', value: 'legacy-header' }], extraBody: '{"temperature":0.2}', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: null });
    expect(cache.profiles.deepseek).toMatchObject({ apiKey: 'new-deepseek-key', baseURL: 'https://api.deepseek.com', extraBody: '', customHeaders: [], thinkingMode: 'default' });
    await form.getByTestId('llm-vendor-select').click();
    await contentPage.getByRole('option', { name: '自定义（OpenAI Compatible）', exact: true }).click();
    await form.getByPlaceholder('请输入 API Key').fill('');
    await form.getByTestId('llm-save').click();
    await form.getByRole('button', { name: '更多设置' }).click();
    const settings = contentPage.locator('.ai-settings-container');
    await expect(settings.getByPlaceholder('Header Key')).toHaveValue('X-Legacy');
    await expect(settings.getByPlaceholder('Header Value')).toHaveValue('legacy-header');
    await expect(settings.getByTestId('llm-save')).toBeEnabled();
    await settings.getByPlaceholder('请输入 API Base URL').fill('invalid-url');
    await expect(settings.getByTestId('llm-save')).toBeDisabled();
    await expect(settings.getByTestId('llm-test-send')).toBeDisabled();
  });
  test('官方厂商高级配置按厂商保存并恢复', async ({ topBarPage, contentPage, clearCache }) => {
    test.setTimeout(60000);
    await clearCache();
    await topBarPage.getByTestId('header-ai-btn').click();
    const dialog = contentPage.locator('.ai-dialog');
    await dialog.getByRole('button', { name: '设置', exact: true }).click();
    await dialog.getByRole('button', { name: '更多设置' }).click();
    const settings = contentPage.locator('.ai-settings-container');
    await settings.getByPlaceholder('请输入 API Key').fill('deepseek-advanced-key');
    await settings.getByTestId('llm-advanced-toggle').click();
    await settings.getByTestId('llm-thinking-mode').getByText('开启思考', { exact: true }).click();
    await settings.getByTestId('llm-reasoning-effort').click();
    await contentPage.getByRole('option', { name: '最大', exact: true }).click();
    await settings.getByTestId('llm-max-tokens').locator('input').fill('4096');
    await settings.getByTestId('llm-save').click();
    await settings.getByTestId('llm-vendor-select').click();
    await contentPage.getByRole('option', { name: '通义千问（阿里云百炼）', exact: true }).click();
    await settings.getByPlaceholder('请输入 API Key').fill('qwen-advanced-key');
    await settings.getByTestId('llm-thinking-mode').getByText('开启思考', { exact: true }).click();
    await expect(settings.getByTestId('llm-reasoning-effort')).toHaveCount(0);
    await expect(settings.getByTestId('llm-thinking-budget').locator('input')).toBeEnabled();
    await settings.getByTestId('llm-thinking-budget').locator('input').fill('2048');
    await settings.getByTestId('llm-max-tokens').locator('input').fill('8192');
    await settings.getByTestId('llm-save').click();
    const cache = await contentPage.evaluate(() => JSON.parse(localStorage.getItem('apiflow/ai/llmProvider') || '{}'));
    expect(cache).toMatchObject({
      version: 2,
      activeVendor: 'qwen',
      profiles: {
        deepseek: { thinkingMode: 'enabled', reasoningEffort: 'max', thinkingBudget: null, maxTokens: 4096 },
        qwen: { thinkingMode: 'enabled', reasoningEffort: 'default', thinkingBudget: 2048, maxTokens: 8192 },
      },
    });
    await settings.getByTestId('llm-vendor-select').click();
    await contentPage.getByRole('option', { name: 'DeepSeek', exact: true }).click();
    await expect(settings.getByTestId('llm-thinking-mode').getByRole('radio', { name: '开启思考' })).toBeChecked();
    await expect(settings.getByTestId('llm-reasoning-effort')).toContainText('最大');
    await expect(settings.getByTestId('llm-max-tokens').locator('input')).toHaveValue('4096');
  });
  test('未保存草稿可测试普通及流式请求，错误提示脱敏且不覆盖已保存配置', async ({ topBarPage, contentPage, clearCache }) => {
    test.setTimeout(60000);
    const requests: Array<{ url?: string; authorization?: string; body: { model?: string; stream?: boolean } }> = [];
    const server = createServer(async (req, res) => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const body = JSON.parse(Buffer.concat(chunks).toString()) as { model?: string; stream?: boolean };
      requests.push({ url: req.url, authorization: req.headers.authorization, body });
      if (req.url?.startsWith('/unauthorized')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'invalid secret-draft-key' } }));
      } else if (body.stream) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        res.write('data: ' + JSON.stringify({ choices: [{ delta: { reasoning_content: '模拟推理' } }] }) + '\n\n');
        res.end('data: ' + JSON.stringify({ choices: [{ delta: { content: '流式验证成功' }, finish_reason: 'stop' }] }) + '\n\ndata: [DONE]\n\n');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ choices: [{ message: { content: '普通验证成功', reasoning_content: '模拟推理' } }] }));
      }
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('模拟服务地址异常');
    try {
      await clearCache();
      await topBarPage.getByTestId('header-ai-btn').click();
      const dialog = contentPage.locator('.ai-dialog');
      await dialog.getByRole('button', { name: '设置', exact: true }).click();
      await dialog.getByRole('button', { name: '更多设置' }).click();
      const settings = contentPage.locator('.ai-settings-container');
      await settings.getByTestId('llm-vendor-select').click();
      await contentPage.getByRole('option', { name: '自定义（OpenAI Compatible）', exact: true }).click();
      await settings.getByPlaceholder('请输入 API Base URL').fill('http://127.0.0.1:' + address.port + '/chat/completions');
      await settings.getByPlaceholder('请输入模型 ID').fill('saved-model');
      await settings.getByTestId('llm-save').click();
      // 改动后不保存，验证网络实际使用草稿模型与鉴权
      await settings.getByPlaceholder('请输入模型 ID').fill('draft-model');
      await settings.getByPlaceholder('请输入 API Key').fill('secret-draft-key');
      await settings.getByTestId('llm-test-send').click();
      await expect(settings.locator('.response-content')).toContainText('普通验证成功');
      await expect(settings.getByTestId('llm-request-summary')).toContainText('draft-model');
      await settings.getByRole('tab', { name: '思考过程' }).click();
      await expect(settings.locator('.reasoning-content')).toContainText('模拟推理');
      await settings.getByRole('tab', { name: '请求详情' }).click();
      await expect(settings.locator('.request-json')).toContainText('"model": "draft-model"');
      await expect(settings.locator('.request-json')).toContainText('"stream": false');
      await settings.getByRole('tab', { name: '响应结果' }).click();
      await settings.getByTestId('llm-test-stream').click();
      await expect(settings.locator('.response-content')).toContainText('流式验证成功');
      expect(requests).toHaveLength(2);
      expect(requests[0]).toMatchObject({ authorization: 'Bearer secret-draft-key', body: { model: 'draft-model' } });
      expect(requests[0].body.stream).toBeUndefined();
      expect(requests[1]).toMatchObject({ body: { model: 'draft-model', stream: true } });
      expect(await contentPage.evaluate(() => JSON.parse(localStorage.getItem('apiflow/ai/llmProvider') || '{}').model)).toBe('saved-model');
      await settings.getByPlaceholder('请输入 API Base URL').fill('http://127.0.0.1:' + address.port + '/unauthorized');
      await settings.getByTestId('llm-test-send').click();
      await expect(settings.locator('.response-content')).toContainText('API Key 无效或已失效');
      await expect(settings.locator('.response-content')).not.toContainText('secret-draft-key');
    } finally {
      server.closeAllConnections();
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });
});
