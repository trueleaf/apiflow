import { test, expect } from '../../../fixtures/electron.fixture'
import type { AgentToolResult } from '../../../../src/types/ai'

test('ChangeSet 执行层拒绝未审批、重复、循环父子关系和并发修订冲突', async ({ electronApp, topBarPage, contentPage, createProject, createNode }) => {
  test.setTimeout(120000)
  await createProject('agent-e2e-guard')
  await createNode(contentPage, { nodeType: 'folder', name: 'agent-e2e-parent-a' })
  await createNode(contentPage, { nodeType: 'folder', name: 'agent-e2e-parent-b' })
  await createNode(contentPage, { nodeType: 'http', name: 'agent-e2e-target' })
  await topBarPage.getByTestId('header-ai-btn').click()
  await expect(contentPage.locator('.ai-dialog')).toBeVisible()
  const nodes = await contentPage.evaluate(async () => {
    const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('workspaceDataCache'); request.onsuccess = () => resolve(request.result) })
    const rows = await new Promise<Array<{ _id: string; projectId: string; info: { name: string } }>>(resolve => { const request = db.transaction('httpNodeList').objectStore('httpNodeList').getAll(); request.onsuccess = () => resolve(request.result) })
    db.close()
    return rows.filter(row => row.info.name.startsWith('agent-e2e-'))
  })
  const node = nodes.find(row => row.info.name === 'agent-e2e-target')!
  const parentA = nodes.find(row => row.info.name === 'agent-e2e-parent-a')!
  const parentB = nodes.find(row => row.info.name === 'agent-e2e-parent-b')!
  let changeSetId = ''
  const commands = [
    { name: 'getWorkspaceContext', input: {}, success: true },
    { name: 'searchProjects', input: { query: 'agent-e2e-guard' }, success: true },
    { name: 'searchNodes', input: { projectId: node.projectId }, success: true },
    { name: 'listNodeTree', input: { projectId: node.projectId }, success: true },
    { name: 'getDeletedNodes', input: { projectId: node.projectId }, success: true },
    { name: 'getNodeDetail', input: { nodeId: node._id }, success: true },
    { name: 'getNodeDetail', input: { nodeId: 'forged-node' }, success: false, error: 'does not exist' },
    { name: 'manageMockServer', input: { nodeId: node._id, kind: 'http', action: 'start' }, success: false, error: 'does not match' },
    { name: 'createDesignChange', input: { title: 'agent-e2e-once', targetProjectId: node.projectId, operations: [{ type: 'createNode', projectId: node.projectId, name: 'agent-e2e-once', nodeType: 'http' }] }, success: true },
    { name: 'applyChangeSet', input: {}, success: false, error: 'CHANGESET_APPROVAL_REQUIRED' },
    { name: 'setChangeSetApproval', input: { approvalId: 'guard-approval', approved: true }, success: true },
    { name: 'applyChangeSet', input: {}, success: true },
    { name: 'applyChangeSet', input: {}, success: true },
    { name: 'moveNodesChange', input: { title: 'move', targetProjectId: node.projectId, operations: [{ type: 'moveNode', projectId: node.projectId, nodeId: node._id, parentId: parentA._id }] }, success: true },
    { name: 'setChangeSetApproval', input: { approvalId: 'move-approval', approved: true }, success: true },
    { name: 'applyChangeSet', input: {}, success: true },
    { name: 'moveNodesChange', input: { title: 'cycle', targetProjectId: node.projectId, operations: [{ type: 'moveNode', projectId: node.projectId, nodeId: parentA._id, parentId: parentB._id }, { type: 'moveNode', projectId: node.projectId, nodeId: parentB._id, parentId: parentA._id }] }, success: false, error: 'cycle' },
    { name: 'createDesignChange', input: { title: 'discard', targetProjectId: node.projectId, operations: [{ type: 'createNode', projectId: node.projectId, name: 'agent-e2e-discarded', nodeType: 'http' }] }, success: true },
    { name: 'discardChangeSet', input: {}, success: true },
    { name: 'applyChangeSet', input: {}, success: true },
    { name: 'updateDesignChange', input: { title: 'conflict', targetProjectId: node.projectId, operations: [{ type: 'updateNode', projectId: node.projectId, nodeId: node._id, patch: { name: 'agent-e2e-stale' } }] }, success: true },
    { name: 'setChangeSetApproval', input: { approvalId: 'conflict-approval', approved: true }, success: true },
    { name: 'applyChangeSet', input: {}, success: false, conflict: true, error: 'changed' },
    { name: 'updateDesignChange', input: { title: 'atomic rollback', targetProjectId: node.projectId, operations: [{ type: 'updateNode', projectId: node.projectId, nodeId: node._id, patch: { name: 'agent-e2e-rollback' } }, { type: 'updateNode', projectId: node.projectId, nodeId: parentA._id, patch: { name: 'agent-e2e-unreachable' } }] }, success: true },
    { name: 'setChangeSetApproval', input: { approvalId: 'rollback-approval', approved: true }, success: true },
    { name: 'applyChangeSet', input: {}, success: false, rollback: true, error: 'injected write failure' },
    { name: 'updateDesignChange', input: { title: 'expired', targetProjectId: node.projectId, operations: [{ type: 'updateNode', projectId: node.projectId, nodeId: node._id, patch: { name: 'agent-e2e-expired' } }] }, success: true },
    { name: 'setChangeSetApproval', input: { approvalId: 'expired-approval', approved: true }, success: true },
    { name: 'applyChangeSet', input: {}, success: true, expired: true },
  ]
  for (const [index, command] of commands.entries()) {
    if (command.expired) await contentPage.clock.setFixedTime(new Date(Date.now() + 25 * 60 * 60 * 1000))
    if (command.rollback) await contentPage.evaluate(() => {
      // 在第二笔节点写入前模拟 IndexedDB 故障，第一笔写入必须由同一事务回滚
      const original = IDBObjectStore.prototype.put
      let writes = 0
      IDBObjectStore.prototype.put = function(value: unknown, key?: IDBValidKey) {
        if (this.name === 'httpNodeList' && ++writes === 2) { IDBObjectStore.prototype.put = original; throw new Error('injected write failure') }
        return key === undefined ? original.call(this, value) : original.call(this, value, key)
      }
    })
    if (command.conflict) {
      // 模拟另一写入者在预览后提交业务数据，验证 apply 的事务内修订检查
      await contentPage.evaluate(async id => {
        const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('workspaceDataCache'); request.onsuccess = () => resolve(request.result) })
        await new Promise<void>(resolve => { const tx = db.transaction('httpNodeList', 'readwrite'); const store = tx.objectStore('httpNodeList'); const request = store.get(id); request.onsuccess = () => store.put({ ...request.result, updatedAt: 'concurrent-change' }, id); tx.oncomplete = () => resolve() })
        db.close()
      }, node._id)
    }
    const result = await electronApp.evaluate(({ ipcMain, webContents }, payload) => new Promise<AgentToolResult>((resolve, reject) => {
      const channel = 'ai:renderer:to:main:client-tool-result'
      const timer = setTimeout(() => { ipcMain.removeListener(channel, receive); reject(new Error('Client command timeout')) }, 10000)
      const receive = (_event: unknown, value: { commandId: string; result: AgentToolResult }) => {
        if (value.commandId !== payload.commandId) return
        clearTimeout(timer)
        ipcMain.removeListener(channel, receive)
        resolve(value.result)
      }
      ipcMain.on(channel, receive)
      webContents.getAllWebContents().find(item => item.getURL().includes('index.html') && !item.getURL().includes('mcp.html'))?.send('ai:main:to:renderer:client-tool-command', payload)
    }), { eventId: `guard-${index}`, conversationId: 'guard-conversation', runId: 'guard-run', messageId: 'guard-message', sequence: index + 1, createdAt: Date.now(), type: 'client-tool-command', commandId: `guard-command-${index}`, toolCallId: `guard-tool-${index}`, toolName: command.name, input: command.name.includes('ChangeSet') || command.name === 'setChangeSetApproval' ? { ...command.input, changeSetId } : command.input })
    expect(result.success, `${command.name}: ${result.summary}`).toBe(command.success)
    if (command.error) expect(result.summary).toContain(command.error)
    if (result.changeSetId) changeSetId = result.changeSetId
  }
  const saved = await contentPage.evaluate(async () => {
    const db = await new Promise<IDBDatabase>(resolve => { const request = indexedDB.open('workspaceDataCache'); request.onsuccess = () => resolve(request.result) })
    const nodes = await new Promise<Array<{ info: { name: string } }>>(resolve => { const request = db.transaction('httpNodeList').objectStore('httpNodeList').getAll(); request.onsuccess = () => resolve(request.result) })
    const receipts = await new Promise<number>(resolve => { const request = db.transaction('agentReceipts').objectStore('agentReceipts').count(); request.onsuccess = () => resolve(request.result) })
    db.close()
    return { names: nodes.map(node => node.info.name), receipts }
  })
  expect(saved.names.filter(name => name === 'agent-e2e-once')).toHaveLength(1)
  expect(saved.names).not.toContain('agent-e2e-discarded')
  expect(saved.names).not.toContain('agent-e2e-stale')
  expect(saved.names).not.toContain('agent-e2e-expired')
  expect(saved.names).not.toContain('agent-e2e-rollback')
  expect(saved.names).not.toContain('agent-e2e-unreachable')
  expect(saved.receipts).toBe(2)
})
