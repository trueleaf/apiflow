
import {contextBridge, ipcRenderer, webUtils } from 'electron'
import ip from 'ip'
import { gotRequest } from './sendRequest'
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts'
import { WindowState } from '@src/types/index.ts'
import type { CommonResponse } from '@src/types/project'
import { IPC_EVENTS } from '@src/types/ipc'

const openDevTools = () => {
  ipcRenderer.send(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.OPEN_DEV_TOOLS)
}

const minimizeWindow = () => {
  ipcRenderer.send(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.MINIMIZE)
}

const maximizeWindow = () => {
  ipcRenderer.send(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.MAXIMIZE)
}

const unMaximizeWindow = () => {
  ipcRenderer.send(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.UNMAXIMIZE)
}

const closeWindow = () => {
  ipcRenderer.send(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.CLOSE)
}

const getWindowState = () => {
  return ipcRenderer.invoke(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.GET_STATE)
}

const onWindowResize = (callback: (state: WindowState) => void) => {
  ipcRenderer.on(IPC_EVENTS.WINDOW.RENDERER_TO_MAIN.RESIZE, (_event, state) => callback(state))
}

const readFileAsUint8Array = async (path: string): Promise<Uint8Array | string> => {
  const result = await ipcRenderer.invoke(IPC_EVENTS.APIFLOW.RENDERER_TO_MAIN.READ_FILE_AS_BLOB, path);
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
  return ipcRenderer.invoke(IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.CONNECT, params)
}

const websocketDisconnect = (connectionId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.DISCONNECT, connectionId)
}

const websocketSend = (connectionId: string, message: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.SEND, connectionId, message)
}

const websocketGetState = (connectionId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.GET_STATE, connectionId)
}

const websocketGetAllConnections = () => {
  return ipcRenderer.invoke(IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.GET_ALL_CONNECTIONS)
}

const websocketGetConnectionIds = () => {
  return ipcRenderer.invoke(IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.GET_CONNECTION_IDS)
}

const websocketCheckNodeConnection = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.CHECK_NODE_CONNECTION, nodeId)
}

const websocketClearAllConnections = () => {
  return ipcRenderer.invoke(IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.CLEAR_ALL_CONNECTIONS)
}

const websocketDisconnectByNode = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.WEBSOCKET.RENDERER_TO_MAIN.DISCONNECT_BY_NODE, nodeId)
}

// Mock相关方法
const mockGetByNodeId = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.GET_BY_NODE_ID, nodeId)
}

const mockStartServer = (httpMock: any) => {
  return ipcRenderer.invoke(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.START_SERVER, httpMock)
}

const mockStopServer = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.STOP_SERVER, nodeId)
}

const mockGetLogsByNodeId = (nodeId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.GET_LOGS_BY_NODE_ID, nodeId)
}

const mockReplaceById = (nodeId: string, httpMock: any) => {
  return ipcRenderer.invoke(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.REPLACE_BY_ID, nodeId, httpMock)
}

const mockSyncProjectVariables = (projectId: string, variables: any[]) => {
  return ipcRenderer.invoke(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.SYNC_PROJECT_VARIABLES, projectId, variables)
}
const mockGetAllStates = (projectId: string) => {
  return ipcRenderer.invoke(IPC_EVENTS.MOCK.RENDERER_TO_MAIN.GET_ALL_STATES, projectId)
}

// 导出相关方法
const exportSelectPath = () => {
  return ipcRenderer.invoke(IPC_EVENTS.EXPORT.RENDERER_TO_MAIN.SELECT_PATH)
}

const exportGetStatus = () => {
  return ipcRenderer.invoke(IPC_EVENTS.EXPORT.RENDERER_TO_MAIN.GET_STATUS)
}

// 导入相关方法
const importSelectFile = () => {
  return ipcRenderer.invoke(IPC_EVENTS.IMPORT.RENDERER_TO_MAIN.SELECT_FILE)
}

// AI 相关方法
const textChat = (params?: { prompt: string }) => {
  return ipcRenderer.invoke(IPC_EVENTS.AI.RENDERER_TO_MAIN.TEXT_CHAT, params)
}

const jsonChat = (params?: { prompt: string }) => {
  return ipcRenderer.invoke(IPC_EVENTS.AI.RENDERER_TO_MAIN.JSON_CHAT, params)
}

const textChatWithStream = (
  params: { requestId: string },
  onData: (chunk: string) => void,
  onEnd: () => void,
  onError: (response: CommonResponse<string>) => void
) => {
  // 设置事件监听器
  const dataHandler = (_event: any, data: { requestId: string; chunk: string }) => {
    if (data.requestId === params.requestId) {
      onData(data.chunk)
    }
  }

  const endHandler = (_event: any, data: { requestId: string }) => {
    if (data.requestId === params.requestId) {
      ipcRenderer.removeListener(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_DATA, dataHandler)
      ipcRenderer.removeListener(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_END, endHandler)
      ipcRenderer.removeListener(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_ERROR, errorHandler)
      onEnd()
    }
  }

  const errorHandler = (_event: any, data: { requestId: string; code: number; msg: string; data: string }) => {
    if (data.requestId === params.requestId) {
      ipcRenderer.removeListener(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_DATA, dataHandler)
      ipcRenderer.removeListener(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_END, endHandler)
      ipcRenderer.removeListener(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_ERROR, errorHandler)
      onError({ code: data.code, msg: data.msg, data: data.data })
    }
  }

  ipcRenderer.on(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_DATA, dataHandler)
  ipcRenderer.on(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_END, endHandler)
  ipcRenderer.on(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_ERROR, errorHandler)

  // 启动流式请求
  const startPromise = ipcRenderer.invoke(IPC_EVENTS.AI.RENDERER_TO_MAIN.TEXT_CHAT_STREAM, params)

  // 返回取消函数
  return {
    cancel: async () => {
      ipcRenderer.removeListener(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_DATA, dataHandler)
      ipcRenderer.removeListener(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_END, endHandler)
      ipcRenderer.removeListener(IPC_EVENTS.AI.MAIN_TO_RENDERER.STREAM_ERROR, errorHandler)
      await ipcRenderer.invoke(IPC_EVENTS.AI.RENDERER_TO_MAIN.CANCEL_STREAM, params.requestId)
    },
    startPromise
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  ip: ip.address(),
  sendRequest: gotRequest,
  openDevTools,
  exportHtml,
  exportWord,
  execCode: async (code: string, variables: Record<string, any>) => {
    const result = await ipcRenderer.invoke(IPC_EVENTS.UTIL.RENDERER_TO_MAIN.EXEC_CODE, { code, variables });
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
  exportManager: {
    selectPath: exportSelectPath,
    getStatus: exportGetStatus,
  },
  importManager: {
    selectFile: importSelectFile,
  },
  aiManager: {
    textChat: textChat,
    jsonChat: jsonChat,
    textChatWithStream: textChatWithStream,
  }
})
