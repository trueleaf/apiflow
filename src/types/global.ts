import type { Method } from "got"
/*
|--------------------------------------------------------------------------
| 工具类声明
|--------------------------------------------------------------------------
| 声明1：Response(基础返回类型)
|
*/
//基础返回类型
export type Response<T> = {
  /**
     * 状态码
     */
  code: number;
  /**
     * 登录名称
     */
  msg: string;
  /**
     * 返回数据
     */
  data: T;
};
//表单返回
export type ResponseTable<T> = {
  /**
     * 状态码
     */
  code: number;
  /**
     * 登录名称
     */
  msg: string;
  /**
     * 返回数据
     */
  data: {
    rows: T;
    total: number;
  };
};

/*
|--------------------------------------------------------------------------
| 布局和权限相关声明
|--------------------------------------------------------------------------
| 声明：PermissionMenu(顶部导航菜单)
| 声明：PermissionRoleEnum(角色枚举信息)
| 声明：PermissionUserInfo(用户信息)
| 声明：PermissionUserBaseInfo(用户基本信息)
| 声明：PermissionClientRoute(前端路由列表)
| 声明：PermissionServerRoute(后端路由列表)
| 声明：PermissionClientMenu(前端菜单)
|
*/

//顶部导航菜单
export type PermissionMenu = {
  name: string;
  path: string;
};
//角色枚举信息
export type PermissionRoleEnum = { _id: string; roleName: string }[];
//用户信息
export type PermissionUserInfo = {
  /**
     * 用户id
     */
  id: string;
  /**
     * 登录名称
     */
  loginName: string;
  /**
     * 手机号码
     */
  phone: string;
  /**
     * 昵称
     */
  realName: string;
  /**
     * 角色id列表
     */
  roleIds: string[];
};
//用户基本信息
export type PermissionUserBaseInfo = {
  /**
     * 登录名称
     */
  loginName: string;
  /**
     * 昵称
     */
  realName: string;
  /**
     * 用户id
     */
  userId: string;
};
//前端路由列表
export type PermissionClientRoute = {
  /**
     * 分组名称
     */
  groupName: string;
  /**
     * 路由名称
     */
  name: string;
  /**
     * 路径
     */
  path: string;
  /**
     * 路由id
     */
  _id: string;
};
//后端路由列表
export type PermissionServerRoute = {
  /**
     * 分组名称
     */
  groupName: string;
  /**
     * 路由名称
     */
  name: string;
  /**
     * 路径
     */
  path: string;
  /**
     * 路由id
     */
  _id: string;
};
//客户端菜单
export type PermissionClientMenu = {
  id?: string;
  /**
     * 菜单id
     */
  _id: string;
  /**
     * 菜单名称
     */
  name: string;
  /**
     * 菜单路径
     */
  path: string;
  /**
     * 菜单父元素id
     */
  pid: string;
  /**
     * 菜单排序
     */
  sort: number;
  /**
     * 菜单类型，inline:内联菜单  link:外链跳转
     */
  type: 'inline' | 'link';
  /**
     * 子菜单
     */
  children: PermissionClientMenu[] | [];
};
/*
|--------------------------------------------------------------------------
| 项目列表相关声明(Apidoc)
|--------------------------------------------------------------------------
| 声明：ApidocHttpRequestMethod(http请求方法)
| 声明：ApidocProjectPermission(项目权限枚举)
| 声明：ApidocProjectMemberInfo(项目成员基本信息)
| 声明：ApidocProjectInfo(项目成员基本信息)
| 声明：ApidocProjectEnum(项目枚举信息)
| 声明：ApidocProjectListInfo(项目列表信息)
| 声明：ApidocPropertyType(接口文档相关类型声明)
| 声明：ApidocParamsType(文档参数类型)
| 声明：ApidocProperty(接口参数信息)
| 声明：ApidocBanner(文档banner信息)
|
*/
//http请求方法 https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods
export type ApidocHttpRequestMethod = Method

