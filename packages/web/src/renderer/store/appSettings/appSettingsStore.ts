import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { appSettingsCache } from '@/cache/settings/appSettingsCache'
import type { AppTheme } from '@src/types'
import defaultLogoImg from '@/assets/imgs/logo.png'

export const useAppSettings = defineStore('appSettings', () => {
  const appTitle = ref<string>(appSettingsCache.getAppTitle())
  const _appLogo = ref<string>(appSettingsCache.getAppLogo())
  const appTheme = ref<AppTheme>(appSettingsCache.getAppTheme())
  
  const appLogo = computed(() => _appLogo.value || defaultLogoImg)

  // 设置应用标题
  const setAppTitle = (title: string): void => {
    appTitle.value = title
    appSettingsCache.setAppTitle(title)
  }

  // 设置应用Logo
  const setAppLogo = (logo: string): void => {
    _appLogo.value = logo
    appSettingsCache.setAppLogo(logo)
  }

  // 设置应用主题
  const setAppTheme = (theme: AppTheme): void => {
    appTheme.value = theme
    appSettingsCache.setAppTheme(theme)
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
  }

  return {
    appTitle,
    appLogo,
    appTheme,
    setAppTitle,
    setAppLogo,
    setAppTheme,
    resetAppTitle,
    resetAppLogo,
    resetAppTheme,
    resetAllSettings,
  }
})
