import { test, expect } from '../../../fixtures/electron.fixture'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'

for (const nodeType of ['http', 'websocket', 'httpMock', 'websocketMock'] as const) {
  test(`Agent ${nodeType} 运行工具审批、状态与取消资源清理`, async ({ electronApp, topBarPage, contentPage, clearCache, createProject, createNode }) => {
    test.setTimeout(120000)
    let requests = 0
    let messages = 0
    let connections = 0
    let slow = false
    let pendingRequests = 0
    const server = createServer((_request, response) => { requests += 1; pendingRequests += 1; response.once('close', () => { pendingRequests -= 1 }); if (slow) return; response.writeHead(200, { 'Content-Type': 'application/json' }); response.end('{"ok":true}') })
    const websocketServer = new WebSocketServer({ server })
    websocketServer.on('connection', socket => { connections += 1; socket.on('message', () => { messages += 1 }); socket.on('close', () => { connections -= 1 }) })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Test server has no port')
    const port = address.port
    // Mock 使用系统分配的空闲端口，测试自建 HTTP/WS 服务继续保持监听
    if (nodeType.endsWith('Mock')) await new Promise<void>(resolve => server.close(() => resolve()))
    try {
      await clearCache()
      await contentPage.evaluate(() => {
        localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({ version: 2, activeVendor: 'custom', profiles: { custom: { id: 'agent-e2e', name: 'Test', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model: 'ai-test-script', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 128 } } }))
        localStorage.setItem('appState/aiDialog/mode', 'agent')
      })
      await contentPage.reload()
      await createProject(`agent-e2e-${nodeType}`)
      const nodeId = await createNode(contentPage, { nodeType, name: `agent-e2e-${nodeType}-node` })
      if (nodeType === 'http') {
        await contentPage.getByTestId('url-input').locator('[contenteditable]').fill(`http://127.0.0.1:${port}/echo`)
        await contentPage.getByTestId('operation-save-btn').click()
      } else if (nodeType === 'websocket') {
        await contentPage.locator('.ws-operation .url-rich-input [contenteditable]').fill(`ws://127.0.0.1:${port}/ws`)
        await contentPage.getByTestId('websocket-operation-save-btn').click()
      } else {
        const config = contentPage.locator('.mock-config-content')
        await config.locator('.condition-content .port-input input').fill(String(port))
        await config.locator(nodeType === 'httpMock' ? '.condition-content .url-input input' : '.condition-content .path-input input').fill('/agent-e2e')
        await config.getByRole('button', { name: /保存配置/ }).click()
      }
      await topBarPage.getByTestId('header-ai-btn').click()
      const panel = contentPage.locator('.ai-dialog')
      const toolName = nodeType === 'http' ? 'sendHttpRequest' : nodeType === 'websocket' ? 'manageWebSocketConnection' : 'manageMockServer'
      const actions = nodeType === 'http' ? ['request'] : nodeType === 'websocket' ? ['status', 'connect', 'send', 'disconnect'] : ['status', 'start', 'stop']
      const steps = actions.map(action => [{ toolName, input: { nodeId, ...(nodeType === 'http' ? {} : { action }), ...(nodeType.endsWith('Mock') ? { kind: nodeType === 'httpMock' ? 'http' : 'websocket' } : {}), ...(action === 'send' ? { message: 'agent-e2e-ping' } : {}) } }])
      await panel.locator('.ai-input').fill(JSON.stringify({ steps }))
      await panel.locator('.ai-input').press('Enter')
      const approval = panel.locator('.ai-approval-message').last()
      for (const action of actions.filter(action => action !== 'status')) {
        await expect(approval.getByRole('button', { name: '允许', exact: true })).toBeVisible()
        if (action === 'connect') expect(connections).toBe(0)
        if (action === 'request') expect(requests).toBe(0)
        await approval.getByRole('button', { name: '允许', exact: true }).click()
        await expect(approval).toContainText('已批准')
      }
      await expect(panel.locator('.ai-answer-message').last()).toContainText('脚本完成')
      await expect(panel.locator('.ai-tool-message.is-error')).toHaveCount(0)
      if (nodeType === 'http') expect(requests).toBe(1)
      if (nodeType === 'websocket') { expect(messages).toBe(1); await expect.poll(() => connections).toBe(0) }
      if (nodeType === 'http') {
        slow = true
        await panel.locator('.ai-input').fill(JSON.stringify({ steps }))
        await panel.locator('.ai-input').press('Enter')
        await expect(approval.getByRole('button', { name: '允许', exact: true })).toBeVisible()
        await approval.getByRole('button', { name: '允许', exact: true }).click()
        await expect.poll(() => pendingRequests).toBe(1)
        await panel.locator('.ai-stop-btn').click()
        await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
        await expect.poll(() => pendingRequests).toBe(0)
        expect(requests).toBe(2)
      } else {
        // 先批准启动，再在停止/发送的待审批阶段取消，必须释放本轮创建的资源
        await panel.locator('.ai-input').fill(JSON.stringify({ steps: steps.filter(step => step[0].input.action !== 'status') }))
        await panel.locator('.ai-input').press('Enter')
        await expect(approval.getByRole('button', { name: '允许', exact: true })).toBeVisible()
        await approval.getByRole('button', { name: '允许', exact: true }).click()
        await expect(panel.locator('.ai-approval-message').filter({ has: contentPage.getByRole('button', { name: '停止', exact: true }) })).toBeVisible()
        await approval.getByRole('button', { name: '停止', exact: true }).click()
        await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
        if (nodeType === 'websocket') { await expect.poll(() => connections).toBe(0); expect(messages).toBe(1) }
        else await expect.poll(async () => { try { const response = await fetch(`http://127.0.0.1:${port}/agent-e2e`); return response.status } catch { return 0 } }).toBe(0)
      }
      // 再次批准运行后退出独立测试应用，进程退出必须释放请求、连接与监听端口
      await panel.locator('.ai-input').fill(JSON.stringify({ steps: steps.filter(step => step[0].input.action !== 'status') }))
      await panel.locator('.ai-input').press('Enter')
      await expect(approval.getByRole('button', { name: '允许', exact: true })).toBeVisible()
      await approval.getByRole('button', { name: '允许', exact: true }).click()
      if (nodeType === 'http') await expect.poll(() => pendingRequests).toBe(1)
      else await expect(approval.getByRole('button', { name: '停止', exact: true })).toBeVisible()
      await electronApp.close()
      if (nodeType === 'http') await expect.poll(() => pendingRequests).toBe(0)
      else if (nodeType === 'websocket') await expect.poll(() => connections).toBe(0)
      else await expect.poll(async () => { try { const response = await fetch(`http://127.0.0.1:${port}/agent-e2e`); return response.status } catch { return 0 } }).toBe(0)
    } finally {
      for (const socket of websocketServer.clients) socket.terminate()
      websocketServer.close()
      server.closeAllConnections()
      await new Promise<void>(resolve => server.close(() => resolve()))
    }
  })
}
