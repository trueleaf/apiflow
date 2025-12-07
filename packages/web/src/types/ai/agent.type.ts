
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

export type OpenAiToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}
export type LLMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: OpenAiToolCall[];
  tool_call_id?: string;
}
export type OpenAiRequestBody = {
  model: string;
  messages: LLMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description?: string;
      parameters: Record<string, unknown>;
    };
  }>;
  response_format?: {
    type: 'json_object' | 'text';
  };
}
export type OpenAiResponseBody = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: LLMessage;
    finish_reason: 'stop' | 'tool_calls' | 'length' | 'content_filter' | null;
  }>;
}
export type ToolCallChunk = {
  index: number;
  id?: string;
  type?: 'function';
  function?: {
    name?: string;
    arguments?: string;
  };
}
export type OpenAiStreamChunk = {
  id?: string;
  model?: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
      reasoning_content?: string;
      tool_calls?: ToolCallChunk[];
    };
    finish_reason?: 'stop' | 'tool_calls' | 'length' | 'content_filter' | null;
  }>;
}
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