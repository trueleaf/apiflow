/*
|--------------------------------------------------------------------------
| AgentView 消息类型（用于 UI）
|--------------------------------------------------------------------------
*/
// export type Tool
export type AskMessage = {
  id: string;
  type: "ask";
  content: string;
  timestamp: string;
  sessionId: string;
  mode: 'agent' | 'ask';
}
export type TextResponseMessage = {
  id: string;
  type: "textResponse";
  content: string;
  timestamp: string;
  sessionId: string;
  mode: 'agent' | 'ask';
}
export type LoadingMessage = {
  id: string;
  type: "loading";
  content: string;
  timestamp: string;
  sessionId: string;
  mode: 'agent' | 'ask';
}
export type AgentToolCallStatus = 'pending' | 'running' | 'success' | 'error' | 'waiting-confirm' | 'cancelled'
export type TodoItemStatus = 'pending' | 'running' | 'success' | 'error' | 'skipped'
export type TodoItem = {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  status: TodoItemStatus;
}
export type AgentToolCallInfo = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: AgentToolCallStatus;
  result?: {
    code: number;
    data: unknown;
  };
  error?: string;
  tokenUsage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
export type AgentExecutionMessage = {
  id: string;
  type: "agentExecution";
  sessionId: string;
  timestamp: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'aborted';
  toolCalls: AgentToolCallInfo[];
  thinkingContent?: string;
  mode: 'agent' | 'ask';
  isStreaming?: boolean;
  todoList?: TodoItem[];
  currentTodoId?: string;
}
export type ErrorMessage = {
  id: string;
  type: "error";
  errorType: 'network' | 'api' | 'unknown';
  content: string;
  errorDetail?: string;
  originalPrompt: string;
  timestamp: string;
  sessionId: string;
  mode: 'agent' | 'ask';
}
export type AgentViewMessage = AskMessage | LoadingMessage | TextResponseMessage | AgentExecutionMessage | ErrorMessage;

export type ToolExecuteResult = {
  code: number;
  data: unknown;
}
export type AgentToolType = 'httpNode' | 'websocketNode' | 'httpMockNode' | 'websocketMockNode' | 'projectManager' | 'history' | 'undoRedo' | 'sendRequest' | 'nodeOperation' | 'variable' | 'common'
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

