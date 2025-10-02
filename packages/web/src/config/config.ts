import { Config } from '@/../types/types';
import { mainConfig } from './mainConfig';
const isDev = process.env.NODE_ENV === 'development';

export const config: Config = {
  isDev,
  //更新相关配置
  updateConfig: {
    url: 'http://xxx.xxx.cn/electron/windows', //更新服务器地址
    autoUpdate: false, //是否开启自动更新
  },
  //渲染进程配置
  renderConfig: {
    //布局相关
    layout: {
      size: 'default', //项目中组件库大小
    },
    //权限相关
    permission: {
      free: false,
      whiteList: ['/', '/test', '/login', '/share'],
    },
    //http请求相关
    httpRequest: {
      url: isDev ? 'http://127.0.0.1:7001' : 'https://online.jobtool.cn',
      imgUrl: isDev ? 'http://happymoyu.oss-cn-beijing.aliyuncs.com' : 'http://happymoyu.oss-cn-beijing.aliyuncs.com',
      timeout: 20000,
      withCredentials: true,
    },
    //全局组件配置
    components: {
      tableConfig: {
        pageSizes: [10, 20, 30, 50, 70, 100], //每页条数
        pageSize: 20, //每页默认显示数量
      },
    },
    //本地数据库配置
    indexedDB: {
      dbName: 'apiflow', //indexedDB名称
      version: 1, //indexedDB版本信息
    },
    //导入文档相关配置
    import: {
      size: 1024 * 1024 * 5, //导入文件大小
    },
    shareUrl: 'https://share.jobtool.cn'
  },
  //主进程配置
  mainConfig,

  //本地部署相关配置
  localization: {
    version: '0.8.0', //当前项目版本
    title: 'Apiflow', //项目名称
  },
  requestTest: {
    responseLogDir: '/responseLog',
    autoSaveResponseLog: false,
    maxLocalResponseLogSize: 1024 * 1024 * 1024 * 10,
    maxLocalWebStorageResponseLogSize: 1024 * 1024 * 100,
    canLogResponsebodyByteLength: 1024 * 1024,
  },
  requestConfig: {
    maxTextBodySize: 1024 * 1024 * 50, //最大可展示文本格式数大小
    maxRawBodySize: 1024 * 1024 * 50, //最大可以显示原始值类型
    userAgent: "https://github.com/trueleaf/apiflow",
    followRedirect: true, //是否允许重定向
    maxRedirects: 10, //最大重定向次数
    maxHeaderValueDisplayLength: 1024,
  },
  cacheConfig: {
    apiflowResponseCache: {
      singleResponseBodySize: 1024 * 1024 * 200, //单个返回值大小
      maxResponseBodySize: 1024 * 1024 * 1024 * 10, //最大可以缓存的返回值大小
      chunkSize: 1024 * 1024 * 5, //分块大小，默认5MB
      dbName: 'apiflowResponseCache',
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
    mockVariableCache: {
      dbName: 'mockVariableCache',
      version: 1,
      storeName: 'mockVariables',
      projectIdIndex: 'projectId'
    }
  },
  standaloneCache: {
    dbName: 'standaloneCache',
    version: 2
  }
}
