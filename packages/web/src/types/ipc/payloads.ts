/**
 * IPC 事件的 Payload 类型定义
 *
 * 每个事件定义包含:
 * - request: 发送方传递的参数
 * - response: 接收方返回的数据 (invoke/handle 模式)
 */

import type { IPC_EVENTS } from './events';

/**
 * IPC 事件映射接口
 * 定义每个事件名对应的请求和响应类型
 */
export interface IPCEventMap {
  // ==================== APIFLOW ====================

  // 顶栏 -> 内容窗口
  [IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.TOPBAR_READY]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.INIT_TABS_DATA]: {
    request: { tabs: any[] };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_CREATED]: {
    request: { projectId: string; projectName: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_CHANGED]: {
    request: { projectId: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_DELETED]: {
    request: { projectId: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.PROJECT_RENAMED]: {
    request: { projectId: string; newName: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.NAVIGATE]: {
    request: { route: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.LANGUAGE_CHANGED]: {
    request: { language: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.NETWORK_MODE_CHANGED]: {
    request: { mode: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.TOPBAR_TO_CONTENT.SYNC_AI_CONFIG]: {
    request: any;
    response: void;
  };

  // 内容窗口 -> 顶栏
  [IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.CONTENT_READY]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.INIT_TABS]: {
    request: { tabs: any[] };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.CREATE_PROJECT]: {
    request: { name: string; path?: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.SWITCH_PROJECT]: {
    request: { projectId: string; projectName: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.PROJECT_DELETED]: {
    request: string;
    response: void;
  };

  [IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.PROJECT_RENAMED]: {
    request: { projectId: string; projectName: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.CONTENT_TO_TOPBAR.SHOW_LANGUAGE_MENU]: {
    request: void;
    response: void;
  };

  // 渲染进程 -> 主进程 (请求-响应)
  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.TOPBAR_IS_READY]: {
    request: void;
    response: boolean;
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.CONTENT_IS_READY]: {
    request: void;
    response: boolean;
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.CREATE_PROJECT]: {
    request: { name: string; path?: string };
    response: { success: boolean; projectId?: string; error?: string };
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.CHANGE_PROJECT]: {
    request: { projectId: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.DELETE_PROJECT]: {
    request: { projectId: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.CHANGE_PROJECT_NAME]: {
    request: { projectId: string; newName: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.CHANGE_ROUTE]: {
    request: { route: string };
    response: void;
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.GO_BACK]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.GO_FORWARD]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.REFRESH_APP]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.REFRESH_CONTENT_VIEW]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.READ_FILE_AS_BLOB]: {
    request: { filePath: string };
    response: Blob | null;
  };

  // ==================== WINDOW ====================

  [IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.MINIMIZE]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.MAXIMIZE]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.UNMAXIMIZE]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.CLOSE]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.GET_STATE]: {
    request: void;
    response: { isMaximized: boolean };
  };

  [IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.RESIZE]: {
    request: { width: number; height: number };
    response: void;
  };

  [IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.OPEN_DEV_TOOLS]: {
    request: void;
    response: void;
  };

  // ==================== WEBSOCKET ====================

  [IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.CONNECT]: {
    request: {
      url: string;
      nodeId: string;
      protocols?: string | string[];
      headers?: Record<string, string>;
    };
    response: { success: boolean; connectionId?: string; error?: string };
  };

  [IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.DISCONNECT]: {
    request: { connectionId: string };
    response: { success: boolean };
  };

  [IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.DISCONNECT_BY_NODE]: {
    request: { nodeId: string };
    response: { success: boolean };
  };

  [IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.SEND]: {
    request: { connectionId: string; data: any };
    response: { success: boolean; error?: string };
  };

  [IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.GET_STATE]: {
    request: { connectionId: string };
    response: {
      state: 'connecting' | 'open' | 'closing' | 'closed';
      url?: string;
      nodeId?: string;
    } | null;
  };

  [IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.GET_ALL_CONNECTIONS]: {
    request: void;
    response: Array<{
      connectionId: string;
      url: string;
      nodeId: string;
      state: string;
    }>;
  };

  [IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.GET_CONNECTION_IDS]: {
    request: { nodeId: string };
    response: string[];
  };

  [IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.CHECK_NODE_CONNECTION]: {
    request: { nodeId: string };
    response: { connected: boolean; connectionIds: string[] };
  };

  [IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.CLEAR_ALL_CONNECTIONS]: {
    request: void;
    response: { success: boolean };
  };

  // WebSocket 事件通知
  [IPC_EVENTS.WEBSOCKET.MAIN_TO_RENDERER.OPENED]: {
    request: { connectionId: string; nodeId: string; url: string };
    response: void;
  };

  [IPC_EVENTS.WEBSOCKET.MAIN_TO_RENDERER.MESSAGE]: {
    request: { connectionId: string; nodeId: string; data: any };
    response: void;
  };

  [IPC_EVENTS.WEBSOCKET.MAIN_TO_RENDERER.CLOSED]: {
    request: {
      connectionId: string;
      nodeId: string;
      code: number;
      reason: string;
    };
    response: void;
  };

  [IPC_EVENTS.WEBSOCKET.MAIN_TO_RENDERER.ERROR]: {
    request: { connectionId: string; nodeId: string; error: string };
    response: void;
  };

  // ==================== MOCK ====================

  [IPC_EVENTS.MOCK.RENDERER_TO_MAIN.GET_BY_NODE_ID]: {
    request: { nodeId: string };
    response: any;
  };

  [IPC_EVENTS.MOCK.RENDERER_TO_MAIN.START_SERVER]: {
    request: {
      nodeId: string;
      port: number;
      config: any;
    };
    response: { success: boolean; error?: string };
  };

  [IPC_EVENTS.MOCK.RENDERER_TO_MAIN.STOP_SERVER]: {
    request: { nodeId: string };
    response: { success: boolean };
  };

  [IPC_EVENTS.MOCK.RENDERER_TO_MAIN.REPLACE_BY_ID]: {
    request: { nodeId: string; config: any };
    response: { success: boolean };
  };

  [IPC_EVENTS.MOCK.RENDERER_TO_MAIN.GET_ALL_STATES]: {
    request: void;
    response: Record<string, any>;
  };

  [IPC_EVENTS.MOCK.RENDERER_TO_MAIN.SYNC_PROJECT_VARIABLES]: {
    request: { variables: any };
    response: void;
  };

  [IPC_EVENTS.MOCK.RENDERER_TO_MAIN.GET_LOGS_BY_NODE_ID]: {
    request: { nodeId: string };
    response: any[];
  };

  [IPC_EVENTS.MOCK.MAIN_TO_RENDERER.LOGS_BATCH]: {
    request: any[];
    response: void;
  };

  [IPC_EVENTS.MOCK.MAIN_TO_RENDERER.STATUS_CHANGED]: {
    request: any;
    response: void;
  };

  // ==================== EXPORT ====================

  [IPC_EVENTS.EXPORT.RENDERER_TO_MAIN.SELECT_PATH]: {
    request: void;
    response: { success: boolean; filePath?: string };
  };

  [IPC_EVENTS.EXPORT.RENDERER_TO_MAIN.GET_STATUS]: {
    request: void;
    response: { status: 'idle' | 'exporting' | 'completed' | 'error' };
  };

  [IPC_EVENTS.EXPORT.MAIN_TO_RENDERER.READY_TO_RECEIVE]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.EXPORT.MAIN_TO_RENDERER.FINISH]: {
    request: { success: boolean };
    response: void;
  };

  [IPC_EVENTS.EXPORT.MAIN_TO_RENDERER.ERROR]: {
    request: { error: string };
    response: void;
  };

  [IPC_EVENTS.EXPORT.MAIN_TO_RENDERER.RESET_COMPLETE]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.EXPORT.RENDERER_NOTIFY_MAIN.START]: {
    request: { totalItems: number };
    response: void;
  };

  [IPC_EVENTS.EXPORT.RENDERER_NOTIFY_MAIN.RENDERER_DATA]: {
    request: { data: any };
    response: void;
  };

  [IPC_EVENTS.EXPORT.RENDERER_NOTIFY_MAIN.RENDERER_DATA_FINISH]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.EXPORT.RENDERER_NOTIFY_MAIN.RESET]: {
    request: void;
    response: void;
  };

  // ==================== IMPORT ====================

  [IPC_EVENTS.IMPORT.RENDERER_TO_MAIN.SELECT_FILE]: {
    request: void;
    response: { success: boolean; filePath?: string };
  };

  [IPC_EVENTS.IMPORT.MAIN_TO_RENDERER.FILE_ANALYZED]: {
    request: { totalItems: number; metadata: any };
    response: void;
  };

  [IPC_EVENTS.IMPORT.MAIN_TO_RENDERER.PROGRESS]: {
    request: { current: number; total: number; percentage: number };
    response: void;
  };

  [IPC_EVENTS.IMPORT.MAIN_TO_RENDERER.DATA_ITEM]: {
    request: { item: any };
    response: void;
  };

  [IPC_EVENTS.IMPORT.MAIN_TO_RENDERER.ZIP_READ_COMPLETE]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.IMPORT.MAIN_TO_RENDERER.ERROR]: {
    request: { error: string };
    response: void;
  };

  [IPC_EVENTS.IMPORT.RENDERER_NOTIFY_MAIN.ANALYZE_FILE]: {
    request: { filePath: string };
    response: void;
  };

  [IPC_EVENTS.IMPORT.RENDERER_NOTIFY_MAIN.START]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.IMPORT.RENDERER_NOTIFY_MAIN.RESET]: {
    request: void;
    response: void;
  };

  // ==================== AI ====================

  [IPC_EVENTS.AI.RENDERER_TO_MAIN.TEXT_CHAT]: {
    request: {
      messages: Array<{ role: string; content: string }>;
      config: any;
    };
    response: { content: string; error?: string };
  };

  [IPC_EVENTS.AI.RENDERER_TO_MAIN.JSON_CHAT]: {
    request: {
      messages: Array<{ role: string; content: string }>;
      config: any;
    };
    response: { data: any; error?: string };
  };

  [IPC_EVENTS.AI.RENDERER_TO_MAIN.TEXT_CHAT_STREAM]: {
    request: {
      correlationId: string;
      messages: Array<{ role: string; content: string }>;
      config: any;
    };
    response: { success: boolean; correlationId: string };
  };

  [IPC_EVENTS.AI.RENDERER_TO_MAIN.CANCEL_STREAM]: {
    request: { correlationId: string };
    response: { success: boolean };
  };

  [IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_DATA]: {
    request: { correlationId: string; chunk: string };
    response: void;
  };

  [IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_END]: {
    request: { correlationId: string };
    response: void;
  };

  [IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_ERROR]: {
    request: { correlationId: string; error: string };
    response: void;
  };

  // ==================== UTIL ====================

  [IPC_EVENTS.UTIL.RENDERER_TO_MAIN.EXEC_CODE]: {
    request: { code: string; context?: Record<string, any> };
    response: { result: any; error?: string };
  };
}

/**
 * 获取指定事件的请求类型
 */
export type IPCRequest<T extends keyof IPCEventMap> = IPCEventMap[T]['request'];

/**
 * 获取指定事件的响应类型
 */
export type IPCResponse<T extends keyof IPCEventMap> = IPCEventMap[T]['response'];
