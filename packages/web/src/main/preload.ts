
import {contextBridge, ipcRenderer, webUtils } from 'electron'
import ip from 'ip'
import { gotRequest } from './sendRequest'
import { got } from 'got'
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts'
import { WindowState } from '@src/types/index.ts'
import { IPC_EVENTS } from '@src/types/ipc'
import type { ChatRequestBody, LLMProviderSetting, OpenAiResponseBody, ChatStreamCallbacks } from '@src/types/ai/agent.type'
import { globalLLMClient } from './ai/agent.ts'
import type { Method } from 'got'
const openDevTools = () => {
  ipcRenderer.send(IPC_EVENTS.window.rendererToMain.openDevTools)
}

const minimizeWindow = () => {
  ipcRenderer.send(IPC_EVENTS.window.rendererToMain.minimize)
}

const maximizeWindow = () => {
  ipcRenderer.send(IPC_EVENTS.window.rendererToMain.maximize)
}

const unMaximizeWindow = () => {
  ipcRenderer.send(IPC_EVENTS.window.rendererToMain.unmaximize)
}

const closeWindow = () => {
  ipcRenderer.send(IPC_EVENTS.window.rendererToMain.close)
}

const getWindowState = () => {
  return ipcRenderer.invoke(IPC_EVENTS.window.rendererToMain.getState)
}

const onWindowResize = (callback: (state: WindowState) => void) => {
  ipcRenderer.on(IPC_EVENTS.window.rendererToMain.resize, (_event, state) => callback(state))
}

const readFileAsUint8Array = async (path: string): Promise<Uint8Array | string> => {
  const result = await ipcRenderer.invoke(IPC_EVENTS.apiflow.rendererToMain.readFileAsBlob, path);
  return result;
}
const getFilePath = (file: File) => {
  return webUtils.getPathForFile(file)
}
const exportHtml = async (params: StandaloneExportHtmlParams) => {
  return ipcRenderer.invoke('apiflow-export-html', params)
}
const exportWord = async (params: StandaloneExportHtmlParams) => {
  return ipcRenderer.invoke('apiflow-export-word', params)
}

// 前置脚本专用 http 请求(走 got，不自动携带环境参数)
const afHttpRequest = async (options: {
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  timeout?: number;
}): Promise<{
  statusCode: number;
  statusMessage: string;
  headers: Record<string, string | string[] | undefined>;
  body: string;
  json: unknown | null;
}> => {
  const url = new URL(options.url);
  if (options.params) {
    Object.keys(options.params).forEach((key) => {
      const value = options.params?.[key];
      if (value === undefined || value === null) {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  const method = options.method.toUpperCase() as Method;
  const headers: Record<string, string> = { ...(options.headers ?? {}) };
  let body: string | undefined = undefined;
  if (options.body !== undefined) {
    if (typeof options.body === 'string') {
      body = options.body;
    } else {
      body = JSON.stringify(options.body);
      if (!headers['content-type'] && !headers['Content-Type']) {
        headers['content-type'] = 'application/json';
      }
    }
  }
  const response = await got(url.toString(), {
    method,
    headers,
    timeout: { request: options.timeout ?? 60000 },
    throwHttpErrors: false,
    retry: { limit: 0 },
    body,
    responseType: 'text',
  });
  const json = (() => {
    const text = response.body;
    if (!text || !text.trim()) {
      return null;
    }
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return null;
    }
  })();
  return {
    statusCode: response.statusCode,
    statusMessage: response.statusMessage ?? '',
    headers: response.headers,
    body: response.body,
    json,
  };
}

const sendToMain = (channel: string, ...args: any[]) => {
  ipcRenderer.send(channel, ...args)
}
const onMain = (channel: string, callback: (...args: any[]) => void) => {
  ipcRenderer.on(channel, (_event, ...args) => callback(...args))
}

const removeListener = (channel: string, callback?: (...args: any[]) => void) => {
  callback ? ipcRenderer.removeListener(channel, callback) : ipcRenderer.removeAllListeners(channel);
}

// WebSocket相关方法
const websocketConnect = (params: { url: string; nodeId: string; headers?: Record<string, string> }) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocket.rendererToMain.connect, params)
}

const websocketDisconnect = (connectionId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocket.rendererToMain.disconnect, connectionId)
}

const websocketSend = (connectionId: string, message: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocket.rendererToMain.send, connectionId, message)
}

