import { OnSetLocalStorageEvent, OnDeleteLocalStorageEvent } from '../types/types';

const _localStorage: Record<string, string> = {};
const handler = {
  get(target: Record<string, string>, key: string) {
    return target[key];
  },
  set(target: Record<string, string>, key: string, value: any) {
    target[key] = value;
    if (value?.toString?.()?.length > 1024 * 100) {
      console.warn(`localStorage 值最大为100kb，当前值为${value.toString().length / 1000}kb`);
      return true
    }
    self.postMessage({
      type: 'pre-request-set-local-storage',
      value: JSON.parse(JSON.stringify(target)),
    } as OnSetLocalStorageEvent);
    return true;
  },
  deleteProperty(target: Record<string, string>, key: string) {
    delete target[key];
    self.postMessage({
      type: 'pre-request-delete-local-storage',
      value: JSON.parse(JSON.stringify(target)),
    } as OnDeleteLocalStorageEvent);
    return true;
  },
};
export const localStorage = new Proxy(_localStorage, handler);
