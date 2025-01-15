import { ApidocCookieInfo } from "@src/types/apidoc/base-info"
import { defineStore } from "pinia"
import { ref } from "vue"
import { generateEmptyResponse } from "@src/main/utils"
import { DeepPartial, ResponseInfo } from "@src/types/types"
import assign from "lodash/assign"

export const useApidocResponse = defineStore('apidocResponse', () => {
  const responseInfo = ref<ResponseInfo>(generateEmptyResponse())
  const requestState = ref<'waiting' | 'sending' | 'response' | 'finish'>('waiting'); //请求状态
  const cookies = ref<ApidocCookieInfo[]>([])
  const loadingProcess = ref({
    percent: 0,
    total: 0,
    transferred: 0,
  })
  
  /*
  |--------------------------------------------------------------------------
  | 方法
  |--------------------------------------------------------------------------
  */
  const changeResponseInfo = (payload: DeepPartial<ResponseInfo>) => {
    assign(responseInfo.value, payload)
  }
  const changeRequestState = (payload: 'waiting' | 'sending' | 'response' | 'finish') => {
    requestState.value = payload
  }
  const changeCookies = (payload: ApidocCookieInfo[]) => {
    cookies.value = payload
  }
  const changeLoadingProcess = (payload: Partial<typeof loadingProcess.value>) => {
    assign(loadingProcess.value, payload)
  }
  return {
    responseInfo,
    cookies,
    loadingProcess,
    requestState,
    changeResponseInfo,
    changeRequestState,
    changeCookies,
    changeLoadingProcess,
}})