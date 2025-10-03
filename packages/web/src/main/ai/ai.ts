import got from 'got';
import { mainConfig } from '@src/config/mainConfig';
import type { DeepSeekMessage, DeepSeekRequestBody, DeepSeekResponse } from '@src/types/ai/ai';

type StreamCallback = (chunk: string) => void;
type StreamEndCallback = () => void;
type StreamErrorCallback = (error: string) => void;

/**
 * AI管理器类，用于调用AI模型生成内容
 */
export class AiManager {
  private apiUrl: string;
  private apiKey: string;
  private abortControllers: Map<string, AbortController> = new Map();

  /**
   * 构造函数
   * @param apiUrl - API地址，默认从mainConfig获取
   * @param apiKey - API密钥，默认从mainConfig获取
   */
  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl = apiUrl || mainConfig.aiConfig.apiUrl || 'https://api.deepseek.com/chat/completions/v1/chat/completions';
    this.apiKey = apiKey || mainConfig.aiConfig.apiKey;
  }

  /**
   * 验证API配置
   * @private
   */
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

  /**
   * 构建API请求消息
   * @param prompt - 提示词数组
   * @param isJsonMode - 是否为JSON模式
   * @private
   */
  private buildMessages(prompt: string[], isJsonMode: boolean): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [];

    // 添加系统提示
    if (isJsonMode) {
      messages.push({
        role: 'system',
        content: '你是一个专业的数据生成助手。请根据用户的要求生成符合规范的JSON格式数据。你的回答必须是合法的JSON格式，不要包含任何解释性文字或markdown标记。'
      });
    }

    // 将prompt数组合并为一个用户消息
    const combinedPrompt = prompt.join('\n');
    messages.push({
      role: 'user',
      content: combinedPrompt
    });

    return messages;
  }

  /**
   * 发送请求到DeepSeek API
   * @param body - 请求体
   * @private
   */
  private async sendRequest(body: DeepSeekRequestBody): Promise<string> {
    try {
      const response = await got.post(this.apiUrl, {
        json: body,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: {
          request: 60000, // 60秒超时
        },
      }).json<DeepSeekResponse>();

      // 提取返回内容
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        console.error('AI 返回内容为空');
        return '';
      }
      return content;
    } catch (error) {
      if (error instanceof Error) {
        if ('response' in error) {
          const gotError = error as any;
          const statusCode = gotError.response?.statusCode;
          const body = gotError.response?.body;
          console.error(`AI API 请求失败 (${statusCode}): ${body || error.message}`);
          return '';
        }
        console.error(`AI API 请求失败: ${error.message}`);
        return '';
      }
      
      console.error('AI API 请求失败: 未知错误');
      return '';
    }
  }

  /**
   * 调用AI生成文本内容
   * @param prompt - 提示词数组
   * @param _model - 模型名称，目前仅支持 'DeepSeek'
   * @param resLimitSize - 返回内容的token数量限制，默认2000
   * @returns 生成的文本内容
   */
  async chatWithText(
    prompt: string[], 
    _model: 'DeepSeek' = 'DeepSeek', 
    resLimitSize: number = 2000
  ): Promise<string> {
    this.validateConfig();

    // 验证参数
    if (!prompt || prompt.length === 0) {
      console.error('prompt 参数不能为空');
      return '';
    }

    // 构建请求体
    const requestBody: DeepSeekRequestBody = {
      model: 'deepseek-chat', // DeepSeek的模型名称
      messages: this.buildMessages(prompt, false),
      max_tokens: resLimitSize,
      temperature: 0.7,
    };

    // 发送请求并返回结果
    return await this.sendRequest(requestBody);
  }

  /**
   * 调用AI生成JSON格式的文本内容
   * @param prompt - 提示词数组
   * @param _model - 模型名称，目前仅支持 'DeepSeek'
   * @param resLimitSize - 返回内容的token数量限制，默认2000
   * @returns 生成的JSON格式文本
   */
  async chatWithJsonText(
    prompt: string[], 
    _model: 'DeepSeek' = 'DeepSeek', 
    resLimitSize: number = 2000
  ): Promise<string> {
    // 验证配置
    this.validateConfig();

    // 验证参数
    if (!prompt || prompt.length === 0) {
      console.error('prompt 参数不能为空');
      return '';
    }

    // 构建请求体，强制JSON输出
    const requestBody: DeepSeekRequestBody = {
      model: 'deepseek-chat', // DeepSeek的模型名称
      messages: this.buildMessages(prompt, true),
      max_tokens: resLimitSize,
      temperature: 0.7,
      response_format: {
        type: 'json_object', // 强制返回JSON格式
      },
    };

    // 发送请求
    const result = await this.sendRequest(requestBody);

    // 验证返回的内容是否为合法JSON
    try {
      JSON.parse(result);
      return result;
    } catch (parseError) {
      console.error('AI返回的内容不是合法的JSON格式:', result);
      return '';
    }
  }

  /**
   * 调用AI生成文本内容（流式）
   * @param prompt - 提示词数组
   * @param requestId - 请求ID，用于取消请求
   * @param onData - 数据回调
   * @param onEnd - 完成回调
   * @param onError - 错误回调
   * @param _model - 模型名称，目前仅支持 'DeepSeek'
   * @param resLimitSize - 返回内容的token数量限制，默认2000
   */
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

    // 验证参数
    if (!prompt || prompt.length === 0) {
      console.error('prompt 参数不能为空');
      onError('prompt 参数不能为空');
      return;
    }

    // 创建 AbortController 用于取消请求
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      const requestBody: DeepSeekRequestBody & { stream: boolean } = {
        model: 'deepseek-chat',
        messages: this.buildMessages(prompt, false),
        max_tokens: resLimitSize,
        temperature: 0.7,
        stream: true, // 启用流式响应
      };

      // 发送流式请求
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

      // 处理流式响应
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

  /**
   * 取消流式请求
   * @param requestId - 请求ID
   */
  cancelStream(requestId: string): void {
    const abortController = this.abortControllers.get(requestId);
    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(requestId);
    }
  }
}
