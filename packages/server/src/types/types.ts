import { User } from '../entity/security/user.js';

/**
 * 全局配置
 */
export type GlobalConfig = {
  //业务参数
  apiflow: {
    /**
     * 项目最大成员数量
     */
    projectMaxMembers: number;
    /**
     * 允许创建最大团队数
     */
    canManagedGroupNum: number;
  };
  //jwt相关配置
  jwtConfig: {
    /**
     * 私钥
     */
    secretOrPrivateKey: string;
    /**
     * 过期时间
     */
    expiresIn: number;
  };
  permission: {
    /**
     * 接口白名单，不需要权限验证
     */
    whiteList: string[];
    /**
     * free模式无权限验证(互联网环境不安全!!!)
     */
    isFree: boolean;
  };
  security: {
    /**
     * 是否严格限制密码格式
     */
    strictPassword: boolean;
    /**
     * 初始化&新增用户默认密码
     */
    defaultUserPassword: string;
  };
  /**
   * 分页相关配置
   */
  pagination: {
    /**
     * 没页最大显示数量
     */
    max: number;
  };
  signConfig: {
    ttl: number
  }
  /**
   * 限流相关配置
   */
  rateLimitConfig: {
    /**
     * 全局最大请求次数阈值，超过此阈值将触发1天禁用
     */
    globalMaxRequests: number;
    /**
     * 禁用时长（毫秒）
     */
    banDuration: number;
    /**
     * 是否启用全局限制功能
     */
    enableGlobalLimit: boolean;
  }
};

/**
 * 用户信息，登录以后塞入token里面
 */
export type LoginTokenInfo = {
  id: string;
  roleIds: User['roleIds'];
  loginName: User['loginName'];
  role: 'user' | 'admin';
  token: string;
};

export type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'OPTIONS'
  | 'PATCH'
  | 'HEAD'
  | 'CONNECTION'
  | 'TRACE';

/**
 * 文档类型枚举
 */
export enum DocType {
  FOLDER = 'folder',
  HTTP = 'http',
  HTTP_MOCK = 'httpMock',
  WEBSOCKET = 'websocket',
  WEBSOCKET_MOCK = 'websocketMock',
  MARKDOWN = 'markdown'
}

/**
 * 文档类型字面量类型
 */
export type DocTypeString =
  | 'folder'
  | 'http'
  | 'httpMock'
  | 'websocket'
  | 'websocketMock'
  | 'markdown';

export enum StorageService {
  LOCAL = 'local',
  OSS = 'oss',
}
export type OssConfig = {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;
  bucket: string;
  region: string;
}
export type UploadConfig = {
  storageService: 'oss' | 'local',
  dir: string;
  shareRange: ('project' | 'group' | 'user')[],// 项目分享范围
  fileSize: number,// 针对单个项目上传文件大小限制
}

export type ReqLimit = {
  max: number;
  ttl: number;
  limitBy?: 'user' | 'ip',
  //从requestBody中取某个字段作为额外key，与limitBy共同限制请求频率，例如：limitBy: 'ip', limitExtraKey: 'loginName'，代表一个ip地址一个loginName的请求频率
  limitExtraKey?: string;
  errorMsg?: string;
  /**
   * 是否启用全局限制功能（继承全局配置）
   */
  enableGlobalLimit?: boolean;
}
