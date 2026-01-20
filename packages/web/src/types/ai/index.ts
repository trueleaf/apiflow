export type {
  ConversationMode,
  ConversationMessageKind,
  ConversationToolCallStatus,
  ConversationToolCallTokenUsage,
  ConversationToolCall,
  ConversationToolGroup,
  ConversationMessage,
  ConversationCacheData,
} from './conversation'

export type ToolExecuteResult = {
  code: number;
  data: unknown;
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

