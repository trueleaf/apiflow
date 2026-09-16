import { test, expect } from '../../../fixtures/electron.fixture'

test('旧消息迁移后重开面板保留回答，刷新恢复中断与过期审批，清理不残留会话数据', async ({ electronApp, topBarPage, contentPage, clearCache }) => {
  test.setTimeout(90000)
  await clearCache()
  await contentPage.evaluate(() => {
    localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({ version: 2, activeVendor: 'custom', profiles: { custom: { id: 'agent-e2e', name: 'Test', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model: 'ai-test-text', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 128 } } }))
    localStorage.setItem('apiflow/ai/conversation-v2', JSON.stringify({ updatedAt: 1, agentMessages: [{ id: 'legacy-user', kind: 'question', content: '旧问题', createdAt: 1 }, { id: 'legacy-answer', kind: 'response', content: '旧回答', createdAt: 2 }, { id: 'legacy-tool', kind: 'tool-call', content: '旧工具不得恢复执行', createdAt: 3 }], askMessages: [] }))
  })
  await contentPage.reload()
  await topBarPage.getByTestId('header-ai-btn').click()
  const panel = contentPage.locator('.ai-dialog')
  await expect(panel.locator('.ai-user-message')).toContainText('旧问题')
  await expect(panel.locator('.ai-answer-message')).toContainText('旧回答')
  await expect(panel).not.toContainText('旧工具不得恢复执行')
  expect(await contentPage.evaluate(() => localStorage.getItem('apiflow/ai/conversation-v2'))).toBeNull()
  // 按逆序发送序列，随后刷新，验证事件排序与未完成审批恢复
  await electronApp.evaluate(({ webContents }) => {
    const target = webContents.getAllWebContents().find(item => item.getURL().includes('index.html') && !item.getURL().includes('mcp.html'))
    const events = [{ type: 'run-state', state: 'running' }, { type: 'text', phase: 'delta', text: '有序内容' }, { type: 'approval', toolCallId: 'cache-tool', toolName: 'applyChangeSet', approvalId: 'cache-approval', state: 'requested' }, { type: 'run-state', state: 'waiting_approval' }]
    events.map((event, index) => ({ ...event, eventId: `cache-${index}`, conversationId: 'migrated-agent', runId: 'cache-run', messageId: 'cache-message', sequence: index + 1, createdAt: 100 + index })).reverse().forEach(event => target?.send('ai:main:to:renderer:event', { event }))
  })
  await expect(panel.locator('.ai-approval-message').getByRole('button', { name: '允许', exact: true })).toBeVisible()
  await contentPage.reload()
  await topBarPage.getByTestId('header-ai-btn').click()
  await expect(panel.locator('.ai-approval-message')).toContainText('审批已过期')
  await expect(panel.locator('.ai-run-state-message').last()).toContainText('运行已中断')
  await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
  await panel.locator('.ai-new-chat-btn').click()
  await expect(panel.locator('.ai-user-message')).toHaveCount(0)
  const remaining = await contentPage.evaluate(async () => {
    const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('agentDataCache'); request.onsuccess = () => resolve(request.result) })
    const rows = await new Promise<unknown[]>(resolve => { const request = db.transaction('conversations').objectStore('conversations').getAll(); request.onsuccess = () => resolve(request.result) })
    const changes = await new Promise<unknown[]>(resolve => { const request = db.transaction('changeSets').objectStore('changeSets').getAll(); request.onsuccess = () => resolve(request.result) })
    db.close()
    return JSON.stringify({ rows, changes })
  })
  expect(remaining).not.toMatch(/旧问题|旧回答|cache-approval|有序内容/)
})

test('会话事件缓存限制条数和字节数并清除敏感工具参数', async ({ electronApp, topBarPage, contentPage }) => {
  test.setTimeout(90000)
  await topBarPage.getByTestId('header-ai-btn').click()
  await expect(contentPage.locator('.ai-dialog')).toBeVisible()
  await electronApp.evaluate(({ webContents }) => {
    const target = webContents.getAllWebContents().find(item => item.getURL().includes('index.html') && !item.getURL().includes('mcp.html'))
    for (let index = 0; index < 520; index += 1) target?.send('ai:main:to:renderer:event', { event: { eventId: `capacity-${index}`, conversationId: 'capacity-conversation', runId: 'capacity-run', messageId: 'capacity-message', sequence: index + 1, createdAt: Date.now(), type: 'tool', toolCallId: `capacity-tool-${index}`, toolName: 'searchNodes', title: 'Cache', state: 'success', input: { password: 'cache-sensitive-input' }, displayData: { token: 'cache-sensitive-output' } } })
    target?.send('ai:main:to:renderer:event', { event: { eventId: 'capacity-finish', conversationId: 'capacity-conversation', runId: 'capacity-run', messageId: 'capacity-message', sequence: 521, createdAt: Date.now(), type: 'run-state', state: 'completed' } })
  })
  await expect.poll(async () => contentPage.evaluate(async () => {
    const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('agentDataCache'); request.onsuccess = () => resolve(request.result) })
    const row = await new Promise<{ events: Array<{ eventId: string }> } | undefined>(resolve => { const request = db.transaction('conversations').objectStore('conversations').get('capacity-conversation'); request.onsuccess = () => resolve(request.result) })
    db.close()
    return row?.events.at(-1)?.eventId
  }), { timeout: 30000 }).toBe('capacity-finish')
  const cache = await contentPage.evaluate(async () => {
    const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('agentDataCache'); request.onsuccess = () => resolve(request.result) })
    const row = await new Promise<{ events: unknown[] }>(resolve => { const request = db.transaction('conversations').objectStore('conversations').get('capacity-conversation'); request.onsuccess = () => resolve(request.result) })
    db.close()
    return { count: row.events.length, bytes: new TextEncoder().encode(JSON.stringify(row.events)).byteLength, text: JSON.stringify(row.events) }
  })
  expect(cache.count).toBeLessThanOrEqual(500)
  expect(cache.bytes).toBeLessThanOrEqual(2 * 1024 * 1024)
  expect(cache.text).not.toContain('cache-sensitive-')
})
