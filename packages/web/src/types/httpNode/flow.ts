// ============================================================================
// HTTP节点流程相关类型
// 包含请求流程、节点调用等业务逻辑类型
// ============================================================================

import type { Method } from "got";
import type { Property } from '../common/index';

// ============================================================================
// 自定义请求信息（业务层）
// ============================================================================

export type CustomRequestInfo = {
  id: string;
  method: Method;
  url: string;
  paths: Property[];
  queryParams: Property[];
  requestBody: {
    mode: "json" | "raw" | "formdata" | "urlencoded" | "binary" | "none";
    rawJson: string;
    formdata: Property[];
    urlencoded: Property[];
    raw: {
      data: string;
      dataType: string;
    };
    file: {
      src: string;
    };
  };
  headers: Property[];
  contentType:
  | ""
  | "application/json"
  | "application/x-www-form-urlencoded"
  | "text/javascript"
  | "multipart/form-data"
  | "text/plain"
  | "application/xml"
  | "text/html";
};

// ============================================================================
// 流程相关类型
// ============================================================================

export type Outcoming = {
  lineId: string;
  targetNodeId: string;
  conditionType: 'none' | 'manual';
  conditionScript: string;
}

export type FlowNode = {
  nodeId: string;
  name: string;
  state: 'waiting' | 'pending' | 'finish' | 'error' | 'cancel';
  invokeNum: number;
  httpNodeRequestConfig: {
    timeout?: number;
    variables: Record<string, any>;
    concurrency: number;
  },
  api: {
    name: string;
    type: "http";
    requestInfo: CustomRequestInfo;
    preScript: string;
    afterScript: string;
  };
  outcomings: Outcoming[],
}

export type FlowInfo = {
  config: {
    startNodeId: string,
    apiTimeout: number;
    variables: Record<string, any>;
    stopCondition: 'timeout' | 'error' | 'manual' | 'none',
    stopScript: string;
    stopTimeout: number;
    stopErrorTypes: ('RequestError' | 'ReadError' | 'ParseError' | 'HTTPError' | 'MaxRedirectsError' | 'Error' | 'UnsupportedProtocolError' | 'TimeoutError' | 'UploadError' | 'CancelError')[],
  };
  nodes: FlowNode[];
};

export type RequestStackItem = {
  nodeId: string;
  state: "pending" | "running" | 'finish' | 'failed';
}

export type SendRequestOptions = {
  validVariables: Record<string, any>,
  globalTimeout: number;
}
