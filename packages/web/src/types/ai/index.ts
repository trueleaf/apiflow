import type { CommonResponse } from '@src/types/project';

// OpenAI API 消息类型
export type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// OpenAI API 请求体类型
export type OpenAIRequestBody = {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  response_format?: {
    type: 'json_object';
  };
};

// OpenAI API 响应类型
export type OpenAIResponse = {
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

// AI 聊天选项类型
export type OpenAIRequestMode = 'text' | 'json';

// 流式回调函数类型
export type StreamCallback = (chunk: string) => void;
export type StreamEndCallback = () => void;
export type StreamErrorCallback = (response: CommonResponse<string>) => void;

type StreamRequestCallbacks = {
  onData?: StreamCallback;
  onEnd?: StreamEndCallback;
  onError?: StreamErrorCallback;
};

export type SendStreamRequestStartParams = {
  action: 'start';
  requestId: string;
  requestBody: OpenAIRequestBody & { stream: true };
} & StreamRequestCallbacks;

export type SendStreamRequestCancelParams = {
  action: 'cancel';
  requestId: string;
};

export type SendStreamRequestParams = SendStreamRequestStartParams | SendStreamRequestCancelParams;

/*
|--------------------------------------------------------------------------
| Agent 
|--------------------------------------------------------------------------
*/
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
export type AgentMessage = AskMessage | LoadingMessage | TextResponseMessage;

