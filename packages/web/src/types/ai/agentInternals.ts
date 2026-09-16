import type { ModelMessage, ToolApprovalResponse, ToolSet } from 'ai'
import type { AgentEvent, AgentEventBase } from './agentEvent'
import type { AgentRunRequest } from './agentRuntime'
import type { AgentToolContext, AgentToolDefinition, AgentToolResult } from './agentTool'

export type AgentRuntimeResource = { kind: 'websocket' | 'httpMock' | 'websocketMock'; nodeId: string }

export type PendingClientTool = {
  runId: string;
  toolCallId: string;
  resolve: (result: AgentToolResult) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}
export type PendingApproval = {
  approvalId: string;
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
  changeSetId?: string;
}
export type RunRecord = {
  request: AgentRunRequest;
  controller: AbortController;
  sequence: number;
  messages: ModelMessage[];
  tools: ToolSet;
  approvals: PendingApproval[];
  approvalResponses: ToolApprovalResponse[];
  readSignatures: Set<string>;
  changeSignatures: Set<string>;
  knownIds: Set<string>;
  loopBlocked: boolean;
  completed: boolean;
  step: number;
  activeTools: string[];
  resources: AgentRuntimeResource[];
  context: AgentToolContext;
  definitions: AgentToolDefinition[];
  toolExecutions: Map<string, { signature: string; result: Promise<AgentToolResult> }>;
  finishReason?: string;
  readyApprovalId?: string;
}
export type AgentEventData = AgentEvent extends infer Item ? Item extends AgentEventBase ? Omit<Item, keyof AgentEventBase> : never : never

export type ClientToolExecutor = (toolName: string, input: Record<string, unknown>, context: AgentToolContext) => Promise<AgentToolResult>
