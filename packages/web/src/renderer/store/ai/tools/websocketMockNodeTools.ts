import { AgentTool } from '@src/types/ai'
import { useWebSocketMockNode } from '@/store/websocketMockNode/websocketMockNodeStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useRuntime } from '@/store/runtime/runtimeStore'

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

export const websocketMockNodeTools: AgentTool[] = [
  {
    name: 'getWebsocketMockNodeDetail',
    description: '获取指定websocketMockNode节点详情（仅离线模式，会加载到当前WebSocketMock编辑器store中）',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: '项目id' },
        nodeId: { type: 'string', description: 'websocketMock节点id' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        return { code: 1, data: { error: '在线模式暂不支持WebSocket Mock节点' } }
      }
      const websocketMockStore = useWebSocketMockNode()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId与nodeId必须为字符串' } }
      }
      await websocketMockStore.getWebSocketMockNodeDetail({ id: nodeId, projectId })
      return { code: websocketMockStore.websocketMock?._id === nodeId ? 0 : 1, data: websocketMockStore.websocketMock }
    },
  },
  {
    name: 'updateWebsocketMockNodeBasic',
    description: '更新websocketMockNode的基础信息（name/path/port/delay/echoMode/responseContent）。仅离线模式，会先加载到store再更新',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: '项目id' },
        nodeId: { type: 'string', description: 'websocketMock节点id' },
        name: { type: 'string', description: '名称' },
        path: { type: 'string', description: '路径，例如 /ws-mock' },
        port: { type: 'number', description: '端口' },
        delay: { type: 'number', description: '延迟(ms)' },
        echoMode: { type: 'boolean', description: '是否开启echo模式' },
        responseContent: { type: 'string', description: '响应内容' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        return { code: 1, data: { error: '在线模式暂不支持WebSocket Mock节点' } }
      }
      const websocketMockStore = useWebSocketMockNode()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId与nodeId必须为字符串' } }
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
    description: '保存当前选中的websocketMockNode（仅离线模式，依赖当前Tab选中态）',
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
        return { code: 1, data: { error: '在线模式暂不支持WebSocket Mock节点' } }
      }
      const projectNavStore = useProjectNav()
      if (!projectNavStore.currentSelectNav) {
        return { code: 1, data: { error: '当前没有选中的Tab' } }
      }
      const websocketMockStore = useWebSocketMockNode()
      await websocketMockStore.saveWebSocketMockNode()
      return { code: 0, data: null }
    },
  },
  {
    name: 'startWebsocketMockServerByNodeId',
    description: '启动指定nodeId的WebSocket Mock服务（仅离线模式，Electron环境）',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: '项目id' },
        nodeId: { type: 'string', description: 'websocketMock节点id' },
      },
      required: ['projectId', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const runtimeStore = useRuntime()
      if (runtimeStore.networkMode !== 'offline') {
        return { code: 1, data: { error: '在线模式暂不支持WebSocket Mock节点' } }
      }
      if (!window.electronAPI?.websocketMock?.startServer) {
        return { code: 1, data: { error: '当前环境不支持启动WebSocket Mock服务' } }
      }
      const websocketMockStore = useWebSocketMockNode()
      const projectId = args.projectId
      const nodeId = args.nodeId
      if (!isString(projectId) || !isString(nodeId)) {
        return { code: 1, data: { error: 'projectId与nodeId必须为字符串' } }
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
    description: '停止指定nodeId的WebSocket Mock服务（Electron环境）',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'websocketMock节点id' },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      if (!window.electronAPI?.websocketMock?.stopServer) {
        return { code: 1, data: { error: '当前环境不支持停止WebSocket Mock服务' } }
      }
      const nodeId = args.nodeId
      if (!isString(nodeId)) {
        return { code: 1, data: { error: 'nodeId必须为字符串' } }
      }
      const result = await window.electronAPI.websocketMock.stopServer(nodeId)
      const normalized = normalizeIpcResult(result)
      return { code: normalized.ok ? 0 : 1, data: normalized.payload }
    },
  },
  {
    name: 'getWebsocketMockEnabledStatus',
    description: '查询指定nodeId的WebSocket Mock服务是否已启用（Electron环境）',
    type: 'websocketMockNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'websocketMock节点id' },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const nodeId = args.nodeId
      if (!isString(nodeId)) {
        return { code: 1, data: { error: 'nodeId必须为字符串' } }
      }
      const websocketMockStore = useWebSocketMockNode()
      const enabled = await websocketMockStore.checkMockNodeEnabledStatus(nodeId)
      return { code: 0, data: { enabled } }
    },
  },
]
