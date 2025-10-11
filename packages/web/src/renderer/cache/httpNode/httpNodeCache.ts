/**
 * HTTP节点缓存
 */

import { HttpNode } from '@src/types';
import type { ApidocCookie } from '@src/renderer/store/apidoc/cookies';

class HttpNodeCache {
  constructor() {
  }

  /*
   * 缓存HTTP节点信息
   */
  setHttpNode(val: HttpNode) {
    try {
      const localHttpNode = JSON.parse(localStorage.getItem('httpNodeCache/httpNode') || '{}');
      localHttpNode[val._id] = val;
      localStorage.setItem('httpNodeCache/httpNode', JSON.stringify(localHttpNode));
    } catch (error) {
      console.error(error);
      const data: Record<string, HttpNode> = {};
      data[val._id] = val;
      localStorage.setItem('httpNodeCache/httpNode', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存HTTP节点信息
   */
  getHttpNode(id: string): HttpNode | null {
    try {
      const localHttpNode: Record<string, HttpNode> = JSON.parse(localStorage.getItem('httpNodeCache/httpNode') || '{}');
      if (!localHttpNode[id]) {
        return null;
      }
      return localHttpNode[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNodeCache/httpNode', '{}')
      return null;
    }
  }

  /*
   * 获取返回参数状态
   */
  getResponseCollapseState(): Record<string, boolean> {
    try {
      const localData: Record<string, boolean> = JSON.parse(localStorage.getItem('httpNodeCache/responseCollapse') || '{}');
      return localData;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  /*
   * 设置返回参数状态
   */
  setResponseCollapseState(id: string, isShow: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNodeCache/responseCollapse') || '{}');
      localData[id] = isShow;
      localStorage.setItem('httpNodeCache/responseCollapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNodeCache/responseCollapse', '{}');
    }
  }

  /*
   * 隐藏body参数提示信息
   */
  hideJsonBodyTip() {
    try {
      localStorage.setItem('httpNodeCache/hideJsonBodyTip', JSON.stringify(true));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNodeCache/hideJsonBodyTip', 'false');
    }
  }

  /*
   * 获取是否显示body提示
   */
  getCouldShowJsonBodyTip(): boolean {
    try {
      const isHidden = JSON.parse(localStorage.getItem('httpNodeCache/hideJsonBodyTip') || 'false');
      return !isHidden;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /*
   * 根据tabId获取不发送公共请求头
   */
  getWsIgnoredCommonHeaderByTabId(projectId: string, tabId: string): string[] | null {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNodeCache/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        return [];
      }
      if (localData[projectId][tabId] == null) {
        return [];
      }
      return localData[projectId][tabId];
    } catch (error) {
      console.error(error);
      return []
    }
  }

  /*
   * 设置不发送的公共请求头
   */
  setWsIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }) {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem('httpNodeCache/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        localData[projectId] = {}
      }
      if (localData[projectId][tabId] == null) {
        localData[projectId][tabId] = []
      }
      const matchedTab = localData[projectId][tabId];
      matchedTab.push(ignoreHeaderId);
      localStorage.setItem('httpNodeCache/commonHeaders/ignore', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNodeCache/commonHeaders/ignore', '{}');
    }
  }
  /*
   * 删除不发送的公共请求头
   */
  removeIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }) {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem('httpNodeCache/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        return false;
      }
      if (localData[projectId][tabId] == null) {
        return false;
      }
      const matchedTab = localData[projectId][tabId];
      const deleteIndex = matchedTab.findIndex(id => ignoreHeaderId === id);
      matchedTab.splice(deleteIndex, 1)
      localStorage.setItem('httpNodeCache/commonHeaders/ignore', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNodeCache/commonHeaders/ignore', '{}');
    }
  }

  /*
   * 缓存cookie（ApidocCookie[]）
   */
  setHttpNodeCookies(projectId: string, cookies: ApidocCookie[]) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNodeCache/cookies') || '{}');
      localData[projectId] = cookies;
      localStorage.setItem('httpNodeCache/cookies', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, ApidocCookie[]> = {};
      data[projectId] = cookies;
      localStorage.setItem('httpNodeCache/cookies', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存cookie（ApidocCookie[]）
   */
  getHttpNodeCookies(projectId: string): ApidocCookie[] {
    try {
      const localData: Record<string, ApidocCookie[]> = JSON.parse(localStorage.getItem('httpNodeCache/cookies') || '{}');
      if (!localData[projectId]) {
        return [];
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNodeCache/cookies', '{}');
      return [];
    }
  }

  /*
   * 获取pre-request的sessionStorage
   */
  getPreRequestSessionStorage(projectId: string): Record<string, unknown> | null {
    try {
      const localData: Record<string, Record<string, unknown>> = JSON.parse(sessionStorage.getItem('httpNodeCache/preRequest/sessionStorage') || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      sessionStorage.setItem('httpNodeCache/preRequest/sessionStorage', '{}');
      return null;
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
      console.error(error);
      const newData: Record<string, Record<string, unknown>> = {};
      newData[projectId] = data;
      sessionStorage.setItem('httpNodeCache/preRequest/sessionStorage', JSON.stringify(newData));
    }
  }

  /*
   * 获取pre-request的localStorage
   */
  getPreRequestLocalStorage(projectId: string): Record<string, any> | null {
    try {
      const localData: Record<string, Record<string, any>> = JSON.parse(localStorage.getItem('httpNodeCache/preRequest/localStorage') || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNodeCache/preRequest/localStorage', '{}');
      return null;
    }
  }

  /*
   * 设置pre-request的localStorage
   */
  setPreRequestLocalStorage(projectId: string, data: Record<string, any>) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNodeCache/preRequest/localStorage') || '{}');
      localData[projectId] = data;
      localStorage.setItem('httpNodeCache/preRequest/localStorage', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const newData: Record<string, Record<string, any>> = {};
      newData[projectId] = data;
      localStorage.setItem('httpNodeCache/preRequest/localStorage', JSON.stringify(newData));
    }
  }
  /*
   * 缓存分享密码
   */
  setSharePassword(shareId: string, password: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNodeCache/share/password') || '{}');
      localData[shareId] = password;
      localStorage.setItem('httpNodeCache/share/password', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[shareId] = password;
      localStorage.setItem('httpNodeCache/share/password', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存的分享密码
   */
  getSharePassword(shareId: string): string | null {
    try {
      const localData: Record<string, string> = JSON.parse(localStorage.getItem('httpNodeCache/share/password') || '{}');
      if (!localData[shareId]) {
        return null;
      }
      return localData[shareId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNodeCache/share/password', '{}');
      return null;
    }
  }

  /*
   * 清除分享密码缓存
   */
  clearSharePassword(shareId: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNodeCache/share/password') || '{}');
      delete localData[shareId];
      localStorage.setItem('httpNodeCache/share/password', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNodeCache/share/password', '{}');
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 全局设置相关方法
  |--------------------------------------------------------------------------
  */

  /**
   * 获取全局cookies
   */
  getGlobalCookies(): Record<string, ApidocCookie[]> {
    try {
      const localCookies = localStorage.getItem('httpNodeCache/globalCookies') || '{}';
      return JSON.parse(localCookies);
    } catch (error) {
      console.error('获取全局cookies失败:', error);
      localStorage.setItem('httpNodeCache/globalCookies', '{}');
      return {};
    }
  }

  /**
   * 设置全局cookies
   */
  setGlobalCookies(cookies: Record<string, ApidocCookie[]>) {
    try {
      localStorage.setItem('httpNodeCache/globalCookies', JSON.stringify(cookies));
    } catch (error) {
      console.error('设置全局cookies失败:', error);
    }
  }

}

export const httpNodeCache = new HttpNodeCache();

