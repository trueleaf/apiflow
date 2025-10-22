import { HttpNode } from '@src/types';
import type { ApidocCookie } from '@src/renderer/store/apidoc/cookiesStore';

class HttpNodeCache {
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

}

export const httpNodeCache = new HttpNodeCache();

