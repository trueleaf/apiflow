import { config } from "@src/config/config";
import { ResponseInfo } from "@src/types/types";
import { openDB, IDBPDatabase } from "idb";

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
            if (!db.objectStoreNames.contains("responseCache")) {
              db.createObjectStore("responseCache");
            }
          },
          blocked(
            currentVersion: number,
            blockedVersion: number,
            event: Event
          ) {
            console.log("blocked", currentVersion, blockedVersion, event);
          },
          blocking(
            currentVersion: number,
            blockedVersion: number,
            event: Event
          ) {
            console.log("blocking", currentVersion, blockedVersion, event);
          },
          terminated() {
            console.log("terminated");
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * 缓存返回值（性能优化版）
   */
  async setResponse(id: string, response: ResponseInfo) {
    if (!this.responseCacheDb) {
      return;
    }
    try {
      // console.log("set", response)
      const { singleResponseBodySize } = config.cacheConfig.apiflowResponseCache;
      const responseByteSize = response.bodyByteLength || 0;
      if (responseByteSize > singleResponseBodySize) {
        console.warn("单个缓存数据超出限制，无法缓存");
        return;
      }
      const blob = new Blob([JSON.stringify(response)], {
        type: "application/json",
      });
      await this.responseCacheDb.put(
        "responseCache",
        { data: blob, size: responseByteSize },
        id
      );
    } catch (error) {
      console.error(error);
      await this.responseCacheDb.clear("responseCache");
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
      const entry = await this.responseCacheDb.get("responseCache", id);
      if (entry) {
        const data: any = (entry as any).data;
        try {
          const text = await data.text();
          return JSON.parse(text) as ResponseInfo;
        } catch (e) {
          console.error("解析 Blob 失败", e);
          return null;
        }
      }
      return Promise.resolve(null);
    } catch (error) {
      console.error(error);
      return Promise.resolve(null);
    }
  }

  /**
   * 删除response缓存
   */
  async deleteResponse(id: string) {
    if (!this.responseCacheDb) {
      return Promise.resolve(null);
    }
    try {
      // 删除数据
      const localResponse = await this.responseCacheDb.delete(
        "responseCache",
        id
      );
      return Promise.resolve(localResponse);
    } catch (error) {
      console.error(error);
      return Promise.resolve(null);
    }
  }
}
