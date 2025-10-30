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
  APIFLOW: {
    /** 顶栏 -> 内容窗口 */
    TOPBAR_TO_CONTENT: {
      /** 顶栏已准备就绪 */
      TOPBAR_READY: 'apiflow:topbar:to:content:topbar-ready',
      /** 初始化标签页数据 */
      INIT_TABS_DATA: 'apiflow:topbar:to:content:init-tabs-data',
      /** 项目已创建 */
      PROJECT_CREATED: 'apiflow:topbar:to:content:project-created',
      /** 项目已切换 */
      PROJECT_CHANGED: 'apiflow:topbar:to:content:project-changed',
      /** 项目已删除 */
      PROJECT_DELETED: 'apiflow:topbar:to:content:project-deleted',
      /** 项目已重命名 */
      PROJECT_RENAMED: 'apiflow:topbar:to:content:project-renamed',
      /** 导航到指定路由 */
      NAVIGATE: 'apiflow:topbar:to:content:navigate',
      /** 语言已变更 */
      LANGUAGE_CHANGED: 'apiflow:topbar:to:content:language-changed',
      /** 网络模式已变更 */
      NETWORK_MODE_CHANGED: 'apiflow:topbar:to:content:network-mode-changed',
      /** 同步AI配置 */
      SYNC_AI_CONFIG: 'apiflow:topbar:to:content:sync-ai-config',
      /** Header Tabs 列表已更新 */
      TABS_UPDATED: 'apiflow:topbar:to:content:tabs-updated',
      /** Header 激活的 Tab 已变化 */
      ACTIVE_TAB_UPDATED: 'apiflow:topbar:to:content:active-tab-updated',
    },

    /** 内容窗口 -> 顶栏 */
    CONTENT_TO_TOPBAR: {
      /** 内容窗口已准备就绪 */
      CONTENT_READY: 'apiflow:content:to:topbar:content-ready',
      /** 初始化标签页 */
      INIT_TABS: 'apiflow:content:to:topbar:init-tabs',
      /** 创建项目 */
      CREATE_PROJECT: 'apiflow:content:to:topbar:create-project',
      /** 切换项目 */
      SWITCH_PROJECT: 'apiflow:content:to:topbar:switch-project',
      /** 项目已删除 */
      PROJECT_DELETED: 'apiflow:content:to:topbar:project-deleted',
      /** 项目已重命名 */
      PROJECT_RENAMED: 'apiflow:content:to:topbar:project-renamed',
      /** 显示语言菜单 */
      SHOW_LANGUAGE_MENU: 'apiflow:content:to:topbar:show-language-menu',
      /** 隐藏语言菜单 */
      HIDE_LANGUAGE_MENU: 'apiflow:content:to:topbar:hide-language-menu',
      /** 导航到首页 */
      NAVIGATE_TO_HOME: 'apiflow:content:to:topbar:navigate-to-home',
    },

    /** 渲染进程 -> 主进程 (请求-响应) */
    RENDERER_TO_MAIN: {
      /** 检查顶栏是否就绪 */
      TOPBAR_IS_READY: 'apiflow:renderer:to:main:topbar-is-ready',
      /** 检查内容窗口是否就绪 */
      CONTENT_IS_READY: 'apiflow:renderer:to:main:content-is-ready',
      /** 创建项目 */
      CREATE_PROJECT: 'apiflow:renderer:to:main:create-project',
      /** 切换项目 */
      CHANGE_PROJECT: 'apiflow:renderer:to:main:change-project',
      /** 删除项目 */
      DELETE_PROJECT: 'apiflow:renderer:to:main:delete-project',
      /** 重命名项目 */
      CHANGE_PROJECT_NAME: 'apiflow:renderer:to:main:change-project-name',
      /** 改变路由 */
      CHANGE_ROUTE: 'apiflow:renderer:to:main:change-route',
      /** 后退 */
      GO_BACK: 'apiflow:renderer:to:main:go-back',
      /** 前进 */
      GO_FORWARD: 'apiflow:renderer:to:main:go-forward',
      /** 刷新应用 */
      REFRESH_APP: 'apiflow:renderer:to:main:refresh-app',
      /** 刷新内容视图 */
      REFRESH_CONTENT_VIEW: 'apiflow:renderer:to:main:refresh-content-view',
      /** 以Blob格式读取文件 */
      READ_FILE_AS_BLOB: 'apiflow:renderer:to:main:read-file-as-blob',
    },
  },

  /**
   * 窗口控制事件
   */
  WINDOW: {
    /** 渲染进程 -> 主进程 */
    RENDERER_TO_MAIN: {
      /** 最小化窗口 */
      MINIMIZE: 'window:renderer:to:main:minimize',
      /** 最大化窗口 */
      MAXIMIZE: 'window:renderer:to:main:maximize',
      /** 取消最大化窗口 */
      UNMAXIMIZE: 'window:renderer:to:main:unmaximize',
      /** 关闭窗口 */
      CLOSE: 'window:renderer:to:main:close',
      /** 获取窗口状态 */
      GET_STATE: 'window:renderer:to:main:get-state',
      /** 调整窗口大小 */
      RESIZE: 'window:renderer:to:main:resize',
      /** 打开开发者工具 */
      OPEN_DEV_TOOLS: 'window:renderer:to:main:open-dev-tools',
    },
  },

  /**
   * WebSocket 连接管理事件
   */
  WEBSOCKET: {
    /** 渲染进程 -> 主进程 */
    RENDERER_TO_MAIN: {
      /** 连接WebSocket */
      CONNECT: 'websocket:renderer:to:main:connect',
      /** 断开连接 */
      DISCONNECT: 'websocket:renderer:to:main:disconnect',
      /** 根据节点断开连接 */
      DISCONNECT_BY_NODE: 'websocket:renderer:to:main:disconnect-by-node',
      /** 发送消息 */
      SEND: 'websocket:renderer:to:main:send',
      /** 获取连接状态 */
      GET_STATE: 'websocket:renderer:to:main:get-state',
      /** 获取所有连接 */
      GET_ALL_CONNECTIONS: 'websocket:renderer:to:main:get-all-connections',
      /** 获取连接ID列表 */
      GET_CONNECTION_IDS: 'websocket:renderer:to:main:get-connection-ids',
      /** 检查节点连接状态 */
      CHECK_NODE_CONNECTION: 'websocket:renderer:to:main:check-node-connection',
      /** 清空所有连接 */
      CLEAR_ALL_CONNECTIONS: 'websocket:renderer:to:main:clear-all-connections',
    },

    /** 主进程 -> 渲染进程 (事件通知) */
    MAIN_TO_RENDERER: {
      /** WebSocket已打开 */
      OPENED: 'websocket:main:to:renderer:opened',
      /** 收到消息 */
      MESSAGE: 'websocket:main:to:renderer:message',
      /** 连接已关闭 */
      CLOSED: 'websocket:main:to:renderer:closed',
      /** 发生错误 */
      ERROR: 'websocket:main:to:renderer:error',
    },
  },

  /**
   * Mock 服务器事件
   */
  MOCK: {
    /** 渲染进程 -> 主进程 */
    RENDERER_TO_MAIN: {
      /** 根据节点ID获取Mock配置 */
      GET_BY_NODE_ID: 'mock:renderer:to:main:get-by-node-id',
      /** 启动Mock服务器 */
      START_SERVER: 'mock:renderer:to:main:start-server',
      /** 停止Mock服务器 */
      STOP_SERVER: 'mock:renderer:to:main:stop-server',
      /** 根据ID替换Mock配置 */
      REPLACE_BY_ID: 'mock:renderer:to:main:replace-by-id',
      /** 获取所有Mock状态 */
      GET_ALL_STATES: 'mock:renderer:to:main:get-all-states',
      /** 同步项目变量 */
      SYNC_PROJECT_VARIABLES: 'mock:renderer:to:main:sync-project-variables',
      /** 根据节点ID获取日志 */
      GET_LOGS_BY_NODE_ID: 'mock:renderer:to:main:get-logs-by-node-id',
    },

    /** 主进程 -> 渲染进程 (事件通知) */
    MAIN_TO_RENDERER: {
      /** 批量推送Mock日志 */
      LOGS_BATCH: 'mock:main:to:renderer:logs-batch',
      /** Mock状态变更通知 */
      STATUS_CHANGED: 'mock:main:to:renderer:status-changed',
    },
  },

  /**
   * 数据导出事件
   */
  EXPORT: {
    /** 渲染进程 -> 主进程 */
    RENDERER_TO_MAIN: {
      /** 选择导出路径 */
      SELECT_PATH: 'export:renderer:to:main:select-path',
      /** 获取导出状态 */
      GET_STATUS: 'export:renderer:to:main:get-status',
    },

    /** 主进程 -> 渲染进程 */
    MAIN_TO_RENDERER: {
      /** 准备接收数据 */
      READY_TO_RECEIVE: 'export:main:to:renderer:ready-to-receive',
      /** 导出完成 */
      FINISH: 'export:main:to:renderer:finish',
      /** 导出错误 */
      ERROR: 'export:main:to:renderer:error',
      /** 重置完成 */
      RESET_COMPLETE: 'export:main:to:renderer:reset-complete',
    },

    /** 渲染进程 -> 主进程 (单向通知) */
    RENDERER_NOTIFY_MAIN: {
      /** 开始导出 */
      START: 'export:renderer:notify:main:start',
      /** 发送渲染数据 */
      RENDERER_DATA: 'export:renderer:notify:main:renderer-data',
      /** 渲染数据发送完成 */
      RENDERER_DATA_FINISH: 'export:renderer:notify:main:renderer-data-finish',
      /** 重置导出 */
      RESET: 'export:renderer:notify:main:reset',
    },
  },

  /**
   * 数据导入事件
   */
  IMPORT: {
    /** 渲染进程 -> 主进程 */
    RENDERER_TO_MAIN: {
      /** 选择导入文件 */
      SELECT_FILE: 'import:renderer:to:main:select-file',
    },

    /** 主进程 -> 渲染进程 */
    MAIN_TO_RENDERER: {
      /** 文件已分析 */
      FILE_ANALYZED: 'import:main:to:renderer:file-analyzed',
      /** 导入进度 */
      PROGRESS: 'import:main:to:renderer:progress',
      /** 数据项 */
      DATA_ITEM: 'import:main:to:renderer:data-item',
      /** ZIP读取完成 */
      ZIP_READ_COMPLETE: 'import:main:to:renderer:zip-read-complete',
      /** 导入错误 */
      ERROR: 'import:main:to:renderer:error',
    },

    /** 渲染进程 -> 主进程 (单向通知) */
    RENDERER_NOTIFY_MAIN: {
      /** 分析文件 */
      ANALYZE_FILE: 'import:renderer:notify:main:analyze-file',
      /** 开始导入 */
      START: 'import:renderer:notify:main:start',
      /** 重置导入 */
      RESET: 'import:renderer:notify:main:reset',
    },
  },

  /**
   * AI 功能事件
   */
  AI: {
    /** 渲染进程 -> 主进程 */
    RENDERER_TO_MAIN: {
      /** 文本聊天 */
      TEXT_CHAT: 'ai:renderer:to:main:text-chat',
      /** JSON聊天 */
      JSON_CHAT: 'ai:renderer:to:main:json-chat',
      /** 流式文本聊天 */
      TEXT_CHAT_STREAM: 'ai:renderer:to:main:text-chat-stream',
      /** 取消流式输出 */
      CANCEL_STREAM: 'ai:renderer:to:main:cancel-stream',
    },

    /** 主进程 -> 渲染进程 (流式响应) */
    MAIN_TO_RENDERER: {
      /** 流式数据 */
      STREAM_DATA: 'ai:main:to:renderer:stream-data',
      /** 流式结束 */
      STREAM_END: 'ai:main:to:renderer:stream-end',
      /** 流式错误 */
      STREAM_ERROR: 'ai:main:to:renderer:stream-error',
    },
  },

  /**
   * 工具类事件
   */
  UTIL: {
    /** 渲染进程 -> 主进程 */
    RENDERER_TO_MAIN: {
      /** 执行JavaScript代码 */
      EXEC_CODE: 'util:renderer:to:main:exec-code',
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
