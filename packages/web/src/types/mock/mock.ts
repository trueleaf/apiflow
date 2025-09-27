import { Method } from "got";
import { ApidocBaseInfo } from "../types.ts";
import type http from 'http';
import type Koa from 'koa';

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
    isDefault: boolean;
    conditions: {
      name: string;
      scriptCode: string;
    };
    statusCode: number;
    headers: Record<string, string>;
    dataType: "sse" | "json" | "text" | "image" | "file" | "binary";
    sseConfig: {};
    jsonConfig: {
      mode: "random" | "fixed";
      fixedData: string;
      randomSize: number;
    };
    textConfig: {
      mode: "random" | "fixed";
      fixedData: string;
      randomSize: number;
    };
    imageConfig: {
      mode: "random" | "fixed";
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
  type: "start",
  nodeId: string,
  projectId: string,
  data: {
    port: number,
  },
  timestamp: number
}
type MockStopLog = {
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
  },
  timestamp: number,
}
type MockErrorLog = {
  type: "error",
  nodeId: string,
  projectId: string,
  data: {
    errorType: "portError" | "bindError" | "serverStartError" | "configError" | "unknownError",
    errorMsg: string,
  },
  timestamp: number,
}
type MockAlreadyStoppedLog = {
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
  nodeId: string;
  projectId: string;
  port: number;
  app: Koa;
  server: http.Server;
}