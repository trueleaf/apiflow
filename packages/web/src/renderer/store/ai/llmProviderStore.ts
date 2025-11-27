import { defineStore } from 'pinia';
import { ref } from 'vue';
import { nanoid } from 'nanoid/non-secure';
import type { LLMProviderSettings, LLRequestBody, LLResponseBody } from '@src/types/ai/agent.type';

export const useLLMProvider = defineStore('llmProvider', () => {
  const providers = ref<LLMProviderSettings[]>([]);
  const activeProviderId = ref('');
  const addProvider = (provider: Omit<LLMProviderSettings, 'id'>) => {
    const newProvider: LLMProviderSettings = {
      ...provider,
      id: nanoid()
    };
    providers.value.push(newProvider);
    return newProvider;
  };
  const deleteProvider = (id: string) => {
    const index = providers.value.findIndex(p => p.id === id);
    if (index !== -1) {
      providers.value.splice(index, 1);
      if (activeProviderId.value === id) {
        activeProviderId.value = '';
      }
      return true;
    }
    return false;
  };
  const updateProvider = (id: string, updates: Partial<Omit<LLMProviderSettings, 'id'>>) => {
    const provider = providers.value.find(p => p.id === id);
    if (provider) {
      Object.assign(provider, updates);
      return true;
    }
    return false;
  };
  const changeActiveProviderId = (id: string) => {
    const provider = providers.value.find(p => p.id === id);
    if (provider) {
      activeProviderId.value = id;
      return true;
    }
    return false;
  };
  return {
    providers,
    activeProviderId,
    addProvider,
    deleteProvider,
    updateProvider,
    changeActiveProviderId
  };
});
