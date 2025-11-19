import type { CommonResponse } from '@src/types/project';

// OpenAI API 消息类型
export type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// OpenAI API 请求体类型
export type OpenAIRequestBody = {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  response_format?: {
    type: 'json_object';
  };
};

// OpenAI API 响应类型
export type OpenAIResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

// AI 聊天选项类型
export type OpenAIRequestMode = 'text' | 'json';

// 流式回调函数类型
export type StreamCallback = (chunk: string) => void;
export type StreamEndCallback = () => void;
export type StreamErrorCallback = (response: CommonResponse<string>) => void;

export type SendRequestParams = OpenAIRequestBody;

type StreamRequestCallbacks = {
  onData?: StreamCallback;
  onEnd?: StreamEndCallback;
  onError?: StreamErrorCallback;
};

export type SendStreamRequestStartParams = {
  action: 'start';
  requestId: string;
  requestBody: OpenAIRequestBody & { stream: true };
} & StreamRequestCallbacks;

export type SendStreamRequestCancelParams = {
  action: 'cancel';
  requestId: string;
};

export type SendStreamRequestParams = SendStreamRequestStartParams | SendStreamRequestCancelParams;


export type AskMessage = {
  id: string;
  type: "ask";
  content: string;
  timestamp: string;
  sessionId: string;
}
export type TextResponseMessage = {
  id: string;
  type: "textResponse";
  content: string;
  timestamp: string;
  sessionId: string;
}
export type LoadingMessage = {
  id: string;
  type: "loading";
  // status: "waitResponse" | "getFirstMessage" | "error";
  content: string;
  timestamp: string;
  sessionId: string;
}

export type ToolMessage = {
  id: string;
  type: "tool";
  content: string;
  timestamp: string;
  sessionId: string;
}
export type AgentMessage = AskMessage | LoadingMessage | ToolMessage | TextResponseMessage;

/*
|--------------------------------------------------------------------------
| AITool 类型系统 - 符合 OpenAI Function Calling 标准
|--------------------------------------------------------------------------
*/
export type AIToolParameterProperty = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  enum?: string[];
  items?: AIToolParameterProperty;
  properties?: Record<string, AIToolParameterProperty>;
  required?: string[];
};

export type AIToolCategory = 'http_request' | 'websocket' | 'mock_server' | 'project_management';
export type AITool = {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, AIToolParameterProperty>;
    required: string[];
  };
  category: AIToolCategory;
};

/*
|--------------------------------------------------------------------------
| HTTP 请求模块工具定义
|--------------------------------------------------------------------------
*/
export type HttpRequestTools = {
  sendHttpRequest: AITool;
  cancelHttpRequest: AITool;
  executePreRequestScript: AITool;
  getHttpHistoryList: AITool;
  getHttpHistoryById: AITool;
  addHttpHistory: AITool;
  deleteHttpHistory: AITool;
  clearAllHttpHistory: AITool;
  setHttpResponse: AITool;
  getHttpResponse: AITool;
  deleteHttpResponse: AITool;
  getHttpResponseCacheStats: AITool;
  clearAllHttpResponseCache: AITool;
  changeHttpMethod: AITool;
  changeHttpUrl: AITool;
  changeHttpHeaders: AITool;
  changeHttpBody: AITool;
  changeResponseInfo: AITool;
  changeRequestState: AITool;
};

/*
|--------------------------------------------------------------------------
| WebSocket 模块工具定义
|--------------------------------------------------------------------------
*/
export type WebSocketTools = {
  connectWebSocket: AITool;
  disconnectWebSocket: AITool;
  sendWebSocketMessage: AITool;
  getWebSocketConnectionState: AITool;
  getAllWebSocketConnections: AITool;
  getWebSocketConnectionIds: AITool;
  checkNodeConnection: AITool;
  clearAllWebSocketConnections: AITool;
  disconnectWebSocketByNode: AITool;
  changeWebSocketName: AITool;
  changeWebSocketProtocol: AITool;
  changeWebSocketPath: AITool;
  addWebSocketHeader: AITool;
  deleteWebSocketHeader: AITool;
  updateWebSocketHeader: AITool;
  addWebSocketQueryParam: AITool;
  deleteWebSocketQueryParam: AITool;
  updateWebSocketQueryParam: AITool;
  changeWebSocketMessage: AITool;
  changeWebSocketMessageType: AITool;
  addWebSocketMessage: AITool;
  replaceWebSocketMessages: AITool;
  clearWebSocketMessages: AITool;
  deleteWebSocketMessage: AITool;
  getWebSocketMessagesByType: AITool;
  getLatestWebSocketMessages: AITool;
  addWebSocketMessageTemplate: AITool;
  updateWebSocketMessageTemplate: AITool;
  deleteWebSocketMessageTemplate: AITool;
  getWebSocketMessageTemplate: AITool;
  getAllWebSocketMessageTemplates: AITool;
  clearAllWebSocketMessageTemplates: AITool;
  saveWebSocket: AITool;
  getWebSocketDetail: AITool;
};

/*
|--------------------------------------------------------------------------
| Mock 服务器模块工具定义
|--------------------------------------------------------------------------
*/
export type MockServerTools = {
  startHttpMockServer: AITool;
  stopHttpMockServer: AITool;
  getHttpMockByNodeId: AITool;
  replaceHttpMockById: AITool;
  removeHttpMockByNodeId: AITool;
  removeHttpMocksByProjectId: AITool;
  removeHttpMocksAndStopServersByProjectId: AITool;
  getAllHttpMockStates: AITool;
  changeHttpMockName: AITool;
  changeHttpMockMethod: AITool;
  changeHttpMockUrl: AITool;
  changeHttpMockPort: AITool;
  changeHttpMockDelay: AITool;
  saveHttpMock: AITool;
  getHttpMockDetail: AITool;
  checkMockNodeEnabledStatus: AITool;
};

/*
|--------------------------------------------------------------------------
| 项目管理模块工具定义
|--------------------------------------------------------------------------
*/
export type ProjectManagementTools = {
  getProjectList: AITool;
  getProjectInfo: AITool;
  addProject: AITool;
  updateProject: AITool;
  deleteProject: AITool;
  getDeletedProjectList: AITool;
  recoverProject: AITool;
  permanentlyDeleteProject: AITool;
  clearDeletedProjects: AITool;
  getAllNodes: AITool;
  getNodesByProjectId: AITool;
  getNodeById: AITool;
  addNode: AITool;
  replaceNode: AITool;
  updateNodeName: AITool;
  deleteNode: AITool;
  deleteNodes: AITool;
  deleteNodesByProjectId: AITool;
  getDeletedNodesList: AITool;
  restoreNode: AITool;
  exportProjectToHtml: AITool;
  exportProjectToWord: AITool;
  selectExportPath: AITool;
  startExport: AITool;
  receiveRendererData: AITool;
  finishRendererData: AITool;
  resetExport: AITool;
  getExportStatus: AITool;
  selectImportFile: AITool;
  analyzeImportFile: AITool;
  startImport: AITool;
  getImportStatus: AITool;
  resetImport: AITool;
  replaceAllNodes: AITool;
  appendNodes: AITool;
  setProjectSharePassword: AITool;
  getProjectSharePassword: AITool;
  clearProjectSharePassword: AITool;
};

export type AIToolRegistry = {
  httpRequest: HttpRequestTools;
  websocket: WebSocketTools;
  mockServer: MockServerTools;
  projectManagement: ProjectManagementTools;
};

export type AllAITools = AITool[];