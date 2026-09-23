import type { HttpMockNode } from './mockNode';
import type { ApidocVariable } from './httpNode/types';

export type DesktopMockRequest = {
  node: HttpMockNode;
  variables: ApidocVariable[];
  request: Record<string, unknown> & { headers: Record<string, string> };
};
export type DesktopMockResponse = {
  status: number;
  headers: Record<string, string>;
  body?: string;
  bytes?: number[];
  filePath?: string;
  sample?: string;
  sse?: HttpMockNode['response'][number]['sseConfig'];
  consoleLogs: { level: 'log' | 'warn' | 'error' | 'info' | 'debug'; message: string; timestamp: number }[];
};
export type DesktopFile = { path: string; name: string; type: string; size: number };
export type DesktopHttpRequest = {
  requestId: string;
  url: string;
  method: string;
  headers: Record<string, string | null>;
  timeout: number;
  followRedirect: boolean;
  maxRedirects: number;
  maxSendFileSize: number;
  body: null | {
    kind: 'json' | 'raw' | 'urlencoded' | 'binary' | 'formdata';
    text?: string;
    path?: string;
    fields?: { id: string; key: string; value: string; kind: 'string' | 'file'; isTempFile?: boolean }[];
  };
};
export type DesktopResponseHead = {
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string[]>;
  requestHeaders: Record<string, string>;
  method: string;
  remoteAddress: string;
  timestamp: number;
};
export type DesktopHttpEvent = {
  kind: 'start' | 'response' | 'redirect' | 'data' | 'end' | 'abort' | 'error' | 'file-error';
  timestamp: number;
  response?: DesktopResponseHead;
  data?: number[];
  message?: string;
  fieldId?: string;
};
