
import {contextBridge, ipcRenderer, webUtils } from 'electron'
import ip from 'ip'
import { gotRequest } from './sendRequest'
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts'
import { WindowState } from '@src/types/index.ts'
import type { CommonResponse } from '@src/types/project'
import { IPC_EVENTS } from '@src/types/ipc'

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

// 导出相关方法
const exportSelectPath = () => {
  return ipcRenderer.invoke(IPC_EVENTS.export.rendererToMain.selectPath)
}

const exportGetStatus = () => {
  return ipcRenderer.invoke(IPC_EVENTS.export.rendererToMain.getStatus)
}

// 导入相关方法
const importSelectFile = () => {
  return ipcRenderer.invoke(IPC_EVENTS.import.rendererToMain.selectFile)
}

// AI 相关方法
const textChat = (params?: { prompt: string }) => {
  return ipcRenderer.invoke(IPC_EVENTS.ai.rendererToMain.textChat, params)
}

const jsonChat = (params?: { prompt: string }) => {
  return ipcRenderer.invoke(IPC_EVENTS.ai.rendererToMain.jsonChat, params)
}

const textChatWithStream = (
  params: { requestId: string },
  onData: (chunk: string) => void,
  onEnd: () => void,
  onError: (response: CommonResponse<string>) => void
) => {
  // 设置事件监听器 - 直接转发原始数据块
  const dataHandler = (_event: any, data: { requestId: string; chunk: string }) => {
    if (data.requestId === params.requestId) {
      // 直接传递原始数据块给回调，由渲染进程自行处理
      onData(data.chunk)
    }
  }

  const endHandler = (_event: any, data: { requestId: string }) => {
    if (data.requestId === params.requestId) {
      ipcRenderer.removeListener(IPC_EVENTS.ai.mainToRenderer.streamData, dataHandler)
      ipcRenderer.removeListener(IPC_EVENTS.ai.mainToRenderer.streamEnd, endHandler)
      ipcRenderer.removeListener(IPC_EVENTS.ai.mainToRenderer.streamError, errorHandler)
      onEnd()
    }
  }

  const errorHandler = (_event: any, data: { requestId: string; code: number; msg: string; data: string }) => {
    if (data.requestId === params.requestId) {
      ipcRenderer.removeListener(IPC_EVENTS.ai.mainToRenderer.streamData, dataHandler)
      ipcRenderer.removeListener(IPC_EVENTS.ai.mainToRenderer.streamEnd, endHandler)
      ipcRenderer.removeListener(IPC_EVENTS.ai.mainToRenderer.streamError, errorHandler)
      onError({ code: data.code, msg: data.msg, data: data.data })
    }
  }

  ipcRenderer.on(IPC_EVENTS.ai.mainToRenderer.streamData, dataHandler)
  ipcRenderer.on(IPC_EVENTS.ai.mainToRenderer.streamEnd, endHandler)
  ipcRenderer.on(IPC_EVENTS.ai.mainToRenderer.streamError, errorHandler)

  // 启动流式请求
  const startPromise = ipcRenderer.invoke(IPC_EVENTS.ai.rendererToMain.textChatStream, params)

  // 返回取消函数
  return {
    cancel: async () => {
      ipcRenderer.removeListener(IPC_EVENTS.ai.mainToRenderer.streamData, dataHandler)
      ipcRenderer.removeListener(IPC_EVENTS.ai.mainToRenderer.streamEnd, endHandler)
      ipcRenderer.removeListener(IPC_EVENTS.ai.mainToRenderer.streamError, errorHandler)
      await ipcRenderer.invoke(IPC_EVENTS.ai.rendererToMain.cancelStream, params.requestId)
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
