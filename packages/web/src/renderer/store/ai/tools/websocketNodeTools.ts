import { AgentTool } from '@src/types/ai'
import type { Language } from '@src/types'
import { useWebSocket } from '@/store/websocketNode/websocketNodeStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useSkill } from '@/store/ai/skillStore'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { simpleCreateWebsocketNodePrompt } from '@/store/ai/prompt/prompt'
import { CreateWebsocketNodeOptions } from '@src/types/ai/tools.type'
import { nanoid } from 'nanoid'

type LLMInferredWebsocketParam = {
  key?: string
  value?: string
  description?: string
}
type LLMInferredWebsocketParams = {
  name?: string
  description?: string
  protocol?: string
  urlPrefix?: string
  urlPath?: string
  queryParams?: LLMInferredWebsocketParam[]
  headers?: LLMInferredWebsocketParam[]
}
//将LLM返回的简化JSON转换为完整的CreateWebsocketNodeOptions
const buildCreateWebsocketNodeOptions = (projectId: string, params: LLMInferredWebsocketParams, pid?: string): CreateWebsocketNodeOptions => {
  const options: CreateWebsocketNodeOptions = {
    projectId,
    pid: pid || '',
    name: params.name || '未命名WebSocket',
    description: params.description || '',
  }
  if (params.protocol === 'ws' || params.protocol === 'wss') {
    options.protocol = params.protocol
  }
  if (params.urlPath || params.urlPrefix) {
    options.url = {
      path: params.urlPath || '',
      prefix: params.urlPrefix || '',
    }
  }
  if (Array.isArray(params.queryParams) && params.queryParams.length > 0) {
    options.queryParams = params.queryParams.map(p => ({
      _id: nanoid(),
      key: p.key || '',
      value: p.value || '',
      type: 'string' as const,
      required: true,
      description: p.description || '',
      select: true,
    }))
  }
  if (Array.isArray(params.headers) && params.headers.length > 0) {
    options.headers = params.headers.map(h => ({
      _id: nanoid(),
      key: h.key || '',
      value: h.value || '',
      type: 'string' as const,
      required: false,
      description: h.description || '',
      select: true,
    }))
  }
  return options
}

//校验是否为字符串
const isString = (value: unknown): value is string => typeof value === 'string'
//校验是否为对象
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
//校验是否为Record<string,string>
const isRecordString = (value: unknown): value is Record<string, string> => {
  if (!isRecord(value)) return false
  return Object.values(value).every(v => typeof v === 'string')
}
//校验WebSocket协议
const isWebSocketProtocol = (value: unknown): value is 'ws' | 'wss' => value === 'ws' || value === 'wss'
//解析并校验Electron IPC返回
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

