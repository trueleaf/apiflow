import { OnSetBinaryBodyEvent, OnDeleteBinaryBodyEvent, AF } from '../../../types/types';

const _binary: AF['request']['body']['binary'] = {
  mode: 'variable',
  value: '',
};
const handler = {
  get(target: AF['request']['body']['binary'], key: string) {
    return target[key];
  },
  set(target: AF['request']['body']['binary'], key: string, value: string) {
    // console.log(key, value, 'binary')
    if (key === 'mode') {
      if (value !== 'variable' && value !== 'file') {
        console.warn(`binary body mode仅支持【variable】 和 【file】 两种模式，传入值为${value},此操作将被忽略`);
        return true;
      }
      target['mode'] = value as 'variable' | 'file';
      self.postMessage({
        type: 'pre-request-set-binary-body',
        value: JSON.parse(JSON.stringify(target)),
      } as OnSetBinaryBodyEvent);
    } else if (key === 'value') {
      target['value'] = value;
      self.postMessage({
        type: 'pre-request-set-binary-body',
        value: JSON.parse(JSON.stringify(target)),
      } as OnSetBinaryBodyEvent);
    } else {
      console.warn(`binary body 不支持 【${key}】 属性`);
      return true;
    }
    return true;
  },
  deleteProperty(target: AF['request']['body']['binary'], key) {
    if (key === 'mode' || key === 'value') {
      console.warn('binary body 不支持直接删除mode和value属性');
      self.postMessage({
        type: 'pre-request-delete-binary-body',
        value: JSON.parse(JSON.stringify(target)),
      } as OnDeleteBinaryBodyEvent);
      return true;
    }
    return true;
  },
};
export const binary = new Proxy(_binary, handler);
