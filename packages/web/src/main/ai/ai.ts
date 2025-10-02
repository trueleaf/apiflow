import got from 'got';
import { config } from '../../config/config';
import type { DeepSeekMessage, DeepSeekRequestBody, DeepSeekResponse } from '@src/types/ai/ai';

/**
 * AI管理器类，用于调用AI模型生成内容
 */
export class aiManager {
  private apiUrl: string;
  private apiKey: string;

  /**
   * 构造函数
   * @param apiUrl - API地址，默认从config获取
   * @param apiKey - API密钥，默认从config获取
   */
  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl = apiUrl || config.mainConfig.aiConfig.apiUrl || 'https://api.deepseek.com/v1/chat/completions';
    this.apiKey = apiKey || config.mainConfig.aiConfig.apiKey;
  }

  /**
   * 验证API配置
   * @private
   */
  private validateConfig(): void {
    if (!this.apiKey) {
      throw new Error('AI API Key 未配置，请在配置文件中设置 mainConfig.aiConfig.apiKey');
    }
    if (!this.apiUrl) {
      throw new Error('AI API URL 未配置，请在配置文件中设置 mainConfig.aiConfig.apiUrl');
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
      console.log('发送 AI 请求:', {
        url: this.apiUrl,
        model: body.model,
        max_tokens: body.max_tokens,
        has_response_format: !!body.response_format
      });

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
        throw new Error('AI 返回内容为空');
      }

      console.log('AI 请求成功:', {
        usage: response.usage,
        finish_reason: response.choices?.[0]?.finish_reason
      });

      return content;
    } catch (error) {
      console.error('AI API 调用失败:', error);
      
      if (error instanceof Error) {
        // 处理got库的错误
        if ('response' in error) {
          const gotError = error as any;
          const statusCode = gotError.response?.statusCode;
          const body = gotError.response?.body;
          throw new Error(`AI API 请求失败 (${statusCode}): ${body || error.message}`);
        }
        throw new Error(`AI API 请求失败: ${error.message}`);
      }
      
      throw new Error('AI API 请求失败: 未知错误');
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
    // 验证配置
    this.validateConfig();

    // 验证参数
    if (!prompt || prompt.length === 0) {
      throw new Error('prompt 参数不能为空');
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
      throw new Error('prompt 参数不能为空');
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
      throw new Error('AI返回的内容不是合法的JSON格式');
    }
  }
}
