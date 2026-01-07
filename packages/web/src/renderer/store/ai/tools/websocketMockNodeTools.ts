import { AgentTool } from '@src/types/ai'
import { useWebSocketMockNode } from '@/store/websocketMockNode/websocketMockNodeStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { useSkill } from '@/store/ai/skillStore'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { simpleCreateWebsocketMockNodePrompt } from '@/store/ai/prompt/prompt'
import { CreateWebsocketMockNodeOptions } from '@src/types/ai/tools.type'

type LLMInferredWebsocketMockParams = {
  name?: string
  description?: string
  path?: string
  port?: number
  delay?: number
  echoMode?: boolean
  responseContent?: string
}
// Convert simplified JSON returned by LLM to complete CreateWebsocketMockNodeOptions
const buildCreateWebsocketMockNodeOptions = (projectId: string, params: LLMInferredWebsocketMockParams, pid?: string): CreateWebsocketMockNodeOptions => {
  const options: CreateWebsocketMockNodeOptions = {
    projectId,
    pid: pid || '',
    name: params.name || 'Untitled WebSocket Mock',
    description: params.description || '',
  }
  if (params.path) {
    options.path = params.path
  }
  if (params.port) {
    options.port = params.port
  }
  if (params.delay !== undefined) {
    options.delay = params.delay
  }
  if (params.echoMode !== undefined) {
    options.echoMode = params.echoMode
  }
  if (params.responseContent) {
    options.responseContent = params.responseContent
  }
  return options
}

// Validate if value is a string
const isString = (value: unknown): value is string => typeof value === 'string'
// Validate if value is an object
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
// Validate if value is a number
const isNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value)
// Parse and validate Electron IPC return
const normalizeIpcResult = (result: unknown): { ok: boolean; payload: unknown } => {
  if (!isRecord(result)) {
    return { ok: false, payload: result }
  }
  const code = result.code
  if (typeof code === 'number') {
    return { ok: code === 0, payload: result }
  }
  return { ok: true, payload: result }
}

