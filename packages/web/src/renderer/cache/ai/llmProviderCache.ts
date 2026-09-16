import type { LLMProviderCacheData, LLMProviderProfiles, LLMProviderSetting, LLMVendor } from '@src/types/ai/agent.type';
import { createLLMProvider, isLLMReasoningEffort, isLLMThinkingMode, isLLMVendor, resolveLLMProvider } from '@src/config/llmProviders';
import { logger } from '@/helper/logger';
import { cacheKey } from '../cacheKey';
// 校验缓存对象
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
// 读取可选的正整数
const readPositiveInteger = (value: unknown): number | null => typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
// 读取配置字段并保留旧版自定义参数
const readProvider = (value: unknown, vendor: LLMVendor, migrateLegacyDefaults = false): LLMProviderSetting | null => {
  if (!isRecord(value) || typeof value.baseURL !== 'string' || typeof value.model !== 'string') return null;
  const defaults = createLLMProvider(vendor);
  return resolveLLMProvider({
    ...defaults,
    id: typeof value.id === 'string' ? value.id : defaults.id,
    name: typeof value.name === 'string' ? value.name : defaults.name,
    apiKey: typeof value.apiKey === 'string' ? value.apiKey : '',
    baseURL: value.baseURL,
    model: migrateLegacyDefaults && vendor === 'deepseek' && ['deepseek-chat', 'deepseek-v4-flash'].includes(value.model) ? defaults.model : value.model,
    customHeaders: Array.isArray(value.customHeaders) ? value.customHeaders.filter(isRecord)
      .filter(header => typeof header.key === 'string' && typeof header.value === 'string')
      .map(header => ({ key: String(header.key), value: String(header.value) })) : [],
    extraBody: typeof value.extraBody === 'string' ? value.extraBody : '',
    thinkingMode: isLLMThinkingMode(value.thinkingMode) ? value.thinkingMode : 'default',
    reasoningEffort: isLLMReasoningEffort(value.reasoningEffort) ? value.reasoningEffort : 'default',
    thinkingBudget: readPositiveInteger(value.thinkingBudget),
    maxTokens: readPositiveInteger(value.maxTokens),
  });
};
class LLMProviderCache {
  // 兼容仍读取当前配置的功能入口
  getLLMProvider(): LLMProviderSetting | null {
    const data = this.getLLMProviders();
    return data?.profiles[data.activeVendor] ?? null;
  }
  // 获取 LLM Provider 配置
  getLLMProviders(): LLMProviderCacheData | null {
    try {
      const cached = localStorage.getItem(cacheKey.ai.llmProvider);
      if (cached) {
        const parsed: unknown = JSON.parse(cached);
        if (!isRecord(parsed)) return null;
        if ((parsed.version === 1 || parsed.version === 2) && isLLMVendor(parsed.activeVendor) && isRecord(parsed.profiles)) {
          const profiles: LLMProviderProfiles = {};
          for (const vendor of ['deepseek', 'qwen', 'custom'] as const) {
            const provider = readProvider(parsed.profiles[vendor], vendor, parsed.version === 1);
            if (provider) profiles[vendor] = provider;
          }
          return { version: 2, activeVendor: parsed.activeVendor, profiles };
        }
        const custom = readProvider(parsed, 'custom');
        return custom ? { version: 2, activeVendor: 'custom', profiles: { custom } } : null;
      }
    } catch {
      logger.error('获取 LLM Provider 配置失败');
    }
    return null;
  }
  // 保存 LLM Provider 配置
  setLLMProviders(data: LLMProviderCacheData): boolean {
    try {
      localStorage.setItem(cacheKey.ai.llmProvider, JSON.stringify({ ...data.profiles[data.activeVendor], ...data }));
      return true;
    } catch {
      logger.error('保存 LLM Provider 配置失败');
      return false;
    }
  }
}
export const llmProviderCache = new LLMProviderCache();
