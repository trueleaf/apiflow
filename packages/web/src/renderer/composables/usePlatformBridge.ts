import { isElectron } from '@/helper'
import mitt from 'mitt'
import type { Language } from '@src/types'
import type { RuntimeNetworkMode } from '@src/types/runtime'
import type { AppWorkbenchHeaderTab } from '@src/types/appWorkbench/appWorkbenchType'
import type { AnchorRect } from '@src/types/common'
import { IPC_EVENTS } from '@src/types/ipc'

// 浏览器环境下的事件类型
export type BrowserBridgeEvents = {
  'project:created': { projectId: string; projectName: string }
  'project:changed': { projectId: string; projectName: string }
  'project:deleted': string
  'project:renamed': { projectId: string; projectName: string }
  'tabs:updated': AppWorkbenchHeaderTab[]
  'tabs:activeUpdated': string
  'language:changed': Language
  'networkMode:changed': RuntimeNetworkMode
  'navigate': string
  'navigateToHome': void
  'createProject': void
  'showAiDialog': { position?: AnchorRect } | undefined
  'goBack': void
  'goForward': void
  'refreshApp': void
}
// 浏览器事件总线
const browserEventBus = mitt<BrowserBridgeEvents>()
// 发送消息到 "主进程"（Electron 使用 IPC，浏览器使用事件总线）
export const sendToMain = <T>(event: string, payload?: T) => {
  if (isElectron()) {
    window.electronAPI?.ipcManager.sendToMain(event, payload)
  } else {
    const eventName = eventToName(event)
    if (eventName) {
      browserEventBus.emit(eventName as keyof BrowserBridgeEvents, payload as never)
    }
  }
}
// 监听来自 "主进程" 的消息
export const onMain = <T>(event: string, callback: (payload: T) => void) => {
  if (isElectron()) {
    window.electronAPI?.ipcManager.onMain(event, callback)
  } else {
    const eventName = eventToName(event)
    if (eventName) {
      browserEventBus.on(eventName as keyof BrowserBridgeEvents, callback as never)
    }
  }
}
// 移除监听
export const offMain = <T>(event: string, callback: (payload: T) => void) => {
  if (isElectron()) {
    // Electron 环境下暂不支持移除
  } else {
    const eventName = eventToName(event)
    if (eventName) {
      browserEventBus.off(eventName as keyof BrowserBridgeEvents, callback as never)
    }
  }
}
// 将 IPC 事件名映射为浏览器事件名
const eventToName = (event: string): string | null => {
  const eventMap: Record<string, keyof BrowserBridgeEvents> = {
    [IPC_EVENTS.apiflow.contentToTopBar.projectCreated]: 'project:created',
    [IPC_EVENTS.apiflow.contentToTopBar.projectChanged]: 'project:changed',
    [IPC_EVENTS.apiflow.contentToTopBar.projectDeleted]: 'project:deleted',
    [IPC_EVENTS.apiflow.contentToTopBar.projectRenamed]: 'project:renamed',
    [IPC_EVENTS.apiflow.topBarToContent.tabsUpdated]: 'tabs:updated',
    [IPC_EVENTS.apiflow.topBarToContent.activeTabUpdated]: 'tabs:activeUpdated',
    [IPC_EVENTS.apiflow.contentToTopBar.languageChanged]: 'language:changed',
    [IPC_EVENTS.apiflow.topBarToContent.networkModeChanged]: 'networkMode:changed',
    [IPC_EVENTS.apiflow.topBarToContent.navigate]: 'navigate',
    [IPC_EVENTS.apiflow.contentToTopBar.navigateToHome]: 'navigateToHome',
    [IPC_EVENTS.apiflow.rendererToMain.createProject]: 'createProject',
    [IPC_EVENTS.apiflow.contentToTopBar.showAiDialog]: 'showAiDialog',
    [IPC_EVENTS.apiflow.rendererToMain.goBack]: 'goBack',
    [IPC_EVENTS.apiflow.rendererToMain.goForward]: 'goForward',
    [IPC_EVENTS.apiflow.rendererToMain.refreshApp]: 'refreshApp',
  }
  return eventMap[event] || null
}
// 获取浏览器事件总线（仅供浏览器环境内部使用）
export const getBrowserEventBus = () => browserEventBus
// 平台桥接 composable
export const usePlatformBridge = () => {
  return {
    isElectronEnv: isElectron(),
    sendToMain,
    onMain,
    offMain,
    browserEventBus: isElectron() ? null : browserEventBus,
  }
}
