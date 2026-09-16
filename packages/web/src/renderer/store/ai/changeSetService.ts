import { nanoid } from 'nanoid'
import { sha256 } from 'js-sha256'
import { merge } from 'lodash-es'
import type { ApiNode, ApidocProperty, ApidocVariable, HttpMockNode, HttpNode, WebSocketMockNode, WebSocketNode } from '@src/types'
import type { ChangeOperation, ChangeSet, ChangeSetPreview, ChangeSetPreviewItem } from '@src/types/ai'
import { agentDataCache } from '@/cache/ai/agentDataCache'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { projectCache } from '@/cache/project/projectCache'
import { getWorkspaceDataDB } from '@/cache/workspaceDataCache'
import { redactAIText } from '@src/shared/ai/redaction'
import { createEmptyFolderNode } from '@/composables/useImport'
import { generateEmptyHttpMockNode, generateEmptyHttpNode, generateEmptyProject, generateEmptyWebSocketMockNode, generateEmptyWebsocketNode } from '@/helper'

const changeSetTTL = 24 * 60 * 60 * 1000
const allowedMethods = new Set(['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'connect', 'trace'])
// 生成稳定的数据修订摘要
const serializeRevision = (project: unknown, nodes: ApiNode[], variables: ApidocVariable[], headers: ApidocProperty[]): string => sha256(JSON.stringify({ project, nodes: [...nodes].sort((a, b) => a._id.localeCompare(b._id)), variables: [...variables].sort((a, b) => a._id.localeCompare(b._id)), headers: [...headers].sort((a, b) => a._id.localeCompare(b._id)) }))
// 读取对象字段
const readString = (value: Record<string, unknown>, key: string): string | undefined => typeof value[key] === 'string' ? value[key] : undefined
// 计算项目数据修订号
export const getProjectRevision = async (projectId: string | null): Promise<string> => {
  if (!projectId) return 'new-project'
  const db = await getWorkspaceDataDB()
  const tx = db.transaction(['projects', 'httpNodeList', 'variables', 'commonHeaders'], 'readonly')
  return serializeRevision(await tx.objectStore('projects').get(projectId), await tx.objectStore('httpNodeList').index('projectId').getAll(projectId), await tx.objectStore('variables').index('projectId').getAll(projectId), await tx.objectStore('commonHeaders').getAll())
}
// 创建 ChangeSet
export const createChangeSet = async (input: { conversationId: string; runId: string; targetProjectId: string | null; title: string; description: string; operations: ChangeOperation[] }): Promise<ChangeSet> => {
  const now = Date.now()
  const changeSet: ChangeSet = { id: nanoid(), ...input, status: 'draft', baseRevision: await getProjectRevision(input.targetProjectId), createdAt: now, expiresAt: now + changeSetTTL }
  await agentDataCache.putChangeSet(changeSet)
  return changeSet
}
// 查找节点所有后代
const getDescendantIds = (nodes: ApiNode[], nodeId: string): string[] => {
  const result: string[] = []
  const pending = [nodeId]
  while (pending.length > 0) {
    const parentId = pending.pop()
    if (!parentId) continue
    for (const node of nodes) if (node.pid === parentId && !result.includes(node._id)) { result.push(node._id); pending.push(node._id) }
  }
  return result
}
// 校验单条变更操作
const validateOperation = async (operation: ChangeOperation, targetProjectId: string | null, nodes: ApiNode[], createsProject = false): Promise<string[]> => {
  const errors: string[] = []
  if (operation.type === 'createProject') {
    if (targetProjectId) errors.push('createProject cannot target an existing project')
    return errors
  }
  const projectId = 'projectId' in operation && operation.projectId ? operation.projectId : targetProjectId
  if ((!projectId && !(createsProject && operation.type === 'createNode')) || targetProjectId && projectId !== targetProjectId) errors.push('Operation projectId does not match the ChangeSet target')
  if (projectId && !await projectCache.getProjectInfo(projectId)) errors.push(`Project ${projectId} does not exist`)
  if (operation.type === 'createNode') {
    if (operation.parentId) {
      const parent = nodes.find(node => node._id === operation.parentId)
      if (!parent || parent.isDeleted || parent.info.type !== 'folder') errors.push(`Parent ${operation.parentId} is not an active folder`)
    }
    const url = operation.data ? readString(operation.data, 'url') : undefined
    if (url) { try { new URL(url, 'http://localhost') } catch { errors.push('Node URL is invalid') } }
    const method = operation.data ? readString(operation.data, 'method') : undefined
    if (method && !allowedMethods.has(method.toLowerCase())) errors.push(`HTTP method ${method} is invalid`)
    if (operation.nodeType === 'websocketMock' && operation.data && readString(operation.data, 'path') === '') errors.push('WebSocket Mock path cannot be empty')
    return errors
  }
  if (operation.type === 'updateVariables') {
    const names = new Set<string>()
    const database = await getWorkspaceDataDB()
    for (const variable of operation.variables) {
      const id = readString(variable, '_id')
      const existing = id ? await database.get('variables', id) : undefined
      if (existing && existing.projectId !== projectId) errors.push('Variable ID is outside the target project')
      const name = readString(variable, 'name')?.trim() ?? ''
      if (!name) errors.push('Variable name cannot be empty')
      if (names.has(name)) errors.push(`Variable ${name} is duplicated`)
      names.add(name)
      if (!['string', 'number', 'boolean', 'null', 'any', 'file'].includes(String(variable.type ?? 'string'))) errors.push(`Variable ${name} has an invalid type`)
    }
    return errors
  }
  if (operation.type === 'updateCommonHeaders') {
    for (const header of operation.headers) if (!readString(header, 'key')?.trim()) errors.push('Header key cannot be empty')
    return errors
  }
  const node = nodes.find(item => item._id === operation.nodeId)
  if (!node) errors.push(`Node ${operation.nodeId} does not exist`)
  if (node?.isDeleted && operation.type !== 'restoreNode') errors.push(`Node ${operation.nodeId} is deleted`)
  if (node && projectId && node.projectId !== projectId) errors.push(`Node ${operation.nodeId} is outside the target project`)
  if (operation.type === 'moveNode') {
    if (operation.parentId === operation.nodeId) errors.push('A node cannot be moved into itself')
    if (getDescendantIds(nodes, operation.nodeId).includes(operation.parentId)) errors.push('A node cannot be moved into its descendant')
    if (operation.parentId) {
      const parent = nodes.find(item => item._id === operation.parentId)
      if (!parent || parent.info.type !== 'folder') errors.push(`Parent ${operation.parentId} is not a folder`)
    }
  }
  if (operation.type === 'updateNode') {
    if (typeof operation.patch.parentId === 'string') errors.push('Use moveNodesChange to change a parent')
    const url = readString(operation.patch, 'url')
    if (url) { try { new URL(url, 'http://localhost') } catch { errors.push('Node URL is invalid') } }
    const method = readString(operation.patch, 'method')
    if (method && !allowedMethods.has(method.toLowerCase())) errors.push(`HTTP method ${method} is invalid`)
  }
  return errors
}
// 生成变更预览项
const createPreviewItem = async (operation: ChangeOperation): Promise<ChangeSetPreviewItem> => {
  if (operation.type === 'updateCommonHeaders') return { operation: operation.type, target: 'GLOBAL: ALL PROJECTS', before: await (await getWorkspaceDataDB()).getAll('commonHeaders'), after: operation.headers, risk: 'high' }
  if ('nodeId' in operation) {
    const before = await apiNodesCache.getNodeById(operation.nodeId, true)
    const after = before ? structuredClone(before) : null
    if (after && operation.type === 'updateNode') applyNodeData(after, operation.patch)
    return { operation: operation.type, target: operation.nodeId, before, after: operation.type === 'updateNode' ? after : operation, risk: operation.type === 'deleteNode' ? 'high' : 'medium' }
  }
  return { operation: operation.type, target: 'projectId' in operation ? operation.projectId ?? 'new-project' : 'new-project', after: operation, risk: operation.type === 'updateVariables' ? 'high' : 'medium' }
}
// 预览并重新校验 ChangeSet
export const previewChangeSet = async (id: string): Promise<ChangeSetPreview> => {
  const changeSet = await agentDataCache.getChangeSet(id)
  if (!changeSet) throw new Error('ChangeSet does not exist')
  if (['applied', 'discarded', 'expired'].includes(changeSet.status)) return { changeSet, items: [], valid: false, errors: [`ChangeSet is ${changeSet.status}`] }
  const nodes = changeSet.targetProjectId ? (await apiNodesCache.getAllNodes(true)).filter(node => node.projectId === changeSet.targetProjectId) : []
  const creations = changeSet.operations.filter(operation => operation.type === 'createProject')
  const createsProject = creations.length === 1 && changeSet.operations[0]?.type === 'createProject'
  const errors = (await Promise.all(changeSet.operations.map(operation => validateOperation(operation, changeSet.targetProjectId, nodes, createsProject)))).flat()
  if (creations.length > 0 && !createsProject) errors.push('A ChangeSet must create exactly one project before its nodes')
  const parents = new Map(nodes.map(node => [node._id, node.pid]))
  for (const operation of changeSet.operations) if (operation.type === 'moveNode') parents.set(operation.nodeId, operation.parentId)
  for (const node of nodes) {
    const visited = new Set<string>()
    let id = node._id
    while (id) {
      if (visited.has(id)) { errors.push('Combined moves create a parent cycle'); break }
      visited.add(id)
      id = parents.get(id) ?? ''
    }
  }
  const currentRevision = await getProjectRevision(changeSet.targetProjectId)
  if (currentRevision !== changeSet.baseRevision) errors.push('Target data changed after this ChangeSet was created')
  const next: ChangeSet = { ...changeSet, status: errors.length === 0 ? changeSet.status === 'approved' ? 'approved' : 'previewed' : 'failed', ...(errors.length > 0 ? { errorCode: 'CHANGESET_INVALID', errorMessage: errors.join('; ') } : {}) }
  await agentDataCache.putChangeSet(next)
  return { changeSet: next, items: await Promise.all(next.operations.map(createPreviewItem)), valid: errors.length === 0, errors }
}
// 创建节点数据
const createNode = (operation: Extract<ChangeOperation, { type: 'createNode' }>, projectId: string): ApiNode => {
  const id = nanoid()
  const parentId = operation.parentId ?? ''
  const node = operation.nodeType === 'folder' ? createEmptyFolderNode(projectId, operation.name, parentId)
    : operation.nodeType === 'http' ? generateEmptyHttpNode(id)
      : operation.nodeType === 'websocket' ? generateEmptyWebsocketNode(id)
        : operation.nodeType === 'httpMock' ? generateEmptyHttpMockNode(id)
          : generateEmptyWebSocketMockNode(id)
  node._id = id
  node.projectId = projectId
  node.pid = parentId
  node.info.name = operation.name
  if (operation.data) applyNodeData(node, operation.data)
  node._id = id
  node.projectId = projectId
  node.pid = parentId
  node.info.type = operation.nodeType
  node.updatedAt = new Date().toISOString()
  return node
}
// 应用统一节点业务字段
const applyNodeData = (node: ApiNode, data: Record<string, unknown>): void => {
  if (typeof data.name === 'string') node.info.name = data.name
  if (typeof data.description === 'string') node.info.description = data.description
  if (typeof data.parentId === 'string') node.pid = data.parentId
  if (typeof data.sort === 'number') node.sort = data.sort
  if (node.info.type === 'http') {
    const httpNode = node as HttpNode
    if (typeof data.method === 'string') httpNode.item.method = data.method.toUpperCase() as typeof httpNode.item.method
    if (typeof data.url === 'string') httpNode.item.url.path = data.url
    if (Array.isArray(data.headers)) httpNode.item.headers = data.headers.map((row, index) => createHeader(row, index))
    if (Array.isArray(data.queryParams)) httpNode.item.queryParams = data.queryParams.map((row, index) => createHeader(row, index))
    if (typeof data.rawBody === 'string') { httpNode.item.requestBody.mode = 'json'; httpNode.item.requestBody.rawJson = data.rawBody }
  } else if (node.info.type === 'websocket') {
    const websocketNode = node as WebSocketNode
    if (typeof data.url === 'string') websocketNode.item.url.path = data.url
    if (Array.isArray(data.headers)) websocketNode.item.headers = data.headers.map((row, index) => createHeader(row, index))
    if (Array.isArray(data.queryParams)) websocketNode.item.queryParams = data.queryParams.map((row, index) => createHeader(row, index))
    if (typeof data.message === 'string') websocketNode.item.messageBlocks[0].content = data.message
  } else if (node.info.type === 'httpMock') {
    const httpMockNode = node as HttpMockNode
    if (typeof data.method === 'string') httpMockNode.requestCondition.method = [data.method.toUpperCase() as HttpMockNode['requestCondition']['method'][number]]
    if (typeof data.url === 'string') httpMockNode.requestCondition.url = data.url
    if (typeof data.port === 'number') httpMockNode.requestCondition.port = data.port
    if (typeof data.response === 'string') httpMockNode.response[0].jsonConfig.fixedData = data.response
  } else if (node.info.type === 'websocketMock') {
    const websocketMockNode = node as WebSocketMockNode
    if (typeof data.path === 'string') websocketMockNode.requestCondition.path = data.path
    if (typeof data.port === 'number') websocketMockNode.requestCondition.port = data.port
    if (typeof data.response === 'string') websocketMockNode.response.content = data.response
  }
}
// 创建变量数据
const createVariable = (projectId: string, row: Record<string, unknown>): ApidocVariable => ({ _id: typeof row._id === 'string' ? row._id : nanoid(), projectId, name: typeof row.name === 'string' ? row.name : '', value: typeof row.value === 'string' ? row.value : String(row.value ?? ''), type: ['string', 'number', 'boolean', 'null', 'any', 'file'].includes(String(row.type)) ? row.type as ApidocVariable['type'] : 'string', fileValue: typeof row.fileValue === 'object' && row.fileValue !== null ? row.fileValue as ApidocVariable['fileValue'] : { name: '', path: '', fileType: '' } })
// 创建公共请求头数据
const createHeader = (row: Record<string, unknown>, sort: number): ApidocProperty<'string'> & { _sort: number } => ({ _id: typeof row._id === 'string' ? row._id : nanoid(), key: typeof row.key === 'string' ? row.key : '', value: typeof row.value === 'string' ? row.value : String(row.value ?? ''), type: 'string', required: row.required === true, description: typeof row.description === 'string' ? row.description : '', select: row.select !== false, _sort: sort })
// 原子应用 ChangeSet
export const applyChangeSet = async (id: string, networkMode: 'offline' | 'online', signal?: AbortSignal): Promise<ChangeSet> => {
  signal?.throwIfAborted()
  if (networkMode !== 'offline') throw new Error('AI_OFFLINE_ONLY')
  const original = await agentDataCache.getChangeSet(id)
  if (!original) throw new Error('ChangeSet does not exist')
  if (['applied', 'discarded', 'expired'].includes(original.status)) return original
  if (original.status !== 'approved' || !original.approvalId) throw new Error('CHANGESET_APPROVAL_REQUIRED')
  const preview = await previewChangeSet(id)
  let changeSet = preview.changeSet
  if (changeSet.status === 'applied' || changeSet.status === 'discarded' || changeSet.status === 'expired') return changeSet
  if (networkMode !== 'offline') throw new Error('AI_OFFLINE_ONLY')
  if (!preview.valid) throw new Error(preview.errors.join('; '))
  changeSet = { ...changeSet, status: 'applying' }
  await agentDataCache.putChangeSet(changeSet)
  const database = await getWorkspaceDataDB()
  signal?.throwIfAborted()
  const transaction = database.transaction(['projects', 'httpNodeList', 'variables', 'commonHeaders', 'agentReceipts'], 'readwrite')
  const projectStore = transaction.objectStore('projects')
  const nodeStore = transaction.objectStore('httpNodeList')
  const variableStore = transaction.objectStore('variables')
  const headerStore = transaction.objectStore('commonHeaders')
  const receiptStore = transaction.objectStore('agentReceipts')
  const abortTransaction = () => { try { transaction.abort() } catch { /* 事务已经完成 */ } }
  signal?.addEventListener('abort', abortTransaction, { once: true })
  let createdProjectId: string | null = null
  const affectedProjectIds = new Set<string>()
  try {
    const receipt = await receiptStore.get(id)
    if (receipt) {
      await transaction.done
      const applied: ChangeSet = { ...changeSet, status: 'applied', targetProjectId: receipt.targetProjectId }
      await agentDataCache.putChangeSet(applied)
      return applied
    }
    if (changeSet.targetProjectId) {
      const projectId = changeSet.targetProjectId
      const revision = serializeRevision(await projectStore.get(projectId), await nodeStore.index('projectId').getAll(projectId), await variableStore.index('projectId').getAll(projectId), await headerStore.getAll())
      if (revision !== changeSet.baseRevision) throw new Error('CHANGESET_CONFLICT')
    }
    for (const operation of changeSet.operations) {
      signal?.throwIfAborted()
      if (operation.type === 'createProject') {
        createdProjectId = nanoid()
        const project = generateEmptyProject(createdProjectId)
        project.projectName = operation.name
        project.remark = operation.description ?? ''
        await projectStore.put(project, createdProjectId)
        affectedProjectIds.add(createdProjectId)
        continue
      }
      const projectId = 'projectId' in operation && operation.projectId ? operation.projectId : changeSet.targetProjectId ?? createdProjectId
      if (!projectId) throw new Error('Operation has no target project')
      affectedProjectIds.add(projectId)
      if (operation.type === 'createNode') {
        const node = createNode(operation, projectId)
        await nodeStore.put(node, node._id)
      }
      else if (operation.type === 'updateNode') {
        const node = await nodeStore.get(operation.nodeId)
        if (!node || node.isDeleted) throw new Error(`Node ${operation.nodeId} does not exist`)
        const updated = merge({}, node) as ApiNode
        applyNodeData(updated, operation.patch)
        updated._id = node._id
        updated.projectId = node.projectId
        updated.info.type = node.info.type
        updated.updatedAt = new Date().toISOString()
        await nodeStore.put(updated, updated._id)
      } else if (operation.type === 'moveNode') {
        const node = await nodeStore.get(operation.nodeId)
        if (!node || node.isDeleted) throw new Error(`Node ${operation.nodeId} does not exist`)
        await nodeStore.put({ ...node, pid: operation.parentId, sort: operation.sort ?? Date.now(), updatedAt: new Date().toISOString() }, node._id)
      } else if (operation.type === 'deleteNode') {
        const nodes = await nodeStore.index('projectId').getAll(projectId)
        const ids = operation.includeChildren ? [operation.nodeId, ...getDescendantIds(nodes, operation.nodeId)] : [operation.nodeId]
        for (const nodeId of ids) {
          const node = await nodeStore.get(nodeId)
          if (!node) throw new Error(`Node ${nodeId} does not exist`)
          await nodeStore.put({ ...node, isDeleted: true, updatedAt: new Date().toISOString() }, nodeId)
        }
      } else if (operation.type === 'restoreNode') {
        const nodes = await nodeStore.index('projectId').getAll(projectId)
        const node = nodes.find(item => item._id === operation.nodeId)
        if (!node) throw new Error(`Node ${operation.nodeId} does not exist`)
        const restoreIds = new Set([node._id, ...(node.info.type === 'folder' ? getDescendantIds(nodes, node._id) : [])])
        let parentId = node.pid
        while (parentId) {
          restoreIds.add(parentId)
          parentId = nodes.find(item => item._id === parentId)?.pid ?? ''
        }
        for (const restoreId of restoreIds) {
          const restoreNode = nodes.find(item => item._id === restoreId)
          if (restoreNode) await nodeStore.put({ ...restoreNode, isDeleted: false, updatedAt: new Date().toISOString() }, restoreId)
        }
      } else if (operation.type === 'updateVariables') {
        for (const key of await variableStore.index('projectId').getAllKeys(projectId)) await variableStore.delete(key)
        for (const row of operation.variables) {
          const variable = createVariable(projectId, row)
          await variableStore.put(variable, variable._id)
        }
      } else if (operation.type === 'updateCommonHeaders') {
        for (const key of await headerStore.getAllKeys()) await headerStore.delete(key)
        for (let index = 0; index < operation.headers.length; index += 1) {
          const header = createHeader(operation.headers[index], index)
          await headerStore.put(header, header._id)
        }
      }
    }
    for (const projectId of affectedProjectIds) {
      const project = await projectStore.get(projectId)
      if (!project) throw new Error(`Project ${projectId} does not exist`)
      const nodes = await nodeStore.index('projectId').getAll(projectId)
      await projectStore.put({ ...project, docNum: nodes.filter(node => !node.isDeleted).length, updatedAt: new Date().toISOString() }, projectId)
    }
    await receiptStore.put({ changeSetId: id, targetProjectId: changeSet.targetProjectId ?? createdProjectId }, id)
    await transaction.done
    for (const projectId of affectedProjectIds) apiNodesCache.invalidateProject(projectId)
    const applied: ChangeSet = { ...changeSet, targetProjectId: changeSet.targetProjectId ?? createdProjectId, status: 'applied' }
    await agentDataCache.putChangeSet(applied)
    return applied
  } catch (error) {
    try { transaction.abort() } catch { /* 事务已由 IndexedDB 自动终止 */ }
    await transaction.done.catch(() => undefined)
    const failed: ChangeSet = { ...changeSet, status: 'failed', errorCode: 'CHANGESET_APPLY_FAILED', errorMessage: redactAIText(error instanceof Error ? error.message : String(error)) }
    await agentDataCache.putChangeSet(failed)
    throw error
  } finally {
    signal?.removeEventListener('abort', abortTransaction)
  }
}
// 丢弃 ChangeSet
export const discardChangeSet = async (id: string): Promise<ChangeSet> => {
  const changeSet = await agentDataCache.getChangeSet(id)
  if (!changeSet) throw new Error('ChangeSet does not exist')
  if (changeSet.status === 'applied') return changeSet
  const discarded: ChangeSet = { ...changeSet, status: 'discarded' }
  await agentDataCache.putChangeSet(discarded)
  return discarded
}
// 关联 ChangeSet 审批状态
export const setChangeSetApproval = async (id: string, approvalId: string, approved: boolean): Promise<ChangeSet> => {
  const changeSet = await agentDataCache.getChangeSet(id)
  if (!changeSet) throw new Error('ChangeSet does not exist')
  if (['applied', 'discarded', 'failed', 'expired'].includes(changeSet.status)) return changeSet
  const updated: ChangeSet = { ...changeSet, approvalId, status: approved ? 'approved' : changeSet.status }
  await agentDataCache.putChangeSet(updated)
  return updated
}
