import { BrowserWindow, ipcMain } from 'electron'
import { randomUUID } from 'node:crypto'
import type {
  McpExecutorState,
  McpResourceReadPayload,
  McpResourceReadResult,
  McpToolCallPayload,
  McpToolCallResult,
  McpToolDefinition,
} from '@src/types/mcp'

type PendingRequest = {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
}
type ExecutorResponse = {
  requestId: string
  result: unknown
}
let executorWindow: BrowserWindow | null = null
let executorState: McpExecutorState = 'not-created'
let handlersRegistered = false
const pendingRequests = new Map<string, PendingRequest>()
const requestTimeout = 30000
const isExecutorResponse = (value: unknown): value is ExecutorResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const payload = value as Record<string, unknown>
  return typeof payload.requestId === 'string' && 'result' in payload
}
const getExecutorUrl = (): string => {
  return __COMMAND__ === 'build' ? 'app://mcp.html' : 'http://localhost:4000/mcp.html'
}
const registerExecutorIpc = () => {
  if (handlersRegistered) {
    return
  }
  ipcMain.on('mcp:executor:to:main:ready', () => {
    executorState = 'ready'
  })
  ipcMain.on('mcp:executor:to:main:state-changed', (_, state: McpExecutorState) => {
    executorState = state
  })
  ipcMain.on('mcp:executor:to:main:response', (_, response: unknown) => {
    if (!isExecutorResponse(response)) {
      return
    }
    const pending = pendingRequests.get(response.requestId)
    if (!pending) {
      return
    }
    clearTimeout(pending.timer)
    pendingRequests.delete(response.requestId)
    pending.resolve(response.result)
  })
  handlersRegistered = true
}
const rejectAllPending = (error: Error) => {
  pendingRequests.forEach((pending, requestId) => {
    clearTimeout(pending.timer)
    pending.reject(error)
    pendingRequests.delete(requestId)
  })
}
export const getMcpExecutorState = (): McpExecutorState => {
  return executorState
}
export const createMcpExecutor = async (preloadPath: string): Promise<void> => {
  registerExecutorIpc()
  if (executorWindow && !executorWindow.isDestroyed()) {
    return
  }
  executorState = 'loading'
  executorWindow = new BrowserWindow({
    show: false,
    skipTaskbar: true,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: true,
    },
  })
  const handleExecutorCrash = (reason: string) => {
    if (executorWindow && !executorWindow.isDestroyed()) {
      executorWindow.destroy()
    }
    executorWindow = null
    executorState = 'error'
    rejectAllPending(new Error(`MCP executor ${reason}`))
  }
  executorWindow.on('closed', () => {
    executorWindow = null
    executorState = 'not-created'
    rejectAllPending(new Error('MCP executor closed'))
  })
  executorWindow.on('unresponsive', () => {
    handleExecutorCrash('unresponsive')
  })
  executorWindow.on('render-process-gone', (_event, details) => {
    handleExecutorCrash(`render-process-gone: ${details.reason}`)
  })
  await executorWindow.loadURL(getExecutorUrl())
}
export const destroyMcpExecutor = async (): Promise<void> => {
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
    }, requestTimeout)
    pendingRequests.set(requestId, {
      resolve: value => resolve(value as TResult),
      reject,
      timer,
    })
  })
  executorWindow.webContents.send(channel, { requestId, payload })
  return resultPromise
}
export const listMcpExecutorTools = async (): Promise<McpToolDefinition[]> => {
  return sendExecutorRequest<McpToolDefinition[]>('mcp:main:to:executor:list-tools', {})
}
export const callMcpExecutorTool = async (payload: McpToolCallPayload): Promise<McpToolCallResult> => {
  return sendExecutorRequest<McpToolCallResult>('mcp:main:to:executor:call-tool', payload)
}
export const readMcpExecutorResource = async (payload: McpResourceReadPayload): Promise<McpResourceReadResult> => {
  return sendExecutorRequest<McpResourceReadResult>('mcp:main:to:executor:read-resource', payload)
}