//项目枚举信息
export type ApidocProjectEnum = {
  projectName: string;
  _id: string;
};
//项目权限枚举
export type ApidocProjectPermission = 'readAndWrite' | 'readOnly' | 'admin';
//项目成员基本信息
export type ApidocProjectMemberInfo = {
  /**
     * 登录名称
     */
  loginName: string;
  /**
     * 用户权限 "readAndWrite" | "readOnly" | "admin"
     */
  permission: ApidocProjectPermission;
  /**
     * 昵称
     */
  realName: string;
  /**
     * 用户id
     */
  userId: string;
};
//项目成员基本信息
export type ApidocProjectInfo = {
  /**
     * 项目id
     */
  _id: string;
  /**
     * 项目接口数量
     */
  docNum: number;
  /**
     * 项目创建者
     */
  owner: {
    id: string;
    name: string;
  };
  /**
     * 项目成员信息
     */
  members: ApidocProjectMemberInfo[];
  /**
     * 项目名称
     */
  projectName: string;
  /**
     * 备注
     */
  remark: string;
  /**
     * 最近一次更新日期
     */
  updatedAt: string;
  /**
     * 是否被收藏
     */
  isStared: boolean;
};
//项目列表信息
export type ApidocProjectListInfo = {
  /**
     * 项目列表
     */
  list: ApidocProjectInfo[];
  /**
     * 最近访问项目ids
     */
  recentVisitProjects: string[];
  /**
     * 用户star的项目ids
     */
  starProjects: string[];
};
//接口文档相关类型声明
export type ApidocPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'file';
//文档参数类型
export type ApidocParamsType =
  | 'pathParams'
  | 'queryParams'
  | 'bodyParams'
  | 'responseParams'
  | 'headerParams';
//接口参数信息， header pathParams queryParams bodyParams
export type ApidocProperty<T extends ApidocPropertyType = ApidocPropertyType> = {
  /**
     * 参数id
     */
  _id: string;
  /**
     * 字段名称(键)
     */
  key: string;
  /**
     * 字段值
     */
  value: string;
  /**
     * 字段类型
     */
  type: T;
  /**
     * 是否必填
     */
  required: boolean;
  /**
     * 备注信息
     */
  description: string;
  /**
    * 是否选中(选中数据会随请求一起发送)
    */
  select: boolean;
   /**
    * 文件变量类型，可以是变量也可以是直接选择文件
    */
  fileValueType: 'var' | 'file';
  children?: ApidocProperty[];
  _error?: string;
  _disableSelect?: boolean;
  _disableKey?: boolean;
  _disableKeyTip?: string;
  _disableValue?: boolean;
  _disableValueTip?: string;
  _disableDescription?: boolean;
  _disableDescriptionTip?: string;
  _disableAdd?: boolean;
  _disableAddTip?: string;
  _disableDelete?: boolean;
  _disableDeleteTip?: string;
  _valuePlaceholder?: string;
  _keyPlaceholder?: string;
  disabled?: boolean; //是否禁止checkbox
};
//联想参数
export type ApidocMindParam = ApidocProperty & {
  paramsPosition: 'paths' | 'queryParams' | 'requestBody' | 'responseParams';
  projectId: string;
};
//=========================================================================//
//=========================================================================//
//=========================================================================//
//文档基础信息
export type ApidocType = 'folder' | 'api' | 'markdown';
export type ApidocBaseInfo = {
  /**
     * 文档名称
     */
  name: string;
  /**
     * 文档描述
     */
  description: string;
  /**
     * 版本信息
     */
  version: string;
  /**
     * 文档类型
     */
  type: ApidocType;
  /**
     * 创建者
     */
  creator: string;
  /**
     * 维护人员
     */
  maintainer: string;
  /**
     * 花费时间
     */
  spendTime: number;
};
//api文档ContentType
export type ApidocContentType =
  | ''
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'text/javascript'
  | 'multipart/form-data'
  | 'text/plain'
  | 'application/xml'
  | 'text/html';
// eslint-disable-next-line max-len
export type ApidocResponseContentType =
  | ApidocContentType
  | 'application/xml'
  | 'application/json'
  | 'text/html'
  | 'text/csv'
  | 'image/png'
  | 'application/pdf'
  | 'application/octet-stream'
  | 'text/plain'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'text/plain'
  | 'text/css'
  | 'text/javascript'
  | 'image/gif'
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'audio/webm'
  | 'video/webm'
  | 'audio/ogg'
  | 'video/ogg'
  | 'application/ogg';
