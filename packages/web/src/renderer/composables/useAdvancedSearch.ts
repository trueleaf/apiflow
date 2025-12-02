import type {
  AdvancedSearchConditions,
  GroupedSearchResults,
  SearchResultItem,
  MatchInfo
} from '@src/types/advancedSearch';
import type { ApidocProjectInfo, ApiNode, HttpNode, WebSocketNode, HttpMockNode } from '@src/types';
import { projectCache } from '@/cache/project/projectCache';
import { apiNodesCache } from '@/cache/nodes/nodesCache';
// 检查节点类型是否匹配
function checkNodeType(
  nodeType: string,
  searchScope: AdvancedSearchConditions['searchScope']
): boolean {
  if (!searchScope.folder && !searchScope.http && !searchScope.websocket && !searchScope.httpMock) {
    return true;
  }
  switch (nodeType) {
    case 'folder':
      return searchScope.folder;
    case 'http':
      return searchScope.http;
    case 'websocket':
      return searchScope.websocket;
    case 'httpMock':
      return searchScope.httpMock;
    default:
      return false;
  }
}
// 检查日期范围是否匹配
function checkDateRange(
  updatedAt: string,
  dateRange: AdvancedSearchConditions['dateRange']
): boolean {
  if (dateRange.type === 'unlimited') return true;
  const updateTime = new Date(updatedAt).getTime();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  switch (dateRange.type) {
    case 'recent3days':
      return now - updateTime <= 3 * dayMs;
    case 'recent1week':
      return now - updateTime <= 7 * dayMs;
    case 'recent1month':
      return now - updateTime <= 30 * dayMs;
    case 'recent3months':
      return now - updateTime <= 90 * dayMs;
    case 'custom':
      if (!dateRange.customStart || !dateRange.customEnd) return true;
      const start = new Date(dateRange.customStart).getTime();
      const end = new Date(dateRange.customEnd).getTime() + dayMs - 1;
      return updateTime >= start && updateTime <= end;
    default:
      return true;
  }
}
// 创建匹配信息
function createMatchInfo(field: string, fieldLabel: string, value: string, keyword: string): MatchInfo {
  return { field, fieldLabel, value, keyword };
}
// 检查字符串是否匹配关键字
function matchString(value: string | undefined, keyword: string): boolean {
  if (!keyword || !value) return false;
  return value.toLowerCase().includes(keyword.toLowerCase());
}
// 获取节点URL
function getNodeUrl(node: ApiNode): string {
  if (node.info.type === 'http' || node.info.type === 'websocket') {
    const httpOrWsNode = node as HttpNode | WebSocketNode;
    return `${httpOrWsNode.item.url.prefix}${httpOrWsNode.item.url.path}`;
  }
  return '';
}
// 匹配基础信息
function matchBasicInfo(
  node: ApiNode,
  keyword: string,
  searchScope: AdvancedSearchConditions['searchScope'],
  project: ApidocProjectInfo,
  isOffline: boolean
): MatchInfo[] {
  const matches: MatchInfo[] = [];
  if (searchScope.projectName && matchString(project.projectName, keyword)) {
    matches.push(createMatchInfo('projectName', '项目名称', project.projectName, keyword));
  }
  if (searchScope.docName && matchString(node.info.name, keyword)) {
    matches.push(createMatchInfo('docName', '文档名称', node.info.name, keyword));
  }
  if (searchScope.url && (node.info.type === 'http' || node.info.type === 'websocket')) {
    const httpOrWsNode = node as HttpNode | WebSocketNode;
    const url = `${httpOrWsNode.item.url.prefix}${httpOrWsNode.item.url.path}`;
    if (matchString(url, keyword)) {
      matches.push(createMatchInfo('url', '请求URL', url, keyword));
    }
  }
  if (!isOffline && searchScope.creator && matchString(node.info.creator, keyword)) {
    matches.push(createMatchInfo('creator', '创建者', node.info.creator || '', keyword));
  }
  if (!isOffline && searchScope.maintainer && matchString(node.info.maintainer, keyword)) {
    matches.push(createMatchInfo('maintainer', '维护者', node.info.maintainer || '', keyword));
  }
  if (searchScope.method && node.info.type === 'http') {
    const httpNode = node as HttpNode;
    if (matchString(httpNode.item.method, keyword)) {
      matches.push(createMatchInfo('method', '请求方法', httpNode.item.method, keyword));
    }
  }
  if (searchScope.remark && matchString(node.info.description, keyword)) {
    matches.push(createMatchInfo('remark', '备注', node.info.description || '', keyword));
  }
  return matches;
}
// 匹配请求参数
function matchRequestParams(
  node: ApiNode,
  keyword: string,
  searchScope: AdvancedSearchConditions['searchScope']
): MatchInfo[] {
  const matches: MatchInfo[] = [];
  if (node.info.type === 'http') {
    const httpNode = node as HttpNode;
    if (searchScope.query && httpNode.item.queryParams) {
      for (const param of httpNode.item.queryParams) {
        if (matchString(param.key, keyword) ||
            matchString(param.value as string, keyword) ||
            matchString(param.description, keyword)) {
          matches.push(createMatchInfo('query', 'Query参数', `${param.key}=${param.value}`, keyword));
          break;
        }
      }
    }
    if (searchScope.path && httpNode.item.paths) {
      for (const param of httpNode.item.paths) {
        if (matchString(param.key, keyword) ||
            matchString(param.value as string, keyword) ||
            matchString(param.description, keyword)) {
          matches.push(createMatchInfo('path', 'Path参数', `${param.key}=${param.value}`, keyword));
          break;
        }
      }
    }
    if (searchScope.headers && httpNode.item.headers) {
      for (const header of httpNode.item.headers) {
        if (matchString(header.key, keyword) ||
            matchString(header.value as string, keyword) ||
            matchString(header.description, keyword)) {
          matches.push(createMatchInfo('headers', '请求头参数', `${header.key}: ${header.value}`, keyword));
          break;
        }
      }
    }
    if (searchScope.body && httpNode.item.requestBody) {
      const body = httpNode.item.requestBody;
      let bodyStr = '';
      if (body.mode === 'json' && body.rawJson) {
        bodyStr = body.rawJson;
      } else if (body.mode === 'formdata' && body.formdata) {
        bodyStr = body.formdata.map(item => `${item.key}=${item.value}`).join('&');
      } else if (body.mode === 'urlencoded' && body.urlencoded) {
        bodyStr = body.urlencoded.map(item => `${item.key}=${item.value}`).join('&');
      } else if (body.mode === 'raw' && body.raw?.data) {
        bodyStr = body.raw.data;
      }
      if (matchString(bodyStr, keyword)) {
        matches.push(createMatchInfo('body', 'Body参数', bodyStr.substring(0, 100), keyword));
      }
    }
    if (searchScope.response && httpNode.item.responseParams) {
      for (const resp of httpNode.item.responseParams) {
        if (matchString(resp.title, keyword) ||
            matchString(resp.value?.strJson, keyword) ||
            matchString(resp.value?.text, keyword)) {
          matches.push(createMatchInfo('response', '返回参数', resp.title || resp.value?.strJson?.substring(0, 100) || '', keyword));
          break;
        }
      }
    }
    if (searchScope.preScript && matchString(httpNode.preRequest?.raw, keyword)) {
      matches.push(createMatchInfo('preScript', '前置脚本', httpNode.preRequest.raw.substring(0, 100), keyword));
    }
    if (searchScope.afterScript && matchString(httpNode.afterRequest?.raw, keyword)) {
      matches.push(createMatchInfo('afterScript', '后置脚本', httpNode.afterRequest.raw.substring(0, 100), keyword));
    }
  }
  if (node.info.type === 'websocket') {
    const wsNode = node as WebSocketNode;
    if (searchScope.query && wsNode.item.queryParams) {
      for (const param of wsNode.item.queryParams) {
        if (matchString(param.key, keyword) ||
            matchString(param.value as string, keyword) ||
            matchString(param.description, keyword)) {
          matches.push(createMatchInfo('query', 'Query参数', `${param.key}=${param.value}`, keyword));
          break;
        }
      }
    }
    if (searchScope.headers && wsNode.item.headers) {
      for (const header of wsNode.item.headers) {
        if (matchString(header.key, keyword) ||
            matchString(header.value as string, keyword) ||
            matchString(header.description, keyword)) {
          matches.push(createMatchInfo('headers', '请求头参数', `${header.key}: ${header.value}`, keyword));
          break;
        }
      }
    }
    if (searchScope.wsMessage && wsNode.item.messageBlocks) {
      for (const msg of wsNode.item.messageBlocks) {
        if (matchString(msg.name, keyword) ||
            matchString(msg.content, keyword)) {
          matches.push(createMatchInfo('wsMessage', 'WebSocket消息', msg.name || msg.content.substring(0, 100), keyword));
          break;
        }
      }
    }
    if (searchScope.preScript && matchString(wsNode.preRequest?.raw, keyword)) {
      matches.push(createMatchInfo('preScript', '前置脚本', wsNode.preRequest.raw.substring(0, 100), keyword));
    }
    if (searchScope.afterScript && matchString(wsNode.afterRequest?.raw, keyword)) {
      matches.push(createMatchInfo('afterScript', '后置脚本', wsNode.afterRequest.raw.substring(0, 100), keyword));
    }
  }
  if (node.info.type === 'httpMock') {
    const mockNode = node as HttpMockNode;
    if (searchScope.headers && mockNode.response) {
      for (const resp of mockNode.response) {
        if (resp.headers?.defaultHeaders) {
          for (const header of resp.headers.defaultHeaders) {
            if (matchString(header.key, keyword) ||
                matchString(header.value as string, keyword)) {
              matches.push(createMatchInfo('headers', '请求头参数', `${header.key}: ${header.value}`, keyword));
              break;
            }
          }
        }
      }
    }
  }
  return matches;
}
// 匹配节点
function matchNode(
  node: ApiNode,
  conditions: AdvancedSearchConditions,
  project: ApidocProjectInfo,
  isOffline: boolean
): SearchResultItem | null {
  if (!checkNodeType(node.info.type, conditions.searchScope)) {
    return null;
  }
  if (!checkDateRange(node.updatedAt, conditions.dateRange)) {
    return null;
  }
  const matches: MatchInfo[] = [];
  matches.push(...matchBasicInfo(node, conditions.keyword, conditions.searchScope, project, isOffline));
  matches.push(...matchRequestParams(node, conditions.keyword, conditions.searchScope));
  if (matches.length === 0) {
    return null;
  }
  return {
    nodeId: node._id,
    projectId: node.projectId,
    projectName: project.projectName,
    nodeName: node.info.name,
    nodeType: node.info.type,
    method: (node as HttpNode).item?.method,
    url: getNodeUrl(node),
    updatedAt: node.updatedAt,
    matches
  };
}
// 分批匹配节点
async function matchNodesInBatches(
  nodes: ApiNode[],
  conditions: AdvancedSearchConditions,
  project: ApidocProjectInfo,
  isOffline: boolean
): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];
  const batchSize = 50;
  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);
    for (const node of batch) {
      const match = matchNode(node, conditions, project, isOffline);
      if (match) {
        results.push(match);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  return results;
}
// 执行高级搜索
export async function performAdvancedSearch(
  conditions: AdvancedSearchConditions,
  isOffline: boolean
): Promise<GroupedSearchResults[]> {
  const projects = await projectCache.getProjectList();
  const results: GroupedSearchResults[] = [];
  for (const project of projects) {
    const nodes = await apiNodesCache.getNodesByProjectId(project._id);
    const matchedNodes = await matchNodesInBatches(
      nodes.filter(node => !node.isDeleted),
      conditions,
      project,
      isOffline
    );
    matchedNodes.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    if (matchedNodes.length > 0) {
      results.push({
        projectId: project._id,
        projectName: project.projectName,
        nodes: matchedNodes.slice(0, 10),
        totalCount: matchedNodes.length,
        displayCount: Math.min(matchedNodes.length, 10),
        hasMore: matchedNodes.length > 10
      });
    }
  }
  return results;
}
