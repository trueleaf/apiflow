export const cacheKey = {
  ai: {
    config: 'apiflow/ai/config',
    lastSessionId: 'apiflow/ai/lastSessionId',
    conversation: 'apiflow/ai/conversation-v2',
    llmProvider: 'apiflow/ai/llmProvider',
    useFreeLLM: 'apiflow/ai/useFreeLLM',
  },
  runtime: {
    networkMode: 'runtime/networkMode',
    userInfo: 'runtime/userInfo',
    language: 'runtime/language',
    analyticsEnabled: 'runtime/analyticsEnabled',
    hasCreatedExampleProject: 'runtime/hasCreatedExampleProject',
  },
  appState: {
    aiDialog: {
      width: 'appState/aiDialog/width',
      height: 'appState/aiDialog/height',
      position: 'appState/aiDialog/position',
      view: 'appState/aiDialog/view',
      mode: 'appState/aiDialog/mode',
      model: 'appState/aiDialog/model',
    },
    home: {
      activeTab: 'appState/home/activeTab',
      projectManagerSearch: 'appState/home/projectManagerSearch',
    },
    websocketNode: {
      activeParamsTab: 'appState/websocketNode/activeParamsTab',
      messageBlockCollapse: 'appState/websocketNode/messageBlockCollapse',
    },
    httpNode: {
      activeParamsTab: 'appState/httpNode/activeParamsTab',
      responseCollapse: 'appState/httpNode/responseCollapse',
    },
    mockNode: {
      activeTab: 'appState/mockNode/activeTab',
      conditionCollapse: 'appState/mockNode/conditionCollapse',
      headersCollapse: 'appState/mockNode/headersCollapse',
      logViewMode: 'appState/mockNode/logViewMode',
    },
    share: {
      collapse: 'appState/share/collapse',
    },
    localData: {
      activeMenu: 'appState/localData/activeMenu',
    },
    cacheManager: {
      cacheType: 'appState/cacheManager/cacheType',
    },
    hint: {
      mockJsonRandomSizeHint: 'appState/hint/mockJsonRandomSizeHint',
      mockTextRandomSizeHint: 'appState/hint/mockTextRandomSizeHint',
      hideJsonBodyTip: 'appState/hint/hideJsonBodyTip',
    },
    banner: {
      viewMode: 'appState/banner/viewMode',
      historyFilterText: 'appState/banner/historyFilterText',
    },
  },
  projectWorkbench: {
    node: {
      navs: 'projectWorkbench/node/navs',
    },
    pinToolbarOperations: 'projectWorkbench/pinToolbarOperations',
    layout: 'projectWorkbench/layout',
    responseHeight: 'projectWorkbench/responseHeight',
  },
  websocketNode: {
    websocket: 'websocketNode/websocket',
    config: 'websocketNode/config',
  },
  commonHeaders: {
    ignore: 'commonHeaders/ignore',
  },
  httpNodeCache: {
    httpNode: 'httpNodeCache/httpNode',
    cookies: 'httpNodeCache/cookies',
    config: 'httpNodeCache/config',
    preRequest: {
      localStorage: 'httpNodeCache/preRequest/localStorage',
    },
  },
  httpMockNode: {
    mock: 'httpMockNode/mock',
  },
  projectCache: {
    share: {
      password: 'projectCache/share/password',
    },
  },
  settings: {
    cacheManager: {
      info: 'settings/cacheManager/info',
    },
    app: {
      title: 'settings/app/title',
      logo: 'settings/app/logo',
      theme: 'settings/app/theme',
      serverUrl: 'settings/app/serverUrl',
      proxyServerUrl: 'settings/app/proxyServerUrl',
      onlineUrl: 'settings/app/onlineUrl',
    },
    shortcuts: 'settings/shortcuts',
    httpNode: {
      bodyModeOrder: 'settings/httpNode/bodyModeOrder',
      tabOrder: 'settings/httpNode/tabOrder',
    },
    update: {
      autoCheck: 'settings/update/autoCheck',
      source: 'settings/update/source',
      customUrl: 'settings/update/customUrl',
      lastCheckTime: 'settings/update/lastCheckTime',
    },
  },
  appWorkbench: {
    header: {
      tabs: 'appWorkbench/header/tabs',
      activeTab: 'appWorkbench/header/activeTab',
    },
  },
  redoUndo: {
    http: 'redoUndo/http/',
    ws: 'redoUndo/ws/',
  },
} as const;
