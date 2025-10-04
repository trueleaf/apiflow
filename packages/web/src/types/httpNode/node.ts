// ============================================================================
// HTTP节点核心类型
// 包含 HttpNode, FolderNode, ApiNode 等核心节点定义
// ============================================================================

import type { WebSocketNode } from "../websocketNode";
import type { MockHttpNode } from "../mockNode";

// 从其他 httpNode 子模块导入
import type { 
  ApidocBaseInfo,
  ApidocProperty,
  HttpNodeRequestMethod,
  HttpNodeBodyParams,
  HttpNodeResponseParams,
  HttpNodeContentType
} from './types';

/*
|--------------------------------------------------------------------------
| 核心节点类型
|   HttpNode
|   WebsocketNode
|   FolderNode
|  
|--------------------------------------------------------------------------
*/
export type ApiNode = HttpNode | WebSocketNode | MockHttpNode | FolderNode;

export type HttpNode = {
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
    method: HttpNodeRequestMethod;
    /**
     * 请求地址
     */
    url: {
      /**
       * 接口前缀
       */
      prefix: string;
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
    requestBody: HttpNodeBodyParams;
    /**
     * 返回参数
     */
    responseParams: HttpNodeResponseParams[];
    /**
     * 请求头
     */
    headers: ApidocProperty<'string'>[];
    /**
     * ContentType类型
     */
    contentType: HttpNodeContentType;
  };
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
  createdAt: string;
  /**
   * 更新时间
   */
  updatedAt: string;
  isDeleted: boolean;
};

export type FolderNode = {
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
   * 排序
   */
  sort: number;
  /**
   * 基本信息
   */
  info: ApidocBaseInfo;
  /**
   * 公共请求头
   */
  commonHeaders: {
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
   * 创建时间
   */
  createdAt: string;
  /**
   * 更新时间
   */
  updatedAt: string;
  /**
   * 是否被删除
   */
  isDeleted: boolean;
};
