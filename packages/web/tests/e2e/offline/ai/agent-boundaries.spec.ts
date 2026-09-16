import { test, expect } from '../../../fixtures/electron.fixture'

for (const scenario of ['retryable', 'duplicate-change', 'untrusted-id', 'duplicate-call']) {
  test(`Agent ${scenario} 保持重试上限和业务标识边界`, async ({ electronApp, topBarPage, contentPage }) => {
    test.setTimeout(60000)
    await contentPage.evaluate(() => {
      localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({ version: 2, activeVendor: 'custom', profiles: { custom: { id: 'agent-e2e', name: 'Test', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model: 'ai-test-script', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 128 } } }))
      localStorage.setItem('appState/aiDialog/mode', 'agent')
    })
    await contentPage.reload()
    await topBarPage.getByTestId('header-ai-btn').click()
    if (scenario === 'retryable') await electronApp.evaluate(({ ipcMain }) => {
      // 将首个只读响应置为瞬时失败，后续仍使用真实 renderer 读取，验证仅自动重试一次
      ipcMain.prependOnceListener('ai:renderer:to:main:client-tool-result', (_event, value: { result: unknown }) => { value.result = { success: false, errorCode: 'AI_TRANSIENT', retryable: true, summary: 'Retry once' } })
    })
    const call = scenario === 'duplicate-change' ? { toolName: 'createDesignChange', input: { targetProjectId: null, title: 'agent-e2e-duplicate', operations: [{ type: 'createProject', name: 'agent-e2e-never-applied' }] } }
      : scenario === 'untrusted-id' ? { toolName: 'getNodeDetail', input: { nodeId: 'invented-id' } } : { toolName: 'getWorkspaceContext', toolCallId: 'agent-e2e-identical-call', input: {} }
    const panel = contentPage.locator('.ai-dialog')
    await panel.locator('.ai-input').fill(JSON.stringify({ steps: scenario === 'duplicate-change' ? [[call], [call]] : scenario === 'duplicate-call' ? [[call, call]] : [[call]] }))
    await panel.locator('.ai-input').press('Enter')
    await expect(panel.locator(scenario === 'duplicate-change' ? '.ai-error-message' : '.ai-answer-message').last()).toContainText(scenario === 'duplicate-change' ? 'AI_LOOP_GUARD' : '脚本完成')
    await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
    const commands = await contentPage.evaluate(async () => {
      const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('agentDataCache'); request.onsuccess = () => resolve(request.result) })
      const rows = await new Promise<Array<{ events: Array<{ type: string }> }>>(resolve => { const request = db.transaction('conversations').objectStore('conversations').getAll(); request.onsuccess = () => resolve(request.result) })
      db.close()
      return rows.flatMap(row => row.events).filter(event => event.type === 'client-tool-command').length
    })
    expect(commands).toBe(scenario === 'retryable' ? 2 : scenario === 'untrusted-id' ? 0 : 1)
    if (scenario === 'untrusted-id') await expect(panel.locator('.ai-tool-message.is-error')).toContainText('ID was not obtained')
  })
}

test('缺少官方 Key 时 main 拒绝请求，关闭窗口中断正在运行的 Ask', async ({ electronApp, topBarPage, contentPage }) => {
  test.setTimeout(60000)
  const rejected = await contentPage.evaluate(async () => window.electronAPI!.aiManager.run({ conversationId: 'missing-key', runId: 'missing-key', messageId: 'missing-key', mode: 'ask', prompt: 'must reject', history: [], context: { projectId: null, activeNodeId: null, activeTabType: null, language: 'en', networkMode: 'offline' }, provider: { id: 'deepseek', name: 'DeepSeek', vendor: 'deepseek', provider: 'OpenAICompatible', apiKey: '', baseURL: 'https://api.deepseek.com', model: 'deepseek-v4-pro', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 32 } }))
  expect(rejected).toMatchObject({ accepted: false, errorCode: 'AI_INVALID_CONFIG' })
  await contentPage.evaluate(() => {
    localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({ version: 2, activeVendor: 'custom', profiles: { custom: { id: 'agent-e2e', name: 'Test', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model: 'ai-test-slow', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 128 } } }))
    localStorage.setItem('appState/aiDialog/mode', 'ask')
  })
  await contentPage.reload()
  await topBarPage.getByTestId('header-ai-btn').click()
  const panel = contentPage.locator('.ai-dialog')
  await panel.locator('.ai-input').fill('agent-e2e 请慢慢回答这个问题')
  await panel.locator('.ai-input').press('Enter')
  await expect(panel.locator('.ai-stop-btn')).toBeVisible()
  await electronApp.evaluate(({ BrowserWindow }) => { const window = BrowserWindow.getAllWindows().find(window => window.isVisible()); window?.close(); window?.show() })
  await expect(panel.locator('.ai-run-state-message').last()).toContainText('运行已中断')
  await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
  await panel.locator('.ai-input').fill('窗口恢复后继续回答')
  await panel.locator('.ai-input').press('Enter')
  await expect(panel.locator('.ai-answer-message').last()).toContainText('测试流式回答完成')
})
