import type { LLMProviderSetting } from '@src/types/ai/agent.type';
import { logger } from '@/helper/logger';
import { cacheKey } from '../cacheKey';
class LLMProviderCache {
  // 获取 LLM Provider 配置
  getLLMProvider(): LLMProviderSetting | null {
    try {
      const cached = localStorage.getItem(cacheKey.ai.llmProvider);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.provider = 'OpenAICompatible';
        if (!parsed.customHeaders) {
          parsed.customHeaders = [];
        }
        if (typeof parsed.extraBody !== 'string') {
          parsed.extraBody = '';
        }
        return parsed;
      }
    } catch (error) {
      logger.error('获取 LLM Provider 配置失败', { error });
    }
    return null;
  }
  // 保存 LLM Provider 配置
  setLLMProvider(provider: LLMProviderSetting): boolean {
    try {
      localStorage.setItem(cacheKey.ai.llmProvider, JSON.stringify(provider));
      return true;
    } catch (error) {
      logger.error('保存 LLM Provider 配置失败', { error });
      return false;
    }
  }
}
export const llmProviderCache = new LLMProviderCache();
