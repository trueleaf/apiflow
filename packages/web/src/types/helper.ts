import type { HttpNodeResponseContentType } from './httpNode/types';
import type { JsonData } from './common';

/**
 * URL 信息类型
 */
export type UrlInfo = {
  host: string;
  path: string;
  url: string;
}

/**
 * HTTP 节点返回参数类型
 */
export type HttpNodeResponseData = {
  // 标题描述
  title: string;
  // 状态码
  statusCode: number;
  // contentType
  dataType: HttpNodeResponseContentType;
  // json值
  json?: JsonData;
}

/**
 * 树节点类型
 */
export type TreeNode<T> = {
  children: T[];
}
