import got from 'got';
import { mainConfig } from '@src/config/mainConfig';
import type { DeepSeekRequestBody, DeepSeekResponse, SendRequestByDeepSeekParams, SendStreamRequestByDeepSeekParams } from '@src/types/ai';
import type { CommonResponse } from '@src/types/project';

export class AiManager {
  private apiUrl = '';
  private apiKey = '';
  private timeout = mainConfig.aiConfig.timeout;
  private abortControllers: Map<string, AbortController> = new Map();
  // 更新配置
  updateConfig(apiUrl: string, apiKey: string, timeout: number): void {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.timeout = timeout;
  }
  
  private validateConfig(): CommonResponse<null> {
    if (!this.apiKey) {
      return { code: 1, msg: 'AI API Key 未配置，请在配置文件中设置 aiConfig.apiKey', data: null };
    }
    if (!this.apiUrl) {
      return { code: 1, msg: 'AI API URL 未配置，请在配置文件中设置 aiConfig.apiUrl', data: null };
    }
    return { code: 0, msg: '', data: null };
  }
  private async sendDeepSeekRequest(body: DeepSeekRequestBody): Promise<CommonResponse<DeepSeekResponse | null>> {
    try {
      const response = await got.post(this.apiUrl, {
        json: body,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: {
          request: this.timeout,
        },
      }).json<DeepSeekResponse>();
      return { code: 0, msg: '', data: response };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'AI API 请求失败';
      return { code: 1, msg, data: null };
    }
  }

  async sendRequestByDeepSeek(body: SendRequestByDeepSeekParams): Promise<CommonResponse<DeepSeekResponse | null>> {
    const configCheck = this.validateConfig();
    if (configCheck.code !== 0) {
      return { code: configCheck.code, msg: configCheck.msg, data: null };
    }
    return await this.sendDeepSeekRequest(body);
  }

  async sendStreamRequestByDeepSeek(params: SendStreamRequestByDeepSeekParams): Promise<CommonResponse<{ requestId: string } | null>> {
    if (params.action === 'cancel') {
      const abortController = this.abortControllers.get(params.requestId);
      if (abortController) {
        abortController.abort();
        this.abortControllers.delete(params.requestId);
      }
      return { code: 0, msg: '请求已取消', data: null };
    }

    const onData = params.onData ?? (() => {});
    const onEnd = params.onEnd ?? (() => {});
    const onError = params.onError ?? (() => {});

    const configCheck = this.validateConfig();
    if (configCheck.code !== 0) {
      onError({ code: configCheck.code, msg: configCheck.msg, data: '' });
      return { code: configCheck.code, msg: configCheck.msg, data: null };
    }
    const requestBody = params.requestBody;

    const abortController = new AbortController();
    this.abortControllers.set(params.requestId, abortController);

    try {
      const stream = got.stream.post(this.apiUrl, {
        json: requestBody,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: {
          request: this.timeout,
        },
        signal: abortController.signal,
      });

      const handleAbort = () => {
        stream.destroy(new Error('请求已取消'));
      };

      abortController.signal.addEventListener('abort', handleAbort);

      stream.on('data', (chunk: Buffer) => {
        if (abortController.signal.aborted) {
          stream.destroy();
          return;
        }

        onData(chunk.toString());
      });

      stream.on('end', () => {
        this.abortControllers.delete(params.requestId);
        abortController.signal.removeEventListener('abort', handleAbort);
        if (!abortController.signal.aborted) {
          onEnd();
        }
      });

      stream.on('error', (error: Error) => {
        this.abortControllers.delete(params.requestId);
        abortController.signal.removeEventListener('abort', handleAbort);

        if (abortController.signal.aborted) {
          onError({ code: 1, msg: '请求已取消', data: '' });
        } else if ('response' in error) {
          const gotError = error as unknown as { response?: { statusCode?: number; body?: string } };
          const statusCode = gotError.response?.statusCode;
          const body = gotError.response?.body;
          onError({ code: 1, msg: `AI API 请求失败 (${statusCode}): ${body || error.message}`, data: '' });
        } else {
          onError({ code: 1, msg: `AI API 请求失败: ${error.message}`, data: '' });
        }
      });

    } catch (error) {
      this.abortControllers.delete(params.requestId);

      if (error instanceof Error) {
        onError({ code: 1, msg: `AI API 请求失败: ${error.message}`, data: '' });
        return { code: 1, msg: `AI API 请求失败: ${error.message}`, data: null };
      }

      onError({ code: 1, msg: 'AI API 请求失败: 未知错误', data: '' });
      return { code: 1, msg: 'AI API 请求失败: 未知错误', data: null };
    }

    return { code: 0, msg: '流式请求已启动', data: { requestId: params.requestId } };
  }
}
const globalAiManager = new AiManager();
export { globalAiManager };
