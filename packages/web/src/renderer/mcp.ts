import { listMcpTools, callMcpTool } from './mcp/toolRegistry'
import { readMcpResource } from './mcp/resourceRegistry'
import type { McpResourceReadPayload, McpToolCallPayload } from '@src/types/mcp'
import './i18n'

type ExecutorRequest<TPayload> = {
  requestId: string
  payload: TPayload
}
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
const isExecutorRequest = <TPayload>(value: unknown): value is ExecutorRequest<TPayload> => {
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
  const result = await callMcpTool(message.payload)
  sendResponse(message.requestId, result)
})
window.electronAPI?.ipcManager.onMain('mcp:main:to:executor:read-resource', async (message: unknown) => {
  if (!isExecutorRequest<McpResourceReadPayload>(message)) {
    return
  }
  const result = await readMcpResource(message.payload.uri)
  sendResponse(message.requestId, result)
})
window.electronAPI?.ipcManager.sendToMain('mcp:executor:to:main:ready')
