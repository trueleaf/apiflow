import { ApidocVariable } from '@src/types/apidoc/base-info';
import { defineStore } from "pinia"
import { ref } from 'vue';

export const useApidocBaseInfo = defineStore('apidocBaseInfo', () => {
  const variables = ref<ApidocVariable[]>([{
    _id: '1',
    name: 'stringValue',
    value: 'abcd',
    description: '字符串数据',
    type: 'string'
  },
  {
    _id: '2',
    name: 'numberValue',
    value: '123',
    description: '数字数据',
    type: 'number'
  },
  {
    _id: '3',
    name: 'booleanValue',
    value: 'true',
    description: '布尔数据',
    type: 'boolean'
  },
  {
    _id: '4',
    name: 'arrayValue',
    value: '[1,2,3]',
    description: '数组数据',
    type: 'any'
  },
  {
    _id: '5',
    name: 'objectValue',
    value: '{"a":1,"b":2}',
    description: '对象数据',
    type: 'any'
  },
  {
    _id: '6',
    name: 'nullValue',
    value: '',
    description: '空数据',
    type: 'null'
  },
  {
    _id: '7',
    name: 'fileValue',
    value: '',
    description: '未定义数据',
    type: 'file'
  }
  ]);

  //改变变量值
  const changeVariableById = (id: string, varInfo: Partial<ApidocVariable>) => {
    variables.value.forEach((item) => {
      if (item._id === id && varInfo.name != null) {
        item.name = varInfo.name;
      }
      if (item._id === id && varInfo.value != null) {
        item.value = varInfo.value;
      }
      if (item._id === id && varInfo.description != null) {
        item.description = varInfo.description;
      }
      if (item._id === id && varInfo.type != null) {
        item.type = varInfo.type;
      }
    })
  }
  return {
    variables,
    changeVariableById,
  }
})