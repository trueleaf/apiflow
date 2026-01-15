import { Controller, Post, Body, Inject, Config } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { PassThrough } from 'stream';
import { ReqSign } from '../decorator/req_sign.decorator.js';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatRequestBody = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  [key: string]: unknown;
};

@Controller('/api/llm')
export class LLMController {
  // 验证请求体
  private validateRequestBody(body: ChatRequestBody): { valid: boolean; error?: string } {
    // 检查messages数组
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return { valid: false, error: 'messages必须是非空数组' };
    }
    if (body.messages.length > 50) {
      return { valid: false, error: 'messages数组长度不能超过50条' };
    }
    // 估算tokens总数（粗略估算：1个中文字约1.5 tokens，1个英文单词约1.3 tokens）
    let totalChars = 0;
    for (const msg of body.messages) {
      if (!msg.content || typeof msg.content !== 'string') {
        return { valid: false, error: 'message内容必须是字符串' };
      }
      totalChars += msg.content.length;
    }
    // 粗略估算：按每个字符1.5 tokens计算
    const estimatedTokens = Math.ceil(totalChars * 1.5);
    if (estimatedTokens > 10000) {
      return { valid: false, error: `估算tokens总数(${estimatedTokens})超过限制(10000)，请减少消息内容` };
    }
    // 检查请求体大小（JSON字符串长度）
    const bodySize = JSON.stringify(body).length;
    if (bodySize > 1024 * 1024) {
      return { valid: false, error: '请求体大小超过1MB限制' };
    }
    return { valid: true };
  }
  @Inject()
  ctx: Context;

  @Config('llmConfig')
  llmConfig: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
  
  // 非流式chat接口
  @ReqSign()
  @Post('/chat')
  async chat(@Body() body: ChatRequestBody) {
    // 验证请求体
    const validation = this.validateRequestBody(body);
    if (!validation.valid) {
      return {
        success: false,
        code: 'INVALID_REQUEST',
        message: validation.error,
      };
    }
    const { apiKey, baseUrl, model } = this.llmConfig;
    if (!apiKey || !baseUrl) {
      return {
        success: false,
        code: 'LLM_CONFIG_MISSING',
        message: '服务器LLM配置不可用，请使用自己的API Key',
      };
    }

    const requestBody = {
      ...body,
      model: body.model || model,
      stream: false,
    };

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        return {
          success: false,
          code: 'LLM_API_ERROR',
          message: 'LLM服务暂时不可用，请稍后再试',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        code: 'LLM_REQUEST_ERROR',
        message: `LLM请求异常: ${(error as Error).message}`,
      };
    }
  }

  // 流式chat接口
  @ReqSign()
  @Post('/chat/stream')
  async chatStream(@Body() body: ChatRequestBody) {
    // 验证请求体
    const validation = this.validateRequestBody(body);
    if (!validation.valid) {
      this.ctx.status = 400;
      this.ctx.body = {
        success: false,
        code: 'INVALID_REQUEST',
        message: validation.error,
      };
      return;
    }
    const { apiKey, baseUrl, model } = this.llmConfig;
    if (!apiKey || !baseUrl) {
      this.ctx.status = 500;
      this.ctx.body = {
        success: false,
        code: 'LLM_CONFIG_MISSING',
        message: '服务器LLM配置不可用，请使用自己的API Key',
      };
      return;
    }

    const requestBody = {
      ...body,
      model: body.model || model,
      stream: true,
    };

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        this.ctx.status = 500;
        this.ctx.body = {
          success: false,
          code: 'LLM_API_ERROR',
          message: 'LLM服务暂时不可用，请稍后再试',
        };
        return;
      }

      this.ctx.set('Content-Type', 'text/event-stream');
      this.ctx.set('Cache-Control', 'no-cache');
      this.ctx.set('Connection', 'keep-alive');

      const passThrough = new PassThrough();
      this.ctx.body = passThrough;

      if (response.body) {
        const reader = response.body.getReader();
        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                passThrough.end();
                break;
              }
              passThrough.write(value);
            }
          } catch (error) {
            passThrough.destroy(error as Error);
          }
        };
        pump();
      } else {
        passThrough.end();
      }
    } catch (error) {
      this.ctx.status = 500;
      this.ctx.body = {
        success: false,
        code: 'LLM_REQUEST_ERROR',
        message: `LLM请求异常: ${(error as Error).message}`,
      };
    }
  }
}
