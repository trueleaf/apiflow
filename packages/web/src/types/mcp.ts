export type McpServerSettings = {
  enabled: boolean
  port: number
}
export type McpServerState = 'stopped' | 'starting' | 'running' | 'error'
export type McpExecutorState = 'not-created' | 'loading' | 'ready' | 'error'
export type McpStatus = {
  enabled: boolean
  port: number
  endpoint: string
  serverState: McpServerState
  executorState: McpExecutorState
  errorCode: string
  errorMessage: string
}
export type McpToolDefinition = {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required: string[]
  }
}
export type McpToolCallPayload = {
  name: string
  arguments: Record<string, unknown>
}
export type McpToolCallResult = {
  code: number
  data?: unknown
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
export type McpResourceReadPayload = {
  uri: string
}
export type McpResourceReadResult = {
  code: number
  data?: unknown
  error?: {
    code: string
    message: string
  }
}
