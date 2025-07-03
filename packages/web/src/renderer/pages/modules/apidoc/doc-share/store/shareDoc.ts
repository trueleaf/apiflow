import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ApidocVariable } from '@src/types/global';
import { getObjectVariable } from '@/utils/utils';

export const useShareDocStore = defineStore('shareDoc', () => {
  /*
  |--------------------------------------------------------------------------
  | 变量定义
  |--------------------------------------------------------------------------
  */
  const variables = ref<ApidocVariable[]>([]);
  const objectVariable = ref<Record<string, any>>({});
  const projectInfo = ref<any>({});
  const docs = ref<any[]>([]);

  const replaceVariables = (varList: ApidocVariable[]) => {
    variables.value.splice(0, variables.value.length, ...varList);
    getObjectVariable(variables.value).then((value) => {
      objectVariable.value = value;
    });
  };
  const clearVariables = () => {
    variables.value = [];
    objectVariable.value = {};
  };

  const setProjectInfo = (info: any) => {
    projectInfo.value = info || {};
  };
  const setDocs = (docsList: any[]) => {
    docs.value = docsList || [];
  };

  /*
  |--------------------------------------------------------------------------
  | 生命周期函数
  |--------------------------------------------------------------------------
  */

  return {
    variables,
    objectVariable,
    replaceVariables,
    clearVariables,
    projectInfo,
    docs,
    setProjectInfo,
    setDocs,
  };
}); 