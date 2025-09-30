import type { Got } from 'got';
import type {GotRequestOptions, WindowState } from './types';
import type { CommonResponse } from './project';
import type { StandaloneExportHtmlParams } from './standalone';
import { WebsocketConnectParams } from './websocket/websocket.ts';
import { MockHttpNode, MockLog } from './mock/mock.ts';


export type ElectronAPI = {
  ip: string,
  got: Got;
  sendRequest: (options: GotRequestOptions) => Promise<void>,
  openDevTools: () => void,
  readFileAsUint8Array: (path: string) => Promise<Uint8Array | string>;
  getFilePath: (file: File) => string;
  getWindowState: () => Promise<WindowState>;
  minimize: () => void;
  maximize: () => void;
  unmaximize: () => void;
  close: () => void;
  onWindowResize: (callback: (state: WindowState) => void) => void;
  exportHtml: (params: StandaloneExportHtmlParams) => Promise<string>;
  exportWord: (params: StandaloneExportHtmlParams) => Promise<Uint8Array>;
  sendToMain: (channel: string, ...args: any[]) => void;
  onMain: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback?: (...args: any[]) => void) => void;
  websocket: {
    connect: (params: WebsocketConnectParams) => Promise<{ success: boolean; connectionId?: string; error?: string }>;
    disconnect: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
    send: (connectionId: string, message: string) => Promise<{ success: boolean; error?: string }>;
    getState: (connectionId: string) => Promise<{ state?: number; error?: string }>;
    getAllConnections: () => Promise<{ connectionId: string; state: number }[]>;
    getConnectionIds: () => Promise<string[]>;
    checkNodeConnection: (nodeId: string) => Promise<{ connected: boolean; connectionId?: string; state?: number }>;
    clearAllConnections: () => Promise<{ success: boolean; closedCount: number; error?: string }>;
    disconnectByNode: (nodeId: string) => Promise<{ success: boolean; error?: string }>;
  };
  mock: {
    getMockByNodeId: (nodeId: string) => Promise<MockHttpNode | null>;
    startServer: (httpMock: MockHttpNode) => Promise<CommonResponse<null>>;
    stopServer: (nodeId: string) => Promise<CommonResponse<null>>;
    getUsedPorts: () => Promise<{ port: number, projectId: string, nodeId: string, nodeName: string }[]>;
    getLogsByNodeId: (nodeId: string) => Promise<MockLog[]>;
    replaceById: (nodeId: string, httpMock: MockHttpNode) => Promise<{ success: boolean; error?: string }>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    js_beautify?: any;
  }
}
