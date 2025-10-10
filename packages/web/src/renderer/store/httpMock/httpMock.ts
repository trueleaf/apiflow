import { MockHttpNode } from "@src/types/mockNode";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { uuid, cloneDeep, generateEmptyHttpMockNode } from "@/helper";
import { apiNodesCache } from "@/cache/index";
import { httpMockNodeCache } from "@/cache/mock/httpMock/httpMockNodeCache.ts";
import { ElMessageBox } from "element-plus";
import { useApidocTas } from "../apidoc/tabs.ts";
import { router } from "@/router/index.ts";
import { useApidocBanner } from "../apidoc/banner.ts";
import { useRuntime } from '@/store/runtime/runtime';

export const useHttpMock = defineStore('httpMock', () => {
  const runtimeStore = useRuntime();
  const isOffline = () => runtimeStore.networkMode === 'offline';
  const httpMock = ref<MockHttpNode>(generateEmptyHttpMockNode(uuid()));
  const originHttpMock = ref<MockHttpNode>(generateEmptyHttpMockNode(uuid()));
  const saveLoading = ref(false);
  const refreshLoading = ref(false);

  const apidocTabsStore = useApidocTas();
  const apidocBannerStore = useApidocBanner();
  const { deleteTabByIds, changeTabInfoById } = apidocTabsStore;
  const { changeBannerInfoById } = apidocBannerStore;
  const { tabs } = storeToRefs(apidocTabsStore);

  /*
  |--------------------------------------------------------------------------
  | 缓存操作方法
  |--------------------------------------------------------------------------
  */
  // 缓存当前httpMock配置
  const cacheHttpMockNode = (): void => {
    if (httpMock.value) {
      httpMockNodeCache.setHttpMockNode(httpMock.value);
    }
  };

  // 从缓存获取httpMock配置
  const getCachedHttpMockNodeById = (id: string): MockHttpNode | null => {
    return httpMockNodeCache.getHttpMockNode(id);
  };

  /*
  |--------------------------------------------------------------------------
  | 基础状态变更方法
  |--------------------------------------------------------------------------
  */
  // 重新赋值httpMock数据
  const replaceHttpMockNode = (payload: MockHttpNode): void => {
    httpMock.value = payload;
    cacheHttpMockNode();
  };

  // 改变httpMock原始缓存值
  const replaceOriginHttpMockNode = (): void => {
    originHttpMock.value = cloneDeep(httpMock.value);
  };

  // 改变httpMock数据保存状态
  const changeSaveLoading = (state: boolean): void => {
    saveLoading.value = state;
  };

  // 改变httpMock刷新状态
  const changeRefreshLoading = (state: boolean): void => {
    refreshLoading.value = state;
  };

  /*
  |--------------------------------------------------------------------------
  | 基础信息操作方法
  |--------------------------------------------------------------------------
  */
  // 改变httpMock名称
  const changeHttpMockName = (name: string): void => {
    httpMock.value.info.name = name;
  };

  // 改变HTTP方法
  const changeHttpMockNodeMethod = (method: MockHttpNode['requestCondition']['method']): void => {
    httpMock.value.requestCondition.method = method;
  };

  // 改变请求URL
  const changeHttpMockNodeRequestUrl = (url: string): void => {
    httpMock.value.requestCondition.url = url;
  };

  // 改变端口
  const changeHttpMockNodePort = (port: number): void => {
    httpMock.value.requestCondition.port = port;
  };

  /*
  |--------------------------------------------------------------------------
  | 配置操作方法
  |--------------------------------------------------------------------------
  */
  const changeHttpMockNodeDelay = (delay: number): void => {
    httpMock.value.config.delay = delay;
  };

  /*
  |--------------------------------------------------------------------------
  | 数据比较方法
  |--------------------------------------------------------------------------
  */
  // 检查httpMock是否发生改变
  const checkHttpMockNodeIsEqual = (current: MockHttpNode, origin: MockHttpNode): boolean => {
    // 使用JSON序列化进行深度比较，排除不需要比较的字段
    const normalize = (node: MockHttpNode) => {
      const { _id, projectId, pid, sort, createdAt, updatedAt, isDeleted, ...rest } = node;
      return rest;
    };
    
    const currentNormalized = normalize(current);
    const originNormalized = normalize(origin);
    
    return JSON.stringify(currentNormalized) === JSON.stringify(originNormalized);
  };

  /*
  |--------------------------------------------------------------------------
  | 接口调用
  |--------------------------------------------------------------------------
  */
  // 获取HttpMock详情
  const getHttpMockNodeDetail = async (payload: { id: string, projectId: string }): Promise<void> => {
    if (isOffline()) {
      const doc = await apiNodesCache.getNodeById(payload.id) as MockHttpNode;
      if (!doc) {
        // 如果standalone中没有找到，尝试从缓存中获取
        const cachedHttpMock = getCachedHttpMockNodeById(payload.id);
        if (cachedHttpMock) {
          replaceHttpMockNode(cachedHttpMock);
          replaceOriginHttpMockNode();
          return;
        }
        
        ElMessageBox.confirm('当前HttpMock不存在，可能已经被删除!', '提示', {
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
          console.error(err);
        });
        return;
      }
      replaceHttpMockNode(doc);
      replaceOriginHttpMockNode();
      // 缓存到本地存储
      cacheHttpMockNode();
      return;
    } else {
      // 非standalone模式下尝试从缓存中获取
      const cachedHttpMock = getCachedHttpMockNodeById(payload.id);
      if (cachedHttpMock) {
        replaceHttpMockNode(cachedHttpMock);
        replaceOriginHttpMockNode();
        return;
      }
      console.log('getHttpMockNodeDetail called but not in standalone mode and no cache found');
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 保存HttpMock
  |--------------------------------------------------------------------------
  */
  // 保存HttpMock配置
  const saveHttpMockNode = async (): Promise<void> => {
    const projectId = router.currentRoute.value.query.id as string;
    const currentTabs = tabs.value[projectId];
    const currentSelectTab = currentTabs?.find((tab) => tab.selected) || null;
    if (!currentSelectTab) {
      console.warn('缺少tab信息');
      return;
    }
    saveLoading.value = true;
    if (isOffline()) {
      const httpMockDetail = cloneDeep(httpMock.value);
      httpMockDetail.updatedAt = new Date().toISOString();
      await apiNodesCache.updateNode(httpMockDetail);
      //改变tab请求方法
      changeTabInfoById({
        id: currentSelectTab._id,
        field: 'head',
        value: {
          icon: 'httpMock',
          color: '',
        },
      })
      //改变banner请求方法（使用通用方法）
      changeBannerInfoById({
        id: currentSelectTab._id,
        field: 'method' as any,
        value: httpMockDetail.requestCondition.method,
      })
      //改变origindoc的值
      replaceOriginHttpMockNode();
      //改变tab未保存小圆点
      changeTabInfoById({
        id: currentSelectTab._id,
        field: 'saved',
        value: true,
      })
      cacheHttpMockNode();
      
      // 检查Mock是否已启用，如果启用则更新主进程配置
      try {
        const isEnabled = await checkMockNodeEnabledStatus(httpMockDetail._id);
        if (isEnabled && window.electronAPI?.mock?.replaceById) {
          // 准备更新数据，确保包含projectId
          const updateData = { ...httpMockDetail, projectId };
          await window.electronAPI.mock.replaceById(httpMockDetail._id, updateData);
        }
      } catch (error) {
        console.warn('更新主进程Mock配置时发生错误:', error);
      }
      
      // 添加0.1秒的saveLoading效果
      setTimeout(() => {
        saveLoading.value = false;
      }, 100);
    } else {
      console.log('todo');
      cacheHttpMockNode();
      saveLoading.value = false;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Mock服务状态管理
  |--------------------------------------------------------------------------
  */
  // 检查Mock是否已启用
  const checkMockNodeEnabledStatus = async (nodeId: string): Promise<boolean> => {
    try {
      if (!window.electronAPI?.mock?.getMockByNodeId) {
        console.warn('Mock API not available');
        return false;
      }
      const mockData = await window.electronAPI.mock.getMockByNodeId(nodeId);
      return mockData !== null;
    } catch (error) {
      console.error('检查Mock状态失败:', error);
      return false;
    }
  };

  // 已移除startMockServer和stopMockServer方法，直接使用window.electronAPI.mock.startServer和window.electronAPI.mock.stopServer

  
  return {
    // 基础状态
    httpMock,
    originHttpMock,
    saveLoading,
    refreshLoading,
    // 缓存操作方法
    cacheHttpMockNode,
    getCachedHttpMockNodeById,
    // 基础状态变更方法
    replaceHttpMockNode,
    replaceOriginHttpMockNode,
    changeSaveLoading,
    changeRefreshLoading,
    // 基础信息操作方法
    changeHttpMockName,
    // 请求条件操作方法
    changeHttpMockNodeMethod,
    changeHttpMockNodeRequestUrl,
    changeHttpMockNodePort,
    // 配置操作方法
    changeHttpMockNodeDelay,
    // 数据比较方法
    checkHttpMockNodeIsEqual,
    // 接口调用
    getHttpMockNodeDetail,
    saveHttpMockNode,
    // Mock服务状态管理
    checkMockNodeEnabledStatus,
  }
})
