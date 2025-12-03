import { WebSocketMockNode } from "@src/types/mockNode";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { cloneDeep } from "lodash-es";
import { ElMessageBox } from 'element-plus';
import { useApidocTas } from "../httpNode/httpTabsStore.ts";
import { router } from "@/router/index.ts";
import { useApidocBanner } from "../httpNode/httpBannerStore.ts";
import { useRuntime } from '@/store/runtime/runtimeStore';
import { logger, generateEmptyWebSocketMockNode } from '@/helper';
import { apiNodesCache } from "@/cache/nodes/nodesCache";
import { nanoid } from 'nanoid/non-secure';

// WebSocket Mock 节点缓存
const websocketMockNodeCacheMap = new Map<string, WebSocketMockNode>();
const setWebSocketMockNode = (node: WebSocketMockNode): void => {
  websocketMockNodeCacheMap.set(node._id, cloneDeep(node));
}
const getWebSocketMockNode = (id: string): WebSocketMockNode | null => {
  const cached = websocketMockNodeCacheMap.get(id);
  return cached ? cloneDeep(cached) : null;
}

export const useWebSocketMock = defineStore('websocketMock', () => {
  const runtimeStore = useRuntime();
  const isOffline = () => runtimeStore.networkMode === 'offline';
  const websocketMock = ref<WebSocketMockNode>(generateEmptyWebSocketMockNode(nanoid()));
  const originWebSocketMock = ref<WebSocketMockNode>(generateEmptyWebSocketMockNode(nanoid()));
  const saveLoading = ref(false);
  const refreshLoading = ref(false);

  const apidocTabsStore = useApidocTas();
  const apidocBannerStore = useApidocBanner();
  const { deleteTabByIds, changeTabInfoById } = apidocTabsStore;
  const { changeBannerInfoById } = apidocBannerStore;
  const { tabs } = storeToRefs(apidocTabsStore);

  // 缓存当前 websocketMock 配置
  const cacheWebSocketMockNode = (): void => {
    if (websocketMock.value) {
      setWebSocketMockNode(websocketMock.value);
    }
  };
  // 从缓存获取 websocketMock 配置
  const getCachedWebSocketMockNodeById = (id: string): WebSocketMockNode | null => {
    return getWebSocketMockNode(id);
  };
  // 重新赋值 websocketMock 数据
  const replaceWebSocketMockNode = (payload: WebSocketMockNode): void => {
    websocketMock.value = payload;
    cacheWebSocketMockNode();
  };
  // 改变 websocketMock 原始缓存值
  const replaceOriginWebSocketMockNode = (): void => {
    originWebSocketMock.value = cloneDeep(websocketMock.value);
  };
  // 改变 websocketMock 名称
  const changeWebSocketMockName = (name: string): void => {
    websocketMock.value.info.name = name;
  };
  // 改变请求路径
  const changeWebSocketMockPath = (path: string): void => {
    websocketMock.value.requestCondition.path = path;
  };
  // 改变端口
  const changeWebSocketMockPort = (port: number): void => {
    websocketMock.value.requestCondition.port = port;
  };
  // 改变延迟
  const changeWebSocketMockDelay = (delay: number): void => {
    websocketMock.value.config.delay = delay;
  };
  // 改变 Echo 模式
  const changeWebSocketMockEchoMode = (enabled: boolean): void => {
    websocketMock.value.config.echoMode = enabled;
  };
  // 改变响应内容
  const changeWebSocketMockResponseContent = (content: string): void => {
    websocketMock.value.response.content = content;
  };
  // 检查 websocketMock 是否发生改变
  const checkWebSocketMockNodeIsEqual = (current: WebSocketMockNode, origin: WebSocketMockNode): boolean => {
    const normalize = (node: WebSocketMockNode) => {
      const { _id, projectId, pid, sort, createdAt, updatedAt, isDeleted, ...rest } = node;
      return rest;
    };
    const currentNormalized = normalize(current);
    const originNormalized = normalize(origin);
    return JSON.stringify(currentNormalized) === JSON.stringify(originNormalized);
  };
  // 获取 WebSocketMock 详情
  const getWebSocketMockNodeDetail = async (payload: { id: string, projectId: string }): Promise<void> => {
    if (isOffline()) {
      const doc = await apiNodesCache.getNodeById(payload.id) as WebSocketMockNode;
      if (!doc) {
        const cachedWebSocketMock = getCachedWebSocketMockNodeById(payload.id);
        if (cachedWebSocketMock) {
          replaceWebSocketMockNode(cachedWebSocketMock);
          replaceOriginWebSocketMockNode();
          return;
        }
        ElMessageBox.confirm('当前 WebSocket Mock 不存在，可能已经被删除!', '提示', {
          confirmButtonText: '关闭接口',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          return deleteTabByIds({
            ids: [payload.id],
            projectId: payload.projectId,
            force: true,
          });
        }).catch((err) => {
          if (err === 'cancel' || err === 'close') {
            return;
          }
        });
        return;
      }
      replaceWebSocketMockNode(doc);
      replaceOriginWebSocketMockNode();
      cacheWebSocketMockNode();
      return;
    }
    // 在线模式暂不支持
  };
  // 保存 WebSocketMock 配置
  const saveWebSocketMockNode = async (): Promise<void> => {
    const projectId = router.currentRoute.value.query.id as string;
    const currentTabs = tabs.value[projectId];
    const currentSelectTab = currentTabs?.find((tab) => tab.selected) || null;
    if (!currentSelectTab) {
      logger.warn('缺少tab信息');
      return;
    }
    saveLoading.value = true;
    if (isOffline()) {
      const websocketMockDetail = cloneDeep(websocketMock.value);
      websocketMockDetail.updatedAt = new Date().toISOString();
      await apiNodesCache.replaceNode(websocketMockDetail);
      changeTabInfoById({
        id: currentSelectTab._id,
        field: 'head',
        value: {
          icon: 'websocketMock',
          color: '',
        },
      })
      changeBannerInfoById({
        id: currentSelectTab._id,
        field: 'path' as unknown as 'name',
        value: websocketMockDetail.requestCondition.path,
      })
      replaceOriginWebSocketMockNode();
      changeTabInfoById({
        id: currentSelectTab._id,
        field: 'saved',
        value: true,
      })
      cacheWebSocketMockNode();
      // 检查 Mock 是否已启用，如果启用则更新主进程配置
      try {
        const isEnabled = await checkMockNodeEnabledStatus(websocketMockDetail._id);
        if (isEnabled && window.electronAPI?.websocketMock?.replaceById) {
          const updateData = { ...websocketMockDetail, projectId };
          await window.electronAPI.websocketMock.replaceById(websocketMockDetail._id, updateData);
        }
      } catch (error) {
        logger.warn('更新主进程 WebSocket Mock 配置时发生错误', { error });
      }
      setTimeout(() => {
        saveLoading.value = false;
      }, 100);
    }
  };
  // 检查 Mock 是否已启用
  const checkMockNodeEnabledStatus = async (nodeId: string): Promise<boolean> => {
    try {
      if (!window.electronAPI?.websocketMock?.getMockByNodeId) {
        return false;
      }
      const mockData = await window.electronAPI.websocketMock.getMockByNodeId(nodeId);
      return mockData !== null;
    } catch (error) {
      logger.error('检查 WebSocket Mock 状态失败', { error });
      return false;
    }
  };

  return {
    websocketMock,
    originWebSocketMock,
    saveLoading,
    refreshLoading,
    cacheWebSocketMockNode,
    getCachedWebSocketMockNodeById,
    replaceWebSocketMockNode,
    replaceOriginWebSocketMockNode,
    changeWebSocketMockName,
    changeWebSocketMockPath,
    changeWebSocketMockPort,
    changeWebSocketMockDelay,
    changeWebSocketMockEchoMode,
    changeWebSocketMockResponseContent,
    checkWebSocketMockNodeIsEqual,
    getWebSocketMockNodeDetail,
    saveWebSocketMockNode,
    checkMockNodeEnabledStatus,
  }
})
