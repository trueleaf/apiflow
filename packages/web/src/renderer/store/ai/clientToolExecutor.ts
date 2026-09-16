import type { AgentEvent, AgentToolResult, ChangeOperation } from '@src/types/ai'
import { watch } from 'vue'
import type { WebSocketNode } from '@src/types'
import { redactAIValue } from '@src/shared/ai/redaction'
import { agentToolInputSchemas } from '@src/shared/ai/toolSchemas'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { projectCache } from '@/cache/project/projectCache'
import { nodeVariableCache } from '@/cache/variable/nodeVariableCache'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useVariable } from '@/store/projectWorkbench/variablesStore'
import { useCommonHeader } from '@/store/projectWorkbench/commonHeaderStore'
import { useBanner } from '@/store/projectWorkbench/bannerStore'
import { useProjectManagerStore } from '@/store/projectManager/projectManagerStore'
import { useSkill } from '@/store/ai/skillStore'
import { getWebSocketHeaders, getWebSocketUrl, sendRequest } from '@/server/request/request'
import { useHttpNodeResponse } from '@/store/httpNode/httpNodeResponseStore'
import { useHttpNode } from '@/store/httpNode/httpNodeStore'
import { useHttpMockNode } from '@/store/httpMockNode/httpMockNodeStore'
import { useWebSocketMockNode } from '@/store/websocketMockNode/websocketMockNodeStore'
import { useWebSocket } from '@/store/websocketNode/websocketNodeStore'
import { websocketNodeTools } from '@/store/ai/tools/websocketNodeTools'
import { httpMockNodeTools } from '@/store/ai/tools/httpMockNodeTools'
import { websocketMockNodeTools } from '@/store/ai/tools/websocketMockNodeTools'
import { applyChangeSet, createChangeSet, discardChangeSet, previewChangeSet, setChangeSetApproval } from './changeSetService'

