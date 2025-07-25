
import {contextBridge, ipcRenderer, webUtils } from 'electron'
import got from 'got'
import ip from 'ip'
import { gotRequest } from './sendRequest'
import { StandaloneExportHtmlParams } from '@src/types/standalone.ts'
import { WindowState } from '@src/types/types.ts'

const openDevTools = () => {
  ipcRenderer.invoke('apiflow-open-dev-tools')
}

const minimize = () => {
  ipcRenderer.invoke('apiflow-minimize-window')
}

const maximize = () => {
  ipcRenderer.invoke('apiflow-maximize-window')
}

const unmaximize = () => {
  ipcRenderer.invoke('apiflow-unmaximize-window')
}

const close = () => {
  ipcRenderer.invoke('apiflow-close-window')
}

const getWindowState = () => {
  return ipcRenderer.invoke('apiflow-get-window-state')
}

const onWindowResize = (callback: (state: WindowState) => void) => {
  ipcRenderer.on('apiflow-resize-window', (_event, state) => callback(state))
}

const readFileAsUint8Array = async (path: string): Promise<Uint8Array | string> => {
  const result = await ipcRenderer.invoke('apiflow-read-file-as-blob', path);
  return result;
}
const getFilePath = (file: File) => {
  return webUtils.getPathForFile(file)
}
const exportHtml = async (params: StandaloneExportHtmlParams) => {
  return ipcRenderer.invoke('apiflow-export-html', params)
}
const exportWord = async (params: StandaloneExportHtmlParams) => {
  return ipcRenderer.invoke('apiflow-export-word', params)
}

const sendToMain = (channel: string, ...args: any[]) => {
  ipcRenderer.send(channel, ...args)
}
const onMain = (channel: string, callback: (...args: any[]) => void) => {
  ipcRenderer.on(channel, (_event, ...args) => callback(...args))
}


contextBridge.exposeInMainWorld('electronAPI', {
  got,
  ip: ip.address(),
  sendRequest: gotRequest,
  openDevTools,
  readFileAsUint8Array,
  getFilePath,
  minimize,
  maximize,
  unmaximize,
  close,
  getWindowState,
  onWindowResize,
  exportHtml,
  exportWord,
  sendToMain,
  onMain,
})