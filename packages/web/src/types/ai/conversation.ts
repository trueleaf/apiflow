import type { Language } from '@src/types'

export type ConversationMode = 'agent' | 'ask'

export type ConversationMessageKind =
  | 'question'
  | 'response'
  | 'thinking'
  | 'tool-group'
  | 'tool-call'
  | 'loading'
  | 'error'
  | 'info'

export type ConversationToolCallStatus = 'loading' | 'success' | 'error'

export type ConversationToolCallTokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export type ConversationToolCall = {
  toolName: string;
  arguments: Record<string, unknown>;
  result?: string;
  error?: string;
}

export type ConversationToolGroup = {
  tools: string[];
  iteration: number;
  status: 'completed';
}

export type ConversationMessage =
  | { id: string; kind: 'question'; content: string; createdAt: number; language?: Language }
  | { id: string; kind: 'response'; content: string; createdAt: number; language?: Language }
  | { id: string; kind: 'thinking'; content: string; createdAt: number; language?: Language }
  | { id: string; kind: 'loading'; content: string; createdAt: number }
  | { id: string; kind: 'error'; content: string; createdAt: number; language?: Language }
  | { id: string; kind: 'info'; content: string; createdAt: number; language?: Language }
  | { id: string; kind: 'tool-group'; content: string; createdAt: number; toolGroup: ConversationToolGroup; language?: Language }
  | {
    id: string;
    kind: 'tool-call';
    content: string;
    createdAt: number;
    status: ConversationToolCallStatus;
    toolCall: ConversationToolCall;
    tokenUsage?: ConversationToolCallTokenUsage;
    llmOutput?: string;
    language?: Language;
  }

export type ConversationCacheData = {
  agentMessages: ConversationMessage[];
  askMessages: ConversationMessage[];
  updatedAt: number;
}

