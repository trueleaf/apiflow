// ============================================================================
// 工作台UI层类型
// 包含 Banner、标签页、缓存等视图层类型
// ============================================================================

import type { Method } from "got";

// ============================================================================
// Banner 类型（API文档树节点显示）
// ============================================================================

export type ApidocBannerOfHttpNode = {
  _id: string;
  updatedAt: string;
  type: 'http';
  sort: number;
  pid: string;
  name: string;
  maintainer: string;
  method: Method;
  url: string;
  readonly: boolean;
  children: ApidocBanner[];
}

export type ApidocBannerOfHttpMockNode = {
  _id: string;
  updatedAt: string;
  type: 'httpMock';
  sort: number;
  pid: string;
  name: string;
  maintainer: string;
  method: Method | 'ALL';
  url: string;
  port: number;
  readonly: boolean;
  state: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  children: ApidocBanner[];
}

export type ApidocBannerOfWebsocketNode = {
  _id: string;
  updatedAt: string;
  type: 'websocket';
  sort: number;
  pid: string;
  name: string;
  maintainer: string;
  protocol: 'ws' | 'wss';
  url: {
    path: string;
    prefix: string;
  };
  readonly: boolean;
  children: ApidocBanner[];
}

export type ApidocBannerOfFolderNode = {
  _id: string;
  updatedAt: string;
  type: 'folder';
  sort: number;
  pid: string;
  name: string;
  maintainer: string;
  commonHeaders: {
    key: string;
    value: string;
    description: string;
  }[];
  readonly: boolean;
  children: ApidocBanner[];
}

export type ApidocBannerOfFolderMarkdown = {
  _id: string;
  updatedAt: string;
  type: 'markdown';
  sort: number;
  pid: string;
  name: string;
  maintainer: string;
  readonly: boolean;
  children: ApidocBanner[];
}

export type ApidocBanner = ApidocBannerOfHttpNode | ApidocBannerOfHttpMockNode | ApidocBannerOfWebsocketNode | ApidocBannerOfFolderNode | ApidocBannerOfFolderMarkdown;
