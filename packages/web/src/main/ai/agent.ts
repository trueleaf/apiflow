import { got } from 'got';
import type { LLMProviderSettings, LLRequestBody, LLResponseBody } from '@src/types/ai/agent.type';

// 创建LLM客户端工厂函数
export const createLLMClient = (settings: LLMProviderSettings) => {
  const { apiKey, baseURL } = settings;
  return {
    chat: async (body: LLRequestBody): Promise<LLResponseBody> => {
      const requestBody = {
        ...body,
        stream: false
      };
      const response = await got.post<LLResponseBody>(`${baseURL}/chat/completions`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        json: requestBody,
        responseType: 'json'
      });
      return response.body;
    },
    chatStream: (
      body: LLRequestBody,
      callbacks: {
        onData: (chunk: Uint8Array) => void;
        onEnd: () => void;
        onError: (err: Error | string) => void;
      }
    ) => {
      const requestBody = {
        ...body,
        stream: true
      };
      const abortController = new AbortController();
      try {
        const stream = got.stream.post(`${baseURL}/chat/completions`, {
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
  };
}
