import type { ApidocProperty } from "./httpNode";
import type { WebSocketNode } from "./websocketNode";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// WebSocket模块名称联合类型
export type WsModuleName = 
  | 'messageContent' 
  | 'params' 
  | 'headers' 
  | 'preScript' 
  | 'afterScript' 
  | 'config' 
  | 'remarks' 
  | 'operation';

// WebSocket协议操作
export type WsProtocolOperation = {
  nodeId: string;
  type: "protocolOperation";
  operationName: string;
  affectedModuleName: WsModuleName;
  oldValue: 'ws' | 'wss';
  newValue: 'ws' | 'wss';
  timestamp: number;
};

// WebSocket URL操作
export type WsUrlOperation = {
  nodeId: string;
  type: "urlOperation";
  operationName: string;
  affectedModuleName: WsModuleName;
  oldValue: string;
  newValue: string;
  timestamp: number;
};

// WebSocket请求头操作
export type WsHeadersOperation = {
  nodeId: string;
  type: "headersOperation";
  operationName: string;
  affectedModuleName: WsModuleName;
  oldValue: ApidocProperty<'string'>[];
  newValue: ApidocProperty<'string'>[];
  timestamp: number;
};

// WebSocket查询参数操作
export type WsQueryParamsOperation = {
  nodeId: string;
  type: "queryParamsOperation";
  operationName: string;
  affectedModuleName: WsModuleName;
  oldValue: ApidocProperty<'string'>[];
  newValue: ApidocProperty<'string'>[];
  timestamp: number;
};

// WebSocket发送消息操作
export type WsSendMessageOperation = {
  nodeId: string;
  type: "sendMessageOperation";
  operationName: string;
  affectedModuleName: WsModuleName;
  oldValue: string;
  newValue: string;
  cursorPosition?:  monaco.Position;
  timestamp: number;
};

// WebSocket配置操作
export type WsConfigOperation = {
  nodeId: string;
  type: "configOperation";
  operationName: string;
  affectedModuleName: WsModuleName;
  oldValue: WebSocketNode['config'];
  newValue: WebSocketNode['config'];
  timestamp: number;
};

// WebSocket前置脚本操作
export type WsPreRequestOperation = {
  nodeId: string;
  type: "preRequestOperation";
  operationName: string;
  affectedModuleName: WsModuleName;
  oldValue: WebSocketNode['preRequest'];
  newValue: WebSocketNode['preRequest'];
  timestamp: number;
};

// WebSocket后置脚本操作
export type WsAfterRequestOperation = {
  nodeId: string;
  type: "afterRequestOperation";
  operationName: string;
  affectedModuleName: WsModuleName;
  oldValue: WebSocketNode['afterRequest'];
  newValue: WebSocketNode['afterRequest'];
  timestamp: number;
};

// WebSocket基本信息操作
export type WsBasicInfoOperation = {
  nodeId: string;
  type: "basicInfoOperation";
  operationName: string;
  affectedModuleName: WsModuleName;
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

// 所有WebSocket操作
export type WsRedoUnDoOperation = 
  | WsProtocolOperation 
  | WsUrlOperation 
  | WsHeadersOperation 
  | WsQueryParamsOperation 
  | WsSendMessageOperation 
  | WsConfigOperation 
  | WsPreRequestOperation 
  | WsAfterRequestOperation
  | WsBasicInfoOperation;





