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
  nodeTypes: AdvancedSearchConditions['nodeTypes']
): boolean {
  if (!nodeTypes.folder && !nodeTypes.http && !nodeTypes.websocket && !nodeTypes.httpMock) {
    return true;
  }
  switch (nodeType) {
    case 'folder':
      return nodeTypes.folder;
    case 'http':
      return nodeTypes.http;
    case 'websocket':
      return nodeTypes.websocket;
    case 'httpMock':
      return nodeTypes.httpMock;
    default:
      return false;
  }
}
// 检查日期范围是否匹配
function checkDateRange(
  updatedAt: string,
  dateRange: AdvancedSearchConditions['dateRange']
): boolean {
  if (dateRange.type === 'all') return true;
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
  basicInfo: AdvancedSearchConditions['basicInfo'],
  project: ApidocProjectInfo,
  isOffline: boolean
): MatchInfo[] {
  const matches: MatchInfo[] = [];
  if (matchString(project.projectName, basicInfo.projectName)) {
    matches.push(createMatchInfo('projectName', '项目名称', project.projectName, basicInfo.projectName));
  }
  if (matchString(node.info.name, basicInfo.docName)) {
    matches.push(createMatchInfo('docName', '文档名称', node.info.name, basicInfo.docName));
  }
  if (basicInfo.url && (node.info.type === 'http' || node.info.type === 'websocket')) {
    const httpOrWsNode = node as HttpNode | WebSocketNode;
    const url = `${httpOrWsNode.item.url.prefix}${httpOrWsNode.item.url.path}`;
    if (matchString(url, basicInfo.url)) {
      matches.push(createMatchInfo('url', '请求URL', url, basicInfo.url));
    }
  }
  if (!isOffline && matchString(node.info.creator, basicInfo.creator)) {
    matches.push(createMatchInfo('creator', '创建者', node.info.creator || '', basicInfo.creator));
  }
  if (!isOffline && matchString(node.info.maintainer, basicInfo.maintainer)) {
    matches.push(createMatchInfo('maintainer', '维护者', node.info.maintainer || '', basicInfo.maintainer));
  }
  if (basicInfo.method && node.info.type === 'http') {
    const httpNode = node as HttpNode;
    if (matchString(httpNode.item.method, basicInfo.method)) {
      matches.push(createMatchInfo('method', '请求方法', httpNode.item.method, basicInfo.method));
    }
  }
  if (matchString(node.info.description, basicInfo.remark)) {
    matches.push(createMatchInfo('remark', '备注', node.info.description || '', basicInfo.remark));
  }
  return matches;
}
// 匹配请求参数
function matchRequestParams(
  node: ApiNode,
  requestParams: AdvancedSearchConditions['requestParams']
): MatchInfo[] {
  const matches: MatchInfo[] = [];
  if (node.info.type === 'http') {
    const httpNode = node as HttpNode;
    if (requestParams.query && httpNode.item.queryParams) {
      for (const param of httpNode.item.queryParams) {
        if (matchString(param.key, requestParams.query) ||
            matchString(param.value as string, requestParams.query) ||
            matchString(param.description, requestParams.query)) {
          matches.push(createMatchInfo('query', 'Query参数', `${param.key}=${param.value}`, requestParams.query));
          break;
        }
      }
    }
    if (requestParams.path && httpNode.item.paths) {
      for (const param of httpNode.item.paths) {
        if (matchString(param.key, requestParams.path) ||
            matchString(param.value as string, requestParams.path) ||
            matchString(param.description, requestParams.path)) {
          matches.push(createMatchInfo('path', 'Path参数', `${param.key}=${param.value}`, requestParams.path));
          break;
        }
      }
    }
    if (requestParams.headers && httpNode.item.headers) {
      for (const header of httpNode.item.headers) {
        if (matchString(header.key, requestParams.headers) ||
            matchString(header.value as string, requestParams.headers) ||
            matchString(header.description, requestParams.headers)) {
          matches.push(createMatchInfo('headers', '请求头参数', `${header.key}: ${header.value}`, requestParams.headers));
          break;
        }
      }
    }
    if (requestParams.body && httpNode.item.requestBody) {
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
      if (matchString(bodyStr, requestParams.body)) {
        matches.push(createMatchInfo('body', 'Body参数', bodyStr.substring(0, 100), requestParams.body));
      }
    }
    if (requestParams.response && httpNode.item.responseParams) {
      for (const resp of httpNode.item.responseParams) {
        if (matchString(resp.title, requestParams.response) ||
            matchString(resp.value?.strJson, requestParams.response) ||
            matchString(resp.value?.text, requestParams.response)) {
          matches.push(createMatchInfo('response', '返回参数', resp.title || resp.value?.strJson?.substring(0, 100) || '', requestParams.response));
          break;
        }
      }
    }
    if (requestParams.preScript && matchString(httpNode.preRequest?.raw, requestParams.preScript)) {
      matches.push(createMatchInfo('preScript', '前置脚本', httpNode.preRequest.raw.substring(0, 100), requestParams.preScript));
    }
    if (requestParams.afterScript && matchString(httpNode.afterRequest?.raw, requestParams.afterScript)) {
      matches.push(createMatchInfo('afterScript', '后置脚本', httpNode.afterRequest.raw.substring(0, 100), requestParams.afterScript));
    }
  }
  if (node.info.type === 'websocket') {
    const wsNode = node as WebSocketNode;
    if (requestParams.query && wsNode.item.queryParams) {
      for (const param of wsNode.item.queryParams) {
        if (matchString(param.key, requestParams.query) ||
            matchString(param.value as string, requestParams.query) ||
            matchString(param.description, requestParams.query)) {
          matches.push(createMatchInfo('query', 'Query参数', `${param.key}=${param.value}`, requestParams.query));
          break;
        }
      }
    }
    if (requestParams.headers && wsNode.item.headers) {
      for (const header of wsNode.item.headers) {
        if (matchString(header.key, requestParams.headers) ||
            matchString(header.value as string, requestParams.headers) ||
            matchString(header.description, requestParams.headers)) {
          matches.push(createMatchInfo('headers', '请求头参数', `${header.key}: ${header.value}`, requestParams.headers));
          break;
        }
      }
    }
    if (requestParams.wsMessage && wsNode.item.messageBlocks) {
      for (const msg of wsNode.item.messageBlocks) {
        if (matchString(msg.name, requestParams.wsMessage) ||
            matchString(msg.content, requestParams.wsMessage)) {
          matches.push(createMatchInfo('wsMessage', 'WebSocket消息', msg.name || msg.content.substring(0, 100), requestParams.wsMessage));
          break;
        }
      }
    }
    if (requestParams.preScript && matchString(wsNode.preRequest?.raw, requestParams.preScript)) {
      matches.push(createMatchInfo('preScript', '前置脚本', wsNode.preRequest.raw.substring(0, 100), requestParams.preScript));
    }
    if (requestParams.afterScript && matchString(wsNode.afterRequest?.raw, requestParams.afterScript)) {
      matches.push(createMatchInfo('afterScript', '后置脚本', wsNode.afterRequest.raw.substring(0, 100), requestParams.afterScript));
    }
  }
  if (node.info.type === 'httpMock') {
    const mockNode = node as HttpMockNode;
    if (requestParams.headers && mockNode.response) {
      for (const resp of mockNode.response) {
        if (resp.headers?.defaultHeaders) {
          for (const header of resp.headers.defaultHeaders) {
            if (matchString(header.key, requestParams.headers) ||
                matchString(header.value as string, requestParams.headers)) {
              matches.push(createMatchInfo('headers', '请求头参数', `${header.key}: ${header.value}`, requestParams.headers));
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
  if (!checkNodeType(node.info.type, conditions.nodeTypes)) {
    return null;
  }
  if (!checkDateRange(node.updatedAt, conditions.dateRange)) {
    return null;
  }
  const matches: MatchInfo[] = [];
  matches.push(...matchBasicInfo(node, conditions.basicInfo, project, isOffline));
  matches.push(...matchRequestParams(node, conditions.requestParams));
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
