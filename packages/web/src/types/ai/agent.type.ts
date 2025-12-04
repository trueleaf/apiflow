
/*
|--------------------------------------------------------------------------
| openai格式消息、请求参数、消息体
|--------------------------------------------------------------------------
*/
export type CustomHeader = {
  key: string;
  value: string;
}
export type LLMProviderType = 'DeepSeek' | 'OpenAICompatible';
export type DeepSeekModel = 'deepseek-chat' | 'deepseek-reasoner';
export type LLMProviderSettings = {
  id: string;
  name: string;
  provider: LLMProviderType;
  apiKey: string;
  baseURL: string;
  model: string;
  customHeaders: CustomHeader[];
}

export interface LLMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}
export interface OpenAiRequestBody {
  model: string;
  messages: LLMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;

  // 支持工具调用 (OpenAI format)
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description?: string;
      parameters: Record<string, any>;
    };
  }>;

  response_format?: {
    type: 'json_object' | 'text';
  };
}
export interface OpenAiResponseBody {
  id: string;
  object: string;
  created: number;
  model: string;

  choices: Array<{
    index: number;
    message: LLMessage;
    finish_reason: string | null;
  }>;
}
export interface OpenAiStreamChunk {
  id?: string;
  model?: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
      reasoning_content?: string;
    };
    finish_reason?: string | null;
  }>;
}
/*
|--------------------------------------------------------------------------
| Agent 工具调用相关类型
|--------------------------------------------------------------------------
*/
// DeepSeek function call 格式的工具定义
export type ToolDefinition = {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
};
// 工具调用结果
export type ToolExecuteResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  needConfirmation?: boolean;
};
// Agent 工具定义
export type AgentTool = {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
  requireConfirmation: boolean;
  execute: (args: Record<string, unknown>) => Promise<ToolExecuteResult>;
};
// LLM 响应中的工具调用
export type ToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};
// 带工具调用的 LLM 消息
export type LLMessageWithToolCalls = {
  role: 'assistant';
  content: string | null;
  tool_calls?: ToolCall[];
};
// 工具响应消息
export type ToolMessage = {
  role: 'tool';
  tool_call_id: string;
  content: string;
};
// 扩展的 OpenAI 响应体（支持 tool_calls）
export type OpenAiResponseBodyWithTools = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: LLMessageWithToolCalls;
    finish_reason: 'stop' | 'tool_calls' | 'length' | null;
  }>;
};
// Agent 步骤执行状态
export type AgentStepStatus = 'pending' | 'running' | 'completed' | 'error';
// Agent 执行步骤
export type AgentStep = {
  id: string;
  type: 'working' | 'thinking' | 'tool_call' | 'tool_result' | 'final_answer';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: ToolExecuteResult;
  timestamp: string;
  needConfirmation?: boolean;
  status?: AgentStepStatus;
};
// Agent 执行状态
export type AgentStatus = 'idle' | 'thinking' | 'calling' | 'waiting_confirmation' | 'finished' | 'error';
/*
|--------------------------------------------------------------------------
| 大模型统一配置类型
|--------------------------------------------------------------------------
*/
export type PromptItem = {
  description: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}