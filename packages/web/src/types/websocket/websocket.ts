import { ApidocBaseInfo, ApidocProperty } from "../types.ts";


export type WebSocketNode = {
  /**
   * 当前节点d
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
     * 协议
     */
    protocol: 'ws' | 'wss';
    /**
     * 请求地址
     */
    url: {
      path: string; 
      prefix: string;
    };
    /**
     * 请求参数
     */
    queryParams: ApidocProperty<'string'>[];
    /**
     * 请求头
     */
    headers: ApidocProperty<'string'>[];
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
  /**
   * 是否被删除
   */
  isDeleted?: boolean;
};
