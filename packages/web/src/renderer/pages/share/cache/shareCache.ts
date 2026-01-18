import type { ApidocTab } from '@src/types/apidoc/tabs';

const sharePasswordCacheKey = 'projectCache/share/password';

// 项目分享密码缓存
export const getProjectSharePassword = (shareId: string): string => {
  try {
    const cacheData = localStorage.getItem(sharePasswordCacheKey);
    if (!cacheData) return '';
    const passwords = JSON.parse(cacheData);
    return passwords[shareId] || '';
  } catch {
    return '';
  }
}
export const setProjectSharePassword = (shareId: string, password: string): void => {
  try {
    const cacheData = localStorage.getItem(sharePasswordCacheKey);
    const passwords = cacheData ? JSON.parse(cacheData) : {};
    passwords[shareId] = password;
    localStorage.setItem(sharePasswordCacheKey, JSON.stringify(passwords));
  } catch {
    // ignore
  }
}
export const clearProjectSharePassword = (shareId: string): void => {
  try {
    const cacheData = localStorage.getItem(sharePasswordCacheKey);
    if (!cacheData) return;
    const passwords = JSON.parse(cacheData);
    delete passwords[shareId];
    localStorage.setItem(sharePasswordCacheKey, JSON.stringify(passwords));
  } catch {
    // ignore
  }
}

// 项目工作区缓存
const projectWorkbenchNavsCacheKey = 'apiflow/projectWorkbench/node/navs';
export const getProjectWorkbenchTabs = (): Record<string, ApidocTab[]> => {
  try {
    const localData = JSON.parse(localStorage.getItem(projectWorkbenchNavsCacheKey) || '{}');
    return localData;
  } catch {
    localStorage.setItem(projectWorkbenchNavsCacheKey, '{}');
    return {};
  }
}
export const setProjectWorkbenchTabs = (tabs: Record<string, ApidocTab[]>) => {
  try {
    localStorage.setItem(projectWorkbenchNavsCacheKey, JSON.stringify(tabs));
  } catch {
    localStorage.setItem(projectWorkbenchNavsCacheKey, '{}');
  }
}

// 分享折叠状态缓存
type ShareCollapseState = {
  query?: boolean;
  headers?: boolean;
  body?: boolean;
  response?: boolean;
  condition?: boolean;
  messages?: boolean;
}
const shareCollapseStateCacheKey = 'apiflow/share/collapse-state';
export const getShareCollapseState = (docId: string): ShareCollapseState | null => {
  try {
    const cacheData = localStorage.getItem(shareCollapseStateCacheKey);
    if (!cacheData) return null;
    const states = JSON.parse(cacheData);
    return states[docId] || null;
  } catch {
    return null;
  }
}
export const updateShareBlockCollapseState = (docId: string, block: keyof ShareCollapseState, value: boolean): void => {
  try {
    const cacheData = localStorage.getItem(shareCollapseStateCacheKey);
    const states = cacheData ? JSON.parse(cacheData) : {};
    if (!states[docId]) {
      states[docId] = {};
    }
    states[docId][block] = value;
    localStorage.setItem(shareCollapseStateCacheKey, JSON.stringify(states));
  } catch {
    // ignore
  }
}
