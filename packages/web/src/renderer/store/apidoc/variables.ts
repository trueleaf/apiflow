import { getObjectVariable } from "@/utils/utils";
import { ApidocVariable } from "@src/types";
import { defineStore } from "pinia"
import { ref } from 'vue';
import { router } from '@/router';

export const useVariable = defineStore('apidocVariable', () => {
  const variables = ref<ApidocVariable[]>([]);
  const objectVariable = ref<Record<string, any>>({})
  
  // 同步变量到主进程
  const syncVariablesToMainProcess = async () => {
    try {
      // 检查electronAPI是否可用
      if (!window.electronAPI) {
        return;
      }
      
      // 获取当前项目ID
      const projectId = router.currentRoute.value.query.id as string;
      if (!projectId) {
        return;
      }
      
      // 通过IPC同步到主进程
      await window.electronAPI.mock.syncProjectVariables(projectId, variables.value);
    } catch (error) {
      // 静默处理错误
    }
  };
  
  //改变变量值
  const changeVariableById = (id: string, varInfo: ApidocVariable) => {
    variables.value.forEach((item) => {
      if (item._id === id) {
        Object.assign(item, varInfo)
      }
    })
    getObjectVariable(variables.value).then((value) => {
      objectVariable.value = value;
    })
    // 同步到主进程
    syncVariablesToMainProcess();
  }
  //替换所有变量
  const replaceVariables = (varList: ApidocVariable[]) => {
    variables.value.splice(0, varList.length, ...varList);
    getObjectVariable(variables.value).then((value) => {
      objectVariable.value = value;
    })
    // 同步到主进程
    syncVariablesToMainProcess();
  }
  return {
    variables,
    objectVariable,
    changeVariableById,
    replaceVariables,
  }
})