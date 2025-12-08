import { Config } from '@src/types';
import { mainConfig } from './mainConfig';
const isDev = process.env.NODE_ENV === 'development';

export const config: Config = {
  isDev,
  //渲染进程配置
  renderConfig: {
    //布局相关
    layout: {
      size: 'default', //项目中组件库大小
    },
    //AI对话框相关
    aiDialog: {
      defaultWidth: 400,
      defaultHeight: 400,
      minWidth: 300,
      maxWidth: 800,
      minHeight: 400,
      maxHeight: 900,
    },
    //http请求相关
    httpRequest: {
      url: isDev ? 'http://127.0.0.1:7001' : 'https://online.jobtool.cn',
      timeout: 20000,
      withCredentials: true,
    },
    //导入文档相关配置
    importProjectConfig: {
      maxSize: 1024 * 1024 * 5,
    },
  },
  //主进程配置
  mainConfig,

  //应用相关配置
  appConfig: {
    version: '0.8.0', //当前项目版本
    appTitle: 'Apiflow', //应用标题
    appLogo: '', //应用Logo
    appTheme: 'light', //应用主题
  },
  httpNodeConfig: {
    maxTextBodySize: 1024 * 1024 * 50, //最大可展示文本格式数大小
    maxRawBodySize: 1024 * 1024 * 50, //最大可以显示原始值类型
    userAgent: "https://github.com/trueleaf/apiflow",
    followRedirect: true, //是否允许重定向
    maxRedirects: 10, //最大重定向次数
    maxHeaderValueDisplayLength: 1024,
    bodyModeOrder: ['json', 'formdata', 'urlencoded', 'raw', 'binary', 'none'],
    tempFileSizeThreshold: 1024 * 50, //粘贴大值自动转临时文件的阈值，默认50KB
  },
  variableConfig: {
    maxStringSize: 1024 * 100, //string类型变量最大大小（字符数）
  },
  cacheConfig: {
    httpNodeResponseCache: {
      singleResponseBodySize: 1024 * 1024 * 200, //单个返回值大小
      maxResponseBodySize: 1024 * 1024 * 1024 * 10, //最大可以缓存的返回值大小
      chunkSize: 1024 * 1024 * 5, //分块大小，默认5MB
      dbName: 'httpNodeResponseCache',
      version: 1, //升级版本以支持分块存储
    },
    websocketNodeResponseCache: {
      dbName: 'websocketNodeResponseCache',
      version: 1,
      singleResponseSize: 1024 * 1024 * 50, //单个消息大小限制
      maxResponseSize: 1024 * 1024 * 1024 * 5, //最大缓存消息大小
    },
    websocketHistoryCache: {
      dbName: 'websocketHistoryCache',
      version: 1,
      storeName: 'histories',
      maxHistoryPerNode: 50, //每个节点最大历史记录数
    },
    httpHistoryCache: {
      dbName: 'httpHistoryCache',
      version: 1,
      storeName: 'histories',
      maxHistoryPerNode: 50, //每个节点最大历史记录数
    },
    sendHistoryCache: {
      dbName: 'sendHistoryCache',
      version: 1,
      storeName: 'histories',
      maxHistory: 10000, //全局最大历史记录数
    },
    mockNodeVariableCache: {
      dbName: 'mockNodeVariableCache',
      version: 1,
      storeName: 'mockVariables',
      projectIdIndex: 'projectId'
    },
    mockNodeLogsCache: {
      dbName: 'mockNodeLogsCache',
      version: 1,
      storeName: 'logs',
      maxLogsPerNode: 1000
    },
    agentViewMessageCache: {
      dbName: 'agentViewMessageCache',
      version: 1,
      storeName: 'messages'
    },
    projectCache: {
      dbName: 'projectCache',
      version: 1,
      storeName: 'projects'
    },
    apiNodesCache: {
      dbName: 'apiNodesCache',
      version: 1,
      storeName: 'httpNodeList',
      projectIdIndex: 'projectId'
    },
    commonHeadersCache: {
      dbName: 'commonHeadersCache',
      version: 1,
      storeName: 'commonHeaders'
    },

    variablesCache: {
      dbName: 'variablesCache',
      version: 1,
      storeName: 'variables',
      projectIdIndex: 'projectId'
    }
  }
}
