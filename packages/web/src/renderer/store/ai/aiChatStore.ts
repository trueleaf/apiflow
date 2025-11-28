import { defineStore } from 'pinia';
import type { OpenAiRequestBody, OpenAiResponseBody } from '@src/types/ai/agent.type';

type StreamCallbacks = {
  onData: (chunk: Uint8Array) => void;
  onEnd: () => void;
  onError: (err: Error | string) => void;
};

export const useAiChatStore = defineStore('aiChatStore', () => {
  // 非流式聊天
  const chat = async (body: OpenAiRequestBody): Promise<OpenAiResponseBody> => {
    if (!window.electronAPI?.aiManager) {
      throw new Error('AI Manager 未初始化');
    }
    return await window.electronAPI.aiManager.chat(body);
  };
  // 流式聊天
  const chatStream = (body: OpenAiRequestBody, callbacks: StreamCallbacks) => {
    if (!window.electronAPI?.aiManager) {
      throw new Error('AI Manager 未初始化');
    }
    return window.electronAPI.aiManager.chatStream(body, callbacks);
  };
  // 检查 AI 功能是否可用
  const isAvailable = () => {
    return !!window.electronAPI?.aiManager;
  };
  return {
    chat,
    chatStream,
    isAvailable,
  };
});
