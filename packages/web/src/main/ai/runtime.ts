import { randomUUID } from 'node:crypto'
import { ipcMain, type IpcMainInvokeEvent, type WebContentsView } from 'electron'
import { streamText, ToolLoopAgent, stepCountIs, type ModelMessage, type TextStreamPart, type ToolSet } from 'ai'
import { IPC_EVENTS } from '@src/types/ipc'
import { getLLMConfigError, getLLMRequestError } from '@src/config/llmProviders'
import type { AgentAbortRequest, AgentApprovalResponseRequest, AgentClientToolResult, AgentEvent, AgentRunRequest, AgentRunResponse, AgentToolContext, AgentToolResult } from '@src/types/ai'
import { parseAgentAbortRequest, parseAgentApprovalResponse, parseAgentClientToolResult, parseAgentRunRequest } from '@src/shared/ai/validation'
import { redactAIText, redactAIValue } from '@src/shared/ai/redaction'
import { createLanguageModel, createProviderOptions } from './provider'
import { createAgentToolDefinitions, createAISDKTools, getActiveToolNames } from './tools'

import type { PendingClientTool, RunRecord, AgentEventData, AgentRuntimeResource } from '@src/types/ai/agentInternals'

const clientToolTimeout = 30_000
const requestTimeout = 120_000
const maxSteps = 12
const hardMaxSteps = 20
const readToolNames = new Set(['getWorkspaceContext', 'searchProjects', 'searchNodes', 'listNodeTree', 'getNodeDetail', 'getDeletedNodes', 'previewChangeSet'])
const proposalToolNames = new Set(['createDesignChange', 'updateDesignChange', 'moveNodesChange', 'deleteNodesChange', 'restoreNodesChange', 'updateVariablesChange', 'updateCommonHeadersChange'])
// 转换消息历史
const toModelMessages = (request: AgentRunRequest): ModelMessage[] => [...request.history.map(message => ({ role: message.role, content: message.content }) as ModelMessage), { role: 'user', content: request.prompt }]
// 获取安全错误信息
const getSafeError = (error: unknown, secrets: string[]): string => redactAIText(error instanceof Error ? error.message : String(error), secrets)
// 提取工具输入对象
const toInputRecord = (input: unknown): Record<string, unknown> => input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {}
// 收集可信执行结果中的标识
const collectKnownIds = (value: unknown, knownIds: Set<string>): void => {
  if (Array.isArray(value)) { for (const item of value) collectKnownIds(item, knownIds); return }
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    if ((key === 'id' || key.endsWith('Id')) && typeof child === 'string' && child) knownIds.add(child)
    else collectKnownIds(child, knownIds)
  }
}
// 校验模型输入中的业务标识来源
const hasUntrustedId = (value: unknown, knownIds: Set<string>): boolean => {
  if (Array.isArray(value)) return value.some(item => hasUntrustedId(item, knownIds))
  if (!value || typeof value !== 'object') return false
  for (const [key, child] of Object.entries(value)) {
    if (['projectId', 'targetProjectId', 'nodeId', 'parentId', 'changeSetId'].includes(key) && typeof child === 'string' && child && !knownIds.has(child)) return true
    if (hasUntrustedId(child, knownIds)) return true
  }
  return false
}

