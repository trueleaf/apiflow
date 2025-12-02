import { getUrl } from "@/server/request/request.ts";
import { ApidocRequest } from "@src/types/apidoc/request";
import { debounce } from "lodash-es";
import { defineStore } from "pinia";
import { ref, toRaw, watch } from "vue";
import { useHttpNode } from "./httpNodeStore.ts";
import { useVariable } from "../apidocProject/variablesStore.ts";

export const useApidocRequest = defineStore('apidocRequest', () => {
  const url = ref('');
  const httpNodeStore = useHttpNode();
  const apidocVaribleStore = useVariable();
  const encodedUrl = ref('');
  const fullUrl = ref('');
  const headers = ref<ApidocRequest['headers']>({})
  const method = ref('')
  const body = ref<string | FormData>('');
  const cancelRequestRef = ref<(() => void) | null>(null);
  const cancelRequest = () => {
    cancelRequestRef.value?.();
    if (cancelRequestRef.value) {
      cancelRequestRef.value = null;
    }
  }
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
  const changeCancelRequestRef = (cancelRequest: () => void | null) => {
    cancelRequestRef.value = cancelRequest;
  }
  const getFullUrl = debounce(async () => {
    fullUrl.value = await getUrl(toRaw(httpNodeStore.$state.apidoc));
  }, 500, {
    leading: true,
  });
  watch([() => {
    return httpNodeStore.apidoc.item;
  }, () => {
    return apidocVaribleStore.objectVariable;
  }], () => {
    getFullUrl()
  }, {
    deep: true,
    immediate: true
  })
  return {
    fullUrl,
    url,
    headers,
    method,
    body,
    encodedUrl,
    changeFinalRequestInfo,
    cancelRequest,
    changeCancelRequestRef
  }
})
