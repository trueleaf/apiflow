import { test, expect } from '../../../fixtures/electron.fixture'

test('面板通过 IPC 展示全部事件、终态、折叠和安全 Markdown，并保持历史滚动位置', async ({ electronApp, topBarPage, contentPage }, testInfo) => {
  test.setTimeout(90000)
  await contentPage.evaluate(() => {
    localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({ version: 2, activeVendor: 'custom', profiles: { custom: { id: 'agent-e2e', name: 'Test', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model: 'ai-test-text', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 128 } } }))
  })
  await contentPage.reload()
  await topBarPage.getByTestId('header-ai-btn').click()
  const panel = contentPage.locator('.ai-dialog')
  await panel.locator('.ai-input').fill('agent-e2e 初始化会话')
  await panel.locator('.ai-input').press('Enter')
  await expect(panel.locator('.ai-answer-message')).toContainText('测试流式回答完成')
  await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
  const conversationId = await contentPage.evaluate(async () => {
    const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('agentDataCache'); request.onsuccess = () => resolve(request.result) })
    const rows = await new Promise<Array<{ id: string; events: unknown[] }>>(resolve => { const request = db.transaction('conversations').objectStore('conversations').getAll(); request.onsuccess = () => resolve(request.result) })
    db.close()
    return rows.find(row => row.events.length > 0)?.id ?? ''
  })
  expect(conversationId).not.toBe('')
  const data: Array<Record<string, unknown>> = [
    { type: 'user-message', text: 'agent-e2e 全事件展示', language: 'zh-cn' },
    { type: 'run-state', state: 'running' },
    { type: 'reasoning', phase: 'delta', text: '分析事件' },
    { type: 'text', phase: 'delta', text: '[官方文档](https://example.com) [不安全](javascript:alert(1)) <img src=x onerror=alert(1)>\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```json\n{"ok":true}\n```' },
    { type: 'text', phase: 'end', text: '' },
    { type: 'step-start', step: 2 },
    ...['created', 'running', 'success', 'denied', 'responded', 'error'].map(state => ({ type: 'tool', toolCallId: `tool-${state}`, toolName: `tool-${state}`, title: `工具-${state}`, state, input: { password: 'secret-panel-input' }, displayData: { token: 'secret-panel-output' }, error: state === 'error' ? '受控失败' : undefined })),
    ...['requested', 'approved', 'denied', 'expired'].map(state => ({ type: 'approval', toolCallId: `approval-tool-${state}`, toolName: 'applyChangeSet', approvalId: `approval-${state}`, state, changeSetId: `change-${state}`, displayData: { secret: 'secret-panel-approval' } })),
    { type: 'source-url', sourceId: 'safe-source', title: '资料链接', url: 'https://example.com/docs' },
    { type: 'source-url', sourceId: 'unsafe-source', title: '禁用协议', url: 'javascript:alert(1)' },
    { type: 'source-document', sourceId: 'document', title: '设计文档', mediaType: 'application/json', filename: 'design.json' },
    { type: 'file', filename: 'result.json', mediaType: 'application/json', url: 'https://example.com/result.json' },
    ...['pending', 'running', 'completed', 'failed', 'interrupted'].map(state => ({ type: 'invocation', invocationId: `invocation-${state}`, title: `子调用-${state}`, state, output: { ok: true } })),
    { type: 'compacting', state: 'start' }, { type: 'compacting', state: 'end', removedEventCount: 4 },
    { type: 'conversation-updated', title: '会话已更新' },
    { type: 'client-tool-command', commandId: 'display-only', toolCallId: 'display-only-tool', toolName: 'getWorkspaceContext', input: { secret: 'secret-panel-command' } },
    ...['draft', 'previewed', 'approved', 'applying', 'applied', 'discarded', 'failed', 'expired'].map(state => ({ type: 'change-set', changeSetId: `cs-${state}`, state, displayData: { password: 'secret-panel-diff' } })),
    { type: 'error', errorCode: 'CONTROLLED_ERROR', message: '可重试错误', retryable: true },
    { type: 'finish', finishReason: 'stop', usage: { totalTokens: 10 } },
    { type: 'abort', reason: '用户停止' },
    ...['waiting_client_tool', 'waiting_approval', 'waiting_user_input', 'cancelling'].map(state => ({ type: 'run-state', state })),
    { type: 'run-state', state: 'completed' },
  ]
  // 注入 main IPC 事件而非直接修改 Pinia，加入重复与未知事件验证容错
  await electronApp.evaluate(({ webContents }, payload) => {
    const target = webContents.getAllWebContents().find(item => item.getURL().includes('index.html') && !item.getURL().includes('mcp.html'))
    payload.data.forEach((event, index) => {
      const envelope = { eventId: `panel-${index}`, conversationId: payload.conversationId, runId: 'panel-run', messageId: 'panel-message', sequence: index + 1, createdAt: Date.now(), ...event }
      target?.send('ai:main:to:renderer:event', { event: envelope })
      target?.send('ai:main:to:renderer:event', { event: envelope })
    })
    target?.send('ai:main:to:renderer:event', { event: { type: 'unknown' } })
    target?.send('ai:main:to:renderer:event', { event: { eventId: 'late', conversationId: payload.conversationId, runId: 'panel-run', messageId: 'panel-message', sequence: 1000, createdAt: Date.now(), type: 'text', phase: 'delta', text: '迟到内容不应展示' } })
  }, { conversationId, data })
  await expect(panel.locator('.ai-approval-message')).toHaveCount(4)
  await expect(panel.locator('.ai-invocation-message')).toHaveCount(5)
  await expect(panel.locator('.ai-change-set-message')).toHaveCount(8)
  await expect(panel.locator('.ai-tool-group')).toHaveCount(1)
  const group = panel.locator('.ai-tool-group')
  if (await group.locator('.ai-tool-message').count() === 0) await group.locator('summary,button').first().click()
  for (const state of ['created', 'running', 'success', 'denied', 'responded', 'error']) await expect(panel.locator(`.ai-tool-message.is-${state}`)).toHaveCount(1)
  await expect(panel).not.toContainText('secret-panel-')
  await expect(panel).not.toContainText('迟到内容不应展示')
  const answer = panel.locator('.ai-answer-message').last()
  await expect(answer.locator('table')).toHaveCount(1)
  await expect(answer.locator('pre')).toHaveCount(1)
  await expect(answer.locator('img')).toHaveCount(0)
  await expect(answer.locator('a[href^="javascript:"]')).toHaveCount(0)
  await expect(answer.getByRole('link', { name: '官方文档' })).toHaveAttribute('rel', 'noopener noreferrer')
  const reasoning = panel.locator('.ai-reasoning-message').last()
  await reasoning.locator('summary').click()
  await expect(reasoning).toHaveAttribute('open', '')
  await reasoning.locator('summary').click()
  await expect(reasoning).not.toHaveAttribute('open', '')
  // 浅色与深色均使用现有主题变量，并保留本地截图用于视觉核对
  for (const theme of ['light', 'dark']) {
    await contentPage.evaluate(value => document.documentElement.dataset.theme = value, theme)
    await panel.screenshot({ path: testInfo.outputPath(`agent-panel-${theme}.png`) })
    const size = await panel.locator('.ai-message-list').evaluate(element => ({ width: element.clientWidth, gap: getComputedStyle(element).gap }))
    expect(size.width).toBeLessThanOrEqual(736)
    expect(['18px', '21px']).toContain(size.gap)
  }
  await panel.locator('.ai-chat-view').evaluate(element => { element.scrollTop = 0; element.dispatchEvent(new Event('scroll')) })
  await electronApp.evaluate(({ webContents }, id) => {
    const target = webContents.getAllWebContents().find(item => item.getURL().includes('index.html') && !item.getURL().includes('mcp.html'))
    target?.send('ai:main:to:renderer:event', { event: { eventId: 'scroll-test', conversationId: id, runId: 'scroll-run', messageId: 'scroll-message', sequence: 1, createdAt: Date.now(), type: 'text', phase: 'end', text: '长内容\n'.repeat(250) } })
  }, conversationId)
  await expect(panel.locator('.ai-answer-message').last()).toContainText('长内容')
  expect(await panel.locator('.ai-chat-view').evaluate(element => element.scrollTop)).toBe(0)
  await panel.locator('.ai-chat-view').evaluate(element => { element.scrollTop = element.scrollHeight; element.dispatchEvent(new Event('scroll')) })
  await electronApp.evaluate(({ webContents }, id) => {
    const target = webContents.getAllWebContents().find(item => item.getURL().includes('index.html') && !item.getURL().includes('mcp.html'))
    for (const [index, state] of ['cancelled', 'failed', 'interrupted'].entries()) target?.send('ai:main:to:renderer:event', { event: { eventId: `terminal-${state}`, conversationId: id, runId: `terminal-${state}`, messageId: `terminal-${state}`, sequence: 1, createdAt: Date.now() + index, type: 'run-state', state } })
    target?.send('ai:main:to:renderer:event', { event: { eventId: 'follow', conversationId: id, runId: 'scroll-run', messageId: 'scroll-message', sequence: 2, createdAt: Date.now(), type: 'text', phase: 'end', text: '持续流式追加\n'.repeat(350) } })
  }, conversationId)
  for (const label of ['本次生成已取消', '运行失败', '运行已中断']) await expect(panel.locator('.ai-run-state-message').filter({ hasText: label })).toHaveCount(1)
  await expect.poll(async () => panel.locator('.ai-chat-view').evaluate(element => element.scrollHeight - element.scrollTop - element.clientHeight)).toBeLessThan(80)
  await panel.locator('.ai-dialog-close').click()
  await topBarPage.getByTestId('header-ai-btn').click()
  await expect(panel.locator('.ai-approval-message')).toHaveCount(4)
  await contentPage.reload()
  await topBarPage.getByTestId('header-ai-btn').click()
  await expect(contentPage.locator('.ai-approval-message')).toHaveCount(4)
  await expect(contentPage.locator('.ai-dialog')).not.toContainText('secret-panel-')
})
