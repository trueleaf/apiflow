import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/api/api'
import type { CommonResponse, SystemFeatureConfig } from '@src/types'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { brandConfig } from '@src/config/brand'

export const useSystemConfig = defineStore('systemConfig', () => {
  const enableGuest = ref(false)
  const enableRegister = ref(false)
  const enableForgotPassword = ref(false)
  const enableExternalLinks = ref(!brandConfig.isCleanMode)
  const isOfficial = ref(false)
  const loaded = ref(false)
  // 获取当前系统功能配置
  const getCurrentConfig = (): SystemFeatureConfig => ({
    enableGuest: enableGuest.value,
    enableRegister: enableRegister.value,
    enableForgotPassword: enableForgotPassword.value,
    enableExternalLinks: brandConfig.isCleanMode ? false : enableExternalLinks.value,
    isOfficial: isOfficial.value,
  })
  // 应用系统功能配置
  const applyConfig = (config: SystemFeatureConfig): void => {
    enableGuest.value = config.enableGuest
    enableRegister.value = config.enableRegister
    enableForgotPassword.value = config.enableForgotPassword
    enableExternalLinks.value = brandConfig.isCleanMode ? false : config.enableExternalLinks
    isOfficial.value = config.isOfficial
  }
  // 从服务端获取系统功能开关配置
  const fetchConfig = async () => {
    const runtimeStore = useRuntime()
    if (runtimeStore.networkMode === 'offline') {
      loaded.value = true
      return
    }
    try {
      const res = await request.get<CommonResponse<SystemFeatureConfig>, CommonResponse<SystemFeatureConfig>>('/api/system/config')
      applyConfig(res.data)
      loaded.value = true
    } catch {
      // 请求失败时保持默认值
    }
  }
  // 更新系统功能开关配置
  const updateConfig = async (params: Partial<SystemFeatureConfig>) => {
    const runtimeStore = useRuntime()
    if (runtimeStore.networkMode === 'offline') {
      return getCurrentConfig()
    }
    const res = await request.put<CommonResponse<SystemFeatureConfig>, CommonResponse<SystemFeatureConfig>>('/api/system/config', params)
    applyConfig(res.data)
    return res.data
  }
  return { enableGuest, enableRegister, enableForgotPassword, enableExternalLinks, isOfficial, loaded, fetchConfig, updateConfig }
})
