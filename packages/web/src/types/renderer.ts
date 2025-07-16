import type { Got } from 'got';
import type {GotRequestOptions } from './types';
import type { StandaloneExportHtmlParams } from './standalone.ts';


export type ElectronAPI = {
  ip: string,
  got: Got;
  sendRequest: (options: GotRequestOptions) => Promise<void>,
  openDevTools: () => void,
  readFileAsUint8Array: (path: string) => Promise<Uint8Array | string>;
  getFilePath: (file: File) => string;
  minimize: () => void;
  maximize: () => void;
  unmaximize: () => void;
  close: () => void;
  onWindowStateChange: (callback: (state: 'normal' | 'minimized' | 'maximized') => void) => void;
  exportHtml: (params: StandaloneExportHtmlParams) => Promise<string>;
  exportWord: (params: StandaloneExportHtmlParams) => Promise<Uint8Array>;
  sendToMain: (channel: string, ...args: any[]) => void;
  onMain: (channel: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    js_beautify?: any;
  }
}