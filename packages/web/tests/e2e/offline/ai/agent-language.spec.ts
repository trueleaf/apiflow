import { test, expect } from '../../../fixtures/electron.fixture'

for (const mode of ['ask', 'agent']) {
  test(`${mode} 根据中英文和日文输入传递语言指令并展示对应生成内容`, async ({ topBarPage, contentPage }) => {
    test.setTimeout(60000)
    await contentPage.evaluate(mode => {
      localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({ version: 2, activeVendor: 'custom', profiles: { custom: { id: 'agent-e2e', name: 'Test', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model: 'ai-test-language', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 128 } } }))
      localStorage.setItem('appState/aiDialog/mode', mode)
    }, mode)
    await contentPage.reload()
    await topBarPage.getByTestId('header-ai-btn').click()
    const panel = contentPage.locator('.ai-dialog')
    for (const [prompt, expected] of [
      ['请帮我设计一个用于查询用户列表的接口，并且使用中文描述接口名称。', '接口设计：用户列表'],
      ['Please design an API for listing all users and describe the endpoint using English.', 'API design: User directory'],
      ['ユーザーの一覧を取得するためのAPIを設計してください。日本語で説明をお願いします。', 'API設計：ユーザー一覧'],
    ]) {
      await panel.locator('.ai-input').fill(prompt)
      await panel.locator('.ai-input').press('Enter')
      await expect(panel.locator('.ai-answer-message').last()).toContainText(expected)
      await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
    }
  })
}
