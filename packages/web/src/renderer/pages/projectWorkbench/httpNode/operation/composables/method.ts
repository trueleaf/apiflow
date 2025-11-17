import { ComputedRef, computed, WritableComputedRef } from 'vue'
import { i18n } from '@/i18n'
import { ApidocRequestMethodRule, HttpNodeRequestMethod } from '@src/types';
import { useHttpNode } from '@/store/apidoc/httpNodeStore';
import { useApidocBaseInfo } from '@/store/apidoc/baseInfoStore';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore';
import { useApidocTas } from '@/store/apidoc/tabsStore';
import { router } from '@/router';

type MethodReturn = {
  /**
     * 请求地址
     */
  requestMethod: WritableComputedRef<string>,
  /**
     * 请求方法枚举
     */
  requestMethodEnum: ComputedRef<ApidocRequestMethodRule[]>,
  /**
     * 禁用请求方法后提示信息
     */
  disabledTip: (item: ApidocRequestMethodRule) => void,
}

export default (): MethodReturn => {
  const httpNodeStore = useHttpNode()
  const apidocBaseInfo = useApidocBaseInfo()
  const httpRedoUndoStore = useHttpRedoUndo()
  const apidocTabsStore = useApidocTas()
  const projectId = router.currentRoute.value.query.id as string;
  const currentSelectTab = computed(() => {
    const tabs = apidocTabsStore.tabs[projectId];
    return tabs?.find((tab) => tab.selected) || null;
  });
  //请求方法
  const requestMethod = computed({
    get() {
      return httpNodeStore.apidoc.item.method;
    },
    set(method: HttpNodeRequestMethod) {
      if (!currentSelectTab.value) return;
      const oldValue = httpNodeStore.apidoc.item.method;
      if (oldValue !== method) {
        // 记录请求方法变化操作
        httpRedoUndoStore.recordOperation({
          nodeId: currentSelectTab.value._id,
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
    //禁用请求方法后提示信息
  const disabledTip = (item: ApidocRequestMethodRule) => {
    if (!item.isEnabled) {
      return i18n.global.t('当前请求方法被禁止，可以在全局配置中进行相关配置');
    }
    return '';
  }
  //请求方法枚举
  const requestMethodEnum = computed(() => apidocBaseInfo.rules.requestMethods);

  return {
    requestMethod,
    disabledTip,
    requestMethodEnum,
  }
}
