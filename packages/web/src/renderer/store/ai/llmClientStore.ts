import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatRequestBody, OpenAiResponseBody, LLMProviderSetting, ChatStreamCallbacks } from '@src/types/ai/agent.type';
import { generateDeepSeekProvider, isElectron, logger } from '@/helper';
import { llmProviderCache } from '@/cache/ai/llmProviderCache';
import { config } from '@src/config/config';
import { request, requestStream } from '@/api/api';

// AI 请求超时时间（60秒）
const AI_REQUEST_TIMEOUT = 60 * 1000;
// 获取服务器LLM API地址
const getServerLLMUrl = (stream: boolean) => {
  const baseUrl = config.renderConfig.httpRequest.url;
  return stream ? `${baseUrl}/api/llm/chat/stream` : `${baseUrl}/api/llm/chat`;
};
// Web 模式下使用 axios 调用 LLM API（支持免费API）
const webChat = async (body: ChatRequestBody, config: LLMProviderSetting, signal?: AbortSignal, useFreeLLM = false): Promise<OpenAiResponseBody> => {
  const targetUrl = useFreeLLM ? getServerLLMUrl(false) : config.baseURL;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // 非免费 LLM 需要添加用户的 Authorization 和自定义 headers
  if (!useFreeLLM) {
    if (!config.apiKey || !config.baseURL) {
      throw new Error('请先配置 API Key 和 Base URL');
    }
    headers['Authorization'] = `Bearer ${config.apiKey}`;
    config.customHeaders?.forEach(h => {
      if (h.key) headers[h.key] = h.value;
    });
  }
  
  let extraBody: Record<string, unknown> = {};
  if (!useFreeLLM) {
    const extraBodyText = config.extraBody?.trim() ?? '';
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
  }
  
  const requestBody = { ...extraBody, ...body, model: useFreeLLM ? undefined : config.model, stream: false };
  const requestInfo = { url: targetUrl, method: 'POST', headers, body: requestBody };
  logger.info('llmRequestParams', { payload: JSON.stringify(requestInfo) });
  
  try {
    const response = await request.post(targetUrl, requestBody, {
      headers,
      signal,
      timeout: AI_REQUEST_TIMEOUT,
    });
    // axios 响应拦截器会返回 res.data，所以这里直接使用 response
    return response as unknown as OpenAiResponseBody;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        throw new Error('请求已取消');
      }
      if (err.message?.includes('timeout')) {
        throw new Error('请求超时，请稍后重试');
      }
    }
    throw err;
  }
};
// Web 模式下使用 axios + ReadableStream 实现流式调用（支持免费API）
const webChatStream = (body: ChatRequestBody, config: LLMProviderSetting, callbacks: ChatStreamCallbacks, useFreeLLM = false) => {
  const abortController = new AbortController();
  const targetUrl = useFreeLLM ? getServerLLMUrl(true) : config.baseURL;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // 非免费 LLM 需要添加用户的 Authorization 和自定义 headers
  if (!useFreeLLM) {
    if (!config.apiKey || !config.baseURL) {
      callbacks.onError(new Error('请先配置 API Key 和 Base URL'));
      return { abort: () => abortController.abort() };
    }
    headers['Authorization'] = `Bearer ${config.apiKey}`;
    config.customHeaders?.forEach(h => {
      if (h.key) headers[h.key] = h.value;
    });
  }
  
  let extraBody: Record<string, unknown> = {};
  if (!useFreeLLM) {
    const extraBodyText = config.extraBody?.trim() ?? '';
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
  }
  
  const requestBody = { ...extraBody, ...body, model: useFreeLLM ? undefined : config.model, stream: true };
  const requestInfo = { url: targetUrl, method: 'POST', headers, body: requestBody };
  logger.info('llmRequestParams', { payload: JSON.stringify(requestInfo) });
  
  (async () => {
    try {
      const stream = await requestStream(targetUrl, requestBody, {
        headers,
        signal: abortController.signal,
      });
      
      const reader = stream.getReader();
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
      if (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError')) {
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
  const useFreeLLM = ref(true);
  // 更新配置字段
  const updateLLMConfig = (updates: Partial<Omit<LLMProviderSetting, 'id'>>) => {
    Object.assign(LLMConfig.value, updates);
    syncConfig(LLMConfig.value);
  };
  // 更新是否使用免费LLM
  const setUseFreeLLM = (value: boolean) => {
    useFreeLLM.value = value;
    llmProviderCache.setUseFreeLLM(value);
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
    useFreeLLM.value = llmProviderCache.getUseFreeLLM();
  };
  // 非流式聊天
  const chat = async (body: ChatRequestBody, signal?: AbortSignal): Promise<OpenAiResponseBody> => {
    if (isElectron() && window.electronAPI?.aiManager) {
      return await window.electronAPI.aiManager.chat(body, useFreeLLM.value);
    }
    return await webChat(body, LLMConfig.value, signal, useFreeLLM.value);
  };
  // 流式聊天
  const chatStream = (body: ChatRequestBody, callbacks: ChatStreamCallbacks) => {
    if (isElectron() && window.electronAPI?.aiManager) {
      return window.electronAPI.aiManager.chatStream(body, callbacks, useFreeLLM.value);
    }
    return webChatStream(body, LLMConfig.value, callbacks, useFreeLLM.value);
  };
  // 检查 AI 功能是否可用
  const isAvailable = () => {
    if (useFreeLLM.value) {
      return true;
    }
    const { model, baseURL, apiKey } = LLMConfig.value;
    return !!model && !!baseURL && !!apiKey;
  };
  return {
    LLMConfig,
    useFreeLLM,
    updateLLMConfig,
    setUseFreeLLM,
    resetLLMConfig,
    initLLMConfig,
    chat,
    chatStream,
    isAvailable,
  };
});
