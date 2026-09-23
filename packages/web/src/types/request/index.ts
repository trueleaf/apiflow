// ============================================================================
// 底层HTTP请求模块
// 包含桌面与 Web 共用的请求和响应类型
// ============================================================================

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT' | 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'trace' | 'connect';
export type Headers = Record<string, string | string[] | undefined> & { 'set-cookie'?: string[] };
export type OutgoingHttpHeaders = Record<string, string | string[] | number | undefined>;
export type Timings = {
  start: number;
  socket?: number;
  lookup?: number;
  connect?: number;
  secureConnect?: number;
  upload?: number;
  response?: number;
  end?: number;
  error?: number;
  abort?: number;
  phases: Partial<Record<'wait' | 'dns' | 'tcp' | 'tls' | 'request' | 'firstByte' | 'download' | 'total', number>>;
};

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
  headers: Headers,
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
    responseHeaders: Headers;
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
  isTempFile?: boolean;
}[];

export type RedirectOptions = {
  plainResponse: { statusCode: number; url: string; rawHeaders: string[] },
  requestHeaders: OutgoingHttpHeaders,
  method: Method,
}

// ============================================================================
// HTTP请求选项类型
// ============================================================================

export type HttpRequestJsonBody = { type: "json", value: string }
export type HttpRequestFormdataBody = { type: "formdata", value: RendererFormDataBody }
export type HttpRequestBinaryBody = {
  type: "binary", value: {
    mode: 'var' | 'file';
    path: string;
  }
}
export type HttpRequestUrlencodedBody = { type: "urlencoded", value: string };
export type HttpRequestRawBody = { type: "raw", value: string };

export type HttpRequestOptions = {
  url: string;
  method: Method;
  timeout: number;
  body: HttpRequestJsonBody | HttpRequestFormdataBody | HttpRequestBinaryBody | HttpRequestUrlencodedBody | HttpRequestRawBody | undefined;
  headers: Record<string, string | null>;
  followRedirect?: boolean;
  maxRedirects?: number;
  maxSendFileSize?: number;
  signal: (cancelRequest: () => void) => void;
  onResponse?: (responseInfo: ResponseInfo) => void;
  onResponseEnd?: (responseInfo: ResponseInfo) => void;
  onResponseData?: (chunk: ChunkWithTimestampe, loadedLength: number, totalLength: number) => void;
  onReadFileFormDataError?: (options: { id: string, msg: string, fullMsg: string }) => void;
  onReadBinaryDataError?: (options: { msg: string, fullMsg: string }) => void;
  onError: (error: Error) => void,
  onAbort?: () => void,
  beforeRedirect: (options: RedirectOptions) => void,
  beforeRetry?: (error: Error, retryCount: number) => void,
}
