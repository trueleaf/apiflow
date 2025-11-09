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

// AI 聊天选项类型
export type ChatWithTextOptions = {
  maxTokens?: number;
  model?: 'DeepSeek';
};

// AI JSON 聊天选项类型（扩展基础选项）
export type ChatWithJsonTextOptions = {
  maxTokens?: number;
};

// 通用响应类型
import type { CommonResponse } from '@src/types/project';

// 流式回调函数类型
export type StreamCallback = (chunk: string) => void;
export type StreamEndCallback = () => void;
export type StreamErrorCallback = (response: CommonResponse<string>) => void;

// 流式聊天选项类型
export type ChatWithTextStreamOptions = {
  requestId: string;
  onData: StreamCallback;
  onEnd: StreamEndCallback;
  onError: StreamErrorCallback;
  model?: string;
  maxTokens?: number;
};


export type AgentMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
}