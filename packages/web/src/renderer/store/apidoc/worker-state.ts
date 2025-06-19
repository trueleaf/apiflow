import { defineStore } from "pinia";
import { ref } from "vue";

export const useApidocWorkerState = defineStore('apidocWorkerState', () => {
  const sessionStorage = ref<Record<string, Record<string, unknown>>>({})
  const localState = ref<Record<string, Record<string, unknown>>>({})
  const remoteState = ref<Record<string, Record<string, unknown>>>({})

  const changesessionStorage = (payload: { projectId: string, value: Record<string, unknown> }): void => {
    sessionStorage.value[payload.projectId] = payload.value;
  }

  const changeLocalState = (payload: { projectId: string, value: Record<string, unknown> }): void => {
    localState.value[payload.projectId] = payload.value;
  }
  return {
    sessionStorage,
    localState,
    remoteState,
    changesessionStorage,
    changeLocalState
  }
})
