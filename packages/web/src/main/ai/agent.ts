import type { LLMProviderSettings, LLRequestBody, LLResponseBody } from "@src/types/ai/agent.type.ts";
import { BUILT_IN_PROVIDERS } from "./provider.ts";
import got from "got";
import { mainConfig } from '@src/config/mainConfig';

export class LLMClient {
  private config: LLMProviderSettings;
  private activeStreams: Map<string, () => void> = new Map();

  constructor(config: LLMProviderSettings) {
    this.config = config;
  }

  // 配置更新方法
  updateConfig(config: LLMProviderSettings): void {
    this.config = config;
  }

  // 获取最终 baseURL
  private getBaseURL(): string {
    if (this.config.type === 'builtin') {
      const builtin = BUILT_IN_PROVIDERS[this.config.provider];
      return this.config.baseURL ?? builtin.baseURL;
    } else {
      return this.config.baseURL;
    }
  }

  // 获取最终 model
  private getModel(): string {
    if (this.config.type === 'builtin') {
      return this.config.model ?? BUILT_IN_PROVIDERS[this.config.provider].models[0];
    } else {
      return this.config.model;
    }
  }

  // 获取请求所需 headers
  private getHeaders(): Record<string, string> {
    const commonHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    };

    if (this.config.type === 'custom' && this.config.extraHeaders) {
      Object.assign(commonHeaders, this.config.extraHeaders);
    }

    return commonHeaders;
  }

  // 基础对话能力
  async chat(request: LLRequestBody): Promise<LLResponseBody> {
    const url = `${this.getBaseURL()}/chat/completions`;
    const body = {
      ...request,
      model: request.model ?? this.getModel(),
    };
    try {
      const resp = await got.post<LLResponseBody>(url, {
        headers: this.getHeaders(),
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
  }

  // 流式聊天能力
  async chatStream(requestId: string, request: LLRequestBody, callbacks?: { onData?: (chunk: string) => void; onEnd?: () => void; onError?: (err: Error | string) => void; }): Promise<void> {
    const url = `${this.getBaseURL()}/chat/completions`;
    const body = {
      ...request,
      model: request.model ?? this.getModel(),
      stream: true,
    };
    const stream = got.stream.post(url, {
      headers: this.getHeaders(),
      json: body,
      throwHttpErrors: false
    });

    // 保存 cancel 函数
    this.activeStreams.set(requestId, () => stream.destroy());

    stream.on('data', (chunk: Buffer) => {
      try {
        const text = chunk.toString('utf-8');
        callbacks?.onData?.(text);
      } catch (err) {
        callbacks?.onError?.(err instanceof Error ? err : String(err));
      }
    });

    stream.on('end', () => {
      this.activeStreams.delete(requestId);
      callbacks?.onEnd?.();
    });

    stream.on('error', (err) => {
      this.activeStreams.delete(requestId);
      callbacks?.onError?.(err instanceof Error ? err : String(err));
    });

    stream.on('response', (resp) => {
      if (resp.statusCode && resp.statusCode >= 400) {
        const errMsg = `LLM request failed: ${resp.statusCode} ${resp.statusMessage}`;
        callbacks?.onError?.(new Error(errMsg));
        stream.destroy();
      }
    });
  }

  // 取消流式请求
  cancelStream(requestId: string): void {
    const cancel = this.activeStreams.get(requestId);
    if (cancel) {
      cancel();
      this.activeStreams.delete(requestId);
    }
  }
}

// 从 mainConfig 创建初始配置
function createConfigFromMainConfig(): LLMProviderSettings {
  if (mainConfig.aiConfig.apiUrl === 'https://api.deepseek.com/chat/completions' ||
      mainConfig.aiConfig.apiUrl === 'https://api.deepseek.com') {
    return {
      type: 'builtin',
      provider: 'deepseek',
      apiKey: mainConfig.aiConfig.apiKey,
      baseURL: 'https://api.deepseek.com',
      model: 'deepseek-chat'
    };
  } else {
    return {
      type: 'custom',
      name: mainConfig.aiConfig.modelName || 'Custom',
      apiKey: mainConfig.aiConfig.apiKey,
      baseURL: mainConfig.aiConfig.apiUrl.replace('/chat/completions', ''),
      model: 'deepseek-chat'
    };
  }
}

// 导出全局实例
export const globalLLMClient = new LLMClient(createConfigFromMainConfig());
