import { OnSetBinaryBodyEvent, OnDeleteBinaryBodyEvent, AF } from '../../../types/types';

const _binary: AF['request']['body']['binary'] = {
  mode: 'var',
  path: '',
};

type BinaryKey = keyof AF['request']['body']['binary'];

const handler = {
  get(target: AF['request']['body']['binary'], key: BinaryKey) {
    return target[key];
  },
  set(target: AF['request']['body']['binary'], key: BinaryKey, value: string) {
    if (key === 'mode') {
      if (value !== 'var' && value !== 'file') {
        console.warn(`binary body mode仅支持【var】 和 【file】 两种模式，传入值为${value},此操作将被忽略`);
        return true;
      }
      target.mode = value as 'var' | 'file';
      self.postMessage({
        type: 'pre-request-set-binary-body',
        value: JSON.parse(JSON.stringify(target)),
      } as OnSetBinaryBodyEvent);
    } else if (key === 'path') {
      target.path = value;
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
  deleteProperty(target: AF['request']['body']['binary'], key: BinaryKey) {
    if (key === 'mode' || key === 'path') {
      console.warn('binary body 不支持直接删除mode和path属性');
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
