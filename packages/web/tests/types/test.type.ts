import { type Page, type ElectronApplication } from '@playwright/test';

// ==================== 页面相关类型 ====================

/**
 * Header 和 Content 页面组合
 */
export type HeaderAndContentPages = {
  headerPage: Page;
  contentPage: Page;
};

// ==================== 项目相关类型 ====================

/**
 * 项目数据
 */
export interface ProjectData {
  _id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 项目信息
 */
export type ProjectInfo = {
  name: string;
  id?: string;
};

/**
 * 创建项目选项
 */
export type CreateProjectOptions = {
  waitForBanner?: boolean;
  timeout?: number;
};

// ==================== 节点相关类型 ====================

/**
 * 节点数据
 */
export interface NodeData {
  _id: string;
  name: string;
  type: 'http' | 'httpMock' | 'websocket' | 'folder';
  pid?: string;
  children?: NodeData[];
}

/**
 * Mock 节点配置
 */
export interface MockNodeConfig {
  port: number;
  url: string;
  methods: string[];
  dataType: 'json' | 'text' | 'image' | 'file' | 'binary' | 'sse';
  responseData?: any;
}

/**
 * Mock 节点数据
 */
export interface MockNodeData {
  _id: string;
  name: string;
  type: 'httpMock';
  pid: string; // project id
  config: {
    port: number;
    url: string;
    methods: string[];
  };
  response: Array<{
    name: string;
    statusCode: number;
    dataType: string;
    jsonConfig?: any;
    textConfig?: any;
    imageConfig?: any;
    sseConfig?: any;
  }>;
}

/**
 * 节点类型
 */
export type NodeType = 'http' | 'websocket' | 'httpMock' | 'folder';

/**
 * 创建节点选项
 */
export type CreateNodeOptions = {
  name: string;
  type: NodeType;
  pid?: string;
  timeout?: number;
};

/**
 * 创建节点返回结果
 */
export type CreateNodeResult = {
  name: string;
  type: NodeType;
  success: boolean;
};

// ==================== 标签页相关类型 ====================

/**
 * 标签页数据
 */
export interface TabData {
  id: string;
  title: string;
  type: 'http' | 'httpMock' | 'websocket' | 'settings' | 'project';
  network: 'offline' | 'online';
  saved?: boolean;
  fixed?: boolean;
}

// ==================== 全局类型扩展 ====================

import type { ElectronAPI } from '@src/types/main';

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
