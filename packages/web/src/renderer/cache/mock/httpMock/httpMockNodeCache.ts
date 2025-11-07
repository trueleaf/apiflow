import { HttpMockNode } from '@src/types/mockNode';

class HttpMockNodeCache {
  constructor() {
    if (!localStorage.getItem('httpMockNode/mock')) {
      localStorage.setItem('httpMockNode/mock', '{}');
    }
  }

  /*
   * 缓存httpMock节点信息
   */
  setHttpMockNode(val: HttpMockNode) {
    try {
      const localHttpMock = JSON.parse(localStorage.getItem('httpMockNode/mock') || '{}');
      localHttpMock[val._id] = val;
      localStorage.setItem('httpMockNode/mock', JSON.stringify(localHttpMock));
    } catch (error) {
      console.error(error);
      const data: Record<string, HttpMockNode> = {};
      data[val._id] = val;
      localStorage.setItem('httpMockNode/mock', JSON.stringify(data));
    }
  }

  /*
   * 获取缓存httpMock节点信息
   */
  getHttpMockNode(id: string): HttpMockNode | null {
    try {
      const localHttpMock: Record<string, HttpMockNode> = JSON.parse(localStorage.getItem('httpMockNode/mock') || '{}');
      if (!localHttpMock[id]) {
        return null;
      }
      return localHttpMock[id];
    } catch (error) {
      console.error(error);
      localStorage.setItem('httpMockNode/mock', '{}')
      return null;
    }
  }
}

export const httpMockNodeCache = new HttpMockNodeCache();
