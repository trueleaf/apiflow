import type { LLMProviderSettings, LLRequestBody, LLResponseBody } from "@src/types/ai/agent.type.ts";
import { BUILT_IN_PROVIDERS } from "./provider.ts";
import got from "got";

export function createLLMClient(config: LLMProviderSettings) {
  /**
   * 获取最终 baseURL
   */
  const getBaseURL = () => {
    if (config.type === 'builtin') {
      const builtin = BUILT_IN_PROVIDERS[config.provider];
      return config.baseURL ?? builtin.baseURL;
    } else {
      return config.baseURL;
    }
  };

  /**
   * 获取最终 model
   */
  const getModel = () => {
    if (config.type === 'builtin') {
      return config.model ?? BUILT_IN_PROVIDERS[config.provider].models[0];
    } else {
      return config.model;
    }
  };

  /**
   * 获取请求所需 headers
   */
  const getHeaders = () => {
    const commonHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    };

    if (config.type === 'custom' && config.extraHeaders) {
      Object.assign(commonHeaders, config.extraHeaders);
    }

    return commonHeaders;
  };

  return {
    config,
    // 基础对话能力
    async chat(request: LLRequestBody): Promise<LLResponseBody> {
      const url = `${getBaseURL()}/chat/completions`;
      const body = {
        ...request,
        model: request.model ?? getModel(),
      };
      try {
        const resp = await got.post<LLResponseBody>(url, {
          headers: getHeaders(),
          json: body,
          responseType: 'json',
          throwHttpErrors: false
        });

        if (resp.statusCode >= 400) {
          throw new Error(
            `LLM request failed: ${resp.statusCode} ${resp.statusMessage}\n${JSON.stringify(resp.body)}`
          );
        }

        const data = resp.body;

        if (!data.choices || !Array.isArray(data.choices)) {
          throw new Error(`Invalid LLM response: ${JSON.stringify(data)}`);
        }

        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`LLM request failed: ${String(error)}`);
      }
    },

    // 提供流式聊天能力
    async chatStream(request: LLRequestBody, callbacks?: { onData?: (chunk: string) => void; onEnd?: () => void; onError?: (err: Error | string) => void; }): Promise<{ cancel: () => void }> {
      const url = `${getBaseURL()}/chat/completions`;
      const body = {
        ...request,
        model: request.model ?? getModel(),
        stream: true,
      };
      const stream = got.stream.post(url, {
        headers: getHeaders(),
        json: body,
        throwHttpErrors: false
      });

      stream.on('data', (chunk: Buffer) => {
        try {
          const text = chunk.toString('utf-8');
          callbacks?.onData?.(text);
        } catch (err) {
          callbacks?.onError?.(err instanceof Error ? err : String(err));
        }
      });

      stream.on('end', () => {
        callbacks?.onEnd?.();
      });

      stream.on('error', (err) => {
        callbacks?.onError?.(err instanceof Error ? err : String(err));
      });

      stream.on('response', (resp) => {
        if (resp.statusCode && resp.statusCode >= 400) {
          const errMsg = `LLM request failed: ${resp.statusCode} ${resp.statusMessage}`;
          callbacks?.onError?.(new Error(errMsg));
          stream.destroy();
        }
      });

      return { cancel: () => stream.destroy() };
    }
    
  };
}
