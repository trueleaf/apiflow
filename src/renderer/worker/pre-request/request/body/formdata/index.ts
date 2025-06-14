import { OnSetFormdataEvent, OnDeleteFormdataEvent, AF } from '../../../types/types';

type FormdataItem = AF['request']['body']['formdata'];
const _formdata: FormdataItem = {};
const handler = {
  get(target: FormdataItem, key: string) {
    return target[key];
  },
  set(target: FormdataItem, key: string, value: { type: 'file' | 'string', path: string } | string) {
    // console.log(key, value, target[key], 1)
    if (typeof value === 'string') {
      if (!target[key]) {
        target[key] = {
          type: 'string',
          value: '',
        };
      }
      target[key].type = 'string';
      target[key].value = value;
       self.postMessage({
        type: 'pre-request-set-formdata',
        value: JSON.parse(JSON.stringify(target)),
      } as OnSetFormdataEvent);
    } else if (value.type === 'file') {
      target[key] = {
        type: 'file',
        value: value.path,
      };
      self.postMessage({
        type: 'pre-request-set-formdata',
        value: JSON.parse(JSON.stringify(target)),
      } as OnSetFormdataEvent);
    }  else if (value.type === 'string') {
      target[key] = {
        type: 'string',
        value: value.path,
      };
      self.postMessage({
        type: 'pre-request-set-formdata',
        value: JSON.parse(JSON.stringify(target)),
      } as OnSetFormdataEvent);
    } else {
      console.warn(`formdata参数在给 【${key}】 字段赋值时出错，formdata参数值类型只能为字符串或者为getFile(path: string)，传入值类型为${Object.prototype.toString.call(value)}},此操作将被忽略`);
      return true;
    }
    return true;
  },
  deleteProperty(target: FormdataItem, key: string) {
    delete target[key];
    self.postMessage({
      type: 'pre-request-delete-formdata',
      value: JSON.parse(JSON.stringify(target)),
    } as OnDeleteFormdataEvent);
    return true;
  },
};
export const formdata = new Proxy(_formdata, handler);
