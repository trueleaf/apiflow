import { WebSocketNode } from '@src/types/websocketNode';

// WebSocket 对象类型
export type WS = {
  projectId: string;
  nodeId: string;
  request: {
    protocol: 'ws' | 'wss';
    url: {
      prefix: string;
      path: string;
      url: string;
    };
    headers: Record<string, string>;
    queryParams: Record<string, string>;
    replaceUrl: (url: string) => void;
  };
  variables: Record<string, unknown>;
  sessionStorage: Record<string, unknown>;
  localStorage: Record<string, unknown>;
  cookies: Record<string, unknown>;
  http?: {
    get: (url: string, options?: unknown) => Promise<unknown>;
    post: (url: string, options?: unknown) => Promise<unknown>;
    put: (url: string, options?: unknown) => Promise<unknown>;
    delete: (url: string, options?: unknown) => Promise<unknown>;
  };
}

// 初始化数据消息
export type InitDataMessage = {
  type: 'initData';
  websocketInfo: WebSocketNode;
  variables: Record<string, unknown>;
  cookies: Record<string, unknown>;
  localStorage: Record<string, unknown>;
  sessionStorage: Record<string, unknown>;
}

// 执行脚本消息
export type EvalMessage = {
  type: 'eval';
  code: string;
}

// Worker 初始化成功消息
export type InitSuccessMessage = {
  type: 'ws-pre-request-init-success';
}

// Worker 执行成功消息
export type EvalSuccessMessage = {
  type: 'ws-pre-request-eval-success';
  value: WS;
}

// Worker 执行错误消息
export type EvalErrorMessage = {
  type: 'ws-pre-request-eval-error';
  value: {
    message: string;
    stack?: string;
  } | string;
}

export type WorkerMessage = InitSuccessMessage | EvalSuccessMessage | EvalErrorMessage;
