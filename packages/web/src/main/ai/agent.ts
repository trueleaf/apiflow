import { generateText, jsonSchema, Output, streamText, tool, type ModelMessage, type ToolSet } from 'ai'
import { ipcMain, type WebContentsView } from 'electron'
import { IPC_EVENTS } from '@src/types/ipc'
import { getLLMConfigError, getLLMRequestError, resolveLLMProvider } from '../../config/llmProviders'
import type { ChatRequestBody, ChatStreamCallbacks, LLMessage, LLMProviderSetting, OpenAiResponseBody } from '@src/types/ai/agent.type'
import { createLanguageModel, createProviderOptions } from './provider'
import { parseAIRequestId, parseChatRequestBody, parseLLMProviderSetting } from '@src/shared/ai/validation'

const requestTimeout = 60_000
// 转换兼容消息
const toModelMessages = (messages: LLMessage[]): ModelMessage[] => messages.map(message => ({ role: message.role, content: message.content }) as ModelMessage)
// 创建兼容 SSE 数据
const createSSEChunk = (content: string, reasoning = false): Uint8Array => new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ index: 0, delta: reasoning ? { reasoning_content: content } : { content } }] })}\n\n`)
// 创建兼容工具调用 SSE 数据
const createSSEToolChunk = (toolCallId: string, toolName?: string, argumentsDelta?: string): Uint8Array => new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ index: 0, delta: { tool_calls: [{ index: 0, id: toolCallId, type: 'function', function: { ...(toolName ? { name: toolName } : {}), ...(argumentsDelta ? { arguments: argumentsDelta } : {}) } }] } }] })}\n\n`)
// 转换兼容工具声明
const createCompatibleTools = (body: ChatRequestBody): ToolSet | undefined => body.tools?.length ? Object.fromEntries(body.tools.map(item => [item.function.name, tool({ description: item.function.description, inputSchema: jsonSchema(item.function.parameters) })])) : undefined
export class LLMClient {
  private config: LLMProviderSetting | null = null
  private networkMode: 'offline' | 'online' = 'offline'
  private initialized = false
  private readonly streams = new Map<string, { abort: () => void }>()
  // 初始化兼容聊天 IPC
  init(contentView: WebContentsView): void {
    if (this.initialized) return
    this.initialized = true
    ipcMain.on(IPC_EVENTS.ai.rendererToMain.updateConfig, (_event, value: unknown) => { try { this.updateConfig(parseLLMProviderSetting(value)) } catch { /* 忽略无效配置 */ } })
    ipcMain.handle(IPC_EVENTS.ai.rendererToMain.chat, (_event, body: unknown, config?: unknown) => this.chat(parseChatRequestBody(body), config === undefined ? undefined : parseLLMProviderSetting(config)))
    ipcMain.on(IPC_EVENTS.ai.rendererToMain.chatStreamStart, (_event, requestIdValue: unknown, bodyValue: unknown, configValue?: unknown) => {
      let requestId: string
      let body: ChatRequestBody
      let config: LLMProviderSetting | undefined
      try {
        requestId = parseAIRequestId(requestIdValue)
        body = parseChatRequestBody(bodyValue)
        config = configValue === undefined ? undefined : parseLLMProviderSetting(configValue)
      } catch {
        return
      }
      const stream = this.chatStream(body, { onData: chunk => contentView.webContents.send(IPC_EVENTS.ai.mainToRenderer.chatStreamChunk, requestId, chunk), onEnd: () => { this.streams.delete(requestId); contentView.webContents.send(IPC_EVENTS.ai.mainToRenderer.chatStreamEnd, requestId) }, onError: error => { this.streams.delete(requestId); contentView.webContents.send(IPC_EVENTS.ai.mainToRenderer.chatStreamError, requestId, error instanceof Error ? error.message : String(error)) } }, config)
      this.streams.set(requestId, stream)
    })
    ipcMain.on(IPC_EVENTS.ai.rendererToMain.chatStreamAbort, (_event, value: unknown) => { try { const requestId = parseAIRequestId(value); this.streams.get(requestId)?.abort(); this.streams.delete(requestId) } catch { /* 忽略无效请求 */ } })
  }
  // 更新配置
  updateConfig(newConfig: LLMProviderSetting): void { this.config = newConfig }
  // 更新网络模式
  setNetworkMode(mode: 'offline' | 'online'): void {
    this.networkMode = mode
    if (mode === 'online') { for (const stream of this.streams.values()) stream.abort(); this.streams.clear() }
  }
  // 获取可执行配置
  private getConfig(override?: LLMProviderSetting): LLMProviderSetting {
    if (this.networkMode !== 'offline') throw new Error('AI_OFFLINE_ONLY')
    if (!override && !this.config) throw new Error('LLM 配置未初始化，请先配置 Base URL 和 Model')
    const config = resolveLLMProvider(override ?? this.config as LLMProviderSetting)
    const validationError = getLLMConfigError(config)
    if (validationError) throw new Error(validationError)
    return config
  }
  // 非流式聊天
  async chat(body: ChatRequestBody, override?: LLMProviderSetting): Promise<OpenAiResponseBody> {
    const config = this.getConfig(override)
    try {
      const result = await generateText({ model: createLanguageModel(config), messages: toModelMessages(body.messages), tools: createCompatibleTools(body), output: body.response_format?.type === 'json_object' ? Output.json() : Output.text(), temperature: body.temperature, topP: body.top_p, maxOutputTokens: body.max_tokens ?? config.maxTokens ?? undefined, providerOptions: createProviderOptions(config), maxRetries: 1, timeout: { totalMs: requestTimeout } })
      const content = typeof result.output === 'string' ? result.output : JSON.stringify(result.output)
      const toolCalls = [...new Map(result.toolCalls.map(call => [call.toolCallId, { id: call.toolCallId, type: 'function' as const, function: { name: call.toolName, arguments: JSON.stringify(call.input) ?? '{}' } }])).values()]
      return { id: result.response.id, object: 'chat.completion', created: Date.now(), model: config.model, choices: [{ index: 0, message: { role: 'assistant', content, reasoning_content: result.reasoningText, ...(toolCalls.length ? { tool_calls: toolCalls } : {}) }, finish_reason: result.finishReason === 'length' ? 'length' : result.finishReason === 'content-filter' ? 'content_filter' : result.finishReason === 'tool-calls' ? 'tool_calls' : 'stop' }], usage: { prompt_tokens: result.usage.inputTokens ?? 0, completion_tokens: result.usage.outputTokens ?? 0, total_tokens: result.usage.totalTokens ?? 0 } }
    } catch (error) {
      throw new Error(getLLMRequestError(error, config))
    }
  }
  // 流式聊天
  chatStream(body: ChatRequestBody, callbacks: ChatStreamCallbacks, override?: LLMProviderSetting): { abort: () => void } {
    const abortController = new AbortController()
    let config: LLMProviderSetting
    try { config = this.getConfig(override) } catch (error) { callbacks.onError(error instanceof Error ? error : new Error(String(error))); return { abort: () => abortController.abort() } }
    void (async () => {
      try {
        const result = streamText({ model: createLanguageModel(config), messages: toModelMessages(body.messages), tools: createCompatibleTools(body), output: body.response_format?.type === 'json_object' ? Output.json() : Output.text(), temperature: body.temperature, topP: body.top_p, maxOutputTokens: body.max_tokens ?? config.maxTokens ?? undefined, providerOptions: createProviderOptions(config), maxRetries: 1, timeout: { totalMs: requestTimeout }, abortSignal: abortController.signal })
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') callbacks.onData(createSSEChunk(part.text))
          if (part.type === 'reasoning-delta') callbacks.onData(createSSEChunk(part.text, true))
          if (part.type === 'tool-input-start') callbacks.onData(createSSEToolChunk(part.id, part.toolName))
          if (part.type === 'tool-input-delta') callbacks.onData(createSSEToolChunk(part.id, undefined, part.delta))
          if (part.type === 'error') throw part.error
        }
        callbacks.onData(new TextEncoder().encode('data: [DONE]\n\n'))
        callbacks.onEnd()
      } catch (error) {
        if (abortController.signal.aborted) { callbacks.onEnd(); return }
        callbacks.onError(new Error(getLLMRequestError(error, config)))
      }
    })()
    return { abort: () => abortController.abort() }
  }
}
export const globalLLMClient = new LLMClient()
