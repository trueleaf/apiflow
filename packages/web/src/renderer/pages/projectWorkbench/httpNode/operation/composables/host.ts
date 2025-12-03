import { ref, Ref, computed, WritableComputedRef } from 'vue'
import { useHttpNode } from '@/store/httpNode/httpNodeStore'
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
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
     * 改变host值
     */
  handleChangeHost: (host: string | number | boolean) => void,
}

export default (): HostReturn => {
  const httpNodeStore = useHttpNode()
  const httpRedoUndoStore = useHttpRedoUndo()
  const projectNavStore = useProjectNav()
  const projectId = router.currentRoute.value.query.id as string;
  const currentSelectNav = computed(() => {
    const navs = projectNavStore.navs[projectId];
    return navs?.find((nav) => nav.selected) || null;
  });
  //host弹窗
  const hostDialogVisible = ref(false);
  //prefix值
  const host = computed<string>({
    get() {
      return httpNodeStore.httpNodeInfo.item.url.prefix
    },
    set(val) {
      if (!currentSelectNav.value) return;
      const oldValue = httpNodeStore.httpNodeInfo.item.url.prefix;
      if (oldValue !== val) {
        // 记录URL前缀变化操作
        httpRedoUndoStore.recordOperation({
          nodeId: currentSelectNav.value._id,
          type: "prefixOperation",
          operationName: "修改URL前缀",
          affectedModuleName: "prefix",
          oldValue,
          newValue: val,
          timestamp: Date.now()
        });
      }
      httpNodeStore.changeHttpNodePrefix(val);
    },
  });
    //改变host的值
  const handleChangeHost = (server: string | number | boolean) => {
    if (!currentSelectNav.value) return;
    const oldValue = httpNodeStore.httpNodeInfo.item.url.prefix;
    const newValue = server as string;
    if (oldValue !== newValue) {
      // 记录URL前缀变化操作
      httpRedoUndoStore.recordOperation({
        nodeId: currentSelectNav.value._id,
        type: "prefixOperation",
        operationName: "修改URL前缀",
        affectedModuleName: "prefix",
        oldValue,
        newValue,
        timestamp: Date.now()
      });
    }
    httpNodeStore.changeHttpNodePrefix(newValue);
  }
  return {
    hostDialogVisible,
    host,
    handleChangeHost,
  }
}
