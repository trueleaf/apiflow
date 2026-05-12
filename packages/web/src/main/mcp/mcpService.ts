import { ipcMain } from 'electron'
import { createServer, type IncomingMessage, type Server as HttpServer, type ServerResponse } from 'node:http'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import type { McpServerSettings, McpServerState, McpStatus } from '@src/types/mcp'
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
let currentSettings: McpServerSettings = getMcpSettings()
let currentPreloadPath = ''
let handlersRegistered = false
let errorCode = ''
let errorMessage = ''
const maxBodySize = 1024 * 1024 * 4
const getEndpoint = (port: number): string => {
  return `http://127.0.0.1:${port}/mcp`
}
const normalizeSettings = (settings: McpServerSettings): McpServerSettings => {
  return {
    enabled: settings.enabled,
    port: Number.isInteger(settings.port) && settings.port > 0 && settings.port <= 65535 ? settings.port : 34180,
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
    return isLocalhostName(parsed.hostname)
  } catch {
    return false
  }
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
  let parsedBody: unknown | undefined
  try {
    parsedBody = await readBody(request)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body'
    sendJson(response, 400, {
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message,
      },
      id: null,
    })
    return
  }
  const protocolServer = createMcpProtocolServer({
    listTools: async () => {
      try {
        return await listMcpExecutorTools()
      } catch {
        return []
      }
    },
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
  })
  response.on('close', () => {
    transport.close().catch(() => undefined)
    protocolServer.close().catch(() => undefined)
  })
  await protocolServer.connect(transport)
  await transport.handleRequest(request, response, parsedBody)
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
export const stopMcpService = async (): Promise<void> => {
  clearError()
  if (server) {
    await new Promise<void>((resolve) => {
      server?.close(() => resolve())
    })
    server = null
  }
  await destroyMcpExecutor()
  serverState = 'stopped'
}
export const startMcpService = async (): Promise<void> => {
  clearError()
  currentSettings = normalizeSettings(getMcpSettings())
  if (!currentSettings.enabled) {
    await stopMcpService()
    return
  }
  if (!currentPreloadPath) {
    setError('PRELOAD_NOT_READY', 'MCP preload path is not ready')
    return
  }
  if (server) {
    await stopMcpService()
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
export const restartMcpService = async (): Promise<void> => {
  await stopMcpService()
  await startMcpService()
}
export const updateMcpSettings = async (settings: McpServerSettings): Promise<McpStatus> => {
  currentSettings = normalizeSettings(settings)
  setMcpSettings(currentSettings)
  await restartMcpService()
  return getMcpStatus()
}
const isSettingsPayload = (value: unknown): value is McpServerSettings => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const payload = value as Record<string, unknown>
  return typeof payload.enabled === 'boolean' && typeof payload.port === 'number'
}
const registerMcpIpcHandlers = () => {
  if (handlersRegistered) {
    return
  }
  ipcMain.handle('mcp:renderer:to:main:get-status', () => getMcpStatus())
  ipcMain.handle('mcp:renderer:to:main:update-settings', async (_, payload: unknown) => {
    if (!isSettingsPayload(payload)) {
      return getMcpStatus()
    }
    return updateMcpSettings(payload)
  })
  ipcMain.handle('mcp:renderer:to:main:restart', async () => {
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
