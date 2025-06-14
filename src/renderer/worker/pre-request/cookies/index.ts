import { OnSetCookieEvent, OnDeleteCookieEvent, BasicJSON } from '../types/types';

const _cookies: { [key: string]: BasicJSON } = {};
const handler = {
  get(target: { [key: string]: BasicJSON }, key: string) {
    return target[key];
  },
  set(target: { [key: string]: BasicJSON }, key: string, value: BasicJSON) {
    if (typeof value !== 'string') {
      console.warn(`cookie参数在给 【${key}】 字段赋值时出错，cookie参数值类型只能为字符串，传入值类型为${Object.prototype.toString.call(value)}},此操作将被忽略`);
      return true;
    }
    target[key] = value;
    self.postMessage({
      type: 'pre-request-set-cookie',
      value: JSON.parse(JSON.stringify(target)),
    } as OnSetCookieEvent);
    return true;
  },
  deleteProperty(target: { [key: string]: BasicJSON }, key: string) {
    delete target[key];
    self.postMessage({
      type: 'pre-request-delete-cookie',
      value: JSON.parse(JSON.stringify(target)),
    } as OnDeleteCookieEvent);
    return true;
  },
};
export const cookies = new Proxy(_cookies, handler);
