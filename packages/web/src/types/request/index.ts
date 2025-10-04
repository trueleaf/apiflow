// ============================================================================
// 底层HTTP请求模块
// 只包含Got请求库相关的底层类型，不包含业务逻辑
// ============================================================================

import type { Method, Options, PlainResponse, RequestError } from "got";
import type { Timings } from '@szmarczak/http-timer';
import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http'
import type FormData from 'form-data';
import type { Property } from '../common';

// ============================================================================
// SSE和数据流类型
// ============================================================================

export type SseData = {
  id: string;
  event: string;
  data: string;
  retry: string;
}

export type ChunkWithTimestampe = {
  chunk: Uint8Array;
  timestamp: number;
}

export type ParsedSSeData = {
  id?: string;
  type?: string;
  retry?: number;
  data: string;
  event?: string;
  timestamp: number;
  dataType: 'normal' | 'binary';
  rawBlock: string;
}

// ============================================================================
// 响应解析类型
// ============================================================================

export type CanApiflowParseType =
  | 'textEventStream'
  | 'text'
  | 'json'
  | 'html'
  | 'xml'
  | 'js'
  | 'css'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'ppt'
  | 'image'
  | 'csv'
  | 'zip'
  | 'unknown'
  | 'error'
  | 'none'
  | 'cachedBodyIsTooLarge'
  | 'octetStream'
  | 'video'
  | 'audio'
  | 'archive'
  | 'exe'
  | 'epub'
  | 'forceDownload';

export type ResponseInfo = {
  id: string;
  apiId: string;
  requestId: string;
  headers: IncomingHttpHeaders,
  contentLength: number;
  finalRequestUrl: string;
  statusCode: number;
  isFromCache: boolean;
  contentType: string,
  /**
   * 如果走缓存则没有ip值
   */
  ip: string;
  redirectList: {
    url: string;
    statusCode: number;
    responseHeaders: IncomingHttpHeaders;
    requestHeaders: OutgoingHttpHeaders;
    method: Method;
  }[];
  timings: Timings;
  rt: number;
  retryCount: number;
  bodyByteLength: number;
  body?: unknown;
  requestData: {
    url: string;
    method: string;
    headers: OutgoingHttpHeaders;
    host: string;
    body: string | FormData;
  },
  responseData: {
    canApiflowParseType: CanApiflowParseType,
    jsonData: string;
    textData: string;
    errorData: string;
    fileData: {
      url: string;
      name: string;
      ext: string;
    },
    streamData: ChunkWithTimestampe[]
  }
}

// ============================================================================
// 请求体类型
// ============================================================================

export type RendererFormDataBody = {
  id: string;
  key: string;
  type: 'string' | 'file';
  value: string;
}[];

export type RedirectOptions = {
  plainResponse: PlainResponse,
  requestHeaders: OutgoingHttpHeaders,
  method: Method,
}

// ============================================================================
// GOT请求选项类型
// ============================================================================

export type GotRequestJsonBody = { type: "json", value: string }
export type GotRequestFormdataBody = { type: "formdata", value: RendererFormDataBody }
export type GotRequestBinaryBody = {
  type: "binary", value: {
    mode: 'var' | 'file';
    path: string;
  }
}
export type GotRequestUrlencodedBody = { type: "urlencoded", value: string };
export type GotRequestRawBody = { type: "raw", value: string };

export type GotRequestOptions = {
  url: string;
  method: Method;
  timeout: number;
  body: GotRequestJsonBody | GotRequestFormdataBody | GotRequestBinaryBody | GotRequestUrlencodedBody | GotRequestRawBody | undefined;
  headers: Record<string, string | null>;
  signal: (cancelRequest: () => void) => void;
  onResponse?: (responseInfo: ResponseInfo) => void;
  onResponseEnd?: (responseInfo: ResponseInfo) => void;
  onResponseData?: (chunk: ChunkWithTimestampe, loadedLength: number, totalLength: number) => void;
  onReadFileFormDataError?: (options: { id: string, msg: string, fullMsg: string }) => void;
  onReadBinaryDataError?: (options: { msg: string, fullMsg: string }) => void;
  onError: (error: RequestError | Error) => void,
  onAbort?: () => void,
  beforeRedirect: (options: RedirectOptions) => void,
  beforeRequest?: (options: Options) => void,
  beforeRetry?: (error: RequestError, retryCount: number) => void,
}
