import { HttpNodeConfig } from '@src/types/httpNode/httpNode';
import { logger } from '@/helper';
import { cacheKey } from '../cacheKey';

class HttpNodeConfigCache {
  constructor() {
    if (!localStorage.getItem(cacheKey.httpNodeCache.config)) {
      localStorage.setItem(cacheKey.httpNodeCache.config, '{}');
    }
  }
  /*
   * 获取HTTP节点配置
   */
  getHttpNodeConfig(projectId: string): HttpNodeConfig | null {
    try {
      const localData: Record<string, HttpNodeConfig> = JSON.parse(localStorage.getItem(cacheKey.httpNodeCache.config) || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      logger.error('获取HTTP节点配置失败', { error });
      localStorage.setItem(cacheKey.httpNodeCache.config, '{}');
      return null;
    }
  }
  /*
   * 设置HTTP节点配置(覆盖/合并)
   */
  setHttpNodeConfig(projectId: string, config: Partial<HttpNodeConfig>) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.httpNodeCache.config) || '{}');
      localData[projectId] = { ...(localData[projectId] || {}), ...config };
      localStorage.setItem(cacheKey.httpNodeCache.config, JSON.stringify(localData));
    } catch (error) {
      logger.error('设置HTTP节点配置失败', { error });
      const data: Record<string, Partial<HttpNodeConfig>> = {};
      data[projectId] = config;
      localStorage.setItem(cacheKey.httpNodeCache.config, JSON.stringify(data));
    }
  }
}

export const httpNodeConfigCache = new HttpNodeConfigCache();
