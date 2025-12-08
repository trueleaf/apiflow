import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatRequestBody, OpenAiResponseBody, LLMProviderSettings, LLMProviderType } from '@src/types/ai/agent.type';
import { generateDeepSeekProvider } from '@/helper';
import { llmProviderCache } from '@/cache/ai/llmProviderCache';

type StreamCallbacks = {
  onData: (chunk: Uint8Array) => void;
  onEnd: () => void;
  onError: (err: Error | string) => void;
};

export const useLLMClientStore = defineStore('llmClientStore', () => {
  const cached = llmProviderCache.getLLMProvider();
  const activeProvider = ref<LLMProviderSettings>(cached || generateDeepSeekProvider());

  watch(() => activeProvider.value,
    (newVal) => {
      window.electronAPI!.aiManager.updateConfig(JSON.parse(JSON.stringify(newVal)));
      llmProviderCache.setLLMProvider(newVal);
    },
    { deep: true, immediate: true }
  );
  // 更新 Provider 类型
  const changeProviderType = (providerType: LLMProviderType) => {
    activeProvider.value.provider = providerType;
    if (providerType === 'DeepSeek') {
      activeProvider.value.baseURL = 'https://api.deepseek.com/chat/completions';
      activeProvider.value.model = 'deepseek-chat';
      activeProvider.value.customHeaders = [];
    } else {
      activeProvider.value.baseURL = '';
      activeProvider.value.model = '';
    }
  };
  // 更新配置字段
  const updateConfig = (updates: Partial<Omit<LLMProviderSettings, 'id'>>) => {
    Object.assign(activeProvider.value, updates);
  };
  // 重置配置
  const resetConfig = () => {
    activeProvider.value = generateDeepSeekProvider();
  };
  // 初始化（从缓存加载）
  const initFromCache = () => {
    const cached = llmProviderCache.getLLMProvider();
    if (cached) {
      activeProvider.value = cached;
    }
  };
  // 非流式聊天
  const chat = async (body: ChatRequestBody): Promise<OpenAiResponseBody> => {
    if (!window.electronAPI?.aiManager) {
      throw new Error('AI Manager 未初始化');
    }
    return await window.electronAPI.aiManager.chat(body);
  };
  // 流式聊天
  const chatStream = (body: ChatRequestBody, callbacks: StreamCallbacks) => {
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
    activeProvider,
    changeProviderType,
    updateConfig,
    resetConfig,
    initFromCache,
    chat,
    chatStream,
    isAvailable,
  };
});
