import { AgentTool } from '@src/types/ai'
import { useWebSocketMockNode } from '@/store/websocketMockNode/websocketMockNodeStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
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
    description: 'Create a WebSocket Mock server node from natural language description (Smart Mode - Recommended). Automatically infers path, port, echo mode, and response content from user input. WebSocket Mock simulates WebSocket server endpoints for development and testing. Example: "Create a chat WebSocket mock on port 3002 with echo mode" will auto-generate appropriate configuration.',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project where the WebSocket mock will be created',
        },
        description: {
          type: 'string',
          description: 'Natural language description of the WebSocket mock server requirements, including path, port, and behavior (echo mode or fixed response)',
        },
        pid: {
          type: 'string',
          description: 'Optional parent folder ID. If omitted or empty string, the mock will be created at the root level',
        },
      },
      required: ['projectId', 'description'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
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
    description: 'Create a WebSocket Mock server node with precise control over all parameters (Precise Mode). Use this when you need explicit control over path, port, echo mode, and response content. For simpler creation from natural language, prefer simpleCreateWebsocketMockNode instead.',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project where the WebSocket mock will be created',
        },
        name: {
          type: 'string',
          description: 'The display name for the WebSocket mock server node',
        },
        pid: {
          type: 'string',
          description: 'Optional parent folder ID. If omitted or empty string, the mock will be created at the root level',
        },
        path: {
          type: 'string',
          description: 'WebSocket path pattern, e.g., /ws/chat or /socket',
        },
        port: {
          type: 'number',
          description: 'Port number for the mock server to listen on. Defaults to 3000 if not specified',
        },
        delay: {
          type: 'number',
          description: 'Artificial response delay in milliseconds (useful for simulating network latency). Defaults to 0',
        },
        echoMode: {
          type: 'boolean',
          description: 'When true, echoes back client messages. When false, sends fixed response content',
        },
        responseContent: {
          type: 'string',
          description: 'Fixed message content to send to clients (only used when echoMode is false)',
        },
        description: {
          type: 'string',
          description: 'Optional description explaining the mock server purpose',
        },
      },
      required: ['projectId', 'name'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
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
    description: 'Retrieve complete configuration of a WebSocket Mock server node. Loads the mock data into the editor store for inspection or modification. Use this to view the current state of a mock WebSocket endpoint.',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'The unique identifier of the project containing the mock' },
        nodeId: { type: 'string', description: 'The unique identifier of the WebSocket Mock node to retrieve' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
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
    description: 'Modify basic configuration of a WebSocket Mock server node including name, path, port, delay, echo mode, and response content. Automatically loads the node if not currently in the editor. Use this for updating mock endpoint settings.',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'The unique identifier of the project containing the mock' },
        nodeId: { type: 'string', description: 'The unique identifier of the WebSocket Mock node to update' },
        name: { type: 'string', description: 'New display name for the mock server' },
        path: { type: 'string', description: 'New WebSocket path pattern, e.g., /ws-mock or /socket' },
        port: { type: 'number', description: 'New port number for the mock server to listen on' },
        delay: { type: 'number', description: 'New artificial response delay in milliseconds' },
        echoMode: { type: 'boolean', description: 'Whether to enable echo mode (true) or use fixed response (false)' },
        responseContent: { type: 'string', description: 'New fixed message content (only used when echoMode is false)' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
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
    description: 'Save changes to the currently selected WebSocket Mock server node in the editor. Relies on the active tab state to determine which mock to save. Use this after making modifications to persist the configuration.',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
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
    description: 'Start the WebSocket Mock service for a specific mock node (Electron environment). Launches a local WebSocket server that accepts connections and responds according to configured rules. Only available in Electron/desktop environment. Use this when the user wants to activate a mock WebSocket endpoint for testing.',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'The unique identifier of the project containing the mock' },
        nodeId: { type: 'string', description: 'The unique identifier of the WebSocket Mock node to start' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
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
    description: 'Stop the running WebSocket Mock service for a specific mock node (Electron environment). Shuts down the local WebSocket server and closes all client connections. Only available in Electron/desktop environment. Use this when the user wants to deactivate a mock endpoint.',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'The unique identifier of the WebSocket Mock node to stop' },
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
    description: 'Check whether a WebSocket Mock service is currently running for a specific node (Electron environment). Returns enabled status. Only available in Electron/desktop environment. Use this to verify if a mock WebSocket endpoint is active and accepting connections.',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'The unique identifier of the WebSocket Mock node to check' },
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
