import { ApidocRequest } from "@src/types/apidoc/request";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useApidocRequest = defineStore('apidocRequest', () => {
  const url = ref('');
  const encodedUrl = ref('');
  const headers = ref<ApidocRequest['headers']>({})
  const method = ref('')
  const body = ref<string | FormData>('')
  const changeFinalRequestInfo = (payload: Partial<ApidocRequest>): void => {
    if (payload.url != null) {
      url.value = payload.url;
    }
    if (payload.headers != null) {
      headers.value = payload.headers
    }
    if (payload.method != null) {
      method.value = payload.method;
    }
    if (payload.body != null) {
      body.value = payload.body;
    }
    if (payload.encodedUrl != null) {
      encodedUrl.value = payload.encodedUrl;
    }
  }
  return {
    url,
    headers,
    method,
    body,
    encodedUrl,
    changeFinalRequestInfo
  }
})