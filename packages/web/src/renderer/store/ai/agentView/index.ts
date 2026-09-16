import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { nanoid } from 'nanoid/non-secure'
import { appStateCache } from '@/cache/appState/appStateCache'
import { agentDataCache, normalizeAgentEvents } from '@/cache/ai/agentDataCache'
import { detectInputLanguage, i18n } from '@/i18n'
import { isElectron } from '@/helper'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { useProjectWorkbench } from '@/store/projectWorkbench/projectWorkbenchStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { parseAgentEvent } from '@src/shared/ai/validation'
import { redactAIText, redactAIValue } from '@src/shared/ai/redaction'
import { logger } from '@/helper/logger'
import type { AgentApprovalResponseRequest, AgentConversation, AgentEvent, AgentPromptMessage, ConversationMode, Language } from '@src/types'
import { cleanupAgentRuntimeTools, executeAgentClientTool } from '../clientToolExecutor'
import { mapAgentEventsToPanelMessages } from '../eventMapper'

const terminalRunStates = new Set(['completed', 'cancelled', 'failed', 'interrupted'])
import type { AgentEventData } from '@src/types/ai/agentInternals'
// 创建本地事件
const createLocalEvent = (conversationId: string, runId: string, messageId: string, sequence: number, data: AgentEventData): AgentEvent => ({ eventId: nanoid(), conversationId, runId, messageId, sequence, createdAt: Date.now(), ...data } as AgentEvent)
export const useAgentViewStore = defineStore('agentView', () => {
  const runtimeStore = useRuntime()
  const llmClientStore = useLLMClientStore()
  const projectWorkbenchStore = useProjectWorkbench()
  const projectNavStore = useProjectNav()
  const agentViewDialogVisible = ref(false)
  const view = ref<'chat' | 'config'>('chat')
  const mode = ref<ConversationMode>('agent')
  const inputMessage = ref('')
  const conversations = ref<AgentConversation[]>([])
  const currentConversationIds = ref<Record<ConversationMode, string>>({ agent: nanoid(), ask: nanoid() })
  const currentRunId = ref<string | null>(null)
  const initialized = ref(false)
  let initialization: Promise<void> | null = null
  let submitting = false
  const processedCommandIds = new Set<string>()
  const retiredConversationIds = new Set<string>()
  const runControllers = new Map<string, AbortController>()
  let eventQueue = Promise.resolve()
  const isElectronOffline = computed(() => isElectron() && runtimeStore.networkMode === 'offline')
  const isAiConfigValid = computed(() => isElectronOffline.value && llmClientStore.isAvailable())
  const currentConversation = computed(() => conversations.value.find(item => item.id === currentConversationIds.value[mode.value]) ?? null)
  const currentEvents = computed(() => currentConversation.value?.events ?? [])
  const currentMessages = computed(() => mapAgentEventsToPanelMessages(currentEvents.value))
  const latestRunState = computed(() => [...currentEvents.value].reverse().find(event => event.type === 'run-state'))
  const workingStatus = computed<'working' | 'finish'>(() => latestRunState.value?.type === 'run-state' && !terminalRunStates.has(latestRunState.value.state) ? 'working' : 'finish')
  const pendingApproval = computed(() => [...currentMessages.value].reverse().find((message): message is Extract<typeof message, { kind: 'approval' }> => message.kind === 'approval' && message.state === 'requested') ?? null)
  // 获取或创建会话
  const ensureConversation = (conversationMode: ConversationMode, conversationId = currentConversationIds.value[conversationMode]): AgentConversation => {
    const existing = conversations.value.find(item => item.id === conversationId)
    if (existing) return existing
    const created: AgentConversation = { version: 2, id: conversationId, mode: conversationMode, language: runtimeStore.language, events: [], updatedAt: Date.now() }
    conversations.value.push(created)
    return created
  }
  // 保存会话
  const persistConversation = async (conversation: AgentConversation): Promise<void> => {
    const saved = await agentDataCache.putConversation(conversation)
    const current = conversations.value.find(item => item.id === saved.id)
    if (current && current.events.length === conversation.events.length) current.updatedAt = saved.updatedAt
  }
  // 接收规范化事件
  const ingestEvent = async (value: unknown): Promise<void> => {
    let event: AgentEvent
    try { event = parseAgentEvent(value) } catch (error) {
      logger.warn('忽略无效或未知 Agent 事件', { error: redactAIText(error instanceof Error ? error.message : String(error)) })
      return
    }
    if (retiredConversationIds.has(event.conversationId)) return
    const conversation = conversations.value.find(item => item.id === event.conversationId) ?? ensureConversation(mode.value, event.conversationId)
    if (conversation.events.some(item => item.eventId === event.eventId)) return
    const lastRunState = [...conversation.events].reverse().find(item => item.runId === event.runId && item.type === 'run-state')
    if (lastRunState?.type === 'run-state' && terminalRunStates.has(lastRunState.state) && event.sequence >= lastRunState.sequence) return
    const provider = llmClientStore.LLMConfig
    const displayEvent = event.type === 'client-tool-command' ? { ...event, input: {} } : redactAIValue(event, [provider.apiKey, ...provider.customHeaders.map(header => header.value)]) as AgentEvent
    conversation.events = normalizeAgentEvents([...conversation.events, displayEvent])
    conversation.updatedAt = Date.now()
    if (event.type === 'run-state' && terminalRunStates.has(event.state)) {
      runControllers.get(event.runId)?.abort()
      runControllers.delete(event.runId)
      if (event.state === 'cancelled' || event.state === 'interrupted' || event.state === 'failed') await cleanupAgentRuntimeTools(event.runId)
      if (currentRunId.value === event.runId) currentRunId.value = null
    }
    await persistConversation(conversation)
  }
  // 执行主进程下发的客户端工具
  const handleClientToolCommand = async (value: unknown): Promise<void> => {
    let event: AgentEvent
    try { event = parseAgentEvent(value) } catch (error) {
      logger.warn('忽略无效 client tool command', { error: redactAIText(error instanceof Error ? error.message : String(error)) })
      return
    }
    if (event.type !== 'client-tool-command' || !isElectronOffline.value || !window.electronAPI?.aiManager) return
    if (retiredConversationIds.has(event.conversationId)) return
    if (processedCommandIds.has(event.commandId)) return
    const existingConversation = conversations.value.find(item => item.id === event.conversationId)
    const lastRunState = [...(existingConversation?.events ?? [])].reverse().find(item => item.runId === event.runId && item.type === 'run-state')
    if (lastRunState?.type === 'run-state' && terminalRunStates.has(lastRunState.state)) return
    processedCommandIds.add(event.commandId)
    await ingestEvent(event)
    const controller = runControllers.get(event.runId) ?? new AbortController()
    runControllers.set(event.runId, controller)
    const result = await executeAgentClientTool(event, controller.signal).catch(error => ({ success: false, errorCode: 'AI_CLIENT_TOOL_FAILED', retryable: false, summary: redactAIText(error instanceof Error ? error.message : String(error)) }))
    if (controller.signal.aborted) return
    window.electronAPI.aiManager.sendClientToolResult({ conversationId: event.conversationId, runId: event.runId, messageId: event.messageId, commandId: event.commandId, toolCallId: event.toolCallId, result })
  }
  // 恢复中断状态
  const recoverInterruptedRuns = async (): Promise<void> => {
    for (const conversation of conversations.value) {
      const runs = new Map<string, AgentEvent[]>()
      for (const event of conversation.events) runs.set(event.runId, [...(runs.get(event.runId) ?? []), event])
      for (const [runId, events] of runs) {
        const lastState = [...events].reverse().find(event => event.type === 'run-state')
        if (!lastState || lastState.type !== 'run-state' || terminalRunStates.has(lastState.state)) continue
        const messageId = events.at(-1)?.messageId ?? nanoid()
        let sequence = Math.max(...events.map(event => event.sequence), 0)
        const resolvedApprovalIds = new Set(events.filter((event): event is Extract<AgentEvent, { type: 'approval' }> => event.type === 'approval' && event.state !== 'requested').map(event => event.approvalId))
        for (const approval of events.filter((event): event is Extract<AgentEvent, { type: 'approval' }> => event.type === 'approval' && event.state === 'requested' && !resolvedApprovalIds.has(event.approvalId))) {
          sequence += 1
          conversation.events.push(createLocalEvent(conversation.id, runId, messageId, sequence, { type: 'approval', toolCallId: approval.toolCallId, toolName: approval.toolName, approvalId: approval.approvalId, state: 'expired', changeSetId: approval.changeSetId }))
        }
        sequence += 1
        conversation.events.push(createLocalEvent(conversation.id, runId, messageId, sequence, { type: 'run-state', state: 'interrupted', detail: 'application-restarted' }))
        conversation.events = normalizeAgentEvents(conversation.events)
        await persistConversation(conversation)
      }
    }
  }
  // 初始化事件与缓存
  const initAgentRuntime = async (): Promise<void> => {
    if (initialized.value || !isElectronOffline.value || !window.electronAPI?.aiManager) return
    if (initialization) return initialization
    const manager = window.electronAPI.aiManager
    initialization = (async () => {
      await agentDataCache.migrateLegacyCache()
      conversations.value = await agentDataCache.getConversations()
      for (const conversation of conversations.value) for (const event of conversation.events) if (event.type === 'client-tool-command') processedCommandIds.add(event.commandId)
      for (const conversationMode of ['agent', 'ask'] as const) {
        const recent = conversations.value.find(item => item.mode === conversationMode)
        if (recent) currentConversationIds.value[conversationMode] = recent.id
        else ensureConversation(conversationMode)
      }
      await recoverInterruptedRuns()
      manager.onEvent(payload => {
        eventQueue = eventQueue.then(() => ingestEvent(payload.event)).catch(error => logger.warn('保存 Agent 事件失败', { error: redactAIText(String(error)) }))
      })
      manager.onClientToolCommand(event => { void handleClientToolCommand(event) })
      initialized.value = true
    })().finally(() => { initialization = null })
    return initialization
  }
  // 显示面板
  const showAgentViewDialog = (): void => {
    if (!isElectronOffline.value) return
    agentViewDialogVisible.value = true
    void initAgentRuntime().catch(error => logger.warn('初始化 Agent 会话失败', { error: redactAIText(String(error)) }))
  }
  // 隐藏面板
  const hideAgentViewDialog = (): void => { agentViewDialogVisible.value = false }
  // 打开设置
  const openConfig = (): void => { if (isElectronOffline.value) view.value = 'config' }
  // 返回对话
  const backToChat = (): void => { view.value = 'chat' }
  // 切换模式
  const setMode = (nextMode: ConversationMode): void => {
    if (workingStatus.value === 'working') return
    mode.value = nextMode
    appStateCache.setAiDialogMode(nextMode)
    ensureConversation(nextMode)
  }
  // 构造模型历史
  const buildHistory = (conversation: AgentConversation): AgentPromptMessage[] => {
    const history: AgentPromptMessage[] = []
    for (const message of mapAgentEventsToPanelMessages(conversation.events)) {
      if (message.kind === 'user') history.push({ role: 'user', content: message.text })
      if (message.kind === 'assistant' && !message.streaming && message.text.trim()) history.push({ role: 'assistant', content: message.text })
    }
    return history.slice(-20)
  }
  // 发送当前输入
  const sendCurrentInput = async (): Promise<void> => {
    const prompt = inputMessage.value.trim()
    if (!prompt || submitting || workingStatus.value === 'working' || !isAiConfigValid.value || !window.electronAPI?.aiManager) return
    submitting = true
    try {
      await initAgentRuntime()
      if (!isAiConfigValid.value) return
      const conversation = ensureConversation(mode.value)
      const runId = nanoid()
      const messageId = nanoid()
      const language = detectInputLanguage(prompt, i18n.global.locale.value as Language)
      const history = buildHistory(conversation)
      conversation.language = language
      inputMessage.value = ''
      currentRunId.value = runId
      await ingestEvent(createLocalEvent(conversation.id, runId, messageId, 0, { type: 'user-message', text: prompt, language }))
      const activeNav = projectNavStore.currentSelectNav
      const response = await window.electronAPI.aiManager.run({ conversationId: conversation.id, runId, messageId, mode: mode.value, prompt, history, context: { projectId: projectWorkbenchStore.projectId || null, activeNodeId: activeNav?._id ?? null, activeTabType: activeNav?.tabType ?? null, language, networkMode: runtimeStore.networkMode }, provider: JSON.parse(JSON.stringify(llmClientStore.LLMConfig)) })
      if (!response.accepted) {
        await ingestEvent(createLocalEvent(conversation.id, runId, messageId, 1, { type: 'error', errorCode: response.errorCode ?? 'AI_RUN_REJECTED', message: response.message ?? i18n.global.t('AI功能不可用'), retryable: false }))
        await ingestEvent(createLocalEvent(conversation.id, runId, messageId, 2, { type: 'run-state', state: 'failed', detail: response.message }))
      }
    } finally { submitting = false }
  }
  // 停止当前运行
  const stopCurrentConversation = async (): Promise<void> => {
    if (!currentRunId.value || !currentConversation.value || !window.electronAPI?.aiManager) return
    runControllers.get(currentRunId.value)?.abort()
    await window.electronAPI.aiManager.abort({ conversationId: currentConversation.value.id, runId: currentRunId.value })
  }
  // 回复审批
  const respondApproval = async (approved: boolean): Promise<void> => {
    const approval = pendingApproval.value
    if (!approval || !currentConversation.value || !currentRunId.value || !window.electronAPI?.aiManager) return
    const request: AgentApprovalResponseRequest = { conversationId: currentConversation.value.id, runId: currentRunId.value, messageId: approval.messageId, approvalId: approval.approvalId, toolCallId: approval.toolCallId, approved }
    await window.electronAPI.aiManager.respondApproval(request)
  }
  // 编辑已完成的用户消息
  const editUserMessage = (runId: string): void => {
    if (workingStatus.value === 'working') return
    const event = currentEvents.value.find(item => item.runId === runId && item.type === 'user-message')
    if (event?.type === 'user-message') inputMessage.value = event.text
  }
  // 重试已结束的运行
  const retryRun = async (runId: string): Promise<void> => {
    if (workingStatus.value === 'working') return
    editUserMessage(runId)
    await sendCurrentInput()
  }
  // 新建当前模式会话
  const clearConversation = async (): Promise<void> => {
    const previousId = currentConversationIds.value[mode.value]
    retiredConversationIds.add(previousId)
    await stopCurrentConversation()
    await eventQueue
    await agentDataCache.deleteConversation(previousId)
    conversations.value = conversations.value.filter(item => item.id !== previousId)
    processedCommandIds.clear()
    for (const conversation of conversations.value) for (const event of conversation.events) if (event.type === 'client-tool-command') processedCommandIds.add(event.commandId)
    currentConversationIds.value[mode.value] = nanoid()
    ensureConversation(mode.value)
    currentRunId.value = null
  }
  mode.value = appStateCache.getAiDialogMode() === 'ask' ? 'ask' : 'agent'
  return { agentViewDialogVisible, view, mode, inputMessage, conversations, currentConversation, currentEvents, currentMessages, currentRunId, workingStatus, pendingApproval, isElectronOffline, isAiConfigValid, initAgentRuntime, showAgentViewDialog, hideAgentViewDialog, openConfig, backToChat, setMode, clearConversation, stopCurrentConversation, sendCurrentInput, respondApproval, editUserMessage, retryRun }
})
