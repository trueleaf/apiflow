/*
|--------------------------------------------------------------------------
| 请求方法相关处理
|--------------------------------------------------------------------------
|
*/
import { ComputedRef, computed, WritableComputedRef } from 'vue'
import { i18n } from '@/i18n'
import { ApidocRequestMethodRule, HttpNodeRequestMethod } from '@src/types';
import { useApidoc } from '@/store/apidoc/apidoc';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';

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
  const apidocStore = useApidoc()
  const apidocBaseInfo = useApidocBaseInfo()
  //请求方法
  const requestMethod = computed({
    get() {
      return apidocStore.apidoc.item.method;
    },
    set(method: HttpNodeRequestMethod) {
      apidocStore.changeApidocMethod(method)
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
