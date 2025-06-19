import { uniqueByKey } from "@/helper";
import { config } from "@src/config/config";
import { ApidocMockMapInfo, ApidocMockState } from "@src/types/apidoc/mock";
import { ApidocDetail } from "@src/types/global";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useApidoc } from "./apidoc";


export const useApidocMock = defineStore('apidocMock', () => {
  const {changeApidocHost } = useApidoc()
  const serverState = ref<ApidocMockState['serverState']>('disconnection') //服务器状态
  const mockServerPort = ref(config.renderConfig.mock.port) // 端口
  const httpStatusCode = ref(200) //http状态码
  const urlMap = ref<ApidocMockState['urlMap']>([])
  //改变mock映射
  const changeMockUrlMap = (payload: ApidocMockMapInfo[]): void => {
    urlMap.value = uniqueByKey(urlMap.value.concat(payload), 'id')
  }
  //新增一条mock映射
  const addMockUrl = (payload: ApidocMockMapInfo): void => {
    urlMap.value.push(payload);
  }
  //根据id改变一条mock映射
  const changeCustomMockUrlById = (payload: { id: string, url: string }): void => {
    const matchedMockInfo = urlMap.value.find(v => v.id === payload.id);
    if (matchedMockInfo) {
      matchedMockInfo.customMockUrl = payload.url
    }
  }
  //改变当前mock映射
  const changeCurrentMockUrl = (payload: { id: string, apidoc: ApidocDetail }): void => {
    const index = urlMap.value.findIndex(v => v.id === payload.id);
    if (index !== -1) {
      urlMap.value[index] = {
        id: payload.apidoc._id,
        projectId: payload.apidoc.projectId,
        url: payload.apidoc.item.url.path,
        method: payload.apidoc.item.method,
        customMockUrl: payload.apidoc.mockInfo.path,
      }
    } else if (payload.apidoc.projectId) { //不添加无效数据
      urlMap.value.push({
        id: payload.apidoc._id,
        projectId: payload.apidoc.projectId,
        url: payload.apidoc.item.url.path,
        method: payload.apidoc.item.method,
        customMockUrl: payload.apidoc.mockInfo.path,
      });
    }
  }
  //改变mock端口
  const changeMockServerPort = (port: number): void => {
    const ipAddress = window.electronAPI?.ip ?? '127.0.0.1'
    changeApidocHost(`http://${ipAddress}:${port}`);
    mockServerPort.value = port;
  }
  //改变服务器启动状态
  const changeMockServerState = (payload: 'disconnection' | 'connecting' | 'connection' | 'closing' | 'error'): void => {
    serverState.value = payload;
  }

  return {
    serverState,
    mockServerPort,
    httpStatusCode,
    urlMap,
    changeMockUrlMap,
    addMockUrl,
    changeCurrentMockUrl,
    changeCustomMockUrlById,
    changeMockServerPort,
    changeMockServerState,
  }
})