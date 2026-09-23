// ============================================================================
// 主进程相关模块
// 包含主进程API和窗口状态类型
// ============================================================================

import type { DesktopFile } from '../desktop';
import type { ApidocVariable } from '../httpNode/types';
import type { UpdateSettings } from '../update';
import type { HttpRequestOptions } from '../request';
import type { CommonResponse } from '../project';
import type { StandaloneExportHtmlParams } from '../standalone';
import { WebsocketConnectParams } from '../websocketNode';
import { HttpMockNode, MockLog, MockStatusChangedPayload, WebSocketMockNode, WebSocketMockStatusChangedPayload } from '../mockNode';
import { LLMProviderSetting, ChatRequestBody, OpenAiResponseBody, ChatStreamCallbacks } from '../ai/agent.type.ts';
import type { AgentAbortRequest, AgentApprovalResponseRequest, AgentClientToolResult, AgentRuntimeEventPayload, AgentRunRequest, AgentRunResponse } from '../ai';
import type { McpServerSettings, McpStatus } from '../mcp';

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
// Tauri API类型
// ============================================================================

export type DesktopAPI = {
  ip: string,
  sendRequest: (options: HttpRequestOptions) => Promise<void>,
  afHttpRequest: (options: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | null | undefined>;
    body?: unknown;
    timeout?: number;
  }) => Promise<{
    statusCode: number;
    statusMessage: string;
    headers: Record<string, string | string[] | undefined>;
    body: string;
    json: unknown | null;
  }>,
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
    selectFile: (extensions?: string[]) => Promise<DesktopFile | null>;
  };
  ipcManager: {
    sendToMain: <T = unknown>(channel: string, ...args: T[]) => void;
    onMain: <T = unknown>(channel: string, callback: (payload: T) => void) => void;
    removeListener: <T = unknown>(channel: string, callback?: (payload: T) => void) => void;
    invoke: <T = unknown, R = unknown>(channel: string, ...args: T[]) => Promise<R>;
  };
  mcpManager: {
    getStatus: () => Promise<McpStatus>;
    updateSettings: (settings: McpServerSettings) => Promise<McpStatus>;
    restart: () => Promise<McpStatus>;
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
    syncProjectVariables: (projectId: string, variables: ApidocVariable[]) => Promise<CommonResponse<null>>;
    getAllStates: (projectId: string) => Promise<MockStatusChangedPayload[]>;
  };
  websocketMock: {
    getMockByNodeId: (nodeId: string) => Promise<WebSocketMockNode | null>;     
    startServer: (wsMock: WebSocketMockNode) => Promise<CommonResponse<null>>;  
    stopServer: (nodeId: string) => Promise<CommonResponse<null>>;
    replaceById: (nodeId: string, wsMock: WebSocketMockNode) => Promise<CommonResponse<null>>;
    getAllStates: (projectId: string) => Promise<WebSocketMockStatusChangedPayload[]>;
  };
  aiManager: {
    updateConfig: (config: LLMProviderSetting) => void;
    chat: (body: ChatRequestBody, config?: LLMProviderSetting) => Promise<OpenAiResponseBody>;
    chatStream: (body: ChatRequestBody, callbacks: ChatStreamCallbacks, config?: LLMProviderSetting) => {
      abort: () => void;
    };
    run: (request: AgentRunRequest) => Promise<AgentRunResponse>;
    abort: (request: AgentAbortRequest) => Promise<AgentRunResponse>;
    respondApproval: (request: AgentApprovalResponseRequest) => Promise<AgentRunResponse>;
    onEvent: (callback: (payload: AgentRuntimeEventPayload) => void) => void;
    onClientToolCommand: (callback: (event: AgentRuntimeEventPayload['event']) => void) => void;
    sendClientToolResult: (result: AgentClientToolResult) => void;
    removeListeners: () => void;
  };
  tempFileManager: {
    create: (content: string) => Promise<CommonResponse<{ path: string; size: number }>>;
    delete: (filePath: string) => Promise<CommonResponse>;
    read: (filePath: string) => Promise<CommonResponse<{ content: string }>>;
  };
  updateManager: {
    checkForUpdates: () => Promise<CommonResponse<{ updateInfo?: unknown }>>;
    downloadUpdate: () => Promise<CommonResponse>;
    quitAndInstall: () => Promise<CommonResponse>;
    cancelDownload: () => Promise<CommonResponse>;
    pauseDownload: () => Promise<CommonResponse>;
    resumeDownload: () => Promise<CommonResponse>;
    getDownloadState: () => Promise<CommonResponse>;
    syncSettings: (settings: UpdateSettings) => Promise<CommonResponse>;
    setAutoCheck: (autoCheck: boolean) => Promise<CommonResponse>;
    setUpdateSource: (source: 'github' | 'custom', customUrl?: string) => Promise<CommonResponse>;
    testConnection: (url: string) => Promise<CommonResponse>;
    isAppStore: () => Promise<boolean>;
  };
  // ContentView 生命周期管理
  contentViewRetry: () => void;
  contentViewFallback: () => void;
  contentViewGetLoadState: () => Promise<{
    state: 'idle' | 'loading' | 'loaded' | 'failed';
    failureInfo: {
      errorCode: number;
      errorDescription: string;
      validatedURL: string;
      timestamp: number;
    } | null;
    currentUrl: string;
  }>;
}

// ============================================================================
// 全局Window类型扩展
// ============================================================================

declare global {
  interface Window {
    desktopAPI?: DesktopAPI;
    js_beautify?: any;
  }
}
