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
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    js_beautify?: any;
  }
}