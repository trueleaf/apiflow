/**
 * apidoc文档缓存
 */

import { GlobalConfig } from '@src/types/global';

class GlobalCache {
  constructor() {
    if (!localStorage.getItem('cache/globalConfig')) {
      localStorage.setItem('cache/globalConfig', '{}');
    }
  }

  /**
   * 获取全局配置信息
   */
  getGlobalConfig(): Partial<GlobalConfig> {
    try {
      const localData: Partial<GlobalConfig> = JSON.parse(localStorage.getItem('cache/globalConfig') || '{}');
      return localData;
    } catch (error) {
      console.error(error);
      localStorage.setItem('cache/globalConfig', '{}')
      return {};
    }
  }

  /**
   * 重置全局配置
   */
  changeGlobalConfig(config: GlobalConfig): void {
    try {
      localStorage.setItem('cache/globalConfig', JSON.stringify(config));
    } catch (error) {
      console.error(error);
      localStorage.setItem('cache/globalConfig', '{}');
    }
  }
}

export const globalCache = new GlobalCache();
