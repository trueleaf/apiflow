export const cacheKey = {
  ai: {
    config: 'apiflow/ai/config',
    lastSessionId: 'apiflow/ai/lastSessionId',
  },
  runtime: {
    networkMode: 'runtime/networkMode',
    userInfo: 'runtime/userInfo',
    language: 'runtime/language',
  },
  appState: {
    aiDialog: {
      width: 'appState/aiDialog/width',
      height: 'appState/aiDialog/height',
      position: 'appState/aiDialog/position',
      mode: 'appState/aiDialog/mode',
      model: 'appState/aiDialog/model',
    },
    home: {
      activeTab: 'appState/home/activeTab',
    },
    websocketNode: {
      activeParamsTab: 'appState/websocketNode/activeParamsTab',
    },
    httpNode: {
      activeParamsTab: 'appState/httpNode/activeParamsTab',
      responseCollapse: 'appState/httpNode/responseCollapse',
    },
    mockNode: {
      activeTab: 'appState/mockNode/activeTab',
      conditionCollapse: 'appState/mockNode/conditionCollapse',
      headersCollapse: 'appState/mockNode/headersCollapse',
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
  },
  projectWorkbench: {
    node: {
      tabs: 'projectWorkbench/node/tabs',
    },
    pinToolbarOperations: 'projectWorkbench/pinToolbarOperations',
    layout: 'projectWorkbench/layout',
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
    },
    shortcuts: 'settings/shortcuts',
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