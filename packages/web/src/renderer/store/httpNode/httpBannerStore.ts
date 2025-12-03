import { request } from '@/api/api';
import { apiNodesCache } from '@/cache/nodes/nodesCache';
import { findNodeById, forEachForest, getAllAncestorIds } from '@/helper';
import { ApidocBanner, ApidocBannerOfWebsocketNode, ApidocBannerOfHttpNode, ApidocBannerOfHttpMockNode, ApidocBannerOfWebSocketMockNode, CommonResponse, MockStatusChangedPayload } from '@src/types';
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRuntime } from '../runtime/runtimeStore';
import { logger } from '@/helper';

type SplicePayload = {
  opData?: ApidocBanner[],
  start: number,
  deleteCount?: number,
  item?: ApidocBanner,
}
// 使用条件类型来确保类型安全
type EditBannerPayload<T extends ApidocBanner, K extends keyof T> = {
  id: string,
  field: K,
  value: T[K],
};

export const useApidocBanner = defineStore('httpBanner', () => {
  const runtimeStore = useRuntime();
  const isOffline = () => runtimeStore.networkMode === 'offline';
  const loading = ref(false);
  const banner = ref<ApidocBanner[]>([]);
  const defaultExpandedKeys = ref<string[]>([]);
  const foldersWithRunningMock = ref<Set<string>>(new Set());
  
  //根据id改变节点属性 - 使用类型断言但更安全
  const changeBannerInfoById = <T extends ApidocBanner, K extends keyof T>(payload: EditBannerPayload<T, K>): void => {
    const { id, field, value } = payload;
    const editData = findNodeById(banner.value, id, {
      idKey: '_id',
    }) as T;
    if (editData && field in editData) {
      editData[field] = value;
    }
  }
  
  // 类型安全的 WebSocket banner 更新方法
  const changeWebsocketBannerInfoById = <K extends keyof ApidocBannerOfWebsocketNode>(
    payload: EditBannerPayload<ApidocBannerOfWebsocketNode, K>
  ): void => {
    changeBannerInfoById<ApidocBannerOfWebsocketNode, K>(payload);
  }
  
  // 类型安全的 HTTP banner 更新方法
  const changeHttpBannerInfoById = <K extends keyof ApidocBannerOfHttpNode>(
    payload: EditBannerPayload<ApidocBannerOfHttpNode, K>
  ): void => {
    changeBannerInfoById<ApidocBannerOfHttpNode, K>(payload);
  }
  //改变文档banner
  const changeAllDocBanner = (payload: ApidocBanner[]): void => {
    banner.value = payload;
  }
  //改变文档数据
  const splice = (payload: SplicePayload): void => {
    const { start, deleteCount = 0, item, opData } = payload;
    const currentOperationData = opData || banner.value;
    if (item) {
      currentOperationData.splice(start, deleteCount, item)
    } else {
      currentOperationData.splice(start, deleteCount)
    }
  }
  //新增一个展开项
  const addExpandItem = (payload: string): void => {
    defaultExpandedKeys.value.push(payload);
  }
  //改变整个展开项目
  const changeExpandItems = (payload: string[]): void => {
    defaultExpandedKeys.value = payload;
  }
  //改变加载状态
  const changeBannerLoading = (state: boolean): void => {
    loading.value = state
  }
  //更新Mock节点状态
  const updateMockNodeState = (payload: MockStatusChangedPayload): void => {
    const node = findNodeById(banner.value, payload.nodeId, { idKey: '_id' }) as ApidocBannerOfHttpMockNode | ApidocBannerOfWebSocketMockNode | null;
    if (node && (node.type === 'httpMock' || node.type === 'websocketMock')) {
      node.state = payload.state;
    }
    calculateFoldersWithRunningMock();
  }
  //初始化所有Mock节点状态为stopped
  const initializeMockNodeStates = (): void => {
    forEachForest(banner.value, (node) => {
      if (node.type === 'httpMock') {
        (node as ApidocBannerOfHttpMockNode).state = 'stopped';
      } else if (node.type === 'websocketMock') {
        (node as ApidocBannerOfWebSocketMockNode).state = 'stopped';
      }
    });
    calculateFoldersWithRunningMock();
  }
  //批量查询并更新Mock节点状态
  const refreshMockNodeStates = async (projectId: string): Promise<void> => {
    // 刷新 HttpMock 状态
    if (window.electronAPI?.mock?.getAllStates) {
      try {
        const states = await window.electronAPI.mock.getAllStates(projectId);
        if (states && states.length > 0) {
          states.forEach((statePayload: MockStatusChangedPayload) => {
            const node = findNodeById(banner.value, statePayload.nodeId, { idKey: '_id' }) as ApidocBannerOfHttpMockNode | null;
            if (node && node.type === 'httpMock') {
              node.state = statePayload.state;
            }
          });
        }
      } catch (error) {
        logger.error('刷新HttpMock状态失败', { error });
      }
    }
    // 刷新 WebSocketMock 状态
    if (window.electronAPI?.websocketMock?.getAllStates) {
      try {
        const states = await window.electronAPI.websocketMock.getAllStates(projectId);
        if (states && states.length > 0) {
          states.forEach((statePayload: MockStatusChangedPayload) => {
            const node = findNodeById(banner.value, statePayload.nodeId, { idKey: '_id' }) as ApidocBannerOfWebSocketMockNode | null;
            if (node && node.type === 'websocketMock') {
              node.state = statePayload.state;
            }
          });
        }
      } catch (error) {
        logger.error('刷新WebSocketMock状态失败', { error });
      }
    }
    calculateFoldersWithRunningMock();
  }
  //计算包含running mock的所有文件夹ID
  const calculateFoldersWithRunningMock = (): void => {
    const result = new Set<string>();
    const runningMocks: string[] = [];
    forEachForest(banner.value, (node) => {
      if ((node.type === 'httpMock' || node.type === 'websocketMock') && node.state === 'running') {
        runningMocks.push(node._id);
      }
    });
    runningMocks.forEach(mockId => {
      const ancestors = getAllAncestorIds(banner.value, mockId, { idKey: '_id' });
      ancestors.forEach(ancestorId => {
        const ancestor = findNodeById(banner.value, ancestorId, { idKey: '_id' });
        if (ancestor && ancestor.type === 'folder') {
          result.add(ancestorId);
        }
      });
    });
    foldersWithRunningMock.value = result;
  }
  /*
  |--------------------------------------------------------------------------
  | 接口调用
  |--------------------------------------------------------------------------
  |
  */
   /**
   * 获取文档左侧导航数据
   */
  const getDocBanner = async(payload: { projectId: string }): Promise<ApidocBanner[]> => {
    return new Promise(async (resolve, reject) => {
      if (isOffline()) {
        const banner = await apiNodesCache.getApiNodesAsTree(payload.projectId);
        changeAllDocBanner(banner)
        initializeMockNodeStates()
        refreshMockNodeStates(payload.projectId)
        resolve(banner)
        return
      }
      const params = {
        projectId: payload.projectId,
      };
      request.get('/api/project/doc_tree_node', { params }).then((res) => {
        const result = res.data;
        changeAllDocBanner(result)
        initializeMockNodeStates()
        refreshMockNodeStates(payload.projectId)
        resolve(result)
      }).catch((err) => {
        reject(err);
      });
    });
  }
  /**
   * 获取分享文档左侧导航数据
   */
  const getSharedDocBanner = (payload: { shareId: string, password: string }): Promise<ApidocBanner[]> => {
    return new Promise((resolve, reject) => {
      const params = {
        shareId: payload.shareId,
        password: payload.password,
      };
      request.get<CommonResponse<ApidocBanner[]>, CommonResponse<ApidocBanner[]>>('/api/project/export/share_banner', { params }).then((res) => {
        if (res.code === 101005) {
          //todo
          // shareRouter.replace({
          //   path: '/check',
          //   query: {
          //     share_id: shareRouter.currentRoute.value.query.share_id,
          //     id: shareRouter.currentRoute.value.query.id,
          //   },
          // });
          return;
        }
        const result = res.data;
        changeAllDocBanner(result)
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  return {
    loading,
    banner,
    defaultExpandedKeys,
    foldersWithRunningMock,
    changeBannerInfoById,
    changeWebsocketBannerInfoById,
    changeHttpBannerInfoById,
    changeAllDocBanner,
    splice,
    addExpandItem,
    changeExpandItems,
    changeBannerLoading,
    updateMockNodeState,
    initializeMockNodeStates,
    refreshMockNodeStates,
    calculateFoldersWithRunningMock,
    getDocBanner,
    getSharedDocBanner,
  }
})
