import type { ApidocType } from "./httpNode/types";

// 高级搜索条件类型
export type AdvancedSearchConditions = {
  keyword: string;
  searchScope: {
    projectName: boolean;
    docName: boolean;
    url: boolean;
    creator: boolean;
    maintainer: boolean;
    method: boolean;
    remark: boolean;
    folder: boolean;
    http: boolean;
    websocket: boolean;
    httpMock: boolean;
    query: boolean;
    path: boolean;
    headers: boolean;
    body: boolean;
    response: boolean;
    preScript: boolean;
    afterScript: boolean;
    wsMessage: boolean;
  };
  dateRange: {
    type: 'unlimited' | 'recent3days' | 'recent1week' | 'recent1month' | 'recent3months' | 'custom';
    customStart?: string;
    customEnd?: string;
  };
};
// 匹配信息类型
export type MatchInfo = {
  field: string;
  fieldLabel: string;
  value: string;
  keyword: string;
};
// 搜索结果项类型
export type SearchResultItem = {
  nodeId: string;
  projectId: string;
  projectName: string;
  nodeName: string;
  nodeType: ApidocType;
  method?: string;
  url?: string;
  updatedAt: string;
  matches: MatchInfo[];
};
// 分组搜索结果类型
export type GroupedSearchResults = {
  projectId: string;
  projectName: string;
  nodes: SearchResultItem[];
  totalCount: number;
  displayCount: number;
  hasMore: boolean;
};
