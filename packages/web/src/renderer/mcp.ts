import { listMcpTools, callMcpTool } from './mcp/toolRegistry'
import { readMcpResource } from './mcp/resourceRegistry'
import type { McpResourceReadPayload, McpToolCallPayload } from '@src/types/mcp'
import type { McpLegacyData } from '@src/types/mcp'
import { exportLegacyMcpData, importLegacyMcpData } from './mcp/legacyMigration'
import './i18n'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
const isExecutorRequest = <TPayload>(value: unknown): value is { requestId: string; payload: TPayload } => {
  if (!isRecord(value)) {
    return false
  }
  return typeof value.requestId === 'string' && 'payload' in value
}
const sendResponse = (requestId: string, result: unknown) => {
  window.electronAPI?.ipcManager.sendToMain('mcp:executor:to:main:response', {
    requestId,
    result,
  })
}
// 捕获执行异常并将失败返回主进程
const executeRequest = async (requestId: string, execute: () => Promise<unknown>) => {
  try {
    sendResponse(requestId, await execute())
  } catch (error) {
    window.electronAPI?.ipcManager.sendToMain('mcp:executor:to:main:response', { requestId, error: error instanceof Error ? error.message : 'EXECUTOR_FAILED' })
  }
}
window.electronAPI?.ipcManager.onMain('mcp:main:to:executor:list-tools', (message: unknown) => {
  if (!isExecutorRequest<Record<string, never>>(message)) {
    return
  }
  sendResponse(message.requestId, listMcpTools())
})
window.electronAPI?.ipcManager.onMain('mcp:main:to:executor:call-tool', async (message: unknown) => {
  if (!isExecutorRequest<McpToolCallPayload>(message)) {
    return
  }
  await executeRequest(message.requestId, () => callMcpTool(message.payload))
})
window.electronAPI?.ipcManager.onMain('mcp:main:to:executor:read-resource', async (message: unknown) => {
  if (!isExecutorRequest<McpResourceReadPayload>(message)) {
    return
  }
  await executeRequest(message.requestId, () => readMcpResource(message.payload.uri))
})
window.electronAPI?.ipcManager.onMain('mcp:main:to:executor:export-legacy', async (message: unknown) => {
  if (!isExecutorRequest(message) || location.hostname !== 'mcp.html') return
  await executeRequest(message.requestId, exportLegacyMcpData)
})
window.electronAPI?.ipcManager.onMain('mcp:main:to:executor:import-legacy', async (message: unknown) => {
  if (!isExecutorRequest<McpLegacyData>(message) || !Array.isArray(message.payload)) return
  await executeRequest(message.requestId, () => importLegacyMcpData(message.payload))
})
window.electronAPI?.ipcManager.sendToMain('mcp:executor:to:main:ready')
