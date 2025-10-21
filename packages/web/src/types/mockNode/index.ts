// ============================================================================
// Mock节点模块
// 包含Mock服务的核心类型定义
// ============================================================================

import { Method } from "got";
import type http from 'http';
import type Koa from 'koa';
import { ApidocBaseInfo, ApidocProperty } from "../httpNode";

// Mock节点激活选项卡类型
export type MockNodeActiveTabType = 'config' | 'logs';

export type MockHttpNode = {
  _id: string;
  pid: string;
  projectId: string;
  sort: number;
  info: ApidocBaseInfo;
  requestCondition: {
    method: (Method | "ALL")[];
    url: string;
    port: number;
  };
  config: {
    delay: number;
  };
  response: {
    name: string;
    isDefault: boolean;
    conditions: {
      name: string;
      scriptCode: string;
      enabled: boolean;
    };
    statusCode: number;
    headers: {
      enabled: boolean;
      defaultHeaders: ApidocProperty<'string'>[];
      customHeaders: ApidocProperty<'string'>[];
    };
    dataType: "sse" | "json" | "text" | "image" | "file" | "binary";
    sseConfig: {
      event: {
        id: {
          enable: boolean,
          valueMode: "increment" | "random" | 'timestamp',
        },
        event: {
          enable: boolean,
          value: string;
        },
        data: {
          mode: "json" | "string",
          value: string;
        },
        retry: {
          enable: boolean,
          value: number;
        },
      },
      interval: number;
      maxNum: number;
    };
    jsonConfig: {
      mode: "random" | "fixed" | "randomAi";
      fixedData: string;
      randomSize: number;
      prompt: string;
    };
    textConfig: {
      mode: "random" | "fixed" | "randomAi";
      textType: "text/plain" | "html" | "xml" | "yaml" | "csv" | 'any';
      fixedData: string;
      randomSize: number;
      prompt: string;
    };
    imageConfig: {
      mode: "random" | "fixed";
      imageConfig: "png" | "jpg" | "webp" | "svg";
      randomSize: number;
      randomWidth: number;
      randomHeight: number;
      fixedFilePath: string;
    };
    fileConfig: {
      fileType: "doc" | "docx" | "xls" | "xlsx" | "pdf" | "ppt" | "pptx" | "zip" | "7z";
    };
    binaryConfig: {
      filePath: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

type MockStartLog = {
  id: string,
  type: "start",
  nodeId: string,
  projectId: string,
  data: {
    port: number,
  },
  timestamp: number
}
type MockStopLog = {
  id: string,
  type: "stop",
  nodeId: string,
  projectId: string,
  data: {
    port: number,
  },
  timestamp: number
}
// Mock 请求日志，参考 Nginx 访问日志格式
type MockRequestLog = {
  id: string,
  type: "request",
  nodeId: string,
  projectId: string,
  data: {
    // 核心日志字段 (参考Nginx格式)
    ip: string,                    // 客户端IP
    method: string,                // HTTP方法
    url: string,                   // 完整URL
    path: string,                  // URL路径
    query: string,                 // 查询字符串
    httpVersion: string,           // HTTP版本
    statusCode: number,            // 响应状态码
    bytesSent: number,            // 发送字节数
    referer: string,              // 引用页面
    userAgent: string,            // 用户代理
    responseTime: number,          // 响应耗时(ms)

    // Mock服务特有字段
    mockDelay: number,            // Mock延迟时间
    matchedRoute: string,         // 匹配的路由模式

    // 可选扩展字段
    protocol: string,             // 协议类型
    hostname: string,             // 主机名
    contentType: string,          // 内容类型
    contentLength: number,        // 内容长度

    // 保留原有但不显示在标准日志中的字段
    headers: Record<string, string>, // 完整请求头(用于详细查看)
    body: string,                 // 请求体(用于调试)

    // Console日志收集
    consoleLogs: Array<{
      level: 'log' | 'warn' | 'error' | 'info' | 'debug',
      message: string,
      timestamp: number,
    }>,
  },
  timestamp: number,
}
type MockErrorLog = {
  id: string,
  type: "error",
  nodeId: string,
  projectId: string,
  data: {
    errorType: "portError" | "bindError" | "serverStartError" | "configError" | "unknownError" | "conditionScriptError" | "conditionNotMet",
    errorMsg: string,
    conditionName?: string,
  },
  timestamp: number,
}
type MockAlreadyStoppedLog = {
  id: string,
  type: "already-stopped",
  nodeId: string,
  projectId: string,
  data: {
    port: number,
    reason: string,
  },
  timestamp: number
}

export type MockLog = MockStartLog | MockStopLog | MockRequestLog | MockErrorLog | MockAlreadyStoppedLog;

export type MockInstance = {
  port: number;
  app: Koa;
  server: http.Server;
}
export type MockSSEEventData = {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
};
// Mock状态变更推送数据
export type MockStatusChangedPayload = {
  nodeId: string;
  projectId: string;
  state: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  port?: number;
  error?: string;
}