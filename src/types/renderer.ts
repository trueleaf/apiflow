import { Got } from 'got';
import type {GotRequestOptions } from './types';

export type ElectronAPI = {
  ip: string,
  got: Got;
  sendRequest: (options: GotRequestOptions) => Promise<void>,
  openDevTools: () => void,
  readResponseLog: () => void;
  readFileAsUint8Array: (path: string) => Promise<Uint8Array>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    js_beautify?: any;
  }
}