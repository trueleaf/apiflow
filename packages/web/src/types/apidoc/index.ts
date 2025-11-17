// API文档相关类型统一导出
export * from './cache';
export * from './request';
export * from './tabs';
import type { HttpNode } from '../httpNode/httpNode';
import type { ApidocVariable } from '../httpNode/types';
// 本地分享数据类型
export type LocalShareData = {
  projectInfo: {
    projectName: string;
    projectId: string;
  };
  nodes: HttpNode[];
  variables: ApidocVariable[];
}
// 分享项目信息类型
export type SharedProjectInfo = {
  projectName: string;
  shareName: string;
  expire: number | null;
  needPassword: boolean;
}
