import { request } from '@/api/api';
import { ApidocProjectBaseInfoState, ApidocProjectCommonHeader, ApidocProperty, CommonResponse } from '@src/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { router } from '@/router';
import { commonHeaderCache } from '@/cache/project/commonHeadersCache';
import { apiNodesCache } from '@/cache/nodes/nodesCache';
import { useRuntime } from '../runtime/runtimeStore';

type HeaderInfo = Pick<ApidocProperty, '_id' | 'key' | 'value' | 'description' | 'select'> & { path?: string[]; nodeId?: string };
type CommonHeaderResult = {
  matched: boolean;
  nodeId: string;
  data: HeaderInfo[];
};
type MatchedHeaderOptions = {
  id: string | undefined;
  preCommonHeaders: HeaderInfo[];
  result: CommonHeaderResult;
  deep: number;
};
type GlobalCommonHeader = Pick<ApidocProperty, '_id' | 'key' | 'value' | 'description' | 'select'> & { path?: string[]; nodeId?: string };

export const normalizeHeaderKey = (key: string) => key.trim().toLowerCase();

export const computeCommonHeaderEffect = <T extends Pick<ApidocProperty, '_id' | 'key' | 'select'>>(headers: T[], ignoredHeaderIds: string[]) => {
  const lastIndexByKey = new Map<string, number>();
  for (let i = 0; i < headers.length; i += 1) {
    const header = headers[i];
    if (!header.select) {
      continue;
    }
    if (ignoredHeaderIds.includes(header._id)) {
      continue;
    }
    const normalized = normalizeHeaderKey(header.key);
    if (!normalized) {
      continue;
    }
    lastIndexByKey.set(normalized, i);
  }
  const display = headers.map((header, index) => {
    const normalized = normalizeHeaderKey(header.key);
    const isIgnored = ignoredHeaderIds.includes(header._id);
    const isEffective = header.select && !isIgnored && normalized !== '' && lastIndexByKey.get(normalized) === index;
    return {
      ...header,
      isEffective,
    };
  });
  const effective = display.filter((h) => h.isEffective);
  return {
    display,
    effective,
  };
};

const getMatchedHeaders = (data: ApidocProjectBaseInfoState['commonHeaders'], options: MatchedHeaderOptions) => {
  for (let i = 0; i < data.length; i += 1) {
    const currentItem = data[i];
    const { _id, commonHeaders, children } = currentItem;
    const currentHeaders = options.preCommonHeaders.concat(commonHeaders).map((h) => JSON.parse(JSON.stringify(h)) as HeaderInfo);
    if (_id === options.id) {
      options.result.matched = true;
      options.result.data = currentHeaders;
      options.result.nodeId = currentItem._id;
      return;
    }
    if (children?.length > 0) {
      getMatchedHeaders(children, {
        id: options.id,
        deep: options.deep + 1,
        result: options.result,
        preCommonHeaders: currentHeaders,
      });
      if (options.result.matched) {
        return;
      }
    }
  }
};

