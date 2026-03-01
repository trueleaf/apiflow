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
const cloneEnvironmentList = (data: EnvironmentEntity[]): EnvironmentEntity[] => {
  return JSON.parse(JSON.stringify(data)) as EnvironmentEntity[]
}
const cloneEnvironmentVariableMap = (data: Record<string, EnvironmentVariableEntity[]>): Record<string, EnvironmentVariableEntity[]> => {
  return JSON.parse(JSON.stringify(data)) as Record<string, EnvironmentVariableEntity[]>
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
  const draftEnvironmentList = ref<EnvironmentEntity[]>([])
  const draftEnvironmentVariableMap = ref<Record<string, EnvironmentVariableEntity[]>>({})
  const draftSelectedEnvironmentId = ref('')
  const draftActiveEnvironmentId = ref('')
  const draftVisible = ref(false)
  const dirty = ref(false)
  const loading = ref(false)
  const saving = ref(false)
  const setEnvironmentList = (list: EnvironmentEntity[]): void => {
    const ordered = sortAndReorderEnvironments(list)
    environmentList.value = ordered.map(item => ({
      ...item,
      isActive: item.id === activeEnvironmentId.value,
    }))
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
      draftVisible.value = false
      dirty.value = false
    } catch (error) {
      logger.error('加载环境数据失败', { error })
      setEnvironmentList([])
      setEnvironmentVariableMap({})
      activeEnvironmentId.value = ''
    } finally {
      loading.value = false
    }
  }
  const openDraft = (): void => {
    draftVisible.value = true
    dirty.value = false
    draftEnvironmentList.value = cloneEnvironmentList(environmentList.value)
    draftEnvironmentVariableMap.value = cloneEnvironmentVariableMap(environmentVariableMap.value)
    draftSelectedEnvironmentId.value = activeEnvironmentId.value || draftEnvironmentList.value[0]?.id || ''
    draftActiveEnvironmentId.value = activeEnvironmentId.value
  }
  const closeDraft = (): void => {
    draftVisible.value = false
    dirty.value = false
    draftEnvironmentList.value = []
    draftEnvironmentVariableMap.value = {}
    draftSelectedEnvironmentId.value = ''
    draftActiveEnvironmentId.value = ''
  }
  const markDirty = (): void => {
    dirty.value = true
  }
  const createDraftEnvironment = (defaultName: string): string => {
    const now = Date.now()
    const newEnvironment: EnvironmentEntity = {
      id: `local_${nanoid()}`,
      projectId: loadedProjectId.value,
      name: defaultName,
      baseUrl: '',
      description: '',
      order: draftEnvironmentList.value.length,
      isActive: false,
      visibilityMode: 'shared',
      createdAt: now,
      updatedAt: now,
    }
    draftEnvironmentList.value = sortAndReorderEnvironments(draftEnvironmentList.value.concat(newEnvironment))
    draftEnvironmentVariableMap.value[newEnvironment.id] = []
    draftSelectedEnvironmentId.value = newEnvironment.id
    markDirty()
    return newEnvironment.id
  }
  const duplicateDraftEnvironment = (environmentId: string, duplicateSuffix: string): string => {
    const targetIndex = draftEnvironmentList.value.findIndex(item => item.id === environmentId)
    if (targetIndex < 0) {
      return ''
    }
    const targetEnvironment = draftEnvironmentList.value[targetIndex]
    const now = Date.now()
    const duplicatedEnvironmentId = `local_${nanoid()}`
    const duplicatedEnvironment: EnvironmentEntity = {
      ...targetEnvironment,
      id: duplicatedEnvironmentId,
      name: `${targetEnvironment.name} ${duplicateSuffix}`.trim(),
      isActive: false,
      createdAt: now,
      updatedAt: now,
    }
    const nextList = draftEnvironmentList.value.slice()
    nextList.splice(targetIndex + 1, 0, duplicatedEnvironment)
    draftEnvironmentList.value = sortAndReorderEnvironments(nextList)
    const originVariables = draftEnvironmentVariableMap.value[environmentId] || []
    draftEnvironmentVariableMap.value[duplicatedEnvironmentId] = originVariables.map((item, index) => ({
      ...item,
      id: `local_${nanoid()}`,
      projectId: loadedProjectId.value,
      environmentId: duplicatedEnvironmentId,
      order: index,
      createdAt: now,
      updatedAt: now,
    }))
    draftSelectedEnvironmentId.value = duplicatedEnvironmentId
    markDirty()
    return duplicatedEnvironmentId
  }
  const deleteDraftEnvironment = (environmentId: string): void => {
    const targetIndex = draftEnvironmentList.value.findIndex(item => item.id === environmentId)
    if (targetIndex < 0) {
      return
    }
    const nextList = draftEnvironmentList.value.slice()
    nextList.splice(targetIndex, 1)
    draftEnvironmentList.value = sortAndReorderEnvironments(nextList)
    delete draftEnvironmentVariableMap.value[environmentId]
    if (draftSelectedEnvironmentId.value === environmentId) {
      const fallbackIndex = targetIndex >= draftEnvironmentList.value.length ? draftEnvironmentList.value.length - 1 : targetIndex
      draftSelectedEnvironmentId.value = draftEnvironmentList.value[fallbackIndex]?.id || ''
    }
    if (draftActiveEnvironmentId.value === environmentId) {
      draftActiveEnvironmentId.value = draftEnvironmentList.value[0]?.id || ''
    }
    markDirty()
  }
  const updateDraftEnvironment = (environmentId: string, patch: Partial<Pick<EnvironmentEntity, 'name' | 'baseUrl' | 'description' | 'visibilityMode'>>): void => {
    const matchedIndex = draftEnvironmentList.value.findIndex(item => item.id === environmentId)
    if (matchedIndex < 0) {
      return
    }
    const current = draftEnvironmentList.value[matchedIndex]
    draftEnvironmentList.value[matchedIndex] = {
      ...current,
      ...patch,
      updatedAt: Date.now(),
    }
    markDirty()
  }
  const setDraftSelectedEnvironment = (environmentId: string): void => {
    draftSelectedEnvironmentId.value = environmentId
  }
  const setDraftActiveEnvironment = (environmentId: string): void => {
    draftActiveEnvironmentId.value = environmentId
    markDirty()
  }
  const addDraftVariable = (environmentId: string): string => {
    const now = Date.now()
    const currentVariables = draftEnvironmentVariableMap.value[environmentId] || []
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
    draftEnvironmentVariableMap.value[environmentId] = sortAndReorderVariables(currentVariables.concat(newVariable))
    markDirty()
    return newVariable.id
  }
  const deleteDraftVariable = (environmentId: string, variableId: string): void => {
    const currentVariables = draftEnvironmentVariableMap.value[environmentId] || []
    draftEnvironmentVariableMap.value[environmentId] = sortAndReorderVariables(currentVariables.filter(item => item.id !== variableId))
    markDirty()
  }
  const updateDraftVariable = (environmentId: string, variableId: string, patch: Partial<Pick<EnvironmentVariableEntity, 'key' | 'localValue' | 'sharedValue' | 'valueType' | 'enabled'>>): void => {
    const currentVariables = draftEnvironmentVariableMap.value[environmentId] || []
    const targetIndex = currentVariables.findIndex(item => item.id === variableId)
    if (targetIndex < 0) {
      return
    }
    const target = currentVariables[targetIndex]
    const nextVariables = currentVariables.slice()
    nextVariables[targetIndex] = {
      ...target,
      ...patch,
      updatedAt: Date.now(),
    }
    draftEnvironmentVariableMap.value[environmentId] = sortAndReorderVariables(nextVariables)
    markDirty()
  }
  const validateDraftBeforeCommit = (fallbackName: string): { valid: boolean; duplicatedName: string } => {
    const nameSet = new Set<string>()
    for (let i = 0; i < draftEnvironmentList.value.length; i += 1) {
      const environment = draftEnvironmentList.value[i]
      const normalizedName = sanitizeEnvironmentName(environment.name, fallbackName)
      draftEnvironmentList.value[i] = {
        ...environment,
        name: normalizedName,
      }
      const variableList = draftEnvironmentVariableMap.value[environment.id] || []
      const variableNameSet = new Set<string>()
      for (let j = 0; j < variableList.length; j += 1) {
        const key = variableList[j].key.trim()
        if (!key) {
          return { valid: false, duplicatedName: '' }
        }
        const lowerCaseKey = key.toLowerCase()
        if (variableNameSet.has(lowerCaseKey)) {
          return { valid: false, duplicatedName: key }
        }
        variableNameSet.add(lowerCaseKey)
        variableList[j] = {
          ...variableList[j],
          key,
        }
      }
      draftEnvironmentVariableMap.value[environment.id] = variableList
      const lowerCaseEnvironmentName = normalizedName.toLowerCase()
      if (nameSet.has(lowerCaseEnvironmentName)) {
        return { valid: false, duplicatedName: normalizedName }
      }
      nameSet.add(lowerCaseEnvironmentName)
    }
    return { valid: true, duplicatedName: '' }
  }
  const saveOnlineDraft = async (): Promise<Record<string, string>> => {
    const projectId = loadedProjectId.value
    const originalEnvironmentList = cloneEnvironmentList(environmentList.value)
    const originalVariableMap = cloneEnvironmentVariableMap(environmentVariableMap.value)
    const draftList = sortAndReorderEnvironments(draftEnvironmentList.value)
    const draftVariableMap = cloneEnvironmentVariableMap(draftEnvironmentVariableMap.value)
    const idMap: Record<string, string> = {}
    const originalIdSet = new Set(originalEnvironmentList.map(item => item.id))
    const draftIdSet = new Set(draftList.map(item => item.id))
    const deleteEnvironmentIds = originalEnvironmentList
      .filter(item => !draftIdSet.has(item.id))
      .map(item => item.id)
    for (let i = 0; i < draftList.length; i += 1) {
      const item = draftList[i]
      const payload = {
        projectId,
        name: item.name,
        baseUrl: item.baseUrl,
        description: item.description,
        order: i,
        visibilityMode: item.visibilityMode,
      }
      if (originalIdSet.has(item.id)) {
        await request.put('/api/project/environment', {
          _id: item.id,
          ...payload,
        })
        idMap[item.id] = item.id
      } else {
        const createResponse = await request.post<CommonResponse<{ _id: string }>, CommonResponse<{ _id: string }>>(
          '/api/project/environment',
          payload
        )
        idMap[item.id] = createResponse.data._id
      }
    }
    if (deleteEnvironmentIds.length > 0) {
      await request.delete('/api/project/environment', {
        data: {
          projectId,
          ids: deleteEnvironmentIds,
        },
      })
    }
    for (let i = 0; i < draftList.length; i += 1) {
      const draftEnvironment = draftList[i]
      const realEnvironmentId = idMap[draftEnvironment.id] || draftEnvironment.id
      const draftVariables = sortAndReorderVariables(draftVariableMap[draftEnvironment.id] || [])
      const oldVariables = originalVariableMap[realEnvironmentId] || []
      const oldVariableIdSet = new Set(oldVariables.map(item => item.id))
      const payloadVariables: BatchVariableInput[] = draftVariables.map((item, index) => ({
        _id: oldVariableIdSet.has(item.id) ? item.id : undefined,
        key: item.key,
        localValue: item.localValue,
        sharedValue: item.sharedValue,
        valueType: item.valueType,
        enabled: item.enabled,
        order: index,
      }))
      await request.put('/api/project/environment/variable/batch', {
        projectId,
        environmentId: realEnvironmentId,
        variables: payloadVariables,
      })
    }
    return idMap
  }
  const commitDraft = async (options: { applyActiveEnvironment: boolean }): Promise<boolean> => {
    const committedList = cloneEnvironmentList(draftEnvironmentList.value)
    const committedVariableMap = cloneEnvironmentVariableMap(draftEnvironmentVariableMap.value)
    saving.value = true
    try {
      if (isOfflineMode()) {
        setEnvironmentList(committedList)
        setEnvironmentVariableMap(committedVariableMap)
        if (options.applyActiveEnvironment) {
          activeEnvironmentId.value = draftActiveEnvironmentId.value || committedList[0]?.id || ''
        } else {
          const exists = committedList.some(item => item.id === activeEnvironmentId.value)
          if (!exists) {
            activeEnvironmentId.value = committedList[0]?.id || ''
          }
        }
        syncActiveStatus()
        const saved = await persistOfflineProjectData()
        if (!saved) {
          return false
        }
        closeDraft()
        return true
      }
      const idMap = await saveOnlineDraft()
      const activeIdInDraft = draftActiveEnvironmentId.value
      await ensureProjectLoaded(loadedProjectId.value, { force: true })
      if (options.applyActiveEnvironment) {
        const realActiveId = idMap[activeIdInDraft] || activeIdInDraft
        setActiveEnvironment(realActiveId)
      }
      closeDraft()
      return true
    } catch (error) {
      logger.error('保存环境草稿失败', { error })
      return false
    } finally {
      saving.value = false
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
  const activeEnvironment = computed(() => {
    return environmentList.value.find(item => item.id === activeEnvironmentId.value) || null
  })
  const activeEnvironmentVariables = computed(() => {
    if (!activeEnvironmentId.value) {
      return [] as EnvironmentVariableEntity[]
    }
    return (environmentVariableMap.value[activeEnvironmentId.value] || []).slice().sort((a, b) => a.order - b.order)
  })
  const draftSelectedEnvironment = computed(() => {
    return draftEnvironmentList.value.find(item => item.id === draftSelectedEnvironmentId.value) || null
  })
  const draftSelectedEnvironmentVariables = computed(() => {
    const environmentId = draftSelectedEnvironmentId.value
    if (!environmentId) {
      return [] as EnvironmentVariableEntity[]
    }
    return (draftEnvironmentVariableMap.value[environmentId] || []).slice().sort((a, b) => a.order - b.order)
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
    draftEnvironmentList,
    draftEnvironmentVariableMap,
    draftSelectedEnvironmentId,
    draftActiveEnvironmentId,
    draftVisible,
    dirty,
    loading,
    saving,
    activeEnvironment,
    activeEnvironmentVariables,
    draftSelectedEnvironment,
    draftSelectedEnvironmentVariables,
    ensureProjectLoaded,
    openDraft,
    closeDraft,
    createDraftEnvironment,
    duplicateDraftEnvironment,
    deleteDraftEnvironment,
    updateDraftEnvironment,
    setDraftSelectedEnvironment,
    setDraftActiveEnvironment,
    addDraftVariable,
    deleteDraftVariable,
    updateDraftVariable,
    validateDraftBeforeCommit,
    commitDraft,
    setActiveEnvironment,
    buildCurrentEnvironmentVariableObject,
    buildCurrentEnvironmentApidocVariables,
  }
})
