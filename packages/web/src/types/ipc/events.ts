/**
 * IPC 事件名称常量定义
 *
 * 命名规则: {domain}:{sender}:to:{receiver}:{action}-{object}
 *
 * 发送方/接收方标识:
 * - main: 主进程
 * - topbar: 顶栏渲染进程
 * - content: 内容渲染进程
 * - renderer: 通用渲染进程(不区分具体窗口)
 */

export const IPC_EVENTS = {
  /**
   * 应用核心功能事件
   */
  apiflow: {
    /** 顶栏 -> 内容窗口 */
    topBarToContent: {
      /** 顶栏已准备就绪 */
      topBarReady: 'apiflow:topbar:to:content:topbar-ready',
      /** 初始化标签页数据 */
      initTabsData: 'apiflow:topbar:to:content:init-tabs-data',
      /** 项目已创建 */
      projectCreated: 'apiflow:topbar:to:content:project-created',
      /** 项目已切换 */
      projectChanged: 'apiflow:topbar:to:content:project-changed',
      /** 项目已删除 */
      projectDeleted: 'apiflow:topbar:to:content:project-deleted',
      /** 项目已重命名 */
      projectRenamed: 'apiflow:topbar:to:content:project-renamed',
      /** 导航到指定路由 */
      navigate: 'apiflow:topbar:to:content:navigate',
      /** 语言已变更 */
      languageChanged: 'apiflow:topbar:to:content:language-changed',
      /** 网络模式已变更 */
      networkModeChanged: 'apiflow:topbar:to:content:network-mode-changed',
      /** 显示语言菜单 */
      showLanguageMenu: 'apiflow:topbar:to:content:show-language-menu',
      /** 隐藏语言菜单 */
      hideLanguageMenu: 'apiflow:topbar:to:content:hide-language-menu',
      /** 显示用户菜单 */
      showUserMenu: 'apiflow:topbar:to:content:show-user-menu',
      /** 隐藏用户菜单 */
      hideUserMenu: 'apiflow:topbar:to:content:hide-user-menu',
      /** 显示 Header Tab 右键菜单 */
      showHeaderTabContextmenu: 'apiflow:topbar:to:content:show-header-tab-contextmenu',
      /** 隐藏 Header Tab 右键菜单 */
      hideHeaderTabContextmenu: 'apiflow:topbar:to:content:hide-header-tab-contextmenu',
      /** Header Tabs 列表已更新 */
      tabsUpdated: 'apiflow:topbar:to:content:tabs-updated',
      /** Header 激活的 Tab 已变化 */
      activeTabUpdated: 'apiflow:topbar:to:content:active-tab-updated',
      /** 打开设置标签 */
      openSettingsTab: 'apiflow:topbar:to:content:open-settings-tab',
      /** 应用设置已变更 */
      appSettingsChanged: 'apiflow:topbar:to:content:app-settings-changed',
    },

    /** 内容窗口 -> 顶栏 */
    contentToTopBar: {
      /** 内容窗口已准备就绪 */
      contentReady: 'apiflow:content:to:topbar:content-ready',
      /** 初始化标签页 */
      initTabs: 'apiflow:content:to:topbar:init-tabs',
      /** 创建项目 */
      createProject: 'apiflow:content:to:topbar:create-project',
      /** 显示AI对话框 */
      showAiDialog: 'apiflow:content:to:topbar:show-ai-dialog',
      /** 项目已创建 */
      projectCreated: 'apiflow:content:to:topbar:project-created',
      /** 切换项目 */
      switchProject: 'apiflow:content:to:topbar:switch-project',
      /** 项目已切换 */
      projectChanged: 'apiflow:content:to:topbar:project-changed',
      /** 项目已删除 */
      projectDeleted: 'apiflow:content:to:topbar:project-deleted',
      /** 项目已重命名 */
      projectRenamed: 'apiflow:content:to:topbar:project-renamed',
      /** 语言已变更 */
      languageChanged: 'apiflow:content:to:topbar:language-changed',
      /** 用户信息已变更 */
      userInfoChanged: 'apiflow:content:to:topbar:user-info-changed',
      /** 快速登录凭证已变更 */
      quickLoginCredentialChanged: 'apiflow:content:to:topbar:quick-login-credential-changed',
      /** 显示语言菜单 */
      showLanguageMenu: 'apiflow:content:to:topbar:show-language-menu',
      /** 隐藏语言菜单 */
      hideLanguageMenu: 'apiflow:content:to:topbar:hide-language-menu',
      /** 导航到首页 */
      navigateToHome: 'apiflow:content:to:topbar:navigate-to-home',
      /** 导航到登录页 */
      navigateToLogin: 'apiflow:content:to:topbar:navigate-to-login',
      /** 打开设置标签 */
      openSettingsTab: 'apiflow:content:to:topbar:open-settings-tab',
      activeTabUpdated: 'apiflow:content:to:topbar:active-tab-updated',
      /** 应用设置已变更 */
      appSettingsChanged: 'apiflow:content:to:topbar:app-settings-changed',
      /** Header Tab 右键菜单操作 */
      headerTabContextAction: 'apiflow:content:to:topbar:header-tab-context-action',
    },

    /** 渲染进程 -> 主进程 (请求-响应) */
    rendererToMain: {
      /** 检查顶栏是否就绪 */
      topBarIsReady: 'apiflow:renderer:to:main:topbar-is-ready',
      /** 检查内容窗口是否就绪 */
      contentIsReady: 'apiflow:renderer:to:main:content-is-ready',
      /** 创建项目 */
      createProject: 'apiflow:renderer:to:main:create-project',
      /** 显示AI对话框 */
      showAiDialog: 'apiflow:renderer:to:main:show-ai-dialog',
      /** 切换项目 */
      changeProject: 'apiflow:renderer:to:main:change-project',
      /** 删除项目 */
      deleteProject: 'apiflow:renderer:to:main:delete-project',
      /** 重命名项目 */
      changeProjectName: 'apiflow:renderer:to:main:change-project-name',
      /** 改变路由 */
      changeRoute: 'apiflow:renderer:to:main:change-route',
      /** 后退 */
      goBack: 'apiflow:renderer:to:main:go-back',
      /** 前进 */
      goForward: 'apiflow:renderer:to:main:go-forward',
      /** 刷新应用 */
      refreshApp: 'apiflow:renderer:to:main:refresh-app',
      /** 刷新内容视图 */
      refreshContentView: 'apiflow:renderer:to:main:refresh-content-view',
      /** 以Blob格式读取文件 */
      readFileAsBlob: 'apiflow:renderer:to:main:read-file-as-blob',
      /** 设置窗口图标 */
      setWindowIcon: 'apiflow:renderer:to:main:set-window-icon',
    },
  },

  /**
   * 窗口控制事件
   */
  window: {
    /** 渲染进程 -> 主进程 */
    rendererToMain: {
      /** 最小化窗口 */
      minimize: 'window:renderer:to:main:minimize',
      /** 最大化窗口 */
      maximize: 'window:renderer:to:main:maximize',
      /** 取消最大化窗口 */
      unmaximize: 'window:renderer:to:main:unmaximize',
      /** 关闭窗口 */
      close: 'window:renderer:to:main:close',
      /** 获取窗口状态 */
      getState: 'window:renderer:to:main:get-state',
      /** 调整窗口大小 */
      resize: 'window:renderer:to:main:resize',
      /** 打开开发者工具 */
      openDevTools: 'window:renderer:to:main:open-dev-tools',
    },
  },

  /**
   * WebSocket 连接管理事件
   */
  websocket: {
    /** 渲染进程 -> 主进程 */
    rendererToMain: {
      /** 连接WebSocket */
      connect: 'websocket:renderer:to:main:connect',
      /** 断开连接 */
      disconnect: 'websocket:renderer:to:main:disconnect',
      /** 根据节点断开连接 */
      disconnectByNode: 'websocket:renderer:to:main:disconnect-by-node',
      /** 发送消息 */
      send: 'websocket:renderer:to:main:send',
      /** 获取连接状态 */
      getState: 'websocket:renderer:to:main:get-state',
      /** 获取所有连接 */
      getAllConnections: 'websocket:renderer:to:main:get-all-connections',
      /** 获取连接ID列表 */
      getConnectionIds: 'websocket:renderer:to:main:get-connection-ids',
      /** 检查节点连接状态 */
      checkNodeConnection: 'websocket:renderer:to:main:check-node-connection',
      /** 清空所有连接 */
      clearAllConnections: 'websocket:renderer:to:main:clear-all-connections',
    },

    /** 主进程 -> 渲染进程 (事件通知) */
    mainToRenderer: {
      /** WebSocket已打开 */
      opened: 'websocket:main:to:renderer:opened',
      /** 收到消息 */
      message: 'websocket:main:to:renderer:message',
      /** 连接已关闭 */
      closed: 'websocket:main:to:renderer:closed',
      /** 发生错误 */
      error: 'websocket:main:to:renderer:error',
    },
  },

  /**
   * Mock 服务器事件
   */
  mock: {
    /** 渲染进程 -> 主进程 */
    rendererToMain: {
      /** 根据节点ID获取Mock配置 */
      getByNodeId: 'mock:renderer:to:main:get-by-node-id',
      /** 启动mock */
      startServer: 'mock:renderer:to:main:start-server',
      /** 停止mock */
      stopServer: 'mock:renderer:to:main:stop-server',
      /** 根据ID替换Mock配置 */
      replaceById: 'mock:renderer:to:main:replace-by-id',
      /** 获取所有Mock状态 */
      getAllStates: 'mock:renderer:to:main:get-all-states',
      /** 同步项目变量 */
      syncProjectVariables: 'mock:renderer:to:main:sync-project-variables',
      /** 根据节点ID获取日志 */
      getLogsByNodeId: 'mock:renderer:to:main:get-logs-by-node-id',
    },

    /** 主进程 -> 渲染进程 (事件通知) */
    mainToRenderer: {
      /** 批量推送Mock日志 */
      logsBatch: 'mock:main:to:renderer:logs-batch',
      /** Mock状态变更通知 */
      statusChanged: 'mock:main:to:renderer:status-changed',
    },
  },

  /**
   * WebSocket Mock 服务器事件
   */
  websocketMock: {
    /** 渲染进程 -> 主进程 */
    rendererToMain: {
      /** 根据节点ID获取WebSocket Mock配置 */
      getByNodeId: 'websocket-mock:renderer:to:main:get-by-node-id',
      /** 启动WebSocket Mock服务器 */
      startServer: 'websocket-mock:renderer:to:main:start-server',
      /** 停止WebSocket Mock服务器 */
      stopServer: 'websocket-mock:renderer:to:main:stop-server',
      /** 根据ID替换WebSocket Mock配置 */
      replaceById: 'websocket-mock:renderer:to:main:replace-by-id',
      /** 获取所有WebSocket Mock状态 */
      getAllStates: 'websocket-mock:renderer:to:main:get-all-states',
      /** 根据节点ID获取日志 */
      getLogsByNodeId: 'websocket-mock:renderer:to:main:get-logs-by-node-id',
    },

    /** 主进程 -> 渲染进程 (事件通知) */
    mainToRenderer: {
      /** 批量推送WebSocket Mock日志 */
      logsBatch: 'websocket-mock:main:to:renderer:logs-batch',
      /** WebSocket Mock状态变更通知 */
      statusChanged: 'websocket-mock:main:to:renderer:status-changed',
    },
  },

  /**
   * 数据导出事件
   */
  export: {
    /** 渲染进程 -> 主进程 */
    rendererToMain: {
      /** 选择导出路径 */
      selectPath: 'export:renderer:to:main:select-path',
      /** 获取导出状态 */
      getStatus: 'export:renderer:to:main:get-status',
    },

    /** 主进程 -> 渲染进程 */
    mainToRenderer: {
      /** 准备接收数据 */
      readyToReceive: 'export:main:to:renderer:ready-to-receive',
      /** 导出完成 */
      finish: 'export:main:to:renderer:finish',
      /** 导出错误 */
      error: 'export:main:to:renderer:error',
      /** 重置完成 */
      resetComplete: 'export:main:to:renderer:reset-complete',
    },

    /** 渲染进程 -> 主进程 (单向通知) */
    rendererNotifyMain: {
      /** 开始导出 */
      start: 'export:renderer:notify:main:start',
      /** 发送渲染数据 */
      rendererData: 'export:renderer:notify:main:renderer-data',
      /** 渲染数据发送完成 */
      rendererDataFinish: 'export:renderer:notify:main:renderer-data-finish',
      /** 重置导出 */
      reset: 'export:renderer:notify:main:reset',
    },
  },

  /**
   * 数据导入事件
   */
  import: {
    /** 渲染进程 -> 主进程 */
    rendererToMain: {
      /** 选择导入文件 */
      selectFile: 'import:renderer:to:main:select-file',
    },

    /** 主进程 -> 渲染进程 */
    mainToRenderer: {
      /** 文件已分析 */
      fileAnalyzed: 'import:main:to:renderer:file-analyzed',
      /** 导入进度 */
      progress: 'import:main:to:renderer:progress',
      /** 数据项 */
      dataItem: 'import:main:to:renderer:data-item',
      /** ZIP读取完成 */
      zipReadComplete: 'import:main:to:renderer:zip-read-complete',
      /** 导入错误 */
      error: 'import:main:to:renderer:error',
    },

    /** 渲染进程 -> 主进程 (单向通知) */
    rendererNotifyMain: {
      /** 分析文件 */
      analyzeFile: 'import:renderer:notify:main:analyze-file',
      /** 开始导入 */
      start: 'import:renderer:notify:main:start',
      /** 重置导入 */
      reset: 'import:renderer:notify:main:reset',
    },
  },

  /**
   * 工具类事件
   */
  util: {
    /** 渲染进程 -> 主进程 */
    rendererToMain: {
      /** 执行JavaScript代码 */
      execCode: 'util:renderer:to:main:exec-code',
    },
  },

  /**
   * 临时文件管理事件
   */
  tempFile: {
    /** 渲染进程 -> 主进程 */
    rendererToMain: {
      /** 创建临时文件 */
      create: 'temp-file:renderer:to:main:create',
      /** 删除临时文件 */
      delete: 'temp-file:renderer:to:main:delete',
      /** 读取临时文件内容 */
      read: 'temp-file:renderer:to:main:read',
    },
  },

} as const;

/**
 * 从嵌套的事件对象中提取所有事件名称的联合类型
 */
type ExtractEventNames<T> = T extends string
  ? T
  : T extends object
    ? { [K in keyof T]: ExtractEventNames<T[K]> }[keyof T]
    : never;

/**
 * 所有IPC事件名称的联合类型
 */
export type IPCEventName = ExtractEventNames<typeof IPC_EVENTS>;
