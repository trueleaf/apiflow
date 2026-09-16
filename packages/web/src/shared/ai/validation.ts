import { z } from 'zod'
import type { AgentAbortRequest, AgentApprovalResponseRequest, AgentClientToolResult, AgentEvent, AgentRunRequest } from '@src/types/ai'
import type { ChatRequestBody, LLMProviderSetting } from '@src/types/ai/agent.type'

const identifierSchema = z.string().trim().min(1).max(160)
const languageSchema = z.union([z.literal('zh-cn'), z.literal('zh-tw'), z.literal('en'), z.literal('ja')])
const networkModeSchema = z.union([z.literal('offline'), z.literal('online')])
const providerSchema = z.object({
  id: identifierSchema,
  name: z.string().max(200),
  provider: z.literal('OpenAICompatible'),
  vendor: z.union([z.literal('deepseek'), z.literal('qwen'), z.literal('custom')]).optional(),
  apiKey: z.string().max(20000),
  baseURL: z.string().url().max(2048),
  model: z.string().trim().min(1).max(256),
  customHeaders: z.array(z.object({ key: z.string().max(256), value: z.string().max(20000) }).strict()).max(50),
  extraBody: z.string().max(100000),
  thinkingMode: z.union([z.literal('default'), z.literal('enabled'), z.literal('disabled')]),
  reasoningEffort: z.union([z.literal('default'), z.literal('low'), z.literal('high'), z.literal('max')]),
  thinkingBudget: z.number().int().positive().nullable(),
  maxTokens: z.number().int().positive().nullable(),
}).strict()
const runtimeContextSchema = z.object({
  projectId: identifierSchema.nullable(),
  activeNodeId: identifierSchema.nullable(),
  activeTabType: z.string().max(100).nullable(),
  language: languageSchema,
  networkMode: networkModeSchema,
}).strict()
const runRequestSchema = z.object({
  conversationId: identifierSchema,
  runId: identifierSchema,
  messageId: identifierSchema,
  mode: z.union([z.literal('agent'), z.literal('ask')]),
  prompt: z.string().trim().min(1).max(100000),
  history: z.array(z.object({ role: z.union([z.literal('user'), z.literal('assistant')]), content: z.string().max(100000) }).strict()).max(100),
  context: runtimeContextSchema,
  provider: providerSchema,
}).strict()
const chatRequestSchema = z.object({
  messages: z.array(z.object({ role: z.union([z.literal('system'), z.literal('user'), z.literal('assistant'), z.literal('tool')]), content: z.string().max(100000), reasoning_content: z.string().max(100000).optional(), tool_calls: z.array(z.object({ id: identifierSchema, type: z.literal('function'), function: z.object({ name: z.string().max(128), arguments: z.string().max(100000) }).strict() }).strict()).max(100).optional(), tool_call_id: identifierSchema.optional() }).strict()).min(1).max(200),
  max_tokens: z.number().int().positive().max(1000000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  tools: z.array(z.object({ type: z.literal('function'), function: z.object({ name: z.string().max(128), description: z.string().max(10000).optional(), parameters: z.record(z.string(), z.unknown()) }).strict() }).strict()).max(100).optional(),
  response_format: z.object({ type: z.union([z.literal('json_object'), z.literal('text')]) }).strict().optional(),
}).strict()
const abortRequestSchema = z.object({ conversationId: identifierSchema, runId: identifierSchema }).strict()
const approvalResponseSchema = z.object({
  conversationId: identifierSchema,
  runId: identifierSchema,
  messageId: identifierSchema,
  approvalId: identifierSchema,
  toolCallId: identifierSchema,
  approved: z.boolean(),
  reason: z.string().max(2000).optional(),
}).strict()
const toolResultSchema = z.object({
  conversationId: identifierSchema,
  runId: identifierSchema,
  messageId: identifierSchema,
  commandId: identifierSchema,
  toolCallId: identifierSchema,
  result: z.object({
    success: z.boolean(),
    errorCode: z.string().max(160).optional(),
    retryable: z.boolean().optional(),
    summary: z.string().max(10000),
    displayData: z.unknown().optional(),
    modelData: z.unknown().optional(),
    changeSetId: identifierSchema.optional(),
  }).strict(),
}).strict()
const eventBaseShape = {
  eventId: identifierSchema,
  conversationId: identifierSchema,
  runId: identifierSchema,
  messageId: identifierSchema,
  sequence: z.number().int().nonnegative(),
  createdAt: z.number().int().nonnegative(),
}
const runStateSchema = z.union([z.literal('queued'), z.literal('running'), z.literal('waiting_client_tool'), z.literal('waiting_approval'), z.literal('waiting_user_input'), z.literal('cancelling'), z.literal('completed'), z.literal('cancelled'), z.literal('failed'), z.literal('interrupted')])
const toolStateSchema = z.union([z.literal('created'), z.literal('running'), z.literal('success'), z.literal('denied'), z.literal('responded'), z.literal('error')])
const approvalStateSchema = z.union([z.literal('requested'), z.literal('approved'), z.literal('denied'), z.literal('expired')])
const eventSchema = z.discriminatedUnion('type', [
  z.object({ ...eventBaseShape, type: z.literal('user-message'), text: z.string().max(100000), language: languageSchema }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('run-state'), state: runStateSchema, detail: z.string().max(10000).optional() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('text'), phase: z.union([z.literal('start'), z.literal('delta'), z.literal('end')]), text: z.string().max(100000) }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('reasoning'), phase: z.union([z.literal('start'), z.literal('delta'), z.literal('end')]), text: z.string().max(100000) }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('step-start'), step: z.number().int().positive() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('tool'), toolCallId: identifierSchema, toolName: z.string().max(128), title: z.string().max(256), state: toolStateSchema, input: z.record(z.string(), z.unknown()).optional(), inputText: z.string().max(100000).optional(), displayData: z.unknown().optional(), error: z.string().max(10000).optional(), approvalId: identifierSchema.optional(), changeSetId: identifierSchema.optional() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('approval'), toolCallId: identifierSchema, toolName: z.string().max(128), approvalId: identifierSchema, state: approvalStateSchema, approved: z.boolean().optional(), reason: z.string().max(2000).optional(), changeSetId: identifierSchema.optional(), displayData: z.unknown().optional() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('source-url'), sourceId: identifierSchema, url: z.string().max(10000), title: z.string().max(2000).optional() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('source-document'), sourceId: identifierSchema, mediaType: z.string().max(256), title: z.string().max(2000), filename: z.string().max(2000).optional() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('file'), mediaType: z.string().max(256), filename: z.string().max(2000).optional(), url: z.string().max(10000).optional() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('error'), errorCode: z.string().max(160), message: z.string().max(10000), retryable: z.boolean() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('finish'), finishReason: z.string().max(160), usage: z.object({ inputTokens: z.number().nonnegative().optional(), outputTokens: z.number().nonnegative().optional(), totalTokens: z.number().nonnegative().optional(), reasoningTokens: z.number().nonnegative().optional() }).strict() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('abort'), reason: z.string().max(2000).optional() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('client-tool-command'), commandId: identifierSchema, toolCallId: identifierSchema, toolName: z.string().max(128), input: z.record(z.string(), z.unknown()) }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('conversation-updated'), title: z.string().max(2000).optional() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('change-set'), changeSetId: identifierSchema, state: z.string().max(80), displayData: z.unknown().optional() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('invocation'), invocationId: identifierSchema, title: z.string().max(2000), state: z.union([z.literal('pending'), z.literal('running'), z.literal('completed'), z.literal('failed'), z.literal('interrupted')]), output: z.unknown().optional(), error: z.string().max(10000).optional() }).strict(),
  z.object({ ...eventBaseShape, type: z.literal('compacting'), state: z.union([z.literal('start'), z.literal('end')]), removedEventCount: z.number().int().nonnegative().optional() }).strict(),
])

// 校验 Agent 启动请求
export const parseAgentRunRequest = (value: unknown): AgentRunRequest => runRequestSchema.parse(value) as AgentRunRequest
// 校验 Agent 取消请求
export const parseAgentAbortRequest = (value: unknown): AgentAbortRequest => abortRequestSchema.parse(value)
// 校验 Agent 审批响应
export const parseAgentApprovalResponse = (value: unknown): AgentApprovalResponseRequest => approvalResponseSchema.parse(value)
// 校验 client tool 执行结果
export const parseAgentClientToolResult = (value: unknown): AgentClientToolResult => toolResultSchema.parse(value)
// 校验 Agent 事件信封
export const parseAgentEvent = (value: unknown): AgentEvent => eventSchema.parse(value) as AgentEvent
// 校验兼容聊天配置
export const parseLLMProviderSetting = (value: unknown): LLMProviderSetting => providerSchema.parse(value) as LLMProviderSetting
// 校验兼容聊天请求
export const parseChatRequestBody = (value: unknown): ChatRequestBody => chatRequestSchema.parse(value) as ChatRequestBody
// 校验 IPC 请求标识
export const parseAIRequestId = (value: unknown): string => identifierSchema.parse(value)
