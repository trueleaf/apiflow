export type { ConversationMode } from './conversation'

export type {
  ToolErrorType,
  ToolErrorResponse,
  ToolSuccessResponse,
  ToolResponse,
} from './toolError'

export type {
  AgentRunState,
  AgentToolState,
  AgentApprovalState,
  AgentUsage,
  AgentEventBase,
  AgentEvent,
  AgentConversation,
  AgentConversationCache,
} from './agentEvent'
export type {
  AgentToolEffect,
  AgentToolRiskLevel,
  AgentToolContext,
  AgentToolResult,
  AgentToolDefinition,
} from './agentTool'
export type {
  ChangeSetStatus,
  ChangeNodeType,
  ChangeOperation,
  ChangeSet,
  ChangeSetPreviewItem,
  ChangeSetPreview,
} from './changeSet'
export type {
  AgentPromptMessage,
  AgentRuntimeContext,
  AgentRunRequest,
  AgentRunResponse,
  AgentAbortRequest,
  AgentApprovalResponseRequest,
  AgentClientToolResult,
  AgentRuntimeEventPayload,
} from './agentRuntime'
export type { PanelToolMessage, PanelUIMessage } from './panel'

//工具执行结果（兼容旧格式和新格式）
export type ToolExecuteResult = {
  code: number;
  data?: unknown;
  error?: {
    type: string;
    message: string;
    details?: Record<string, unknown>;
    retryable?: boolean;
    suggestions?: string[];
  };
}

export type AgentToolType =
  'httpNode'
  | 'websocketNode'
  | 'httpMockNode'
  | 'websocketMockNode'
  | 'projectManager'
  | 'history'
  | 'undoRedo'
  | 'sendRequest'
  | 'nodeOperation'
  | 'variable'
  | 'common'
  | 'commonHeader'

export type AgentTool = {
  name: string;
  description: string;
  type: AgentToolType;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
  needConfirm: boolean;
  execute: (args: Record<string, unknown>) => Promise<ToolExecuteResult>;
}

export type OpenAiToolDefinition = {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
}
