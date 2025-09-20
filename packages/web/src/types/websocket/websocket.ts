import { ApidocBaseInfo, ApidocProperty } from "../types.ts";

/**
 * WebSocket消息类型
 */
export type WebsocketMessageType = 'text' | 'json' | 'xml' | 'html' | 'binary-base64' | 'binary-hex';

/**
 * WebSocket激活选项卡类型
 */
export type WebsocketActiveTabType = 'messageContent' | 'params' | 'headers' | 'preScript' | 'afterScript' | 'config' | 'remarks';

/**
 * WebSocket连接参数
 */
export type WebsocketConnectParams = {
  /**
   * 连接URL
   */
  url: string;
  /**
   * 节点ID
   */
  nodeId: string;
  /**
   * 请求头
   */
  headers: Record<string, string>;
};

export type WebSocketNode = {
  /**
   * 当前节点d
   */
  _id: string;
  /**
   * 父元素id
   */
  pid: string;
  /**
   * 项目id
   */
  projectId: string;
  /**
   * 排序
   */
  sort: number;
  /**
   * 基本信息
   */
  info: ApidocBaseInfo;
  /**
   * 接口信息
   */
  item: {
    /**
     * 协议
     */
    protocol: 'ws' | 'wss';
    /**
     * 请求地址
     */
    url: {
      path: string; 
      prefix: string;
    };
    /**
     * 请求参数
     */
    queryParams: ApidocProperty<'string'>[];
    /**
     * 请求头
     */
    headers: ApidocProperty<'string'>[];
    /**
     * 发送的数据
     */
    sendMessage: string;
  };
  /**
   * 连接配置
   */
  config: {
    /**
     * 消息类型
     */
    messageType: WebsocketMessageType;
    /**
     * 是否自动发送
     */
    autoSend: boolean;
    /**
     * 自动发送间隔
     */
    autoSendInterval: number;
    /**
     * 默认自动发送内容
     */
    defaultAutoSendContent: string;
    /**
     * 是否自动重连
     */
    autoReconnect: boolean;
  },
  /**
   * 前置脚本
   */
  preRequest: {
    raw: string;
  };
  /**
   * 后置脚本
   */
  afterRequest: {
    raw: string;
  };
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 更新时间
   */
  updatedAt: string;
  /**
   * 是否被删除
   */
  isDeleted: boolean;
};

// 发送消息数据
export type WebsocketSendResponse = {
  type: "send";
  data: {
    id: string;
    nodeId: string;
    content: string;
    timestamp: number;
    contentType: WebsocketMessageType;
    size: number; // 消息大小(字节)
  };
};

// 接收消息数据
export type WebsocketReceiveResponse = {
  type: "receive";
  data: {
    id: string;
    nodeId: string;
    content: ArrayBuffer;
    timestamp: number;
    contentType: 'text' | 'binary';
    mimeType: string;
    size: number; // 消息大小
  };
};

// 发起连接数据
export type WebsocketStartConnectResponse = {
  type: "startConnect";
  data: {
    id: string;
    nodeId: string;
    url: string;
    timestamp: number;
  };
};
// 连接数据
export type WebsocketConnectedResponse = {
  type: "connected";
  data: {
    id: string;
    nodeId: string;
    url: string;
    timestamp: number;
  };
};

// 断开连接数据
export type WebsocketDisconnectedResponse = {
  type: "disconnected";
  data: {
    id: string;
    nodeId: string;
    url: string;
    reasonType: 'manual' | 'auto';
    timestamp: number;
  };
};

// 错误数据
export type WebsocketErrorResponse = {
  type: "error";
  data: {
    id: string;
    nodeId: string;
    error: string;
    timestamp: number;
  };
};

// 自动发送响应
export type WebsocketAutoSendResponse = {
  type: "autoSend";
  data: {
    id: string;
    nodeId: string;
    message: string;
    timestamp: number;
  };
};

// 正在重连响应
export type WebsocketReconnectingResponse = {
  type: "reconnecting";
  data: {
    id: string;
    nodeId: string;
    url: string;
    timestamp: number;
    attempt: number; // 重试次数
    nextRetryTime: number; // 下次重试时间戳
  };
};



export type WebsocketResponse = 
  | WebsocketSendResponse 
  | WebsocketReceiveResponse 
  | WebsocketConnectedResponse 
  | WebsocketDisconnectedResponse 
  | WebsocketErrorResponse
  | WebsocketAutoSendResponse
  | WebsocketStartConnectResponse
  | WebsocketReconnectingResponse;

export type WebsocketSendMessageTemplate = {
  id: string;
  name: string;
  sendMessage: string;
  messageType: WebsocketMessageType;
  createdAt: number;
  updatedAt: number;
};

// WebSocket其他配置
export type WebsocketConfig = {
  connectionWaitingTip: boolean;
  /**
   * 需要展示的快捷操作列表
   */
  quickOperations: ('autoSend' | 'template')[];
};
