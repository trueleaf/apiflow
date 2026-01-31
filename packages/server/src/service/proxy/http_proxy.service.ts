import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { got } from 'got';
import type { OptionsInit, PlainResponse, RequestError } from 'got';
import FormData from 'form-data';
import http, { ClientRequest } from 'node:http';
import http2 from 'node:http';
import { ProxyRequestParams, ProxyResponse, ProxyErrorResponse } from '../../types/proxy.js';
import { PassThrough } from 'stream';

@Provide()
export class HttpProxyService {
  @Inject()
  ctx: Context;

  //验证URL安全性，禁止请求内网IP和特殊协议
  private validateUrlSecurity(url: string): { valid: boolean; error?: string } {
    try {
      const parsedUrl = new URL(url);

      //只允许http和https协议
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return {
          valid: false,
          error: `不支持的协议: ${parsedUrl.protocol}，仅支持http和https`
        };
      }

      //获取hostname
      const hostname = parsedUrl.hostname.toLowerCase();

      //禁止的内网IP和域名
      const forbiddenPatterns = [
        /^127\./,              // 127.0.0.1 - 127.255.255.255
        /^10\./,               // 10.0.0.0 - 10.255.255.255
        /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0 - 172.31.255.255
        /^192\.168\./,         // 192.168.0.0 - 192.168.255.255
        /^169\.254\./,         // 169.254.0.0 - 169.254.255.255 (链路本地)
        /^0\./,                // 0.0.0.0 - 0.255.255.255
        /^localhost$/,         // localhost
        /^::1$/,               // IPv6 loopback
        /^fe80:/,              // IPv6 link-local
        /^fc00:/,              // IPv6 unique local
        /^fd00:/,              // IPv6 unique local
      ];

      for (const pattern of forbiddenPatterns) {
        if (pattern.test(hostname)) {
          return {
            valid: false,
            error: `禁止访问内网地址: ${hostname}`
          };
        }
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `无效的URL格式: ${(error as Error).message}`
      };
    }
  }

  //解析Cookie字符串
  private parseCookies(setCookieHeaders: string | string[]): ProxyResponse['cookies'] {
    const cookies: ProxyResponse['cookies'] = [];
    const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

    for (const header of headers) {
      const parts = header.split(';').map(p => p.trim());
      const [nameValue, ...attributes] = parts;
      const [name, value] = nameValue.split('=');

      const cookie: ProxyResponse['cookies'][0] = { name, value };

      for (const attr of attributes) {
        const [key, val] = attr.split('=');
        const lowerKey = key.toLowerCase();

        if (lowerKey === 'domain') cookie.domain = val;
        else if (lowerKey === 'path') cookie.path = val;
        else if (lowerKey === 'expires') cookie.expires = new Date(val);
        else if (lowerKey === 'httponly') cookie.httpOnly = true;
        else if (lowerKey === 'secure') cookie.secure = true;
        else if (lowerKey === 'samesite') cookie.sameSite = val as 'Strict' | 'Lax' | 'None';
      }

      cookies.push(cookie);
    }

    return cookies;
  }

  //普通HTTP请求（非流式）
  async proxyRequest(params: ProxyRequestParams): Promise<ProxyResponse | ProxyErrorResponse> {
    //安全检查
    const urlValidation = this.validateUrlSecurity(params.url);
    if (!urlValidation.valid) {
      return {
        error: true,
        message: urlValidation.error!,
        code: 'URL_VALIDATION_ERROR'
      };
    }

    try {
      //准备请求头
      const headers: Record<string, string | undefined> = {
        'user-agent': params.headers['user-agent'] || 'https://github.com/trueleaf/apiflow',
        'accept': params.headers['accept'] || '*/*',
        'accept-encoding': params.headers['accept-encoding'] || 'gzip, deflate, br',
      };

      //处理自定义headers
      for (const key in params.headers) {
        const value = params.headers[key];
        if (value === null) {
          headers[key.toLowerCase()] = undefined;
        } else {
          headers[key.toLowerCase()] = value;
        }
      }

      //准备请求体
      const methodsWithoutBody = ['get', 'head', 'options', 'trace'];
      let willSendBody: undefined | string | FormData | Buffer;

      if (methodsWithoutBody.includes(params.method.toLowerCase())) {
        willSendBody = undefined;
      } else if (params.bodyType === 'none') {
        willSendBody = undefined;
      } else if (params.bodyType === 'json' || params.bodyType === 'raw' || params.bodyType === 'urlencoded') {
        willSendBody = params.body || '';
      } else {
        willSendBody = undefined;
      }
      //注意：FormData和Binary类型需要在Controller层处理文件上传
      //准备got选项
      const gotOptions: Omit<OptionsInit, 'isStream'> = {
        url: params.url,
        method: params.method,
        body: willSendBody,
        headers,
        followRedirect: params.followRedirect ?? true,
        maxRedirects: params.maxRedirects ?? 10,
        timeout: {
          request: params.timeout || 30000
        },
        throwHttpErrors: false,
        agent: {
          http: new http.Agent({ keepAlive: true }),
          http2: new http2.Agent({ keepAlive: true }),
        },
      };

      //发送请求并收集数据
      const requestStream = got.stream(gotOptions);
      const bufferList: Buffer[] = [];
      const redirectList: ProxyResponse['redirectList'] = [];

      let responseInfo: Partial<ProxyResponse> = {};
      let requestData: ProxyResponse['requestData'] = {
        url: '',
        method: '',
        headers: {},
        host: ''
      };

      //监听request事件
      requestStream.on('request', (req: ClientRequest) => {
        const host = req.getHeader('host') as string;
        const path = req.path;
        const fullUrl = `${req.protocol}//${host}${path === '/' ? '' : path}`;
        requestData = {
          url: fullUrl,
          method: req.method,
          headers: req.getHeaders(),
          host: req.host
        };
      });

      //监听response事件
      requestStream.on('response', (response: PlainResponse) => {
        const contentLengthStr = response.headers['content-length'] ?? '0';
        const contentLength = isNaN(parseInt(contentLengthStr)) ? 0 : parseInt(contentLengthStr);

        responseInfo = {
          statusCode: response.statusCode,
          headers: response.headers,
          contentType: response.headers['content-type'] ?? '',
          contentLength,
          finalRequestUrl: response.url,
          ip: response.ip || '',
          timings: response.timings,
          rt: 0,
          requestData
        };
      });

      //收集数据块
      requestStream.on('data', (chunk: Buffer) => {
        bufferList.push(chunk);
      });

      //等待请求完成
      await new Promise<void>((resolve, reject) => {
        requestStream.on('end', () => resolve());
        requestStream.on('error', (error) => reject(error));
      });

      //计算响应时间
      const endTime = responseInfo.timings?.end ?? 0;
      const startTime = responseInfo.timings?.start ?? 0;
      responseInfo.rt = endTime - startTime;

      //合并Buffer
      const bufferData = Buffer.concat(bufferList);
      responseInfo.bodyByteLength = bufferData.byteLength;
      responseInfo.body = bufferData.toString('base64');

      //提取Cookie
      const setCookieHeader = responseInfo.headers?.['set-cookie'];
      responseInfo.cookies = setCookieHeader 
        ? this.parseCookies(setCookieHeader) 
        : [];

      responseInfo.redirectList = redirectList;

      return responseInfo as ProxyResponse;
    } catch (error) {
      const err = error as RequestError | Error;
      return {
        error: true,
        message: err.message,
        code: 'code' in err ? err.code : 'UNKNOWN_ERROR',
        statusCode: 'response' in err ? err.response?.statusCode : undefined
      };
    }
  }

  //流式HTTP请求（用于SSE）
  async proxyStreamRequest(params: ProxyRequestParams): Promise<{ stream: PassThrough; headers: Record<string, string> } | ProxyErrorResponse> {
    //安全检查
    const urlValidation = this.validateUrlSecurity(params.url);
    if (!urlValidation.valid) {
      return {
        error: true,
        message: urlValidation.error!,
        code: 'URL_VALIDATION_ERROR'
      };
    }

    try {
      //准备请求头
      const headers: Record<string, string | undefined> = {
        'user-agent': params.headers['user-agent'] || 'https://github.com/trueleaf/apiflow',
        'accept': params.headers['accept'] || '*/*',
        'accept-encoding': params.headers['accept-encoding'] || 'gzip, deflate, br',
      };

      for (const key in params.headers) {
        const value = params.headers[key];
        if (value === null) {
          headers[key.toLowerCase()] = undefined;
        } else {
          headers[key.toLowerCase()] = value;
        }
      }

      //准备请求体
      const methodsWithoutBody = ['get', 'head', 'options', 'trace'];
      let willSendBody: undefined | string;

      if (methodsWithoutBody.includes(params.method.toLowerCase())) {
        willSendBody = undefined;
      } else if (params.bodyType === 'none') {
        willSendBody = undefined;
      } else if (params.bodyType === 'json' || params.bodyType === 'raw' || params.bodyType === 'urlencoded') {
        willSendBody = params.body || '';
      } else {
        willSendBody = undefined;
      }

      //创建got流
      const requestStream = got.stream({
        url: params.url,
        method: params.method,
        body: willSendBody,
        headers,
        timeout: {
          request: params.timeout || 30000
        },
        throwHttpErrors: false,
      });

      //创建PassThrough流用于响应
      const passThrough = new PassThrough();
      
      //将got流pipe到PassThrough
      requestStream.pipe(passThrough);

      //获取响应头
      let responseHeaders: Record<string, string> = {};
      requestStream.on('response', (response: PlainResponse) => {
        responseHeaders = {
          'content-type': response.headers['content-type'] || 'text/event-stream',
          'cache-control': 'no-cache',
          'connection': 'keep-alive',
        };
      });

      //等待响应头
      await new Promise<void>((resolve, reject) => {
        requestStream.once('response', () => resolve());
        requestStream.once('error', reject);
      });

      return {
        stream: passThrough,
        headers: responseHeaders
      };
    } catch (error) {
      const err = error as RequestError | Error;
      return {
        error: true,
        message: err.message,
        code: 'code' in err ? err.code : 'UNKNOWN_ERROR',
        statusCode: 'response' in err ? err.response?.statusCode : undefined
      };
    }
  }
}
