
import {contextBridge, ipcRenderer, webUtils } from 'electron'
import got from 'got'
import ip from 'ip'
import { gotRequest } from './sendRequest'

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

const onWindowStateChange = (callback: (state: 'normal' | 'minimized' | 'maximized') => void) => {
  ipcRenderer.on('window-state-changed', (_event, state) => callback(state))
}

const readFileAsUint8Array = async (path: string): Promise<Uint8Array | string> => {
  const result = await ipcRenderer.invoke('apiflow-read-file-as-blob', path);
  return result;
}
const getFilePath = (file: File) => {
  return webUtils.getPathForFile(file)
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
  onWindowStateChange,
})