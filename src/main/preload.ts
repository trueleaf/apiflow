
import {contextBridge, ipcRenderer } from 'electron'
import got from 'got'
import ip from 'ip'
import { gotRequest } from './sendRequest'
import { readResponseLog } from './fileAccess'


const openDevTools = () => {
  ipcRenderer.invoke('apiflow-open-dev-tools')
}
const readFileAsBlob = async (path: string): Promise<Blob> => {
  return ipcRenderer.invoke('apiflow-read-file-as-blob', path)
}

contextBridge.exposeInMainWorld('electronAPI', {
  got,
  ip: ip.address(),
  sendRequest: gotRequest,
  readResponseLog,
  openDevTools,
  readFileAsBlob,
})