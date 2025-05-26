import { ApidocCookieInfo } from "@src/types/apidoc/base-info"
import { defineStore } from "pinia"
import { ref } from "vue"
import { generateEmptyResponse } from "@src/main/utils"
import { CanApiflowParseType, DeepPartial, ResponseInfo } from "@src/types/types"
import assign from "lodash/assign"

export const useApidocResponse = defineStore('apidocResponse', () => {
  const responseInfo = ref<ResponseInfo>(generateEmptyResponse())
  const requestState = ref<'waiting' | 'sending' | 'response' | 'finish'>('waiting'); //请求状态
  const rawResponseBody = ref<Uint8Array | string>(''); //响应体
  const cookies = ref<ApidocCookieInfo[]>([]);
  const loadingProcess = ref({
    percent: 0,
    total: 0,
    transferred: 0,
  })
  // 记录每个文档id是否允许缓存
  const responseCacheAllowedMap = ref<Record<string, boolean>>({});

  /*
  |--------------------------------------------------------------------------
  | 方法
  |--------------------------------------------------------------------------
  */
  const changeResponseBody = (body: unknown) => {
    rawResponseBody.value = body as Uint8Array | string
  }
  const changeResponseInfo = (payload: DeepPartial<ResponseInfo>) => {
    //重新生成blobUrl
    const type = payload.responseData?.canApiflowParseType;
    if (type === 'image' || type === 'word' || type === 'pdf' || type === 'excel' || type === 'ppt' || type === 'video') {
      const blob = new Blob([payload.body as Uint8Array], { type: payload.contentType });
      const blobUrl = URL.createObjectURL(blob);
      payload.responseData!.fileData!.url = blobUrl;
    }
    assign(responseInfo.value, payload);
    //生成加载进度数据
    loadingProcess.value.percent = 1
    loadingProcess.value.transferred = payload.bodyByteLength || 0
    loadingProcess.value.total = payload.bodyByteLength || 0
  }
  const changeFileBlobUrl = (rawBody: Uint8Array, type: CanApiflowParseType, contentType: string) => {
    if (type === 'image' || type === 'word' || type === 'pdf' || type === 'excel' || type === 'ppt' || type === 'video') {
      const blob = new Blob([rawBody], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      responseInfo.value.responseData.fileData.url = blobUrl;
    }
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
  // 设置某个文档id是否允许缓存
  const changeResponseCacheAllowed = (docId: string, allowed: boolean) => {
    responseCacheAllowedMap.value[docId] = allowed;
  };
  return {
    responseInfo,
    cookies,
    loadingProcess,
    requestState,
    rawResponseBody,
    responseCacheAllowedMap,
    changeResponseInfo,
    changeFileBlobUrl,
    changeResponseBody,
    changeRequestState,
    changeCookies,
    changeLoadingProcess,
    clearResponse,
    changeResponseCacheAllowed,
  }
})