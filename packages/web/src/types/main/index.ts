// ============================================================================
// 主进程相关模块
// 包含主进程API和窗口状态类型
// ============================================================================

import type {GotRequestOptions } from '../request';
import type { CommonResponse } from '../project';
import type { StandaloneExportHtmlParams } from '../standalone';
import { WebsocketConnectParams } from '../websocketNode';
import { MockHttpNode, MockLog, MockStatusChangedPayload } from '../mockNode';

// ============================================================================
// 窗口状态类型
// ============================================================================

export type WindowState = {
  isMaximized: boolean;
  isMinimized: boolean;
  isFullScreen: boolean;
  isNormal: boolean;
  isVisible: boolean;
  isFocused: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// Electron API类型
// ============================================================================

export type ElectronAPI = {
  ip: string,
  sendRequest: (options: GotRequestOptions) => Promise<void>,
  openDevTools: () => void,
  exportHtml: (params: StandaloneExportHtmlParams) => Promise<string>;
  exportWord: (params: StandaloneExportHtmlParams) => Promise<Uint8Array>;
  windowManager: {
    closeWindow: () => void;
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    unMaximizeWindow: () => void;
    getWindowState: () => Promise<WindowState>;
    onWindowResize: (callback: (state: WindowState) => void) => void;
  };
  fileManager: {
    readFileAsUint8Array: (path: string) => Promise<Uint8Array | string>;
    getFilePath: (file: File) => string;
  };
  ipcManager: {
    sendToMain: (channel: string, ...args: any[]) => void;
    onMain: (channel: string, callback: (...args: any[]) => void) => void;
    removeListener: (channel: string, callback?: (...args: any[]) => void) => void;
  };
  websocket: {
    connect: (params: WebsocketConnectParams) => Promise<CommonResponse<{ connectionId?: string }>>;
    disconnect: (connectionId: string) => Promise<CommonResponse<null>>;
    send: (connectionId: string, message: string) => Promise<CommonResponse<null>>;
    getState: (connectionId: string) => Promise<CommonResponse<{ state?: number }>>;
    getAllConnections: () => Promise<{ connectionId: string; state: number }[]>;
    getConnectionIds: () => Promise<string[]>;
    checkNodeConnection: (nodeId: string) => Promise<{ connected: boolean; connectionId?: string; state?: number }>;
    clearAllConnections: () => Promise<CommonResponse<{ closedCount: number }>>;
    disconnectByNode: (nodeId: string) => Promise<CommonResponse<null>>;
  };
  mock: {
    getMockByNodeId: (nodeId: string) => Promise<MockHttpNode | null>;
    startServer: (httpMock: MockHttpNode) => Promise<CommonResponse<null>>;
    stopServer: (nodeId: string) => Promise<CommonResponse<null>>;
    getLogsByNodeId: (nodeId: string) => Promise<MockLog[]>;
    replaceById: (nodeId: string, httpMock: MockHttpNode) => Promise<CommonResponse<null>>;
    syncProjectVariables: (projectId: string, variables: any[]) => Promise<CommonResponse<null>>;
    getAllStates: (projectId: string) => Promise<MockStatusChangedPayload[]>;
  };
  exportManager: {
    selectPath: () => Promise<CommonResponse<{ filePath?: string; tempPath?: string }>>;
    getStatus: () => Promise<{ status: string; progress: number; itemNum: number }>;
  };
  importManager: {
    selectFile: () => Promise<CommonResponse<{ filePath?: string }>>;
  };
  aiManager: {
    textChat: () => Promise<CommonResponse<string>>;
    textChatWithStream: (
      params: { requestId: string },
      onData: (chunk: string) => void,
      onEnd: () => void,
      onError: (response: CommonResponse<string>) => void
    ) => { cancel: () => Promise<void>; startPromise: Promise<CommonResponse<{ requestId: string }>> };
    generateJson: (params: { prompt: string }) => Promise<CommonResponse<string>>;
    generateText: (params: { prompt: string }) => Promise<CommonResponse<string>>;
  };
}

// ============================================================================
// 全局Window类型扩展
// ============================================================================

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    js_beautify?: any;
  }
}
