// Provider type
export type AIProviderType = 'openai' | 'azure' | 'anthropic' | 'google' | 'deepseek' | 'custom'

// Response format
export type AIResponseFormat = 'text' | 'json' | 'json_schema'

// Model parameters
export interface AIModelParams {
  temperature?: number
  topP?: number
  topK?: number
  maxTokens?: number
  frequencyPenalty?: number
  presencePenalty?: number
  responseFormat?: AIResponseFormat
  stop?: string[]
}

// Retry config
export interface AIRetryConfig {
  enabled: boolean
  maxRetries: number
  delayMs: number
  backoffMultiplier: number
}

// Proxy config
export interface AIProxyConfig {
  enabled: boolean
  protocol: 'http' | 'https' | 'socks5'
  host: string
  port: number
  username?: string
  password?: string
}

// Advanced config
export interface AIAdvancedConfig {
  timeout: number
  retry: AIRetryConfig
  proxy?: AIProxyConfig
  customHeaders?: Record<string, string>
}

// Base model config
export interface AIModelConfig {
  id: string
  name: string
  provider: AIProviderType
  model: string
  apiKey: string
  apiUrl: string
  enabled: boolean
  isDefault?: boolean
  createdAt: number
  updatedAt: number
}

// Azure specific config
export interface AIAzureConfig {
  resourceName: string
  deploymentId: string
  apiVersion: string
}

// Custom provider config
export interface AICustomConfig {
  requestFormat: 'openai-compatible' | 'custom'
  requestBodyTemplate?: string
  responseBodyPath?: string
}

// Complete AI config
export interface AIConfig {
  base: AIModelConfig
  params: AIModelParams
  advanced: AIAdvancedConfig
  azure?: AIAzureConfig
  custom?: AICustomConfig
}

// Config list
export interface AIConfigList {
  configs: AIConfig[]
  defaultConfigId?: string
}
