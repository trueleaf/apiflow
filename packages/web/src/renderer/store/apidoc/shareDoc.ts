import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ApidocVariable } from '@src/types/global';
import { getObjectVariable } from '@/utils/utils';

export const useShareDocStore = defineStore('shareDoc', () => {
  // 分享项目变量
  const variables = ref<ApidocVariable[]>([]);
  const objectVariable = ref<Record<string, any>>({});

  // 替换所有变量
  const replaceVariables = (varList: ApidocVariable[]) => {
    variables.value.splice(0, variables.value.length, ...varList);
    getObjectVariable(variables.value).then((value) => {
      objectVariable.value = value;
    });
  };

  // 清空变量
  const clearVariables = () => {
    variables.value = [];
    objectVariable.value = {};
  };

  return {
    variables,
    objectVariable,
    replaceVariables,
    clearVariables,
  };
}); 