const websocketGetState = (connectionId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocket.rendererToMain.getState, connectionId)
}

const websocketGetAllConnections = () => {
  return ipcRenderer.invoke(IPC_EVENTS.websocket.rendererToMain.getAllConnections)
}

const websocketGetConnectionIds = () => {
  return ipcRenderer.invoke(IPC_EVENTS.websocket.rendererToMain.getConnectionIds)
}

const websocketCheckNodeConnection = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocket.rendererToMain.checkNodeConnection, nodeId)
}

const websocketClearAllConnections = () => {
  return ipcRenderer.invoke(IPC_EVENTS.websocket.rendererToMain.clearAllConnections)
}

const websocketDisconnectByNode = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocket.rendererToMain.disconnectByNode, nodeId)
}

// Mock相关方法
const mockGetByNodeId = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.mock.rendererToMain.getByNodeId, nodeId)
}

const mockStartServer = (httpMock: any) => {
  return ipcRenderer.invoke(IPC_EVENTS.mock.rendererToMain.startServer, httpMock)
}

const mockStopServer = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.mock.rendererToMain.stopServer, nodeId)
}

const mockGetLogsByNodeId = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.mock.rendererToMain.getLogsByNodeId, nodeId)
}

const mockReplaceById = (nodeId: string, httpMock: any) => {
  return ipcRenderer.invoke(IPC_EVENTS.mock.rendererToMain.replaceById, nodeId, httpMock)
}

const mockSyncProjectVariables = (projectId: string, variables: any[]) => {
  return ipcRenderer.invoke(IPC_EVENTS.mock.rendererToMain.syncProjectVariables, projectId, variables)
}
const mockGetAllStates = (projectId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.mock.rendererToMain.getAllStates, projectId)
}

// WebSocket Mock 相关方法
const websocketMockGetByNodeId = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocketMock.rendererToMain.getByNodeId, nodeId)
}
const websocketMockStartServer = (wsMock: any) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocketMock.rendererToMain.startServer, wsMock)
}
const websocketMockStopServer = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocketMock.rendererToMain.stopServer, nodeId)
}
const websocketMockReplaceById = (nodeId: string, wsMock: any) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocketMock.rendererToMain.replaceById, nodeId, wsMock)
}
const websocketMockGetAllStates = (projectId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.websocketMock.rendererToMain.getAllStates, projectId)
}

// AI 相关方法
const aiUpdateConfig = (config: LLMProviderSetting): void => {
  globalLLMClient.updateConfig(config);
}
const aiChat = async (body: ChatRequestBody): Promise<OpenAiResponseBody> => {
 return globalLLMClient.chat(body);
}
const aiChatStream = (body: ChatRequestBody, callbacks: ChatStreamCallbacks) => {
  return globalLLMClient.chatStream(body, callbacks);
}

// 临时文件管理方法
const tempFileCreate = async (content: string): Promise<{ success: true; path: string; size: number } | { success: false; error: string }> => {
  return ipcRenderer.invoke(IPC_EVENTS.tempFile.rendererToMain.create, content);
}
const tempFileDelete = async (filePath: string): Promise<{ success: boolean; error?: string }> => {
  return ipcRenderer.invoke(IPC_EVENTS.tempFile.rendererToMain.delete, filePath);
}
const tempFileRead = async (filePath: string): Promise<{ success: true; content: string } | { success: false; error: string }> => {
  return ipcRenderer.invoke(IPC_EVENTS.tempFile.rendererToMain.read, filePath);
}

