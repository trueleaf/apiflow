import { HttpMockNode } from "@src/types/mockNode";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { generateEmptyHttpMockNode } from '@/helper';
import { nanoid } from 'nanoid/non-secure';
import { cloneDeep } from "lodash-es";
import { apiNodesCache } from "@/cache/nodes/nodesCache";
import { httpMockNodeCache } from "@/cache/mock/httpMock/httpMockNodeCache.ts";
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm2.ts';
import { useProjectNav } from "../projectWorkbench/projectNavStore.ts";
import { router } from "@/router/index.ts";
import { useBanner } from "../projectWorkbench/bannerStore.ts";
import { useRuntime } from '@/store/runtime/runtimeStore';
import { logger } from '@/helper/logger';
import axios, { Canceler } from 'axios';
import { request as axiosInstance } from '@/api/api';
import { CommonResponse } from '@src/types';
import { i18n } from "@/i18n";


export const useHttpMockNode = defineStore('httpMockNode', () => {
  const runtimeStore = useRuntime();
  const isOffline = () => runtimeStore.networkMode === 'offline';
  const httpMock = ref<HttpMockNode>(generateEmptyHttpMockNode(nanoid()));
  const originHttpMock = ref<HttpMockNode>(generateEmptyHttpMockNode(nanoid()));
  const httpMockNodeSaveLoading = ref(false);
  const httpMockNodeRefreshLoading = ref(false);
  const cancel: Canceler[] = []; // 请求取消函数数组

  const projectNavStore = useProjectNav();
  const bannerStore = useBanner();
  const { deleteNavByIds, changeNavInfoById } = projectNavStore;
  const { changeBannerInfoById } = bannerStore;
  const { navs } = storeToRefs(projectNavStore);

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
  const getCachedHttpMockNodeById = (id: string): HttpMockNode | null => {
    return httpMockNodeCache.getHttpMockNode(id);
  };

  /*
  |--------------------------------------------------------------------------
  | 基础状态变更方法
  |--------------------------------------------------------------------------
  */
  // 重新赋值httpMock数据
  const replaceHttpMockNode = (payload: HttpMockNode): void => {
    httpMock.value = payload;
    cacheHttpMockNode();
  };
  // 改变httpMock原始缓存值
  const replaceOriginHttpMockNode = (): void => {
    originHttpMock.value = cloneDeep(httpMock.value);
  };
  // 改变httpMock刷新状态
  const changeHttpMockNodeRefreshLoading = (state: boolean): void => {
    httpMockNodeRefreshLoading.value = state;
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
  const changeHttpMockNodeMethod = (method: HttpMockNode['requestCondition']['method']): void => {
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
  const checkHttpMockNodeIsEqual = (current: HttpMockNode, origin: HttpMockNode): boolean => {
    // 使用JSON序列化进行深度比较，排除不需要比较的字段
    const normalize = (node: HttpMockNode) => {
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
      const doc = await apiNodesCache.getNodeById(payload.id) as HttpMockNode;
      if (!doc) {
        // 如果standalone中没有找到，尝试从缓存中获取
        const cachedHttpMock = getCachedHttpMockNodeById(payload.id);
        if (cachedHttpMock) {
          replaceHttpMockNode(cachedHttpMock);
          replaceOriginHttpMockNode();
          return;
        }
        
        ClConfirm({
          content: i18n.global.t('当前 HttpMock 不存在，可能已经被删除'),
          title: i18n.global.t('提示'),
          confirmButtonText: i18n.global.t('关闭接口'),
          cancelButtonText: i18n.global.t('取消'),
          type: 'warning',
        }).then(() => {
          return deleteNavByIds({
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
    }

    // 在线模式：从服务器获取数据
    if (cancel.length > 0) {
      cancel.forEach((c) => {
        c('取消请求');
      });
    }
    return new Promise((resolve, reject) => {
      httpMockNodeRefreshLoading.value = true;
      const params = {
        projectId: payload.projectId,
        _id: payload.id,
      };
      axiosInstance.get<CommonResponse<HttpMockNode>, CommonResponse<HttpMockNode>>('/api/project/doc_detail', {
        params,
        cancelToken: new axios.CancelToken((c) => {
          cancel.push(c);
        }),
      }).then((res) => {
        if (res.data === null) {
          ClConfirm({
            content: i18n.global.t('当前 HttpMock 不存在，可能已经被删除'),
            title: i18n.global.t('提示'),
            confirmButtonText: i18n.global.t('关闭接口'),
            cancelButtonText: i18n.global.t('取消'),
            type: 'warning',
          }).then(() => {
            deleteNavByIds({
              projectId: payload.projectId,
              ids: [payload.id],
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
        replaceHttpMockNode(res.data);
        replaceOriginHttpMockNode();
        cacheHttpMockNode();
        resolve();
      }).catch((err) => {
        console.error(err);
        reject(err);
      }).finally(() => {
        httpMockNodeRefreshLoading.value = false;
      });
    });
  };

  /*
  |--------------------------------------------------------------------------
  | 保存HttpMock
  |--------------------------------------------------------------------------
  */
  // 保存HttpMock配置
  const saveHttpMockNode = async (): Promise<void> => {
    const projectId = router.currentRoute.value.query.id as string;
    const currentNavs = navs.value[projectId];
    const currentSelectNav = currentNavs?.find((nav) => nav.selected) || null;
    if (!currentSelectNav) {
      logger.warn('缺少nav信息');
      return;
    }
    httpMockNodeSaveLoading.value = true;
    if (isOffline()) {
      const httpMockDetail = cloneDeep(httpMock.value);
      httpMockDetail.updatedAt = new Date().toISOString();
      await apiNodesCache.replaceNode(httpMockDetail);
      //改变nav请求方法
      changeNavInfoById({
        id: currentSelectNav._id,
        field: 'head',
        value: {
          icon: 'httpMock',
          color: '',
        },
      })
      //改变banner请求方法（使用通用方法）
      changeBannerInfoById({
        id: currentSelectNav._id,
        field: 'method' as any,
        value: httpMockDetail.requestCondition.method,
      })
      //改变origindoc的值
      replaceOriginHttpMockNode();
      //改变nav未保存小圆点
      changeNavInfoById({
        id: currentSelectNav._id,
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
        logger.warn('更新主进程Mock配置时发生错误', { error });
      }
      
      // 添加0.1秒的httpMockNodeSaveLoading效果
      setTimeout(() => {
        httpMockNodeSaveLoading.value = false;
      }, 100);
    } else {
      // 在线模式保存
      const httpMockDetail = cloneDeep(httpMock.value);
      const params = {
        _id: currentSelectNav._id,
        projectId,
        info: {
          type: 'httpMock' as const,
          name: httpMockDetail.info.name,
          description: httpMockDetail.info.description,
        },
        httpMockItem: {
          requestCondition: httpMockDetail.requestCondition,
          config: httpMockDetail.config,
          response: httpMockDetail.response,
        },
      };

      axiosInstance.post('/api/project/fill_doc', params).then(() => {
        // 改变nav请求方法
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'head',
          value: {
            icon: 'httpMock',
            color: '',
          },
        });
        // 改变banner请求方法
        changeBannerInfoById({
          id: currentSelectNav._id,
          field: 'method' as any,
          value: httpMockDetail.requestCondition.method,
        });
        // 改变origindoc的值
        replaceOriginHttpMockNode();
        // 改变nav未保存小圆点
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'saved',
          value: true,
        });
        cacheHttpMockNode();
      }).catch((err) => {
        // 改变nav未保存小圆点
        changeNavInfoById({
          id: currentSelectNav._id,
          field: 'saved',
          value: false,
        });
        console.error(err);
      }).finally(() => {
        httpMockNodeSaveLoading.value = false;
      });
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
      logger.error('检查Mock状态失败', { error });
      return false;
    }
  };

  
  return {
    // 基础状态
    httpMock,
    originHttpMock,
    httpMockNodeSaveLoading,
    httpMockNodeRefreshLoading,
    // 缓存操作方法
    cacheHttpMockNode,
    getCachedHttpMockNodeById,
    // 基础状态变更方法
    replaceHttpMockNode,
    replaceOriginHttpMockNode,
    changeHttpMockNodeRefreshLoading,
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
