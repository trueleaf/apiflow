import { AgentTool } from '@src/types/ai'
import { useHttpMockNode } from '@/store/httpMockNode/httpMockNodeStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { httpMockLogsCache } from '@/cache/mock/httpMock/httpMockLogsCache'
import { useSkill } from '@/store/ai/skillStore'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { simpleCreateHttpMockNodePrompt } from '@/store/ai/prompt/prompt'
import { CreateHttpMockNodeOptions } from '@src/types/ai/tools.type'
import type { Method } from 'got'
import { trackEvent } from '@/utils/analytics';

type LLMInferredHttpMockParams = {
  name?: string
  description?: string
  method?: string[]
  url?: string
  port?: number
  delay?: number
}
//将LLM返回的简化JSON转换为完整的CreateHttpMockNodeOptions
const buildCreateHttpMockNodeOptions = (projectId: string, params: LLMInferredHttpMockParams, pid?: string): CreateHttpMockNodeOptions => {
  const options: CreateHttpMockNodeOptions = {
    projectId,
    pid: pid || '',
    name: params.name || '未命名Mock',
    description: params.description || '',
  }
  if (Array.isArray(params.method) && params.method.length > 0) {
    options.method = params.method.map(m => m.toUpperCase()) as (Method | 'ALL')[]
  }
  if (params.url) {
    options.url = params.url
  }
  if (params.port) {
    options.port = params.port
  }
  if (params.delay !== undefined) {
    options.delay = params.delay
  }
  return options
}

