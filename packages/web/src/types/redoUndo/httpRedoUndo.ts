import type { ApidocProperty } from "../httpNode";
import type { HttpNode } from "../httpNode";
import type { HttpNodeRequestMethod, HttpNodeBodyParams, HttpNodeResponseParams } from "../httpNode";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// HTTP模块名称联合类型
export type HttpModuleName =
  | 'method'
  | 'prefix'
  | 'path'
  | 'headers'
  | 'queryParams'
  | 'paths'
  | 'requestBody'
  | 'rawJson'
  | 'preRequest'
  | 'afterRequest'
  | 'basicInfo'
  | 'responseParams';

// HTTP请求方法操作
export type HttpMethodOperation = {
  nodeId: string;
  type: "methodOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: HttpNodeRequestMethod;
  newValue: HttpNodeRequestMethod;
  timestamp: number;
};

// HTTP URL前缀操作
export type HttpPrefixOperation = {
  nodeId: string;
  type: "prefixOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: string;
  newValue: string;
  timestamp: number;
};

// HTTP URL路径操作
export type HttpPathOperation = {
  nodeId: string;
  type: "pathOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: string;
  newValue: string;
  timestamp: number;
};

// HTTP请求头操作
export type HttpHeadersOperation = {
  nodeId: string;
  type: "headersOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: ApidocProperty<'string'>[];
  newValue: ApidocProperty<'string'>[];
  timestamp: number;
};

// HTTP查询参数操作
export type HttpQueryParamsOperation = {
  nodeId: string;
  type: "queryParamsOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: ApidocProperty<'string'>[];
  newValue: ApidocProperty<'string'>[];
  timestamp: number;
};

// HTTP路径参数操作
export type HttpPathsOperation = {
  nodeId: string;
  type: "pathsOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: ApidocProperty<'string'>[];
  newValue: ApidocProperty<'string'>[];
  timestamp: number;
};

// HTTP请求体操作（包含所有Body模式和ContentType）
export type HttpBodyOperation = {
  nodeId: string;
  type: "bodyOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: {
    requestBody: HttpNodeBodyParams;
    contentType: HttpNode['item']['contentType'];
  };
  newValue: {
    requestBody: HttpNodeBodyParams;
    contentType: HttpNode['item']['contentType'];
  };
  timestamp: number;
};

// HTTP Raw JSON操作（用于JSON类型的body编辑）
export type HttpRawJsonOperation = {
  nodeId: string;
  type: "rawJsonOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: string;
  newValue: string;
  cursorPosition?: monaco.Position;
  timestamp: number;
};

// HTTP前置脚本操作
export type HttpPreRequestOperation = {
  nodeId: string;
  type: "preRequestOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: HttpNode['preRequest'];
  newValue: HttpNode['preRequest'];
  cursorPosition?: monaco.Position;
  timestamp: number;
};

// HTTP后置脚本操作
export type HttpAfterRequestOperation = {
  nodeId: string;
  type: "afterRequestOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: HttpNode['afterRequest'];
  newValue: HttpNode['afterRequest'];
  cursorPosition?: monaco.Position;
  timestamp: number;
};

// HTTP基本信息操作
export type HttpBasicInfoOperation = {
  nodeId: string;
  type: "basicInfoOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: {
    name: string;
    description: string;
  };
  newValue: {
    name: string;
    description: string;
  };
  timestamp: number;
};

// HTTP响应参数操作
export type HttpResponseParamsOperation = {
  nodeId: string;
  type: "responseParamsOperation";
  operationName: string;
  affectedModuleName: HttpModuleName;
  oldValue: HttpNodeResponseParams[];
  newValue: HttpNodeResponseParams[];
  timestamp: number;
};

// 所有HTTP操作
export type HttpRedoUnDoOperation =
  | HttpMethodOperation
  | HttpPrefixOperation
  | HttpPathOperation
  | HttpHeadersOperation
  | HttpQueryParamsOperation
  | HttpPathsOperation
  | HttpBodyOperation
  | HttpRawJsonOperation
  | HttpPreRequestOperation
  | HttpAfterRequestOperation
  | HttpBasicInfoOperation
  | HttpResponseParamsOperation;