export const websocketNodeTools: AgentTool[] = [
  {
    name: 'simpleCreateWebsocketNode',
    description: 'Create a WebSocket connection node from natural language description (Smart Mode - Recommended). Automatically infers protocol (ws/wss), URL, query parameters, and headers from user input. Use this when the user wants to set up a WebSocket connection without specifying technical details. Example: "Create a chat room WebSocket requiring token authentication" will auto-generate appropriate configuration.',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project where the WebSocket node will be created',
        },
        description: {
          type: 'string',
          description: 'Natural language description of the WebSocket connection requirements, including purpose, authentication needs, and parameters',
        },
        pid: {
          type: 'string',
          description: 'Optional parent folder ID. If omitted or empty string, the WebSocket will be created at the root level',
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
      const targetLanguage = (args._targetLanguage as Language) || 'zh-cn'
      const languageInstruction = {
        'zh-cn': '[CRITICAL] You MUST generate all text fields (name, description) in Simplified Chinese.',
        'zh-tw': '[CRITICAL] You MUST generate all text fields (name, description) in Traditional Chinese.',
        'en': '[CRITICAL] You MUST generate all text fields (name, description) in English.',
        'ja': '[CRITICAL] You MUST generate all text fields (name, description) in Japanese.',
      }[targetLanguage]
      try {
        const response = await llmClientStore.chat({
          messages: [
            { role: 'system', content: simpleCreateWebsocketNodePrompt },
            { role: 'system', content: languageInstruction },
            { role: 'user', content: description }
          ],
          response_format: { type: 'json_object' }
        })
        const content = response.choices[0]?.message?.content || '{}'
        const inferredParams: LLMInferredWebsocketParams = JSON.parse(content)
        const options = buildCreateWebsocketNodeOptions(projectId, inferredParams, pid)
        const node = await skillStore.createWebsocketNode(options)
        return { code: node ? 0 : 1, data: node }
      } catch (error) {
        return { code: 1, data: { error: error instanceof Error ? error.message : '创建失败' } }
      }
    },
  },
  {
    name: 'createWebsocketNode',
    description: 'Create a WebSocket connection node with precise control over all parameters (Precise Mode). Use this when you need explicit control over protocol, URL, headers, and query parameters. For simpler creation from natural language, prefer simpleCreateWebsocketNode instead.',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project where the WebSocket node will be created',
        },
        name: {
          type: 'string',
          description: 'The display name for the WebSocket connection node',
        },
        pid: {
          type: 'string',
          description: 'Parent node ID, leave empty string for root node',
        },
        protocol: {
          type: 'string',
          enum: ['ws', 'wss'],
          description: 'WebSocket protocol, ws or wss',
        },
        urlPath: {
          type: 'string',
          description: 'WebSocket path, e.g., /ws/chat',
        },
        urlPrefix: {
          type: 'string',
          description: 'URL prefix',
        },
        queryParams: {
          type: 'array',
          description: 'Query parameters array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Parameter name' },
              value: { type: 'string', description: 'Parameter value' },
              description: { type: 'string', description: 'Parameter description' },
            },
            required: ['key'],
          },
        },
        headers: {
          type: 'array',
          description: 'Request headers array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Header name' },
              value: { type: 'string', description: 'Header value' },
              description: { type: 'string', description: 'Description' },
            },
            required: ['key'],
          },
        },
        description: {
          type: 'string',
          description: 'WebSocket node description',
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
      const options: CreateWebsocketNodeOptions = {
        projectId,
        name,
        pid,
        description,
      }
      if (args.protocol === 'ws' || args.protocol === 'wss') {
        options.protocol = args.protocol
      }
      if (typeof args.urlPath === 'string' || typeof args.urlPrefix === 'string') {
        options.url = {
          path: typeof args.urlPath === 'string' ? args.urlPath : '',
          prefix: typeof args.urlPrefix === 'string' ? args.urlPrefix : '',
        }
      }
      if (Array.isArray(args.queryParams)) {
        options.queryParams = args.queryParams.map((p: Record<string, unknown>) => ({
          _id: nanoid(),
          key: typeof p.key === 'string' ? p.key : '',
          value: typeof p.value === 'string' ? p.value : '',
          type: 'string' as const,
          required: true,
          description: typeof p.description === 'string' ? p.description : '',
          select: true,
        }))
      }
      if (Array.isArray(args.headers)) {
        options.headers = args.headers.map((h: Record<string, unknown>) => ({
          _id: nanoid(),
          key: typeof h.key === 'string' ? h.key : '',
          value: typeof h.value === 'string' ? h.value : '',
          type: 'string' as const,
          required: false,
          description: typeof h.description === 'string' ? h.description : '',
          select: true,
        }))
      }
      const node = await skillStore.createWebsocketNode(options)
      return { code: node ? 0 : 1, data: node }
    },
  },
  {
    name: 'getWebsocketNodeDetail',
    description: 'Get details of the specified websocketNode (will be loaded into the current WebSocket editor store)',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        nodeId: { type: 'string', description: 'WebSocket node ID' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const websocketStore = useWebSocket()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId and nodeId must be strings' } }
      }
      await websocketStore.getWebsocketDetail({ id: nodeId, projectId })
      return { code: websocketStore.websocket?._id === nodeId ? 0 : 1, data: websocketStore.websocket }
    },
  },
  {
    name: 'updateWebsocketNodeMeta',
    description: 'Update basic information of websocketNode (name/description/protocol/path/prefix). Will first load the node into store by projectId+nodeId, then update the data in store',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        nodeId: { type: 'string', description: 'WebSocket node ID' },
        name: { type: 'string', description: 'Name' },
        description: { type: 'string', description: 'Description' },
        protocol: { type: 'string', description: 'Protocol (ws/wss), validated in execute' },
        path: { type: 'string', description: 'Request path, e.g., /ws' },
        prefix: { type: 'string', description: 'Request prefix, e.g., {{host}}' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const websocketStore = useWebSocket()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId and nodeId must be strings' } }
      }
      if (websocketStore.websocket?._id !== nodeId) {
        await websocketStore.getWebsocketDetail({ id: nodeId, projectId })
      }
      const name = args.name
      const description = args.description
      const protocol = args.protocol
      const path = args.path
      const prefix = args.prefix
      if (isString(name)) {
        websocketStore.changeWebSocketName(name)
      }
      if (isString(description)) {
        websocketStore.changeWebSocketDescription(description)
      }
      if (typeof protocol !== 'undefined') {
        if (!isWebSocketProtocol(protocol)) {
          return { code: 1, data: { error: 'protocol only supports ws or wss' } }
        }
        websocketStore.changeWebSocketProtocol(protocol)
      }
      if (isString(path)) {
        websocketStore.changeWebSocketPath(path)
      }
      if (isString(prefix)) {
        websocketStore.changeWebSocketPrefix(prefix)
      }
      return { code: websocketStore.websocket?._id === nodeId ? 0 : 1, data: websocketStore.websocket }
    },
  },
  {
    name: 'addWebsocketNodeHeader',
    description: 'Add a custom header to the specified websocketNode (will first load the node into store by projectId+nodeId)',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        nodeId: { type: 'string', description: 'WebSocket node ID' },
        header: {
          type: 'object',
          description: 'Header information',
          properties: {
            key: { type: 'string', description: 'Header name' },
            value: { type: 'string', description: 'Header value' },
            description: { type: 'string', description: 'Remark' },
            required: { type: 'boolean', description: 'Whether required' },
            select: { type: 'boolean', description: 'Whether selected' },
          },
        },
      },
      required: ['projectId', 'nodeId', 'header'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const websocketStore = useWebSocket()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId and nodeId must be strings' } }
      }
      if (websocketStore.websocket?._id !== nodeId) {
        await websocketStore.getWebsocketDetail({ id: nodeId, projectId })
      }
      const header = args.header
      if (!isRecord(header)) {
        return { code: 1, data: { error: 'header must be an object' } }
      }
      const key = header.key
      const value = header.value
      const description = header.description
      const required = header.required
      const select = header.select
      if (!isString(key)) {
        return { code: 1, data: { error: 'header.key must be a string' } }
      }
      websocketStore.addWebSocketHeader({
        key,
        value: isString(value) ? value : '',
        description: isString(description) ? description : '',
        required: typeof required === 'boolean' ? required : false,
        select: typeof select === 'boolean' ? select : true,
      })
      return { code: websocketStore.websocket?._id === nodeId ? 0 : 1, data: websocketStore.websocket }
    },
  },
  {
    name: 'saveCurrentWebsocketNode',
    description: 'Save the currently selected websocketNode (depends on current Tab selection state)',
    type: 'websocketNode',
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
      const websocketStore = useWebSocket()
      await websocketStore.saveWebsocket()
      return { code: 0, data: null }
    },
  },
  {
    name: 'connectWebsocketByNodeId',
    description: 'Establish WebSocket connection via nodeId and url (Electron environment). Headers are optional, enumeration validation is done in execute',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'WebSocket node ID' },
        url: { type: 'string', description: 'Complete connection URL, e.g., ws://127.0.0.1:8080/ws' },
        headers: { type: 'object', description: 'Optional, request headers key-value pairs' },
      },
      required: ['nodeId', 'url'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      if (!window.electronAPI?.websocket?.connect) {
        return { code: 1, data: { error: 'Current environment does not support WebSocket connection' } }
      }
      const nodeId = args.nodeId
      const url = args.url
      const headers = args.headers
      if (!isString(nodeId) || !isString(url)) {
        return { code: 1, data: { error: 'nodeId and url must be strings' } }
      }
      if (typeof headers !== 'undefined' && !isRecordString(headers)) {
        return { code: 1, data: { error: 'headers must be Record<string,string>' } }
      }
      const result = await window.electronAPI.websocket.connect({
        nodeId,
        url,
        headers: isRecordString(headers) ? headers : {},
      })
      const normalized = normalizeIpcResult(result)
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
  {
    name: 'sendWebsocketMessageByNodeId',
    description: 'Send message to the WebSocket connection of the specified nodeId (will first check if the nodeId is connected)',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'WebSocket node ID' },
        message: { type: 'string', description: 'Message text to send' },
      },
      required: ['nodeId', 'message'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      if (!window.electronAPI?.websocket?.checkNodeConnection || !window.electronAPI?.websocket?.send) {
        return { code: 1, data: { error: 'Current environment does not support sending WebSocket messages' } }
      }
      const nodeId = args.nodeId
      const message = args.message
      if (!isString(nodeId) || !isString(message)) {
        return { code: 1, data: { error: 'nodeId and message must be strings' } }
      }
      const stateResult = await window.electronAPI.websocket.checkNodeConnection(nodeId)
      if (!isRecord(stateResult) || stateResult.connected !== true || !isString(stateResult.connectionId)) {
        return { code: 1, data: { error: 'Current nodeId has not established a connection' } }
      }
      const result = await window.electronAPI.websocket.send(stateResult.connectionId, message)
      const normalized = normalizeIpcResult(result)
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
  {
    name: 'disconnectWebsocketByNodeId',
    description: 'Disconnect the WebSocket connection of the specified nodeId (Electron environment)',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'WebSocket node ID' },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      if (!window.electronAPI?.websocket?.disconnectByNode) {
        return { code: 1, data: { error: 'Current environment does not support disconnecting WebSocket connection' } }
      }
      const nodeId = args.nodeId
      if (!isString(nodeId)) {
        return { code: 1, data: { error: 'nodeId must be a string' } }
      }
      const result = await window.electronAPI.websocket.disconnectByNode(nodeId)
      const normalized = normalizeIpcResult(result)
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
]
