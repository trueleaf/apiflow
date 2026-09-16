import { createDeepSeek, type DeepSeekLanguageModelOptions } from '@ai-sdk/deepseek'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModel } from 'ai'
import type { ProviderOptions } from '@ai-sdk/provider-utils'
import { normalizeLLMBaseURL, resolveLLMProvider } from '@src/config/llmProviders'
import type { LLMProviderSetting } from '@src/types/ai/agent.type'
import { createTestLanguageModel } from './testModel'

const reservedBodyKeys = new Set(['model', 'messages', 'stream', 'tools', 'tool_choice', 'response_format'])
// 解析并过滤自定义请求体
export const parseSafeExtraBody = (extraBody: string): Record<string, unknown> => {
  if (!extraBody.trim()) return {}
  const parsed: unknown = JSON.parse(extraBody)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('额外请求体必须是有效的 JSON 对象')
  return Object.fromEntries(Object.entries(parsed).filter(([key]) => !reservedBodyKeys.has(key)))
}
// 转换自定义请求头
const getCustomHeaders = (config: LLMProviderSetting): Record<string, string> => Object.fromEntries(config.customHeaders.filter(item => item.key.trim()).map(item => [item.key.trim(), item.value]))
// 创建 AI SDK 模型
export const createLanguageModel = (setting: LLMProviderSetting): LanguageModel => {
  const config = resolveLLMProvider(setting)
  if (process.env.NODE_ENV === 'test' && config.vendor === 'custom' && new URL(config.baseURL).hostname === 'ai.test' && config.model.startsWith('ai-test-')) return createTestLanguageModel(config.model)
  if (config.vendor === 'deepseek') {
    return createDeepSeek({ apiKey: config.apiKey, baseURL: normalizeLLMBaseURL(config.baseURL) })(config.model)
  }
  const extraBody = config.vendor === 'custom' ? parseSafeExtraBody(config.extraBody) : {}
  const provider = createOpenAICompatible({
    name: config.vendor === 'qwen' ? 'qwen' : 'custom',
    apiKey: config.apiKey || undefined,
    baseURL: normalizeLLMBaseURL(config.baseURL),
    headers: config.vendor === 'custom' ? getCustomHeaders(config) : undefined,
    includeUsage: true,
    transformRequestBody: config.vendor === 'custom' ? body => ({ ...extraBody, ...body }) : undefined,
  })
  return provider(config.model)
}
// 创建 Provider 运行参数
export const createProviderOptions = (setting: LLMProviderSetting): ProviderOptions | undefined => {
  const config = resolveLLMProvider(setting)
  if (config.vendor === 'deepseek') {
    const options: DeepSeekLanguageModelOptions = {}
    if (config.thinkingMode !== 'default') options.thinking = { type: config.thinkingMode }
    if (config.reasoningEffort !== 'default') options.reasoningEffort = config.reasoningEffort
    return { deepseek: options }
  }
  const options: Record<string, boolean | number> = {}
  if (config.vendor === 'qwen' && config.thinkingMode !== 'default') options.enable_thinking = config.thinkingMode === 'enabled'
  if (config.vendor === 'qwen' && config.thinkingBudget !== null) options.thinking_budget = config.thinkingBudget
  return Object.keys(options).length > 0 ? { qwen: options } : undefined
}
