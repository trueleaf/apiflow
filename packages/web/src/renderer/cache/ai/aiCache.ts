/**
 * AI配置缓存
 */

import type { Config } from '@src/types/config';
import { mainConfig } from '@src/config/mainConfig';

type AiConfig = Config['mainConfig']['aiConfig'];

// 缓存键常量
const AI_CONFIG_KEY = 'apiflow/ai/config';

class AiCache {
  /**
   * 获取AI配置
   */
  getAiConfig(): AiConfig {
    try {
      const configStr = localStorage.getItem(AI_CONFIG_KEY);
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
      console.error('获取AI配置失败:', error);
      return { ...mainConfig.aiConfig };
    }
  }

  /**
   * 设置AI配置
   */
  setAiConfig(config: Partial<AiConfig>): void {
    try {
      const currentConfig = this.getAiConfig();
      const newConfig = {
        ...currentConfig,
        ...config,
      };
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('设置AI配置失败:', error);
      throw error;
    }
  }

  /**
   * 重置AI配置为默认值
   */
  resetAiConfig(): void {
    try {
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(mainConfig.aiConfig));
    } catch (error) {
      console.error('重置AI配置失败:', error);
      throw error;
    }
  }

  /**
   * 清除AI配置
   */
  clearAiConfig(): void {
    try {
      localStorage.removeItem(AI_CONFIG_KEY);
    } catch (error) {
      console.error('清除AI配置失败:', error);
    }
  }
}

export const aiCache = new AiCache();
