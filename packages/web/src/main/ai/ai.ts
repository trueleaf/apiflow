import got from 'got';
// import { mainConfig } from '@src/config/mainConfig';
import type { DeepSeekMessage, DeepSeekRequestBody, DeepSeekResponse } from '@src/types/ai/ai';

type StreamCallback = (chunk: string) => void;
type StreamEndCallback = () => void;
type StreamErrorCallback = (error: string) => void;

export class AiManager {
  private apiUrl = '';
  private apiKey = '';
  private abortControllers: Map<string, AbortController> = new Map();
  // 更新配置
  updateConfig(apiUrl: string, apiKey: string): void {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }
  
  private validateConfig(): void {
    if (!this.apiKey) {
      console.error('AI API Key 未配置，请在配置文件中设置 aiConfig.apiKey');
      return;
    }
    if (!this.apiUrl) {
      console.error('AI API URL 未配置，请在配置文件中设置 aiConfig.apiUrl');
      return;
    }
  }
  private buildMessages(prompt: string[], isJsonMode: boolean): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [];
    if (isJsonMode) {
      messages.push({
        role: 'system',
        content: '你是一个专业的数据生成助手。请根据用户的要求生成符合规范的JSON格式数据。你的回答必须是合法的JSON格式，不要包含任何解释性文字或markdown标记。'
      });
    }

    const combinedPrompt = prompt.join('\n');
    messages.push({
      role: 'user',
      content: combinedPrompt
    });

    return messages;
  }

  private async sendDeepSeekRequest(body: DeepSeekRequestBody): Promise<string> {
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
        console.error('AI 返回内容为空');
        return '';
      }
      return content;
    } catch (error) {
      console.error(error);
      return '';
    }
  }


  async chatWithText(
    prompt: string[], 
    _model: 'DeepSeek' = 'DeepSeek', 
    resLimitSize: number = 2000
  ): Promise<string> {
    this.validateConfig();

    if (!prompt || prompt.length === 0) {
      console.error('prompt 参数不能为空');
      return '';
    }

    const requestBody: DeepSeekRequestBody = {
      model: 'deepseek-chat',
      messages: this.buildMessages(prompt, false),
      max_tokens: resLimitSize,
    };

    return await this.sendDeepSeekRequest(requestBody);
  }

  // 生成JSON数据，如果返回不是JSON格式会自动重试一次
  async chatWithJsonText(
    prompt: string[], 
    _model: 'DeepSeek' = 'DeepSeek', 
    resLimitSize: number = 2000,
    maxRetries: number = 1
  ): Promise<string> {
    this.validateConfig();
    if (!prompt || prompt.length === 0) {
      console.error('prompt 参数不能为空');
      return '';
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
      
      if (!result) {
        lastError = 'AI 返回内容为空';
        if (attempt < maxRetries) {
          console.warn(`第 ${attempt + 1} 次请求失败，准备重试...`);
          continue;
        }
        break;
      }

      try {
        JSON.parse(result);
        return result;
      } catch (parseError) {
        lastError = `AI返回的内容不是合法的JSON格式: ${result}`;
        if (attempt < maxRetries) {
          console.warn(`第 ${attempt + 1} 次返回非JSON格式，准备重试...`);
          continue;
        }
        console.error(lastError);
      }
    }

    console.error(`JSON生成失败，已重试 ${maxRetries} 次: ${lastError}`);
    return '';
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
    this.validateConfig();

    if (!prompt || prompt.length === 0) {
      console.error('prompt 参数不能为空');
      onError('prompt 参数不能为空');
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
              console.error('解析流式数据失败:', parseError, trimmedLine);
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
        console.error('AI 流式请求失败:', error);
        
        if (abortController.signal.aborted) {
          onError('请求已取消');
        } else if ('response' in error) {
          const gotError = error as any;
          const statusCode = gotError.response?.statusCode;
          const body = gotError.response?.body;
          onError(`AI API 请求失败 (${statusCode}): ${body || error.message}`);
        } else {
          onError(`AI API 请求失败: ${error.message}`);
        }
      });

    } catch (error) {
      this.abortControllers.delete(requestId);
      console.error('AI 流式请求失败:', error);
      
      if (error instanceof Error) {
        onError(`AI API 请求失败: ${error.message}`);
      } else {
        onError('AI API 请求失败: 未知错误');
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
