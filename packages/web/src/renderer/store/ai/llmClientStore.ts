import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatRequestBody, OpenAiResponseBody, LLMProviderSetting, ChatStreamCallbacks } from '@src/types/ai/agent.type';
import { generateDeepSeekProvider, isElectron, logger } from '@/helper';
import { llmProviderCache } from '@/cache/ai/llmProviderCache';
import { config } from '@src/config/config';
import { nanoid } from 'nanoid';
import { sha256 } from 'js-sha256';
import { parseUrl, getStrParams, getStrJsonBody, getStrHeader } from '@/api/sign';

// AI 请求超时时间（60秒）
const AI_REQUEST_TIMEOUT = 60 * 1000;
// 获取服务器LLM API地址
const getServerLLMUrl = (stream: boolean) => {
  const baseUrl = config.renderConfig.httpRequest.url;
  return stream ? `${baseUrl}/api/llm/chat/stream` : `${baseUrl}/api/llm/chat`;
};
// Web 模式下使用 fetch 调用 LLM API（支持免费API）
const webChat = async (body: ChatRequestBody, config: LLMProviderSetting, signal?: AbortSignal, useFreeLLM = false): Promise<OpenAiResponseBody> => {
  const targetUrl = useFreeLLM ? getServerLLMUrl(false) : config.baseURL;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // 如果使用免费LLM，添加签名
  if (useFreeLLM) {
    const timestamp = Date.now();
    const nonce = nanoid();
    const method = 'post';
    const parsedUrlInfo = parseUrl(targetUrl);
    const url = parsedUrlInfo.url;
    const strParams = getStrParams(parsedUrlInfo.queryParams);
    const strBody = getStrJsonBody(body as Record<string, unknown>);
    const { strHeader, sortedHeaderKeys } = getStrHeader(headers);
    const signContent = `${method}\n${url}\n${strParams}\n${strBody}\n${strHeader}\n${timestamp}\n${nonce}`;
    headers['x-sign'] = sha256(signContent);
    headers['x-sign-headers'] = sortedHeaderKeys.join(',');
    headers['x-sign-timestamp'] = String(timestamp);
    headers['x-sign-nonce'] = nonce;
  } else {
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
  
  // 创建超时控制器
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), AI_REQUEST_TIMEOUT);
  // 合并外部信号和超时信号
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;
  const requestBody = { ...extraBody, ...body, model: useFreeLLM ? undefined : config.model, stream: false };
  const requestInfo = { url: targetUrl, method: 'POST', headers, body: requestBody };
  logger.info('llmRequestParams', { payload: JSON.stringify(requestInfo) });
  try {
    const response = await fetch(targetUrl, {
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
// Web 模式下使用 fetch + ReadableStream 实现流式调用（支持免费API）
const webChatStream = (body: ChatRequestBody, config: LLMProviderSetting, callbacks: ChatStreamCallbacks, useFreeLLM = false) => {
  const abortController = new AbortController();
  const targetUrl = useFreeLLM ? getServerLLMUrl(true) : config.baseURL;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // 如果使用免费LLM，添加签名
  if (useFreeLLM) {
    const timestamp = Date.now();
    const nonce = nanoid();
    const method = 'post';
    const parsedUrlInfo = parseUrl(targetUrl);
    const url = parsedUrlInfo.url;
    const strParams = getStrParams(parsedUrlInfo.queryParams);
    const strBody = getStrJsonBody(body as Record<string, unknown>);
    const { strHeader, sortedHeaderKeys } = getStrHeader(headers);
    const signContent = `${method}\n${url}\n${strParams}\n${strBody}\n${strHeader}\n${timestamp}\n${nonce}`;
    headers['x-sign'] = sha256(signContent);
    headers['x-sign-headers'] = sortedHeaderKeys.join(',');
    headers['x-sign-timestamp'] = String(timestamp);
    headers['x-sign-nonce'] = nonce;
  } else {
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
      const response = await fetch(targetUrl, {
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
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream') && !contentType.includes('application/json')) {
        const errorText = await response.text();
        try {
          const parsed: { code?: number; msg?: string } = JSON.parse(errorText);
          if (parsed.code && parsed.msg) {
            callbacks.onError(new Error(parsed.msg));
            return;
          }
        } catch {
          callbacks.onError(new Error(`意外的响应类型: ${contentType}`));
          return;
        }
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
