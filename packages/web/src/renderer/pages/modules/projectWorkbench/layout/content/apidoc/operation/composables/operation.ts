import { ref, Ref, computed } from 'vue'
import { router } from '@/router/index'
import { sendRequest, stopRequest } from '@/server/request/request'
import { httpResponseCache } from '@/cache/httpNode/httpResponseCache'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useApidocResponse } from '@/store/apidoc/response'
import { useApidoc } from '@/store/apidoc/apidoc'
import { useRuntime } from '@/store/runtime/runtime'

type OperationReturn = {
  /**
     * 保存接口
     */
  loading2: Ref<boolean>,
  /**
    * 刷新接口
    */
  loading3: Ref<boolean>,
  /**
     * 发送请求
     */
  handleSendRequest: () => void,
  /**
     * 停止请求
     */
  handleStopRequest: () => void,
  /**
     * 刷新文档
     */
  handleFreshApidoc: () => void,
}

export default (): OperationReturn => {
  const apidocTabsStore = useApidocTas();
  const apidocStore = useApidoc()
  const apidocResponseStroe = useApidocResponse()
  const runtimeStore = useRuntime()
  const loading2 = ref(false); //保存接口
  const loading3 = ref(false); //刷新接口
  const projectId = router.currentRoute.value.query.id as string;
  const isOffline = () => runtimeStore.networkMode === 'offline';
  const currentSelectTab = computed(() => {
    const tabs = apidocTabsStore.tabs[projectId];
    const currentTab = tabs?.find((tab) => tab.selected) || null;
    return currentTab;
  });
    //发送请求
  const handleSendRequest = () => {
    sendRequest()
  }
  //停止请求
  const handleStopRequest = () => {
    stopRequest();
  };
    //刷新文档
  const handleFreshApidoc = () => {
    loading3.value = true;
    // todo
    apidocResponseStroe.changeRequestState('waiting');
    apidocResponseStroe.clearResponse()
    if (currentSelectTab.value) {
      httpResponseCache.deleteResponse(currentSelectTab.value._id);
    }
    if (currentSelectTab.value?._id.startsWith('local_')) { //通过+按钮新增的空白文档
      const cpOriginApidoc = apidocStore.originApidoc;
      apidocStore.changeApidoc(JSON.parse(JSON.stringify(cpOriginApidoc)))
      loading3.value = false;
      return;
    }
    
    const executeRefresh = () => {
      apidocStore.getApidocDetail({
        id: currentSelectTab.value?._id || "",
        projectId,
      }).finally(() => {
        loading3.value = false;
      })
    };
    
    // 在standalone模式下添加100毫秒延迟，提供加载效果
    if (isOffline()) {
      setTimeout(() => {
        executeRefresh();
      }, 100);
    } else {
      executeRefresh();
    }
  };
  return {
    loading2,
    loading3,
    handleSendRequest,
    handleStopRequest,
    // handleSaveApidoc,
    handleFreshApidoc,
  }
}
