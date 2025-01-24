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
    //重新生成blobUrl
    const type = payload.responseData?.canApiflowParseType;
    if (type === 'image') {
      const blob = new Blob([payload.body as Uint8Array], { type: payload.contentType });
      const blobUrl = URL.createObjectURL(blob);
      payload.responseData!.fileData!.url = blobUrl;
    }
    assign(responseInfo.value, payload)
    //生成加载进度数据
    loadingProcess.value.percent = 1
    loadingProcess.value.transferred = payload.bodyByteLength || 0
    loadingProcess.value.total = payload.bodyByteLength || 0

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
  const clearResponse = () => {
    responseInfo.value = generateEmptyResponse()
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
    clearResponse,
}})