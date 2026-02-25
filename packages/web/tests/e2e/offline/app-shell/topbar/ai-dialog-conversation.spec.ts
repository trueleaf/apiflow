import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('AiDialogConversation', () => {
  // AI 弹窗在 Ask 模式下支持发送、停止、清空对话，并体现发送按钮禁用态切换
  test('离线模式下 AI 对话支持发送停止清空与禁用态切换', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    await aiBtn.click();
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    // 先配置可控的流式接口，避免依赖外部网络波动
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
    await baseUrlInput.fill('http://127.0.0.1:3456/sse/chunked');
    await apiKeyInput.fill('sk-local-stream');
    await modelInput.fill('offline-stream-model');
    const saveBtn = configView.locator('.ai-config-btn').filter({ hasText: /^保存/ }).first();
    await saveBtn.click();
    await contentPage.waitForTimeout(700);
    const backBtn = configView.locator('.ai-back-btn').first();
    await backBtn.click();
    await expect(aiDialog.locator('.ai-chat-view')).toBeVisible({ timeout: 5000 });
    // 切换到 Ask 模式后执行真实对话操作链路
    const modeTrigger = aiDialog.locator('.ai-input-trigger').first();
    await modeTrigger.click();
    const askModeItem = aiDialog.locator('.ai-dropdown-item').filter({ hasText: /^Ask$/ }).first();
    await askModeItem.click();
    await expect(modeTrigger).toContainText('Ask');
    const inputArea = aiDialog.locator('.ai-input').first();
    const sendBtn = aiDialog.locator('.ai-send-btn').first();
    // 验证发送按钮禁用态会随输入内容切换
    await expect(sendBtn).toBeDisabled();
    await inputArea.fill('请输出一条用于停止测试的消息');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();
    const stopBtn = aiDialog.locator('.ai-stop-btn').first();
    await expect(stopBtn).toBeVisible({ timeout: 5000 });
    await stopBtn.click();
    await expect.poll(async () => {
      return await aiDialog.locator('.ai-stop-btn').count();
    }, { timeout: 5000 }).toBe(0);
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await expect(aiDialog.locator('.ai-message.is-user')).toHaveCount(1);
    // 清空对话后应恢复空态
    const newChatBtn = aiDialog.locator('.ai-new-chat-btn').first();
    await newChatBtn.click();
    await expect(aiDialog.locator('.ai-empty-state')).toBeVisible({ timeout: 5000 });
  });
});
