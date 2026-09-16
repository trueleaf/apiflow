import { test, expect } from '../../../fixtures/electron.fixture'

test('项目中的创建、修改、变量、请求头、删除和恢复均经过 ChangeSet 审批', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
  test.setTimeout(120000)
  const renderingErrors: string[] = []
  contentPage.on('pageerror', error => renderingErrors.push(error.message))
  contentPage.on('console', event => { if (event.type() === 'error') renderingErrors.push(event.text()) })
  await clearCache()
  await contentPage.evaluate(() => {
    localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({ version: 2, activeVendor: 'custom', profiles: { custom: { id: 'agent-e2e', name: 'Test', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model: 'ai-test-script', customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 128 } } }))
  })
  await contentPage.reload()
  await createProject('agent-e2e-design')
  expect(renderingErrors).toEqual([])
  try {
    await createNode(contentPage, { nodeType: 'http', name: 'agent-e2e-current' })
  } catch (error) {
    expect(renderingErrors, '工作区渲染错误').toEqual([])
    throw error
  }
  const identifiers = await contentPage.evaluate(async () => {
    const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('workspaceDataCache'); request.onsuccess = () => resolve(request.result) })
    const rows = await new Promise<Array<{ _id: string; projectId: string; info: { name: string } }>>(resolve => { const request = db.transaction('httpNodeList').objectStore('httpNodeList').getAll(); request.onsuccess = () => resolve(request.result) })
    db.close()
    const node = rows.find(row => row.info.name === 'agent-e2e-current')
    if (!node) throw new Error('测试节点未建立')
    return { projectId: node.projectId, nodeId: node._id }
  })
  const { projectId, nodeId } = identifiers
  await topBarPage.getByTestId('header-ai-btn').click()
  const panel = contentPage.locator('.ai-dialog')
  const changes = [
    { toolName: 'updateDesignChange', operation: { type: 'updateNode', projectId, nodeId, patch: { name: 'agent-e2e-updated', method: 'POST', url: 'https://example.com/updated' } } },
    { toolName: 'createDesignChange', operation: { type: 'createNode', projectId, name: 'agent-e2e-created', nodeType: 'http' } },
    { toolName: 'updateVariablesChange', operation: { type: 'updateVariables', projectId, variables: [{ name: 'agent-e2e-variable', value: '42', type: 'string' }] } },
    { toolName: 'updateCommonHeadersChange', operation: { type: 'updateCommonHeaders', projectId, headers: [{ key: 'X-Agent-E2E', value: 'enabled' }] } },
    { toolName: 'deleteNodesChange', operation: { type: 'deleteNode', projectId, nodeId, includeChildren: false } },
    { toolName: 'restoreNodesChange', operation: { type: 'restoreNode', projectId, nodeId } },
  ]
  for (const [index, change] of changes.entries()) {
    // 搜索提供可信业务 ID，然后通过审批按钮执行一次真实离线事务
    const prompt = { steps: [[{ toolName: 'searchNodes', input: { projectId, includeDeleted: true } }], [{ toolName: change.toolName, input: { targetProjectId: projectId, title: `agent-e2e-change-${index}`, operations: [change.operation] } }], [{ toolName: 'applyChangeSet', input: { changeSetId: '$changeSetId' } }]], text: `变更 ${index} 完成` }
    await panel.locator('.ai-input').fill(JSON.stringify(prompt))
    await panel.locator('.ai-input').press('Enter')
    await expect(panel.locator('.ai-approval-message').last().getByRole('button', { name: '允许', exact: true })).toBeVisible()
    await panel.locator('.ai-approval-message').last().getByRole('button', { name: '允许', exact: true }).click()
    await expect(panel.locator('.ai-answer-message').last()).toContainText(`变更 ${index} 完成`)
    await expect(panel.locator('.ai-stop-btn')).toHaveCount(0)
    expect(await panel.locator('.ai-tool-message.is-error').allInnerTexts()).toEqual([])
    const saved = await contentPage.evaluate(async ({ nodeId, projectId }) => {
      const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('workspaceDataCache'); request.onsuccess = () => resolve(request.result) })
      const results: Record<string, unknown[]> = {}
      for (const storeName of ['httpNodeList', 'variables', 'commonHeaders', 'agentReceipts']) results[storeName] = await new Promise<unknown[]>(resolve => { const request = db.transaction(storeName).objectStore(storeName).getAll(); request.onsuccess = () => resolve(request.result) })
      db.close()
      return { node: (results.httpNodeList as Array<{ _id: string; info: { name: string }; isDeleted: boolean; item: { method: string; url: { path: string } } }>).find(node => node._id === nodeId), variables: (results.variables as Array<{ projectId: string; name: string }>).filter(variable => variable.projectId === projectId), headers: results.commonHeaders, receipts: results.agentReceipts.length }
    }, identifiers)
    expect(saved.receipts).toBe(index + 1)
    if (index === 0) {
      expect(saved.node).toMatchObject({ info: { name: 'agent-e2e-updated' }, item: { method: 'POST', url: { path: 'https://example.com/updated' } } })
      await expect(contentPage.getByTestId('url-input')).toContainText('https://example.com/updated')
    }
    if (index === 2) expect(saved.variables).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'agent-e2e-variable' })]))
    if (index === 3) expect(saved.headers).toEqual(expect.arrayContaining([expect.objectContaining({ key: 'X-Agent-E2E', value: 'enabled' })]))
    if (index === 4) expect(saved.node?.isDeleted).toBe(true)
    if (index === 5) expect(saved.node?.isDeleted).toBe(false)
  }
})
