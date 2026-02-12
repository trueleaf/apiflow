import { queryParams } from './queryParams/index.ts'
import { pathParams } from './pathParams/index.ts'
import { headers } from './headers/index.ts'
import { createBodyProxy } from './body/index.ts'
import { AF, OnSetBodyTypeEvent, OnSetMethodEvent, OnSetUrlEvent, OnSetPathEvent } from '../types/types.ts'

let isInitializing = false;
export const setInitializing = (value: boolean) => {
  isInitializing = value;
};
export const createRequestProxy = () => {
  return new Proxy<AF['request']>({
    method: "",
    bodyType: 'none',
    url: "",
    replaceUrl: () => { },
    path: "",
    headers,
    queryParams,
    pathParams,
    body: createBodyProxy(),
  }, {
    get(target, key, receiver) {
      if (key === 'method') {
        return target[key];
      }
      if (key === 'url') {
        return target[key];
      }
      if (key === 'replaceUrl') {
        return (url: string) => {
          if (typeof url !== 'string') {
            console.warn(`replaceUrl值在赋值时值类型只能为字符串，传入值类型为${Object.prototype.toString.call(url)}},此操作将被忽略`);
            return;
          }
          Reflect.set(receiver, 'url', url);
        };
      }
      if (key === 'path') {
        return target[key];
      }
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      if (key === 'method') {
        if (typeof value !== 'string') {
          console.warn(`method值在赋值时值类型只能为字符串，传入值类型为${Object.prototype.toString.call(value)}},此操作将被忽略`);
          return true;
        }
        target[key] = value;
        if (!isInitializing) {
          self.postMessage({
            type: 'pre-request-set-method',
            value: value,
          } as OnSetMethodEvent);
        }
        return true;
      }
      if (key === 'url') {
        if (typeof value !== 'string') {
          console.warn(`url值在赋值时值类型只能为字符串，传入值类型为${Object.prototype.toString.call(value)}},此操作将被忽略`);
          return true
        }
        target[key] = value;
        if (!isInitializing) {
          self.postMessage({
            type: 'pre-request-set-url',
            value: value,
          } as OnSetUrlEvent);
        }
        return true;
      }
      if (key === 'path') {
        if (typeof value !== 'string') {
          console.warn(`path值在赋值时值类型只能为字符串，传入值类型为${Object.prototype.toString.call(value)}},此操作将被忽略`);
          return true
        }
        target[key] = value;
        if (!isInitializing) {
          self.postMessage({
            type: 'pre-request-set-path',
            value: value,
          } as OnSetPathEvent);
        }
        return true;
      }
      if (key === 'bodyType') {
        if (value !== 'none' && value !== 'json' && value !== 'urlencoded' && value !== 'formdata' && value !== 'binary' && value !== 'raw') {
          console.warn(`bodyType值在赋值时值类型只能为'none' | 'json' | 'urlencoded' | 'formdata' | 'binary' | 'raw',当前类型为${value} 此操作将被忽略`);
          return true
        }
        target[key] = value;
        if (!isInitializing) {
          self.postMessage({
            type: 'pre-request-set-body-type',
            value: value,
          } as OnSetBodyTypeEvent);
        }
        return true;
      }
      return Reflect.set(target, key, value, receiver);
    },
    deleteProperty(target, key) {
      if (key === 'method') {
        return true;
      }
      if (key === 'url') {
        return true;
      }
      if (key === 'replaceUrl') {
        return true;
      }
      if (key === 'path') {
        return true;
      }
      if (key === 'headers') {
        return true;
      }
      if (key === 'queryParams') {
        return true;
      }
      if (key === 'pathParams') {
        return true;
      }
      if (key === 'body') {
        return true;
      }
      return Reflect.deleteProperty(target, key);
    },
  })
}
