import type { Config } from '@src/types/config';
import { mainConfig } from '@src/config/mainConfig';
import { logger } from '@/helper';
import { cacheKey } from '../cacheKey';

type AiConfig = Config['mainConfig']['aiConfig'];

class AiCache {
  // 获取AI配置
  getAiConfig(): AiConfig {
    try {
      const configStr = localStorage.getItem(cacheKey.ai.config);
      if (!configStr) {
        return { ...mainConfig.aiConfig };
      }
      const config = JSON.parse(configStr);
      // 如果apiUrl不存在则取配置文件里面的apiUrl
      return {
        ...mainConfig.aiConfig,
        ...config,
        apiUrl: config.apiUrl || mainConfig.aiConfig.apiUrl,
      };
    } catch (error) {
      logger.error('获取AI配置失败', { error });
      return { ...mainConfig.aiConfig };
    }
  }
  // 设置AI配置
  setAiConfig(config: Partial<AiConfig>): void {
    try {
      const currentConfig = this.getAiConfig();
      const newConfig = {
        ...currentConfig,
        ...config,
      };
      localStorage.setItem(cacheKey.ai.config, JSON.stringify(newConfig));
    } catch (error) {
      logger.error('设置AI配置失败', { error });
      throw error;
    }
  }
  // 重置AI配置为默认值
  resetAiConfig(): void {
    try {
      localStorage.setItem(cacheKey.ai.config, JSON.stringify(mainConfig.aiConfig));
    } catch (error) {
      logger.error('重置AI配置失败', { error });
      throw error;
    }
  }
  // 清除AI配置
  clearAiConfig(): void {
    try {
      localStorage.removeItem(cacheKey.ai.config);
    } catch (error) {
      logger.error('清除AI配置失败', { error });
    }
  }
}

export const aiCache = new AiCache();
