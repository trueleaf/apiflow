// ============================================================================
// 主进程相关模块
// 包含主进程API和窗口状态类型
// ============================================================================

import type { GotRequestOptions } from '../request';
import type { CommonResponse } from '../project';
import type { StandaloneExportHtmlParams } from '../standalone';
import { WebsocketConnectParams } from '../websocketNode';
import { HttpMockNode, MockLog, MockStatusChangedPayload, WebSocketMockNode, WebSocketMockStatusChangedPayload } from '../mockNode';
import { ChatStreamCallbacks } from '@src/main/ai/agent.ts';
import { LLMProviderSettings, ChatRequestBody, OpenAiResponseBody } from '../ai/agent.type.ts';
import type { CheckUpdateResult, DownloadResult, UpdateStatus, UpdateProgress, VersionInfo } from '@src/types/updater';

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
    getMockByNodeId: (nodeId: string) => Promise<HttpMockNode | null>;
    startServer: (httpMock: HttpMockNode) => Promise<CommonResponse<null>>;
    stopServer: (nodeId: string) => Promise<CommonResponse<null>>;
    getLogsByNodeId: (nodeId: string) => Promise<MockLog[]>;
    replaceById: (nodeId: string, httpMock: HttpMockNode) => Promise<CommonResponse<null>>;
    syncProjectVariables: (projectId: string, variables: any[]) => Promise<CommonResponse<null>>;
    getAllStates: (projectId: string) => Promise<MockStatusChangedPayload[]>;
  };
  websocketMock: {
    getMockByNodeId: (nodeId: string) => Promise<WebSocketMockNode | null>;
    startServer: (wsMock: WebSocketMockNode) => Promise<CommonResponse<null>>;
    stopServer: (nodeId: string) => Promise<CommonResponse<null>>;
    replaceById: (nodeId: string, wsMock: WebSocketMockNode) => Promise<CommonResponse<null>>;
    getAllStates: (projectId: string) => Promise<WebSocketMockStatusChangedPayload[]>;
  };
  exportManager: {
    selectPath: () => Promise<CommonResponse<{ filePath?: string; tempPath?: string }>>;
    getStatus: () => Promise<{ status: string; progress: number; itemNum: number }>;
  };
  importManager: {
    selectFile: () => Promise<CommonResponse<{ filePath?: string }>>;
  };
  aiManager: {
    updateConfig: (config: LLMProviderSettings) => void;
    chat: (body: ChatRequestBody) => Promise<OpenAiResponseBody>;
    chatStream: (body: ChatRequestBody, callbacks: ChatStreamCallbacks) => {
      abort: () => void;
    };
  };
  tempFileManager: {
    create: (content: string) => Promise<{ success: true; path: string; size: number } | { success: false; error: string }>;
    delete: (filePath: string) => Promise<{ success: boolean; error?: string }>;
    read: (filePath: string) => Promise<{ success: true; content: string } | { success: false; error: string }>;
  };
  projectScan: {
    selectFolder: () => Promise<{ success: true; folderPath: string; folderName: string; canceled?: false } | { success: false; canceled?: boolean; error?: string }>;
    readFiles: (folderPath: string) => Promise<{ success: true; files: { relativePath: string; content: string }[]; totalFiles: number } | { success: false; error: string }>;
  };
  updater: {
    checkForUpdates: () => Promise<CheckUpdateResult>;
    downloadUpdate: () => Promise<DownloadResult>;
    cancelDownload: () => Promise<DownloadResult>;
    quitAndInstall: () => void;
    getUpdateStatus: () => Promise<UpdateStatus>;
    toggleAutoCheck: (enabled: boolean) => Promise<{ success: boolean }>;
    onUpdateChecking: (callback: () => void) => void;
    onUpdateAvailable: (callback: (info: VersionInfo) => void) => void;
    onUpdateNotAvailable: (callback: () => void) => void;
    onDownloadProgress: (callback: (progress: UpdateProgress) => void) => void;
    onDownloadCompleted: (callback: (info: { version: string; downloadedAt: number }) => void) => void;
    onUpdateError: (callback: (error: { message: string; code?: string }) => void) => void;
    getUpdateSource: () => Promise<{ sourceType: 'github' | 'custom'; customUrl: string }>;
    setUpdateSource: (params: { sourceType: 'github' | 'custom'; customUrl?: string }) => Promise<{ success: boolean }>;
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
