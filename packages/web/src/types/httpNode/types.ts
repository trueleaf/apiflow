// ============================================================================
// HTTP节点基础类型定义
// 包含所有HTTP节点相关的枚举、接口和类型定义
// ============================================================================

import type { Method } from "got";

/*
|--------------------------------------------------------------------------
| 通用类型
|--------------------------------------------------------------------------
*/

/**
 * 接口基础类型
 */
export type ApidocType = 'folder' | 'http' | 'httpMock' | 'markdown' | 'websocket';

/**
 * 接口基础信息
 */
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
   * 删除人
   */
  deletePerson: string;
};

/*
|--------------------------------------------------------------------------
| HttpNode 属性和参数类型
|--------------------------------------------------------------------------
*/

// http请求方法 https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods
export type HttpNodeRequestMethod = Method

// 接口文档相关类型声明
export type HttpNodePropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'file';

/**
 * 接口参数信息
 */
export type ApidocProperty<T extends HttpNodePropertyType = HttpNodePropertyType> = {
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
   * 备注
   */
  description: string;
  /**
   * 是否选中(选中数据会随请求一起发送)
   */
  select: boolean;
  /**
   * 文件变量类型，可以是变量也可以是直接选择文件
   */
  fileValueType?: 'var' | 'file';
  /**
   * 标记值是否存储为临时文件（大值粘贴时自动转换）
   */
  _isTempFile?: boolean;
  /**
   * 原始数据大小（字节）
   */
  _originalSize?: number;
  children?: ApidocProperty[];
  nodeId?: string; //公共请求头会用到
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

// api文档ContentType
export type HttpNodeContentType =
  | ''
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'text/javascript'
  | 'multipart/form-data'
  | 'text/plain'
  | 'application/xml'
  | 'application/octet-stream'
  | 'text/html';

export type HttpNodeResponseContentType =
  | HttpNodeContentType
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
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'audio/webm'
  | 'video/webm'
  | 'audio/ogg'
  | 'video/ogg'
  | 'application/ogg';

export type HttpNodeBodyMode =
  | 'json'
  | 'raw'
  | 'formdata'
  | 'urlencoded'
  | 'binary'
  | 'none';

export type HttpNodeTabName =
  | 'SParams'
  | 'SRequestBody'
  | 'SRequestHeaders'
  | 'SResponseParams'
  | 'SPreRequest'
  | 'SAfterRequest'
  | 'SRemarks'
  | 'SSettings';

export type HttpNodeBodyRawType =
  | 'application/xml'
  | 'text/javascript'
  | 'text/plain'
  | 'text/html';

// 文档请求允许传参方式
export type HttpNodeRequestParamTypes = (
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

// api文档请求body
export type HttpNodeBodyParams = {
  /**
   * 模式，对应相关的content-type值
   * json类型、formdata类型、urlencoded类型、binary类型需要单独处理，其余均为字符串(特殊类型可以做一些客户端校验，但本质上都是字符串)
   */
  mode: HttpNodeBodyMode;
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
    dataType: HttpNodeBodyRawType;
  };
  /**
   * binary类型参数
   */
  binary: {
    mode: 'var' | 'file',
    varValue: string;
    binaryValue: {
      path: string;
      raw: string;
      id: string;
    };
  };
};

// api文档返回参数
export type HttpNodeResponseParams = {
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
    dataType: HttpNodeResponseContentType;
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
};

/*
|--------------------------------------------------------------------------
| 变量相关
|--------------------------------------------------------------------------
*/

export type ApidocVariable = {
  /**
   * 变量id
   */
  _id: string;
  /**
   * 项目id
   */
  projectId: string,
  /**
   * 变量名称
   */
  name: string,
  /**
   * 变量值
   */
  value: string,
  /**
   * 变量类型
   */
  type: 'string' | 'number' | 'boolean' | 'null' | 'any' | 'file',
  /**
   * 文件值
   */
  fileValue: {
    /**
     * 文件名称
     */
    name: string,
    /**
     * 文件路径
     */
    path: string,
    /**
     * 文件类型
     */
    fileType: string,
  }
};

/*
|--------------------------------------------------------------------------
| AST和操作相关
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
  line: number;
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
   * 备注
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

export type ApidocOperationDeleteInfo = {
  /**
   * 节点类型
   */
  type: 'folder' | 'doc';
  /**
   * 节点名称
   */
  nodeName: string;
  /**
   * 节点id
   */
  nodeId: string;
  /**
   * 请求方法
   */
  method: HttpNodeRequestMethod;
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
    method?: HttpNodeRequestMethod;
    /**
     * 请求url
     */
    url?: string;
    /**
     * 节点快照
     */
    nodeSnapshot?: import('./httpNode').HttpNode['item'];
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
  | 'export';
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

// 工具栏操作
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
  | 'commonHeader'
  | 'variable'
  | 'cookies';
