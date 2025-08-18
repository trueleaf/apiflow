import { getObjectVariable } from "@/utils/utils";
import { ApidocVariable } from "@src/types";
import { defineStore } from "pinia"
import { ref } from 'vue';

export const useVariable = defineStore('apidocVariable', () => {
  const variables = ref<ApidocVariable[]>([]);
  const objectVariable = ref<Record<string, any>>({})
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
  }
  //替换所有变量
  const replaceVariables = (varList: ApidocVariable[]) => {
    variables.value.splice(0, varList.length, ...varList);
    getObjectVariable(variables.value).then((value) => {
      objectVariable.value = value;
    })
  }
  return {
    variables,
    objectVariable,
    changeVariableById,
    replaceVariables,
  }
})