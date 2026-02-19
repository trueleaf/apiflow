export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [member: string]: JsonValue };
export type JsonArray = JsonValue[];
export type BasicJSON = JsonObject;
export type AfHttpRequestOptions = {
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  timeout?: number;
};
export type AfHttpResponse = {
  statusCode: number;
  statusMessage: string;
  headers: Record<string, string | string[] | undefined>;
  body: string;
  json: unknown | null;
};
export type AfterRequestInfo = {
  _id: string;
  projectId: string;
  item: {
    method: string;
    url: string;
    paths: Record<string, string>;
    queryParams: Record<string, string>;
    requestBody: {
      json: string;
      formdata: Array<{
        id: string;
        key: string;
        type: 'string' | 'file';
        value: string;
      }>;
      urlencoded: Record<string, string>;
      raw: string;
      binary: {
        mode: 'var' | 'file';
        path: string;
      };
    };
    headers: Record<string, string | null>;
    bodyType: 'json' | 'urlencoded' | 'formdata' | 'raw' | 'binary' | 'none';
  };
};
export type AfterResponseInfo = {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  cookies: Record<string, string>;
  rt: number;
  size: number;
  ip: string;
  text: string;
  json: string;
  body: string;
};
export type HttpAfter = {
  nodeId: string;
  projectId: string;
  request: {
    method: string;
    url: string;
    headers: Record<string, string | null>;
    queryParams: Record<string, string>;
    pathParams: Record<string, string>;
    body: {
      json: BasicJSON;
      urlencoded: Record<string, string>;
      formdata: Record<string, { type: 'string' | 'file'; value: string } >;
      raw: string;
      binary: { mode: 'var' | 'file'; path: string };
    };
    bodyType: 'json' | 'urlencoded' | 'formdata' | 'raw' | 'binary' | 'none';
  };
  response: AfterResponseInfo;
  variables: Record<string, unknown> & {
    set: (name: string, value: unknown) => void;
    get: (name: string) => unknown;
    remove: (name: string) => void;
  };
  sessionStorage: Record<string, unknown>;
  localStorage: Record<string, unknown>;
  cookies: Record<string, string>;
  http?: {
    request: (url: string, options?: Omit<AfHttpRequestOptions, 'url'>) => Promise<AfHttpResponse>;
    get: (url: string, options?: Omit<AfHttpRequestOptions, 'url' | 'method'>) => Promise<AfHttpResponse>;
    post: (url: string, options?: Omit<AfHttpRequestOptions, 'url' | 'method'>) => Promise<AfHttpResponse>;
    put: (url: string, options?: Omit<AfHttpRequestOptions, 'url' | 'method'>) => Promise<AfHttpResponse>;
    delete: (url: string, options?: Omit<AfHttpRequestOptions, 'url' | 'method'>) => Promise<AfHttpResponse>;
  };
};
export type InitDataMessage = {
  type: 'initData';
  requestInfo: AfterRequestInfo;
  responseInfo: AfterResponseInfo;
  variables: Record<string, unknown>;
  cookies: Record<string, string>;
  localStorage: Record<string, unknown>;
  sessionStorage: Record<string, unknown>;
};
export type EvalMessage = {
  type: 'eval';
  code: string;
};
export type InitSuccessMessage = {
  type: 'after-request-init-success';
};
export type EvalSuccessMessage = {
  type: 'after-request-eval-success';
  value: HttpAfter;
};
export type EvalErrorMessage = {
  type: 'after-request-eval-error';
  value: { message: string; stack?: string } | string;
};
export type OnSetSessionStorageEvent = {
  type: 'after-request-set-session-storage';
  value: Record<string, unknown>;
};
export type OnDeleteSessionStorageEvent = {
  type: 'after-request-delete-session-storage';
  value: Record<string, unknown>;
};
export type OnSetLocalStorageEvent = {
  type: 'after-request-set-local-storage';
  value: Record<string, unknown>;
};
export type OnDeleteLocalStorageEvent = {
  type: 'after-request-delete-local-storage';
  value: Record<string, unknown>;
};
export type OnHttpRequestEvent = {
  type: 'after-request-http-request';
  value: {
    requestId: string;
    options: AfHttpRequestOptions;
  };
};
export type HttpResponseMessage = {
  type: 'after-request-http-response';
  value: {
    requestId: string;
    response: AfHttpResponse;
  };
};
export type HttpErrorMessage = {
  type: 'after-request-http-error';
  value: {
    requestId: string;
    message: string;
  };
};
export type WorkerMessage =
  | InitSuccessMessage
  | EvalSuccessMessage
  | EvalErrorMessage
  | OnSetSessionStorageEvent
  | OnDeleteSessionStorageEvent
  | OnSetLocalStorageEvent
  | OnDeleteLocalStorageEvent
  | OnHttpRequestEvent
  | HttpResponseMessage
  | HttpErrorMessage;
