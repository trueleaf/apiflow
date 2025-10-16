import { OnSetSessionStorageEvent, OnDeleteSessionStorageEvent } from '../types/types';

const _sessionStorage: Record<string, any> = {};
const handler = {
  get(target: Record<string, string>, key: string) {
    return target[key];
  },
  set(target: Record<string, string>, key: string, value: any) {
    target[key] = value;
    if (value?.toString?.()?.length > 1024 * 100) {
      console.warn(`sessionStorage 值最大为100kb，当前值为${value.toString().length / 1000}kb`);
      return true
    }
    self.postMessage({
      type: 'pre-request-set-session-storage',
      value: JSON.parse(JSON.stringify(target)),
    } as OnSetSessionStorageEvent);
    return true;
  },
  deleteProperty(target: Record<string, string>, key: string) {
    delete target[key];
    self.postMessage({
      type: 'pre-request-delete-session-storage',
      value: JSON.parse(JSON.stringify(target)),
    } as OnDeleteSessionStorageEvent);
    return true;
  },
};
export const sessionStorage = new Proxy(_sessionStorage, handler);
