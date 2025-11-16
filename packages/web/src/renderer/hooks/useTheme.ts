import { watch } from 'vue'
import { useAppSettings } from '@/store/appSettings/appSettingsStore'
import type { AppTheme } from '@src/types/config'

export const useTheme = () => {
  const appSettingsStore = useAppSettings()

  const getSystemTheme = (): 'light' | 'dark' => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const applyCSSTheme = (theme: 'light' | 'dark') => {
    const htmlElement = document.documentElement
    if (theme === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark')
    } else {
      htmlElement.removeAttribute('data-theme')
    }
  }

  const applyTheme = (theme: AppTheme) => {
    if (theme === 'auto') {
      const systemTheme = getSystemTheme()
      applyCSSTheme(systemTheme)
    } else {
      applyCSSTheme(theme)
    }
  }

  const watchSystemTheme = () => {
    if (!window.matchMedia) {
      return
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (appSettingsStore.appTheme === 'auto') {
        applyCSSTheme(e.matches ? 'dark' : 'light')
      }
    }
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }

  const initTheme = () => {
    applyTheme(appSettingsStore.appTheme)
    watchSystemTheme()
    watch(() => appSettingsStore.appTheme, (newTheme) => {
      applyTheme(newTheme)
    })
  }

  return {
    initTheme,
    applyTheme,
    getSystemTheme,
  }
}