export class AgentRuntime {
  private contentView: WebContentsView | null = null
  private networkMode: 'offline' | 'online' = 'offline'
  private readonly runs = new Map<string, RunRecord>()
  private readonly clientTools = new Map<string, PendingClientTool>()
  private initialized = false
  private resourceCleaner: ((resource: AgentRuntimeResource) => Promise<unknown>) | null = null
  // 注册主进程资源清理器以应对渲染进程崩溃
  setResourceCleaner(cleaner: (resource: AgentRuntimeResource) => Promise<unknown>): void { this.resourceCleaner = cleaner }
  // 初始化运行时 IPC
  init(contentView: WebContentsView): void {
    this.contentView = contentView
    if (this.initialized) return
    this.initialized = true
    ipcMain.handle(IPC_EVENTS.ai.rendererToMain.run, (event: IpcMainInvokeEvent, value: unknown) => event.sender === this.contentView?.webContents ? this.start(value) : { accepted: false, runId: '', errorCode: 'AI_INVALID_SENDER' })
    ipcMain.handle(IPC_EVENTS.ai.rendererToMain.abort, (event: IpcMainInvokeEvent, value: unknown) => event.sender === this.contentView?.webContents ? this.abort(value) : { accepted: false, runId: '', errorCode: 'AI_INVALID_SENDER' })
    ipcMain.handle(IPC_EVENTS.ai.rendererToMain.approval, (event: IpcMainInvokeEvent, value: unknown) => event.sender === this.contentView?.webContents ? this.respondApproval(value) : { accepted: false, runId: '', errorCode: 'AI_INVALID_SENDER' })
    ipcMain.on(IPC_EVENTS.ai.rendererToMain.clientToolResult, (event, value: unknown) => { if (event.sender === this.contentView?.webContents) this.resolveClientTool(value) })
    contentView.webContents.once('destroyed', () => this.abortAll('renderer-destroyed'))
    contentView.webContents.on('render-process-gone', () => this.abortAll('renderer-crashed'))
    contentView.webContents.on('did-start-navigation', (_event, _url, isInPlace, isMainFrame) => { if (isMainFrame && !isInPlace) this.abortAll('renderer-reloaded') })
  }
  // 更新网络模式
  setNetworkMode(mode: 'offline' | 'online'): void {
    this.networkMode = mode
    if (mode === 'online') this.abortAll('network-mode-changed')
  }
  // 判断是否处于离线模式
  isOffline(): boolean { return this.networkMode === 'offline' }
  // 启动 Agent 或 Ask
  private start(value: unknown): AgentRunResponse {
    let request: AgentRunRequest
    try {
      request = parseAgentRunRequest(value)
    } catch {
      return { accepted: false, runId: '', errorCode: 'AI_INVALID_REQUEST', message: 'Invalid AI request' }
    }
    if (this.networkMode !== 'offline' || request.context.networkMode !== 'offline') return { accepted: false, runId: request.runId, errorCode: 'AI_OFFLINE_ONLY', message: 'AI is only available in offline mode' }
    const configError = getLLMConfigError(request.provider)
    if (configError) return { accepted: false, runId: request.runId, errorCode: 'AI_INVALID_CONFIG', message: configError }
    if (this.runs.has(request.runId)) return { accepted: false, runId: request.runId, errorCode: 'AI_DUPLICATE_RUN', message: 'Run already exists' }
    if ([...this.runs.values()].some(record => record.request.conversationId === request.conversationId)) return { accepted: false, runId: request.runId, errorCode: 'AI_CONVERSATION_BUSY', message: 'Conversation is already running' }
    const controller = new AbortController()
    const context: AgentToolContext = { ...request.context, abortSignal: controller.signal, conversationId: request.conversationId, runId: request.runId }
    const knownIds = new Set<string>([request.context.projectId, request.context.activeNodeId].filter((id): id is string => Boolean(id)))
    const record: RunRecord = { request, controller, sequence: 0, messages: toModelMessages(request), tools: {}, approvals: [], approvalResponses: [], readSignatures: new Set(), changeSignatures: new Set(), knownIds, loopBlocked: false, completed: false, step: 0, activeTools: [], resources: [], context, definitions: [], toolExecutions: new Map() }
    const definitions = createAgentToolDefinitions((toolName, input, toolContext) => this.executeClientTool(record, toolName, input, toolContext))
    record.definitions = definitions
    record.tools = createAISDKTools(definitions, context)
    record.activeTools = getActiveToolNames(definitions, context)
    this.runs.set(request.runId, record)
    this.emit(record, { type: 'run-state', state: 'queued' })
    void this.execute(record)
    return { accepted: true, runId: request.runId }
  }
  // 执行模型调用
  private async execute(record: RunRecord): Promise<void> {
    if (record.controller.signal.aborted || record.completed) return
    this.emit(record, { type: 'run-state', state: 'running' })
    try {
      const model = createLanguageModel(record.request.provider)
      const providerOptions = createProviderOptions(record.request.provider)
      if (record.request.mode === 'ask') {
        const result = streamText({ model, system: `Reply in ${record.request.context.language}.`, messages: record.messages, providerOptions, maxOutputTokens: record.request.provider.maxTokens ?? undefined, maxRetries: 1, timeout: { totalMs: requestTimeout }, abortSignal: record.controller.signal })
        await this.consumeStream(record, result.fullStream)
        record.messages.push(...(await result.response).messages)
        this.complete(record)
        return
      }
      const agent = new ToolLoopAgent({
        model,
        instructions: this.getInstructions(record.request),
        tools: record.tools,
        activeTools: record.activeTools,
        prepareStep: () => ({ activeTools: record.activeTools }),
        providerOptions,
        maxOutputTokens: record.request.provider.maxTokens ?? undefined,
        maxRetries: 1,
        timeout: { totalMs: requestTimeout },
        stopWhen: [stepCountIs(Math.max(1, Math.min(maxSteps, hardMaxSteps) - record.step)), () => record.loopBlocked],
      })
      const result = await agent.stream({ messages: record.messages, abortSignal: record.controller.signal })
      await this.consumeStream(record, result.fullStream)
      record.messages.push(...(await result.response).messages)
      if (record.completed || record.controller.signal.aborted) return
      if (record.loopBlocked) {
        this.emit(record, { type: 'error', errorCode: 'AI_LOOP_GUARD', message: 'Agent stopped because it repeated the same read or ChangeSet without making progress', retryable: false })
        this.emit(record, { type: 'run-state', state: 'failed', detail: 'AI_LOOP_GUARD' })
        this.finishRecord(record)
        return
      }
      if (record.step >= Math.min(maxSteps, hardMaxSteps) && record.finishReason === 'tool-calls') throw new Error('AI_MAX_STEPS: Agent reached the step limit')
      if (record.approvals.length > 0) {
        await this.emitNextApproval(record)
        return
      }
      this.complete(record)
    } catch (error) {
      if (record.completed) return
      if (record.controller.signal.aborted) {
        this.emit(record, { type: 'abort', reason: 'user' })
        this.emit(record, { type: 'run-state', state: 'cancelled' })
      } else {
        const message = redactAIText(getLLMRequestError(error, record.request.provider))
        const errorCode = message.match(/^(AI_[A-Z_]+):/)?.[1] ?? 'AI_RUN_FAILED'
        const status = typeof error === 'object' && error !== null && 'statusCode' in error ? Number(error.statusCode) : 0
        this.emit(record, { type: 'error', errorCode, message, retryable: errorCode === 'AI_RUN_FAILED' && ![401, 402, 403, 404].includes(status) })
        this.emit(record, { type: 'run-state', state: 'failed', detail: message })
      }
      this.expireApprovals(record)
      this.finishRecord(record)
    }
  }
  // 处理完整模型事件流
  private async consumeStream(record: RunRecord, stream: AsyncIterable<TextStreamPart<ToolSet>>): Promise<void> {
    for await (const part of stream) {
      if (record.controller.signal.aborted) break
      this.consumePart(record, part)
    }
  }
  // 映射 AI SDK 事件
  private consumePart(record: RunRecord, part: TextStreamPart<ToolSet>): void {
    if (part.type === 'start') return
    if (part.type === 'text-start') this.emit(record, { type: 'text', phase: 'start', text: '' })
    else if (part.type === 'text-delta') this.emit(record, { type: 'text', phase: 'delta', text: part.text })
    else if (part.type === 'text-end') this.emit(record, { type: 'text', phase: 'end', text: '' })
    else if (part.type === 'reasoning-start') this.emit(record, { type: 'reasoning', phase: 'start', text: '' })
    else if (part.type === 'reasoning-delta') this.emit(record, { type: 'reasoning', phase: 'delta', text: part.text })
    else if (part.type === 'reasoning-end') this.emit(record, { type: 'reasoning', phase: 'end', text: '' })
    else if (part.type === 'start-step') { record.step += 1; this.emit(record, { type: 'step-start', step: record.step }) }
    else if (part.type === 'tool-input-start') this.emit(record, { type: 'tool', toolCallId: part.id, toolName: part.toolName, title: part.title ?? part.toolName, state: 'created' })
    else if (part.type === 'tool-input-delta') this.emit(record, { type: 'tool', toolCallId: part.id, toolName: '', title: '', state: 'created', inputText: '…' })
    else if (part.type === 'tool-input-end') this.emit(record, { type: 'tool', toolCallId: part.id, toolName: '', title: '', state: 'running' })
    else if (part.type === 'tool-call') this.emit(record, { type: 'tool', toolCallId: part.toolCallId, toolName: part.toolName, title: part.title ?? part.toolName, state: 'running', input: toInputRecord(redactAIValue(part.input)) })
    else if (part.type === 'tool-result') {
      const output = toInputRecord(part.output)
      const succeeded = output.success !== false
      const changeSetId = typeof output.changeSetId === 'string' ? output.changeSetId : undefined
      const displayData = 'displayData' in output ? redactAIValue(output.displayData) : redactAIValue(part.output)
      this.emit(record, { type: 'tool', toolCallId: part.toolCallId, toolName: part.toolName, title: part.title ?? part.toolName, state: succeeded ? 'success' : 'error', displayData, error: succeeded ? undefined : typeof output.summary === 'string' ? output.summary : 'Tool execution failed', changeSetId })
      if (changeSetId) {
        const displayRecord = toInputRecord(output.displayData)
        const nestedChangeSet = toInputRecord(displayRecord.changeSet)
        const state = typeof displayRecord.status === 'string' ? displayRecord.status : typeof nestedChangeSet.status === 'string' ? nestedChangeSet.status : 'previewed'
        this.emit(record, { type: 'change-set', changeSetId, state, displayData })
      }
    }
    else if (part.type === 'tool-error') this.emit(record, { type: 'tool', toolCallId: part.toolCallId, toolName: part.toolName, title: part.title ?? part.toolName, state: 'error', error: getSafeError(part.error, []) })
    else if (part.type === 'tool-output-denied') this.emit(record, { type: 'tool', toolCallId: part.toolCallId, toolName: part.toolName, title: part.toolName, state: 'denied' })
    else if (part.type === 'tool-approval-request') {
      const input = toInputRecord(part.toolCall.input)
      record.approvals.push({ approvalId: part.approvalId, toolCallId: part.toolCall.toolCallId, toolName: part.toolCall.toolName, input, changeSetId: typeof input.changeSetId === 'string' ? input.changeSetId : undefined })
    } else if (part.type === 'source' && part.sourceType === 'url') this.emit(record, { type: 'source-url', sourceId: part.id, url: part.url, title: part.title })
    else if (part.type === 'source' && part.sourceType === 'document') this.emit(record, { type: 'source-document', sourceId: part.id, mediaType: part.mediaType, title: part.title, filename: part.filename })
    else if (part.type === 'file') this.emit(record, { type: 'file', mediaType: part.file.mediaType })
    else if (part.type === 'error') throw part.error
    else if (part.type === 'finish') {
      record.finishReason = part.finishReason
      this.emit(record, { type: 'finish', finishReason: part.finishReason, usage: { inputTokens: part.totalUsage.inputTokens, outputTokens: part.totalUsage.outputTokens, totalTokens: part.totalUsage.totalTokens, reasoningTokens: part.totalUsage.reasoningTokens } })
    }
    else if (part.type === 'abort') this.emit(record, { type: 'abort', reason: part.reason })
  }
  // 执行 renderer client tool
  private executeClientTool(record: RunRecord, toolName: string, input: Record<string, unknown>, context: AgentToolContext): Promise<AgentToolResult> {
    const key = `${toolName}:${context.toolCallId ?? ''}`
    const signature = JSON.stringify(input)
    const existing = context.toolCallId ? record.toolExecutions.get(key) : undefined
    if (existing) return existing.signature === signature ? existing.result : Promise.resolve({ success: false, errorCode: 'AI_DUPLICATE_TOOL_CALL', retryable: false, summary: 'Tool call ID was reused with different input' })
    const result = this.performClientTool(record, toolName, input, context)
    if (context.toolCallId) record.toolExecutions.set(key, { signature, result })
    return result
  }
  // 执行去重后的客户端工具及有界重试
  private async performClientTool(record: RunRecord, toolName: string, input: Record<string, unknown>, context: AgentToolContext): Promise<AgentToolResult> {
    if (this.networkMode !== 'offline' || context.networkMode !== 'offline') return { success: false, errorCode: 'AI_OFFLINE_ONLY', retryable: false, summary: 'AI is only available in offline mode' }
    if (record.controller.signal.aborted) return { success: false, errorCode: 'AI_ABORTED', retryable: false, summary: 'Run was cancelled' }
    if (hasUntrustedId(input, record.knownIds)) return { success: false, errorCode: 'AI_UNTRUSTED_ID', retryable: false, summary: 'An ID was not obtained from the current context or a previous tool result' }
    const signature = `${toolName}:${JSON.stringify(input)}`
    if (readToolNames.has(toolName) && record.readSignatures.has(signature)) {
      record.loopBlocked = true
      return { success: false, errorCode: 'AI_DUPLICATE_READ', retryable: false, summary: 'Duplicate read was skipped because it cannot make progress' }
    }
    if (proposalToolNames.has(toolName) && record.changeSignatures.has(signature)) {
      record.loopBlocked = true
      return { success: false, errorCode: 'AI_DUPLICATE_CHANGESET', retryable: false, summary: 'An identical ChangeSet proposal was skipped because it cannot make progress' }
    }
    if (readToolNames.has(toolName)) record.readSignatures.add(signature)
    if (proposalToolNames.has(toolName)) record.changeSignatures.add(signature)
    let result = await this.dispatchClientTool(record, toolName, input, context)
    if (!result.success && result.retryable === true && !record.controller.signal.aborted) result = await this.dispatchClientTool(record, toolName, input, context)
    if (result.success && (toolName === 'openProject' || toolName === 'applyChangeSet' || ['start', 'stop', 'connect', 'disconnect', 'send'].includes(String(input.action)))) record.readSignatures.clear()
    if (result.success && toolName === 'getWorkspaceContext') {
      const data = toInputRecord(result.displayData)
      const project = toInputRecord(data.project)
      const node = toInputRecord(data.activeNode)
      const nextContext = { ...record.request.context, projectId: typeof project.id === 'string' ? project.id : null, activeNodeId: typeof node.id === 'string' ? node.id : null, activeTabType: typeof node.type === 'string' ? node.type : null }
      record.request.context = nextContext
      Object.assign(record.context, nextContext)
      record.activeTools = getActiveToolNames(record.definitions, record.context)
    }
    if (result.success && !toInputRecord(result.displayData).alreadyActive && typeof input.nodeId === 'string' && (toolName === 'manageMockServer' && input.action === 'start' || toolName === 'manageWebSocketConnection' && input.action === 'connect')) record.resources.push({ nodeId: input.nodeId, kind: toolName === 'manageWebSocketConnection' ? 'websocket' : input.kind === 'http' ? 'httpMock' : 'websocketMock' })
    if (result.success && (input.action === 'stop' || input.action === 'disconnect')) record.resources = record.resources.filter(resource => resource.nodeId !== input.nodeId)
    return result
  }
  // 分发一次 renderer client tool
  private dispatchClientTool(record: RunRecord, toolName: string, input: Record<string, unknown>, context: AgentToolContext): Promise<AgentToolResult> {
    const commandId = randomUUID()
    const toolCallId = context.toolCallId ?? commandId
    const event = this.createEvent(record, { type: 'client-tool-command', commandId, toolCallId, toolName, input })
    this.sendEvent({ ...event, input: {} } as AgentEvent)
    this.contentView?.webContents.send(IPC_EVENTS.ai.mainToRenderer.clientToolCommand, event)
    this.emit(record, { type: 'run-state', state: 'waiting_client_tool' })
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.clientTools.delete(commandId)
        reject(new Error('Client tool timed out'))
      }, clientToolTimeout)
      const abort = () => {
        clearTimeout(timer)
        this.clientTools.delete(commandId)
        reject(new Error('Client tool aborted'))
      }
      record.controller.signal.addEventListener('abort', abort, { once: true })
      this.clientTools.set(commandId, { runId: record.request.runId, toolCallId, timer, resolve: result => {
        record.controller.signal.removeEventListener('abort', abort)
        resolve(result)
      }, reject })
    })
  }
  // 接收 renderer client tool 结果
  private resolveClientTool(value: unknown): void {
    let payload: AgentClientToolResult
    try { payload = parseAgentClientToolResult(value) } catch { return }
    const pending = this.clientTools.get(payload.commandId)
    const record = this.runs.get(payload.runId)
    if (!pending || !record || pending.runId !== payload.runId || pending.toolCallId !== payload.toolCallId || payload.messageId !== record.request.messageId || record.controller.signal.aborted || payload.conversationId !== record.request.conversationId) return
    clearTimeout(pending.timer)
    this.clientTools.delete(payload.commandId)
    collectKnownIds(payload.result.displayData, record.knownIds)
    collectKnownIds(payload.result.modelData, record.knownIds)
    if (payload.result.changeSetId) record.knownIds.add(payload.result.changeSetId)
    pending.resolve({ ...payload.result, displayData: redactAIValue(payload.result.displayData, [record.request.provider.apiKey]), modelData: redactAIValue(payload.result.modelData, [record.request.provider.apiKey]) })
    this.emit(record, { type: 'run-state', state: 'running' })
  }
  // 展示下一条审批
  private async emitNextApproval(record: RunRecord): Promise<void> {
    const approval = record.approvals[0]
    if (!approval) return
    if (hasUntrustedId(approval.input, record.knownIds)) throw new Error('AI_UNTRUSTED_ID: Approval target is not known')
    const context: AgentToolContext = { ...record.request.context, abortSignal: record.controller.signal, conversationId: record.request.conversationId, runId: record.request.runId, toolCallId: approval.toolCallId }
    const nodeId = typeof approval.input.nodeId === 'string' ? approval.input.nodeId : ''
    const preview = approval.changeSetId
      ? await this.dispatchClientTool(record, 'previewChangeSet', { changeSetId: approval.changeSetId }, context)
      : nodeId ? await this.dispatchClientTool(record, 'getNodeDetail', { nodeId }, context) : null
    if (record.controller.signal.aborted) return
    if (preview && !preview.success) throw new Error(`${preview.errorCode}: ${preview.summary}`)
    record.readyApprovalId = approval.approvalId
    this.emit(record, { type: 'approval', approvalId: approval.approvalId, toolCallId: approval.toolCallId, toolName: approval.toolName, changeSetId: approval.changeSetId, state: 'requested', displayData: redactAIValue({ input: approval.input, target: preview?.displayData }) })
    this.emit(record, { type: 'run-state', state: 'waiting_approval' })
  }
  // 处理审批响应
  private async respondApproval(value: unknown): Promise<AgentRunResponse> {
    let payload: AgentApprovalResponseRequest
    try { payload = parseAgentApprovalResponse(value) } catch { return { accepted: false, runId: '', errorCode: 'AI_INVALID_APPROVAL', message: 'Invalid approval response' } }
    const record = this.runs.get(payload.runId)
    const approval = record?.approvals[0]
    if (!record || !approval || record.readyApprovalId !== payload.approvalId || record.completed || record.controller.signal.aborted || record.request.conversationId !== payload.conversationId || record.request.messageId !== payload.messageId || approval.approvalId !== payload.approvalId || approval.toolCallId !== payload.toolCallId) return { accepted: false, runId: payload.runId, errorCode: 'AI_APPROVAL_EXPIRED', message: 'Approval is unknown, duplicate or expired' }
    try {
      record.readyApprovalId = undefined
      record.approvals.shift()
      record.approvalResponses.push({ type: 'tool-approval-response', approvalId: payload.approvalId, approved: payload.approved, reason: payload.reason })
      this.emit(record, { type: 'approval', approvalId: approval.approvalId, toolCallId: approval.toolCallId, toolName: approval.toolName, changeSetId: approval.changeSetId, state: payload.approved ? 'approved' : 'denied', approved: payload.approved, reason: payload.reason })
      this.emit(record, { type: 'tool', toolCallId: approval.toolCallId, toolName: approval.toolName, title: approval.toolName, state: payload.approved ? 'responded' : 'denied', approvalId: approval.approvalId, changeSetId: approval.changeSetId })
      if (!payload.approved && approval.changeSetId) {
        const context: AgentToolContext = { ...record.request.context, abortSignal: record.controller.signal, conversationId: record.request.conversationId, runId: record.request.runId, toolCallId: approval.toolCallId }
        await this.executeClientTool(record, 'discardChangeSet', { changeSetId: approval.changeSetId }, context)
      } else if (payload.approved && approval.changeSetId) {
        const context: AgentToolContext = { ...record.request.context, abortSignal: record.controller.signal, conversationId: record.request.conversationId, runId: record.request.runId, toolCallId: approval.toolCallId }
        const result = await this.executeClientTool(record, 'setChangeSetApproval', { changeSetId: approval.changeSetId, approvalId: approval.approvalId, approved: true }, context)
        if (!result.success) throw new Error(`${result.errorCode}: ${result.summary}`)
      }
      if (record.approvals.length > 0) {
        await this.emitNextApproval(record)
        return { accepted: true, runId: payload.runId }
      }
      record.messages.push({ role: 'tool', content: record.approvalResponses })
      record.approvalResponses = []
      void this.execute(record)
      return { accepted: true, runId: payload.runId }
    } catch (error) {
      const message = getSafeError(error, [record.request.provider.apiKey, ...record.request.provider.customHeaders.map(header => header.value)])
      if (!record.completed) {
        this.emit(record, { type: 'error', errorCode: 'AI_APPROVAL_FAILED', message, retryable: false })
        this.emit(record, { type: 'run-state', state: 'failed', detail: 'AI_APPROVAL_FAILED' })
        this.expireApprovals(record)
        this.finishRecord(record)
      }
      return { accepted: false, runId: payload.runId, errorCode: 'AI_APPROVAL_FAILED', message }
    }
  }
  // 取消运行
  private abort(value: unknown): AgentRunResponse {
    let payload: AgentAbortRequest
    try { payload = parseAgentAbortRequest(value) } catch { return { accepted: false, runId: '', errorCode: 'AI_INVALID_ABORT', message: 'Invalid abort request' } }
    const record = this.runs.get(payload.runId)
    if (!record || record.request.conversationId !== payload.conversationId || record.completed) return { accepted: false, runId: payload.runId, errorCode: 'AI_RUN_NOT_FOUND', message: 'Run not found' }
    this.emit(record, { type: 'run-state', state: 'cancelling' })
    record.controller.abort()
    this.expireApprovals(record)
    this.emit(record, { type: 'abort', reason: 'user' })
    this.emit(record, { type: 'run-state', state: 'cancelled' })
    this.finishRecord(record)
    return { accepted: true, runId: payload.runId }
  }
  // 完成运行
  private complete(record: RunRecord): void {
    if (record.controller.signal.aborted || record.completed) return
    this.emit(record, { type: 'run-state', state: 'completed' })
    this.finishRecord(record, true)
  }
  // 终止尚未响应的审批
  private expireApprovals(record: RunRecord): void {
    for (const approval of record.approvals) this.emit(record, { type: 'approval', approvalId: approval.approvalId, toolCallId: approval.toolCallId, toolName: approval.toolName, changeSetId: approval.changeSetId, state: 'expired' })
    record.approvals = []
    record.approvalResponses = []
  }
  // 结束运行记录
  private finishRecord(record: RunRecord, preserveResources = false): void {
    record.completed = true
    if (!preserveResources) for (const resource of record.resources) void this.resourceCleaner?.(resource).catch(() => undefined)
    record.resources = []
    for (const [commandId, pending] of this.clientTools) {
      if (pending.runId !== record.request.runId) continue
      clearTimeout(pending.timer)
      pending.reject(new Error('Run finished'))
      this.clientTools.delete(commandId)
    }
    this.runs.delete(record.request.runId)
  }
  // 中断全部运行
  abortAll(reason: string): void {
    for (const record of this.runs.values()) {
      if (record.completed) continue
      record.controller.abort()
      this.expireApprovals(record)
      this.emit(record, { type: 'abort', reason })
      this.emit(record, { type: 'run-state', state: 'interrupted', detail: reason })
      this.finishRecord(record)
    }
  }
  // 获取 Agent 指令
  private getInstructions(request: AgentRunRequest): string {
    return `You are ApiFlow's offline API design agent. Reply in ${request.context.language}. Read context before acting. Never invent IDs. All changes must be proposed as a ChangeSet and applied only with applyChangeSet approval. If approval is denied, do not retry or use another write tool. Current context: ${JSON.stringify(redactAIValue(request.context))}`
  }
  // 创建事件
  private createEvent(record: RunRecord, data: AgentEventData): AgentEvent {
    record.sequence += 1
    return { eventId: randomUUID(), conversationId: record.request.conversationId, runId: record.request.runId, messageId: record.request.messageId, sequence: record.sequence, createdAt: Date.now(), ...data } as AgentEvent
  }
  // 发送事件
  private sendEvent(event: AgentEvent): void {
    if (!this.contentView || this.contentView.webContents.isDestroyed()) return
    this.contentView.webContents.send(IPC_EVENTS.ai.mainToRenderer.event, { event })
  }
  // 创建并发送事件
  private emit(record: RunRecord, data: AgentEventData): void {
    if (record.completed) return
    const event = this.createEvent(record, data)
    this.sendEvent(event.type === 'client-tool-command' ? event : redactAIValue(event, [record.request.provider.apiKey, ...record.request.provider.customHeaders.map(header => header.value)]) as AgentEvent)
  }
}

export const agentRuntime = new AgentRuntime()
