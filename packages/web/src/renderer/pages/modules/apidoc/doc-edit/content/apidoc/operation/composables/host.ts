/*
|--------------------------------------------------------------------------
| Host相关处理
|--------------------------------------------------------------------------
|
*/
import { ref, Ref, computed, WritableComputedRef, ComputedRef } from 'vue'
import { apidocCache } from '@/cache/apidoc'
import { router } from '@/router/index'
import { ApidocProjectHost } from '@src/types/apidoc/base-info'
import { useApidoc } from '@/store/apidoc/apidoc'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useApidocMock } from '@/store/apidoc/mock'

type HostReturn = {
  /**
     * mock服务器地址
     */
  mockServer: Ref<string>,
  /**
     * host弹窗
     */
  hostDialogVisible: Ref<boolean>,
  /**
     * host值
     */
  host: WritableComputedRef<string>,
  /**
     * host枚举值
     */
  hostEnum: ComputedRef<ApidocProjectHost[]>,
  /**
     * 改变host值
     */
  handleChangeHost: (host: string | number | boolean) => void,
}

export default (): HostReturn => {
  const apidocStore = useApidoc()
  const apidocBaseInfoStore = useApidocBaseInfo()
  const apidocMockStore = useApidocMock()
  const ipAddress = window.electronAPI?.ip
  //mock服务器地址
  const mockServer = computed(() => `http://${ipAddress}:${apidocMockStore.mockServerPort}`);
  //host弹窗
  const hostDialogVisible = ref(false);
  //host值
  const host = computed<string>({
    get() {
      return apidocStore.apidoc.item.url.host
    },
    set(val) {
      apidocStore.changeApidocHost(val);
    },
  });
    //改变host的值
  const handleChangeHost = (server: string | number | boolean) => {
    const projectId = router.currentRoute.value.query.id as string;
    apidocCache.setPreviousServer(projectId, server as string);
  }
  //host枚举值
  const hostEnum = computed<ApidocProjectHost[]>(() => {
    const projectId = router.currentRoute.value.query.id as string;
    const localData: Ref<ApidocProjectHost[]> = ref([])
    localData.value = apidocCache.getApidocServer(projectId)
    return apidocBaseInfoStore.hosts.concat(localData.value)
  })
  return {
    mockServer,
    hostDialogVisible,
    host,
    hostEnum,
    handleChangeHost,
  }
}
