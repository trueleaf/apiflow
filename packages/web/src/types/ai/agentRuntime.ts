import type { Language } from '..'
import type { LLMProviderSetting } from './agent.type'
import type { AgentEvent } from './agentEvent'
import type { AgentToolResult } from './agentTool'

export type AgentPromptMessage = {
  role: 'user' | 'assistant';
  content: string;
}
export type AgentRuntimeContext = {
  projectId: string | null;
  activeNodeId: string | null;
  activeTabType: string | null;
  language: Language;
  networkMode: 'offline' | 'online';
}
export type AgentRunRequest = {
  conversationId: string;
  runId: string;
  messageId: string;
  mode: 'agent' | 'ask';
  prompt: string;
  history: AgentPromptMessage[];
  context: AgentRuntimeContext;
  provider: LLMProviderSetting;
}
export type AgentRunResponse = {
  accepted: boolean;
  runId: string;
  errorCode?: string;
  message?: string;
}
export type AgentAbortRequest = {
  conversationId: string;
  runId: string;
}
export type AgentApprovalResponseRequest = {
  conversationId: string;
  runId: string;
  messageId: string;
  approvalId: string;
  toolCallId: string;
  approved: boolean;
  reason?: string;
}
export type AgentClientToolResult = {
  conversationId: string;
  runId: string;
  messageId: string;
  commandId: string;
  toolCallId: string;
  result: AgentToolResult;
}
export type AgentRuntimeEventPayload = {
  event: AgentEvent;
}
