import { got } from 'got';
import type { ChatRequestBody, OpenAiResponseBody, LLMProviderSetting, ChatStreamCallbacks } from '@src/types/ai/agent.type';

// AI 请求超时时间（60秒）
const AI_REQUEST_TIMEOUT = 60 * 1000;
// 解析额外请求体
const parseExtraBody = (extraBody?: string): Record<string, unknown> => {
  const extraBodyText = extraBody?.trim() ?? '';
  if (!extraBodyText) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(extraBodyText);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return {};
  }
  return {};
};
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
      throw new Error('LLM 配置未初始化，请先配置 Base URL 和 Model');
    }
    const { apiKey, baseURL, model, customHeaders, extraBody } = this.config;
    if (!baseURL || !model) {
      throw new Error('请先配置 Base URL 和 Model');
    }
    const resolvedExtraBody = parseExtraBody(extraBody);
    const requestBody = { ...resolvedExtraBody, ...body, model, stream: false };
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
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
    const responseBody = response.body as unknown;
    if (responseBody && typeof responseBody === 'object' && 'success' in responseBody && responseBody.success === false && 'message' in responseBody) {
      const errorResponse = responseBody as { success: boolean; code: string; message: string };
      throw new Error(errorResponse.message);
    }
    return response.body;
  }
  // 流式聊天
  chatStream(body: ChatRequestBody, callbacks: ChatStreamCallbacks) {
    const abortController = new AbortController();
    if (!this.config) {
      callbacks.onError(new Error('LLM 配置未初始化，请先配置 Base URL 和 Model'));
      return {
        abort: () => abortController.abort()
      };
    }
    const { apiKey, baseURL, model, customHeaders, extraBody } = this.config;
    if (!baseURL || !model) {
      callbacks.onError(new Error('请先配置 Base URL 和 Model'));
      return {
        abort: () => abortController.abort()
      };
    }
    const resolvedExtraBody = parseExtraBody(extraBody);
    const requestBody = { ...resolvedExtraBody, ...body, model, stream: true };
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
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
