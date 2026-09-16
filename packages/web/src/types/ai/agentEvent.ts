import type { Language } from '..'

export type AgentRunState = 'queued' | 'running' | 'waiting_client_tool' | 'waiting_approval' | 'waiting_user_input' | 'cancelling' | 'completed' | 'cancelled' | 'failed' | 'interrupted'
export type AgentToolState = 'created' | 'running' | 'success' | 'denied' | 'responded' | 'error'
export type AgentApprovalState = 'requested' | 'approved' | 'denied' | 'expired'
export type AgentUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
}
export type AgentEventBase = {
  eventId: string;
  conversationId: string;
  runId: string;
  messageId: string;
  sequence: number;
  createdAt: number;
}
export type AgentEvent =
  | AgentEventBase & { type: 'user-message'; text: string; language: Language }
  | AgentEventBase & { type: 'run-state'; state: AgentRunState; detail?: string }
  | AgentEventBase & { type: 'text'; phase: 'start' | 'delta' | 'end'; text: string }
  | AgentEventBase & { type: 'reasoning'; phase: 'start' | 'delta' | 'end'; text: string }
  | AgentEventBase & { type: 'step-start'; step: number }
  | AgentEventBase & { type: 'tool'; toolCallId: string; toolName: string; title: string; state: AgentToolState; input?: Record<string, unknown>; inputText?: string; displayData?: unknown; error?: string; approvalId?: string; changeSetId?: string }
  | AgentEventBase & { type: 'approval'; toolCallId: string; toolName: string; approvalId: string; state: AgentApprovalState; approved?: boolean; reason?: string; changeSetId?: string; displayData?: unknown }
  | AgentEventBase & { type: 'source-url'; sourceId: string; url: string; title?: string }
  | AgentEventBase & { type: 'source-document'; sourceId: string; mediaType: string; title: string; filename?: string }
  | AgentEventBase & { type: 'file'; mediaType: string; filename?: string; url?: string }
  | AgentEventBase & { type: 'error'; errorCode: string; message: string; retryable: boolean }
  | AgentEventBase & { type: 'finish'; finishReason: string; usage: AgentUsage }
  | AgentEventBase & { type: 'abort'; reason?: string }
  | AgentEventBase & { type: 'client-tool-command'; commandId: string; toolCallId: string; toolName: string; input: Record<string, unknown> }
  | AgentEventBase & { type: 'conversation-updated'; title?: string }
  | AgentEventBase & { type: 'change-set'; changeSetId: string; state: string; displayData?: unknown }
  | AgentEventBase & { type: 'invocation'; invocationId: string; title: string; state: 'pending' | 'running' | 'completed' | 'failed' | 'interrupted'; output?: unknown; error?: string }
  | AgentEventBase & { type: 'compacting'; state: 'start' | 'end'; removedEventCount?: number }

export type AgentConversation = {
  version: 2;
  id: string;
  mode: 'agent' | 'ask';
  language: Language;
  events: AgentEvent[];
  updatedAt: number;
}
export type AgentConversationCache = {
  version: 2;
  conversations: AgentConversation[];
  migration?: {
    migratedAt: number;
    keptMessages: number;
    discardedMessages: number;
  };
}