// 更新管理相关方法
const checkForUpdates = async () => {
  return ipcRenderer.invoke(IPC_EVENTS.updater.rendererToMain.checkUpdate);     
}
const downloadUpdate = async () => {
  return ipcRenderer.invoke(IPC_EVENTS.updater.rendererToMain.downloadUpdate);
}
const cancelDownload = async () => {
  return ipcRenderer.invoke(IPC_EVENTS.updater.rendererToMain.cancelDownload);
}
const quitAndInstall = () => {
  ipcRenderer.send(IPC_EVENTS.updater.rendererToMain.quitAndInstall);
}
const getUpdateStatus = async () => {
  return ipcRenderer.invoke(IPC_EVENTS.updater.rendererToMain.getUpdateStatus);
}
const toggleAutoCheck = async (enabled: boolean) => {
  return ipcRenderer.invoke(IPC_EVENTS.updater.rendererToMain.toggleAutoCheck, { enabled });
}
const onUpdateChecking = (callback: () => void) => {
  ipcRenderer.on(IPC_EVENTS.updater.mainToRenderer.checking, () => callback());
}
const onUpdateAvailable = (callback: (info: unknown) => void) => {
  ipcRenderer.on(IPC_EVENTS.updater.mainToRenderer.updateAvailable, (_event, info) => callback(info));
}
const onUpdateNotAvailable = (callback: () => void) => {
  ipcRenderer.on(IPC_EVENTS.updater.mainToRenderer.updateNotAvailable, () => callback());
}
const onDownloadProgress = (callback: (progress: unknown) => void) => {
  ipcRenderer.on(IPC_EVENTS.updater.mainToRenderer.downloadProgress, (_event, progress) => callback(progress));
}
const onDownloadCompleted = (callback: (info: unknown) => void) => {
  ipcRenderer.on(IPC_EVENTS.updater.mainToRenderer.downloadCompleted, (_event, info) => callback(info));
}
const onUpdateError = (callback: (error: unknown) => void) => {
  ipcRenderer.on(IPC_EVENTS.updater.mainToRenderer.error, (_event, error) => callback(error));
}
const getUpdateSource = async () => {
  return ipcRenderer.invoke(IPC_EVENTS.updater.rendererToMain.getUpdateSource);
}
const setUpdateSource = async (params: { sourceType: 'github' | 'custom'; customUrl?: string }) => {
  return ipcRenderer.invoke(IPC_EVENTS.updater.rendererToMain.setUpdateSource, params);
}

contextBridge.exposeInMainWorld('electronAPI', {
  ip: ip.address(),
  sendRequest: gotRequest,
  afHttpRequest,
  openDevTools,
  exportHtml,
  exportWord,
  execCode: async (code: string, variables: Record<string, any>) => {
    const result = await ipcRenderer.invoke(IPC_EVENTS.util.rendererToMain.execCode, { code, variables });
    return result;
  },
  windowManager: {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    unMaximizeWindow,
    getWindowState,
    onWindowResize,
  },
  fileManager: {
    readFileAsUint8Array,
    getFilePath,
  },
  ipcManager: {
    sendToMain,
    onMain,
    removeListener,
  },
  websocket: {
    connect: websocketConnect,
    disconnect: websocketDisconnect,
    send: websocketSend,
    getState: websocketGetState,
    getAllConnections: websocketGetAllConnections,
    getConnectionIds: websocketGetConnectionIds,
    checkNodeConnection: websocketCheckNodeConnection,
    clearAllConnections: websocketClearAllConnections,
    disconnectByNode: websocketDisconnectByNode,
  },
  mock: {
    getMockByNodeId: mockGetByNodeId,
    startServer: mockStartServer,
    stopServer: mockStopServer,
    getLogsByNodeId: mockGetLogsByNodeId,
    replaceById: mockReplaceById,
    syncProjectVariables: mockSyncProjectVariables,
    getAllStates: mockGetAllStates,
  },
  websocketMock: {
    getMockByNodeId: websocketMockGetByNodeId,
    startServer: websocketMockStartServer,
    stopServer: websocketMockStopServer,
    replaceById: websocketMockReplaceById,
    getAllStates: websocketMockGetAllStates,
  },
  aiManager: {
    updateConfig: aiUpdateConfig,
    chat: aiChat,
    chatStream: aiChatStream,
  },
  tempFileManager: {
    create: tempFileCreate,
    delete: tempFileDelete,
    read: tempFileRead,
  },
  projectScan: {
    selectFolder: () => ipcRenderer.invoke(IPC_EVENTS.projectScan.rendererToMain.selectFolder),
    readFiles: (folderPath: string) => ipcRenderer.invoke(IPC_EVENTS.projectScan.rendererToMain.readFiles, folderPath),
  },
  updater: {
    checkForUpdates,
    downloadUpdate,
    cancelDownload,
    quitAndInstall,
    getUpdateStatus,
    toggleAutoCheck,
    onUpdateChecking,
    onUpdateAvailable,
    onUpdateNotAvailable,
    onDownloadProgress,
    onDownloadCompleted,
    onUpdateError,
    getUpdateSource,
    setUpdateSource,
  }
})
