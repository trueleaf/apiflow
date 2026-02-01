import { OnSetLocalStorageEvent, OnDeleteLocalStorageEvent } from '../types/types';

const _localStorage: Record<string, string> = {};
const postSetMessage = () => {
  self.postMessage({
    type: 'pre-request-set-local-storage',
    value: JSON.parse(JSON.stringify(_localStorage)),
  } as OnSetLocalStorageEvent);
};
const postDeleteMessage = () => {
  self.postMessage({
    type: 'pre-request-delete-local-storage',
    value: JSON.parse(JSON.stringify(_localStorage)),
  } as OnDeleteLocalStorageEvent);
};
const handler = {
  get(target: Record<string, string>, key: string) {
    if (key === 'set') {
      return (name: string, value: string) => {
        if (value?.toString?.()?.length > 1024 * 100) {
          console.warn(`localStorage 值最大为100kb，当前值为${value.toString().length / 1000}kb`);
          return;
        }
        target[name] = value;
        postSetMessage();
      };
    }
    if (key === 'get') {
      return (name: string) => target[name] ?? null;
    }
    if (key === 'remove') {
      return (name: string) => {
        delete target[name];
        postDeleteMessage();
      };
    }
    if (key === 'clear') {
      return () => {
        Object.keys(target).forEach(k => delete target[k]);
        postDeleteMessage();
      };
    }
    return target[key];
  },
  set(target: Record<string, string>, key: string, value: string) {
    target[key] = value;
    if (value?.toString?.()?.length > 1024 * 100) {
      console.warn(`localStorage 值最大为100kb，当前值为${value.toString().length / 1000}kb`);
      return true
    }
    postSetMessage();
    return true;
  },
  deleteProperty(target: Record<string, string>, key: string) {
    delete target[key];
    postDeleteMessage();
    return true;
  },
};
export const localStorage = new Proxy(_localStorage, handler);
