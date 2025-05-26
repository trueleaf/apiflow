import { config } from '@src/config/config';
import { ResponseInfo } from '@src/types/types';
import { openDB, IDBPDatabase } from 'idb';

export class ResponseCache {
  public responseCacheDb: IDBPDatabase | null = null;

  /**
   * 初始化 responseCache 数据库
   */
  async initApiflowResponseCache() {
    try {
      this.responseCacheDb = await openDB(
        config.cacheConfig.apiflowResponseCache.dbName,
        config.cacheConfig.apiflowResponseCache.version,
        {
          upgrade(db: IDBPDatabase) {
            if (!db.objectStoreNames.contains('responseCache')) {
              db.createObjectStore('responseCache');
            }
          },
          blocked(currentVersion: number, blockedVersion: number, event: Event) {
            console.log('blocked', currentVersion, blockedVersion, event);
          },
          blocking(currentVersion: number, blockedVersion: number, event: Event) {
            console.log('blocking', currentVersion, blockedVersion, event);
          },
          terminated() {
            console.log('terminated');
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * 获取当前缓存总大小
   */
  protected async getResponseCacheTotalSize(): Promise<number> {
    if (!this.responseCacheDb) return 0;
    const total = await this.responseCacheDb.get('responseCache', '__total_size__');
    return typeof total === 'number' ? total : 0;
  }

  /**
   * 设置当前缓存总大小
   */
  protected async setResponseCacheTotalSize(size: number) {
    if (!this.responseCacheDb) return;
    await this.responseCacheDb.put('responseCache', size, '__total_size__');
  }

  /**
   * 缓存返回值（性能优化版）
   */
  async setResponse(id: string, response: ResponseInfo) {
    if (!this.responseCacheDb) {
      return;
    }
    try {
      const { maxResponseBodySize, singleResponseBodySize } = config.cacheConfig.apiflowResponseCache;
      const responseByteSize = response.bodyByteLength || 0;
      if (responseByteSize > singleResponseBodySize) {
        console.warn('单个缓存数据超出限制，无法缓存');
        return;
      }
      let totalSize = await this.getResponseCacheTotalSize();
      const oldResponse = await this.responseCacheDb.get('responseCache', id);
      if (oldResponse && typeof oldResponse === 'object' && typeof oldResponse.size === 'number') {
        totalSize -= oldResponse.size;
      }
      // 判断是否超限
      if (totalSize + responseByteSize > maxResponseBodySize) {
        console.warn('缓存已达最大限制，禁止缓存新数据');
        return;
      }
      await this.responseCacheDb.put('responseCache', { data: response, size: responseByteSize }, id);
      await this.setResponseCacheTotalSize(totalSize + responseByteSize);
    } catch (error) {
      console.error(error);
      await this.responseCacheDb.clear('responseCache');
      await this.setResponseCacheTotalSize(0);
    }
  }

  /**
   * 获取已缓存得返回值
   */
  async getResponse(id: string): Promise<ResponseInfo | null> {
    if (!this.responseCacheDb) {
      return Promise.resolve(null);
    }
    try {
      const entry = await this.responseCacheDb.get('responseCache', id);
      if (entry) {
        return Promise.resolve(entry.data);
      }
      return Promise.resolve(null);
    } catch (error) {
      console.error(error);
      return Promise.resolve(null);
    }
  }

  /**
   * 删除response缓存（同步维护总大小）
   */
  async deleteResponse(id: string) {
    if (!this.responseCacheDb) {
      return Promise.resolve(null);
    }
    try {
      // 获取当前总大小
      let totalSize = await this.getResponseCacheTotalSize();
      // 获取被删项大小
      const entry = await this.responseCacheDb.get('responseCache', id);
      let entrySize = 0;
      if (entry && typeof entry === 'object' && typeof entry.size === 'number') {
        entrySize = entry.size;
      }
      // 删除数据
      const localResponse = await this.responseCacheDb.delete('responseCache', id);
      // 更新总大小
      await this.setResponseCacheTotalSize(Math.max(0, totalSize - entrySize));
      return Promise.resolve(localResponse);
    } catch (error) {
      console.error(error);
      return Promise.resolve(null);
    }
  }
}
