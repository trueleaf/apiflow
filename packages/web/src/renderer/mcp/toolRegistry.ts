import { setActivePinia, createPinia } from 'pinia'
import { httpNodeTools } from '@/store/ai/tools/httpNodeTools'
import { websocketNodeTools } from '@/store/ai/tools/websocketNodeTools'
import { httpMockNodeTools } from '@/store/ai/tools/httpMockNodeTools'
import { websocketMockNodeTools } from '@/store/ai/tools/websocketMockNodeTools'
import { projectTools } from '@/store/ai/tools/projectTools'
import { nodeOperationTools } from '@/store/ai/tools/nodeOperationTools'
import { variableTools } from '@/store/ai/tools/variableTools'
import { commonTools } from '@/store/ai/tools/commonTools'
import { commonHeaderTools } from '@/store/ai/tools/commonHeaderTools'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useBanner } from '@/store/projectWorkbench/bannerStore'
import { projectCache } from '@/cache/project/projectCache'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { nodeVariableCache } from '@/cache/variable/nodeVariableCache'
import { useVariable } from '@/store/projectWorkbench/variablesStore'
import { assertMcpToolScope, getMcpToolAnnotations } from './toolGuards'
import { router } from '@/router'
import type { AgentTool, ToolExecuteResult } from '@src/types/ai'
import type { McpToolCallPayload, McpToolCallResult, McpToolDefinition } from '@src/types/mcp'

