import type { HttpNode, ApidocVariable } from "./apidoc";

// ============================================================================
// 基础工具类型
// ============================================================================

export type Property = {
  _id: string;
  key: string;
  value: string;
  type: "string" | "file";
  description: string;
  select: boolean;
};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type JsonData = string | number | boolean | null | JsonData[] | { [key: string]: JsonData };

// ============================================================================
// 应用配置类型
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
     * mock相关配置
     */
    mock: {
      /**
       * 是否启动mock功能
       */
      isEnabled: boolean,
      /**
       * mock服务器默认端口
       */
      port: number,
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
     * 默认electron窗口宽度
     */
    width: number,
    /**
     * 默认electron窗口高度
     */
    height: number,
    /**
     * 使用本地文件作为主进程加载内容
     */
    useLocalFile: boolean,
    /**
     * 若useLocalFile为false则使用当前地址作为electron加载地址
     */
    onlineUrl: string,
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
    /**
     * 是否开启控制台欢迎文案
     */
    consoleWelcome: boolean,
    /**
     * 客户端下载相关
     */
    download: {
      /**
       * 下载地址
       */
      url: string,
      /**
       * 是否允许下载
       */
      isEnabled: boolean,
    },
    /**
     * 是否允许用户自主注册账号
     */
    enableRegister: boolean,
    /**
     * 是否允许来宾用户体验
     */
    enableGuest: boolean,
    /**
     * 是否显示文档和帮助链接
     */
    enableDocLink: boolean,
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
      /**
       * 单个最大可缓存返回body大小
       */
      singleResponseBodySize: number;
      /**
       * 最大可以缓存的返回值大小
       */
      maxResponseBodySize: number;
      /**
       * 分块大小，用于大文件分块存储
       */
      chunkSize: number;
      dbName: string,
      version: number,
    }
  },
  standaloneCache: {
    dbName: string,
    version: number,
  }
}

// ============================================================================
// 窗口状态类型
// ============================================================================

export type WindowState = {
  isMaximized: boolean;
  isMinimized: boolean;
  isFullScreen: boolean;
  isNormal: boolean;
  isVisible: boolean;
  isFocused: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// 导入导出状态类型
// ============================================================================

export type ExportStatus = {
  status: 'notStarted' | 'pathSelected' | "inProgress" | "paused" | "completed" | "error",
  progress: number,
  itemNum: number;
  filePath?: string; // 选择的文件路径
};

export type ImportStatus = {
  status: 'notStarted' | 'fileSelected' | 'inProgress' | 'paused' | 'completed' | 'error',
  progress: number,
  itemNum: number;
  processedNum: number;
  filePath?: string; // 选择的导入文件路径
};

// ============================================================================
// 项目相关类型
// ============================================================================

export type IPCProjectData = {
  projectId: string;
  projectName: string;
}

// ============================================================================
// 分享相关类型
// ============================================================================

export type SharedProjectInfo = {
  projectName: string;
  shareName: string;
  expire: number | null;
  needPassword: boolean;
}

export type LocalShareData = {
  projectInfo: {
    projectName: string;
    projectId: string;
  },
  nodes: HttpNode[],
  variables: ApidocVariable[],
}

// ============================================================================
// 语言类型
// ============================================================================

export type Language = 'zh-cn' | 'zh-tw' | 'en' | 'ja';

// ============================================================================
// 沙箱通信类型
// ============================================================================

export type SandboxEvalMessage = {
  type: "eval",
  code: string;
}

export type SandboxEvalSuccessMessage = {
  type: "evalSuccess",
  data: string;
}

export type SandboxErrorMessage = {
  type: "error",
  msg: string;
}

export type SandboxReceiveMessage = SandboxEvalMessage
export type SandboxPostMessage = SandboxErrorMessage | SandboxEvalSuccessMessage
