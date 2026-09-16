import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { nodeVariableCache } from '@/cache/variable/nodeVariableCache'
import { projectWorkbenchCache } from '@/cache/projectWorkbench/projectWorkbenchCache'
import { projectCache } from '@/cache/project/projectCache'
import type { AgentTool } from '@src/types/ai'
import type { McpToolDefinition } from '@src/types/mcp'

// 标注离线工具的读写行为
export const getMcpToolAnnotations = (tool: AgentTool): McpToolDefinition['annotations'] => {
  const readOnlyHint = /^(get|search)/.test(tool.name)
  const destructiveHint = /^(delete|batchDelete|set)/.test(tool.name)
  return { readOnlyHint, destructiveHint, idempotentHint: readOnlyHint, openWorldHint: false }
}
// 检查目标节点归属和节点类型
const assertNode = async (id: string, projectId: string, expectedType?: string, includeDeleted = false): Promise<void> => {
  const node = await apiNodesCache.getNodeById(id, includeDeleted)
  if (!node) throw new Error(`NODE_NOT_FOUND: ${id}`)
  if (node.projectId !== projectId) throw new Error(`PROJECT_MISMATCH: Node ${id} does not belong to project ${projectId}`)
  if (expectedType && node.info.type !== expectedType) throw new Error(`NODE_TYPE_MISMATCH: ${id} must be ${expectedType}`)
}
// 检查单个参数对象引用的业务对象
const assertReferences = async (args: Record<string, unknown>, projectId: string, tool: AgentTool): Promise<void> => {
  const expectedTypes: Record<string, string> = { httpNode: 'http', websocketNode: 'websocket', httpMockNode: 'httpMock', websocketMockNode: 'websocketMock' }
  for (const [key, value] of Object.entries(args)) {
    if (['nodeId', 'folderId', 'pid', 'newPid'].includes(key) && typeof value === 'string') {
      if (!value && (key === 'pid' || key === 'newPid' || (key === 'folderId' && tool.name === 'getChildNodes'))) continue
      const type = key === 'nodeId' ? expectedTypes[tool.type] : 'folder'
      await assertNode(value, projectId, type, tool.name === 'restoreNode')
    }
    if (key === 'nodeIds' && Array.isArray(value)) {
      for (const id of value) {
        if (typeof id !== 'string') throw new Error('INVALID_PARAMS: nodeIds must contain strings')
        await assertNode(id, projectId, expectedTypes[tool.type])
      }
    }
    if (key === 'variableId' || key === 'variableIds') {
      const ids = Array.isArray(value) ? value : [value]
      for (const id of ids) {
        if (typeof id !== 'string') throw new Error('INVALID_PARAMS: Variable id must be a string')
        const result = await nodeVariableCache.getVariableById(id)
        if (!result.data) throw new Error(`VARIABLE_NOT_FOUND: ${id}`)
        if (result.data.projectId !== projectId) throw new Error(`PROJECT_MISMATCH: Variable ${id} does not belong to project ${projectId}`)
      }
    }
    if (['nodes', 'folders', 'items'].includes(key) && Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && !Array.isArray(item)) await assertReferences(item as Record<string, unknown>, projectId, tool)
      }
    }
  }
}
// 保护未保存的编辑内容并校验项目引用
export const assertMcpToolScope = async (tool: AgentTool, args: Record<string, unknown>): Promise<void> => {
  const projectId = typeof args.projectId === 'string' ? args.projectId : ''
  if (tool.type === 'projectManager') {
    const projectIds = Array.isArray(args.projectIds) ? args.projectIds : projectId ? [projectId] : []
    for (const id of projectIds) {
      if (typeof id !== 'string' || !await projectCache.getProjectInfo(id)) throw new Error(`PROJECT_NOT_FOUND: ${id}`)
    }
  }
  if (projectId && tool.type !== 'projectManager') await assertReferences(args, projectId, tool)
  if (!getMcpToolAnnotations(tool).readOnlyHint) {
    const navs = projectWorkbenchCache.getProjectNavs()
    const projectIds = tool.name === 'deleteAllProjects' ? Object.keys(navs) : Array.isArray(args.projectIds) ? args.projectIds.filter((id): id is string => typeof id === 'string') : [projectId]
    if (projectIds.some(id => navs[id]?.some(nav => !nav.saved))) throw new Error('UNSAVED_CHANGES: Save or discard open edits in the target project before changing it through MCP')
  }
  if (tool.name === 'moveNode' || tool.name === 'moveHttpNode') {
    const movedId = typeof args.nodeId === 'string' ? args.nodeId : ''
    let parentId = typeof args.newPid === 'string' ? args.newPid : ''
    const visited = new Set<string>([movedId])
    while (parentId) {
      if (visited.has(parentId)) throw new Error('INVALID_PARENT: Moving this node would create a folder cycle')
      visited.add(parentId)
      const parent = await apiNodesCache.getNodeById(parentId)
      if (!parent || parent.projectId !== projectId) throw new Error('PROJECT_MISMATCH: Invalid parent folder')
      parentId = parent.pid
    }
  }
}
