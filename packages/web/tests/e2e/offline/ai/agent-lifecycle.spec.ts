import { test, expect } from '../../../fixtures/electron.fixture'

for (const scenario of [
  { name: 'Ask 停止后可以继续第二轮并保留上下文', mode: 'ask', model: 'ai-test-slow', prompt: '请先介绍接口设计', expected: '第二轮上下文完成', stop: true },
  { name: 'Ask 模型流错误显示失败而不是完成', mode: 'ask', model: 'ai-test-error', prompt: '请触发错误', expected: 'test-model-error', error: true },
  { name: 'Agent 单工具读取工作区后完成', mode: 'agent', model: 'ai-test-read', prompt: '请读取当前上下文', expected: '只读查询完成' },
  { name: 'Agent 多工具和多步查询不修改项目', mode: 'agent', model: 'ai-test-script', prompt: JSON.stringify({ steps: [[{ toolName: 'getWorkspaceContext', input: {} }, { toolName: 'searchProjects', input: { query: 'agent-e2e' } }], [{ toolName: 'searchProjects', input: { query: 'nothing' } }]] }), expected: '脚本完成' },
  { name: 'Agent 重复只读查询触发循环保护', mode: 'agent', model: 'ai-test-script', prompt: JSON.stringify({ steps: [[{ toolName: 'getWorkspaceContext', input: {} }], [{ toolName: 'getWorkspaceContext', input: {} }]] }), expected: 'AI_LOOP_GUARD', error: true },
  { name: 'Agent 达到十二步时停止并显示稳定错误', mode: 'agent', model: 'ai-test-script', prompt: JSON.stringify({ steps: Array.from({ length: 15 }, (_, index) => [{ toolName: 'searchProjects', input: { query: `agent-e2e-${index}` } }]) }), expected: 'AI_MAX_STEPS', error: true },
]) {
  test(scenario.name, async ({ topBarPage, contentPage }) => {
    test.setTimeout(60000)
    // 在独立测试实例配置确定性模型，通过用户输入触发完整运行链路
    await contentPage.evaluate(({ mode, model }) => {
      localStorage.setItem('runtime/hasCreatedExampleProject', 'true')
      localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({ version: 2, activeVendor: 'custom', profiles: { custom: { id: 'agent-e2e', name: 'Test', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model, customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 128 } } }))
      localStorage.setItem('appState/aiDialog/mode', mode)
    }, scenario)
    await contentPage.reload()
    await topBarPage.getByTestId('header-ai-btn').click()
    const panel = contentPage.locator('.ai-dialog')
    const input = panel.locator('.ai-input')
    await input.fill(scenario.prompt)
    await input.press('Enter')
    if (scenario.stop) {
      await expect(panel.locator('.ai-answer-message')).toContainText('测试流式回答完成')
      await panel.locator('.ai-stop-btn').click()
      await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
      await expect(panel.locator('.ai-cancelled-message')).toBeVisible()
      await input.fill('继续刚才的话题')
      await input.press('Enter')
    }
    await expect(panel.locator(scenario.error ? '.ai-error-message' : '.ai-answer-message').last()).toContainText(scenario.expected)
    await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
    if (scenario.error) await expect(panel.locator('.ai-run-state-message').last()).toContainText('失败')
    if (scenario.model === 'ai-test-script') {
      const commands = await contentPage.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('agentDataCache'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
        const rows = await new Promise<Array<{ events: Array<{ type: string; toolName?: string }> }>>(resolve => { const request = db.transaction('conversations').objectStore('conversations').getAll(); request.onsuccess = () => resolve(request.result) })
        db.close()
        return rows.flatMap(row => row.events).filter(event => event.type === 'client-tool-command').map(event => event.toolName)
      })
      expect(commands.every(name => name === 'searchProjects' || name === 'getWorkspaceContext')).toBe(true)
      if (scenario.expected === 'AI_MAX_STEPS') expect(commands).toHaveLength(12)
      if (scenario.expected === 'AI_LOOP_GUARD') expect(commands).toHaveLength(1)
    }
  })
}

