import type {GotRequestOptions, WindowState } from './types';
import type { CommonResponse } from './project';
import type { StandaloneExportHtmlParams } from './standalone';
import { WebsocketConnectParams } from './websocket/websocket.ts';
import { MockHttpNode, MockLog } from './mock/mock.ts';


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
  };
  exportManager: {
    selectPath: () => Promise<CommonResponse<{ filePath?: string; tempPath?: string }>>;
    getStatus: () => Promise<{ status: string; progress: number; itemNum: number }>;
  };
  importManager: {
    selectFile: () => Promise<CommonResponse<{ filePath?: string }>>;
  };
  aiManager: {
    textChat: (params: { apiKey: string; apiUrl: string }) => Promise<CommonResponse<string>>;
    textChatWithStream: (
      params: { apiKey: string; apiUrl: string; requestId: string },
      onData: (chunk: string) => void,
      onEnd: () => void,
      onError: (error: string) => void
    ) => { cancel: () => Promise<void>; startPromise: Promise<CommonResponse<{ requestId: string }>> };
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    js_beautify?: any;
  }
}
