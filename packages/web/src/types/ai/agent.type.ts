
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
| 大模型统一配置类型
|--------------------------------------------------------------------------
*/
export type PromptItem = {
  /**
   * 提示词应用场景描述
   */
  description: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}