import { WebSocketNode } from '@src/types/websocketNode';

// WebSocket 后置脚本对象类型
export type WSAfter = {
  projectId: string;
  nodeId: string;
  response: {
    data: string | ArrayBuffer;
    type: 'text' | 'binary';
    timestamp: number;
    size: number;
    mimeType?: string;
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
  responseData: {
    data: string | ArrayBuffer;
    type: 'text' | 'binary';
    timestamp: number;
    size: number;
    mimeType?: string;
  };
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
  type: 'ws-after-request-init-success';
}

// Worker 执行成功消息
export type EvalSuccessMessage = {
  type: 'ws-after-request-eval-success';
  value: WSAfter;
}

// Worker 执行错误消息
export type EvalErrorMessage = {
  type: 'ws-after-request-eval-error';
  value: {
    message: string;
    stack?: string;
  } | string;
}

// Storage 相关消息类型
export type OnSetSessionStorageEvent = {
  type: 'ws-after-request-set-session-storage';
  value: Record<string, unknown>;
};

export type OnDeleteSessionStorageEvent = {
  type: 'ws-after-request-delete-session-storage';
  value: Record<string, unknown>;
};

export type OnSetLocalStorageEvent = {
  type: 'ws-after-request-set-local-storage';
  value: Record<string, unknown>;
};

export type OnDeleteLocalStorageEvent = {
  type: 'ws-after-request-delete-local-storage';
  value: Record<string, unknown>;
};

export type WorkerMessage =
  | InitSuccessMessage
  | EvalSuccessMessage
  | EvalErrorMessage
  | OnSetSessionStorageEvent
  | OnDeleteSessionStorageEvent
  | OnSetLocalStorageEvent
  | OnDeleteLocalStorageEvent;