export const useCommonHeader = defineStore('commonHeader', () => {
  const runtimeStore = useRuntime();
  const isOffline = () => runtimeStore.networkMode === 'offline';
  const commonHeaders = ref<ApidocProjectCommonHeader[]>([]);
  const globalCommonHeaders = ref<GlobalCommonHeader[]>([]);
  // 节点ID到父节点ID的映射，用于查找非文件夹节点的父文件夹
  const nodeIdToPidMap = ref<Map<string, string>>(new Map());
  // 改变公共请求头信息
  const changeCommonHeaders = (headers: ApidocProjectCommonHeader[]): void => {
    commonHeaders.value = headers;
  };
  // 根据 header ID 获取路径
  const getCommonHeaderSourceById = (headerItemId: string) => {
    const source = {
      path: [] as string[],
      nodeId: '' as string,
    };
    const cpCommonHeaders = commonHeaders.value;
    let isMatched = false;
    const loop = (loopData: ApidocProjectCommonHeader[], id: string, level: number) => {
      for (let i = 0; i < loopData.length; i++) {
        if (isMatched) {
          return;
        }
        const data = loopData[i];
        if (level === 0) {
          source.path.length = 0;
        }
        source.path[level] = data.name as string;
        for (let j = 0; j < data.commonHeaders.length; j++) {
          const header = data.commonHeaders[j];
          if (header._id === id) {
            source.nodeId = data._id;
            isMatched = true;
            return;
          }
        }
        if (data.children.length) {
          loop(data.children, id, level + 1);
        }
      }
    };
    loop(cpCommonHeaders, headerItemId, 0);
    return source;
  };
  // 根据文档id获取公共请求头
  const getCommonHeadersById = (id: string) => {
    if (!id) {
      return [];
    }
    const result: CommonHeaderResult = {
      matched: false,
      nodeId: '',
      data: [],
    };
    // 首先尝试直接匹配（适用于文件夹节点）
    getMatchedHeaders(commonHeaders.value, {
      id,
      preCommonHeaders: [],
      deep: 1,
      result,
    });
    // 如果没有匹配到，说明可能是非文件夹节点（如HTTP节点），尝试用其pid查找
    if (!result.matched) {
      const pid = nodeIdToPidMap.value.get(id);
      if (pid) {
        getMatchedHeaders(commonHeaders.value, {
          id: pid,
          preCommonHeaders: [],
          deep: 1,
          result,
        });
      }
    }
    const validCommonHeaders = result.data?.filter((v) => v.key && v.select) || [];
    validCommonHeaders.forEach((header) => {
      const source = getCommonHeaderSourceById(header._id);
      header.path = source.path;
      header.nodeId = source.nodeId || result.nodeId;
    });
    const validGlobalCommonHeaders = globalCommonHeaders.value?.filter((v) => v.key && v.select) || [];
    return [...validGlobalCommonHeaders, ...validCommonHeaders];
  };
  // 获取全部公共请求头信息
  const getCommonHeaders = async (): Promise<void> => {
    if (isOffline()) {
      const projectId = router.currentRoute.value.query.id as string;
      const allNodes = await apiNodesCache.getNodesByProjectId(projectId);
      const folderNodes = allNodes.filter((node) => node.info.type === 'folder');
      // 构建节点ID到父节点ID的映射
      const newNodeIdToPidMap = new Map<string, string>();
      allNodes.forEach((node) => {
        if (node.pid) {
          newNodeIdToPidMap.set(node._id, node.pid);
        }
      });
      nodeIdToPidMap.value = newNodeIdToPidMap;
      const buildTree = (pid: string): ApidocProjectCommonHeader[] => {
        return folderNodes
          .filter((node) => node.pid === pid)
          .map((node) => {
            const folderNode = node as import('@src/types').FolderNode;
            return {
              _id: folderNode._id,
              name: folderNode.info.name,
              pid: folderNode.pid,
              type: 'folder' as const,
              commonHeaders: (folderNode.commonHeaders || []).map((h) => ({
                _id: h._id,
                key: h.key,
                value: h.value,
                description: h.description,
                select: h.select,
              })),
              children: buildTree(folderNode._id),
            };
          });
      };
      const treeData = buildTree('');
      changeCommonHeaders(treeData);
      return;
    }
    return new Promise((resolve, reject) => {
      const projectId = router.currentRoute.value.query.id as string;
      const params = {
        projectId,
      };
      request
        .get<CommonResponse<ApidocProjectBaseInfoState['commonHeaders']>, CommonResponse<ApidocProjectBaseInfoState['commonHeaders']>>(
          '/api/project/common_headers',
          { params }
        )
        .then((res) => {
          changeCommonHeaders(res.data);
          resolve();
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  };
  // 获取全局公共请求头
  const getGlobalCommonHeaders = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (isOffline()) {
        const headers = await commonHeaderCache.getCommonHeaders();
        globalCommonHeaders.value = headers;
        resolve();
        return;
      }
      const params = {
        projectId: router.currentRoute.value.query.id as string,
      };
      request
        .get<CommonResponse<GlobalCommonHeader[]>, CommonResponse<GlobalCommonHeader[]>>('/api/project/global_common_headers', { params })
        .then((res) => {
          globalCommonHeaders.value = res.data;
          resolve();
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  };
  // 更新节点ID到父节点ID的映射（用于新增节点时调用）
  const updateNodeIdToPidMap = (nodeId: string, pid: string) => {
    if (nodeId && pid) {
      nodeIdToPidMap.value.set(nodeId, pid);
    }
  };
  // 从映射中删除节点（用于删除节点时调用）
  const removeFromNodeIdToPidMap = (nodeId: string) => {
    nodeIdToPidMap.value.delete(nodeId);
  };
  return {
    commonHeaders,
    globalCommonHeaders,
    changeCommonHeaders,
    getCommonHeadersById,
    getCommonHeaders,
    getGlobalCommonHeaders,
    updateNodeIdToPidMap,
    removeFromNodeIdToPidMap,
  };
});
