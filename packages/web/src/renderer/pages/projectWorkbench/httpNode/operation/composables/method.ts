import { ComputedRef, computed, WritableComputedRef } from 'vue'
import { HttpNodeRequestMethod } from '@src/types';
import { useHttpNode } from '@/store/httpNode/httpNodeStore';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore';
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore';
import { router } from '@/router';
import { requestMethods } from '@/data/data';

type RequestMethodItem = (typeof requestMethods)[number];

type MethodReturn = {
  /**
     * 请求地址
     */
  requestMethod: WritableComputedRef<string>,
  /**
     * 请求方法枚举
     */
  requestMethodEnum: ComputedRef<RequestMethodItem[]>,
}

export default (): MethodReturn => {
  const httpNodeStore = useHttpNode()
  const httpRedoUndoStore = useHttpRedoUndo()
  const projectNavStore = useProjectNav()
  const projectId = router.currentRoute.value.query.id as string;
  const currentSelectNav = computed(() => {
    const navs = projectNavStore.navs[projectId];
    return navs?.find((nav) => nav.selected) || null;
  });
  //请求方法
  const requestMethod = computed({
    get() {
      return httpNodeStore.apidoc.item.method;
    },
    set(method: HttpNodeRequestMethod) {
      if (!currentSelectNav.value) return;
      const oldValue = httpNodeStore.apidoc.item.method;
      if (oldValue !== method) {
        // 记录请求方法变化操作
        httpRedoUndoStore.recordOperation({
          nodeId: currentSelectNav.value._id,
          type: "methodOperation",
          operationName: "修改请求方法",
          affectedModuleName: "method",
          oldValue,
          newValue: method,
          timestamp: Date.now()
        });
      }
      httpNodeStore.changeApidocMethod(method)
    },
  });
  //请求方法枚举
  const requestMethodEnum = computed(() => requestMethods);

  return {
    requestMethod,
    requestMethodEnum,
  }
}
