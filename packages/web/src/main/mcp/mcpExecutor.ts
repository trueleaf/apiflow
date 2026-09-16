import { BrowserWindow, ipcMain } from 'electron'
import { randomUUID } from 'node:crypto'
import { hasMigratedLegacyMcpData, markLegacyMcpDataMigrated } from '../store/appStore'
import type {
  McpExecutorState,
  McpResourceReadPayload,
  McpResourceReadResult,
  McpToolCallPayload,
  McpToolCallResult,
  McpToolDefinition,
  McpPendingRequest,
  McpLegacyData,
} from '@src/types/mcp'

let executorWindow: BrowserWindow | null = null
let executorState: McpExecutorState = 'not-created'
let handlersRegistered = false
const pendingRequests = new Map<string, McpPendingRequest>()
let readyRequest: McpPendingRequest | null = null
let preloadPath = ''
let creationPromise: Promise<void> | null = null
let legacyImported = hasMigratedLegacyMcpData()
let generation = 0
let toolQueue: Promise<unknown> = Promise.resolve()
const requestTimeout = 30000
const isExecutorResponse = (value: unknown): value is { requestId: string; result?: unknown; error?: string } => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const payload = value as Record<string, unknown>
  return typeof payload.requestId === 'string' && ('result' in payload || typeof payload.error === 'string')
}
const getExecutorUrl = (): string => {
  return __COMMAND__ === 'build' ? 'app://index.html/mcp.html' : 'http://localhost:4000/mcp.html'
}
const registerExecutorIpc = () => {
  if (handlersRegistered) {
    return
  }
  ipcMain.on('mcp:executor:to:main:ready', event => {
    if (event.sender !== executorWindow?.webContents || !readyRequest) return
    executorState = 'ready'
    clearTimeout(readyRequest.timer)
    readyRequest.resolve(undefined)
    readyRequest = null
  })
  ipcMain.on('mcp:executor:to:main:response', (event, response: unknown) => {
    if (event.sender !== executorWindow?.webContents || !isExecutorResponse(response)) {
      return
    }
    const pending = pendingRequests.get(response.requestId)
    if (!pending) {
      return
    }
    clearTimeout(pending.timer)
    pendingRequests.delete(response.requestId)
    if (response.error) pending.reject(new Error(response.error))
    else pending.resolve(response.result)
  })
  handlersRegistered = true
}
const rejectAllPending = (error: Error) => {
  if (readyRequest) {
    clearTimeout(readyRequest.timer)
    readyRequest.reject(error)
    readyRequest = null
  }
  pendingRequests.forEach((pending, requestId) => {
    clearTimeout(pending.timer)
    pending.reject(error)
    pendingRequests.delete(requestId)
  })
}
export const getMcpExecutorState = (): McpExecutorState => {
  return executorState
}
// 加载执行页面并等待数据桥接就绪
const loadExecutorPage = async (url: string): Promise<void> => {
  if (!executorWindow) throw new Error('EXECUTOR_NOT_READY')
  executorState = 'loading'
  const ready = new Promise<void>((resolve, reject) => {
    readyRequest = { resolve: () => resolve(), reject, timer: setTimeout(() => rejectAllPending(new Error('EXECUTOR_START_TIMEOUT')), requestTimeout) }
  })
  await Promise.all([executorWindow.loadURL(url), ready])
}
// 创建隐藏执行窗口并迁移旧来源数据
const initializeExecutor = async (): Promise<void> => {
  registerExecutorIpc()
  if (executorWindow && !executorWindow.isDestroyed()) {
    return
  }
  executorState = 'loading'
  const window = new BrowserWindow({
    show: false,
    skipTaskbar: true,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      backgroundThrottling: false,
    },
  })
  executorWindow = window
  const handleExecutorCrash = (reason: string) => {
    if (executorWindow !== window) return
    if (!window.isDestroyed()) window.destroy()
    executorWindow = null
    executorState = 'error'
    rejectAllPending(new Error(`MCP executor ${reason}`))
  }
  window.on('closed', () => {
    if (executorWindow !== window) return
    generation += 1
    executorWindow = null
    executorState = 'not-created'
    rejectAllPending(new Error('MCP executor closed'))
  })
  window.on('unresponsive', () => {
    handleExecutorCrash('unresponsive')
  })
  window.webContents.on('render-process-gone', (_event, details) => {
    handleExecutorCrash(`render-process-gone: ${details.reason}`)
  })
  try {
    let legacyData: McpLegacyData = []
    if (__COMMAND__ === 'build' && !legacyImported) {
      await loadExecutorPage('app://mcp.html?migration=1')
      legacyData = await sendExecutorRequest<McpLegacyData>('mcp:main:to:executor:export-legacy', {})
    }
    await loadExecutorPage(getExecutorUrl())
    if (__COMMAND__ === 'build' && !legacyImported) {
      await sendExecutorRequest('mcp:main:to:executor:import-legacy', legacyData)
      markLegacyMcpDataMigrated()
      legacyImported = true
    }
  } catch (error) {
    await destroyMcpExecutor()
    executorState = 'error'
    throw error
  }
}
// 复用执行窗口创建过程
export const createMcpExecutor = (path: string): Promise<void> => {
  preloadPath = path
  if (!creationPromise) creationPromise = initializeExecutor().finally(() => { creationPromise = null })
  return creationPromise
}
export const destroyMcpExecutor = async (): Promise<void> => {
  generation += 1
  rejectAllPending(new Error('MCP executor destroyed'))
  if (executorWindow && !executorWindow.isDestroyed()) {
    executorWindow.destroy()
  }
  executorWindow = null
  executorState = 'not-created'
}
const sendExecutorRequest = async <TResult>(channel: string, payload: unknown): Promise<TResult> => {
  if (!executorWindow || executorWindow.isDestroyed() || executorState !== 'ready') {
    throw new Error('EXECUTOR_NOT_READY')
  }
  const requestId = randomUUID()
  const resultPromise = new Promise<TResult>((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingRequests.delete(requestId)
      reject(new Error('TOOL_TIMEOUT'))
      void destroyMcpExecutor()
    }, requestTimeout)
    pendingRequests.set(requestId, {
      resolve: value => resolve(value as TResult),
      reject,
      timer,
    })
  })
  try {
    executorWindow.webContents.send(channel, { requestId, payload })
  } catch (error) {
    const pending = pendingRequests.get(requestId)
    if (pending) clearTimeout(pending.timer)
    pendingRequests.delete(requestId)
    pending?.reject(error instanceof Error ? error : new Error('EXECUTOR_SEND_FAILED'))
  }
  return resultPromise
}
export const listMcpExecutorTools = async (): Promise<McpToolDefinition[]> => {
  await createMcpExecutor(preloadPath)
  return sendExecutorRequest<McpToolDefinition[]>('mcp:main:to:executor:list-tools', {})
}
export const callMcpExecutorTool = (payload: McpToolCallPayload): Promise<McpToolCallResult> => {
  const requestGeneration = generation
  const result = toolQueue.then(async () => {
    if (requestGeneration !== generation) throw new Error('EXECUTOR_RESTARTED')
    await createMcpExecutor(preloadPath)
    return sendExecutorRequest<McpToolCallResult>('mcp:main:to:executor:call-tool', payload)
  })
  toolQueue = result.catch(() => undefined)
  return result
}
export const readMcpExecutorResource = async (payload: McpResourceReadPayload): Promise<McpResourceReadResult> => {
  await createMcpExecutor(preloadPath)
  return sendExecutorRequest<McpResourceReadResult>('mcp:main:to:executor:read-resource', payload)
}
