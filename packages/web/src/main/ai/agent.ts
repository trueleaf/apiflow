import { got } from 'got';
import type { OpenAiRequestBody, OpenAiResponseBody, LLMProviderSettings } from '@src/types/ai/agent.type';

export type ChatStreamCallbacks = {
  onData: (chunk: Uint8Array) => void;
  onEnd: () => void;
  onError: (err: Error | string) => void;
};

// LLM 客户端类
export class LLMClient {
  private config: LLMProviderSettings = null!;
  // 更新配置
  updateConfig(newConfig: LLMProviderSettings): void {
    this.config = newConfig;
  }
  // 非流式聊天
  async chat(body: OpenAiRequestBody): Promise<OpenAiResponseBody> {
    const { apiKey, baseURL } = this.config;
    const requestBody = { ...body, stream: false };
    const response = await got.post<OpenAiResponseBody>(
      baseURL,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        json: requestBody,
        responseType: 'json'
      }
    );
    return response.body;
  }
  // 流式聊天(原始方法)
  chatStream(body: OpenAiRequestBody, callbacks: ChatStreamCallbacks) {
    const { apiKey, baseURL } = this.config;
    const requestBody = { ...body, stream: true };
    const abortController = new AbortController();
    try {
      const stream = got.stream.post(baseURL, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
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
