import { getObjectVariable } from '@/helper';
import { ApidocVariable } from "@src/types";
import { defineStore } from "pinia"
import { ref } from 'vue';
import { router } from '@/router';

export const useVariable = defineStore('projectVariable', () => {
  const variables = ref<ApidocVariable[]>([]);
  const objectVariable = ref<Record<string, unknown>>({})
  const requestTemporaryVariables = ref<Record<string, Record<string, string>>>({})
  // 同步变量到主进程
  const syncVariablesToMainProcess = async () => {
    if (!window.desktopAPI?.mock?.syncProjectVariables) {
      return;
    }
    try {
      const projectId = router.currentRoute.value.query.id as string;
      await window.desktopAPI.mock.syncProjectVariables(projectId, JSON.parse(JSON.stringify(variables.value)));
    } catch (error) {
      console.error(error);
    }
  };
  // 改变变量值
  const changeVariableById = async (id: string, varInfo: ApidocVariable) => {
    variables.value.forEach((item) => {
      if (item._id === id) {
        Object.assign(item, varInfo)
      }
    })
    const value = await getObjectVariable(variables.value);
    objectVariable.value = value;
    // 同步到主进程
    syncVariablesToMainProcess();
  }
  // 替换所有变量
  const replaceVariables = async (varList: ApidocVariable[]) => {
    variables.value.splice(0, variables.value.length, ...varList);
    const value = await getObjectVariable(variables.value);
    objectVariable.value = value;
    // 同步到主进程
    syncVariablesToMainProcess();
  }
  // 设置请求临时变量
  const setRequestTemporaryVariable = (nodeId: string, name: string, value: string): void => {
    requestTemporaryVariables.value = {
      ...requestTemporaryVariables.value,
      [nodeId]: {
        ...requestTemporaryVariables.value[nodeId],
        [name]: value,
      },
    }
  }
  // 获取请求临时变量
  const getRequestTemporaryVariables = (nodeId: string): Record<string, string> => {
    return requestTemporaryVariables.value[nodeId] || {}
  }
  return {
    variables,
    objectVariable,
    requestTemporaryVariables,
    changeVariableById,
    replaceVariables,
    setRequestTemporaryVariable,
    getRequestTemporaryVariables,
  }
})