for (const decision of ['允许', '拒绝', '停止'] as const) {
  test(`创建项目与 HTTP 节点的 ChangeSet ${decision}后保持正确状态`, async ({ topBarPage, contentPage }) => {
    test.setTimeout(60000)
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/hasCreatedExampleProject', 'true')
      localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({ version: 2, activeVendor: 'custom', profiles: { custom: { id: 'agent-e2e', name: 'Test', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model: 'ai-test-script', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 128 } } }))
      localStorage.setItem('appState/aiDialog/mode', 'agent')
    })
    await contentPage.reload()
    await topBarPage.getByTestId('header-ai-btn').click()
    const panel = contentPage.locator('.ai-dialog')
    // 提案生成后走 AI SDK 审批，审批前数据库中不能出现业务数据
    await panel.locator('.ai-input').fill(JSON.stringify({ steps: [[{ toolName: 'createDesignChange', input: { title: 'agent-e2e-create', targetProjectId: null, operations: [{ type: 'createProject', name: 'agent-e2e-project' }, { type: 'createNode', nodeType: 'http', name: 'agent-e2e-http', data: { method: 'POST', url: 'https://example.com/api', headers: [{ key: 'Authorization', value: 'Bearer agent-e2e-secret' }] } }] } }], [{ toolName: 'applyChangeSet', input: { changeSetId: '$changeSetId' } }]] }))
    await panel.locator('.ai-input').press('Enter')
    const approval = panel.locator('.ai-approval-message').last()
    await expect(approval.getByRole('button', { name: '允许', exact: true })).toBeVisible()
    await expect(approval).not.toContainText('agent-e2e-secret')
    const approvalRequest = await contentPage.evaluate(async () => {
      const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('agentDataCache'); request.onsuccess = () => resolve(request.result) })
      const rows = await new Promise<Array<{ events: Array<{ type: string; state?: string; conversationId: string; runId: string; messageId: string; approvalId: string; toolCallId: string }> }>>(resolve => { const request = db.transaction('conversations').objectStore('conversations').getAll(); request.onsuccess = () => resolve(request.result) })
      db.close()
      const event = rows.flatMap(row => row.events).find(event => event.type === 'approval' && event.state === 'requested')!
      return { conversationId: event.conversationId, runId: event.runId, messageId: event.messageId, approvalId: event.approvalId, toolCallId: event.toolCallId, approved: true }
    })
    await approval.getByRole('button', { name: decision, exact: true }).click()
    await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
    await expect(approval).toContainText(decision === '允许' ? '已批准' : decision === '拒绝' ? '已拒绝' : '审批已过期')
    for (let repeat = 0; repeat < 2; repeat += 1) {
      const replay = await contentPage.evaluate(request => window.electronAPI!.aiManager.respondApproval(request), approvalRequest)
      expect(replay).toMatchObject({ accepted: false, errorCode: 'AI_APPROVAL_EXPIRED' })
    }
    const state = await contentPage.evaluate(async () => {
      const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('workspaceDataCache'); request.onsuccess = () => resolve(request.result) })
      const tx = db.transaction(['projects', 'httpNodeList'])
      const projects = await new Promise<Array<{ projectName: string }>>(resolve => { const request = tx.objectStore('projects').getAll(); request.onsuccess = () => resolve(request.result) })
      const nodes = await new Promise<Array<{ info: { name: string }; item?: { headers: Array<{ key: string; value: string }> } }>>(resolve => { const request = db.transaction('httpNodeList').objectStore('httpNodeList').getAll(); request.onsuccess = () => resolve(request.result) })
      db.close()
      return { projects: projects.filter(project => project.projectName === 'agent-e2e-project').length, nodes: nodes.filter(node => node.info.name === 'agent-e2e-http').length, authorization: nodes.find(node => node.info.name === 'agent-e2e-http')?.item?.headers.find(header => header.key === 'Authorization')?.value }
    })
    expect(state.projects).toBe(decision === '允许' ? 1 : 0)
    expect(state.nodes).toBe(decision === '允许' ? 1 : 0)
    if (decision === '允许') expect(state.authorization).toBe('Bearer agent-e2e-secret')
  })
}
