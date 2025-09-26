import { Method } from "got";
import { ApidocBaseInfo } from "../types.ts";

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
    enabled: boolean;
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
  data: {
    port: number,
  },
  timestamp: number
}
type MockStopLog = {
  type: "stop",
  data: {
    port: number,
  },
  timestamp: number
}
// 看看express可以获取到那些具体参数，都可以列出来
type MockRequestLog = {
  type: "request",
  data: {
    ip: string,
    method: string,
    url: string,
    httpVersion: string,
    statusCode: number,
    bytesSent: number,
    referer: string,
    headers: {
      [key: string]: string
    },
    body: string
  },
  timestamp: number,
}
type MockErrorLog = {
  type: "error",
  data: {
    errorType: "portError" | "unknownError",
    errorMsg: string,
  },
  timestamp: number,
}

export type MockLog = MockStartLog | MockStopLog | MockRequestLog | MockErrorLog;
