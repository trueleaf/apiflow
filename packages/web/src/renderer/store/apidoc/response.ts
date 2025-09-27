import { ApidocCookieInfo } from "@src/types/apidoc/base-info"
import { defineStore } from "pinia"
import { ref } from "vue"
import { generateEmptyResponse } from "@src/renderer/helper"
import { ChunkWithTimestampe, DeepPartial, ResponseInfo } from "@src/types/types"
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
      const body = payload.body as unknown;
      if (body instanceof Uint8Array) {
        // 复制到新的 Uint8Array，确保使用标准 ArrayBuffer（规避 SharedArrayBuffer 类型不兼容）
        const copy = new Uint8Array(body);
        const blob = new Blob([copy], { type: payload.contentType });
        const blobUrl = URL.createObjectURL(blob);
        if (payload.responseData && payload.responseData.fileData) {
          payload.responseData.fileData.url = blobUrl;
        }
      }
    }
    assign(responseInfo.value, payload);
  }
  const changeFileBlobUrl = (rawBody: Uint8Array, contentType: string) => {
    const copy = new Uint8Array(rawBody);
    const blob = new Blob([copy], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);
    responseInfo.value.responseData.fileData.url = blobUrl;
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
  // 设置某个文档id是否允许缓存,超大返回数据不允许缓存
  const changeResponseCacheAllowed = (docId: string, allowed: boolean) => {
    responseCacheAllowedMap.value[docId] = allowed;
  };
  //添加streamData
  const addStreamData = (chunk: ChunkWithTimestampe) => {
    responseInfo.value.responseData.streamData.push(chunk);
  }
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
    addStreamData,
  }
})