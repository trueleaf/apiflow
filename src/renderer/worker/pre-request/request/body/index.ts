import { AF, OnSetBinaryBodyEvent, OnSetRawBodyEvent } from '../../types/types.ts';
import { json } from './json/index.ts';
import { urlencoded } from './urlencoded/index.ts';
import { formdata } from './formdata/index.ts';
import { binary } from './binary/index.ts';
export const createBodyProxy = () => {
  return new Proxy<AF['request']['body']>(
    {
      json,
      urlencoded,
      formdata,
      raw: '',
      binary,
    },
    {
      get(target, key, receiver) {
        if (key === 'raw') {
          return target[key];
        }
        if (key === 'binary') {
          return target[key];
        }
        return Reflect.get(target, key, receiver);
      },
      set(target, key, value, receiver) {
        if (key === 'raw') {
          if (typeof value !== 'string') {
            console.warn(`raw值在赋值时值类型只能为字符串，传入值类型为${Object.prototype.toString.call(value)}},此操作将被忽略`);
            return true;
          }
          self.postMessage({
            type: 'pre-request-set-raw-body',
            value: JSON.parse(JSON.stringify(target)),
          } as OnSetRawBodyEvent);
        }
        if (key === 'binary') {
          if (typeof value === 'string') {
            target.binary.value = value;
            target.binary.mode = 'variable'; 
            self.postMessage({
              type: 'pre-request-set-binary-body',
              value: JSON.parse(JSON.stringify(target)),
            } as OnSetBinaryBodyEvent);
            return true;
          } else if (value?.mode && value?.value) {
            target.binary.value = value.value;
            target.binary.mode = 'file'; 
            self.postMessage({
              type: 'pre-request-set-binary-body',
              value: JSON.parse(JSON.stringify(target)),
            } as OnSetBinaryBodyEvent);
            return true;
          } else {
            console.warn(`binary body 值只能是是{{ 变量 }}、getFile(path)类型数据，赋值类型为${value}，此操作将被忽略`);
            return true;
          }
        }
        return Reflect.set(target, key, value, receiver);
      },
      deleteProperty(target, key) {
        if (key === 'raw' || key === 'binary' || key === 'json' || key === 'urlencoded' || key === 'formdata') {
          return true;
        }
        return Reflect.deleteProperty(target, key);
      },
    }
  );
};
