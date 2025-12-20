import { OnSetQueryParamsEvent, OnDeleteQueryParamsEvent } from '../../types/types';

const _queryParams: Record<string, string> = {};
const handler = {
  get(target: Record<string, string>, key: string) {
    return target[key];
  },
  set(target: Record<string, string>, key: string, value: string) {
    let realValue = value;
    if (typeof value === 'number') {
      console.warn(`query参数在给 【${key}】 字段赋值时，值不为string类型，将通过toString进行转换`);
      realValue = (value as number).toString();
    } else if (typeof value !== 'string') {
      console.warn(`query参数在给 【${key}】 字段赋值时出错，query参数值类型只能为字符串，传入值类型为${Object.prototype.toString.call(value)}},此操作将被忽略`);
      return true;
    }
    target[key] = realValue;
    self.postMessage({
      type: 'pre-request-set-query-params',
      value: JSON.parse(JSON.stringify(target)),
    } as OnSetQueryParamsEvent);
    return true;
  },
  deleteProperty(target: Record<string, string>, key: string) {
    delete target[key];
    self.postMessage({
      type: 'pre-request-delete-query-params',
      value: JSON.parse(JSON.stringify(target)),
    } as OnDeleteQueryParamsEvent);
    return true;
  },
};
export const queryParams = new Proxy(_queryParams, handler);