export type ApidocBodyMode =
  | 'json'
  | 'raw'
  | 'formdata'
  | 'urlencoded'
  | 'binary'
  | 'none';
export type ApidocBodyRawType =
  | 'application/xml'
  | 'text/javascript'
  | 'text/plain'
  | 'text/html'
  | 'application/json';
//文档请求允许传参方式
export type ApidocRequestParamTypes = (
  | 'path'
  | 'params'
  | 'json'
  | 'x-www-form-urlencoded'
  | 'formData'
  | 'text/javascript'
  | 'text/plain'
  | 'text/html'
  | 'application/xml'
)[];
//api文档请求body
export type ApidocBodyParams = {
  /**
     * 模式，对应相关的content-type值
     * json类型、formdata类型、urlencoded类型、binary类型需要单独处理，其余均为字符串(特殊类型可以做一些客户端校验，但本质上都是字符串)
     */
  mode: ApidocBodyMode;
  /**
     * 原始json值
     */
  rawJson: string;
  /**
     * formData类型参数
     */
  formdata: ApidocProperty<'string' | 'file'>[];
  /**
     * urlencoded类型参数
     */
  urlencoded: ApidocProperty<'string'>[];
  /**
     * raw类型参数
     */
  raw: {
    data: string;
    dataType: ApidocBodyRawType;
  };
  /**
     * file类型参数
     */
  file: {
    url: string;
    raw: string;
  };
};
//api文档返回参数
export type ApidocResponseParams = {
  /**
     * id
     */
  _id?: string;
  /**
     * 返回参数表述
     */
  title: string;
  /**
     * 状态码
     */
  statusCode: number;
  /**
     * 返回值
     */
  value: {
    /**
         * 返回参数类型
         */
    dataType: ApidocResponseContentType;
    /**
         * 字符串json数据
         */
    strJson: string,
    /**
         * 文本类型返回数据
         */
    text: string;
    /**
         * 文件类型返回数据
         */
    file: {
      /**
             * 转换为可访问本地路径
             */
      url: string;
      /**
             * 原始值
             */
      raw: string;
    };
  };
  /**
     * 是否mock
     */
  isMock?: boolean;
};
//完整文档信息
export type ApidocDetail = {
  /**
     * 当前文档id
     */
  _id: string;
  /**
     * 父元素id
     */
  pid: string;
  /**
     * 项目id
     */
  projectId: string;
  /**
     * 是否为文件夹
     */
  isFolder: boolean;
  /**
     * 排序
     */
  sort: number;
  /**
     * 基本信息
     */
  info: ApidocBaseInfo;
  /**
     * 接口信息
     */
  item: {
    /**
         * 请求方法
         */
    method: ApidocHttpRequestMethod;
    /**
         * 请求地址
         */
    url: {
      /**
             * 接口前缀
             */
      host: string;
      /**
             * 请求路径
             */
      path: string;
    };
    /**
         * restful请求路径
         */
    paths: ApidocProperty<'string'>[];
    /**
         * 查询字符串
         */
    queryParams: ApidocProperty<'string'>[];
    /**
         * 请求body
         */
    requestBody: ApidocBodyParams;
    /**
         * 返回参数
         */
    responseParams: ApidocResponseParams[];
    /**
         * 请求头
         */
    headers: ApidocProperty<'string'>[];
    /**
         * ContentType类型
         */
    contentType: ApidocContentType;
  };
  /**
     * 公共请求头
     */
  commonHeaders?: {
    /**
         * 请求头名称
         */
    key: string;
    /**
         * 请求头值
         */
    value: string;
    /**
         * 请求头描述
         */
    description: string;
  }[];
  /**
     * 前置脚本
     */
  preRequest: {
    raw: string;
  };
  /**
     * 后置脚本
     */
  afterRequest: {
    raw: string;
  };
  /**
     * 创建时间
     */
  createdAt?: string;
  /**
     * 更新时间
     */
  updatedAt?: string;
  mockInfo: {
    /**
         * mock地址
         */
    path: string,
    /**
         * http状态码
         */
    httpStatusCode: number;
    /**
         * 返回延时
         */
    responseDelay: number;
    /**
         * 返回数据类型
         */
    responseType: 'json' | 'image' | 'file' | 'text' | 'customJson';
    /**
         * 自定义返回头
         */
    responseHeaders: ApidocProperty<'string'>[];
    /**
         * json数据信息
         */
    json: string;
    /**
         * 图片相关信息
         */
    image: {
      /**
             * 图片类型
             */
      type: 'png' | 'jpg' | 'gif' | 'svg';
      /**
             * 图片宽度
             */
      width: number;
      /**
             * 图片高度
             */
      height: number;
      /**
             * 图片大小
             */
      size: number;
      /**
             * 文字大小
             */
      fontSize: number;
      /**
             * 文字颜色
             */
      color: string;
      /**
             * 背景颜色
             */
      backgroundColor: string;
    };
    /**
         * 文件相关数据
         */
    file: {
      /**
             * 文件类型
             */
      type: 'doc' | 'docx' | 'xls' | 'xlsx' | 'pdf' | 'zip' | 'custom';
      /**
             * 文件地址
             */
      filePath: string;
    };
    /**
         * 纯文本，html，css等
         */
    text: string;
    /**
         * 自定义json返回
         */
    customResponseScript: string;
  };
};

