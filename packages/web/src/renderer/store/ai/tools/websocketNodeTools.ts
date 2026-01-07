import { AgentTool } from '@src/types/ai'
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
    description: '根据用户的简单描述创建websocketNode节点（推荐）。当用户没有提供完整的protocol、url、headers等参数时，使用此工具自动推断',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目id',
        },
        description: {
          type: 'string',
          description: 'WebSocket连接的自然语言描述，例如"创建一个聊天室WebSocket连接，需要token认证"',
        },
        pid: {
          type: 'string',
          description: '父节点id，根节点留空字符串',
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
            { role: 'system', content: simpleCreateWebsocketNodePrompt },
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
    description: '创建一个新的websocketNode节点',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目id',
        },
        name: {
          type: 'string',
          description: '节点名称',
        },
        pid: {
          type: 'string',
          description: '父节点id，根节点留空字符串',
        },
        protocol: {
          type: 'string',
          enum: ['ws', 'wss'],
          description: 'WebSocket协议，ws或wss',
        },
        urlPath: {
          type: 'string',
          description: 'WebSocket路径，如/ws/chat',
        },
        urlPrefix: {
          type: 'string',
          description: 'URL前缀',
        },
        queryParams: {
          type: 'array',
          description: '查询参数数组',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string', description: '参数名' },
              value: { type: 'string', description: '参数值' },
              description: { type: 'string', description: '参数说明' },
            },
            required: ['key'],
          },
        },
        headers: {
          type: 'array',
          description: '请求头数组',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string', description: '请求头名' },
              value: { type: 'string', description: '请求头值' },
              description: { type: 'string', description: '说明' },
            },
            required: ['key'],
          },
        },
        description: {
          type: 'string',
          description: 'WebSocket节点描述',
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
    description: '获取指定websocketNode节点详情（会加载到当前WebSocket编辑器store中）',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: '项目id' },
        nodeId: { type: 'string', description: 'websocket节点id' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const websocketStore = useWebSocket()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId与nodeId必须为字符串' } }
      }
      await websocketStore.getWebsocketDetail({ id: nodeId, projectId })
      return { code: websocketStore.websocket?._id === nodeId ? 0 : 1, data: websocketStore.websocket }
    },
  },
  {
    name: 'updateWebsocketNodeMeta',
    description: '更新websocketNode的基本信息（名称/描述/协议/path/prefix）。会先按projectId+nodeId加载节点到store，然后更新store内数据',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: '项目id' },
        nodeId: { type: 'string', description: 'websocket节点id' },
        name: { type: 'string', description: '名称' },
        description: { type: 'string', description: '描述' },
        protocol: { type: 'string', description: '协议(ws/wss)，在execute内校验' },
        path: { type: 'string', description: '请求路径，例如 /ws' },
        prefix: { type: 'string', description: '请求前缀，例如 {{host}}' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const websocketStore = useWebSocket()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId与nodeId必须为字符串' } }
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
          return { code: 1, data: { error: 'protocol仅支持ws或wss' } }
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
    description: '为指定websocketNode添加一个自定义header（会先按projectId+nodeId加载节点到store）',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: '项目id' },
        nodeId: { type: 'string', description: 'websocket节点id' },
        header: {
          type: 'object',
          description: 'header信息',
          properties: {
            key: { type: 'string', description: 'header名称' },
            value: { type: 'string', description: 'header值' },
            description: { type: 'string', description: '备注' },
            required: { type: 'boolean', description: '是否必填' },
            select: { type: 'boolean', description: '是否选中' },
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
        return { code: 1, data: { error: 'projectId与nodeId必须为字符串' } }
      }
      if (websocketStore.websocket?._id !== nodeId) {
        await websocketStore.getWebsocketDetail({ id: nodeId, projectId })
      }
      const header = args.header
      if (!isRecord(header)) {
        return { code: 1, data: { error: 'header必须为对象' } }
      }
      const key = header.key
      const value = header.value
      const description = header.description
      const required = header.required
      const select = header.select
      if (!isString(key)) {
        return { code: 1, data: { error: 'header.key必须为字符串' } }
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
    description: '保存当前选中的websocketNode（依赖当前Tab选中态）',
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
        return { code: 1, data: { error: '当前没有选中的Tab' } }
      }
      const websocketStore = useWebSocket()
      await websocketStore.saveWebsocket()
      return { code: 0, data: null }
    },
  },
  {
    name: 'connectWebsocketByNodeId',
    description: '通过nodeId与url建立WebSocket连接（Electron环境）。headers可选，枚举校验在execute内完成',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'websocket节点id' },
        url: { type: 'string', description: '完整连接地址，例如 ws://127.0.0.1:8080/ws' },
        headers: { type: 'object', description: '可选，请求头键值对' },
      },
      required: ['nodeId', 'url'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      if (!window.electronAPI?.websocket?.connect) {
        return { code: 1, data: { error: '当前环境不支持WebSocket连接' } }
      }
      const nodeId = args.nodeId
      const url = args.url
      const headers = args.headers
      if (!isString(nodeId) || !isString(url)) {
        return { code: 1, data: { error: 'nodeId与url必须为字符串' } }
      }
      if (typeof headers !== 'undefined' && !isRecordString(headers)) {
        return { code: 1, data: { error: 'headers必须为Record<string,string>' } }
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
    description: '向指定nodeId的WebSocket连接发送消息（会先检查该nodeId是否已连接）',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'websocket节点id' },
        message: { type: 'string', description: '要发送的消息文本' },
      },
      required: ['nodeId', 'message'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      if (!window.electronAPI?.websocket?.checkNodeConnection || !window.electronAPI?.websocket?.send) {
        return { code: 1, data: { error: '当前环境不支持WebSocket发送消息' } }
      }
      const nodeId = args.nodeId
      const message = args.message
      if (!isString(nodeId) || !isString(message)) {
        return { code: 1, data: { error: 'nodeId与message必须为字符串' } }
      }
      const stateResult = await window.electronAPI.websocket.checkNodeConnection(nodeId)
      if (!isRecord(stateResult) || stateResult.connected !== true || !isString(stateResult.connectionId)) {
        return { code: 1, data: { error: '当前nodeId未建立连接' } }
      }
      const result = await window.electronAPI.websocket.send(stateResult.connectionId, message)
      const normalized = normalizeIpcResult(result)
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
  {
    name: 'disconnectWebsocketByNodeId',
    description: '断开指定nodeId的WebSocket连接（Electron环境）',
    type: 'websocketNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'websocket节点id' },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      if (!window.electronAPI?.websocket?.disconnectByNode) {
        return { code: 1, data: { error: '当前环境不支持WebSocket断开连接' } }
      }
      const nodeId = args.nodeId
      if (!isString(nodeId)) {
        return { code: 1, data: { error: 'nodeId必须为字符串' } }
      }
      const result = await window.electronAPI.websocket.disconnectByNode(nodeId)
      const normalized = normalizeIpcResult(result)
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
]
