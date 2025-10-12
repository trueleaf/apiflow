import { ref, Ref, computed, WritableComputedRef, ComputedRef } from 'vue'
import { ApidocProjectHost } from '@src/types'
import { useApidoc } from '@/store/apidoc/apidoc'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'

type HostReturn = {
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
  //host弹窗
  const hostDialogVisible = ref(false);
  //prefix值
  const host = computed<string>({
    get() {
      return apidocStore.apidoc.item.url.prefix
    },
    set(val) {
      apidocStore.changeApidocPrefix(val);
    },
  });
    //改变host的值
  const handleChangeHost = (server: string | number | boolean) => {
    apidocStore.changeApidocPrefix(server as string);
  }
  //host枚举值
  const hostEnum = computed<ApidocProjectHost[]>(() => {
    return apidocBaseInfoStore.hosts
  })
  return {
    hostDialogVisible,
    host,
    hostEnum,
    handleChangeHost,
  }
}
