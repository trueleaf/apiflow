import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { nanoid } from 'nanoid/non-secure'
import { request } from '@/api/api'
import { cacheKey } from '@/cache/cacheKey'
import { logger } from '@/helper/logger'
import { environmentCache } from '@/cache/environment/environmentCache'
import { environmentVariableCache } from '@/cache/environment/environmentVariableCache'
import { useRuntime } from '../runtime/runtimeStore'
import type {
  ApidocVariable,
  CommonResponse,
  EnvironmentEntity,
  EnvironmentVariableEntity,
  EnvironmentVariableValueType,
  EnvironmentVisibilityMode,
} from '@src/types'
type ServerEnvironment = {
  _id: string
  projectId: string
  name: string
  baseUrl: string
  description: string
  order: number
  visibilityMode: EnvironmentVisibilityMode
  createdAt?: string | number
  updatedAt?: string | number
}
type ServerEnvironmentVariable = {
  _id: string
  projectId: string
  environmentId: string
  key: string
  localValue: string
  sharedValue: string
  valueType: EnvironmentVariableValueType
  enabled: boolean
  order: number
  createdAt?: string | number
  updatedAt?: string | number
}
type BatchVariableInput = {
  _id?: string
  key: string
  localValue: string
  sharedValue: string
  valueType: EnvironmentVariableValueType
  enabled: boolean
  order: number
}
const isOfflineMode = (): boolean => {
  const runtimeStore = useRuntime()
  return runtimeStore.networkMode === 'offline'
}
const toTimestamp = (value: string | number | undefined): number => {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    const timestamp = Date.parse(value)
    if (!Number.isNaN(timestamp)) {
      return timestamp
    }
  }
  return Date.now()
}
const toClientEnvironment = (item: ServerEnvironment): EnvironmentEntity => {
  return {
    id: item._id,
    projectId: item.projectId,
    name: item.name || '',
    baseUrl: item.baseUrl || '',
    description: item.description || '',
    order: item.order ?? 0,
    isActive: false,
    visibilityMode: item.visibilityMode || 'shared',
    createdAt: toTimestamp(item.createdAt),
    updatedAt: toTimestamp(item.updatedAt),
  }
}
const toClientEnvironmentVariable = (item: ServerEnvironmentVariable): EnvironmentVariableEntity => {
  return {
    id: item._id,
    projectId: item.projectId,
    environmentId: item.environmentId,
    key: item.key || '',
    localValue: item.localValue || '',
    sharedValue: item.sharedValue || '',
    valueType: item.valueType || 'text',
    enabled: item.enabled !== false,
    order: item.order ?? 0,
    createdAt: toTimestamp(item.createdAt),
    updatedAt: toTimestamp(item.updatedAt),
  }
}
const sortAndReorderEnvironments = (data: EnvironmentEntity[]): EnvironmentEntity[] => {
  return data
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      ...item,
      order: index,
    }))
}
const sortAndReorderVariables = (data: EnvironmentVariableEntity[]): EnvironmentVariableEntity[] => {
  return data
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      ...item,
      order: index,
    }))
}
const sanitizeEnvironmentName = (name: string, fallbackName: string): string => {
  const trimmed = name.trim()
  if (trimmed) {
    return trimmed
  }
  return fallbackName
}
const resolveEnvironmentVariableValue = (item: EnvironmentVariableEntity, visibilityMode: EnvironmentVisibilityMode, offlineMode: boolean): string => {
  if (offlineMode) {
    return item.localValue
  }
  if (visibilityMode === 'shared') {
    return item.sharedValue || item.localValue
  }
  return item.localValue
}
const getActiveEnvironmentIdMap = (): Record<string, string> => {
  try {
    const localData = localStorage.getItem(cacheKey.projectWorkbench.environment.activeId) || '{}'
    return JSON.parse(localData) as Record<string, string>
  } catch (error) {
    logger.error('获取当前环境缓存失败', { error })
    localStorage.setItem(cacheKey.projectWorkbench.environment.activeId, '{}')
    return {}
  }
}
const setActiveEnvironmentIdMap = (data: Record<string, string>): void => {
  try {
    localStorage.setItem(cacheKey.projectWorkbench.environment.activeId, JSON.stringify(data))
  } catch (error) {
    logger.error('设置当前环境缓存失败', { error })
    localStorage.setItem(cacheKey.projectWorkbench.environment.activeId, '{}')
  }
}
export const useEnvironment = defineStore('projectEnvironment', () => {
  const loadedProjectId = ref('')
  const environmentList = ref<EnvironmentEntity[]>([])
  const environmentVariableMap = ref<Record<string, EnvironmentVariableEntity[]>>({})
  const activeEnvironmentId = ref('')
  const loading = ref(false)
  const saving = ref(false)
  const setEnvironmentList = (list: EnvironmentEntity[]): void => {
    const ordered = sortAndReorderEnvironments(list)
    environmentList.value = ordered.map(item => ({
      ...item,
      isActive: item.id === activeEnvironmentId.value,
    }))
  }
  const setEnvironmentVariables = (environmentId: string, variables: EnvironmentVariableEntity[]): void => {
    environmentVariableMap.value = {
      ...environmentVariableMap.value,
      [environmentId]: sortAndReorderVariables(variables),
    }
  }
  const setEnvironmentVariableMap = (variableMap: Record<string, EnvironmentVariableEntity[]>): void => {
    const nextMap: Record<string, EnvironmentVariableEntity[]> = {}
    Object.keys(variableMap).forEach(environmentId => {
      nextMap[environmentId] = sortAndReorderVariables(variableMap[environmentId])
    })
    environmentVariableMap.value = nextMap
  }
  const syncActiveStatus = (): void => {
    environmentList.value = environmentList.value.map(item => ({
      ...item,
      isActive: item.id === activeEnvironmentId.value,
    }))
  }
  const ensureActiveEnvironmentId = (): void => {
    const matched = environmentList.value.find(item => item.id === activeEnvironmentId.value)
    if (matched) {
      return
    }
    activeEnvironmentId.value = environmentList.value[0]?.id || ''
    syncActiveStatus()
  }
  const persistActiveEnvironment = (): void => {
    if (!loadedProjectId.value) {
      return
    }
    const activeMap = getActiveEnvironmentIdMap()
    activeMap[loadedProjectId.value] = activeEnvironmentId.value
    setActiveEnvironmentIdMap(activeMap)
  }
  const persistOfflineProjectData = async (): Promise<boolean> => {
    if (!loadedProjectId.value) {
      return true
    }
    const environmentResponse = await environmentCache.replaceEnvironmentByProjectId(
      loadedProjectId.value,
      environmentList.value
    )
    if (environmentResponse.code !== 0) {
      return false
    }
    const variables = Object.values(environmentVariableMap.value).flat()
    const variableResponse = await environmentVariableCache.replaceVariablesByProjectId(
      loadedProjectId.value,
      variables
    )
    if (variableResponse.code !== 0) {
      return false
    }
    persistActiveEnvironment()
    return true
  }
  const loadOfflineProjectData = async (projectId: string): Promise<void> => {
    const environmentResponse = await environmentCache.getEnvironmentByProjectId(projectId)
    const variableResponse = await environmentVariableCache.getVariablesByProjectId(projectId)
    const loadedEnvironments = environmentResponse.code === 0 ? environmentResponse.data : []
    const loadedVariables = variableResponse.code === 0 ? variableResponse.data : []
    const groupedVariableMap: Record<string, EnvironmentVariableEntity[]> = {}
    loadedVariables.forEach(item => {
      if (!groupedVariableMap[item.environmentId]) {
        groupedVariableMap[item.environmentId] = []
      }
      groupedVariableMap[item.environmentId].push(item)
    })
    const activeMap = getActiveEnvironmentIdMap()
    activeEnvironmentId.value = activeMap[projectId] || ''
    setEnvironmentList(loadedEnvironments)
    setEnvironmentVariableMap(groupedVariableMap)
    ensureActiveEnvironmentId()
    persistActiveEnvironment()
  }
  const loadOnlineProjectData = async (projectId: string): Promise<void> => {
    const environmentResponse = await request.get<CommonResponse<ServerEnvironment[]>, CommonResponse<ServerEnvironment[]>>(
      '/api/project/environment/list',
      {
        params: { projectId },
      }
    )
    const loadedEnvironments = environmentResponse.data.map(toClientEnvironment)
    const variableEntries = await Promise.all(
      loadedEnvironments.map(async (item) => {
        const variableResponse = await request.get<
          CommonResponse<ServerEnvironmentVariable[]>,
          CommonResponse<ServerEnvironmentVariable[]>
        >('/api/project/environment/variable/list', {
          params: {
            projectId,
            environmentId: item.id,
          },
        })
        return {
          environmentId: item.id,
          variables: variableResponse.data.map(toClientEnvironmentVariable),
        }
      })
    )
    const groupedVariableMap: Record<string, EnvironmentVariableEntity[]> = {}
    variableEntries.forEach(item => {
      groupedVariableMap[item.environmentId] = item.variables
    })
    const activeMap = getActiveEnvironmentIdMap()
    activeEnvironmentId.value = activeMap[projectId] || ''
    setEnvironmentList(loadedEnvironments)
    setEnvironmentVariableMap(groupedVariableMap)
    ensureActiveEnvironmentId()
    persistActiveEnvironment()
  }
  const ensureProjectLoaded = async (projectId: string, options?: { force?: boolean }): Promise<void> => {
    if (!projectId) {
      return
    }
    const force = options?.force === true
    if (!force && loadedProjectId.value === projectId) {
      return
    }
    loadedProjectId.value = projectId
    loading.value = true
    try {
      if (isOfflineMode()) {
        await loadOfflineProjectData(projectId)
      } else {
        await loadOnlineProjectData(projectId)
      }
    } catch (error) {
      logger.error('加载环境数据失败', { error })
      setEnvironmentList([])
      setEnvironmentVariableMap({})
      activeEnvironmentId.value = ''
    } finally {
      loading.value = false
    }
  }
  const setActiveEnvironment = (environmentId: string): void => {
    const matched = environmentList.value.find(item => item.id === environmentId)
    if (!matched) {
      activeEnvironmentId.value = ''
      syncActiveStatus()
      persistActiveEnvironment()
      return
    }
    activeEnvironmentId.value = environmentId
    syncActiveStatus()
    persistActiveEnvironment()
  }
  const getEnvironmentById = (environmentId: string): EnvironmentEntity | null => {
    return environmentList.value.find(item => item.id === environmentId) || null
  }
  const buildBatchVariablePayload = (environmentId: string): BatchVariableInput[] => {
    const variables = sortAndReorderVariables(environmentVariableMap.value[environmentId] || [])
    setEnvironmentVariables(environmentId, variables)
    return variables.map((item, index) => ({
      _id: item.id.startsWith('local_') ? undefined : item.id,
      key: item.key.trim(),
      localValue: item.localValue,
      sharedValue: item.sharedValue,
      valueType: item.valueType,
      enabled: item.enabled,
      order: index,
    }))
  }
  const syncEnvironmentVariables = async (environmentId: string): Promise<boolean> => {
    if (isOfflineMode()) {
      return persistOfflineProjectData()
    }
    const payloadVariables = buildBatchVariablePayload(environmentId)
    const response = await request.put<CommonResponse<ServerEnvironmentVariable[]>, CommonResponse<ServerEnvironmentVariable[]>>(
      '/api/project/environment/variable/batch',
      {
        projectId: loadedProjectId.value,
        environmentId,
        variables: payloadVariables,
      }
    )
    setEnvironmentVariables(environmentId, response.data.map(toClientEnvironmentVariable))
    return true
  }
  const createEnvironment = async (defaultName: string): Promise<string> => {
    if (!loadedProjectId.value) {
      return ''
    }
    saving.value = true
    try {
      const now = Date.now()
      const name = sanitizeEnvironmentName(defaultName, defaultName)
      const order = environmentList.value.length
      if (isOfflineMode()) {
        const environmentId = `local_${nanoid()}`
        const createdEnvironment: EnvironmentEntity = {
          id: environmentId,
          projectId: loadedProjectId.value,
          name,
          baseUrl: '',
          description: '',
          order,
          isActive: false,
          visibilityMode: 'shared',
          createdAt: now,
          updatedAt: now,
        }
        setEnvironmentList(environmentList.value.concat(createdEnvironment))
        setEnvironmentVariables(environmentId, [])
        setActiveEnvironment(environmentId)
        const saved = await persistOfflineProjectData()
        return saved ? environmentId : ''
      }
      const response = await request.post<CommonResponse<{ _id: string }>, CommonResponse<{ _id: string }>>(
        '/api/project/environment',
        {
          projectId: loadedProjectId.value,
          name,
          baseUrl: '',
          description: '',
          order,
          visibilityMode: 'shared',
        }
      )
      const environmentId = response.data._id
      const createdEnvironment: EnvironmentEntity = {
        id: environmentId,
        projectId: loadedProjectId.value,
        name,
        baseUrl: '',
        description: '',
        order,
        isActive: false,
        visibilityMode: 'shared',
        createdAt: now,
        updatedAt: now,
      }
      setEnvironmentList(environmentList.value.concat(createdEnvironment))
      setEnvironmentVariables(environmentId, [])
      setActiveEnvironment(environmentId)
      return environmentId
    } catch (error) {
      logger.error('创建环境失败', { error })
      return ''
    } finally {
      saving.value = false
    }
  }
  const duplicateEnvironment = async (environmentId: string, duplicateSuffix: string): Promise<string> => {
    const targetEnvironment = getEnvironmentById(environmentId)
    if (!targetEnvironment || !loadedProjectId.value) {
      return ''
    }
    saving.value = true
    try {
      const now = Date.now()
      const duplicatedName = `${targetEnvironment.name} ${duplicateSuffix}`.trim()
      const name = sanitizeEnvironmentName(duplicatedName, duplicateSuffix)
      const order = environmentList.value.length
      if (isOfflineMode()) {
        const duplicatedEnvironmentId = `local_${nanoid()}`
        const duplicatedEnvironment: EnvironmentEntity = {
          ...targetEnvironment,
          id: duplicatedEnvironmentId,
          name,
          order,
          isActive: false,
          createdAt: now,
          updatedAt: now,
        }
        const sourceVariables = environmentVariableMap.value[environmentId] || []
        const duplicatedVariables = sourceVariables.map((item, index) => ({
          ...item,
          id: `local_${nanoid()}`,
          projectId: loadedProjectId.value,
          environmentId: duplicatedEnvironmentId,
          order: index,
          createdAt: now,
          updatedAt: now,
        }))
        setEnvironmentList(environmentList.value.concat(duplicatedEnvironment))
        setEnvironmentVariables(duplicatedEnvironmentId, duplicatedVariables)
        setActiveEnvironment(duplicatedEnvironmentId)
        const saved = await persistOfflineProjectData()
        return saved ? duplicatedEnvironmentId : ''
      }
      const createResponse = await request.post<CommonResponse<{ _id: string }>, CommonResponse<{ _id: string }>>(
        '/api/project/environment',
        {
          projectId: loadedProjectId.value,
          name,
          baseUrl: targetEnvironment.baseUrl,
          description: targetEnvironment.description,
          order,
          visibilityMode: targetEnvironment.visibilityMode,
        }
      )
      const duplicatedEnvironmentId = createResponse.data._id
      const sourceVariables = environmentVariableMap.value[environmentId] || []
      if (sourceVariables.length > 0) {
        const variables = sortAndReorderVariables(sourceVariables).map((item, index) => ({
          key: item.key,
          localValue: item.localValue,
          sharedValue: item.sharedValue,
          valueType: item.valueType,
          enabled: item.enabled,
          order: index,
        }))
        await request.put('/api/project/environment/variable/batch', {
          projectId: loadedProjectId.value,
          environmentId: duplicatedEnvironmentId,
          variables,
        })
      }
      const duplicatedEnvironment: EnvironmentEntity = {
        ...targetEnvironment,
        id: duplicatedEnvironmentId,
        name,
        order,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      }
      setEnvironmentList(environmentList.value.concat(duplicatedEnvironment))
      if (sourceVariables.length > 0) {
        const variableResponse = await request.get<
          CommonResponse<ServerEnvironmentVariable[]>,
          CommonResponse<ServerEnvironmentVariable[]>
        >('/api/project/environment/variable/list', {
          params: {
            projectId: loadedProjectId.value,
            environmentId: duplicatedEnvironmentId,
          },
        })
        setEnvironmentVariables(duplicatedEnvironmentId, variableResponse.data.map(toClientEnvironmentVariable))
      } else {
        setEnvironmentVariables(duplicatedEnvironmentId, [])
      }
      setActiveEnvironment(duplicatedEnvironmentId)
      return duplicatedEnvironmentId
    } catch (error) {
      logger.error('复制环境失败', { error })
      return ''
    } finally {
      saving.value = false
    }
  }
  const deleteEnvironment = async (environmentId: string): Promise<boolean> => {
    const targetIndex = environmentList.value.findIndex(item => item.id === environmentId)
    if (targetIndex < 0 || !loadedProjectId.value) {
      return false
    }
    saving.value = true
    try {
      if (!isOfflineMode()) {
        await request.delete('/api/project/environment', {
          data: {
            projectId: loadedProjectId.value,
            ids: [environmentId],
          },
        })
      }
      const nextList = environmentList.value.filter(item => item.id !== environmentId)
      setEnvironmentList(nextList)
      const nextMap = { ...environmentVariableMap.value }
      delete nextMap[environmentId]
      environmentVariableMap.value = nextMap
      if (activeEnvironmentId.value === environmentId) {
        const fallbackIndex = targetIndex >= nextList.length ? nextList.length - 1 : targetIndex
        const fallbackEnvironmentId = nextList[fallbackIndex]?.id || ''
        setActiveEnvironment(fallbackEnvironmentId)
      } else {
        syncActiveStatus()
      }
      if (isOfflineMode()) {
        return persistOfflineProjectData()
      }
      return true
    } catch (error) {
      logger.error('删除环境失败', { error })
      return false
    } finally {
      saving.value = false
    }
  }
  const updateEnvironment = async (environmentId: string, patch: Partial<Pick<EnvironmentEntity, 'name' | 'baseUrl' | 'description' | 'visibilityMode'>>): Promise<boolean> => {
    const targetIndex = environmentList.value.findIndex(item => item.id === environmentId)
    if (targetIndex < 0 || !loadedProjectId.value) {
      return false
    }
    const targetEnvironment = environmentList.value[targetIndex]
    const nextName = patch.name === undefined ? targetEnvironment.name : sanitizeEnvironmentName(patch.name, targetEnvironment.name || patch.name)
    const nextEnvironment: EnvironmentEntity = {
      ...targetEnvironment,
      ...patch,
      name: nextName,
      updatedAt: Date.now(),
    }
    const nextList = environmentList.value.slice()
    nextList[targetIndex] = nextEnvironment
    setEnvironmentList(nextList)
    try {
      if (isOfflineMode()) {
        return persistOfflineProjectData()
      }
      await request.put('/api/project/environment', {
        _id: nextEnvironment.id,
        projectId: nextEnvironment.projectId,
        name: nextEnvironment.name,
        baseUrl: nextEnvironment.baseUrl,
        description: nextEnvironment.description,
        order: nextEnvironment.order,
        visibilityMode: nextEnvironment.visibilityMode,
      })
      return true
    } catch (error) {
      logger.error('更新环境失败', { error })
      await ensureProjectLoaded(loadedProjectId.value, { force: true })
      return false
    }
  }
  const addVariable = async (environmentId: string): Promise<string> => {
    if (!loadedProjectId.value || !getEnvironmentById(environmentId)) {
      return ''
    }
    const now = Date.now()
    const currentVariables = environmentVariableMap.value[environmentId] || []
    const newVariable: EnvironmentVariableEntity = {
      id: `local_${nanoid()}`,
      projectId: loadedProjectId.value,
      environmentId,
      key: '',
      localValue: '',
      sharedValue: '',
      valueType: 'text',
      enabled: true,
      order: currentVariables.length,
      createdAt: now,
      updatedAt: now,
    }
    setEnvironmentVariables(environmentId, currentVariables.concat(newVariable))
    try {
      const saved = await syncEnvironmentVariables(environmentId)
      if (!saved) {
        return ''
      }
      const current = environmentVariableMap.value[environmentId] || []
      return current[current.length - 1]?.id || newVariable.id
    } catch (error) {
      logger.error('新增环境变量失败', { error })
      if (!isOfflineMode()) {
        await ensureProjectLoaded(loadedProjectId.value, { force: true })
      }
      return ''
    }
  }
  const deleteVariable = async (environmentId: string, variableId: string): Promise<boolean> => {
    if (!loadedProjectId.value || !getEnvironmentById(environmentId)) {
      return false
    }
    const currentVariables = environmentVariableMap.value[environmentId] || []
    setEnvironmentVariables(environmentId, currentVariables.filter(item => item.id !== variableId))
    try {
      return await syncEnvironmentVariables(environmentId)
    } catch (error) {
      logger.error('删除环境变量失败', { error })
      if (!isOfflineMode()) {
        await ensureProjectLoaded(loadedProjectId.value, { force: true })
      }
      return false
    }
  }
  const updateVariable = async (
    environmentId: string,
    variableId: string,
    patch: Partial<Pick<EnvironmentVariableEntity, 'key' | 'localValue' | 'sharedValue' | 'valueType' | 'enabled'>>
  ): Promise<boolean> => {
    if (!loadedProjectId.value || !getEnvironmentById(environmentId)) {
      return false
    }
    const currentVariables = environmentVariableMap.value[environmentId] || []
    const variableIndex = currentVariables.findIndex(item => item.id === variableId)
    if (variableIndex < 0) {
      return false
    }
    const currentVariable = currentVariables[variableIndex]
    const nextVariables = currentVariables.slice()
    nextVariables[variableIndex] = {
      ...currentVariable,
      ...patch,
      key: patch.key === undefined ? currentVariable.key : patch.key.trim(),
      updatedAt: Date.now(),
    }
    setEnvironmentVariables(environmentId, nextVariables)
    try {
      return await syncEnvironmentVariables(environmentId)
    } catch (error) {
      logger.error('更新环境变量失败', { error })
      if (!isOfflineMode()) {
        await ensureProjectLoaded(loadedProjectId.value, { force: true })
      }
      return false
    }
  }
  const activeEnvironment = computed(() => {
    return environmentList.value.find(item => item.id === activeEnvironmentId.value) || null
  })
  const activeEnvironmentVariables = computed(() => {
    if (!activeEnvironmentId.value) {
      return [] as EnvironmentVariableEntity[]
    }
    return (environmentVariableMap.value[activeEnvironmentId.value] || []).slice().sort((a, b) => a.order - b.order)
  })
  const buildCurrentEnvironmentVariableObject = (): Record<string, unknown> => {
    const offlineMode = isOfflineMode()
    const currentEnvironment = activeEnvironment.value
    if (!currentEnvironment) {
      return {}
    }
    const variableList = environmentVariableMap.value[currentEnvironment.id] || []
    const result: Record<string, unknown> = {}
    variableList.forEach(item => {
      if (!item.enabled) {
        return
      }
      if (!item.key.trim()) {
        return
      }
      result[item.key] = resolveEnvironmentVariableValue(item, currentEnvironment.visibilityMode, offlineMode)
    })
    return result
  }
  const buildCurrentEnvironmentApidocVariables = (): ApidocVariable[] => {
    const offlineMode = isOfflineMode()
    const currentEnvironment = activeEnvironment.value
    if (!currentEnvironment) {
      return []
    }
    const variables = environmentVariableMap.value[currentEnvironment.id] || []
    return variables
      .filter(item => item.enabled && item.key.trim() !== '')
      .map(item => ({
        _id: item.id,
        projectId: loadedProjectId.value,
        name: item.key,
        value: resolveEnvironmentVariableValue(item, currentEnvironment.visibilityMode, offlineMode),
        type: 'string',
        fileValue: {
          name: '',
          path: '',
          fileType: '',
        },
      }))
  }
  return {
    loadedProjectId,
    environmentList,
    environmentVariableMap,
    activeEnvironmentId,
    loading,
    saving,
    activeEnvironment,
    activeEnvironmentVariables,
    ensureProjectLoaded,
    createEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    updateEnvironment,
    addVariable,
    deleteVariable,
    updateVariable,
    setActiveEnvironment,
    buildCurrentEnvironmentVariableObject,
    buildCurrentEnvironmentApidocVariables,
  }
})
