import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { HttpNodeConfig } from '@src/types'
import { httpNodeConfigCache } from '@/cache/httpNode/httpNodeConfig'
import { router } from '@/router'
import { generateDefaultHttpNodeConfig } from '@/helper'

export const useHttpNodeConfig = defineStore('httpNodeConfig', () => {
  const projectConfigs = ref<Record<string, HttpNodeConfig>>({})
  //获取当前项目ID
  const getCurrentProjectId = (): string => {
    return router.currentRoute.value.query.id as string || ''
  }
  //获取当前项目配置
  const currentConfig = computed<HttpNodeConfig>(() => {
    const projectId = getCurrentProjectId()
    if (!projectId) {
      return generateDefaultHttpNodeConfig()
    }
    if (!projectConfigs.value[projectId]) {
      projectConfigs.value[projectId] = generateDefaultHttpNodeConfig()
    }
    return projectConfigs.value[projectId]
  })
  //更新当前项目配置的某个字段
  const updateCurrentConfig = <K extends keyof HttpNodeConfig>(key: K, value: HttpNodeConfig[K]): void => {
    const projectId = getCurrentProjectId()
    if (!projectId) return
    if (!projectConfigs.value[projectId]) {
      projectConfigs.value[projectId] = generateDefaultHttpNodeConfig()
    }
    projectConfigs.value[projectId][key] = value
    httpNodeConfigCache.setHttpNodeConfig(projectId, projectConfigs.value[projectId])
  }
  //获取指定项目的配置
  const getHttpNodeConfig = (projectId: string): HttpNodeConfig => {
    if (projectConfigs.value[projectId]) {
      return { ...generateDefaultHttpNodeConfig(), ...projectConfigs.value[projectId] }
    }
    const cachedConfig = httpNodeConfigCache.getHttpNodeConfig(projectId)
    if (cachedConfig) {
      const merged = { ...generateDefaultHttpNodeConfig(), ...cachedConfig }
      projectConfigs.value[projectId] = merged
      return merged
    }
    const defaultConfig = generateDefaultHttpNodeConfig()
    projectConfigs.value[projectId] = defaultConfig
    return defaultConfig
  }
  //设置指定项目的配置
  const setHttpNodeConfig = (projectId: string, configPartial: Partial<HttpNodeConfig>): void => {
    const currentConfigData = projectConfigs.value[projectId] || getHttpNodeConfig(projectId)
    const merged = { ...generateDefaultHttpNodeConfig(), ...currentConfigData, ...configPartial }
    projectConfigs.value[projectId] = merged
    httpNodeConfigCache.setHttpNodeConfig(projectId, merged)
  }
  //初始化指定项目的配置
  const initHttpNodeConfig = (projectId: string): void => {
    const configData = getHttpNodeConfig(projectId)
    projectConfigs.value[projectId] = configData
  }
  return {
    projectConfigs,
    currentConfig,
    updateCurrentConfig,
    getHttpNodeConfig,
    setHttpNodeConfig,
    initHttpNodeConfig
  }
})
