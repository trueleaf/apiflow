import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('AiConfigManagement', () => {
  // AI 配置页支持 provider 切换并保存到本地缓存
  test('离线模式下 AI 配置切换 OpenAI Provider 并保存后持久化', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    await aiBtn.click();
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    // 从 AI 弹窗进入配置视图
    const settingsBtn = aiDialog.getByRole('button', { name: /设置|Settings/ }).first();
    await settingsBtn.click();
    const configView = aiDialog.locator('.ai-config-view');
    await expect(configView).toBeVisible({ timeout: 5000 });
    // 切换 Provider 到 OpenAI Compatible
    const providerSelect = configView.locator('.form-item .el-select').first();
    await providerSelect.click();
    const openAiOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /OpenAI Compatible/ }).first();
    await openAiOption.click();
    // 输入 BaseURL/API Key/Model 并保存
    const baseUrlInput = configView.locator('input[placeholder="请输入 API Base URL"]').first();
    const apiKeyInput = configView.locator('input[placeholder="请输入 API Key"]').first();
    const modelInput = configView.locator('input[placeholder="请输入模型 ID"]').first();
    await baseUrlInput.fill('https://api.openai-compatible.local/v1/chat/completions');
    await apiKeyInput.fill('sk-offline-config-case');
    await modelInput.fill('gpt-4o-mini-test');
    const saveBtn = configView.locator('.ai-config-btn').filter({ hasText: /^保存/ }).first();
    await saveBtn.click();
    await contentPage.waitForTimeout(700);
    // 返回聊天页后重新进入配置，验证配置回填
    const backBtn = configView.locator('.ai-back-btn').first();
    await backBtn.click();
    await expect(aiDialog.locator('.ai-chat-view')).toBeVisible({ timeout: 5000 });
    await settingsBtn.click();
    await expect(configView).toBeVisible({ timeout: 5000 });
    await expect(configView.locator('input[placeholder="请输入 API Base URL"]').first()).toHaveValue('https://api.openai-compatible.local/v1/chat/completions');
    await expect(configView.locator('input[placeholder="请输入 API Key"]').first()).toHaveValue('sk-offline-config-case');
    await expect(configView.locator('input[placeholder="请输入模型 ID"]').first()).toHaveValue('gpt-4o-mini-test');
    // 校验缓存层同步写入 provider 与 useFreeLLM
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const providerRaw = localStorage.getItem('apiflow/ai/llmProvider') || '{}';
        const useFree = localStorage.getItem('apiflow/ai/useFreeLLM') || '';
        const provider = JSON.parse(providerRaw) as {
          provider?: string
          baseURL?: string
          apiKey?: string
          model?: string
        };
        return JSON.stringify({
          provider: provider.provider || '',
          baseURL: provider.baseURL || '',
          apiKey: provider.apiKey || '',
          model: provider.model || '',
          useFreeLLM: useFree,
        });
      });
    }, { timeout: 5000 }).toBe(JSON.stringify({
      provider: 'OpenAICompatible',
      baseURL: 'https://api.openai-compatible.local/v1/chat/completions',
      apiKey: 'sk-offline-config-case',
      model: 'gpt-4o-mini-test',
      useFreeLLM: 'false',
    }));
  });
  // 无效配置保存后聊天页应进入引导态且发送按钮禁用，重置后恢复 DeepSeek 表单
  test('离线模式下 AI 配置校验与重置生效', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    await aiBtn.click();
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    // 进入配置视图并先保存一组有效 OpenAI 配置，确保 useFreeLLM 置为 false
    const settingsBtn = aiDialog.getByRole('button', { name: /设置|Settings/ }).first();
    await settingsBtn.click();
    const configView = aiDialog.locator('.ai-config-view');
    await expect(configView).toBeVisible({ timeout: 5000 });
    const providerSelect = configView.locator('.form-item .el-select').first();
    await providerSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /OpenAI Compatible/ }).first().click();
    const baseUrlInput = configView.locator('input[placeholder="请输入 API Base URL"]').first();
    const apiKeyInput = configView.locator('input[placeholder="请输入 API Key"]').first();
    const modelInput = configView.locator('input[placeholder="请输入模型 ID"]').first();
    await baseUrlInput.fill('https://api.openai-compatible.local/v1/chat/completions');
    await apiKeyInput.fill('sk-temp-valid');
    await modelInput.fill('gpt-4o-mini-test');
    const saveBtn = configView.locator('.ai-config-btn').filter({ hasText: /^保存/ }).first();
    await saveBtn.click();
    await contentPage.waitForTimeout(700);
    // 清空 API Key 后再次保存，制造无效配置
    await apiKeyInput.fill('');
    await saveBtn.click();
    await contentPage.waitForTimeout(700);
    // 返回聊天页后应显示配置引导态，且发送按钮不可用
    const backBtn = configView.locator('.ai-back-btn').first();
    await backBtn.click();
    await expect(aiDialog.locator('.ai-empty-state-setup')).toBeVisible({ timeout: 5000 });
    await expect(aiDialog.locator('.ai-empty-state-setup')).toContainText('请先前往AI设置配置apiKey与apiUrl');
    const sendBtn = aiDialog.locator('.ai-send-btn').first();
    await expect(sendBtn).toBeDisabled();
    // 再次进入配置后执行重置，验证切回 DeepSeek 配置表单
    await settingsBtn.click();
    await expect(configView).toBeVisible({ timeout: 5000 });
    const resetBtn = configView.locator('.ai-config-btn').filter({ hasText: /^重置$/ }).first();
    await resetBtn.click();
    await expect(configView.locator('input[placeholder="请输入 DeepSeek API Key"]').first()).toBeVisible({ timeout: 5000 });
    await expect(configView.locator('input[placeholder="请输入 API Base URL"]')).toHaveCount(0);
  });
});
