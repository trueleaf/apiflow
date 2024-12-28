/*
|--------------------------------------------------------------------------
| 请求操作：刷新、保存接口、发送请求等
|--------------------------------------------------------------------------
|
*/
import { ref, Ref, computed } from 'vue'
import { router } from '@/router/index'
import { sendRequest, stopRequest } from '@/server/request/request'
import { apidocCache } from '@/cache/apidoc'
import { useApidocTas } from '@/store/apidoc/tabs'
import { useApidocResponse } from '@/store/apidoc/response'
import { useApidoc } from '@/store/apidoc/apidoc'

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
  const loading2 = ref(false); //保存接口
  const loading3 = ref(false); //刷新接口
  const projectId = router.currentRoute.value.query.id as string;
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
    apidocResponseStroe.clearResponseInfo()
    if (currentSelectTab.value) {
      apidocCache.deleteResponse(currentSelectTab.value._id);
    }
    if (currentSelectTab.value?._id.startsWith('local_')) { //通过+按钮新增的空白文档
      const cpOriginApidoc = apidocStore.originApidoc;
      apidocStore.changeApidoc(JSON.parse(JSON.stringify(cpOriginApidoc)))
      loading3.value = false;
      return;
    }
    apidocStore.getApidocDetail({
      id: currentSelectTab.value?._id || "",
      projectId,
    }).finally(() => {
      loading3.value = false;
    })
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
