
import {contextBridge, ipcRenderer, webUtils } from 'electron'
import ip from 'ip'
import { gotRequest } from './sendRequest'
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts'
import { WindowState } from '@src/types/index.ts'

const openDevTools = () => {
  ipcRenderer.send('apiflow-open-dev-tools')
}

const minimizeWindow = () => {
  ipcRenderer.send('apiflow-minimize-window')
}

const maximizeWindow = () => {
  ipcRenderer.send('apiflow-maximize-window')
}

const unMaximizeWindow = () => {
  ipcRenderer.send('apiflow-unmaximize-window')
}

const closeWindow = () => {
  ipcRenderer.send('apiflow-close-window')
}

const getWindowState = () => {
  return ipcRenderer.invoke('apiflow-get-window-state')
}

const onWindowResize = (callback: (state: WindowState) => void) => {
  ipcRenderer.on('apiflow-resize-window', (_event, state) => callback(state))
}

const readFileAsUint8Array = async (path: string): Promise<Uint8Array | string> => {
  const result = await ipcRenderer.invoke('apiflow-read-file-as-blob', path);
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
  return ipcRenderer.invoke('websocket-connect', params)
}

const websocketDisconnect = (connectionId: string) => {
  return ipcRenderer.invoke('websocket-disconnect', connectionId)
}

const websocketSend = (connectionId: string, message: string) => {
  return ipcRenderer.invoke('websocket-send', connectionId, message)
}

const websocketGetState = (connectionId: string) => {
  return ipcRenderer.invoke('websocket-get-state', connectionId)
}

const websocketGetAllConnections = () => {
  return ipcRenderer.invoke('websocket-get-all-connections')
}

const websocketGetConnectionIds = () => {
  return ipcRenderer.invoke('websocket-get-connection-ids')
}

const websocketCheckNodeConnection = (nodeId: string) => {
  return ipcRenderer.invoke('websocket-check-node-connection', nodeId)
}

const websocketClearAllConnections = () => {
  return ipcRenderer.invoke('websocket-clear-all-connections')
}

const websocketDisconnectByNode = (nodeId: string) => {
  return ipcRenderer.invoke('websocket-disconnect-by-node', nodeId)
}

// Mock相关方法
const mockGetByNodeId = (nodeId: string) => {
  return ipcRenderer.invoke('mock-get-by-node-id', nodeId)
}

const mockStartServer = (httpMock: any) => {
  return ipcRenderer.invoke('mock-start-server', httpMock)
}

const mockStopServer = (nodeId: string) => {
  return ipcRenderer.invoke('mock-stop-server', nodeId)
}

const mockGetLogsByNodeId = (nodeId: string) => {
  return ipcRenderer.invoke('mock-get-logs-by-node-id', nodeId)
}

const mockReplaceById = (nodeId: string, httpMock: any) => {
  return ipcRenderer.invoke('mock-replace-by-id', nodeId, httpMock)
}

const mockSyncProjectVariables = (projectId: string, variables: any[]) => {
  console.log(1, projectId, variables)
  return ipcRenderer.invoke('mock-sync-project-variables', projectId, variables)
}

// 导出相关方法
const exportSelectPath = () => {
  return ipcRenderer.invoke('export-select-path')
}

const exportGetStatus = () => {
  return ipcRenderer.invoke('export-get-status')
}

// 导入相关方法
const importSelectFile = () => {
  return ipcRenderer.invoke('import-select-file')
}

// AI 相关方法
const textChat = () => {
  return ipcRenderer.invoke('ai-text-chat')
}

const textChatWithStream = (
  params: { requestId: string },
  onData: (chunk: string) => void,
  onEnd: () => void,
  onError: (error: string) => void
) => {
  // 设置事件监听器
  const dataHandler = (_event: any, data: { requestId: string; chunk: string }) => {
    if (data.requestId === params.requestId) {
      onData(data.chunk)
    }
  }
  
  const endHandler = (_event: any, data: { requestId: string }) => {
    if (data.requestId === params.requestId) {
      ipcRenderer.removeListener('ai-stream-data', dataHandler)
      ipcRenderer.removeListener('ai-stream-end', endHandler)
      ipcRenderer.removeListener('ai-stream-error', errorHandler)
      onEnd()
    }
  }
  
  const errorHandler = (_event: any, data: { requestId: string; error: string }) => {
    if (data.requestId === params.requestId) {
      ipcRenderer.removeListener('ai-stream-data', dataHandler)
      ipcRenderer.removeListener('ai-stream-end', endHandler)
      ipcRenderer.removeListener('ai-stream-error', errorHandler)
      onError(data.error)
    }
  }
  
  ipcRenderer.on('ai-stream-data', dataHandler)
  ipcRenderer.on('ai-stream-end', endHandler)
  ipcRenderer.on('ai-stream-error', errorHandler)
  
  // 启动流式请求
  const startPromise = ipcRenderer.invoke('ai-text-chat-stream', params)
  
  // 返回取消函数
  return {
    cancel: async () => {
      ipcRenderer.removeListener('ai-stream-data', dataHandler)
      ipcRenderer.removeListener('ai-stream-end', endHandler)
      ipcRenderer.removeListener('ai-stream-error', errorHandler)
      await ipcRenderer.invoke('ai-cancel-stream', params.requestId)
    },
    startPromise
  }
}

// AI 生成JSON数据
const generateJson = (params: { prompt: string }) => {
  return ipcRenderer.invoke('ai-generate-json', params)
}

// AI 生成文本数据
const generateText = (params: { prompt: string; maxLength: number }) => {
  return ipcRenderer.invoke('ai-generate-text', params)
}

contextBridge.exposeInMainWorld('electronAPI', {
  ip: ip.address(),
  sendRequest: gotRequest,
  openDevTools,
  exportHtml,
  exportWord,
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
    textChatWithStream: textChatWithStream,
    generateJson: generateJson,
    generateText: generateText,
  }
})
