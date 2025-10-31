/**
 * IPC 事件的 Payload 类型定义
 *
 * 每个事件定义包含:
 * - request: 发送方传递的参数
 * - response: 接收方返回的数据 (invoke/handle 模式)
 */

import type { IPC_EVENTS } from './events';

/**
 * IPC 事件映射接口
 * 定义每个事件名对应的请求和响应类型
 */
export interface IPCEventMap {
  // ==================== APIFLOW ====================

  // 顶栏 -> 内容窗口
  [IPC_EVENTS.apiflow.topBarToContent.topBarReady]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.initTabsData]: {
    request: { tabs: any[] };
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.projectCreated]: {
    request: { projectId: string; projectName: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.projectChanged]: {
    request: { projectId: string; projectName: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.projectDeleted]: {
    request: string;
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.projectRenamed]: {
    request: { projectId: string; projectName: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.navigate]: {
    request: string;
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.languageChanged]: {
    request: string;
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.networkModeChanged]: {
    request: string;
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.syncAiConfig]: {
    request: { apiKey: string; apiUrl: string; timeout?: number };
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.showLanguageMenu]: {
    request: { position: any; currentLanguage: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.hideLanguageMenu]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.tabsUpdated]: {
    request: any[];
    response: void;
  };

  [IPC_EVENTS.apiflow.topBarToContent.activeTabUpdated]: {
    request: string;
    response: void;
  };

  // 内容窗口 -> 顶栏
  [IPC_EVENTS.apiflow.contentToTopBar.contentReady]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.initTabs]: {
    request: { tabs: any[]; activeTabId: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.createProject]: {
    request: { name: string; path?: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.projectCreated]: {
    request: { projectId: string; projectName: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.switchProject]: {
    request: { projectId: string; projectName: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.projectChanged]: {
    request: { projectId: string; projectName: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.projectDeleted]: {
    request: string;
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.projectRenamed]: {
    request: { projectId: string; projectName: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.languageChanged]: {
    request: string;
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.syncAiConfig]: {
    request: { apiKey: string; apiUrl: string; timeout?: number };
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.showLanguageMenu]: {
    request: { position: any; currentLanguage: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.hideLanguageMenu]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.apiflow.contentToTopBar.navigateToHome]: {
    request: void;
    response: void;
  };

  // 渲染进程 -> 主进程 (请求-响应)
  [IPC_EVENTS.apiflow.rendererToMain.topBarIsReady]: {
    request: void;
    response: boolean;
  };

  [IPC_EVENTS.apiflow.rendererToMain.contentIsReady]: {
    request: void;
    response: boolean;
  };

  [IPC_EVENTS.apiflow.rendererToMain.createProject]: {
    request: { name: string; path?: string };
    response: { success: boolean; projectId?: string; error?: string };
  };

  [IPC_EVENTS.apiflow.rendererToMain.changeProject]: {
    request: { projectId: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.rendererToMain.deleteProject]: {
    request: { projectId: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.rendererToMain.changeProjectName]: {
    request: { projectId: string; newName: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.rendererToMain.changeRoute]: {
    request: { route: string };
    response: void;
  };

  [IPC_EVENTS.apiflow.rendererToMain.goBack]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.apiflow.rendererToMain.goForward]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.apiflow.rendererToMain.refreshApp]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.apiflow.rendererToMain.refreshContentView]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.apiflow.rendererToMain.readFileAsBlob]: {
    request: { filePath: string };
    response: Blob | null;
  };

  // ==================== WINDOW ====================

  [IPC_EVENTS.window.rendererToMain.minimize]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.window.rendererToMain.maximize]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.window.rendererToMain.unmaximize]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.window.rendererToMain.close]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.window.rendererToMain.getState]: {
    request: void;
    response: { isMaximized: boolean };
  };

  [IPC_EVENTS.window.rendererToMain.resize]: {
    request: { width: number; height: number };
    response: void;
  };

  [IPC_EVENTS.window.rendererToMain.openDevTools]: {
    request: void;
    response: void;
  };

  // ==================== WEBSOCKET ====================

  [IPC_EVENTS.websocket.rendererToMain.connect]: {
    request: {
      url: string;
      nodeId: string;
      protocols?: string | string[];
      headers?: Record<string, string>;
    };
    response: { success: boolean; connectionId?: string; error?: string };
  };

  [IPC_EVENTS.websocket.rendererToMain.disconnect]: {
    request: { connectionId: string };
    response: { success: boolean };
  };

  [IPC_EVENTS.websocket.rendererToMain.disconnectByNode]: {
    request: { nodeId: string };
    response: { success: boolean };
  };

  [IPC_EVENTS.websocket.rendererToMain.send]: {
    request: { connectionId: string; data: any };
    response: { success: boolean; error?: string };
  };

  [IPC_EVENTS.websocket.rendererToMain.getState]: {
    request: { connectionId: string };
    response: {
      state: 'connecting' | 'open' | 'closing' | 'closed';
      url?: string;
      nodeId?: string;
    } | null;
  };

  [IPC_EVENTS.websocket.rendererToMain.getAllConnections]: {
    request: void;
    response: Array<{
      connectionId: string;
      url: string;
      nodeId: string;
      state: string;
    }>;
  };

  [IPC_EVENTS.websocket.rendererToMain.getConnectionIds]: {
    request: { nodeId: string };
    response: string[];
  };

  [IPC_EVENTS.websocket.rendererToMain.checkNodeConnection]: {
    request: { nodeId: string };
    response: { connected: boolean; connectionIds: string[] };
  };

  [IPC_EVENTS.websocket.rendererToMain.clearAllConnections]: {
    request: void;
    response: { success: boolean };
  };

  // WebSocket 事件通知
  [IPC_EVENTS.websocket.mainToRenderer.opened]: {
    request: { connectionId: string; nodeId: string; url: string };
    response: void;
  };

  [IPC_EVENTS.websocket.mainToRenderer.message]: {
    request: { connectionId: string; nodeId: string; data: any };
    response: void;
  };

  [IPC_EVENTS.websocket.mainToRenderer.closed]: {
    request: {
      connectionId: string;
      nodeId: string;
      code: number;
      reason: string;
    };
    response: void;
  };

  [IPC_EVENTS.websocket.mainToRenderer.error]: {
    request: { connectionId: string; nodeId: string; error: string };
    response: void;
  };

  // ==================== MOCK ====================

  [IPC_EVENTS.mock.rendererToMain.getByNodeId]: {
    request: { nodeId: string };
    response: any;
  };

  [IPC_EVENTS.mock.rendererToMain.startServer]: {
    request: {
      nodeId: string;
      port: number;
      config: any;
    };
    response: { success: boolean; error?: string };
  };

  [IPC_EVENTS.mock.rendererToMain.stopServer]: {
    request: { nodeId: string };
    response: { success: boolean };
  };

  [IPC_EVENTS.mock.rendererToMain.replaceById]: {
    request: { nodeId: string; config: any };
    response: { success: boolean };
  };

  [IPC_EVENTS.mock.rendererToMain.getAllStates]: {
    request: void;
    response: Record<string, any>;
  };

  [IPC_EVENTS.mock.rendererToMain.syncProjectVariables]: {
    request: { variables: any };
    response: void;
  };

  [IPC_EVENTS.mock.rendererToMain.getLogsByNodeId]: {
    request: { nodeId: string };
    response: any[];
  };

  [IPC_EVENTS.mock.mainToRenderer.logsBatch]: {
    request: any[];
    response: void;
  };

  [IPC_EVENTS.mock.mainToRenderer.statusChanged]: {
    request: any;
    response: void;
  };

  // ==================== EXPORT ====================

  [IPC_EVENTS.export.rendererToMain.selectPath]: {
    request: void;
    response: { success: boolean; filePath?: string };
  };

  [IPC_EVENTS.export.rendererToMain.getStatus]: {
    request: void;
    response: { status: 'idle' | 'exporting' | 'completed' | 'error' };
  };

  [IPC_EVENTS.export.mainToRenderer.readyToReceive]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.export.mainToRenderer.finish]: {
    request: { success: boolean };
    response: void;
  };

  [IPC_EVENTS.export.mainToRenderer.error]: {
    request: { error: string };
    response: void;
  };

  [IPC_EVENTS.export.mainToRenderer.resetComplete]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.export.rendererNotifyMain.start]: {
    request: { totalItems: number };
    response: void;
  };

  [IPC_EVENTS.export.rendererNotifyMain.rendererData]: {
    request: { data: any };
    response: void;
  };

  [IPC_EVENTS.export.rendererNotifyMain.rendererDataFinish]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.export.rendererNotifyMain.reset]: {
    request: void;
    response: void;
  };

  // ==================== IMPORT ====================

  [IPC_EVENTS.import.rendererToMain.selectFile]: {
    request: void;
    response: { success: boolean; filePath?: string };
  };

  [IPC_EVENTS.import.mainToRenderer.fileAnalyzed]: {
    request: { totalItems: number; metadata: any };
    response: void;
  };

  [IPC_EVENTS.import.mainToRenderer.progress]: {
    request: { current: number; total: number; percentage: number };
    response: void;
  };

  [IPC_EVENTS.import.mainToRenderer.dataItem]: {
    request: { item: any };
    response: void;
  };

  [IPC_EVENTS.import.mainToRenderer.zipReadComplete]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.import.mainToRenderer.error]: {
    request: { error: string };
    response: void;
  };

  [IPC_EVENTS.import.rendererNotifyMain.analyzeFile]: {
    request: { filePath: string };
    response: void;
  };

  [IPC_EVENTS.import.rendererNotifyMain.start]: {
    request: void;
    response: void;
  };

  [IPC_EVENTS.import.rendererNotifyMain.reset]: {
    request: void;
    response: void;
  };

  // ==================== AI ====================

  [IPC_EVENTS.ai.rendererToMain.textChat]: {
    request: {
      messages: Array<{ role: string; content: string }>;
      config: any;
    };
    response: { content: string; error?: string };
  };

  [IPC_EVENTS.ai.rendererToMain.jsonChat]: {
    request: {
      messages: Array<{ role: string; content: string }>;
      config: any;
    };
    response: { data: any; error?: string };
  };

  [IPC_EVENTS.ai.rendererToMain.textChatStream]: {
    request: {
      correlationId: string;
      messages: Array<{ role: string; content: string }>;
      config: any;
    };
    response: { success: boolean; correlationId: string };
  };

  [IPC_EVENTS.ai.rendererToMain.cancelStream]: {
    request: { correlationId: string };
    response: { success: boolean };
  };

  [IPC_EVENTS.ai.mainToRenderer.streamData]: {
    request: { correlationId: string; chunk: string };
    response: void;
  };

  [IPC_EVENTS.ai.mainToRenderer.streamEnd]: {
    request: { correlationId: string };
    response: void;
  };

  [IPC_EVENTS.ai.mainToRenderer.streamError]: {
    request: { correlationId: string; error: string };
    response: void;
  };

  // ==================== UTIL ====================

  [IPC_EVENTS.util.rendererToMain.execCode]: {
    request: { code: string; context?: Record<string, any> };
    response: { result: any; error?: string };
  };
}

/**
 * 获取指定事件的请求类型
 */
export type IPCRequest<T extends keyof IPCEventMap> = IPCEventMap[T]['request'];

/**
 * 获取指定事件的响应类型
 */
export type IPCResponse<T extends keyof IPCEventMap> = IPCEventMap[T]['response'];
