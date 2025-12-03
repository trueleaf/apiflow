import { getUrl } from "@/server/request/request.ts";
import { debounce } from "lodash-es";
import { defineStore } from "pinia";
import { ref, toRaw, watch } from "vue";
import { useHttpNode } from "./httpNodeStore.ts";
import { useVariable } from "../projectWorkbench/variablesStore.ts";

export const useApidocRequest = defineStore('apidocRequest', () => {
  const httpNodeStore = useHttpNode();
  const apidocVaribleStore = useVariable();
  const fullUrl = ref('');
  const cancelRequestRef = ref<(() => void) | null>(null);
  const cancelRequest = () => {
    cancelRequestRef.value?.();
    if (cancelRequestRef.value) {
      cancelRequestRef.value = null;
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
    cancelRequest,
    changeCancelRequestRef
  }
})
