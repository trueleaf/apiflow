import type { AgentEvent, PanelToolMessage, PanelUIMessage } from '@src/types/ai'

// 将 Agent 事件映射为面板消息
export const mapAgentEventsToPanelMessages = (events: AgentEvent[]): PanelUIMessage[] => {
  const messages: PanelUIMessage[] = []
  const assistantByMessage = new Map<string, Extract<PanelUIMessage, { kind: 'assistant' }>>()
  const toolByCall = new Map<string, PanelToolMessage>()
  const toolGroups = new Map<string, PanelToolMessage[]>()
  const approvalById = new Map<string, Extract<PanelUIMessage, { kind: 'approval' }>>()
  const stepByRun = new Map<string, number>()
  const startedAtByRun = new Map<string, number>()
  for (const event of events) {
    if (event.type === 'step-start') { stepByRun.set(event.runId, event.step); continue }
    if (event.type === 'user-message') messages.push({ id: event.eventId, kind: 'user', createdAt: event.createdAt, runId: event.runId, text: event.text })
    else if (event.type === 'text' || event.type === 'reasoning') {
      const assistantKey = `${event.runId}:${event.messageId}:${stepByRun.get(event.runId) ?? 0}`
      let message = assistantByMessage.get(assistantKey)
      if (!message) {
        message = { id: assistantKey, kind: 'assistant', createdAt: event.createdAt, runId: event.runId, text: '', reasoning: '', streaming: true }
        assistantByMessage.set(assistantKey, message)
        messages.push(message)
      }
      if (event.type === 'text' && event.phase === 'delta') message.text += event.text
      if (event.type === 'text' && event.phase === 'end') { if (event.text) message.text = event.text; message.streaming = false }
      if (event.type === 'reasoning' && event.phase === 'delta') message.reasoning += event.text
    } else if (event.type === 'tool') {
      const toolKey = `${event.runId}:${event.toolCallId}`
      let message = toolByCall.get(toolKey)
      if (!message) {
        const step = stepByRun.get(event.runId) ?? 0
        const target = event.input ? ['url', 'query', 'nodeId', 'projectId', 'changeSetId'].map(key => event.input?.[key]).find(value => typeof value === 'string') as string | undefined : undefined
        message = { id: event.eventId, kind: 'tool', createdAt: event.createdAt, runId: event.runId, step, toolCallId: event.toolCallId, toolName: event.toolName, title: event.title, state: event.state, target, source: 'Agent runtime', input: event.input, streamText: event.inputText, output: event.displayData, error: event.error, changeSetId: event.changeSetId }
        toolByCall.set(toolKey, message)
        const groupKey = `${event.runId}:${step}`
        const tools = toolGroups.get(groupKey) ?? []
        tools.push(message)
        toolGroups.set(groupKey, tools)
        if (tools.length === 1) messages.push(message)
        else if (tools.length === 2) {
          const index = messages.indexOf(tools[0])
          if (index >= 0) messages.splice(index, 1, { id: `tool-group:${groupKey}`, kind: 'tool-group', createdAt: tools[0].createdAt, runId: event.runId, step, tools })
        }
      } else {
        if (event.toolName) message.toolName = event.toolName
        if (event.title) message.title = event.title
        message.state = event.state
        if (event.input) message.input = event.input
        if (event.inputText) message.streamText = `${message.streamText ?? ''}${event.inputText}`
        if (event.displayData !== undefined) message.output = event.displayData
        if (event.error) message.error = event.error
        if (event.changeSetId) message.changeSetId = event.changeSetId
      }
    } else if (event.type === 'approval') {
      const existing = approvalById.get(event.approvalId)
      if (existing) {
        existing.state = event.state
        existing.approved = event.approved
        existing.reason = event.reason
        if (event.displayData !== undefined) existing.data = event.displayData
      } else {
        const message: Extract<PanelUIMessage, { kind: 'approval' }> = { id: event.eventId, kind: 'approval', createdAt: event.createdAt, messageId: event.messageId, approvalId: event.approvalId, toolCallId: event.toolCallId, toolName: event.toolName, state: event.state, approved: event.approved, reason: event.reason, changeSetId: event.changeSetId, data: event.displayData }
        approvalById.set(event.approvalId, message)
        messages.push(message)
      }
    } else if (event.type === 'source-url') messages.push({ id: event.eventId, kind: 'source', createdAt: event.createdAt, sourceType: 'url', sourceId: event.sourceId, title: event.title ?? event.url, url: event.url })
    else if (event.type === 'source-document') messages.push({ id: event.eventId, kind: 'source', createdAt: event.createdAt, sourceType: 'document', sourceId: event.sourceId, title: event.title, mediaType: event.mediaType, filename: event.filename })
    else if (event.type === 'file') messages.push({ id: event.eventId, kind: 'file', createdAt: event.createdAt, mediaType: event.mediaType, filename: event.filename, url: event.url })
    else if (event.type === 'error') messages.push({ id: event.eventId, kind: 'error', createdAt: event.createdAt, runId: event.runId, errorCode: event.errorCode, text: event.message, retryable: event.retryable })
    else if (event.type === 'run-state') {
      if (['completed', 'cancelled', 'failed', 'interrupted'].includes(event.state)) for (const message of assistantByMessage.values()) if (message.runId === event.runId) message.streaming = false
      if (['cancelled', 'failed', 'interrupted'].includes(event.state)) for (const tool of toolByCall.values()) if (tool.runId === event.runId && ['created', 'running', 'responded'].includes(tool.state)) { tool.state = event.state === 'failed' ? 'error' : 'denied'; tool.error = event.state === 'failed' ? event.detail ?? '运行失败' : '本次生成已取消' }
      if (event.state === 'running' && !startedAtByRun.has(event.runId)) startedAtByRun.set(event.runId, event.createdAt)
      messages.push({ id: event.eventId, kind: 'run-state', createdAt: event.createdAt, runId: event.runId, startedAt: startedAtByRun.get(event.runId), state: event.state, detail: event.detail })
    }
    else if (event.type === 'finish') messages.push({ id: event.eventId, kind: 'finish', createdAt: event.createdAt, finishReason: event.finishReason, usage: event.usage })
    else if (event.type === 'abort') messages.push({ id: event.eventId, kind: 'abort', createdAt: event.createdAt, reason: event.reason })
    else if (event.type === 'change-set') messages.push({ id: event.eventId, kind: 'change-set', createdAt: event.createdAt, changeSetId: event.changeSetId, state: event.state, data: event.displayData })
    else if (event.type === 'invocation') messages.push({ id: event.eventId, kind: 'invocation', createdAt: event.createdAt, invocationId: event.invocationId, title: event.title, state: event.state, output: event.output, error: event.error })
    else if (event.type === 'compacting') messages.push({ id: event.eventId, kind: 'compacting', createdAt: event.createdAt, state: event.state, removedEventCount: event.removedEventCount })
    else if (event.type === 'client-tool-command') messages.push({ id: event.eventId, kind: 'client-command', createdAt: event.createdAt, toolCallId: event.toolCallId, toolName: event.toolName })
    else if (event.type === 'conversation-updated') messages.push({ id: event.eventId, kind: 'conversation-updated', createdAt: event.createdAt, title: event.title })
  }
  return messages
}
