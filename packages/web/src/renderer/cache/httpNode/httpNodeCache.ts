import { HttpNode } from '@src/types';
import type { ApidocCookie } from '@src/renderer/store/apidoc/cookiesStore';
import { logger } from '@/helper';
import { cacheKey } from '../cacheKey';

class HttpNodeCache {
  /*
   * 缓存HTTP节点信息
   */
  setHttpNode(val: HttpNode) {
    try {
      const localHttpNode = JSON.parse(localStorage.getItem(cacheKey.httpNodeCache.httpNode) || '{}');
      localHttpNode[val._id] = val;
      localStorage.setItem(cacheKey.httpNodeCache.httpNode, JSON.stringify(localHttpNode));
    } catch (error) {
      logger.error('缓存HTTP节点失败', { error });
      const data: Record<string, HttpNode> = {};
      data[val._id] = val;
      localStorage.setItem(cacheKey.httpNodeCache.httpNode, JSON.stringify(data));
    }
  }

  /*
   * 获取缓存HTTP节点信息
   */
  getHttpNode(id: string): HttpNode | null {
    try {
      const localHttpNode: Record<string, HttpNode> = JSON.parse(localStorage.getItem(cacheKey.httpNodeCache.httpNode) || '{}');
      if (!localHttpNode[id]) {
        return null;
      }
      return localHttpNode[id];
    } catch (error) {
      logger.error('获取HTTP节点失败', { error });
      localStorage.setItem(cacheKey.httpNodeCache.httpNode, '{}')
      return null;
    }
  }
  /*
   * 缓存cookie（ApidocCookie[]）
   */
  setHttpNodeCookies(projectId: string, cookies: ApidocCookie[]) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.httpNodeCache.cookies) || '{}');
      localData[projectId] = cookies;
      localStorage.setItem(cacheKey.httpNodeCache.cookies, JSON.stringify(localData));
    } catch (error) {
      logger.error('缓存HTTP节点Cookie失败', { error });
      const data: Record<string, ApidocCookie[]> = {};
      data[projectId] = [];
      localStorage.setItem(cacheKey.httpNodeCache.cookies, JSON.stringify(data));
    }
  }

  /*
   * 获取缓存cookie（ApidocCookie[]）
   */
  getHttpNodeCookies(projectId: string): ApidocCookie[] {
    try {
      const localData: Record<string, ApidocCookie[]> = JSON.parse(localStorage.getItem(cacheKey.httpNodeCache.cookies) || '{}');
      if (!localData[projectId]) {
        return [];
      }
      return localData[projectId];
    } catch (error) {
      logger.error('获取HTTP节点Cookie失败', { error });
      localStorage.setItem(cacheKey.httpNodeCache.cookies, '{}');
      return [];
    }
  }

  /*
   * 获取pre-request的sessionStorage
   */
  getPreRequestSessionStorage(projectId: string): Record<string, unknown> {
    try {
      const localData: Record<string, Record<string, unknown>> = JSON.parse(sessionStorage.getItem('httpNodeCache/preRequest/sessionStorage') || '{}');
      if (!localData[projectId]) {
        return {};
      }
      return localData[projectId];
    } catch (error) {
      logger.error('获取preRequest sessionStorage失败', { error });
      sessionStorage.setItem('httpNodeCache/preRequest/sessionStorage', '{}');
      return {};
    }
  }
  /*
   * 设置pre-request的sessionStorage
   */
  setPreRequestSessionStorage(projectId: string, data: Record<string, unknown>) {
    try {
      const localData = JSON.parse(sessionStorage.getItem('httpNodeCache/preRequest/sessionStorage') || '{}');
      localData[projectId] = data;
      sessionStorage.setItem('httpNodeCache/preRequest/sessionStorage', JSON.stringify(localData));
    } catch (error) {
      logger.error('设置preRequest sessionStorage失败', { error });
      const newData: Record<string, Record<string, unknown>> = {};
      newData[projectId] = data;
      sessionStorage.setItem('httpNodeCache/preRequest/sessionStorage', JSON.stringify(newData));
    }
  }

  /*
   * 获取pre-request的localStorage
   */
  getPreRequestLocalStorage(projectId: string): Record<string, unknown> {
    try {
      const localData: Record<string, Record<string, unknown>> = JSON.parse(localStorage.getItem(cacheKey.httpNodeCache.preRequest.localStorage) || '{}');
      if (!localData[projectId]) {
        return {};
      }
      return localData[projectId];
    } catch (error) {
      logger.error('获取preRequest localStorage失败', { error });
      localStorage.setItem(cacheKey.httpNodeCache.preRequest.localStorage, '{}');
      return {};
    }
  }

  /*
   * 设置pre-request的localStorage
   */
  setPreRequestLocalStorage(projectId: string, data: Record<string, unknown>) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.httpNodeCache.preRequest.localStorage) || '{}');
      localData[projectId] = data;
      localStorage.setItem(cacheKey.httpNodeCache.preRequest.localStorage, JSON.stringify(localData));
    } catch (error) {
      logger.error('设置preRequest localStorage失败', { error });
      const newData: Record<string, Record<string, unknown>> = {};
      newData[projectId] = data;
      localStorage.setItem(cacheKey.httpNodeCache.preRequest.localStorage, JSON.stringify(newData));
    }
  }

}

export const httpNodeCache = new HttpNodeCache();

