import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LLMProviderSettings, LLMProviderType, CustomHeader } from '@src/types/ai/agent.type';
import { generateDeepSeekProvider } from '@/helper';
import { llmProviderCache } from '@/cache/ai/llmProviderCache';

export const useLLMProvider = defineStore('llmProvider', () => {
  const activeProvider = ref<LLMProviderSettings>(generateDeepSeekProvider());


  watch(() => activeProvider.value,
    (newVal) => {
      window.electronAPI!.aiManager.updateConfig(JSON.parse(JSON.stringify(newVal)));
      llmProviderCache.setLLMProvider(newVal);
    },
    { deep: true }
  );
  // 更新 Provider 类型
  const changeProviderType = (providerType: LLMProviderType) => {
    activeProvider.value.provider = providerType;
    if (providerType === 'DeepSeek') {
      activeProvider.value.baseURL = 'https://api.deepseek.com';
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
    activeProvider.value = generateDeepSeekProvider();
  };
  // 初始化（从缓存加载）
  const initFromCache = () => {
    const cached = llmProviderCache.getLLMProvider();
    if (cached) {
      activeProvider.value = cached;
    }
  };
  return {
    activeProvider,
    changeProviderType,
    updateConfig,
    addCustomHeader,
    removeCustomHeader,
    updateCustomHeader,
    resetConfig,
    initFromCache,
  };
});
