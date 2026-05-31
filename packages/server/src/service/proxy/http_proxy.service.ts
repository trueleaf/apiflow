import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { got } from 'got';
import type { RequestError, PlainResponse } from 'got';
import FormData from 'form-data';
import http from 'node:http';
import https from 'node:https';
import http2 from 'node:http';
import dns from 'node:dns';
import type { LookupFunction } from 'node:net';
import { ProxyRequestParams, ProxyResponse, ProxyErrorResponse } from '../../types/proxy.js';
import { PassThrough } from 'stream';
import { ProxyHostService } from './proxy_host.service.js';
import { ProjectEnvironment } from '../../entity/project/project_environment.js';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';

@Provide()
export class HttpProxyService {
  @Inject()
  ctx: Context;

  @Inject()
  proxyHostService: ProxyHostService;

  @InjectEntityModel(ProjectEnvironment)
  projectEnvironmentModel: ReturnModelType<typeof ProjectEnvironment>;

  private async getEffectiveHostsMap(projectId?: string, environmentId?: string): Promise<Record<string, string>> {
    const globalHosts = await this.proxyHostService.getHostsMap();
    if (!projectId || !environmentId) {
      return globalHosts;
    }
    try {
      const environment = await this.projectEnvironmentModel.findOne(
        { _id: environmentId, projectId, isEnabled: true },
        { hostMappings: 1 }
      );
      if (environment?.hostMappings) {
        const environmentHosts: Record<string, string> = {};
        for (const mapping of environment.hostMappings) {
          if (mapping.hostname && mapping.ip) {
            environmentHosts[mapping.hostname] = mapping.ip;
          }
        }
        return { ...globalHosts, ...environmentHosts };
      }
    } catch (error) {
      console.warn('Failed to get environment host mappings:', error);
    }
    return globalHosts;
  }

  private createLookupFunction(hostsMap: Record<string, string>): LookupFunction {
    return (hostname, options, callback) => {
      if (hostsMap[hostname]) {
        const ip = hostsMap[hostname];
        if (options.all) {
          (callback as (err: NodeJS.ErrnoException | null, address: string | { address: string; family: number }[], family: number) => void)(null, [{ address: ip, family: 4 }], 4);
        } else {
          callback(null, ip, 4);
        }
      } else {
        dns.lookup(hostname, options, callback);
      }
    };
  }

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
      const reqHeaders = params.headers || {};
      const headers: Record<string, string | undefined> = {
        'user-agent': reqHeaders['user-agent'] || 'https://github.com/trueleaf/apiflow',
        'accept': reqHeaders['accept'] || '*/*',
        'accept-encoding': reqHeaders['accept-encoding'] || 'gzip, deflate, br',
      };

      //处理自定义headers
      for (const key in reqHeaders) {
        const value = reqHeaders[key];
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
      //发送请求
      const hostsMap = await this.getEffectiveHostsMap(params.projectId, params.environmentId);
      const lookupFn = this.createLookupFunction(hostsMap);
      const gotResponse = await got({
        isStream: false,
        responseType: 'buffer',
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
          http: new http.Agent({ keepAlive: true, lookup: lookupFn }),
          https: new https.Agent({ keepAlive: true, lookup: lookupFn }),
          http2: new http2.Agent({ keepAlive: true }),
        },
      });

      //构建响应
      const respHeaders = gotResponse.headers as Record<string, string | string[] | undefined>;
      const contentLengthVal = respHeaders['content-length'];
      const contentLength = typeof contentLengthVal === 'string'
        ? parseInt(contentLengthVal) : 0;
      const bodyBuffer = Buffer.isBuffer(gotResponse.body)
        ? gotResponse.body
        : Buffer.from(gotResponse.body as string);

      const responseInfo: ProxyResponse = {
        statusCode: gotResponse.statusCode,
        headers: respHeaders,
        contentType: (respHeaders['content-type'] as string) ?? '',
        contentLength,
        finalRequestUrl: gotResponse.url,
        ip: gotResponse.ip || '',
        timings: gotResponse.timings,
        rt: (gotResponse.timings?.end ?? 0) - (gotResponse.timings?.start ?? 0),
        requestData: {
          url: params.url,
          method: params.method,
          headers,
          host: new URL(params.url).hostname
        },
        bodyByteLength: bodyBuffer.byteLength,
        body: bodyBuffer.toString('base64'),
        cookies: respHeaders['set-cookie']
          ? this.parseCookies(respHeaders['set-cookie'] as string | string[])
          : [],
        redirectList: [],
      };

      return responseInfo;
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
      const reqHeaders = params.headers || {};
      const headers: Record<string, string | undefined> = {
        'user-agent': reqHeaders['user-agent'] || 'https://github.com/trueleaf/apiflow',
        'accept': reqHeaders['accept'] || '*/*',
        'accept-encoding': reqHeaders['accept-encoding'] || 'gzip, deflate, br',
      };

      for (const key in reqHeaders) {
        const value = reqHeaders[key];
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

      //解析主机名映射（got.stream 不支持自定义 agent.lookup，需重写 URL）
      const hostsMap = await this.getEffectiveHostsMap(params.projectId, params.environmentId);
      const parsedUrl = new URL(params.url);
      const originalHostname = parsedUrl.hostname;
      const mappedIp = hostsMap[originalHostname];
      let requestUrl = params.url;
      if (mappedIp) {
        parsedUrl.hostname = mappedIp;
        requestUrl = parsedUrl.toString();
        headers['host'] = originalHostname;
      }

      const requestStream = got.stream({
        url: requestUrl,
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
