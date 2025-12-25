import { got } from 'got';
import type { ChatRequestBody, OpenAiResponseBody, LLMProviderSetting, ChatStreamCallbacks } from '@src/types/ai/agent.type';

// AI 请求超时时间（60秒）
const AI_REQUEST_TIMEOUT = 60 * 1000;
// LLM 客户端类
export class LLMClient {
  private config: LLMProviderSetting = null!;
  // 更新配置
  updateConfig(newConfig: LLMProviderSetting): void {
    this.config = newConfig;
  }
  // 非流式聊天
  async chat(body: ChatRequestBody): Promise<OpenAiResponseBody> {
    if (!this.config) {
      throw new Error('LLM 配置未初始化，请先配置 API Key 和 Base URL');
    }
    const { apiKey, baseURL, model, customHeaders, extraBody } = this.config;
    const extraBodyText = extraBody?.trim() ?? '';
    let resolvedExtraBody: Record<string, unknown> = {};
    if (extraBodyText) {
      try {
        const parsed: unknown = JSON.parse(extraBodyText);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          resolvedExtraBody = parsed as Record<string, unknown>;
        }
      } catch {
        resolvedExtraBody = {};
      }
    }
    const requestBody = { ...resolvedExtraBody, ...body, model, stream: false };
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    customHeaders?.forEach(h => {
      if (h.key) {
        headers[h.key] = h.value;
      }
    });
    const responseType = body.response_format?.type === 'json_object' ? 'json' : 'json';
    const response = await got.post<OpenAiResponseBody>(
      baseURL,
      {
        headers,
        json: requestBody,
        responseType,
        timeout: { request: AI_REQUEST_TIMEOUT }
      }
    );
    return response.body;
  }
  // 流式聊天(原始方法)
  chatStream(body: ChatRequestBody, callbacks: ChatStreamCallbacks) {
    const { apiKey, baseURL, model, customHeaders, extraBody } = this.config;
    const extraBodyText = extraBody?.trim() ?? '';
    let resolvedExtraBody: Record<string, unknown> = {};
    if (extraBodyText) {
      try {
        const parsed: unknown = JSON.parse(extraBodyText);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          resolvedExtraBody = parsed as Record<string, unknown>;
        }
      } catch {
        resolvedExtraBody = {};
      }
    }
    const requestBody = { ...resolvedExtraBody, ...body, model, stream: true };
    const abortController = new AbortController();
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    customHeaders?.forEach(h => {
      if (h.key) {
        headers[h.key] = h.value;
      }
    });
    try {
      const stream = got.stream.post(baseURL, {
        headers,
        json: requestBody,
        signal: abortController.signal
      });
      stream.on('data', (chunk: Buffer) => {
        callbacks.onData(new Uint8Array(chunk));
      });
      stream.on('end', () => {
        callbacks.onEnd();
      });
      stream.on('error', (error: Error) => {
        if (error.name !== 'AbortError') {
          callbacks.onError(error);
        }
      });
    } catch (error) {
      callbacks.onError(error as Error);
    }
    return {
      abort: () => abortController.abort()
    };
  }
}
// 导出全局单例
export const globalLLMClient = new LLMClient();
