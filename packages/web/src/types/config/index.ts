// ============================================================================
// 应用配置模块
// 包含整个应用的配置类型定义
// ============================================================================

import type { ComponentSize } from "element-plus";

export type Config = {
  /**
   * 是否为开发环境
   */
  isDev: boolean,
  /**
   * 更新相关配置
   */
  updateConfig: {
    /**
     * 更新服务器地址
     */
    url: string,
    /**
     * 是否开启自动更新
     */
    autoUpdate: boolean,
  },

  /**
   * 渲染进程配置
   */
  renderConfig: {
    /**
     * 布局相关
     */
    layout: {
      /**
       * 项目中组件库大小
       */
      size: ComponentSize,
    },
    /**
     * 权限相关
     */
    permission: {
      /**
       * 是否开启严格权限校验
       */
      free: boolean,
      /**
       * 路由白名单，free模式下所有路由都不拦截
       */
      whiteList: string[],
    },
    /**
     * http请求相关
     */
    httpRequest: {
      /**
       * 请求url
       */
      url: string,
      /**
       * 图片url
       */
      imgUrl: string,
      /**
       * 超时时间
       */
      timeout: number,
      /**
       * 请求是否携带cookie
       */
      withCredentials: boolean,
    },
    /**
     * 全局组件配置
     */
    components: {
      /**
       * 表格相关配置信息
       */
      tableConfig: {
        /**
         * 每页条数
         */
        pageSizes: number[],
        /**
         * 每页默认显示数量
         */
        pageSize: number,
      },
    },
    /**
     * 本地数据库配置
     */
    indexedDB: {
      /**
       * indexedDB数据库名称
       */
      dbName: string,
      /**
       * indexedDB数据库版本
       */
      version: number,
    },
    /**
     * 导入文档相关配置
     */
    import: {
      /**
       * 导入文件大小限制
       */
      size: number,
    },
    /**
     * 分享url
     */
    shareUrl: string
  },
  /**
   * 主进程配置
   */
  mainConfig: {
    /**
     * 默认electron窗口最小宽度
     */
    minWidth: number,
    /**
     * 默认electron窗口最小高度
     */
    minHeight: number,
    /**
     * 顶部栏视图高度
     */
    topbarViewHeight: number,
    /**
     * 使用本地文件作为主进程加载内容
     */
    useLocalFile: boolean,
    /**
     * 若useLocalFile为false则使用当前地址作为electron加载地址
     */
    onlineUrl: string,
    /**
     * AI配置
     */
    aiConfig: {
      /**
       * 默认模型
       */
      model: "DeepSeek",
      /**
       * 接口密钥
       */
      apiKey: string,
      /**
       * 接口地址
       */
      apiUrl: string,
      /**
       * 最大令牌数限制
       */
      maxTokens?: number,
      /**
       * 请求超时时间（毫秒）
       */
      timeout: number,
    },
  },

  /**
   * 本地部署相关配置
   */
  localization: {
    /**
     *  版本信息 eg: 0.6.3
     */
    version: string,
    /**
     * 应用名称
     */
    title: string,
  },
  requestTest: {
    responseLogDir: string;
    autoSaveResponseLog: boolean;
    maxLocalResponseLogSize: number;
    maxLocalWebStorageResponseLogSize: number;
    canLogResponsebodyByteLength: number;
  },
  requestConfig: {
    maxTextBodySize: number;
    maxRawBodySize: number
    userAgent: string;
    followRedirect: boolean;
    maxRedirects: number;
    /**
     * 最大请求头值展示长度,超过后点击展示完整数据
     */
    maxHeaderValueDisplayLength: number;
  },
  cacheConfig: {
    apiflowResponseCache: {
      singleResponseBodySize: number;
      maxResponseBodySize: number;
      chunkSize: number;
      dbName: string,
      version: number,
    },
    websocketNodeResponseCache: {
      dbName: string,
      version: number,
      singleResponseSize: number, //单个消息大小限制
      maxResponseSize: number, //最大缓存消息大小
    },
    websocketHistoryCache: {
      dbName: string,
      version: number,
      storeName: string,
      maxHistoryPerNode: number, //每个节点最大历史记录数
    },
    mockVariableCache: {
      dbName: string,
      version: number,
      storeName: string,
      projectIdIndex: string,
    },
    mockLogsCache: {
      dbName: string,
      version: number,
      storeName: string,
      maxLogsPerNode: number,
    }
  },
  standaloneCache: {
    dbName: string,
    version: number,
  }
}

/**
 * 主进程配置类型
 * 从 Config 中提取，便于主进程独立使用
 */
export type MainConfig = Config['mainConfig'];
