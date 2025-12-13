import { AgentTool } from '@src/types/ai'
import { useHttpMockNode } from '@/store/httpMockNode/httpMockNodeStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { httpMockLogsCache } from '@/cache/mock/httpMock/httpMockLogsCache'
import type { Method } from 'got'

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
    name: 'getHttpMockNodeDetail',
    description: '获取指定httpMockNode节点详情（会加载到当前HttpMock编辑器store中）',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: '项目id' },
        nodeId: { type: 'string', description: 'httpMock节点id' },
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
    description: '更新httpMockNode的基础信息（名称/方法/url/port/delay）。会先按projectId+nodeId加载节点到store，然后更新store内数据',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: '项目id' },
        nodeId: { type: 'string', description: 'httpMock节点id' },
        name: { type: 'string', description: '名称' },
        method: {
          description: 'HTTP方法，支持字符串或字符串数组（在execute内校验）',
          anyOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } },
          ],
        },
        requestUrl: { type: 'string', description: '请求URL，例如 /api/mock' },
        port: { type: 'number', description: '端口' },
        delay: { type: 'number', description: '延迟(ms)' },
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
    description: '保存当前选中的httpMockNode（依赖当前Tab选中态）',
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
    description: '启动指定nodeId的HttpMock服务（Electron环境）',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: '项目id' },
        nodeId: { type: 'string', description: 'httpMock节点id' },
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
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
  {
    name: 'stopHttpMockServerByNodeId',
    description: '停止指定nodeId的HttpMock服务（Electron环境）',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'httpMock节点id' },
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
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
  {
    name: 'getHttpMockEnabledStatus',
    description: '查询指定nodeId的HttpMock服务是否已启用（Electron环境）',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'httpMock节点id' },
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
    description: '获取指定nodeId的HttpMock日志（从IndexedDB缓存读取）',
    type: 'httpMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'httpMock节点id' },
        limit: { type: 'number', description: '可选，限制返回条数（默认50）' },
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
