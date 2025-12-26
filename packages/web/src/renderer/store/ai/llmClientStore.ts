import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatRequestBody, OpenAiResponseBody, LLMProviderSetting, ChatStreamCallbacks } from '@src/types/ai/agent.type';
import { generateDeepSeekProvider, isElectron, logger } from '@/helper';
import { llmProviderCache } from '@/cache/ai/llmProviderCache';

// AI 请求超时时间（60秒）
const AI_REQUEST_TIMEOUT = 60 * 1000;
// Web 模式下使用 fetch 调用 LLM API
const webChat = async (body: ChatRequestBody, config: LLMProviderSetting, signal?: AbortSignal): Promise<OpenAiResponseBody> => {
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
  const extraBodyText = config.extraBody?.trim() ?? '';
  let extraBody: Record<string, unknown> = {};
  if (extraBodyText) {
    try {
      const parsed: unknown = JSON.parse(extraBodyText);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        extraBody = parsed as Record<string, unknown>;
      }
    } catch {
      extraBody = {};
    }
  }
  // 创建超时控制器
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), AI_REQUEST_TIMEOUT);
  // 合并外部信号和超时信号
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;
  const requestBody = { ...extraBody, ...body, model: config.model, stream: false };
  const requestInfo = { url: config.baseURL, method: 'POST', headers, body: requestBody };
  logger.info('llmRequestParams', { payload: JSON.stringify(requestInfo) });
  try {
    const response = await fetch(config.baseURL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: combinedSignal
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        if (signal?.aborted) {
          throw new Error('请求已取消');
        }
        throw new Error('请求超时，请稍后重试');
      }
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};
// Web 模式下使用 fetch + ReadableStream 实现流式调用
const webChatStream = (body: ChatRequestBody, config: LLMProviderSetting, callbacks: ChatStreamCallbacks) => {
  const abortController = new AbortController();
  if (!config.apiKey || !config.baseURL) {
    callbacks.onError(new Error('请先配置 API Key 和 Base URL'));
    return { abort: () => abortController.abort() };
  }
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  };
  config.customHeaders?.forEach(h => {
    if (h.key) headers[h.key] = h.value;
  });
  const extraBodyText = config.extraBody?.trim() ?? '';
  let extraBody: Record<string, unknown> = {};
  if (extraBodyText) {
    try {
      const parsed: unknown = JSON.parse(extraBodyText);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        extraBody = parsed as Record<string, unknown>;
      }
    } catch {
      extraBody = {};
    }
  }
  const requestBody = { ...extraBody, ...body, model: config.model, stream: true };
  const requestInfo = { url: config.baseURL, method: 'POST', headers, body: requestBody };
  logger.info('llmRequestParams', { payload: JSON.stringify(requestInfo) });
  (async () => {
    try {
      const response = await fetch(config.baseURL, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: abortController.signal
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
      if (err instanceof Error && err.name === 'AbortError') {
        callbacks.onEnd();
        return;
      }
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  })();
  return { abort: () => abortController.abort() };
};
// 同步配置到缓存和主进程
const syncConfig = (config: LLMProviderSetting) => {
  llmProviderCache.setLLMProvider(config);
  if (isElectron() && window.electronAPI?.aiManager) {
    window.electronAPI.aiManager.updateConfig(JSON.parse(JSON.stringify(config)));
  }
};
export const useLLMClientStore = defineStore('llmClientStore', () => {
  const LLMConfig = ref<LLMProviderSetting>(generateDeepSeekProvider());
  // 更新配置字段
  const updateLLMConfig = (updates: Partial<Omit<LLMProviderSetting, 'id'>>) => {
    Object.assign(LLMConfig.value, updates);
    syncConfig(LLMConfig.value);
  };
  // 重置配置
  const resetLLMConfig = () => {
    LLMConfig.value = generateDeepSeekProvider();
    syncConfig(LLMConfig.value);
  };
  // 初始化（从缓存加载）
  const initLLMConfig = () => {
    const cached = llmProviderCache.getLLMProvider();
    if (cached) {
      LLMConfig.value = cached;
      syncConfig(cached);
    }
  };
  // 非流式聊天
  const chat = async (body: ChatRequestBody, signal?: AbortSignal): Promise<OpenAiResponseBody> => {
    if (isElectron() && window.electronAPI?.aiManager) {
      return await window.electronAPI.aiManager.chat(body);
    }
    return await webChat(body, LLMConfig.value, signal);
  };
  // 流式聊天
  const chatStream = (body: ChatRequestBody, callbacks: ChatStreamCallbacks) => {
    if (isElectron() && window.electronAPI?.aiManager) {
      return window.electronAPI.aiManager.chatStream(body, callbacks);
    }
    return webChatStream(body, LLMConfig.value, callbacks);
  };
  // 检查 AI 功能是否可用
  const isAvailable = () => {
    const { model, baseURL, apiKey } = LLMConfig.value;
    return !!model && !!baseURL && !!apiKey;
  };
  return {
    LLMConfig,
    updateLLMConfig,
    resetLLMConfig,
    initLLMConfig,
    chat,
    chatStream,
    isAvailable,
  };
});