export const websocketMockNodeTools: AgentTool[] = [
  {
    name: 'simpleCreateWebsocketMockNode',
    description: 'Create a websocketMockNode based on user\'s simple description (recommended, offline mode only). Use this tool to automatically infer parameters when the user does not provide complete path, port, echoMode, etc.',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project id',
        },
        description: {
          type: 'string',
          description: 'Natural language description of the WebSocket Mock service, for example: "Create a WebSocket chat Mock service, listen on port 3002, echo mode"',
        },
        pid: {
          type: 'string',
          description: 'Parent node id, leave empty string for root node',
        },
      },
      required: ['projectId', 'description'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        return { code: 1, data: { error: 'WebSocket Mock node is not supported in online mode' } }
      }
      const skillStore = useSkill()
      const llmClientStore = useLLMClientStore()
      const projectId = args.projectId as string
      const description = args.description as string
      const pid = typeof args.pid === 'string' ? args.pid : ''
      try {
        const response = await llmClientStore.chat({
          messages: [
            { role: 'system', content: simpleCreateWebsocketMockNodePrompt },
            { role: 'user', content: description }
          ],
          response_format: { type: 'json_object' }
        })
        const content = response.choices[0]?.message?.content || '{}'
        const inferredParams: LLMInferredWebsocketMockParams = JSON.parse(content)
        const options = buildCreateWebsocketMockNodeOptions(projectId, inferredParams, pid)
        const node = await skillStore.createWebsocketMockNode(options)
        return { code: node ? 0 : 1, data: node }
      } catch (error) {
        return { code: 1, data: { error: error instanceof Error ? error.message : 'Creation failed' } }
      }
    },
  },
  {
    name: 'createWebsocketMockNode',
    description: 'Create a new websocketMockNode (offline mode only)',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project id',
        },
        name: {
          type: 'string',
          description: 'Node name',
        },
        pid: {
          type: 'string',
          description: 'Parent node id, leave empty string for root node',
        },
        path: {
          type: 'string',
          description: 'WebSocket path, e.g. /ws/chat',
        },
        port: {
          type: 'number',
          description: 'Mock service listen port, default 3000',
        },
        delay: {
          type: 'number',
          description: 'Response delay (milliseconds), default 0',
        },
        echoMode: {
          type: 'boolean',
          description: 'Echo mode, when true echoes client messages, when false uses fixed response content',
        },
        responseContent: {
          type: 'string',
          description: 'Fixed response content (used when echoMode is false)',
        },
        description: {
          type: 'string',
          description: 'WebSocket Mock node description',
        },
      },
      required: ['projectId', 'name'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        return { code: 1, data: { error: 'WebSocket Mock node is not supported in online mode' } }
      }
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const name = args.name as string
      const pid = typeof args.pid === 'string' ? args.pid : ''
      const description = typeof args.description === 'string' ? args.description : ''
      const options: CreateWebsocketMockNodeOptions = {
        projectId,
        name,
        pid,
        description,
      }
      if (typeof args.path === 'string') {
        options.path = args.path
      }
      if (typeof args.port === 'number') {
        options.port = args.port
      }
      if (typeof args.delay === 'number') {
        options.delay = args.delay
      }
      if (typeof args.echoMode === 'boolean') {
        options.echoMode = args.echoMode
      }
      if (typeof args.responseContent === 'string') {
        options.responseContent = args.responseContent
      }
      const node = await skillStore.createWebsocketMockNode(options)
      return { code: node ? 0 : 1, data: node }
    },
  },
  {
    name: 'getWebsocketMockNodeDetail',
    description: 'Get specified websocketMockNode details (offline mode only, will be loaded into the current WebSocketMock editor store)',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project id' },
        nodeId: { type: 'string', description: 'WebsocketMock node id' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        return { code: 1, data: { error: 'WebSocket Mock node is not supported in online mode' } }
      }
      const websocketMockStore = useWebSocketMockNode()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId and nodeId must be strings' } }
      }
      await websocketMockStore.getWebSocketMockNodeDetail({ id: nodeId, projectId })
      return { code: websocketMockStore.websocketMock?._id === nodeId ? 0 : 1, data: websocketMockStore.websocketMock }
    },
  },
  {
    name: 'updateWebsocketMockNodeBasic',
    description: 'Update websocketMockNode basic information (name/path/port/delay/echoMode/responseContent). Offline mode only, will load into store first then update',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project id' },
        nodeId: { type: 'string', description: 'WebsocketMock node id' },
        name: { type: 'string', description: 'Name' },
        path: { type: 'string', description: 'Path, e.g. /ws-mock' },
        port: { type: 'number', description: 'Port' },
        delay: { type: 'number', description: 'Delay (ms)' },
        echoMode: { type: 'boolean', description: 'Whether to enable echo mode' },
        responseContent: { type: 'string', description: 'Response content' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        return { code: 1, data: { error: 'WebSocket Mock node is not supported in online mode' } }
      }
      const websocketMockStore = useWebSocketMockNode()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId and nodeId must be strings' } }
      }
      if (websocketMockStore.websocketMock?._id !== nodeId) {
        await websocketMockStore.getWebSocketMockNodeDetail({ id: nodeId, projectId })
      }
      const name = args.name
      if (isString(name)) {
        websocketMockStore.changeWebSocketMockName(name)
      }
      const path = args.path
      if (isString(path)) {
        websocketMockStore.changeWebSocketMockPath(path)
      }
      const port = args.port
      if (isNumber(port)) {
        websocketMockStore.changeWebSocketMockPort(port)
      }
      const delay = args.delay
      if (isNumber(delay)) {
        websocketMockStore.changeWebSocketMockDelay(delay)
      }
      const echoMode = args.echoMode
      if (typeof echoMode === 'boolean') {
        websocketMockStore.changeWebSocketMockEchoMode(echoMode)
      }
      const responseContent = args.responseContent
      if (isString(responseContent)) {
        websocketMockStore.changeWebSocketMockResponseContent(responseContent)
      }
      return { code: websocketMockStore.websocketMock?._id === nodeId ? 0 : 1, data: websocketMockStore.websocketMock }
    },
  },
  {
    name: 'saveCurrentWebsocketMockNode',
    description: 'Save the currently selected websocketMockNode (offline mode only, depends on current Tab selection)',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        return { code: 1, data: { error: 'WebSocket Mock node is not supported in online mode' } }
      }
      const projectNavStore = useProjectNav()
      if (!projectNavStore.currentSelectNav) {
        return { code: 1, data: { error: 'No Tab currently selected' } }
      }
      const websocketMockStore = useWebSocketMockNode()
      await websocketMockStore.saveWebSocketMockNode()
      return { code: 0, data: null }
    },
  },
  {
    name: 'startWebsocketMockServerByNodeId',
    description: 'Start the WebSocket Mock service for the specified nodeId (offline mode only, Electron environment)',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project id' },
        nodeId: { type: 'string', description: 'WebsocketMock node id' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        return { code: 1, data: { error: 'WebSocket Mock node is not supported in online mode' } }
      }
      if (!window.electronAPI?.websocketMock?.startServer) {
        return { code: 1, data: { error: 'Current environment does not support starting WebSocket Mock service' } }
      }
      const websocketMockStore = useWebSocketMockNode()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId and nodeId must be strings' } }
      }
      if (websocketMockStore.websocketMock?._id !== nodeId) {
        await websocketMockStore.getWebSocketMockNodeDetail({ id: nodeId, projectId })
      }
      const mockData = { ...websocketMockStore.websocketMock, projectId }
      const result = await window.electronAPI.websocketMock.startServer(JSON.parse(JSON.stringify(mockData)))
      const normalized = normalizeIpcResult(result)
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
  {
    name: 'stopWebsocketMockServerByNodeId',
    description: 'Stop the WebSocket Mock service for the specified nodeId (Electron environment)',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'WebsocketMock node id' },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      if (!window.electronAPI?.websocketMock?.stopServer) {
        return { code: 1, data: { error: 'Current environment does not support stopping WebSocket Mock service' } }
      }
      const nodeId = args.nodeId
      if (!isString(nodeId)) {
        return { code: 1, data: { error: 'nodeId must be a string' } }
      }
      const result = await window.electronAPI.websocketMock.stopServer(nodeId)
      const normalized = normalizeIpcResult(result)
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
  {
    name: 'getWebsocketMockEnabledStatus',
    description: 'Query whether the WebSocket Mock service for the specified nodeId is enabled (Electron environment)',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'WebsocketMock node id' },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeId = args.nodeId
      if (!isString(nodeId)) {
        return { code: 1, data: { error: 'nodeId must be a string' } }
      }
      const websocketMockStore = useWebSocketMockNode()
      const enabled = await websocketMockStore.checkMockNodeEnabledStatus(nodeId)
      return { code: 0, data: { enabled } }
    },
  },
]
