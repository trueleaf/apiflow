import { expect, test } from '@playwright/test'
import { simulateReadableStream, ToolLoopAgent } from 'ai'
import { MockLanguageModelV3 } from 'ai/test'
import { createAgentToolDefinitions, createAISDKTools, getActiveToolNames } from '../../../../src/main/ai/tools'
import { createProviderOptions } from '../../../../src/main/ai/provider'
import { normalizeLLMBaseURL } from '../../../../src/config/llmProviders'
import { mapAgentEventsToPanelMessages } from '../../../../src/renderer/store/ai/eventMapper'
import { parseAgentEvent, parseAgentRunRequest } from '../../../../src/shared/ai/validation'
import { redactAIValue } from '../../../../src/shared/ai/redaction'
import type { AgentEvent, AgentToolContext, LLMProviderSetting } from '../../../../src/types'

test('ToolLoopAgent 使用 ai/test 产生可控文本、reasoning 和完成流', async () => {
  const model = new MockLanguageModelV3({
    doStream: async () => ({
      stream: simulateReadableStream({ chunks: [
        { type: 'reasoning-start', id: 'reasoning-1' },
        { type: 'reasoning-delta', id: 'reasoning-1', delta: '分析' },
        { type: 'reasoning-end', id: 'reasoning-1' },
        { type: 'text-start', id: 'text-1' },
        { type: 'text-delta', id: 'text-1', delta: '完成' },
        { type: 'text-end', id: 'text-1' },
        { type: 'finish', finishReason: { unified: 'stop', raw: 'stop' }, logprobs: undefined, usage: { inputTokens: { total: 3, noCache: 3, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 4, text: 2, reasoning: 2 } } },
      ] }),
    }),
  })
  const agent = new ToolLoopAgent({ model, instructions: 'Reply briefly', maxRetries: 0 })
  const result = await agent.stream({ prompt: '测试' })
  const parts: string[] = []
  for await (const part of result.fullStream) parts.push(part.type)
  expect(parts).toEqual(expect.arrayContaining(['reasoning-start', 'reasoning-delta', 'reasoning-end', 'text-start', 'text-delta', 'text-end', 'finish']))
  expect(await result.text).toBe('完成')
  expect(await result.reasoningText).toBe('分析')
})

test('事件判别联合覆盖面板全部事件并合并乱序和重复工具状态', () => {
  const base = { conversationId: 'conversation-1', runId: 'run-1', messageId: 'message-1', createdAt: 100 }
  const events: AgentEvent[] = [
    { ...base, eventId: 'event-user', sequence: 0, type: 'user-message', text: '创建接口', language: 'zh-cn' },
    { ...base, eventId: 'event-running', sequence: 1, type: 'run-state', state: 'running' },
    { ...base, eventId: 'event-reasoning', sequence: 2, type: 'reasoning', phase: 'delta', text: '分析中' },
    { ...base, eventId: 'event-text', sequence: 3, type: 'text', phase: 'delta', text: '结果' },
    { ...base, eventId: 'event-tool-start', sequence: 4, type: 'tool', toolCallId: 'tool-1', toolName: 'searchNodes', title: 'Search nodes', state: 'running', input: { query: 'users' } },
    { ...base, eventId: 'event-tool-end', sequence: 5, type: 'tool', toolCallId: 'tool-1', toolName: 'searchNodes', title: 'Search nodes', state: 'success', displayData: { count: 1 } },
    { ...base, eventId: 'event-approval', sequence: 6, type: 'approval', approvalId: 'approval-1', toolCallId: 'tool-2', toolName: 'applyChangeSet', state: 'requested', changeSetId: 'change-1' },
    { ...base, eventId: 'event-source', sequence: 7, type: 'source-url', sourceId: 'source-1', title: 'Docs', url: 'https://example.com' },
    { ...base, eventId: 'event-document', sequence: 8, type: 'source-document', sourceId: 'document-1', title: 'Schema', mediaType: 'application/json' },
    { ...base, eventId: 'event-file', sequence: 9, type: 'file', mediaType: 'application/json', filename: 'result.json' },
    { ...base, eventId: 'event-change', sequence: 10, type: 'change-set', changeSetId: 'change-1', state: 'previewed', displayData: { items: [] } },
    { ...base, eventId: 'event-invocation', sequence: 11, type: 'invocation', invocationId: 'invocation-1', title: 'Design agent', state: 'interrupted', error: 'stopped' },
    { ...base, eventId: 'event-compact', sequence: 12, type: 'compacting', state: 'end', removedEventCount: 2 },
    { ...base, eventId: 'event-finish', sequence: 13, type: 'finish', finishReason: 'stop', usage: { totalTokens: 7 } },
    { ...base, eventId: 'event-error', sequence: 14, type: 'error', errorCode: 'TEST', message: 'retry', retryable: true },
    { ...base, eventId: 'event-abort', sequence: 15, type: 'abort', reason: 'user' },
    { ...base, eventId: 'event-complete', sequence: 16, type: 'run-state', state: 'completed' },
  ]
  for (const event of events) expect(parseAgentEvent(event)).toEqual(event)
  const messages = mapAgentEventsToPanelMessages(events)
  expect(messages.filter(message => message.kind === 'tool')).toHaveLength(1)
  expect(messages.find(message => message.kind === 'tool')).toMatchObject({ state: 'success', output: { count: 1 } })
  expect(new Set(messages.map(message => message.kind))).toEqual(new Set(['user', 'run-state', 'assistant', 'tool', 'approval', 'source', 'file', 'change-set', 'invocation', 'compacting', 'finish', 'error', 'abort']))
  expect(() => parseAgentEvent({ ...base, eventId: 'unknown', sequence: 17, type: 'unknown-event' })).toThrow()
})

