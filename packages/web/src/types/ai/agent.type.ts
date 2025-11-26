
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
export type LLMProviderSettings =
  | BuiltInProviderSettings
  | CustomProviderSettings;

//内置模型
export type BuiltInProvider =
  | 'deepseek'

export interface BuiltInProviderSettings {
  type: 'builtin';
  provider: BuiltInProvider;
  apiKey: string;
  baseURL?: string;  // 允许用户覆盖默认值
  model?: string; 
}
export interface CustomProviderSettings {
  type: 'custom';
  name: string;
  apiKey: string;
  baseURL: string;
  model: string;
  extraHeaders?: Record<string, string>;
}
/*
|--------------------------------------------------------------------------
| 内置大模型
|--------------------------------------------------------------------------
*/
export interface BuiltInProviderSettings {
  type: 'builtin';
  provider: BuiltInProvider;
  apiKey: string;
  baseURL?: string;  
  model?: string; 
}
export interface BuiltInProviderConfig {
  baseURL: string;
  models: string[];
}
/*
|--------------------------------------------------------------------------
| Token统计
|--------------------------------------------------------------------------
*/
export interface LLUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
