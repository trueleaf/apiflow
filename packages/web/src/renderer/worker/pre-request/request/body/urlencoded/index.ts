import { OnSetUrlencodedEvent, OnDeleteUrlencodedEvent } from '../../../types/types';

const _urlencoded: Record<string, string> = {};
const handler = {
  get(target: Record<string, string>, key: string) {
    return target[key];
  },
  set(target: Record<string, string>, key: string, value: string) {
    let realValue = value;
    if (typeof value === 'number') {
      console.warn(`urlencoded参数在给 【${key}】 字段赋值时，值不为string类型，将通过toString进行转换`);
      realValue = (value as number).toString();
    } else if (typeof value !== 'string') {
      console.warn(`urlencoded参数在给 【${key}】 字段赋值时出错，urlencoded参数值类型只能为字符串，传入值类型为${Object.prototype.toString.call(value)}},此操作将被忽略`);
      return true;
    }
    target[key] = realValue;
    self.postMessage({
      type: 'pre-request-set-urlencoded',
      value: JSON.parse(JSON.stringify(target)),
    } as OnSetUrlencodedEvent);
    return true;
  },
  deleteProperty(target: Record<string, string>, key: string) {
    delete target[key];
    self.postMessage({
      type: 'pre-request-delete-urlencoded',
      value: JSON.parse(JSON.stringify(target)),
    } as OnDeleteUrlencodedEvent);
    return true;
  },
};
export const urlencoded = new Proxy(_urlencoded, handler);
