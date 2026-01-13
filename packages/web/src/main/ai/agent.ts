import { got } from 'got';
import type { ChatRequestBody, OpenAiResponseBody, LLMProviderSetting, ChatStreamCallbacks } from '@src/types/ai/agent.type';
import { config } from '@src/config/config';
import { nanoid } from 'nanoid';
import { sha256, parseUrl, getStrParams, getStrJsonBody, getStrHeader } from '../utils/sign';

// AI 请求超时时间（60秒）
const AI_REQUEST_TIMEOUT = 60 * 1000;
// 获取服务器LLM API地址
const getServerLLMUrl = (stream: boolean) => {
  const baseUrl = config.renderConfig.httpRequest.url;
  return stream ? `${baseUrl}/api/llm/chat/stream` : `${baseUrl}/api/llm/chat`;
};
// LLM 客户端类
export class LLMClient {
  private config: LLMProviderSetting = null!;
  // 更新配置
  updateConfig(newConfig: LLMProviderSetting): void {
    this.config = newConfig;
  }
  // 非流式聊天
  async chat(body: ChatRequestBody, useFreeLLM = false): Promise<OpenAiResponseBody> {
    // 使用免费LLM服务，直接调用服务器接口
    if (useFreeLLM) {
      const targetUrl = getServerLLMUrl(false);
      const timestamp = Date.now();
      const nonce = nanoid();
      const method = 'post';
      const parsedUrlInfo = parseUrl(targetUrl);
      const url = parsedUrlInfo.url;
      const strParams = getStrParams(parsedUrlInfo.queryParams);
      const strBody = getStrJsonBody(body);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      const { strHeader, sortedHeaderKeys } = getStrHeader(headers);
      const signContent = `${method}\n${url}\n${strParams}\n${strBody}\n${strHeader}\n${timestamp}\n${nonce}`;
      headers['x-sign'] = sha256(signContent);
      headers['x-sign-headers'] = sortedHeaderKeys.join(',');
      headers['x-sign-timestamp'] = String(timestamp);
      headers['x-sign-nonce'] = nonce;
      const response = await got.post<OpenAiResponseBody>(
        targetUrl,
        {
          headers,
          json: body,
          responseType: 'json',
          timeout: { request: AI_REQUEST_TIMEOUT }
        }
      );
      const responseBody = response.body as unknown;
      if (responseBody && typeof responseBody === 'object' && 'code' in responseBody && 'msg' in responseBody) {
        const errorResponse = responseBody as { code: number; msg: string };
        throw new Error(errorResponse.msg);
      }
      return response.body;
    }
    // 使用用户自己配置的LLM服务
    if (!this.config) {
      throw new Error('LLM 配置未初始化，请先配置 API Key 和 Base URL');
    }
    const { apiKey, baseURL, model, customHeaders, extraBody } = this.config;
    const extraBodyText = extraBody?.trim() ?? '';
    let resolvedExtraBody: Record<string, unknown> = {};
    if (extraBodyText) {
      try {
        const parsed: unknown = JSON.parse(extraBodyText);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          resolvedExtraBody = parsed as Record<string, unknown>;
        }
      } catch {
        resolvedExtraBody = {};
      }
    }
    const requestBody = { ...resolvedExtraBody, ...body, model, stream: false };
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    customHeaders?.forEach(h => {
      if (h.key) {
        headers[h.key] = h.value;
      }
    });
    const responseType = body.response_format?.type === 'json_object' ? 'json' : 'json';
    const response = await got.post<OpenAiResponseBody>(
      baseURL,
      {
        headers,
        json: requestBody,
        responseType,
        timeout: { request: AI_REQUEST_TIMEOUT }
      }
    );
    const responseBody = response.body as unknown;
    if (responseBody && typeof responseBody === 'object' && 'code' in responseBody && 'msg' in responseBody) {
      const errorResponse = responseBody as { code: number; msg: string };
      throw new Error(errorResponse.msg);
    }
    return response.body;
  }
  // 流式聊天
  chatStream(body: ChatRequestBody, callbacks: ChatStreamCallbacks, useFreeLLM = false) {
    const abortController = new AbortController();
    // 使用免费LLM服务，直接调用服务器接口
    if (useFreeLLM) {
      const targetUrl = getServerLLMUrl(true);
      const timestamp = Date.now();
      const nonce = nanoid();
      const method = 'post';
      const parsedUrlInfo = parseUrl(targetUrl);
      const url = parsedUrlInfo.url;
      const strParams = getStrParams(parsedUrlInfo.queryParams);
      const strBody = getStrJsonBody(body);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      const { strHeader, sortedHeaderKeys } = getStrHeader(headers);
      const signContent = `${method}\n${url}\n${strParams}\n${strBody}\n${strHeader}\n${timestamp}\n${nonce}`;
      headers['x-sign'] = sha256(signContent);
      headers['x-sign-headers'] = sortedHeaderKeys.join(',');
      headers['x-sign-timestamp'] = String(timestamp);
      headers['x-sign-nonce'] = nonce;
      try {
        const stream = got.stream.post(targetUrl, {
          headers,
          json: body,
          signal: abortController.signal
        });
        stream.on('data', (chunk: Buffer) => {
          const chunkStr = chunk.toString();
          const trimmed = chunkStr.trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
              const parsed: { code?: number; msg?: string } = JSON.parse(trimmed);
              if (parsed.code && parsed.msg) {
                callbacks.onError(new Error(parsed.msg));
                abortController.abort();
                return;
              }
            } catch {
              // 不是有效的JSON，继续正常处理
            }
          }
          callbacks.onData(new Uint8Array(chunk));
        });
        stream.on('end', () => {
          callbacks.onEnd();
        });
        stream.on('error', (error: Error) => {
          if (error.name !== 'AbortError') {
            callbacks.onError(error);
          }
        });
      } catch (error) {
        callbacks.onError(error as Error);
      }
      return {
        abort: () => abortController.abort()
      };
    }
    // 使用用户自己配置的LLM服务
    const { apiKey, baseURL, model, customHeaders, extraBody } = this.config;
    const extraBodyText = extraBody?.trim() ?? '';
    let resolvedExtraBody: Record<string, unknown> = {};
    if (extraBodyText) {
      try {
        const parsed: unknown = JSON.parse(extraBodyText);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          resolvedExtraBody = parsed as Record<string, unknown>;
        }
      } catch {
        resolvedExtraBody = {};
      }
    }
    const requestBody = { ...resolvedExtraBody, ...body, model, stream: true };
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    customHeaders?.forEach(h => {
      if (h.key) {
        headers[h.key] = h.value;
      }
    });
    try {
      const stream = got.stream.post(baseURL, {
        headers,
        json: requestBody,
        signal: abortController.signal
      });
      stream.on('data', (chunk: Buffer) => {
        callbacks.onData(new Uint8Array(chunk));
      });
      stream.on('end', () => {
        callbacks.onEnd();
      });
      stream.on('error', (error: Error) => {
        if (error.name !== 'AbortError') {
          callbacks.onError(error);
        }
      });
    } catch (error) {
      callbacks.onError(error as Error);
    }
    return {
      abort: () => abortController.abort()
    };
  }
}
// 导出全局单例
export const globalLLMClient = new LLMClient();
