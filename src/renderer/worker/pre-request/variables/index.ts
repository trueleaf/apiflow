import { OnSetVariableEvent, OnDeleteVariableEvent, BasicJSON } from '../types/types';

const _variables: Record<string, BasicJSON> = {};
const handler = {
  get(target: Record<string, BasicJSON>, key: string) {
    return target[key];
  },
  set(target: Record<string, BasicJSON>, key: string, value: any) {
    target[key] = value;
    self.postMessage({
      type: 'pre-request-set-variable',
      value: JSON.parse(JSON.stringify(target)),
    } as OnSetVariableEvent);
    return true;
  },
  deleteProperty(target: Record<string, BasicJSON>, key: string) {
    delete target[key];
    self.postMessage({
      type: 'pre-request-delete-variable',
      value: JSON.parse(JSON.stringify(target)),
    } as OnDeleteVariableEvent);
    return true;
  },
};
export const variables = new Proxy(_variables, handler);
