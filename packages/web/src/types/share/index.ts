// ============================================================================
// 分享相关类型
// 项目分享、本地分享数据
// ============================================================================

import type { ApiNode, ApidocVariable } from '../httpNode';

// 共享项目信息
export type SharedProjectInfo = {
  projectName: string;
  shareName: string;
  expire: number | null;
  needPassword: boolean;
}

// 本地分享数据
export type LocalShareData = {
  projectInfo: {
    projectName: string;
    projectId: string;
  },
  nodes: ApiNode[],
  variables: ApidocVariable[],
}
