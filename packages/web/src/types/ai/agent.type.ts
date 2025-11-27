
/*
|--------------------------------------------------------------------------
| openai格式消息、请求参数、消息体
|--------------------------------------------------------------------------
*/
export interface LLMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}
export interface LLRequestBody {
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
export interface LLResponseBody {
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
export interface LLStreamChunk {
  id?: string;
  model?: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string | null;
  }>;
}
/*
|--------------------------------------------------------------------------
| 大模型统一配置类型
|--------------------------------------------------------------------------
*/
export type LLMProviderSettings = {
  id: string;
  name: string;
  provider: 'deepseek' | 'openai';
  apiKey: string;
  baseURL: string;
  model: string;
}


export type PromptItem = {
  /**
   * 提示词应用场景描述
   */
  description: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}