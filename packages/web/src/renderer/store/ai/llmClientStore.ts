import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatRequestBody, OpenAiResponseBody, LLMProviderSettings, LLMProviderType } from '@src/types/ai/agent.type';
import { generateDeepSeekProvider, isElectron } from '@/helper';
import { llmProviderCache } from '@/cache/ai/llmProviderCache';

type StreamCallbacks = {
  onData: (chunk: Uint8Array) => void;
  onEnd: () => void;
  onError: (err: Error | string) => void;
};

// Web 模式下使用 fetch 调用 LLM API
const webChat = async (body: ChatRequestBody, config: LLMProviderSettings): Promise<OpenAiResponseBody> => {
  if (!config.apiKey || !config.baseURL) {
    throw new Error('请先配置 API Key 和 Base URL');
  }
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  };
  config.customHeaders?.forEach(h => {
    if (h.key) headers[h.key] = h.value;
  });
  const response = await fetch(config.baseURL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...body, model: config.model, stream: false })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
  }
  return await response.json();
};
// Web 模式下使用 fetch + ReadableStream 实现流式调用
const webChatStream = async (body: ChatRequestBody, config: LLMProviderSettings, callbacks: StreamCallbacks) => {
  if (!config.apiKey || !config.baseURL) {
    callbacks.onError(new Error('请先配置 API Key 和 Base URL'));
    return;
  }
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  };
  config.customHeaders?.forEach(h => {
    if (h.key) headers[h.key] = h.value;
  });
  try {
    const response = await fetch(config.baseURL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...body, model: config.model, stream: true })
    });
    if (!response.ok) {
      const errorText = await response.text();
      callbacks.onError(new Error(`API 请求失败: ${response.status} - ${errorText}`));
      return;
    }
    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError(new Error('无法获取响应流'));
      return;
    }
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        callbacks.onEnd();
        break;
      }
      if (value) {
        callbacks.onData(value);
      }
    }
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
};

export const useLLMClientStore = defineStore('llmClientStore', () => {
  const cached = llmProviderCache.getLLMProvider();
  const activeProvider = ref<LLMProviderSettings>(cached || generateDeepSeekProvider());

  watch(() => activeProvider.value,
    (newVal) => {
      if (isElectron() && window.electronAPI?.aiManager) {
        window.electronAPI.aiManager.updateConfig(JSON.parse(JSON.stringify(newVal)));
      }
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
    if (isElectron() && window.electronAPI?.aiManager) {
      return await window.electronAPI.aiManager.chat(body);
    }
    return await webChat(body, activeProvider.value);
  };
  // 流式聊天
  const chatStream = (body: ChatRequestBody, callbacks: StreamCallbacks) => {
    if (isElectron() && window.electronAPI?.aiManager) {
      return window.electronAPI.aiManager.chatStream(body, callbacks);
    }
    webChatStream(body, activeProvider.value, callbacks);
  };
  // 检查 AI 功能是否可用
  const isAvailable = () => {
    if (isElectron()) {
      return !!window.electronAPI?.aiManager;
    }
    return !!activeProvider.value.apiKey && !!activeProvider.value.baseURL;
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
