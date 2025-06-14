import { BasicJSON, OnSetJsonEvent, OnDeleteJsonEvent } from '../../../types/types';

const _json: BasicJSON = {};

const handler = {
  get(target: BasicJSON, key: string) {
    if (typeof target[key] === 'object' && target[key] !== null) {
      return new Proxy(target[key], handler);
    } else {
      return target[key];
    }
  },
  set(target: BasicJSON, key: string, value: BasicJSON) {
    if (typeof value === 'object' && value !== null) {
      target[key] = new Proxy(value, handler);
    } else {
      target[key] = value;
    }
    self.postMessage({
      type: 'pre-request-set-json-params',
      value: JSON.parse(JSON.stringify(target)),
    } as OnSetJsonEvent);
    return true;
  },
  deleteProperty(target: BasicJSON, key: string) {
    delete target[key];
    self.postMessage({
      type: 'pre-request-delete-json-params',
      value: JSON.parse(JSON.stringify(target)),
    } as OnDeleteJsonEvent);
    return true;
  },
};
export const json = new Proxy<BasicJSON>(_json, handler);
