import { HttpMockNode } from '@src/types/mockNode';
import { cacheKey } from '../../cacheKey';

class HttpMockNodeCache {
  /*
   * 缓存httpMock节点信息
   */
  setHttpMockNode(val: HttpMockNode) {
    try {
      const localHttpMock = JSON.parse(localStorage.getItem(cacheKey.httpMockNode.mock) || '{}');
      localHttpMock[val._id] = val;
      localStorage.setItem(cacheKey.httpMockNode.mock, JSON.stringify(localHttpMock));
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.httpMockNode.mock, '{}');
    }
  }

  /*
   * 获取缓存httpMock节点信息
   */
  getHttpMockNode(id: string): HttpMockNode | null {
    try {
      const localHttpMock: Record<string, HttpMockNode> = JSON.parse(localStorage.getItem(cacheKey.httpMockNode.mock) || '{}');
      if (!localHttpMock[id]) {
        return null;
      }
      return localHttpMock[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.httpMockNode.mock, '{}')
      return null;
    }
  }
}

export const httpMockNodeCache = new HttpMockNodeCache();
