import { ref, Ref, computed, WritableComputedRef, ComputedRef } from 'vue'
import { ApidocProjectHost } from '@src/types'
import { useApidoc } from '@/store/apidoc/apidoc'
import { useApidocBaseInfo } from '@/store/apidoc/base-info'
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/apidoc/tabs'
import { router } from '@/router'

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
  const httpRedoUndoStore = useHttpRedoUndo()
  const apidocTabsStore = useApidocTas()
  const projectId = router.currentRoute.value.query.id as string;
  const currentSelectTab = computed(() => {
    const tabs = apidocTabsStore.tabs[projectId];
    return tabs?.find((tab) => tab.selected) || null;
  });
  //host弹窗
  const hostDialogVisible = ref(false);
  //prefix值
  const host = computed<string>({
    get() {
      return apidocStore.apidoc.item.url.prefix
    },
    set(val) {
      if (!currentSelectTab.value) return;
      const oldValue = apidocStore.apidoc.item.url.prefix;
      if (oldValue !== val) {
        // 记录URL前缀变化操作
        httpRedoUndoStore.recordOperation({
          nodeId: currentSelectTab.value._id,
          type: "prefixOperation",
          operationName: "修改URL前缀",
          affectedModuleName: "prefix",
          oldValue,
          newValue: val,
          timestamp: Date.now()
        });
      }
      apidocStore.changeApidocPrefix(val);
    },
  });
    //改变host的值
  const handleChangeHost = (server: string | number | boolean) => {
    if (!currentSelectTab.value) return;
    const oldValue = apidocStore.apidoc.item.url.prefix;
    const newValue = server as string;
    if (oldValue !== newValue) {
      // 记录URL前缀变化操作
      httpRedoUndoStore.recordOperation({
        nodeId: currentSelectTab.value._id,
        type: "prefixOperation",
        operationName: "修改URL前缀",
        affectedModuleName: "prefix",
        oldValue,
        newValue,
        timestamp: Date.now()
      });
    }
    apidocStore.changeApidocPrefix(newValue);
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