//校验是否为字符串
const isString = (value: unknown): value is string => typeof value === 'string'
//校验是否为对象
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
//校验是否为数字
const isNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value)
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
//校验HTTP方法列表
const normalizeHttpMethods = (value: unknown): { ok: true; methods: (Method | 'ALL')[] } | { ok: false; error: string } => {
  const allowed = new Set(['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
  const raw = Array.isArray(value) ? value : (isString(value) ? [value] : null)
  if (!raw) {
    return { ok: false, error: 'method必须为字符串或字符串数组' }
  }
  const methods = raw.filter(isString).map(m => m.toUpperCase())
  if (methods.length === 0) {
    return { ok: false, error: 'method不能为空' }
  }
  const invalid = methods.find(m => !allowed.has(m))
  if (invalid) {
    return { ok: false, error: `不支持的method: ${invalid}` }
  }
  return { ok: true, methods: methods as (Method | 'ALL')[] }
}

export const httpMockNodeTools: AgentTool[] = [
  {
    name: 'simpleCreateHttpMockNode',
    description: 'Create an HTTP Mock server node from natural language description (Smart Mode - Recommended). Automatically infers HTTP methods, URL path, port number, and response delay from user input. Use this when the user wants to quickly set up a mock endpoint without specifying technical details. Example: "Create a mock user list API listening on port 3001" will auto-generate appropriate configuration.',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project where the mock server will be created',
        },
        description: {
          type: 'string',
          description: 'Natural language description of the mock service requirements, including endpoint purpose, methods, and port if specific',
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
            { role: 'system', content: simpleCreateHttpMockNodePrompt },
            { role: 'user', content: description }
          ],
          response_format: { type: 'json_object' }
        })
        const content = response.choices[0]?.message?.content || '{}'
        const inferredParams: LLMInferredHttpMockParams = JSON.parse(content)
        const options = buildCreateHttpMockNodeOptions(projectId, inferredParams, pid)
        const node = await skillStore.createHttpMockNode(options)
        return { code: node ? 0 : 1, data: node }
      } catch (error) {
        return { code: 1, data: { error: error instanceof Error ? error.message : '创建失败' } }
      }
    },
  },
  {
    name: 'createHttpMockNode',
    description: 'Create an HTTP Mock server node with precise control over all parameters (Precise Mode). Use this when you need explicit control over methods, URL, port, and delay. Mock servers simulate API endpoints locally for offline development and testing. For simpler creation from natural language, prefer simpleCreateHttpMockNode instead.',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project where the mock server will be created',
        },
        name: {
          type: 'string',
          description: 'The display name for the mock server node',
        },
        pid: {
          type: 'string',
          description: 'Optional parent folder ID. If omitted or empty string, the mock will be created at the root level',
        },
        method: {
          description: 'Array of HTTP methods this mock should respond to. Use ["ALL"] to match all methods',

          type: 'array',
          items: {
            type: 'string',
            enum: ['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
          },
        },
        url: {
          type: 'string',
          description: 'URL path for the Mock, e.g., /api/users',
        },
        port: {
          type: 'number',
          description: 'Port for the Mock service to listen on, default is 3000',
        },
        delay: {
          type: 'number',
          description: 'Response delay in milliseconds, default is 0',
        },
        description: {
          type: 'string',
          description: 'Description of the Mock node',
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
      const options: CreateHttpMockNodeOptions = {
        projectId,
        name,
        pid,
        description,
      }
      if (Array.isArray(args.method)) {
        options.method = args.method as (Method | 'ALL')[]
      }
      if (typeof args.url === 'string') {
        options.url = args.url
      }
      if (typeof args.port === 'number') {
        options.port = args.port
      }
      if (typeof args.delay === 'number') {
        options.delay = args.delay
      }
      const node = await skillStore.createHttpMockNode(options)
      return { code: node ? 0 : 1, data: node }
    },
  },
  {
    name: 'getHttpMockNodeDetail',
    description: 'Retrieve complete configuration and settings of an HTTP Mock server node. Loads the mock data into the editor store for inspection or modification. Use this to view the current state of a mock endpoint.',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'The unique identifier of the project containing the mock' },
        nodeId: { type: 'string', description: 'The unique identifier of the HTTP Mock node to retrieve' },

      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const httpMockStore = useHttpMockNode()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId与nodeId必须为字符串' } }
      }
      await httpMockStore.getHttpMockNodeDetail({ id: nodeId, projectId })
      return { code: httpMockStore.httpMock?._id === nodeId ? 0 : 1, data: httpMockStore.httpMock }
    },
  },
  {
    name: 'updateHttpMockNodeBasic',
    description: 'Modify basic configuration of an HTTP Mock server node including name, methods, URL, port, and response delay. Automatically loads the node if not currently in the editor. Use this for updating mock endpoint settings.',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'The unique identifier of the project containing the mock' },
        nodeId: { type: 'string', description: 'The unique identifier of the HTTP Mock node to update' },
        name: { type: 'string', description: 'New display name for the mock server' },
        method: {
          description: 'New HTTP methods (string or array). Validated during execution. Examples: "GET", ["GET", "POST"], or ["ALL"]',
          anyOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } },
          ],
        },
        requestUrl: { type: 'string', description: 'New URL path pattern, e.g., /api/mock or /users/:id' },
        port: { type: 'number', description: 'New port number for the mock server to listen on' },
        delay: { type: 'number', description: 'New artificial response delay in milliseconds (useful for simulating network latency)' },

      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const httpMockStore = useHttpMockNode()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId与nodeId必须为字符串' } }
      }
      if (httpMockStore.httpMock?._id !== nodeId) {
        await httpMockStore.getHttpMockNodeDetail({ id: nodeId, projectId })
      }
      const name = args.name
      if (isString(name)) {
        httpMockStore.changeHttpMockName(name)
      }
      const requestUrl = args.requestUrl
      if (isString(requestUrl)) {
        httpMockStore.changeHttpMockNodeRequestUrl(requestUrl)
      }
      const port = args.port
      if (isNumber(port)) {
        httpMockStore.changeHttpMockNodePort(port)
      }
      const delay = args.delay
      if (isNumber(delay)) {
        httpMockStore.changeHttpMockNodeDelay(delay)
      }
      if (typeof args.method !== 'undefined') {
        const normalized = normalizeHttpMethods(args.method)
        if (!normalized.ok) {
          return { code: 1, data: { error: normalized.error } }
        }
        httpMockStore.changeHttpMockNodeMethod(normalized.methods)
      }
      return { code: httpMockStore.httpMock?._id === nodeId ? 0 : 1, data: httpMockStore.httpMock }
    },
  },
  {
    name: 'saveCurrentHttpMockNode',
    description: 'Save changes to the currently selected HTTP Mock server node in the editor. Relies on the active tab state to determine which mock to save. Use this after making modifications to persist the configuration.',
    type: 'httpMockNode',

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
      const httpMockStore = useHttpMockNode()
      await httpMockStore.saveHttpMockNode()
      return { code: 0, data: null }
    },
  },
  {
    name: 'startHttpMockServerByNodeId',
    description: 'Start the HTTP Mock service for a specific mock node. Launches a local mock server that responds to requests according to the configured rules. Only available in Electron/desktop environment. Use this when the user wants to activate a mock endpoint for testing.',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'The unique identifier of the project containing the mock' },
        nodeId: { type: 'string', description: 'The unique identifier of the HTTP Mock node to start' },

      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      if (!window.electronAPI?.mock?.startServer) {
        return { code: 1, data: { error: '当前环境不支持启动HttpMock服务' } }
      }
      const httpMockStore = useHttpMockNode()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId与nodeId必须为字符串' } }
      }
      if (httpMockStore.httpMock?._id !== nodeId) {
        await httpMockStore.getHttpMockNodeDetail({ id: nodeId, projectId })
      }
      const mockData = { ...httpMockStore.httpMock, projectId }
      const result = await window.electronAPI.mock.startServer(JSON.parse(JSON.stringify(mockData)))
      const normalized = normalizeIpcResult(result)
      if (normalized.ok) {
        trackEvent('mock_server_started', { type: 'http', node_id: nodeId });
      }
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
  {
    name: 'stopHttpMockServerByNodeId',
    description: 'Stop the running HTTP Mock service for a specific mock node. Shuts down the local mock server and frees the port. Only available in Electron/desktop environment. Use this when the user wants to deactivate a mock endpoint.',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'The unique identifier of the HTTP Mock node to stop' },

      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      if (!window.electronAPI?.mock?.stopServer) {
        return { code: 1, data: { error: '当前环境不支持停止HttpMock服务' } }
      }
      const nodeId = args.nodeId
      if (!isString(nodeId)) {
        return { code: 1, data: { error: 'nodeId必须为字符串' } }
      }
      const result = await window.electronAPI.mock.stopServer(nodeId)
      const normalized = normalizeIpcResult(result)
      if (normalized.ok) {
        trackEvent('mock_server_stopped', { type: 'http', node_id: nodeId });
      }
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
  {
    name: 'getHttpMockEnabledStatus',
    description: 'Check whether an HTTP Mock service is currently running for a specific node. Returns enabled status. Only available in Electron/desktop environment. Use this to verify if a mock endpoint is active.',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'The unique identifier of the HTTP Mock node to check' },

      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeId = args.nodeId
      if (!isString(nodeId)) {
        return { code: 1, data: { error: 'nodeId必须为字符串' } }
      }
      const httpMockStore = useHttpMockNode()
      const enabled = await httpMockStore.checkMockNodeEnabledStatus(nodeId)
      return { code: 0, data: { enabled } }
    },
  },
  {
    name: 'getHttpMockLogs',
    description: 'Retrieve request logs for an HTTP Mock server node. Shows incoming requests received by the mock endpoint including timestamps, methods, URLs, and responses. Reads from local IndexedDB cache. Use this to debug mock behavior or verify test requests.',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'The unique identifier of the HTTP Mock node whose logs to retrieve' },
        limit: { type: 'number', description: 'Optional maximum number of log entries to return (default: 50, most recent first)' },

      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeId = args.nodeId
      if (!isString(nodeId)) {
        return { code: 1, data: { error: 'nodeId必须为字符串' } }
      }
      const limitValue = args.limit
      const limit = isNumber(limitValue) && limitValue > 0 ? Math.floor(limitValue) : 50
      const logs = await httpMockLogsCache.getLogsByNodeId(nodeId)
      return { code: 0, data: logs.slice(0, limit) }
    },
  },
]
