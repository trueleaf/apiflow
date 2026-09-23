import { Channel, invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { DesktopAPI } from '@src/types/main';
import type { CommonResponse } from '@src/types/project';
import type { DesktopHttpEvent, DesktopHttpRequest } from '@src/types/desktop';
import { IPC_EVENTS } from '@src/types/ipc';
import { sendDesktopRequest } from './http';
import { connectDesktopEvents, offDesktopEvent, onDesktopEvent } from './events';
import { globalLLMClient } from './ai/client';
import { agentRuntime } from './ai/runtime';
import { buildStandaloneShareHtml, buildStandaloneWordBlob } from '@/pages/projectWorkbench/export/standalone-export';
import { runtimeCache } from '@/cache/runtime/runtimeCache';

// 将原生结果转换为业务响应
const result = async <T>(operation: Promise<T>, fallback: T): Promise<CommonResponse<T>> => {
  try { return { code: 0, msg: '', data: await operation }; }
  catch (error) { return { code: 1, msg: String(error), data: fallback }; }
};
// 执行脚本专用的原生 HTTP 请求
const afHttpRequest: DesktopAPI['afHttpRequest'] = async options => {
  const url = new URL(options.url);
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value !== null && value !== undefined) url.searchParams.set(key, String(value));
  }
  const headers = { ...options.headers };
  let text: string | undefined;
  if (options.body !== undefined) {
    text = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    if (typeof options.body !== 'string' && !Object.keys(headers).some(key => key.toLowerCase() === 'content-type')) headers['content-type'] = 'application/json';
  }
  const request: DesktopHttpRequest = { requestId: crypto.randomUUID(), url: url.toString(), method: options.method, headers, timeout: options.timeout ?? 60_000, followRedirect: true, maxRedirects: 10, maxSendFileSize: 0, body: text === undefined ? null : { kind: 'raw', text } };
  let response: Awaited<ReturnType<DesktopAPI['afHttpRequest']>> | undefined;
  let failure: Error | undefined;
  const chunks: Uint8Array[] = [];
  const output = new Channel<DesktopHttpEvent>(event => {
    if (event.kind === 'response' && event.response) {
      response = { statusCode: event.response.status, statusMessage: event.response.statusText, headers: Object.fromEntries(Object.entries(event.response.headers).map(([key, values]) => [key, key === 'set-cookie' ? values : values.join(', ')])), body: '', json: null };
    }
    if (event.kind === 'data' && event.data) chunks.push(Uint8Array.from(event.data));
    if (event.kind === 'error' || event.kind === 'abort') failure = new Error(event.message || 'REQUEST_CANCELLED');
  });
  await invoke('http_request', { options: request, output });
  if (failure) throw failure;
  if (!response) throw new Error('HTTP_RESPONSE_MISSING');
  const decoder = new TextDecoder();
  response.body = chunks.map(chunk => decoder.decode(chunk, { stream: true })).join('') + decoder.decode();
  try { response.json = JSON.parse(response.body) as unknown; } catch { response.json = null; }
  return response;
};
// 初始化桌面服务并等待原生消息订阅完成
export const createTauriApi = async (): Promise<DesktopAPI> => {
  await connectDesktopEvents();
  const info = await invoke<{ ip: string; networkMode: 'offline' | 'online' | null }>('desktop_info');
  if (info.networkMode) runtimeCache.setNetworkMode(info.networkMode);
  const setMode = (mode: 'offline' | 'online') => { globalLLMClient.setNetworkMode(mode); agentRuntime.setNetworkMode(mode); };
  setMode(runtimeCache.getNetworkMode());
  onDesktopEvent(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, setMode);
  window.addEventListener('storage', event => { if (event.key === 'runtime/networkMode') setMode(runtimeCache.getNetworkMode()); });
  window.addEventListener('beforeunload', () => { agentRuntime.abortAll('window-unloaded'); globalLLMClient.setNetworkMode('online'); });
  onDesktopEvent('desktop:window-hidden', () => agentRuntime.abortAll('window-hidden'));
  const windowAction = (action: string) => { void invoke('window_action', { action }).catch(error => window.reportError(error)); };
  const wsAction = <T>(action: string, params: Record<string, unknown> = {}) => invoke<T>('websocket_action', { action, ...params });
  const mockAction = <T>(kind: 'http' | 'websocket', action: string, params: Record<string, unknown> = {}) => invoke<T>('mock_action', { kind, action, ...params });
  const updateAction = (action: string, params: Record<string, unknown> = {}) => result(invoke<null>('update_action', { action, ...params }), null);
  const api: DesktopAPI = {
    ip: info.ip,
    sendRequest: sendDesktopRequest,
    afHttpRequest,
    openDevTools: () => windowAction('devtools'),
    exportHtml: buildStandaloneShareHtml,
    exportWord: async params => new Uint8Array(await (await buildStandaloneWordBlob(params)).arrayBuffer()),
    windowManager: {
      closeWindow: () => windowAction('close'), minimizeWindow: () => windowAction('minimize'),
      maximizeWindow: () => windowAction('maximize'), unMaximizeWindow: () => windowAction('unmaximize'),
      getWindowState: () => invoke('window_state'),
      onWindowResize: callback => { void listen<Awaited<ReturnType<DesktopAPI['windowManager']['getWindowState']>>>('desktop-window-state', event => callback(event.payload)); },
    },
    fileManager: {
      readFileAsUint8Array: async path => Uint8Array.from(await invoke<number[]>('read_file', { path })),
      selectFile: async (extensions = []) => { const paths = await invoke<string[]>('select_files', { multiple: false, extensions }); return paths[0] ? invoke('file_info', { path: paths[0] }) : null; },
    },
    ipcManager: {
      sendToMain: (channel, ...args) => { void invoke('route_message', { channel, payload: args[0] ?? null }).catch(error => window.reportError(error)); },
      onMain: onDesktopEvent,
      removeListener: offDesktopEvent,
      invoke: (channel, ...args) => invoke('shell_query', { channel, payload: args[0] ?? null }),
    },
    mcpManager: {
      getStatus: () => invoke('mcp_action', { action: 'status' }),
      updateSettings: settings => invoke('mcp_action', { action: 'settings', settings }),
      restart: () => invoke('mcp_action', { action: 'restart' }),
    },
    websocket: {
      connect: params => result(invoke<string>('websocket_connect', { ...params, headers: params.headers ?? {} }).then(connectionId => ({ connectionId })), {}),
      disconnect: connectionId => result(wsAction('disconnect', { connectionId }).then(() => null), null),
      send: (connectionId, message) => result(wsAction('send', { connectionId, message }).then(() => null), null),
      getState: connectionId => result(wsAction<{ state?: number }>('state', { connectionId }), {}),
      getAllConnections: () => wsAction('list'),
      getConnectionIds: async () => (await wsAction<{ connectionId: string }[]>('list')).map(connection => connection.connectionId),
      checkNodeConnection: nodeId => wsAction('node', { nodeId }),
      clearAllConnections: () => result(wsAction('clear'), { closedCount: 0 }),
      disconnectByNode: nodeId => result(wsAction('disconnect-node', { nodeId }).then(() => null), null),
    },
    mock: {
      getMockByNodeId: nodeId => mockAction('http', 'get', { nodeId }),
      startServer: node => result(mockAction('http', 'start', { node }), null),
      stopServer: nodeId => result(mockAction('http', 'stop', { nodeId }), null),
      getLogsByNodeId: nodeId => mockAction('http', 'logs', { nodeId }),
      replaceById: (nodeId, node) => result(mockAction('http', 'replace', { nodeId, node }), null),
      syncProjectVariables: (projectId, variables) => result(mockAction('http', 'variables', { projectId, variables }), null),
      getAllStates: projectId => mockAction('http', 'states', { projectId }),
    },
    websocketMock: {
      getMockByNodeId: nodeId => mockAction('websocket', 'get', { nodeId }),
      startServer: node => result(mockAction('websocket', 'start', { node }), null),
      stopServer: nodeId => result(mockAction('websocket', 'stop', { nodeId }), null),
      replaceById: (nodeId, node) => result(mockAction('websocket', 'replace', { nodeId, node }), null),
      getAllStates: projectId => mockAction('websocket', 'states', { projectId }),
    },
    aiManager: {
      updateConfig: config => globalLLMClient.updateConfig(config),
      chat: (body, config) => globalLLMClient.chat(body, config),
      chatStream: (body, callbacks, config) => globalLLMClient.chatStream(body, callbacks, config),
      run: async request => agentRuntime.start(request),
      abort: async request => agentRuntime.abort(request),
      respondApproval: request => agentRuntime.respondApproval(request),
      onEvent: callback => onDesktopEvent(IPC_EVENTS.ai.mainToRenderer.event, callback),
      onClientToolCommand: callback => onDesktopEvent(IPC_EVENTS.ai.mainToRenderer.clientToolCommand, callback),
      sendClientToolResult: response => agentRuntime.resolveClientTool(response),
      removeListeners: () => { offDesktopEvent(IPC_EVENTS.ai.mainToRenderer.event); offDesktopEvent(IPC_EVENTS.ai.mainToRenderer.clientToolCommand); },
    },
    tempFileManager: {
      create: content => result(invoke('temporary_file', { action: 'create', content }), { path: '', size: 0 }),
      delete: path => result(invoke('temporary_file', { action: 'delete', path }), null),
      read: path => result(invoke('temporary_file', { action: 'read', path }), { content: '' }),
    },
    updateManager: {
      checkForUpdates: () => result(invoke('update_action', { action: 'check' }), {}),
      downloadUpdate: () => updateAction('download'), quitAndInstall: () => updateAction('install'),
      cancelDownload: () => updateAction('cancel'), pauseDownload: () => updateAction('pause'), resumeDownload: () => updateAction('resume'),
      getDownloadState: () => updateAction('state'), syncSettings: settings => updateAction('settings', { settings }),
      setAutoCheck: autoCheck => updateAction('auto-check', { autoCheck }),
      setUpdateSource: (source, customUrl) => updateAction('source', { source, customUrl }),
      testConnection: url => updateAction('test', { url }),
      isAppStore: () => invoke('is_app_store'),
    },
    contentViewRetry: () => { void invoke('content_load', { action: 'retry' }).catch(error => window.reportError(error)); },
    contentViewFallback: () => { void invoke('content_load', { action: 'fallback' }).catch(error => window.reportError(error)); },
    contentViewGetLoadState: () => invoke('content_load', { action: 'state' }),
  };
  agentRuntime.setResourceCleaner(resource => resource.kind === 'websocket' ? api.websocket.disconnectByNode(resource.nodeId) : resource.kind === 'httpMock' ? api.mock.stopServer(resource.nodeId) : api.websocketMock.stopServer(resource.nodeId));
  return api;
};
