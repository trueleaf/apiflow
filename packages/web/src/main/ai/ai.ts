import got from 'got';
import { mainConfig } from '@src/config/mainConfig';
import type { DeepSeekMessage, DeepSeekRequestBody, DeepSeekResponse, ChatWithTextOptions, ChatWithJsonTextOptions, ChatWithTextStreamOptions } from '@src/types/ai';
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
  private async sendDeepSeekRequest(body: DeepSeekRequestBody): Promise<CommonResponse<string>> {
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
    options?: ChatWithTextOptions
  ): Promise<CommonResponse<string>> {
    const configCheck = this.validateConfig();
    if (configCheck.code !== 0) {
      return { ...configCheck, data: '' };
    }

    if (!prompt || prompt.length === 0 || prompt.every(p => !p || p.trim() === '')) {
      return { code: 1, msg: 'prompt 参数不能为空', data: '' };
    }

    const model = options?.model ?? 'DeepSeek';
    const maxTokens = options?.maxTokens ?? mainConfig.aiConfig.maxTokens;

    // 判断模型类型
    if (model === 'DeepSeek') {
      const messages: DeepSeekMessage[] = [];
      const systemPrompt = `你是一个专业的文案助手。请严格遵循用户指令生成内容，务必保证返回的文案条数不超过${maxTokens}条，必须控制整体字数不超过${maxTokens}个字符。`;
      messages.push({
        role: 'system',
        content: systemPrompt
      });

      const combinedPrompt = prompt.join('\n');
      messages.push({
        role: 'user',
        content: combinedPrompt
      });

      const requestBody: DeepSeekRequestBody = {
        model: 'deepseek-chat',
        messages,
        max_tokens: maxTokens,
      };
      return await this.sendDeepSeekRequest(requestBody);
    }

    return { code: 1, msg: `不支持当前模型: ${model}`, data: '' };
  }

  // 生成JSON数据
  async chatWithJsonText(
    prompt: string[],
    options?: ChatWithJsonTextOptions
  ): Promise<CommonResponse<string>> {
    const configCheck = this.validateConfig();
    if (configCheck.code !== 0) {
      return { ...configCheck, data: '' };
    }

    if (!prompt || prompt.length === 0 || prompt.every(p => !p || p.trim() === '')) {
      return { code: 1, msg: 'prompt 参数不能为空', data: '' };
    }

    const model = 'DeepSeek';
    const maxTokens = options?.maxTokens ?? mainConfig.aiConfig.maxTokens;

    // 判断模型类型
    if (model === 'DeepSeek') {
      const messages: DeepSeekMessage[] = [];
      messages.push({
        role: 'system',
        content: '你是一个专业的数据生成助手。请根据用户的要求生成符合规范的JSON格式数据。你的回答必须是合法的JSON格式，不要包含任何解释性文字或markdown标记。'
      });

      const combinedPrompt = prompt.join('\n');
      messages.push({
        role: 'user',
        content: combinedPrompt
      });

      const requestBody: DeepSeekRequestBody = {
        model: 'deepseek-chat',
        messages,
        max_tokens: maxTokens,
        response_format: {
          type: 'json_object',
        },
      };

      const result = await this.sendDeepSeekRequest(requestBody);

      if (result.code !== 0) {
        return result;
      }

      // 验证返回的内容是否为JSON格式
      try {
        JSON.parse(result.data);
        return result;
      } catch (parseError) {
        return {
          code: 1,
          msg: '响应内容不是有效的JSON格式',
          data: `响应内容不是有效的JSON格式: ${result.data}`
        };
      }
    }

    return { code: 1, msg: `不支持当前模型: ${model}`, data: '' };
  }


  async chatWithTextStream(
    prompt: string[],
    options?: ChatWithTextStreamOptions
  ): Promise<void> {
    // 从 options 中解构所有参数
    const {
      requestId = '',
      onData = () => {},
      onEnd = () => {},
      onError = () => {},
      model = 'DeepSeek',
      maxTokens = mainConfig.aiConfig.maxTokens
    } = options || {};

    const configCheck = this.validateConfig();
    if (configCheck.code !== 0) {
      onError({ ...configCheck, data: '' });
      return;
    }

    if (!prompt || prompt.length === 0 || prompt.every(p => !p || p.trim() === '')) {
      onError({ code: 1, msg: 'prompt 参数不能为空', data: '' });
      return;
    }

    // 判断模型类型
    if (model !== 'DeepSeek') {
      onError({ code: 1, msg: `不支持当前模型: ${model}`, data: '' });
      return;
    }

    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      const messages: DeepSeekMessage[] = [];
      const combinedPrompt = prompt.join('\n');
      messages.push({
        role: 'user',
        content: combinedPrompt
      });

      const requestBody: DeepSeekRequestBody & { stream: boolean } = {
        model: 'deepseek-chat',
        messages,
        max_tokens: maxTokens,
        stream: true,
      };

      const stream = got.stream.post(this.apiUrl, {
        json: requestBody,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: {
          request: this.timeout,
        },
      });

      stream.on('data', (chunk: Buffer) => {
        if (abortController.signal.aborted) {
          stream.destroy();
          return;
        }

        // 直接转发原始数据块到渲染进程
        onData(chunk.toString());
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
