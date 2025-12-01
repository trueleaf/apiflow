import type { ApidocType } from "./httpNode/types";

// 高级搜索条件类型
export type AdvancedSearchConditions = {
  basicInfo: {
    projectName: string;
    docName: string;
    url: string;
    creator: string;
    maintainer: string;
    method: string;
    remark: string;
  };
  nodeTypes: {
    folder: boolean;
    http: boolean;
    websocket: boolean;
    httpMock: boolean;
  };
  requestParams: {
    query: string;
    path: string;
    headers: string;
    body: string;
    response: string;
    preScript: string;
    afterScript: string;
    wsMessage: string;
  };
  dateRange: {
    type: 'all' | 'recent3days' | 'recent1week' | 'recent1month' | 'recent3months' | 'custom';
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
