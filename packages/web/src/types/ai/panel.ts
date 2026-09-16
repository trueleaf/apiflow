import type { AgentApprovalState, AgentRunState, AgentToolState, AgentUsage } from './agentEvent'

export type PanelToolMessage = { id: string; kind: 'tool'; createdAt: number; runId: string; step: number; toolCallId: string; toolName: string; title: string; state: AgentToolState; target?: string; source: string; input?: Record<string, unknown>; streamText?: string; output?: unknown; error?: string; changeSetId?: string }
export type PanelUIMessage =
  | { id: string; kind: 'user'; createdAt: number; runId: string; text: string }
  | { id: string; kind: 'assistant'; createdAt: number; runId: string; text: string; reasoning: string; streaming: boolean }
  | PanelToolMessage
  | { id: string; kind: 'tool-group'; createdAt: number; runId: string; step: number; tools: PanelToolMessage[] }
  | { id: string; kind: 'approval'; createdAt: number; messageId: string; approvalId: string; toolCallId: string; toolName: string; state: AgentApprovalState; approved?: boolean; reason?: string; changeSetId?: string; data?: unknown }
  | { id: string; kind: 'source'; createdAt: number; sourceType: 'url' | 'document'; sourceId: string; title: string; url?: string; mediaType?: string; filename?: string }
  | { id: string; kind: 'file'; createdAt: number; mediaType: string; filename?: string; url?: string }
  | { id: string; kind: 'error'; createdAt: number; runId: string; errorCode: string; text: string; retryable: boolean }
  | { id: string; kind: 'run-state'; createdAt: number; runId: string; startedAt?: number; state: AgentRunState; detail?: string }
  | { id: string; kind: 'finish'; createdAt: number; finishReason: string; usage: AgentUsage }
  | { id: string; kind: 'abort'; createdAt: number; reason?: string }
  | { id: string; kind: 'change-set'; createdAt: number; changeSetId: string; state: string; data?: unknown }
  | { id: string; kind: 'invocation'; createdAt: number; invocationId: string; title: string; state: 'pending' | 'running' | 'completed' | 'failed' | 'interrupted'; output?: unknown; error?: string }
  | { id: string; kind: 'compacting'; createdAt: number; state: 'start' | 'end'; removedEventCount?: number }
  | { id: string; kind: 'client-command'; createdAt: number; toolCallId: string; toolName: string }
  | { id: string; kind: 'conversation-updated'; createdAt: number; title?: string }
