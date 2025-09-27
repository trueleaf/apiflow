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
      
      // 检查Mock是否已启用，如果启用则更新主进程配置
      try {
        const isEnabled = await checkMockEnabledStatus(httpMockDetail._id);
        if (isEnabled && window.electronAPI?.mock?.replaceById) {
          // 准备更新数据，确保包含projectId
          const updateData = { ...httpMockDetail, projectId };
          const result = await window.electronAPI.mock.replaceById(httpMockDetail._id, updateData);
          if (!result.success) {
            console.warn('更新主进程Mock配置失败:', result.error);
            // 这里可以选择显示警告给用户，但不影响保存流程
          }
        }
      } catch (error) {
        console.warn('更新主进程Mock配置时发生错误:', error);
        // 不影响保存流程，只记录警告
      }
      
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

  /*
  |--------------------------------------------------------------------------
  | Mock服务状态管理
  |--------------------------------------------------------------------------
  */
  // 检查Mock是否已启用
  const checkMockEnabledStatus = async (nodeId: string): Promise<boolean> => {
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

  // 启动Mock服务
  const startMockServer = async (nodeId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!window.electronAPI?.mock?.startServer) {
        return { success: false, error: '无法访问Mock API' };
      }
      
      if (!httpMock.value) {
        return { success: false, error: 'Mock配置不存在' };
      }

      // 验证nodeId是否匹配
      if (httpMock.value._id !== nodeId) {
        return { success: false, error: 'Mock ID不匹配' };
      }

      // 从路由获取projectId
      const projectId = router.currentRoute.value.query.id as string;

      // 设置projectId到httpMock
      const mockData = { ...httpMock.value, projectId };
      const result = await window.electronAPI.mock.startServer(JSON.parse(JSON.stringify(mockData)));
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.errorMsg || '启动Mock服务失败' };
      }
    } catch (error) {
      console.error('启动Mock服务失败:', error);
      return { success: false, error: `启动失败: ${error instanceof Error ? error.message : '未知错误'}` };
    }
  };

  // 停止Mock服务
  const stopMockServer = async (nodeId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!window.electronAPI?.mock?.stopServer) {
        return { success: false, error: '无法访问Mock API' };
      }
      
      const result = await window.electronAPI.mock.stopServer(nodeId);
      
      if (result.success) {
        // 验证服务器确实已关闭
        const checkResult = await checkMockEnabledStatus(nodeId);
        if (checkResult) {
          console.warn('服务器关闭验证失败，但主进程报告成功');
          return { success: false, error: '服务器关闭验证失败' };
        }
        return { success: true };
      } else {
        return { success: false, error: result.error || '停止Mock服务失败' };
      }
    } catch (error) {
      console.error('停止Mock服务失败:', error);
      return { success: false, error: `停止失败: ${error instanceof Error ? error.message : '未知错误'}` };
    }
  };

  // 获取已使用端口
  const getUsedPorts = async (): Promise<{ port: number, projectId: string, nodeId: string, nodeName: string }[]> => {
    try {
      if (!window.electronAPI?.mock?.getUsedPorts) {
        console.error('无法访问Mock API');
        return [];
      }
      
      return await window.electronAPI.mock.getUsedPorts();
    } catch (error) {
      console.error('获取已使用端口失败:', error);
      return [];
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
    // Mock服务状态管理
    checkMockEnabledStatus,
    startMockServer,
    stopMockServer,
    getUsedPorts,
  }
})