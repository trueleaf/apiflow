import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { appSettingsCache } from '@/cache/settings/appSettingsCache'
import type { AppTheme } from '@src/types'
import defaultLogoImg from '@/assets/imgs/logo.png'
import { IPC_EVENTS } from '@src/types/ipc'

export const useAppSettings = defineStore('appSettings', () => {
  const appTitle = ref<string>(appSettingsCache.getAppTitle())
  const _appLogo = ref<string>(appSettingsCache.getAppLogo())
  const appTheme = ref<AppTheme>(appSettingsCache.getAppTheme())
  
  const appLogo = computed(() => _appLogo.value || defaultLogoImg)

  const notifyAppSettingsChanged = (): void => {
    if (window.electronAPI?.ipcManager) {
      window.electronAPI.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.appSettingsChanged)
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
  }

  // 重置应用主题
  const resetAppTheme = (): void => {
    appSettingsCache.resetAppTheme()
    appTheme.value = appSettingsCache.getAppTheme()
  }

  // 重置所有应用设置
  const resetAllSettings = (): void => {
    resetAppTitle()
    resetAppLogo()
    resetAppTheme()
    notifyAppSettingsChanged()
  }

  // 刷新应用设置（从缓存重新加载）
  const refreshSettings = (): void => {
    appTitle.value = appSettingsCache.getAppTitle()
    _appLogo.value = appSettingsCache.getAppLogo()
    appTheme.value = appSettingsCache.getAppTheme()
  }

  return {
    appTitle,
    appLogo,
    appTheme,
    setAppTitle,
    setAppLogo,
    setAppTheme,
    resetAllSettings,
    refreshSettings,
  }
})
