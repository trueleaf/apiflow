import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/api/api'
import type { CommonResponse, SystemFeatureConfig } from '@src/types'

export const useSystemConfig = defineStore('systemConfig', () => {
  const enableGuest = ref(true)
  const enableRegister = ref(true)
  const loaded = ref(false)
  // 从服务端获取系统功能开关配置
  const fetchConfig = async () => {
    try {
      const res = await request.get<CommonResponse<SystemFeatureConfig>, CommonResponse<SystemFeatureConfig>>('/api/system/config')
      enableGuest.value = res.data.enableGuest
      enableRegister.value = res.data.enableRegister
      loaded.value = true
    } catch {
      // 请求失败时保持默认值
    }
  }
  // 更新系统功能开关配置
  const updateConfig = async (params: Partial<SystemFeatureConfig>) => {
    const res = await request.put<CommonResponse<SystemFeatureConfig>, CommonResponse<SystemFeatureConfig>>('/api/system/config', params)
    enableGuest.value = res.data.enableGuest
    enableRegister.value = res.data.enableRegister
    return res.data
  }
  return { enableGuest, enableRegister, loaded, fetchConfig, updateConfig }
})
