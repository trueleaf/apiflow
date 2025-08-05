/**
 * apidoc文档缓存
 */

import { ApidocProjectHost } from '@src/types/apidoc/base-info';
import { ApidocDetail } from '@src/types/global';
import { ResponseCache } from './responseCache';
import type { ApidocCookie } from '@src/renderer/store/apidoc/cookies';

type ServerInfo = ApidocProjectHost & {
  isLocal?: boolean,
};

class ApidocCache extends ResponseCache {
  constructor() {
    super();
    if (!localStorage.getItem('apidoc/paramsConfig')) {
      localStorage.setItem('apidoc/paramsConfig', '{}');
    }
    if (!localStorage.getItem('apidoc/apidoc')) {
      localStorage.setItem('apidoc/apidoc', '{}');
    }
    this.initApiflowResponseCache();
  }

  /**
   * 获取当前被选中的tab
   */
  getActiveParamsTab(id: string): string | null {
    try {
      const localActiveTab: Record<string, string> = JSON.parse(localStorage.getItem('apidoc/paramsActiveTab') || '{}');
      if (!localActiveTab[id]) {
        return null;
      }
      return localActiveTab[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/paramsActiveTab', '{}')
      return null;
    }
  }
  /**
   * 设置当前被选中的tab
   */
  setActiveParamsTab(id: string, val: string) {
    try {
      const localActiveTab = JSON.parse(localStorage.getItem('apidoc/paramsActiveTab') || '{}');
      localActiveTab[id] = val;
      localStorage.setItem('apidoc/paramsActiveTab', JSON.stringify(localActiveTab));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[id] = val;
      localStorage.setItem('apidoc/paramsActiveTab', JSON.stringify(data));
    }
  }
  /*
   * 缓存接口信息
   */
  setApidoc(val: ApidocDetail) {
    try {
      const localApidoc = JSON.parse(localStorage.getItem('apidoc/apidoc') || '{}');
      localApidoc[val._id] = val;
      localStorage.setItem('apidoc/apidoc', JSON.stringify(localApidoc));
    } catch (error) {
      console.error(error);
      const data: Record<string, ApidocDetail> = {};
      data[val._id] = val;
      localStorage.setItem('apidoc/apidoc', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存接口信息
   */
  getApidoc(id: string): ApidocDetail | null {
    try {
      const localApidoc: Record<string, ApidocDetail> = JSON.parse(localStorage.getItem('apidoc/apidoc') || '{}');
      if (!localApidoc[id]) {
        return null;
      }
      return localApidoc[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/apidoc', '{}')
      return null;
    }
  }

  /*
   * 缓存服务器地址
   */
  addApidocServer(serverInfo: ServerInfo, projectId: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/apidocServer') || '{}');
      if (!localData[projectId]) {
        localData[projectId] = [];
      }
      // if (localData[projectId].find((v: ServerInfo) => v.url === serverInfo.url)) {
      //     return
      // }
      localData[projectId].push(serverInfo);
      localStorage.setItem('apidoc/apidocServer', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, ServerInfo[]> = {};
      data[projectId] = [serverInfo];
      localStorage.setItem('apidoc/apidocServer', JSON.stringify(data));
    }
  }

  /*
   * 删除缓存服务器地址
   */
  deleteApidocServer(host: string, projectId: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/apidocServer') || '{}');
      if (!localData[projectId]) {
        localData[projectId] = [];
      }
      const delIndex = localData[projectId].findIndex((v: ServerInfo) => v.url === host);
      if (delIndex !== -1) {
        localData[projectId].splice(delIndex, 1);
      }
      localStorage.setItem('apidoc/apidocServer', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, ServerInfo[]> = {};
      data[projectId] = [];
      localStorage.setItem('apidoc/apidocServer', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存服务器地址
   */
  getApidocServer(projectId: string): ServerInfo[] | [] {
    try {
      const localData: Record<string, ServerInfo[]> = JSON.parse(localStorage.getItem('apidoc/apidocServer') || '{}');
      if (!localData[projectId]) {
        return [];
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/apidocServer', '{}')
      return [];
    }
  }

  /*
   * 获取是否开启代理缓存
   */
  getApidocProxyState(projectId: string): boolean | null {
    try {
      const localData: Record<string, boolean> = JSON.parse(localStorage.getItem('apidoc/apidocCacheState') || '{}');
      if (localData[projectId] == null) {
        return null;
      }
      return localData[projectId] === true;
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/apidocCacheState', '{}')
      return false;
    }
  }

  /*
   * 设置是否开启代理服务器
   */
  setApidocProxyState(cacheState: boolean, projectId: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/apidocCacheState') || '{}');
      localData[projectId] = cacheState;
      localStorage.setItem('apidoc/apidocCacheState', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/apidocCacheState', '{}');
    }
  }

  /*
   * 缓存上一次选择的server
   */
  setPreviousServer(projectId: string, server: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/previousServer') || '{}');
      localData[projectId] = server;
      localStorage.setItem('apidoc/previousServer', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/previousServer', '{}');
    }
  }

  /*
   * 获取上一次选择的server
   */
  getPreviousServer(projectId: string): string | null {
    try {
      const localData: Record<string, string> = JSON.parse(localStorage.getItem('apidoc/previousServer') || '{}');
      if (localData[projectId] == null) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/previousServer', '{}')
      return null;
    }
  }

  /*
   * 获取返回参数状态
   */
  getAllResponseCollapseState(): Record<string, boolean> {
    try {
      const localData: Record<string, boolean> = JSON.parse(localStorage.getItem('apidoc/responseCollapse') || '{}');
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
      const localData = JSON.parse(localStorage.getItem('apidoc/responseCollapse') || '{}');
      localData[id] = isShow;
      localStorage.setItem('apidoc/responseCollapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/responseCollapse', '{}');
    }
  }

  /*
   * 获取缓存的代码钩子
   */
  getHookCodeById(projectId: string): string | null {
    try {
      const localData: Record<string, string> = JSON.parse(localStorage.getItem('apidoc/hookCode') || '{}');
      if (localData[projectId] == null) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /*
   * 设置缓存的代码钩子
   */
  setHookCode(projectId: string, code: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/hookCode') || '{}');
      localData[projectId] = code;
      localStorage.setItem('apidoc/hookCode', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/hookCode', '{}');
    }
  }

  /*
   * 隐藏body参数提示信息
   */
  hideJsonBodyTip() {
    try {
      localStorage.setItem('apidoc/hideJsonBodyTip', JSON.stringify(true));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/hideJsonBodyTip', 'false');
    }
  }

  /*
   * 获取是否显示body提示
   */
  getCouldShowJsonBodyTip(): boolean {
    try {
      const isHidden = JSON.parse(localStorage.getItem('apidoc/hideJsonBodyTip') || 'false');
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
      const localData: Record<string, Record<string, unknown>> = JSON.parse(localStorage.getItem('apidoc/worker/localState') || '{}');
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
      const localData = JSON.parse(localStorage.getItem('apidoc/worker/localState') || '{}');
      localData[projectId] = state;
      localStorage.setItem('apidoc/worker/localState', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/worker/localState', '{}');
    }
  }

  /*
   * 获取mock编辑 json返回数据提示信息
   */
  getIsShowApidocMockParamsJsonTip(): boolean {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/mock/isShowJsonTip') || 'true');
      return localData;
    } catch (error) {
      console.error(error);
      return true
    }
  }

  /*
   * 设置 json返回数据提示信息
   */
  setIsShowApidocMockParamsJsonTip(isShow: boolean) {
    try {
      localStorage.setItem('apidoc/mock/isShowJsonTip', JSON.stringify(isShow));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/mock/isShowJsonTip', 'true');
    }
  }

  /*
   * 根据tabId获取不发送公共请求头
   */
  getIgnoredCommonHeaderByTabId(projectId: string, tabId: string): string[] | null {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
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
  setIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }) {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem('apidoc/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        localData[projectId] = {}
      }
      if (localData[projectId][tabId] == null) {
        localData[projectId][tabId] = []
      }
      const matchedTab = localData[projectId][tabId];
      matchedTab.push(ignoreHeaderId);
      localStorage.setItem('apidoc/commonHeaders/ignore', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/commonHeaders/ignore', '{}');
    }
  }
  /*
   * 删除不发送的公共请求头
   */
  removeIgnoredCommonHeader(options: { projectId: string; tabId: string; ignoreHeaderId: string }) {
    try {
      const { projectId, tabId, ignoreHeaderId } = options;
      const localData = JSON.parse(localStorage.getItem('apidoc/commonHeaders/ignore') || '{}') as Record<string, Record<string, string[]>>;
      if (localData[projectId] == null) {
        return false;
      }
      if (localData[projectId][tabId] == null) {
        return false;
      }
      const matchedTab = localData[projectId][tabId];
      const deleteIndex = matchedTab.findIndex(id => ignoreHeaderId === id);
      matchedTab.splice(deleteIndex, 1)
      localStorage.setItem('apidoc/commonHeaders/ignore', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/commonHeaders/ignore', '{}');
    }
  }
  /*
   * 项目列表和团队列表切换缓存
   */
  getActiveApidocTab(): string {
    try {
      const localData = localStorage.getItem('apidoc/activeApidocTab') || 'projectList';
      return localData;
    } catch (error) {
      console.error(error);
      return 'projectList'
    }
  }

  setActiveApidocTab(activeTab: string) {
    try {
      localStorage.setItem('apidoc/activeApidocTab', activeTab);
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/activeApidocTab', 'projectList');
     }
  }

  /*
   * 缓存cookie（ApidocCookie[]）
   */
  setApidocCookies(projectId: string, cookies: ApidocCookie[]) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/cookies') || '{}');
      localData[projectId] = cookies;
      localStorage.setItem('apidoc/cookies', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, ApidocCookie[]> = {};
      data[projectId] = cookies;
      localStorage.setItem('apidoc/cookies', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存cookie（ApidocCookie[]）
   */
  getApidocCookies(projectId: string): ApidocCookie[] {
    try {
      const localData: Record<string, ApidocCookie[]> = JSON.parse(localStorage.getItem('apidoc/cookies') || '{}');
      if (!localData[projectId]) {
        return [];
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/cookies', '{}');
      return [];
    }
  }

  /*
   * 获取pre-request的sessionStorage
   */
  getPreRequestSessionStorage(projectId: string): Record<string, unknown> | null {
    try {
      const localData: Record<string, Record<string, unknown>> = JSON.parse(sessionStorage.getItem('apidoc/preRequest/sessionStorage') || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      sessionStorage.setItem('apidoc/preRequest/sessionStorage', '{}');
      return null;
    }
  }
  /*
   * 设置pre-request的sessionStorage
   */
  setPreRequestSessionStorage(projectId: string, data: Record<string, unknown>) {
    try {
      const localData = JSON.parse(sessionStorage.getItem('apidoc/preRequest/sessionStorage') || '{}');
      localData[projectId] = data;
      sessionStorage.setItem('apidoc/preRequest/sessionStorage', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const newData: Record<string, Record<string, unknown>> = {};
      newData[projectId] = data;
      sessionStorage.setItem('apidoc/preRequest/sessionStorage', JSON.stringify(newData));
    }
  }

  /*
   * 获取pre-request的localStorage
   */
  getPreRequestLocalStorage(projectId: string): Record<string, any> | null {
    try {
      const localData: Record<string, Record<string, any>> = JSON.parse(localStorage.getItem('apidoc/preRequest/localStorage') || '{}');
      if (!localData[projectId]) {
        return null;
      }
      return localData[projectId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/preRequest/localStorage', '{}');
      return null;
    }
  }

  /*
   * 设置pre-request的localStorage
   */
  setPreRequestLocalStorage(projectId: string, data: Record<string, any>) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/preRequest/localStorage') || '{}');
      localData[projectId] = data;
      localStorage.setItem('apidoc/preRequest/localStorage', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const newData: Record<string, Record<string, any>> = {};
      newData[projectId] = data;
      localStorage.setItem('apidoc/preRequest/localStorage', JSON.stringify(newData));
    }
  }
  /*
   * 缓存分享密码
   */
  setSharePassword(shareId: string, password: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/share/password') || '{}');
      localData[shareId] = password;
      localStorage.setItem('apidoc/share/password', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[shareId] = password;
      localStorage.setItem('apidoc/share/password', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存的分享密码
   */
  getSharePassword(shareId: string): string | null {
    try {
      const localData: Record<string, string> = JSON.parse(localStorage.getItem('apidoc/share/password') || '{}');
      if (!localData[shareId]) {
        return null;
      }
      return localData[shareId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/share/password', '{}');
      return null;
    }
  }

  /*
   * 清除分享密码缓存
   */
  clearSharePassword(shareId: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/share/password') || '{}');
      delete localData[shareId];
      localStorage.setItem('apidoc/share/password', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/share/password', '{}');
    }
  }

  /*
   * 设置分享文档参数块折叠状态
   */
  setShareCollapseState(tabId: string, blockStates: Record<string, boolean>) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/share/collapse') || '{}');
      localData[tabId] = blockStates;
      localStorage.setItem('apidoc/share/collapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<string, boolean>> = {};
      data[tabId] = blockStates;
      localStorage.setItem('apidoc/share/collapse', JSON.stringify(data));
    }
  }

  /*
   * 获取分享文档参数块折叠状态
   */
  getShareCollapseState(tabId: string): Record<string, boolean> | null {
    try {
      const localData: Record<string, Record<string, boolean>> = JSON.parse(localStorage.getItem('apidoc/share/collapse') || '{}');
      if (!localData[tabId]) {
        return null;
      }
      return localData[tabId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/share/collapse', '{}');
      return null;
    }
  }

  /*
   * 更新单个分享文档参数块折叠状态
   */
  updateShareBlockCollapseState(tabId: string, blockName: string, isExpanded: boolean) {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/share/collapse') || '{}');
      if (!localData[tabId]) {
        localData[tabId] = {};
      }
      localData[tabId][blockName] = isExpanded;
      localStorage.setItem('apidoc/share/collapse', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, Record<string, boolean>> = {};
      data[tabId] = { [blockName]: isExpanded };
      localStorage.setItem('apidoc/share/collapse', JSON.stringify(data));
    }
  }

  /*
   * 获取编辑tabs
   */
  getEditTabs(): Record<string, any[]> {
    try {
      const localData = JSON.parse(localStorage.getItem('apidoc/tabs') || '{}');
      return localData;
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/tabs', '{}');
      return {};
    }
  }

  /*
   * 设置编辑tabs
   */
  setEditTabs(tabs: Record<string, any[]>) {
    try {
      localStorage.setItem('apidoc/tabs', JSON.stringify(tabs));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/tabs', '{}');
    }
  }

  /*
   * header tabs 缓存
   */
  setHeaderTabs(tabs: { id: string; title: string; type: 'project' | 'settings' }[]) {
    try {
      localStorage.setItem('apidoc/header/tabs', JSON.stringify(tabs));
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/header/tabs', '[]');
    }
  }

  getHeaderTabs(): { id: string; title: string; type: 'project' | 'settings' }[] {
    try {
      return JSON.parse(localStorage.getItem('apidoc/header/tabs') || '[]');
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/header/tabs', '[]');
      return [];
    }
  }

  setHeaderActiveTab(tabId: string) {
    try {
      localStorage.setItem('apidoc/header/activeTab', tabId);
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/header/activeTab', '');
    }
  }

  getHeaderActiveTab(): string {
    try {
      return localStorage.getItem('apidoc/header/activeTab') || '';
    } catch (error) {
      console.error(error);
      localStorage.setItem('apidoc/header/activeTab', '');
      return '';
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
      localStorage.setItem('apidoc/cache/info', JSON.stringify(cacheData));
    } catch (error) {
      console.error('设置缓存信息失败:', error);
    }
  }

  /**
   * 获取缓存信息
   */
  getCacheInfo(): { indexedDBSize: number; indexedDBDetails: unknown[] } | null {
    try {
      const cacheData = localStorage.getItem('apidoc/cache/info');
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
      localStorage.removeItem('apidoc/cache/info');
    } catch (error) {
      console.error('清除缓存信息失败:', error);
    }
  }


}

export const apidocCache = new ApidocCache();