test('工具 schema、审批、上下文筛选和 Provider contract 保持高语义边界', async () => {
  const calls: string[] = []
  const definitions = createAgentToolDefinitions(async name => { calls.push(name); return { success: true, summary: 'ok' } })
  const controller = new AbortController()
  const context: AgentToolContext = { projectId: 'project-1', activeNodeId: 'http-1', activeTabType: 'http', language: 'zh-cn', networkMode: 'offline', abortSignal: controller.signal, conversationId: 'conversation-1', runId: 'run-1' }
  const tools = createAISDKTools(definitions, context)
  expect(Object.keys(tools)).toContain('applyChangeSet')
  expect(getActiveToolNames(definitions, context)).toContain('sendHttpRequest')
  expect(getActiveToolNames(definitions, context)).not.toContain('manageWebSocketConnection')
  expect(definitions.find(item => item.name === 'applyChangeSet')?.requiresApproval).toBe(true)
  expect(definitions.find(item => item.name === 'createDesignChange')?.inputSchema.safeParse({ targetProjectId: null, title: 'Create', operations: [{ type: 'createNode', nodeType: 'http', name: 'Users', data: { method: 'GET', url: 'https://example.com' } }] }).success).toBe(true)
  expect(definitions.find(item => item.name === 'updateDesignChange')?.inputSchema.safeParse({ targetProjectId: 'project-1', title: 'Bad', operations: [{ type: 'updateNode', projectId: 'project-1', nodeId: 'node-1', patch: { unknown: true } }] }).success).toBe(false)
  expect(normalizeLLMBaseURL('https://api.deepseek.com/chat/completions')).toBe('https://api.deepseek.com')
  const provider: LLMProviderSetting = { id: 'deepseek', name: 'DeepSeek', provider: 'OpenAICompatible', vendor: 'deepseek', apiKey: 'secret', baseURL: 'https://api.deepseek.com', model: 'deepseek-v4-pro', customHeaders: [], extraBody: '', thinkingMode: 'enabled', reasoningEffort: 'high', thinkingBudget: null, maxTokens: 1024 }
  expect(createProviderOptions(provider)).toMatchObject({ deepseek: { thinking: { type: 'enabled' }, reasoningEffort: 'high' } })
  expect(() => parseAgentRunRequest({ conversationId: 'c', runId: 'r', messageId: 'm', mode: 'agent', prompt: 'x', history: [], context: { ...context, abortSignal: undefined, conversationId: undefined, runId: undefined }, provider: { ...provider, extra: true } })).toThrow()
  expect(redactAIValue({ headers: [{ key: 'X-API-Key', value: 'visible-secret' }], variable: { name: 'password', value: 'visible-secret' } })).toEqual({ headers: [{ key: '[REDACTED]', value: '[REDACTED]' }], variable: { name: 'password', value: '[REDACTED]' } })
  expect(calls).toEqual([])
})
