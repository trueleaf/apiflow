/*
|--------------------------------------------------------------------------
| Copilot 消息类型（用于 UI）
|--------------------------------------------------------------------------
*/
// export type Tool
export type AskMessage = {
  id: string;
  type: "ask";
  content: string;
  timestamp: string;
  sessionId: string;
}
export type TextResponseMessage = {
  id: string;
  type: "textResponse";
  content: string;
  timestamp: string;
  sessionId: string;
}
export type LoadingMessage = {
  id: string;
  type: "loading";
  content: string;
  timestamp: string;
  sessionId: string;
}
export type CopilotMessage = AskMessage | LoadingMessage | TextResponseMessage;

export type ToolExecuteResult = {
  code: number;
  data: unknown;
}
export type AgentToolType = 'httpNode' | 'websocketNode' | 'httpMockNode' | 'websocketMockNode' | 'projectManager' | 'history' | 'undoRedo' | 'sendRequest'
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
  execute?: (args: Record<string, unknown>) => Promise<ToolExecuteResult>;
}
export type OpenAiToolDefinition = {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
}

