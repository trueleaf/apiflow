import type { z } from 'zod'
import type { Language } from '..'

export type AgentToolEffect = 'read' | 'navigate' | 'propose' | 'write' | 'runtime'
export type AgentToolRiskLevel = 'low' | 'medium' | 'high'
export type AgentToolContext = {
  projectId: string | null;
  activeNodeId: string | null;
  activeTabType: string | null;
  language: Language;
  networkMode: 'offline' | 'online';
  abortSignal: AbortSignal;
  conversationId: string;
  runId: string;
  toolCallId?: string;
}
export type AgentToolResult = {
  success: boolean;
  errorCode?: string;
  retryable?: boolean;
  summary: string;
  displayData?: unknown;
  modelData?: unknown;
  changeSetId?: string;
}
export type AgentToolDefinition<TInput extends Record<string, unknown> = Record<string, unknown>> = {
  name: string;
  title: string;
  description: string;
  domain: 'workspace' | 'project' | 'http' | 'websocket' | 'mock' | 'variables' | 'runtime';
  effect: AgentToolEffect;
  scope: 'offline';
  riskLevel: AgentToolRiskLevel;
  requiresApproval: boolean | ((input: TInput) => boolean | Promise<boolean>);
  inputSchema: z.ZodType<TInput>;
  execute: (input: TInput, context: AgentToolContext) => Promise<AgentToolResult>;
}