const mcpToolNames = [
  'getProjectList',
  'getProjectById',
  'createProject',
  'batchCreateProjects',
  'searchProject',
  'updateProjectName',
  'deleteProject',
  'batchDeleteProjects',
  'deleteAllProjects',
  'starProject',
  'unstarProject',
  'createHttpNode',
  'deleteHttpNodes',
  'patchHttpNodeMethodByNodeId',
  'patchHttpNodeUrlById',
  'addHttpNodeQueryParamsById',
  'getHttpNodeById',
  'updateHttpNodeQueryParamById',
  'deleteHttpNodeQueryParamById',
  'setHttpNodeQueryParamsById',
  'addHttpNodePathParamById',
  'updateHttpNodePathParamById',
  'deleteHttpNodePathParamById',
  'setHttpNodePathParamsById',
  'addHttpNodeHeaderById',
  'updateHttpNodeHeaderById',
  'deleteHttpNodeHeaderById',
  'setHttpNodeHeadersById',
  'addHttpNodeFormdataById',
  'updateHttpNodeFormdataById',
  'deleteHttpNodeFormdataById',
  'setHttpNodeFormdataById',
  'addHttpNodeUrlencodedById',
  'updateHttpNodeUrlencodedById',
  'deleteHttpNodeUrlencodedById',
  'setHttpNodeUrlencodedById',
  'patchHttpNodeBodyModeById',
  'patchHttpNodeRawJsonById',
  'patchHttpNodeContentTypeById',
  'patchHttpNodeNameById',
  'patchHttpNodeDescriptionById',
  'batchCreateHttpNodes',
  'searchHttpNodes',
  'moveHttpNode',
  'createWebsocketNode',
  'getWebsocketNodeDetail',
  'updateWebsocketNodeMeta',
  'addWebsocketNodeHeader',
  'createHttpMockNode',
  'getHttpMockNodeDetail',
  'updateHttpMockNodeBasic',
  'createWebsocketMockNode',
  'getWebsocketMockNodeDetail',
  'updateWebsocketMockNodeBasic',
  'getVariables',
  'getVariableById',
  'createVariable',
  'updateVariable',
  'deleteVariables',
  'searchVariables',
  'deleteAllCommonHeaders',
  'getGlobalCommonHeaders',
  'getGlobalCommonHeaderById',
  'createGlobalCommonHeader',
  'updateGlobalCommonHeader',
  'deleteGlobalCommonHeaders',
  'searchGlobalCommonHeaders',
  'getFolderCommonHeaders',
  'addFolderCommonHeader',
  'updateFolderCommonHeader',
  'deleteFolderCommonHeaders',
  'setFolderCommonHeaders',
  'getDeletedNodes',
  'restoreNode',
  'createFolder',
  'batchCreateFolders',
  'getChildNodes',
  'moveNode',
  'renameNode',
  'deleteNodes',
  'getAllNodeIds',
  'deleteAllNodes',
  'changeNodeSort',
  'changeNodesSort',
  'searchNodes',
  'getFolderList',
  'renameFolder',
  'batchRenameFolders',
  'getFolderChildrenForRename',
] as const
const mcpToolNameSet = new Set<string>(mcpToolNames)
const mcpBusinessTools: AgentTool[] = [...httpNodeTools, ...websocketNodeTools, ...httpMockNodeTools, ...websocketMockNodeTools, ...projectTools, ...nodeOperationTools, ...variableTools, ...commonTools, ...commonHeaderTools]
let initialized = false
let toolQueue: Promise<unknown> = Promise.resolve()
const ensureInitialized = () => {
  if (initialized) {
    return
  }
  setActivePinia(createPinia())
  initialized = true
}
const requiresProjectContext = (tool: AgentTool): boolean => {
  if (tool.type === 'projectManager') {
    return false
  }
  return true
}
const withProjectIdSchema = (tool: AgentTool): McpToolDefinition['inputSchema'] => {
  const needsProject = requiresProjectContext(tool)
  const needsConfirmation = tool.needConfirm || getMcpToolAnnotations(tool).destructiveHint
  return {
    type: 'object',
    properties: {
      ...(needsProject ? { projectId: {
        type: 'string',
        description: 'The explicit project id used by the MCP executor context',
        minLength: 1,
      } } : {}),
      ...tool.parameters.properties,
      ...(needsConfirmation ? { confirmed: { type: 'boolean', description: 'Set true only after obtaining explicit user approval for this operation' } } : {}),
    },
    required: [...new Set([...(needsProject ? ['projectId'] : []), ...tool.parameters.required])],
    additionalProperties: false,
  }
}
const getMcpTools = (): AgentTool[] => {
  return mcpBusinessTools.filter(tool => mcpToolNameSet.has(tool.name))
}
const getToolByName = (name: string): AgentTool | null => {
  return getMcpTools().find(tool => tool.name === name) ?? null
}
const normalizeResult = (result: ToolExecuteResult): McpToolCallResult => {
  if (result.code === 0) {
    return {
      code: 0,
      data: result.data,
    }
  }
  return {
    code: result.code,
    data: result.data,
    error: {
      code: result.error?.type ?? 'TOOL_FAILED',
      message: result.error?.message ?? 'Tool execution failed',
      details: result.error?.details,
    },
  }
}
const forceOfflineMode = () => {
  const runtimeStore = useRuntime()
  runtimeStore.networkMode = 'offline'
}
const prepareProjectContext = async (projectId: string): Promise<boolean> => {
  forceOfflineMode()
  const project = await projectCache.getProjectInfo(projectId)
  if (!project) {
    return false
  }
  const projectWorkbenchStore = useProjectWorkbench()
  projectWorkbenchStore.changeProjectId(projectId)
  projectWorkbenchStore.changeProjectName(project.projectName)
  await router.replace({
    path: '/workbench',
    query: {
      id: projectId,
      name: project.projectName,
      mode: 'edit',
    },
  })
  if (router.currentRoute.value.query.id !== projectId) throw new Error('PROJECT_CONTEXT_FAILED')
  const variables = await nodeVariableCache.getVariableByProjectId(projectId)
  if (variables.code !== 0) throw new Error('PROJECT_CONTEXT_FAILED: Unable to load project variables')
  useVariable().replaceVariables(variables.data)
  const bannerStore = useBanner()
  apiNodesCache.invalidateProject(projectId)
  await bannerStore.getDocBanner({ projectId })
  return true
}
export const listMcpTools = (): McpToolDefinition[] => {
  ensureInitialized()
  const names = new Set<string>()
  return getMcpTools().filter(tool => {
    if (names.has(tool.name)) {
      return false
    }
    names.add(tool.name)
    return true
  }).map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: withProjectIdSchema(tool),
    annotations: getMcpToolAnnotations(tool),
    requiresConfirmation: tool.needConfirm || getMcpToolAnnotations(tool).destructiveHint,
  }))
}
const executeMcpTool = async (payload: McpToolCallPayload): Promise<McpToolCallResult> => {
  ensureInitialized()
  forceOfflineMode()
  const tool = getToolByName(payload.name)
  if (!tool) {
    return {
      code: 1,
      error: {
        code: 'TOOL_NOT_FOUND',
        message: `Tool not found: ${payload.name}`,
      },
    }
  }
  const args = payload.arguments
  try {
    if (requiresProjectContext(tool)) {
      const projectId = typeof args.projectId === 'string' ? args.projectId : ''
      if (!projectId) {
        return {
          code: 1,
          error: {
            code: 'INVALID_PARAMS',
            message: 'projectId is required for MCP data tools',
          },
        }
      }
      const projectReady = await prepareProjectContext(projectId)
      if (!projectReady) {
        return {
          code: 1,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: `Project not found: ${projectId}`,
          },
        }
      }
    }
    await assertMcpToolScope(tool, args)
    const result = await tool.execute(args)
    return normalizeResult(result)
  } catch (error) {
    return {
      code: 1,
      error: {
        code: error instanceof Error && /^[A-Z_]+(?::|$)/.test(error.message) ? error.message.split(':')[0] : 'TOOL_THROWN',
        message: error instanceof Error ? error.message : 'Tool execution failed',
      },
    }
  }
}
// 串行执行工具并隔离项目上下文
export const callMcpTool = (payload: McpToolCallPayload): Promise<McpToolCallResult> => {
  const result = toolQueue.then(() => executeMcpTool(payload))
  toolQueue = result.catch(() => undefined)
  return result
}
