export type McpServerSettings = {
  enabled: boolean
  port: number
  readOnly?: boolean
  allowDestructive?: boolean
}
export type McpAccessPolicy = { readOnly: boolean; allowDestructive: boolean }
export type McpStoredSettings = McpServerSettings & McpAccessPolicy & { authToken: string }
export type McpLegacyData = { database: string; store: string; entries: { key: IDBValidKey; value: unknown }[] }[]
export type McpPendingRequest = {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
}
export type McpProtocolOptions = {
  listTools: () => Promise<McpToolDefinition[]>
  callTool: (name: string, args: Record<string, unknown>) => Promise<McpToolCallResult>
  readResource: (uri: string) => Promise<McpResourceReadResult>
  accessPolicy: McpAccessPolicy
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
  readOnly: boolean
  allowDestructive: boolean
  authToken: string
}
export type McpToolDefinition = {
  name: string
  description: string
  annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean }
  requiresConfirmation: boolean
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required: string[]
    additionalProperties?: boolean
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
