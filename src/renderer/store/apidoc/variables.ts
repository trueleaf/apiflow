import { ApidocVariable } from "@src/types/global";
import { defineStore } from "pinia"
import { ref } from 'vue';

export const useVariable = defineStore('apidocVariable', () => {
  const variables = ref<ApidocVariable[]>([]);

  //改变变量值
  const changeVariableById = (id: string, varInfo: ApidocVariable) => {
    variables.value.forEach((item) => {
      if (item._id === id) {
        Object.assign(item, varInfo)
      }
    })
  }
  //替换所有变量
  const replaceVariables = (varList: ApidocVariable[]) => {
    variables.value.splice(0, varList.length, ...varList)
  }
  return {
    variables,
    changeVariableById,
    replaceVariables,
  }
})