//=========================================================================//
//=========================================================================//
//=========================================================================//
//文档banner信息
export type ApidocBanner = {
  /**
     * 文档id
     */
  _id: string;
  /**
     * 最近一次更新日期
     */
  updatedAt: string;
  /**
     * 文档类型
     */
  type: 'folder' | 'api' | 'markdown';
  /**
     * 排序值
     */
  sort: number;
  /**
     * 父元素id
     */
  pid: string;
  /**
     * 名称
     */
  name: string;
  /**
     * 是否为文件夹
     */
  isFolder: boolean;
  /**
     * 更新人
     */
  maintainer: string;
  /**
     * 请求方法
     */
  method: ApidocHttpRequestMethod;
  /**
     * 请求url
     */
  url?: string;
  /**
     * 公共请求头
     */
  commonHeaders?: {
    key: string;
    value: string;
    description: string;
  }[];
  /**
     * 是否只读
     */
  readonly: boolean;
  /**
     * 子节点
     */
  children: ApidocBanner[];
};
//工具栏操作
export type ApidocOperations =
  | 'addRootFolder'
  | 'addRootFile'
  | 'freshBanner'
  | 'generateLink'
  | 'recycler'
  | 'viewDoc'
  | 'exportDoc'
  | 'importDoc'
  | 'history'
  | 'config'
  | 'hook'
  | 'commonHeader'
  | 'apiflow';

/*
|--------------------------------------------------------------------------
| 数组类型参数数据转换为json预览格式
|--------------------------------------------------------------------------
*/
export type ApidocASTInfo = {
  /**
     * id值
     */
  id: string;
  /**
     * 缩进
     */
  indent: number;
  /**
     * 行号
     */
  line: number; //行号
  /**
     * 键
     */
  path: {
    /**
         * 键对应的值
         */
    value: string;
    /**
         * 键是否存在双引号
         */
    widthQuote: boolean;
  };
  /**
     * 值
     */
  value: string;
  /**
     * 值类型
     */
  valueType: string;
  /**
     * 冒号
     */
  colon: string;
  /**
     * 逗号
     */
  comma: string;
  /**
     * 备注信息
     */
  description: string;
  /**
     * 是否必填
     */
  required: boolean;
  /**
     * 左花括号
     */
  leftCurlBrace: {
    /**
         * 与之相匹配的另一个括号id
         */
    pairId: string;
    /**
         * 值
         */
    value: string;
  };
  /**
     * 右花括号
     */
  rightCurlBrace: {
    /**
         * 与之相匹配的另一个括号id
         */
    pairId: string;
    /**
         * 值
         */
    value: string;
  };
  /**
     * 左中括号
     */
  leftBracket: {
    /**
         * 与之相匹配的另一个括号id
         */
    pairId: string;
    value: string;
  };
  /**
     * 右中括号
     */
  rightBracket: {
    /**
         * 与之相匹配的另一个括号id
         */
    pairId: string;
    value: string;
  };
  _hidden?: boolean;
  _close?: boolean;
};