const allowedTools = new Set(['getWorkspaceContext', 'searchProjects', 'searchNodes', 'listNodeTree', 'getNodeDetail', 'getDeletedNodes', 'openProject', 'createDesignChange', 'updateDesignChange', 'moveNodesChange', 'deleteNodesChange', 'restoreNodesChange', 'updateVariablesChange', 'updateCommonHeadersChange', 'previewChangeSet', 'applyChangeSet', 'discardChangeSet', 'setChangeSetApproval', 'sendHttpRequest', 'manageWebSocketConnection', 'manageMockServer'])
const proposalTools = new Set(['createDesignChange', 'updateDesignChange', 'moveNodesChange', 'deleteNodesChange', 'restoreNodesChange', 'updateVariablesChange', 'updateCommonHeadersChange'])
const runtimeResources = new Map<string, Array<{ tools: typeof websocketNodeTools; legacyName: string; nodeId: string }>>()
// 压缩模型工具结果
const summarizeForModel = (value: unknown, depth = 0): unknown => {
  if (typeof value === 'string') return value.length > 2000 ? `${value.slice(0, 2000)}…` : value
  if (typeof value !== 'object' || value === null) return value
  if (depth >= 5) return '[TRUNCATED]'
  if (Array.isArray(value)) return { count: value.length, items: value.slice(0, 30).map(item => summarizeForModel(item, depth + 1)), truncated: value.length > 30 }
  return Object.fromEntries(Object.entries(value).slice(0, 50).map(([key, child]) => [key, summarizeForModel(child, depth + 1)]))
}
// 创建工具成功结果
const success = (summary: string, data?: unknown, changeSetId?: string): AgentToolResult => {
  const displayData = redactAIValue(data)
  return { success: true, summary, displayData, modelData: summarizeForModel(displayData), changeSetId }
}
// 创建工具失败结果
const failure = (errorCode: string, summary: string, retryable = false): AgentToolResult => ({ success: false, errorCode, retryable, summary })
// 获取输入字符串
const getString = (input: Record<string, unknown>, key: string): string => typeof input[key] === 'string' ? input[key] : ''
// 校验项目访问范围
const getProject = async (projectId: string) => projectId ? projectCache.getProjectInfo(projectId) : null
// 刷新变更影响的 Store
const refreshStores = async (projectId: string | null): Promise<void> => {
  const projectManager = useProjectManagerStore()
  await projectManager.getProjectList()
  if (!projectId) return
  const workbench = useProjectWorkbench()
  if (workbench.projectId !== projectId) return
  await useBanner().getDocBanner({ projectId })
  const variableResult = await nodeVariableCache.getVariableByProjectId(projectId)
  if (variableResult.code === 0) await useVariable().replaceVariables(variableResult.data)
  await useCommonHeader().getCommonHeaders()
  await useCommonHeader().getGlobalCommonHeaders()
  const navStore = useProjectNav()
  const nav = navStore.currentSelectNav
  if (!nav) return
  const activeNode = await apiNodesCache.getNodeById(nav._id)
  if (!activeNode) { navStore.deleteNavByIds({ projectId, ids: [nav._id] }); return }
  const payload = { id: nav._id, projectId }
  if (nav.tabType === 'http') await useHttpNode().getHttpNodeDetail(payload)
  else if (nav.tabType === 'websocket') await useWebSocket().getWebsocketDetail(payload)
  else if (nav.tabType === 'httpMock') await useHttpMockNode().getHttpMockNodeDetail(payload)
  else if (nav.tabType === 'websocketMock') await useWebSocketMockNode().getWebSocketMockNodeDetail(payload)
}
// 生成紧凑节点摘要
const summarizeNode = (node: Awaited<ReturnType<typeof apiNodesCache.getNodeById>>) => node ? { id: node._id, projectId: node.projectId, parentId: node.pid, type: node.info.type, name: node.info.name, description: node.info.description, updatedAt: node.updatedAt, isDeleted: node.isDeleted, ...('item' in node && node.item && typeof node.item === 'object' && 'url' in node.item ? { url: node.item.url } : {}) } : null
// 执行旧运行能力适配器
const executeRuntimeTool = async (toolName: string, input: Record<string, unknown>, signal: AbortSignal): Promise<AgentToolResult> => {
  const action = getString(input, 'action')
  const nodeId = getString(input, 'nodeId')
  if (toolName === 'manageWebSocketConnection' && action === 'status') return success('WebSocket status loaded', { nodeId, ...await window.electronAPI?.websocket.checkNodeConnection(nodeId) })
  const kind = getString(input, 'kind')
  const tools = toolName === 'manageWebSocketConnection' ? websocketNodeTools : kind === 'http' ? httpMockNodeTools : websocketMockNodeTools
  const names = toolName === 'manageWebSocketConnection' ? { connect: 'connectWebsocketByNodeId', send: 'sendWebsocketMessageByNodeId', disconnect: 'disconnectWebsocketByNodeId' } : kind === 'http' ? { status: 'getHttpMockEnabledStatus', start: 'startHttpMockServerByNodeId', stop: 'stopHttpMockServerByNodeId' } : { status: 'getWebsocketMockEnabledStatus', start: 'startWebsocketMockServerByNodeId', stop: 'stopWebsocketMockServerByNodeId' }
  const legacyName = names[action as keyof typeof names]
  if (!legacyName) return failure('AI_TOOL_NOT_SUPPORTED', `Runtime action ${action} is unavailable`)
  const tool = tools.find(item => item.name === legacyName)
  if (!tool) return failure('AI_TOOL_NOT_SUPPORTED', `Runtime adapter ${legacyName} is unavailable`)
  const node = await apiNodesCache.getNodeById(nodeId)
  signal.throwIfAborted()
  const parameters: Record<string, unknown> = { ...input, projectId: node?.projectId }
  if (toolName === 'manageWebSocketConnection' && action === 'connect' && node?.info.type === 'websocket') {
    const url = await getWebSocketUrl(node as WebSocketNode)
    parameters.url = url
    parameters.headers = await getWebSocketHeaders(node as WebSocketNode, useWebSocket().defaultHeaders, url)
  }
  signal.throwIfAborted()
  const result = await tool.execute(parameters)
  return result.code === 0 ? success(`${toolName} completed`, result.data) : failure('AI_RUNTIME_TOOL_FAILED', `${toolName} failed: ${JSON.stringify(redactAIValue(result.data))}`)
}
// 清理指定运行创建的资源
export const cleanupAgentRuntimeTools = async (runId: string): Promise<void> => {
  const resources = runtimeResources.get(runId) ?? []
  runtimeResources.delete(runId)
  for (const resource of resources.reverse()) {
    const tool = resource.tools.find(item => item.name === resource.legacyName)
    if (tool) await tool.execute({ nodeId: resource.nodeId })
  }
}
// 执行 renderer client tool
export const executeAgentClientTool = async (event: AgentEvent, signal: AbortSignal): Promise<AgentToolResult> => {
  signal.throwIfAborted()
  if (event.type !== 'client-tool-command') return failure('AI_INVALID_CLIENT_COMMAND', 'Invalid client tool command')
  const runtime = useRuntime()
  if (runtime.networkMode !== 'offline') return failure('AI_OFFLINE_ONLY', 'AI is only available in offline mode')
  if (!allowedTools.has(event.toolName)) return failure('AI_UNKNOWN_TOOL', `Unknown tool ${event.toolName}`)
  const schema = agentToolInputSchemas[event.toolName as keyof typeof agentToolInputSchemas]
  const parsed = schema.safeParse(event.input)
  if (!parsed.success) return failure('AI_INVALID_TOOL_INPUT', 'Invalid tool input')
  const input = parsed.data as Record<string, unknown>
  const projectId = getString(input, 'projectId') || getString(input, 'targetProjectId')
  const nodeId = getString(input, 'nodeId')
  if (projectId && !await getProject(projectId)) return failure('AI_PROJECT_NOT_FOUND', `Project ${projectId} does not exist`)
  if (nodeId && !await apiNodesCache.getNodeById(nodeId, true)) return failure('AI_NODE_NOT_FOUND', `Node ${nodeId} does not exist`)
  signal.throwIfAborted()
  if (runtime.networkMode !== 'offline') return failure('AI_OFFLINE_ONLY', 'AI is only available in offline mode')
  if (event.toolName === 'getWorkspaceContext') {
    const workbench = useProjectWorkbench()
    const nav = useProjectNav().currentSelectNav
    const variables = useVariable().variables.map(item => ({ id: item._id, name: item.name, type: item.type, value: item.value }))
    const headers = useCommonHeader().globalCommonHeaders.map(item => ({ id: item._id, key: item.key, value: item.value, enabled: item.select }))
    return success('Workspace context loaded', { project: workbench.projectId ? { id: workbench.projectId, name: workbench.projectName } : null, activeNode: nav ? { id: nav._id, type: nav.tabType, label: nav.label } : null, variables, headers })
  }
  if (event.toolName === 'searchProjects') {
    const query = getString(input, 'query').toLowerCase()
    const limit = typeof input.limit === 'number' ? input.limit : 20
    const projects = (await projectCache.getProjectList()).filter(item => !query || item.projectName.toLowerCase().includes(query) || item.remark.toLowerCase().includes(query)).slice(0, limit).map(item => ({ id: item._id, name: item.projectName, description: item.remark, updatedAt: item.updatedAt }))
    return success(`Found ${projects.length} projects`, projects)
  }
  if (event.toolName === 'searchNodes') {
    const query = getString(input, 'query').toLowerCase()
    const limit = typeof input.limit === 'number' ? input.limit : 50
    const includeDeleted = input.includeDeleted === true
    const nodeType = getString(input, 'nodeType')
    const nodes = (await apiNodesCache.getAllNodes(includeDeleted)).filter(node => node.projectId === projectId && (!nodeType || node.info.type === nodeType) && (!query || node.info.name.toLowerCase().includes(query) || node.info.description.toLowerCase().includes(query))).slice(0, limit).map(summarizeNode)
    return success(`Found ${nodes.length} nodes`, nodes)
  }
  if (event.toolName === 'listNodeTree') {
    const nodes = await apiNodesCache.getNodesByProjectId(projectId)
    const build = (parentId: string): unknown[] => nodes.filter(node => node.pid === parentId).sort((left, right) => left.sort - right.sort).map(node => ({ ...summarizeNode(node), children: node.info.type === 'folder' ? build(node._id) : undefined }))
    return success('Node tree loaded', build(''))
  }
  if (event.toolName === 'getNodeDetail') return success('Node detail loaded', redactAIValue(await apiNodesCache.getNodeById(nodeId, true)))
  if (event.toolName === 'getDeletedNodes') return success('Deleted nodes loaded', (await apiNodesCache.getDeletedNodesList(projectId)).map(summarizeNode))
  if (event.toolName === 'openProject') return await useSkill().navigateToProject(projectId) ? success('Project opened', { projectId }) : failure('AI_NAVIGATION_FAILED', 'Could not open project')
  if (proposalTools.has(event.toolName)) {
    if (!Array.isArray(input.operations)) return failure('CHANGESET_INVALID', 'ChangeSet operations are required')
    const changeSet = await createChangeSet({ conversationId: event.conversationId, runId: event.runId, targetProjectId: typeof input.targetProjectId === 'string' ? input.targetProjectId : null, title: getString(input, 'title'), description: getString(input, 'description'), operations: input.operations as ChangeOperation[] })
    const preview = await previewChangeSet(changeSet.id)
    return preview.valid ? success('ChangeSet created and previewed', preview, changeSet.id) : failure('CHANGESET_INVALID', preview.errors.join('; '))
  }
  const changeSetId = getString(input, 'changeSetId')
  if (event.toolName === 'previewChangeSet') {
    const preview = await previewChangeSet(changeSetId)
    return preview.valid ? success('ChangeSet preview ready', preview, changeSetId) : failure('CHANGESET_INVALID', preview.errors.join('; '))
  }
  if (event.toolName === 'applyChangeSet') {
    const applied = await applyChangeSet(changeSetId, runtime.networkMode, signal)
    await refreshStores(applied.targetProjectId)
    return success('ChangeSet applied', applied, applied.id)
  }
  if (event.toolName === 'discardChangeSet') {
    const discarded = await discardChangeSet(changeSetId)
    return success('ChangeSet discarded', discarded, discarded.id)
  }
  if (event.toolName === 'setChangeSetApproval') {
    const updated = await setChangeSetApproval(changeSetId, getString(input, 'approvalId'), input.approved === true)
    if (updated.status !== 'approved') return failure('AI_APPROVAL_EXPIRED', `ChangeSet is ${updated.status}`)
    return success('ChangeSet approval linked', { id: updated.id, status: updated.status }, updated.id)
  }
  if (event.toolName === 'sendHttpRequest') {
    const nav = useProjectNav().currentSelectNav
    if (!nav || nav._id !== nodeId || nav.tabType !== 'http') return failure('AI_CONTEXT_MISMATCH', 'The HTTP node must be the active tab')
    if (!nav.saved) return failure('AI_UNSAVED_NODE', 'Save the HTTP node before sending the approved request')
    const responseStore = useHttpNodeResponse()
    if (['sending', 'response'].includes(responseStore.requestState)) return failure('AI_HTTP_BUSY', 'An HTTP request is already running')
    await new Promise<void>((resolve, reject) => {
      const stopWatching = watch(() => responseStore.requestState, state => { if (state === 'finish') { cleanup(); resolve() } }, { flush: 'sync' })
      const abort = () => { cleanup(); reject(new Error('AI_ABORTED')) }
      const cleanup = () => { stopWatching(); signal.removeEventListener('abort', abort) }
      signal.addEventListener('abort', abort, { once: true })
      void sendRequest({ abortSignal: signal }).catch(error => { cleanup(); reject(error) })
    })
    signal.throwIfAborted()
    const response = useHttpNodeResponse().responseInfo
    if (response.statusCode === 0 || response.responseData.canApiflowParseType === 'error') return failure('AI_HTTP_REQUEST_FAILED', 'HTTP request failed; inspect the response panel')
    return success('HTTP request completed', { statusCode: response.statusCode, contentType: response.contentType, bodyByteLength: response.bodyByteLength })
  }
  const nav = useProjectNav().currentSelectNav
  if (nodeId && (!nav || nav._id !== nodeId)) return failure('AI_CONTEXT_MISMATCH', 'The runtime node must be the active tab')
  if (event.toolName === 'manageWebSocketConnection' && nav?.tabType !== 'websocket') return failure('AI_CONTEXT_MISMATCH', 'The active tab is not a WebSocket node')
  if (event.toolName === 'manageMockServer' && nav?.tabType !== `${getString(input, 'kind')}Mock`) return failure('AI_CONTEXT_MISMATCH', 'The active tab does not match the mock server kind')
  const action = getString(input, 'action')
  const alreadyActive = action === 'connect' ? (await window.electronAPI?.websocket.checkNodeConnection(nodeId))?.connected
    : action === 'start' ? await (getString(input, 'kind') === 'http' ? useHttpMockNode().checkMockNodeEnabledStatus(nodeId) : useWebSocketMockNode().checkMockNodeEnabledStatus(nodeId)) : false
  signal.throwIfAborted()
  if (alreadyActive) return success('Resource is already running; existing user resource was preserved', { nodeId, alreadyActive: true })
  const result = await executeRuntimeTool(event.toolName, input, signal)
  if (result.success && (action === 'connect' || action === 'start')) {
    const tools = event.toolName === 'manageWebSocketConnection' ? websocketNodeTools : getString(input, 'kind') === 'http' ? httpMockNodeTools : websocketMockNodeTools
    const legacyName = action === 'connect' ? 'disconnectWebsocketByNodeId' : getString(input, 'kind') === 'http' ? 'stopHttpMockServerByNodeId' : 'stopWebsocketMockServerByNodeId'
    runtimeResources.set(event.runId, [...(runtimeResources.get(event.runId) ?? []), { tools, legacyName, nodeId }])
    if (signal.aborted) await cleanupAgentRuntimeTools(event.runId)
  }
  signal.throwIfAborted()
  return result
}
