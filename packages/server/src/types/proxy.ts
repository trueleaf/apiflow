import { Method } from 'got';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { Timings } from '@szmarczak/http-timer';

//请求参数类型
export type ProxyRequestParams = {
  url: string;
  method: Method;
  headers: Record<string, string | null>;
  timeout?: number;
  followRedirect?: boolean;
  maxRedirects?: number;
  bodyType: 'json' | 'formdata' | 'urlencoded' | 'raw' | 'binary' | 'none';
  body?: string;
  //FormData字段信息（不包含实际文件内容）
  formDataFields?: Array<{
    id: string;
    key: string;
    type: 'string' | 'file';
    value: string;
  }>;
  //Binary请求的文件路径或变量
  binaryData?: {
    mode: 'var' | 'file';
    path: string;
  };
  //是否启用流式响应（SSE）
  enableStream?: boolean;
}

//响应数据类型
export type ProxyResponse = {
  statusCode: number;
  headers: IncomingHttpHeaders;
  contentType: string;
  contentLength: number;
  finalRequestUrl: string;
  ip: string;
  //重定向历史
  redirectList: Array<{
    url: string;
    statusCode: number;
    responseHeaders: IncomingHttpHeaders;
    requestHeaders: OutgoingHttpHeaders;
    method: Method;
  }>;
  //时间统计
  timings: Timings;
  rt: number;
  //响应体（base64 编码的字符串）
  body: string;
  bodyByteLength: number;
  //Cookie信息
  cookies: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }>;
  //请求详情
  requestData: {
    url: string;
    method: string;
    headers: OutgoingHttpHeaders;
    host: string;
  };
}

//流式响应数据块
export type ProxyStreamChunk = {
  chunk: Buffer;
  timestamp: number;
  loadedLength: number;
  totalLength: number;
}

//错误响应
export type ProxyErrorResponse = {
  error: true;
  message: string;
  code?: string;
  statusCode?: number;
}
