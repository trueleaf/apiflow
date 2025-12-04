import { defineStore } from 'pinia';
import { useHttpNode } from '../httpNode/httpNodeStore';
import { useHttpNodeRequest } from '../httpNode/httpNodeRequestStore';
import { useHttpNodeResponse } from '../httpNode/httpNodeResponseStore';
import { useHttpNodeConfig } from '../httpNode/httpNodeConfigStore';
import { useHttpMockNode } from '../httpMockNode/httpMockNodeStore';
import { useWebSocket } from '../websocketNode/websocketNodeStore';
import { useWebSocketMockNode } from '../websocketMockNode/websocketMockNodeStore';
import { useProjectManagerStore } from '../projectManager/projectManagerStore';
import { useProjectWorkbench } from '../projectWorkbench/projectWorkbenchStore';
import { useProjectNav } from '../projectWorkbench/projectNavStore';
import { useBanner } from '../projectWorkbench/bannerStore';
import { useVariable } from '../projectWorkbench/variablesStore';
import { useCookies } from '../projectWorkbench/cookiesStore';
import { useCommonHeader } from '../projectWorkbench/commonHeaderStore';
import { useRuntime } from '../runtime/runtimeStore';
import { useAppSettings } from '../appSettings/appSettingsStore';
import { usePermissionStore } from '../permission/permissionStore';
import { useHttpRedoUndo } from '../redoUndo/httpRedoUndoStore';
import { useWsRedoUndo } from '../redoUndo/wsRedoUndoStore';
import { useLLMProvider } from './llmProviderStore';
import { useAiChatStore } from './aiChatStore';
import { useCopilotStore } from './copilotStore';

// 聚合所有 store，提供统一的访问入口
export const useAgentStore = defineStore('agent', () => {
  // HTTP 节点相关
  const httpNode = useHttpNode();
  const httpNodeRequest = useHttpNodeRequest();
  const httpNodeResponse = useHttpNodeResponse();
  const httpNodeConfig = useHttpNodeConfig();
  // HTTP Mock 相关
  const httpMockNode = useHttpMockNode();
  // WebSocket 相关
  const websocket = useWebSocket();
  const websocketMockNode = useWebSocketMockNode();
  // 项目管理相关
  const projectManager = useProjectManagerStore();
  const projectWorkbench = useProjectWorkbench();
  const projectNav = useProjectNav();
  const banner = useBanner();
  // 变量、Cookie、公共头
  const variable = useVariable();
  const cookies = useCookies();
  const commonHeader = useCommonHeader();
  // 运行时与设置
  const runtime = useRuntime();
  const appSettings = useAppSettings();
  const permission = usePermissionStore();
  // 撤销重做
  const httpRedoUndo = useHttpRedoUndo();
  const wsRedoUndo = useWsRedoUndo();
  // AI 相关
  const llmProvider = useLLMProvider();
  const aiChat = useAiChatStore();
  const copilot = useCopilotStore();

  return {
    httpNode,
    httpNodeRequest,
    httpNodeResponse,
    httpNodeConfig,
    httpMockNode,
    websocket,
    websocketMockNode,
    projectManager,
    projectWorkbench,
    projectNav,
    banner,
    variable,
    cookies,
    commonHeader,
    runtime,
    appSettings,
    permission,
    httpRedoUndo,
    wsRedoUndo,
    llmProvider,
    aiChat,
    copilot,
  };
});
