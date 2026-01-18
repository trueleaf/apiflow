import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import defaultLogoImg from '@/assets/imgs/logo.png'

const appSettingsCacheKey = {
  appTitle: 'apiflow/appSettings/appTitle',
  appLogo: 'apiflow/appSettings/appLogo',
}
const getAppTitle = () => localStorage.getItem(appSettingsCacheKey.appTitle) || 'Apiflow'
const getAppLogo = () => localStorage.getItem(appSettingsCacheKey.appLogo) || ''

export const useShareAppSettings = defineStore('shareAppSettings', () => {
  const appTitle = ref(getAppTitle())
  const _appLogo = ref(getAppLogo())
  const appLogo = computed(() => _appLogo.value || defaultLogoImg)
  return {
    appTitle,
    appLogo,
  }
})
