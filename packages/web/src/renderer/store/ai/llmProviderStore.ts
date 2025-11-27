import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { nanoid } from 'nanoid/non-secure';
import type { LLMProviderSettings, LLMProviderType, CustomHeader } from '@src/types/ai/agent.type';
import { cacheKey } from '@/cache/cacheKey';
import { logger } from '@/helper';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
// 创建默认的 Provider 配置
const createDefaultProvider = (): LLMProviderSettings => ({
  id: nanoid(),
  name: 'Default Provider',
  provider: 'DeepSeek',
  apiKey: '',
  baseURL: DEEPSEEK_BASE_URL,
  model: 'deepseek-chat',
  customHeaders: [],
});
// 从 localStorage 加载配置
const loadFromCache = (): LLMProviderSettings | null => {
  try {
    const cached = localStorage.getItem(cacheKey.ai.llmProvider);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (!parsed.customHeaders) {
        parsed.customHeaders = [];
      }
      return parsed;
    }
  } catch (error) {
    logger.error('加载 LLM Provider 配置失败', { error });
  }
  return null;
};
// 保存配置到 localStorage
const saveToCache = (provider: LLMProviderSettings): void => {
  try {
    localStorage.setItem(cacheKey.ai.llmProvider, JSON.stringify(provider));
  } catch (error) {
    logger.error('保存 LLM Provider 配置失败', { error });
  }
};

export const useLLMProvider = defineStore('llmProvider', () => {
  const activeProvider = ref<LLMProviderSettings>(loadFromCache() || createDefaultProvider());
  const isConfigValid = computed(() => {
    const p = activeProvider.value;
    return p.apiKey.trim() !== '' && p.baseURL.trim() !== '' && p.model.trim() !== '';
  });
  // 监听变化自动保存
  watch(activeProvider, (newVal) => {
    saveToCache(newVal);
  }, { deep: true });
  // 更新 Provider 类型
  const changeProviderType = (providerType: LLMProviderType) => {
    activeProvider.value.provider = providerType;
    if (providerType === 'DeepSeek') {
      activeProvider.value.baseURL = DEEPSEEK_BASE_URL;
      activeProvider.value.model = 'deepseek-chat';
      activeProvider.value.customHeaders = [];
    } else {
      activeProvider.value.baseURL = '';
      activeProvider.value.model = '';
    }
  };
  // 更新配置字段
  const updateConfig = (updates: Partial<Omit<LLMProviderSettings, 'id'>>) => {
    Object.assign(activeProvider.value, updates);
  };
  // 添加自定义请求头
  const addCustomHeader = (header: CustomHeader) => {
    activeProvider.value.customHeaders.push(header);
  };
  // 删除自定义请求头
  const removeCustomHeader = (index: number) => {
    activeProvider.value.customHeaders.splice(index, 1);
  };
  // 更新自定义请求头
  const updateCustomHeader = (index: number, header: Partial<CustomHeader>) => {
    if (activeProvider.value.customHeaders[index]) {
      Object.assign(activeProvider.value.customHeaders[index], header);
    }
  };
  // 重置配置
  const resetConfig = () => {
    activeProvider.value = createDefaultProvider();
  };
  // 初始化（从缓存加载）
  const initFromCache = () => {
    const cached = loadFromCache();
    if (cached) {
      activeProvider.value = cached;
    }
  };
  return {
    activeProvider,
    isConfigValid,
    changeProviderType,
    updateConfig,
    addCustomHeader,
    removeCustomHeader,
    updateCustomHeader,
    resetConfig,
    initFromCache,
  };
});
