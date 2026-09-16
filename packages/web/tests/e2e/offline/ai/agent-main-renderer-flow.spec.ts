import { test, expect } from '../../../fixtures/electron.fixture'

test.describe('Agent 主进程到面板的确定性事件流', () => {
  test('用户发送消息后由 main 的测试模型流式展示开始、内容、来源、文件和完成事件', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache()
    await contentPage.evaluate(() => {
      localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({
        version: 2,
        activeVendor: 'custom',
        profiles: {
          custom: {
            id: 'ai-test-provider',
            name: 'AI Test',
            provider: 'OpenAICompatible',
            vendor: 'custom',
            apiKey: '',
            baseURL: 'https://ai.test/v1',
            model: 'ai-test-text',
            customHeaders: [],
            extraBody: '',
            thinkingMode: 'default',
            reasoningEffort: 'default',
            thinkingBudget: null,
            maxTokens: 64,
          },
        },
      }))
      localStorage.setItem('appState/aiDialog/mode', 'agent')
    })
    await contentPage.reload()
    await contentPage.waitForLoadState('domcontentloaded')
    await topBarPage.locator('[data-testid="header-ai-btn"]').click()
    const panel = contentPage.locator('.ai-dialog')
    await expect(panel).toBeVisible()
    const input = panel.locator('.ai-input')
    await input.fill('请测试主进程事件流')
    await input.press('Enter')
    await expect(panel.locator('.ai-user-message')).toContainText('请测试主进程事件流')
    await expect(panel.locator('.ai-answer-message')).toContainText('测试流式回答完成')
    await expect(panel.locator('.ai-reasoning-message')).toContainText('思考过程')
    await expect(panel.locator('.ai-source-message').filter({ hasText: 'Test docs' })).toBeVisible()
    await expect(panel.locator('.ai-source-message').filter({ hasText: 'Test schema' })).toBeVisible()
    await expect(panel.locator('.ai-file-message')).toContainText('application/json')
    await expect(panel.locator('.ai-finish-message')).toContainText('模型输出结束')
    await expect(panel.locator('.ai-run-state-message').filter({ hasText: '运行完成' })).toBeVisible()
    await expect(panel.locator('.ai-working-message')).toHaveCount(0)
    await expect(input).toHaveValue('')
  })
})
