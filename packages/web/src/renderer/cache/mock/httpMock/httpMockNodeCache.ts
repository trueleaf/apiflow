import { HttpMockNode } from '@src/types/mockNode';
import { logger } from '@/helper';
import { cacheKey } from '../../cacheKey';
class HttpMockNodeCache {
  // 缓存httpMock节点信息
  setHttpMockNode(val: HttpMockNode) {
    try {
      const localHttpMock = JSON.parse(localStorage.getItem(cacheKey.httpMockNode.mock) || '{}');
      localHttpMock[val._id] = val;
      localStorage.setItem(cacheKey.httpMockNode.mock, JSON.stringify(localHttpMock));
    } catch (error) {
      logger.error('缓存HTTP Mock节点失败', { error });
      localStorage.setItem(cacheKey.httpMockNode.mock, '{}');
    }
  }
  // 获取缓存httpMock节点信息
  getHttpMockNode(id: string): HttpMockNode | null {
    try {
      const localHttpMock: Record<string, HttpMockNode> = JSON.parse(localStorage.getItem(cacheKey.httpMockNode.mock) || '{}');
      if (!localHttpMock[id]) {
        return null;
      }
      return localHttpMock[id];
    } catch (error) {
      logger.error('获取HTTP Mock节点失败', { error });
      localStorage.setItem(cacheKey.httpMockNode.mock, '{}')
      return null;
    }
  }
}
export const httpMockNodeCache = new HttpMockNodeCache();