
import {contextBridge, ipcRenderer } from 'electron'
import got from 'got'
import ip from 'ip'
import { gotRequest } from './sendRequest'
import { readResponseLog } from './fileAccess'


const openDevTools = () => {
  ipcRenderer.invoke('open-dev-tools')
}

contextBridge.exposeInMainWorld('electronAPI', {
  got,
  ip: ip.address(),
  sendRequest: gotRequest,
  readResponseLog,
  openDevTools,
})