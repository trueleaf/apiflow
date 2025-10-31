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
     * http请求相关
     */
    httpRequest: {
      /**
       * 请求url
       */
      url: string,
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
     * 导入文档相关配置
     */
    importProjectConfig: {
      /**
       * 导入文件大小限制
       */
      maxSize: number,
    },
  },
  /**
   * 主进程配置
   */
  mainConfig: MainConfig,
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
  httpNodeRequestConfig: {
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
    httpNodeResponseCache: {
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
    httpHistoryCache: {
      dbName: string,
      version: number,
      storeName: string,
      maxHistoryPerNode: number, //每个节点最大历史记录数
    },
    mockNodeVariableCache: {
      dbName: string,
      version: number,
      storeName: string,
      projectIdIndex: string,
    },
    mockNodeLogsCache: {
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
 */
export type MainConfig = {
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
}
