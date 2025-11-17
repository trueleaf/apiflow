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
  userState: {
    aiDialog: {
      width: 'userState/aiDialog/width',
      height: 'userState/aiDialog/height',
      position: 'userState/aiDialog/position',
      mode: 'userState/aiDialog/mode',
      model: 'userState/aiDialog/model',
    },
    home: {
      activeTab: 'userState/home/activeTab',
    },
    websocketNode: {
      activeParamsTab: 'userState/websocketNode/activeParamsTab',
    },
    httpNode: {
      activeParamsTab: 'userState/httpNode/activeParamsTab',
      responseCollapse: 'userState/httpNode/responseCollapse',
    },
    mockNode: {
      activeTab: 'userState/mockNode/activeTab',
      conditionCollapse: 'userState/mockNode/conditionCollapse',
      headersCollapse: 'userState/mockNode/headersCollapse',
    },
    share: {
      collapse: 'userState/share/collapse',
    },
    localData: {
      activeMenu: 'userState/localData/activeMenu',
    },
    cacheManager: {
      cacheType: 'userState/cacheManager/cacheType',
    },
    hint: {
      mockJsonRandomSizeHint: 'userState/hint/mockJsonRandomSizeHint',
      mockTextRandomSizeHint: 'userState/hint/mockTextRandomSizeHint',
      hideJsonBodyTip: 'userState/hint/hideJsonBodyTip',
    },
  },
  workbench: {
    node: {
      tabs: 'workbench/node/tabs',
    },
    pinToolbarOperations: 'workbench/pinToolbarOperations',
    layout: 'workbench/layout',
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
