import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { HttpNodeConfig } from '@src/types'
import { httpNodeConfigCache } from '@/cache/httpNode/httpNodeConfig'
import { router } from '@/router'
import { generateDefaultHttpNodeConfig } from '@/helper'

export const useHttpNodeConfig = defineStore('httpNodeConfig', () => {
  const httpNodeConfig = ref<Record<string, HttpNodeConfig>>({})
  //获取当前项目ID
  const getCurrentProjectId = (): string => {
    return router.currentRoute.value.query.id as string || ''
  }
  //获取当前项目配置
  const currentHttpNodeConfig = computed<HttpNodeConfig>(() => {
    const projectId = getCurrentProjectId()
    if (!projectId) {
      return generateDefaultHttpNodeConfig()
    }
    if (!httpNodeConfig.value[projectId]) {
      httpNodeConfig.value[projectId] = generateDefaultHttpNodeConfig()
    }
    return httpNodeConfig.value[projectId]
  })
  //更新当前项目配置的某个字段
  const updateCurrentConfig = <K extends keyof HttpNodeConfig>(key: K, value: HttpNodeConfig[K]): void => {
    const projectId = getCurrentProjectId()
    if (!projectId) return
    if (!httpNodeConfig.value[projectId]) {
      httpNodeConfig.value[projectId] = generateDefaultHttpNodeConfig()
    }
    httpNodeConfig.value[projectId][key] = value
    httpNodeConfigCache.setHttpNodeConfig(projectId, httpNodeConfig.value[projectId])
  }
  //获取指定项目的配置
  const getHttpNodeConfig = (projectId: string): HttpNodeConfig => {
    if (httpNodeConfig.value[projectId]) {
      return { ...generateDefaultHttpNodeConfig(), ...httpNodeConfig.value[projectId] }
    }
    const cachedConfig = httpNodeConfigCache.getHttpNodeConfig(projectId)
    if (cachedConfig) {
      const merged = { ...generateDefaultHttpNodeConfig(), ...cachedConfig }
      httpNodeConfig.value[projectId] = merged
      return merged
    }
    const defaultConfig = generateDefaultHttpNodeConfig()
    httpNodeConfig.value[projectId] = defaultConfig
    return defaultConfig
  }
  //设置指定项目的配置
  const setHttpNodeConfig = (projectId: string, configPartial: Partial<HttpNodeConfig>): void => {
    const currentConfigData = httpNodeConfig.value[projectId] || getHttpNodeConfig(projectId)
    const merged = { ...generateDefaultHttpNodeConfig(), ...currentConfigData, ...configPartial }
    httpNodeConfig.value[projectId] = merged
    httpNodeConfigCache.setHttpNodeConfig(projectId, merged)
  }
  //初始化指定项目的配置
  const initHttpNodeConfig = (projectId: string): void => {
    const configData = getHttpNodeConfig(projectId)
    httpNodeConfig.value[projectId] = configData
  }
  return {
    httpNodeConfig,
    currentHttpNodeConfig,
    updateCurrentConfig,
    getHttpNodeConfig,
    setHttpNodeConfig,
    initHttpNodeConfig
  }
})
