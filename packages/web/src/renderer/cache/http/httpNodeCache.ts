/**
 * apidoc文档缓存
 */

import { HttpNode } from '@src/types';
import type { ApidocCookie } from '@src/renderer/store/apidoc/cookies';

class HttpNodeCache {
  constructor() {
  }

  /**
   * 获取当前被选中的tab
   */
  getActiveParamsTab(id: string): string | null {
    try {
      const localActiveTab: Record<string, string> = JSON.parse(localStorage.getItem('httpNode/paramsActiveTab') || '{}');
      if (!localActiveTab[id]) {
        return null;
      }
      return localActiveTab[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/paramsActiveTab', '{}')
      return null;
    }
  }
  /**
   * 设置当前被选中的tab
   */
  setActiveParamsTab(id: string, val: string) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem('httpNode/paramsActiveTab') || '{}');
      localActiveTab[id] = val;
      localStorage.setItem('httpNode/paramsActiveTab', JSON.stringify(localActiveTab));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[id] = val;
      localStorage.setItem('httpNode/paramsActiveTab', JSON.stringify(data));
    }
  }
  /*
   * 缓存接口信息
   */
  setApidoc(val: HttpNode) {
    try {
      const localApidoc = JSON.parse(localStorage.getItem('httpNode/apidoc') || '{}');
      localApidoc[val._id] = val;
      localStorage.setItem('httpNode/apidoc', JSON.stringify(localApidoc));
    } catch (error) {
      console.error(error);
      const data: Record<string, HttpNode> = {};
      data[val._id] = val;
      localStorage.setItem('httpNode/apidoc', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存接口信息
   */
  getApidoc(id: string): HttpNode | null {
    try {
      const localApidoc: Record<string, HttpNode> = JSON.parse(localStorage.getItem('httpNode/apidoc') || '{}');
      if (!localApidoc[id]) {
        return null;
      }
      return localApidoc[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/apidoc', '{}')
      return null;
    }
  }

  /*
   * 获取返回参数状态
   */
  getAllResponseCollapseState(): Record<string, boolean> {
    try {
      const localData: Record<string, boolean> = JSON.parse(localStorage.getItem('httpNode/responseCollapse') || '{}');
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
      const localData = JSON.parse(localStorage.getItem('httpNode/responseCollapse') || '{}');
      localData[id] = isShow;
      localStorage.setItem('httpNode/responseCollapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/responseCollapse', '{}');
    }
  }

  /*
   * 隐藏body参数提示信息
   */
  hideJsonBodyTip() {
    try {
      localStorage.setItem('httpNode/hideJsonBodyTip', JSON.stringify(true));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/hideJsonBodyTip', 'false');
    }
  }

  /*
   * 获取是否显示body提示
   */
  getCouldShowJsonBodyTip(): boolean {
    try {
      const isHidden = JSON.parse(localStorage.getItem('httpNode/hideJsonBodyTip') || 'false');
      return !isHidden;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /*
   * 获取worker全局local状态
   */
  getApidocWorkerLocalStateById(projectId: string): null | Record<string, unknown> {
    try {
      const localData: Record<string, Record<string, unknown>> = JSON.parse(localStorage.getItem('httpNode/worker/localState') || '{}');
      if (localData[projectId] == null) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      return null
    }
  }

  /*
   * 设置worker全局local状态
   */
  setApidocWorkerLocalState(projectId: string, state: Record<string, unknown>) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNode/worker/localState') || '{}');
      localData[projectId] = state;
      localStorage.setItem('httpNode/worker/localState', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/worker/localState', '{}');
    }
  }

  /*
   * 根据tabId获取不发送公共请求头
   */
  getWsIgnoredCommonHeaderByTabId(projectId: string, tabId: string): string[] | null {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNode/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
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
      const localData = JSON.parse(localStorage.getItem('httpNode/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        localData[projectId] = {}
      }
      if (localData[projectId][tabId] == null) {
        localData[projectId][tabId] = []
      }
      const matchedTab = localData[projectId][tabId];
      matchedTab.push(ignoreHeaderId);
      localStorage.setItem('httpNode/commonHeaders/ignore', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/commonHeaders/ignore', '{}');
    }
  }
  /*
   * 删除不发送的公共请求头
   */
  removeIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }) {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem('httpNode/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        return false;
      }
      if (localData[projectId][tabId] == null) {
        return false;
      }
      const matchedTab = localData[projectId][tabId];
      const deleteIndex = matchedTab.findIndex(id => ignoreHeaderId === id);
      matchedTab.splice(deleteIndex, 1)
      localStorage.setItem('httpNode/commonHeaders/ignore', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/commonHeaders/ignore', '{}');
    }
  }

  /*
   * 缓存cookie（ApidocCookie[]）
   */
  setApidocCookies(projectId: string, cookies: ApidocCookie[]) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNode/cookies') || '{}');
      localData[projectId] = cookies;
      localStorage.setItem('httpNode/cookies', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, ApidocCookie[]> = {};
      data[projectId] = cookies;
      localStorage.setItem('httpNode/cookies', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存cookie（ApidocCookie[]）
   */
  getApidocCookies(projectId: string): ApidocCookie[] {
    try {
      const localData: Record<string, ApidocCookie[]> = JSON.parse(localStorage.getItem('httpNode/cookies') || '{}');
      if (!localData[projectId]) {
        return [];
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/cookies', '{}');
      return [];
    }
  }

  /*
   * 获取pre-request的sessionStorage
   */
  getPreRequestSessionStorage(projectId: string): Record<string, unknown> | null {
    try {
      const localData: Record<string, Record<string, unknown>> = JSON.parse(sessionStorage.getItem('httpNode/preRequest/sessionStorage') || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      sessionStorage.setItem('httpNode/preRequest/sessionStorage', '{}');
      return null;
    }
  }
  /*
   * 设置pre-request的sessionStorage
   */
  setPreRequestSessionStorage(projectId: string, data: Record<string, unknown>) {
    try {
      const localData = JSON.parse(sessionStorage.getItem('httpNode/preRequest/sessionStorage') || '{}');
      localData[projectId] = data;
      sessionStorage.setItem('httpNode/preRequest/sessionStorage', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const newData: Record<string, Record<string, unknown>> = {};
      newData[projectId] = data;
      sessionStorage.setItem('httpNode/preRequest/sessionStorage', JSON.stringify(newData));
    }
  }

  /*
   * 获取pre-request的localStorage
   */
  getPreRequestLocalStorage(projectId: string): Record<string, any> | null {
    try {
      const localData: Record<string, Record<string, any>> = JSON.parse(localStorage.getItem('httpNode/preRequest/localStorage') || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/preRequest/localStorage', '{}');
      return null;
    }
  }

  /*
   * 设置pre-request的localStorage
   */
  setPreRequestLocalStorage(projectId: string, data: Record<string, any>) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNode/preRequest/localStorage') || '{}');
      localData[projectId] = data;
      localStorage.setItem('httpNode/preRequest/localStorage', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const newData: Record<string, Record<string, any>> = {};
      newData[projectId] = data;
      localStorage.setItem('httpNode/preRequest/localStorage', JSON.stringify(newData));
    }
  }
  /*
   * 缓存分享密码
   */
  setSharePassword(shareId: string, password: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNode/share/password') || '{}');
      localData[shareId] = password;
      localStorage.setItem('httpNode/share/password', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[shareId] = password;
      localStorage.setItem('httpNode/share/password', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存的分享密码
   */
  getSharePassword(shareId: string): string | null {
    try {
      const localData: Record<string, string> = JSON.parse(localStorage.getItem('httpNode/share/password') || '{}');
      if (!localData[shareId]) {
        return null;
      }
      return localData[shareId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/share/password', '{}');
      return null;
    }
  }

  /*
   * 清除分享密码缓存
   */
  clearSharePassword(shareId: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNode/share/password') || '{}');
      delete localData[shareId];
      localStorage.setItem('httpNode/share/password', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/share/password', '{}');
    }
  }

  /*
   * 设置分享文档参数块折叠状态
   */
  setShareCollapseState(tabId: string, blockStates: Record<string, boolean>) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNode/share/collapse') || '{}');
      localData[tabId] = blockStates;
      localStorage.setItem('httpNode/share/collapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<string, boolean>> = {};
      data[tabId] = blockStates;
      localStorage.setItem('httpNode/share/collapse', JSON.stringify(data));
    }
  }

  /*
   * 获取分享文档参数块折叠状态
   */
  getShareCollapseState(tabId: string): Record<string, boolean> | null {
    try {
      const localData: Record<string, Record<string, boolean>> = JSON.parse(localStorage.getItem('httpNode/share/collapse') || '{}');
      if (!localData[tabId]) {
        return null;
      }
      return localData[tabId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/share/collapse', '{}');
      return null;
    }
  }

  /*
   * 更新单个分享文档参数块折叠状态
   */
  updateShareBlockCollapseState(tabId: string, blockName: string, isExpanded: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem('httpNode/share/collapse') || '{}');
      if (!localData[tabId]) {
        localData[tabId] = {};
      }
      localData[tabId][blockName] = isExpanded;
      localStorage.setItem('httpNode/share/collapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<string, boolean>> = {};
      data[tabId] = { [blockName]: isExpanded };
      localStorage.setItem('httpNode/share/collapse', JSON.stringify(data));
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 本地数据管理相关方法
  |--------------------------------------------------------------------------
  */

  /*
   * 获取当前活跃的本地数据管理菜单
   */
  getActiveLocalDataMenu(): string {
    try {
      const activeMenu = localStorage.getItem('httpNode/localData/activeMenu') || 'localStorage';
      return activeMenu;
    } catch (error) {
      console.error(error);
      return 'localStorage'
    }
  }

  /*
   * 设置当前活跃的本地数据管理菜单
   */
  setActiveLocalDataMenu(activeMenu: string) {
    try {
      localStorage.setItem('httpNode/localData/activeMenu', activeMenu);
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpNode/localData/activeMenu', 'localStorage');
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 缓存管理相关方法
  |--------------------------------------------------------------------------
  */

  /**
   * 设置缓存信息
   */
  setCacheInfo(cacheInfo: { indexedDBSize: number; indexedDBDetails: unknown[] }) {
    try {
      const cacheData = {
        indexedDBSize: cacheInfo.indexedDBSize,
        indexedDBDetails: cacheInfo.indexedDBDetails,
        timestamp: Date.now()
      };
      localStorage.setItem('httpNode/cache/info', JSON.stringify(cacheData));
    } catch (error) {
      console.error('设置缓存信息失败:', error);
    }
  }

  /**
   * 获取缓存信息
   */
  getCacheInfo(): { indexedDBSize: number; indexedDBDetails: unknown[] } | null {
    try {
      const cacheData = localStorage.getItem('httpNode/cache/info');
      if (!cacheData) {
        return null;
      }
      const parsedData = JSON.parse(cacheData);
      return {
        indexedDBSize: parsedData.indexedDBSize || -1,
        indexedDBDetails: parsedData.indexedDBDetails || []
      };
    } catch (error) {
      console.error('获取缓存信息失败:', error);
      return null;
    }
  }

  /**
   * 清除缓存信息
   */
  clearCacheInfo() {
    try {
      localStorage.removeItem('httpNode/cache/info');
    } catch (error) {
      console.error('清除缓存信息失败:', error);
    }
  }

  /**
   * 设置选中的缓存卡片类型
   */
  setSelectedCacheType(cacheType: 'localStorage' | 'indexedDB' | 'backup' | 'restore') {
    try {
      localStorage.setItem('httpNode/cache/selectedType', cacheType);
    } catch (error) {
      console.error('设置选中缓存类型失败:', error);
      localStorage.setItem('httpNode/cache/selectedType', 'localStorage');
    }
  }

  /**
   * 获取选中的缓存卡片类型
   */
  getSelectedCacheType(): 'localStorage' | 'indexedDB' | 'backup' | 'restore' {
    try {
      const cacheType = localStorage.getItem('httpNode/cache/selectedType') as 'localStorage' | 'indexedDB' | 'backup' | 'restore';
      return cacheType || 'localStorage';
    } catch (error) {
      console.error('获取选中缓存类型失败:', error);
      return 'localStorage';
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
      const localCookies = localStorage.getItem('httpNode/globalCookies') || '{}';
      return JSON.parse(localCookies);
    } catch (error) {
      console.error('获取全局cookies失败:', error);
      localStorage.setItem('httpNode/globalCookies', '{}');
      return {};
    }
  }

  /**
   * 设置全局cookies
   */
  setGlobalCookies(cookies: Record<string, ApidocCookie[]>) {
    try {
      localStorage.setItem('httpNode/globalCookies', JSON.stringify(cookies));
    } catch (error) {
      console.error('设置全局cookies失败:', error);
    }
  }

  /**
   * 获取布局方式
   */
  getLayout(): 'horizontal' | 'vertical' {
    try {
      const localLayout = localStorage.getItem('httpNode/layout');
      if (localLayout !== 'horizontal' && localLayout !== 'vertical') {
        return 'horizontal';
      }
      return localLayout as 'horizontal' | 'vertical';
    } catch (error) {
      console.error('获取布局方式失败:', error);
      return 'horizontal';
    }
  }

  /**
   * 设置布局方式
   */
  setLayout(layout: 'horizontal' | 'vertical') {
    try {
      localStorage.setItem('httpNode/layout', layout);
    } catch (error) {
      console.error('设置布局方式失败:', error);
    }
  }

}

export const httpNodeCache = new HttpNodeCache();

