import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { HttpNodeConfig } from '@src/types'
import { config } from '@src/config/config'
import { httpNodeConfigCache } from '@/cache/httpNode/httpNodeConfig'
import { router } from '@/router'

export const useHttpNodeConfig = defineStore('httpNodeConfig', () => {
  const projectConfigs = ref<Record<string, HttpNodeConfig>>({})
  //获取当前项目ID
  const getCurrentProjectId = (): string => {
    return router.currentRoute.value.query.id as string || ''
  }
  //获取当前项目配置
  const currentConfig = computed<HttpNodeConfig>(() => {
    const projectId = getCurrentProjectId()
    if (!projectId || !projectConfigs.value[projectId]) {
      return {
        maxTextBodySize: config.httpNodeConfig.maxTextBodySize,
        maxRawBodySize: config.httpNodeConfig.maxRawBodySize,
        userAgent: config.httpNodeConfig.userAgent,
        followRedirect: config.httpNodeConfig.followRedirect,
        maxRedirects: config.httpNodeConfig.maxRedirects,
        maxHeaderValueDisplayLength: config.httpNodeConfig.maxHeaderValueDisplayLength
      }
    }
    return projectConfigs.value[projectId]
  })
  //获取指定项目的配置
  const getHttpNodeConfig = (projectId: string): HttpNodeConfig => {
    if (projectConfigs.value[projectId]) {
      return projectConfigs.value[projectId]
    }
    const cachedConfig = httpNodeConfigCache.getHttpNodeConfig(projectId)
    if (cachedConfig) {
      projectConfigs.value[projectId] = cachedConfig
      return cachedConfig
    }
    const defaultConfig: HttpNodeConfig = {
      maxTextBodySize: config.httpNodeConfig.maxTextBodySize,
      maxRawBodySize: config.httpNodeConfig.maxRawBodySize,
      userAgent: config.httpNodeConfig.userAgent,
      followRedirect: config.httpNodeConfig.followRedirect,
      maxRedirects: config.httpNodeConfig.maxRedirects,
      maxHeaderValueDisplayLength: config.httpNodeConfig.maxHeaderValueDisplayLength
    }
    projectConfigs.value[projectId] = defaultConfig
    return defaultConfig
  }
  //设置指定项目的配置
  const setHttpNodeConfig = (projectId: string, configPartial: Partial<HttpNodeConfig>): void => {
    httpNodeConfigCache.setHttpNodeConfig(projectId, configPartial)
    if (!projectConfigs.value[projectId]) {
      projectConfigs.value[projectId] = getHttpNodeConfig(projectId)
    }
    Object.assign(projectConfigs.value[projectId], configPartial)
  }
  //初始化指定项目的配置
  const initHttpNodeConfig = (projectId: string): void => {
    const configData = getHttpNodeConfig(projectId)
    projectConfigs.value[projectId] = configData
  }
  return {
    projectConfigs,
    currentConfig,
    getHttpNodeConfig,
    setHttpNodeConfig,
    initHttpNodeConfig
  }
})
