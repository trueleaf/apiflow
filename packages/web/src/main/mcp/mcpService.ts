import { ipcMain } from 'electron'
import { createServer, type IncomingMessage, type Server as HttpServer, type ServerResponse } from 'node:http'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { timingSafeEqual } from 'node:crypto'
import type { McpServerSettings, McpServerState, McpStatus, McpStoredSettings } from '@src/types/mcp'
import { getMcpSettings, setMcpSettings } from '../store/appStore.ts'
import {
  callMcpExecutorTool,
  createMcpExecutor,
  destroyMcpExecutor,
  getMcpExecutorState,
  listMcpExecutorTools,
  readMcpExecutorResource,
} from './mcpExecutor.ts'
import { createMcpProtocolServer } from './mcpProtocol.ts'

let server: HttpServer | null = null
let serverState: McpServerState = 'stopped'
let currentSettings: McpStoredSettings = getMcpSettings()
let currentPreloadPath = ''
let handlersRegistered = false
let errorCode = ''
let errorMessage = ''
const maxBodySize = 1024 * 1024 * 4
const activeProtocols = new Set<ReturnType<typeof createMcpProtocolServer>>()
let lifecycleQueue: Promise<unknown> = Promise.resolve()
// 串行处理服务生命周期操作
const enqueueLifecycle = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = lifecycleQueue.then(operation)
  lifecycleQueue = result.catch(() => undefined)
  return result
}
const getEndpoint = (port: number): string => {
  return `http://127.0.0.1:${port}/mcp`
}
const normalizeSettings = (settings: McpServerSettings): McpStoredSettings => {
  const saved = getMcpSettings()
  return {
    ...saved,
    enabled: settings.enabled,
    port: Number.isInteger(settings.port) && settings.port > 0 && settings.port <= 65535 ? settings.port : 34180,
    readOnly: settings.readOnly ?? saved.readOnly,
    allowDestructive: settings.allowDestructive ?? saved.allowDestructive,
  }
}
const createStatus = (): McpStatus => {
  return {
    enabled: currentSettings.enabled,
    port: currentSettings.port,
    endpoint: getEndpoint(currentSettings.port),
    serverState,
    executorState: getMcpExecutorState(),
    errorCode,
    errorMessage,
    readOnly: currentSettings.readOnly,
    allowDestructive: currentSettings.allowDestructive,
    authToken: currentSettings.authToken,
  }
}
const clearError = () => {
  errorCode = ''
  errorMessage = ''
}
const setError = (code: string, message: string) => {
  errorCode = code
  errorMessage = message
  serverState = 'error'
}
const splitHost = (host: string): string => {
  if (host.startsWith('[')) {
    const endIndex = host.indexOf(']')
    return endIndex === -1 ? host : host.slice(1, endIndex)
  }
  return host.split(':')[0]
}
const isLocalhostName = (host: string): boolean => {
  const normalizedHost = host.toLowerCase()
  return normalizedHost === '127.0.0.1' || normalizedHost === 'localhost' || normalizedHost === '::1'
}
const isAllowedHost = (request: IncomingMessage): boolean => {
  const host = request.headers.host
  if (!host) {
    return false
  }
  return isLocalhostName(splitHost(host))
}
const isAllowedOrigin = (request: IncomingMessage): boolean => {
  const origin = request.headers.origin
  if (!origin) {
    return true
  }
  try {
    const parsed = new URL(origin)
    return ['http:', 'https:'].includes(parsed.protocol) && isLocalhostName(splitHost(parsed.host))
  } catch {
    return false
  }
}
// 验证本机客户端访问令牌
const isAuthenticated = (request: IncomingMessage): boolean => {
  const actual = Buffer.from(request.headers.authorization || '')
  const expected = Buffer.from(`Bearer ${currentSettings.authToken}`)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
const sendJson = (response: ServerResponse, statusCode: number, payload: unknown) => {
  if (response.headersSent) {
    return
  }
  response.writeHead(statusCode, { 'content-type': 'application/json' })
  response.end(JSON.stringify(payload))
}
const readBody = async (request: IncomingMessage): Promise<unknown | undefined> => {
  if (request.method !== 'POST') {
    return undefined
  }
  const chunks: Buffer[] = []
  let totalSize = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    totalSize += buffer.length
    if (totalSize > maxBodySize) {
      throw new Error('REQUEST_BODY_TOO_LARGE')
    }
    chunks.push(buffer)
  }
  if (chunks.length === 0) {
    return undefined
  }
  const text = Buffer.concat(chunks).toString('utf-8')
  if (!text.trim()) {
    return undefined
  }
  return JSON.parse(text) as unknown
}
const handleMcpRequest = async (request: IncomingMessage, response: ServerResponse) => {
  const requestUrl = new URL(request.url || '/', getEndpoint(currentSettings.port))
  if (requestUrl.pathname !== '/mcp') {
    sendJson(response, 404, { error: 'Not found' })
    return
  }
  if (!isAllowedHost(request) || !isAllowedOrigin(request)) {
    sendJson(response, 403, { error: 'Forbidden' })
    return
  }
  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }
  if (!isAuthenticated(request)) {
    response.setHeader('WWW-Authenticate', 'Bearer realm="ApiFlow MCP"')
    sendJson(response, 401, { error: 'Unauthorized' })
    return
  }
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST, OPTIONS')
    sendJson(response, 405, { error: 'Method not allowed' })
    return
  }
  if (activeProtocols.size >= 64) {
    response.setHeader('Retry-After', '1')
    sendJson(response, 429, { error: 'Too many requests' })
    return
  }
  let parsedBody: unknown | undefined
  try {
    parsedBody = await readBody(request)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body'
    sendJson(response, message === 'REQUEST_BODY_TOO_LARGE' ? 413 : 400, {
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message,
      },
      id: null,
    })
    return
  }
  if (response.destroyed || serverState !== 'running') {
    sendJson(response, 503, { error: 'MCP service is stopping' })
    return
  }
  const protocolServer = createMcpProtocolServer({
    accessPolicy: { readOnly: currentSettings.readOnly, allowDestructive: currentSettings.allowDestructive },
    listTools: listMcpExecutorTools,
    callTool: async (name, args) => {
      try {
        return await callMcpExecutorTool({ name, arguments: args })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'MCP executor error'
        return {
          code: 1,
          error: {
            code: message,
            message,
          },
        }
      }
    },
    readResource: async (uri) => {
      try {
        return await readMcpExecutorResource({ uri })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'MCP executor error'
        return {
          code: 1,
          error: {
            code: message,
            message,
          },
        }
      }
    },
  })
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  activeProtocols.add(protocolServer)
  response.on('close', () => {
    activeProtocols.delete(protocolServer)
    transport.close().catch(() => undefined)
    protocolServer.close().catch(() => undefined)
  })
  try {
    await protocolServer.connect(transport)
    await transport.handleRequest(request, response, parsedBody)
  } catch (error) {
    activeProtocols.delete(protocolServer)
    await protocolServer.close().catch(() => undefined)
    throw error
  }
}
const listenServer = async (targetServer: HttpServer, port: number): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    targetServer.once('error', reject)
    targetServer.listen(port, '127.0.0.1', () => {
      targetServer.off('error', reject)
      resolve()
    })
  })
}
export const getMcpStatus = (): McpStatus => {
  return createStatus()
}
const stopService = async (): Promise<void> => {
  clearError()
  serverState = 'stopped'
  const previousServer = server
  server = null
  const closed = previousServer ? new Promise<void>(resolve => previousServer.close(() => resolve())) : Promise.resolve()
  previousServer?.closeAllConnections()
  await destroyMcpExecutor()
  await Promise.allSettled([...activeProtocols].map(protocol => protocol.close()))
  activeProtocols.clear()
  await closed
  serverState = 'stopped'
}
const startService = async (): Promise<void> => {
  clearError()
  currentSettings = normalizeSettings(getMcpSettings())
  if (!currentSettings.enabled) {
    await stopService()
    return
  }
  if (!currentPreloadPath) {
    setError('PRELOAD_NOT_READY', 'MCP preload path is not ready')
    return
  }
  if (server) {
    await stopService()
  }
  serverState = 'starting'
  try {
    await createMcpExecutor(currentPreloadPath)
    const nextServer = createServer((request, response) => {
      handleMcpRequest(request, response).catch(error => {
        sendJson(response, 500, {
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Internal server error',
          },
          id: null,
        })
      })
    })
    await listenServer(nextServer, currentSettings.port)
    server = nextServer
    serverState = 'running'
  } catch (error) {
    await destroyMcpExecutor()
    server = null
    const message = error instanceof Error ? error.message : 'MCP server start failed'
    const code = message.includes('EADDRINUSE') ? 'PORT_IN_USE' : 'SERVER_START_FAILED'
    setError(code, message)
  }
}
// 停止 MCP 服务和执行窗口
export const stopMcpService = (): Promise<void> => enqueueLifecycle(stopService)
// 启动 MCP 服务
export const startMcpService = (): Promise<void> => enqueueLifecycle(startService)
// 重启 MCP 服务
export const restartMcpService = (): Promise<void> => enqueueLifecycle(async () => {
  await stopService()
  await startService()
})
// 保存配置并重启 MCP 服务
export const updateMcpSettings = (settings: McpServerSettings): Promise<McpStatus> => enqueueLifecycle(async () => {
  currentSettings = normalizeSettings(settings)
  setMcpSettings(currentSettings)
  await stopService()
  await startService()
  return getMcpStatus()
})
const isSettingsPayload = (value: unknown): value is McpServerSettings => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const payload = value as Record<string, unknown>
  return typeof payload.enabled === 'boolean' && typeof payload.port === 'number' && Number.isInteger(payload.port) && payload.port > 0 && payload.port <= 65535
    && (payload.readOnly === undefined || typeof payload.readOnly === 'boolean')
    && (payload.allowDestructive === undefined || typeof payload.allowDestructive === 'boolean')
}
// 仅允许本地设置页面访问服务配置
const assertSettingsSender = (url: string) => {
  const parsed = new URL(url)
  const localApp = parsed.protocol === 'app:' && parsed.hostname === 'index.html' && ['', '/'].includes(parsed.pathname)
  const developmentApp = __COMMAND__ !== 'build' && parsed.origin === 'http://localhost:4000' && ['/', '/index.html'].includes(parsed.pathname)
  if (!localApp && !developmentApp) throw new Error('MCP_SETTINGS_ACCESS_DENIED')
}
const registerMcpIpcHandlers = () => {
  if (handlersRegistered) {
    return
  }
  ipcMain.handle('mcp:renderer:to:main:get-status', event => {
    assertSettingsSender(event.senderFrame?.url || '')
    return getMcpStatus()
  })
  ipcMain.handle('mcp:renderer:to:main:update-settings', async (event, payload: unknown) => {
    assertSettingsSender(event.senderFrame?.url || '')
    if (!isSettingsPayload(payload)) {
      throw new Error('INVALID_MCP_SETTINGS')
    }
    return updateMcpSettings({ enabled: payload.enabled, port: payload.port, readOnly: payload.readOnly, allowDestructive: payload.allowDestructive })
  })
  ipcMain.handle('mcp:renderer:to:main:restart', async event => {
    assertSettingsSender(event.senderFrame?.url || '')
    await restartMcpService()
    return getMcpStatus()
  })
  handlersRegistered = true
}
export const initMcpService = async (preloadPath: string): Promise<void> => {
  currentPreloadPath = preloadPath
  currentSettings = normalizeSettings(getMcpSettings())
  registerMcpIpcHandlers()
  if (currentSettings.enabled) {
    await startMcpService()
  }
}
