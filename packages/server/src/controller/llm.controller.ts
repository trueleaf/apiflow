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
        const errorText = await response.text();
        return {
          success: false,
          code: 'LLM_API_ERROR',
          message: `LLM API请求失败: ${response.status} - ${errorText}`,
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
    const { apiKey, baseUrl, model } = this.llmConfig;
    console.log(123)
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
        const errorText = await response.text();
        this.ctx.status = response.status;
        this.ctx.body = {
          success: false,
          code: 'LLM_API_ERROR',
          message: `LLM API请求失败: ${response.status} - ${errorText}`,
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
