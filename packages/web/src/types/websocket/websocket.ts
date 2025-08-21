import { ApidocBaseInfo, ApidocProperty } from "../types.ts";


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
     * 请求头
     */
    headers: ApidocProperty<'string'>[];
  };
  /**
   * 公共请求头
   */
  commonHeaders?: {
    /**
     * 请求头名称
     */
    key: string;
    /**
     * 请求头值
     */
    value: string;
    /**
     * 请求头描述
     */
    description: string;
  }[];
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
  createdAt?: string;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 是否被删除
   */
  isDeleted?: boolean;
};


// // WebSocket 连接状态
// export type WebSocketState = 
//   | 'connecting'   // 正在连接
//   | 'connected'    // 已连接
//   | 'disconnected' // 已断开
//   | 'error'        // 连接错误
//   | 'reconnecting'; // 重新连接中

// // WebSocket 消息类型
// export type WebSocketMessageType = 
//   | 'text'    // 文本消息
//   | 'binary'  // 二进制消息
//   | 'ping'    // ping消息
//   | 'pong'    // pong消息
//   | 'close';  // 关闭消息

// // WebSocket 消息数据
// export type WebSocketMessage = {
//   id: string;
//   type: WebSocketMessageType;
//   data: string | ArrayBuffer | Blob;
//   timestamp: number;
//   direction: 'send' | 'receive'; // 消息方向
//   size: number; // 消息大小(字节)
// };

// // WebSocket 连接配置
// export type WebSocketConnectionConfig = {
//   url: string;
//   headers: ApidocProperty<'string'>; // 连接头
//   protocols?: string | string[]; // 子协议
//   timeout?: number; // 连接超时时间(毫秒)
//   maxReconnectAttempts?: number; // 最大重连次数
//   reconnectInterval?: number; // 重连间隔(毫秒)
//   autoReconnect?: boolean; // 是否自动重连
//   pingInterval?: number; // ping间隔时间(毫秒)
//   pongTimeout?: number; // pong超时时间(毫秒)
// };

// // WebSocket 连接信息
// export type WebSocketConnectionInfo = {
//   id: string;
//   name: string; // 连接名称
//   url: string;
//   state: WebSocketState;
//   config: WebSocketConnectionConfig;
//   connectedAt?: number; // 连接时间戳
//   disconnectedAt?: number; // 断开时间戳
//   lastActivity?: number; // 最后活动时间戳
//   messageCount: {
//     sent: number;
//     received: number;
//   };
//   bytesTransferred: {
//     sent: number;
//     received: number;
//   };
//   error?: string; // 错误信息
//   reconnectAttempts: number; // 当前重连次数
// };

// // WebSocket 请求信息 (类似HTTP请求)
// export type WebSocketRequestInfo = {
//   id: string;
//   name: string;
//   description: string;
//   url: string;
//   protocols?: string[];
//   headers: Property[];
//   connectionConfig: WebSocketConnectionConfig;
//   messages: WebSocketTestMessage[]; // 测试消息列表
//   preConnectionScript?: string; // 连接前脚本
//   postConnectionScript?: string; // 连接后脚本
//   onMessageScript?: string; // 收到消息时脚本
//   onCloseScript?: string; // 关闭连接时脚本
//   onErrorScript?: string; // 出错时脚本
// };

// // WebSocket 测试消息
// export type WebSocketTestMessage = {
//   id: string;
//   name: string;
//   type: WebSocketMessageType;
//   content: string; // 消息内容
//   enabled: boolean; // 是否启用
//   delay?: number; // 发送延迟(毫秒)
//   repeat?: {
//     enabled: boolean;
//     count: number; // 重复次数, -1表示无限重复
//     interval: number; // 重复间隔(毫秒)
//   };
//   condition?: string; // 发送条件脚本
// };

// // WebSocket 会话信息
// export type WebSocketSession = {
//   id: string;
//   connectionInfo: WebSocketConnectionInfo;
//   messages: WebSocketMessage[]; // 消息历史
//   startTime: number;
//   endTime?: number;
//   duration?: number; // 会话持续时间(毫秒)
//   statistics: {
//     totalMessages: number;
//     totalBytes: number;
//     avgMessageSize: number;
//     messageRate: number; // 消息/秒
//     errorCount: number;
//   };
// };

// // WebSocket 事件类型
// export type WebSocketEventType = 
//   | 'open'
//   | 'close' 
//   | 'message'
//   | 'error'
//   | 'reconnect'
//   | 'ping'
//   | 'pong';

// // WebSocket 事件数据
// export type WebSocketEvent = {
//   id: string;
//   connectionId: string;
//   type: WebSocketEventType;
//   timestamp: number;
//   data?: any; // 事件相关数据
//   error?: string; // 错误信息
// };
