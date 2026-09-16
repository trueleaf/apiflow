import { test, expect } from '../../../../fixtures/electron.fixture'

test.describe('Ask 离线运行边界', () => {
  test('Ask 支持流式回答、停止、第二轮上下文，并在切换在线后拒绝执行', async ({ topBarPage, contentPage, clearCache }) => {
    test.setTimeout(60000)
    await clearCache()
    await contentPage.evaluate(() => {
      localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({
        version: 2,
        activeVendor: 'custom',
        profiles: {
          custom: { id: 'ai-test-ask', name: 'AI Test Ask', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model: 'ai-test-slow', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 64 },
        },
      }))
      localStorage.setItem('appState/aiDialog/mode', 'ask')
    })
    await contentPage.reload()
    await contentPage.waitForLoadState('domcontentloaded')
    await topBarPage.getByTestId('header-ai-btn').click()
    const dialog = contentPage.locator('.ai-dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.ai-input-trigger')).toContainText('Ask')
    const input = dialog.locator('.ai-input')
    await input.fill('请停止这一轮')
    await input.press('Enter')
    await expect(dialog.locator('.ai-stop-btn')).toBeVisible()
    await dialog.locator('.ai-stop-btn').click()
    await expect(dialog.locator('.ai-cancelled-message')).toBeVisible()
    await expect(dialog.locator('.ai-stop-btn')).toHaveCount(0)
    await input.fill('请完成第一轮')
    await input.press('Enter')
    await expect(dialog.locator('.ai-answer-message').filter({ hasText: '测试流式回答完成' })).toBeVisible({ timeout: 10000 })
    await expect(dialog.locator('.ai-working-message')).toHaveCount(0, { timeout: 10000 })
    await input.fill('请使用上一轮上下文')
    await input.press('Enter')
    await expect(dialog.locator('.ai-answer-message').filter({ hasText: '第二轮上下文完成' })).toBeVisible({ timeout: 10000 })
    await topBarPage.getByTestId('header-network-toggle').click()
    await expect(topBarPage.getByTestId('header-ai-btn')).toHaveCount(0)
    await expect(dialog).toBeHidden()
    const rejected = await contentPage.evaluate(async () => {
      const manager = window.electronAPI?.aiManager
      if (!manager) return null
      return await manager.run({
        conversationId: 'online-conversation', runId: 'online-run', messageId: 'online-message', mode: 'ask', prompt: 'must reject', history: [],
        context: { projectId: null, activeNodeId: null, activeTabType: null, language: 'en', networkMode: 'online' },
        provider: { id: 'online-provider', name: 'Online', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model: 'ai-test-text', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 32 },
      })
    })
    expect(rejected).toMatchObject({ accepted: false, errorCode: 'AI_OFFLINE_ONLY' })
  })
})
