
import {contextBridge, ipcRenderer, webUtils } from 'electron'
import got from 'got'
import ip from 'ip'
import { gotRequest } from './sendRequest'
import FormData from 'form-data'

const openDevTools = () => {
  ipcRenderer.invoke('apiflow-open-dev-tools')
}
const readFileAsUint8Array = async (path: string): Promise<Uint8Array | string> => {
  const result = await ipcRenderer.invoke('apiflow-read-file-as-blob', path);
  return result;
}
const getFilePath = (file: File) => {
  return webUtils.getPathForFile(file)
}
class NodeFormData {
  public formData: FormData;
  constructor() {
    this.formData = new FormData()
  }
  append(key: string, value: string | Blob, fileName?: string) {
    this.formData.append(key, value, fileName)
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  got,
  ip: ip.address(),
  sendRequest: gotRequest,
  openDevTools,
  readFileAsUint8Array,
  getFilePath,
  nodeFormData: new NodeFormData()
})