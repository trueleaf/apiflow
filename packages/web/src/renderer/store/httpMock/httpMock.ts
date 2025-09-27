import { MockHttpNode } from "@src/types/mock/mock.ts";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { uuid, cloneDeep, generateEmptyHttpMockNode } from "@/helper";
import { standaloneCache } from "@/cache/standalone.ts";
import { httpMockNodeCache } from "@/cache/httpMock/httpMockNodeCache.ts";
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

  /*
  |--------------------------------------------------------------------------
  | 缓存操作方法
  |--------------------------------------------------------------------------
  */
  // 缓存当前httpMock配置
  const cacheHttpMock = (): void => {
    if (httpMock.value) {
      httpMockNodeCache.setHttpMockNode(httpMock.value);
    }
  };

  // 从缓存获取httpMock配置
  const getCachedHttpMockById = (id: string): MockHttpNode | null => {
    return httpMockNodeCache.getHttpMockNode(id);
  };

  /*
  |--------------------------------------------------------------------------
  | 基础状态变更方法
  |--------------------------------------------------------------------------
  */
  // 重新赋值httpMock数据
  const changeHttpMock = (payload: MockHttpNode): void => {
    httpMock.value = payload;
    cacheHttpMock();
  };

  // 改变httpMock原始缓存值
  const changeOriginHttpMock = (): void => {
    originHttpMock.value = cloneDeep(httpMock.value);
  };

  // 改变httpMock数据保存状态
  const changeSaveLoading = (state: boolean): void => {
    saveLoading.value = state;
  };

  /*
  |--------------------------------------------------------------------------
  | 基础信息操作方法
  |--------------------------------------------------------------------------
  */
  // 改变httpMock名称
  const changeHttpMockName = (name: string): void => {
    if (!httpMock.value) return;
    httpMock.value.info.name = name;
  };

  // 改变httpMock描述
  const changeHttpMockDescription = (description: string): void => {
    if (!httpMock.value) return;
    httpMock.value.info.description = description;
  };

  // 改变HTTP方法
  const changeHttpMethod = (method: MockHttpNode['requestCondition']['method']): void => {
    if (!httpMock.value) return;
    httpMock.value.requestCondition.method = method;
  };

  // 改变请求URL
  const changeRequestUrl = (url: string): void => {
    if (!httpMock.value) return;
    httpMock.value.requestCondition.url = url;
  };

  // 改变端口
  const changePort = (port: number): void => {
    if (!httpMock.value) return;
    httpMock.value.requestCondition.port = port;
  };



  /*
  |--------------------------------------------------------------------------
  | 配置操作方法
  |--------------------------------------------------------------------------
  */
  // 改变延迟时间
  const changeDelay = (delay: number): void => {
    if (!httpMock.value) return;
    httpMock.value.config.delay = delay;
  };

  /*
  |--------------------------------------------------------------------------
  | 数据比较方法
  |--------------------------------------------------------------------------
  */
  // 检查httpMock是否发生改变
  const checkHttpMockIsEqual = (current: MockHttpNode, origin: MockHttpNode): boolean => {
    const cpCurrent: MockHttpNode = JSON.parse(JSON.stringify(current));
    const cpOrigin: MockHttpNode = JSON.parse(JSON.stringify(origin));
    
    // 检查基本信息
    const nameIsEqual = cpCurrent.info.name === cpOrigin.info.name;
    const descriptionIsEqual = cpCurrent.info.description === cpOrigin.info.description;
    
    // 检查请求条件
    const methodIsEqual = JSON.stringify(cpCurrent.requestCondition.method) === JSON.stringify(cpOrigin.requestCondition.method);
    const urlIsEqual = cpCurrent.requestCondition.url === cpOrigin.requestCondition.url;
    const portIsEqual = cpCurrent.requestCondition.port === cpOrigin.requestCondition.port;
    
    // 检查配置
    const delayIsEqual = cpCurrent.config.delay === cpOrigin.config.delay;
    
    return nameIsEqual && descriptionIsEqual && methodIsEqual && 
           urlIsEqual && portIsEqual && delayIsEqual;
  };

  /*
  |--------------------------------------------------------------------------
  | 时间戳操作方法
  |--------------------------------------------------------------------------
  */
  // 标记为已删除
  const markHttpMockAsDeleted = (deleted: boolean = true): void => {
    if (httpMock.value) {
      httpMock.value.isDeleted = deleted;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 接口调用
  |--------------------------------------------------------------------------
  */
  // 获取HttpMock详情
  const getHttpMockDetail = async (payload: { id: string, projectId: string }): Promise<void> => {
    if (isOffline()) {
      const doc = await standaloneCache.getDocById(payload.id) as MockHttpNode;
      if (!doc) {
        // 如果standalone中没有找到，尝试从缓存中获取
        const cachedHttpMock = getCachedHttpMockById(payload.id);
        if (cachedHttpMock) {
          changeHttpMock(cachedHttpMock);
          changeOriginHttpMock();
          return;
        }
        
        ElMessageBox.confirm('当前HttpMock不存在，可能已经被删除!', '提示', {
          confirmButtonText: '关闭接口',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          // TODO: 删除tab的逻辑需要根据实际情况实现
          console.log('删除HttpMock tab');
        }).catch((err) => {
          if (err === 'cancel' || err === 'close') {
            return;
          }
          console.error(err);
        });
        return;
      }
      changeHttpMock(doc);
      changeOriginHttpMock();
      // 缓存到本地存储
      cacheHttpMock();
      return;
    } else {
      // 非standalone模式下尝试从缓存中获取
      const cachedHttpMock = getCachedHttpMockById(payload.id);
      if (cachedHttpMock) {
        changeHttpMock(cachedHttpMock);
        changeOriginHttpMock();
        return;
      }
      console.log('getHttpMockDetail called but not in standalone mode and no cache found');
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 保存HttpMock
  |--------------------------------------------------------------------------
  */
  // 保存HttpMock配置
  const saveHttpMock = async (): Promise<void> => {
    const { changeTabInfoById } = useApidocTas();
    const { changeBannerInfoById } = useApidocBanner()
    const { tabs } = storeToRefs(useApidocTas())
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
      await standaloneCache.updateDoc(httpMockDetail);
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
      changeOriginHttpMock();
      //改变tab未保存小圆点
      changeTabInfoById({
        id: currentSelectTab._id,
        field: 'saved',
        value: true,
      })
      cacheHttpMock();
      // 添加0.1秒的saveLoading效果
      setTimeout(() => {
        saveLoading.value = false;
      }, 100);
    } else {
      console.log('todo');
      cacheHttpMock();
      saveLoading.value = false;
    }
  };
  
  return {
    // 基础状态
    httpMock,
    originHttpMock,
    saveLoading,
    refreshLoading,
    // 缓存操作方法
    cacheHttpMock,
    getCachedHttpMockById,
    // 基础状态变更方法
    changeHttpMock,
    changeOriginHttpMock,
    changeSaveLoading,
    // 基础信息操作方法
    changeHttpMockName,
    changeHttpMockDescription,
    // 请求条件操作方法
    changeHttpMethod,
    changeRequestUrl,
    changePort,
    // 配置操作方法
    changeDelay,
    // 数据比较方法
    checkHttpMockIsEqual,
    // 时间戳操作方法
    markHttpMockAsDeleted,
    // 接口调用
    getHttpMockDetail,
    saveHttpMock,
  }
})