import got from 'got';
// import { mainConfig } from '@src/config/mainConfig';
import type { DeepSeekMessage, DeepSeekRequestBody, DeepSeekResponse } from '@src/types/ai/ai';
import type { CommonResponse } from '@src/types/project';

type StreamCallback = (chunk: string) => void;
type StreamEndCallback = () => void;
type StreamErrorCallback = (response: CommonResponse<string>) => void;

export class AiManager {
  private apiUrl = '';
  private apiKey = '';
  private abortControllers: Map<string, AbortController> = new Map();
  // 更新配置
  updateConfig(apiUrl: string, apiKey: string): void {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
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
  private buildMessages(prompt: string[], isJsonMode: boolean, systemPrompt?: string): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [];
    if (isJsonMode) {
      messages.push({
        role: 'system',
        content: '你是一个专业的数据生成助手。请根据用户的要求生成符合规范的JSON格式数据。你的回答必须是合法的JSON格式，不要包含任何解释性文字或markdown标记。'
      });
    } else if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    const combinedPrompt = prompt.join('\n');
    messages.push({
      role: 'user',
      content: combinedPrompt
    });

    return messages;
  }

  private async sendDeepSeekRequest(body: DeepSeekRequestBody): Promise<CommonResponse<string>> {
    try {
      const response = await got.post(this.apiUrl, {
        json: body,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: {
          request: 60000,
        },
      }).json<DeepSeekResponse>();

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        return { code: 1, msg: 'AI 返回内容为空', data: '' };
      }
      return { code: 0, msg: '', data: content };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'AI API 请求失败';
      return { code: 1, msg, data: '' };
    }
  }


  async chatWithText(
    prompt: string[],
    _model: 'DeepSeek' = 'DeepSeek',
    resLimitSize: number = 2000
  ): Promise<CommonResponse<string>> {
    const configCheck = this.validateConfig();
    if (configCheck.code !== 0) {
      return { ...configCheck, data: '' };
    }

    if (!prompt || prompt.length === 0) {
      return { code: 1, msg: 'prompt 参数不能为空', data: '' };
    }

    const systemPrompt = `你是一个专业的文案助手。请严格遵循用户指令生成内容，务必保证返回的文案条数不超过${resLimitSize}条，并尽量控制整体字数不超过${resLimitSize}个字符。`;
    const requestBody: DeepSeekRequestBody = {
      model: 'deepseek-chat',
      messages: this.buildMessages(prompt, false, systemPrompt),
    };
    return await this.sendDeepSeekRequest(requestBody);
  }

  // 生成JSON数据，如果返回不是JSON格式会自动重试一次
  async chatWithJsonText(
    prompt: string[],
    _model: 'DeepSeek' = 'DeepSeek',
    resLimitSize: number = 2000,
    maxRetries: number = 1
  ): Promise<CommonResponse<string>> {
    const configCheck = this.validateConfig();
    if (configCheck.code !== 0) {
      return { ...configCheck, data: '' };
    }

    if (!prompt || prompt.length === 0) {
      return { code: 1, msg: 'prompt 参数不能为空', data: '' };
    }

    const requestBody: DeepSeekRequestBody = {
      model: 'deepseek-chat',
      messages: this.buildMessages(prompt, true),
      max_tokens: resLimitSize,
      response_format: {
        type: 'json_object',
      },
    };

    let lastError = '';
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const result = await this.sendDeepSeekRequest(requestBody);

      if (result.code !== 0) {
        if (attempt < maxRetries) {
          lastError = result.msg;
          continue;
        }
        return result;
      }

      try {
        JSON.parse(result.data);
        return result;
      } catch (parseError) {
        lastError = `AI返回的内容不是合法的JSON格式: ${result.data}`;
        if (attempt < maxRetries) {
          continue;
        }
      }
    }

    return { code: 1, msg: `JSON生成失败，已重试 ${maxRetries} 次: ${lastError}`, data: '' };
  }

  
  async chatWithTextStream(
    prompt: string[],
    requestId: string,
    onData: StreamCallback,
    onEnd: StreamEndCallback,
    onError: StreamErrorCallback,
    _model: 'DeepSeek' = 'DeepSeek',
    resLimitSize: number = 2000
  ): Promise<void> {
    const configCheck = this.validateConfig();
    if (configCheck.code !== 0) {
      onError({ ...configCheck, data: '' });
      return;
    }

    if (!prompt || prompt.length === 0) {
      onError({ code: 1, msg: 'prompt 参数不能为空', data: '' });
      return;
    }

    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      const requestBody: DeepSeekRequestBody & { stream: boolean } = {
        model: 'deepseek-chat',
        messages: this.buildMessages(prompt, false),
        max_tokens: resLimitSize,
        stream: true,
      };

      const stream = got.stream.post(this.apiUrl, {
        json: requestBody,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: {
          request: 120000, // 120秒超时
        },
      });

      let buffer = '';
      
      stream.on('data', (chunk: Buffer) => {
        if (abortController.signal.aborted) {
          stream.destroy();
          return;
        }

        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') {
            continue;
          }

          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6);
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content;
              
              if (content) {
                onData(content);
              }
            } catch (parseError) {
              // 解析失败，跳过该行数据
            }
          }
        }
      });

      stream.on('end', () => {
        this.abortControllers.delete(requestId);
        if (!abortController.signal.aborted) {
          onEnd();
        }
      });

      stream.on('error', (error: Error) => {
        this.abortControllers.delete(requestId);

        if (abortController.signal.aborted) {
          onError({ code: 1, msg: '请求已取消', data: '' });
        } else if ('response' in error) {
          const gotError = error as any;
          const statusCode = gotError.response?.statusCode;
          const body = gotError.response?.body;
          onError({ code: 1, msg: `AI API 请求失败 (${statusCode}): ${body || error.message}`, data: '' });
        } else {
          onError({ code: 1, msg: `AI API 请求失败: ${error.message}`, data: '' });
        }
      });

    } catch (error) {
      this.abortControllers.delete(requestId);

      if (error instanceof Error) {
        onError({ code: 1, msg: `AI API 请求失败: ${error.message}`, data: '' });
      } else {
        onError({ code: 1, msg: 'AI API 请求失败: 未知错误', data: '' });
      }
    }
  }
  cancelStream(requestId: string): void {
    const abortController = this.abortControllers.get(requestId);
    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(requestId);
    }
  }
}
const globalAiManager = new AiManager();
export { globalAiManager };