/*
|--------------------------------------------------------------------------
| api文档变量
|--------------------------------------------------------------------------
*/
export type ApidocVariable = {
   _id?: string;
   projectId: string,
   name: string,
   value: string,
   type: 'string' | 'number' | 'boolean' | 'null' | 'any' | 'file',
   fileValue: {
     name: string,
     path: string,
     fileType: string,
   }
};

/*
|--------------------------------------------------------------------------
| api文档操作记录
|--------------------------------------------------------------------------
*/
export type ApidocOperationDeleteInfo = {
  /**
     * 节点名称
     */
  nodeName: string;
  /**
     * 节点id
     */
  nodeId: string;
  /**
     * 是否为文件夹
     */
  isFolder: boolean;
  /**
     * 请求方法
     */
  method: ApidocHttpRequestMethod;
  /**
     * 请求url
     */
  url: string;
};
export type ApidocOperationRecord = {
  /**
     * 项目id
     */
  projectId: string;
  /**
     * 变量类型
     */
  recordInfo: {
    /**
         * 节点id
         */
    nodeId?: string;
    /**
         * 节点名称
         */
    nodeName?: string;
    /**
         * 请求方法
         */
    method?: ApidocHttpRequestMethod;
    /**
         * 请求url
         */
    url?: string;
    /**
         * 节点快照
         */
    nodeSnapshot?: ApidocDetail['item'];
    /**
         * 拖拽到的节点id
         */
    dropNodeId?: string;
    /**
         * 拖拽到的节点名称
         */
    dropNodeName?: 'before' | 'after' | 'inner';
    /**
         * 拖拽方式
         */
    dropType?: string;
    /**
         * 原始节点名称
         */
    orginNodeName?: string;
    /**
         * 被删除节点信息
         */
    deleteNodes: ApidocOperationDeleteInfo[];
    /**
         * 导出类型
         */
    exportType?: string;
    /**
         * 导入文档数量
         */
    importNum?: string;
    /**
         * 是否是覆盖导入
         */
    importIsCover?: string;
  };
  /**
     * 操作类型
     */
  operation:
  | 'addFolder'
  | 'addDoc'
  | 'copyDoc'
  | 'copyFolder'
  | 'deleteFolder'
  | 'deleteDoc'
  | 'deleteMany'
  | 'editDoc'
  | 'position'
  | 'rename'
  | 'import'
  | 'export'
  | 'addServer'
  | 'deleteServer'
  | 'editServer';
  /**
     * 操作者
     */
  operator: string;
  /**
     * 操作者id
     */
  operatorId: string;
  /**
     * 创建日期
     */
  createdAt: string;
};

/*
|--------------------------------------------------------------------------
| mock相关
|--------------------------------------------------------------------------
*/
//mock项目
export type MockItem = {
  name: string;
  value: string;
  tags: string[];
};
/*
|--------------------------------------------------------------------------
| 全局配置信息
|--------------------------------------------------------------------------
*/
//全局配置信息
export type GlobalConfig = {
  /**
     * 工具标题
     */
  title: string;
  /**
     * 版本信息
     */
  version: string;
  /**
     * 是否打印欢迎信息
     */
  consoleWelcome: boolean;
  /**
     * 是否允许用户注册
     */
  enableRegister: boolean;
  /**
     * 是否允许来宾用户访问
     */
  enableGuest: boolean;
  /**
     * 是否允许显示文档链接
     */
  enableDocLink: boolean;
  /**
     * 分享url
     */
  shareUrl: string;
  /**
     * 是否开启自动更新
     */
  autoUpdate: boolean;
  /**
     * 客户端更新地址
     */
  updateUrl: string;
};
/*
|--------------------------------------------------------------------------
| i18n相关
|--------------------------------------------------------------------------
*/
export type Language = 'zh-cn' | 'zh-tw' | 'en' | 'ja';

/*
|--------------------------------------------------------------------------
| 生成代码
|--------------------------------------------------------------------------
*/
export type ApidocCodeInfo = {
  /**
     * 源码
     */
  code: string;
  /**
     * 代码名称
     */
  codeName: string;
  /**
     * 创建者
     */
  creator: string;
  /**
     * 是否共享
     */
  isPublic: boolean;
  /**
     * 项目id
     */
  projectId: string;
  /**
     * 备注
     */
  remark: string;
  /**
     * 更新时间
     */
  updatedAt: string;
  /**
     * id值
     */
  _id: string;
};


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