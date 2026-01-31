import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { appSettingsCache } from '@/cache/settings/appSettingsCache'
import type { AppTheme } from '@src/types'
import defaultLogoImg from '@/assets/imgs/logo.png'
import { IPC_EVENTS } from '@src/types/ipc'

export const useAppSettings = defineStore('appSettings', () => {
  const appTitle = ref(appSettingsCache.getAppTitle())
  const _appLogo = ref(appSettingsCache.getAppLogo())
  const appTheme = ref<AppTheme>(appSettingsCache.getAppTheme())
  const serverUrl = ref(appSettingsCache.getServerUrl())
  const proxyServerUrl = ref(appSettingsCache.getProxyServerUrl())
  
  const appLogo = computed(() => _appLogo.value || defaultLogoImg)

  const notifyAppSettingsChanged = (): void => {
    if (window.electronAPI?.ipcManager) {
      window.electronAPI.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.appSettingsChanged, {
        appTitle: appTitle.value,
        appLogo: appLogo.value,
        appTheme: appTheme.value,
        serverUrl: serverUrl.value,
        proxyServerUrl: proxyServerUrl.value
      })
    }
  }
  // 通知主进程更新窗口图标
  const notifyWindowIconChanged = (iconDataUrl: string): void => {
    if (window.electronAPI?.ipcManager) {
      window.electronAPI.ipcManager.sendToMain(IPC_EVENTS.apiflow.rendererToMain.setWindowIcon, iconDataUrl)
    }
  }

  // 设置应用标题
  const setAppTitle = (title: string): void => {
    appTitle.value = title
    appSettingsCache.setAppTitle(title)
    notifyAppSettingsChanged()
  }

  // 设置应用Logo
  const setAppLogo = (logo: string): void => {
    _appLogo.value = logo
    appSettingsCache.setAppLogo(logo)
    notifyAppSettingsChanged()
    notifyWindowIconChanged(logo)
  }

  // 设置应用主题
  const setAppTheme = (theme: AppTheme): void => {
    appTheme.value = theme
    appSettingsCache.setAppTheme(theme)
    notifyAppSettingsChanged()
  }

  // 重置应用标题
  const resetAppTitle = (): void => {
    appSettingsCache.resetAppTitle()
    appTitle.value = appSettingsCache.getAppTitle()
  }

  // 重置应用Logo
  const resetAppLogo = (): void => {
    appSettingsCache.resetAppLogo()
    _appLogo.value = appSettingsCache.getAppLogo()
    notifyWindowIconChanged(appLogo.value)
  }

  // 重置应用主题
  const resetAppTheme = (): void => {
    appSettingsCache.resetAppTheme()
    appTheme.value = appSettingsCache.getAppTheme()
  }
  // 设置服务器地址
  const setServerUrl = (url: string): void => {
    serverUrl.value = url
    appSettingsCache.setServerUrl(url)
    if (!appSettingsCache.hasProxyServerUrl()) {
      proxyServerUrl.value = appSettingsCache.getProxyServerUrl()
    }
  }
  // 设置代理服务器地址
  const setProxyServerUrl = (url: string): void => {
    if (url.trim() === serverUrl.value.trim()) {
      appSettingsCache.resetProxyServerUrl()
      proxyServerUrl.value = appSettingsCache.getProxyServerUrl()
      return
    }
    proxyServerUrl.value = url
    appSettingsCache.setProxyServerUrl(url)
  }
  // 重置服务器地址
  const resetServerUrl = (): void => {
    appSettingsCache.resetServerUrl()
    serverUrl.value = appSettingsCache.getServerUrl()
    if (!appSettingsCache.hasProxyServerUrl()) {
      proxyServerUrl.value = appSettingsCache.getProxyServerUrl()
    }
  }
  // 重置代理服务器地址
  const resetProxyServerUrl = (): void => {
    appSettingsCache.resetProxyServerUrl()
    proxyServerUrl.value = appSettingsCache.getProxyServerUrl()
  }

  // 重置所有应用设置
  const resetAllSettings = (): void => {
    resetAppTitle()
    resetAppLogo()
    resetAppTheme()
    resetServerUrl()
    resetProxyServerUrl()
    notifyAppSettingsChanged()
  }

  // 刷新应用设置（从缓存重新加载）
  const refreshSettings = (): void => {
    appTitle.value = appSettingsCache.getAppTitle()
    _appLogo.value = appSettingsCache.getAppLogo()
    appTheme.value = appSettingsCache.getAppTheme()
    serverUrl.value = appSettingsCache.getServerUrl()
    proxyServerUrl.value = appSettingsCache.getProxyServerUrl()
  }
  // 从IPC数据直接更新设置（用于topBarView接收contentView的设置变更）
  const updateFromIPC = (data: { appTitle: string, appLogo: string, appTheme: AppTheme, serverUrl?: string, proxyServerUrl?: string }): void => {
    appTitle.value = data.appTitle
    // 如果传入的logo是默认logo，则将_appLogo设为空字符串，让computed使用默认值
    // 否则直接设置传入的logo
    _appLogo.value = data.appLogo === defaultLogoImg ? '' : data.appLogo
    appTheme.value = data.appTheme
    if (data.serverUrl !== undefined) {
      serverUrl.value = data.serverUrl
    }
    if (data.proxyServerUrl !== undefined) {
      proxyServerUrl.value = data.proxyServerUrl
    }
  }

  return {
    appTitle,
    appLogo,
    appTheme,
    serverUrl,
    proxyServerUrl,
    setAppTitle,
    setAppLogo,
    setAppTheme,
    setServerUrl,
    setProxyServerUrl,
    resetAllSettings,
    refreshSettings,
    updateFromIPC,
    resetServerUrl,
    resetProxyServerUrl,
  }
})
