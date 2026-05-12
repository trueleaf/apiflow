import { setActivePinia, createPinia } from 'pinia'
import { rawTools } from '@/store/ai/tools/tools'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useBanner } from '@/store/projectWorkbench/bannerStore'
import { projectCache } from '@/cache/project/projectCache'
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
let initialized = false
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
  if (!requiresProjectContext(tool) || 'projectId' in tool.parameters.properties) {
    return tool.parameters
  }
  return {
    type: 'object',
    properties: {
      projectId: {
        type: 'string',
        description: 'The explicit project id used by the MCP executor context',
      },
      ...tool.parameters.properties,
    },
    required: ['projectId', ...tool.parameters.required],
  }
}
const getMcpTools = (): AgentTool[] => {
  return rawTools.filter(tool => mcpToolNameSet.has(tool.name))
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
  }).catch(() => undefined)
  await projectWorkbenchStore.initProjectBaseInfo({ projectId }).catch(() => undefined)
  const bannerStore = useBanner()
  await bannerStore.getDocBanner({ projectId }).catch(() => undefined)
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
  }))
}
export const callMcpTool = async (payload: McpToolCallPayload): Promise<McpToolCallResult> => {
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
  try {
    const result = await tool.execute(args)
    return normalizeResult(result)
  } catch (error) {
    return {
      code: 1,
      error: {
        code: 'TOOL_THROWN',
        message: error instanceof Error ? error.message : 'Tool execution failed',
      },
    }
  }
}
