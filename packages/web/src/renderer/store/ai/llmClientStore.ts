import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatRequestBody, ChatStreamCallbacks, LLMProviderProfiles, LLMProviderSetting, LLMVendor, OpenAiResponseBody } from '@src/types/ai/agent.type'
import { createLLMProvider, getLLMConfigError, getLLMRequestError, resolveLLMProvider } from '@src/config/llmProviders'
import { isElectron } from '@/helper'
import { llmProviderCache } from '@/cache/ai/llmProviderCache'
import { useRuntime } from '@/store/runtime/runtimeStore'

export const useLLMClientStore = defineStore('llmClientStore', () => {
  const runtimeStore = useRuntime()
  const LLMConfig = ref<LLMProviderSetting>(createLLMProvider())
  const profiles = ref<LLMProviderProfiles>({})
  // 判断 AI 运行边界
  const isOfflineElectron = (): boolean => isElectron() && runtimeStore.networkMode === 'offline' && Boolean(window.electronAPI?.aiManager)
  // 获取厂商配置
  const getProviderConfig = (vendor: LLMVendor): LLMProviderSetting => resolveLLMProvider(profiles.value[vendor] ?? createLLMProvider(vendor))
  // 同步配置到主进程
  const syncConfig = (config: LLMProviderSetting): void => { if (isOfflineElectron()) window.electronAPI?.aiManager.updateConfig(JSON.parse(JSON.stringify(config))) }
  // 更新配置
  const updateLLMConfig = (updates: Partial<Omit<LLMProviderSetting, 'id'>>): boolean => {
    if (!isOfflineElectron()) return false
    const next = resolveLLMProvider({ ...LLMConfig.value, ...updates })
    const vendor = next.vendor ?? 'custom'
    const nextProfiles = { ...profiles.value, [vendor]: next }
    if (!llmProviderCache.setLLMProviders({ version: 2, activeVendor: vendor, profiles: nextProfiles })) return false
    profiles.value = nextProfiles
    LLMConfig.value = next
    syncConfig(next)
    return true
  }
  // 重置配置
  const resetLLMConfig = (): boolean => updateLLMConfig(createLLMProvider(LLMConfig.value.vendor ?? 'custom'))
  // 初始化配置
  const initLLMConfig = (): void => {
    if (!isOfflineElectron()) return
    const cached = llmProviderCache.getLLMProviders()
    if (cached) {
      profiles.value = cached.profiles
      LLMConfig.value = getProviderConfig(cached.activeVendor)
      llmProviderCache.setLLMProviders(cached)
    }
    syncConfig(LLMConfig.value)
  }
  // 非流式聊天
  const chat = async (body: ChatRequestBody, signal?: AbortSignal, override?: LLMProviderSetting): Promise<OpenAiResponseBody> => {
    if (!isOfflineElectron()) throw new Error('AI_OFFLINE_ONLY')
    const config = resolveLLMProvider(override ?? LLMConfig.value)
    const validationError = getLLMConfigError(config)
    if (validationError) throw new Error(validationError)
    if (signal?.aborted) throw new Error('请求已取消')
    const manager = window.electronAPI?.aiManager
    if (!manager) throw new Error('AI_OFFLINE_ONLY')
    try { return await manager.chat(body, JSON.parse(JSON.stringify(config))) } catch (error) { throw new Error(getLLMRequestError(error, config)) }
  }
  // 流式聊天
  const chatStream = (body: ChatRequestBody, callbacks: ChatStreamCallbacks, override?: LLMProviderSetting): { abort: () => void } => {
    if (!isOfflineElectron()) { callbacks.onError(new Error('AI_OFFLINE_ONLY')); return { abort: () => undefined } }
    const config = resolveLLMProvider(override ?? LLMConfig.value)
    const validationError = getLLMConfigError(config)
    if (validationError) { callbacks.onError(new Error(validationError)); return { abort: () => undefined } }
    const manager = window.electronAPI?.aiManager
    if (!manager) { callbacks.onError(new Error('AI_OFFLINE_ONLY')); return { abort: () => undefined } }
    return manager.chatStream(body, { ...callbacks, onError: error => callbacks.onError(new Error(getLLMRequestError(error, config))) }, JSON.parse(JSON.stringify(config)))
  }
  // 检查 AI 功能是否可用
  const isAvailable = (): boolean => isOfflineElectron() && !getLLMConfigError(LLMConfig.value)
  return { LLMConfig, profiles, getProviderConfig, updateLLMConfig, resetLLMConfig, initLLMConfig, chat, chatStream, isAvailable }
})
