import { BasicJSON, OnSetJsonEvent, OnDeleteJsonEvent } from '../../../types/types';
import JSONbig from 'json-bigint';

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
    if (value?.constructor?.name === 'BigNumber2') {
      target[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      target[key] = new Proxy(value, handler);
    } else {
      target[key] = value;
    }
    // console.log('json set', key, value, target);
    self.postMessage({
      type: 'pre-request-set-json-params',
      value: JSONbig.stringify(target),
    } as OnSetJsonEvent);
    return true;
  },
  deleteProperty(target: BasicJSON, key: string) {
    delete target[key];
    self.postMessage({
      type: 'pre-request-delete-json-params',
      value: JSONbig.stringify(target),
    } as OnDeleteJsonEvent);
    return true;
  },
};
export const json = new Proxy<BasicJSON>(_json, handler);
