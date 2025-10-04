// ============================================================================
// AI相关模块
// 包含AI服务的请求和响应类型
// ============================================================================

// DeepSeek API 消息类型
export type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// DeepSeek API 请求体类型
export type DeepSeekRequestBody = {
  model: string;
  messages: DeepSeekMessage[];
  max_tokens?: number;
  temperature?: number;
  response_format?: {
    type: 'json_object';
  };
};

// DeepSeek API 响应类型
export type DeepSeekResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};
