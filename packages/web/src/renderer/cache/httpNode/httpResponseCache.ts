import { openDB, IDBPDatabase } from 'idb';
import { config } from "@src/config/config";
import { ChunkWithTimestampe, ResponseInfo } from "@src/types";
import { logger } from '@/helper';

type BodyRecord = { type: string; data: unknown };

export class HttpResponseCache {
  private httpResponseCacheDb: IDBPDatabase | null = null;
  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化HTTP响应缓存数据库失败', { error });
    });
  }

  private async initDB(): Promise<void> {
    if (this.httpResponseCacheDb) {
      return;
    }
    try {
      this.httpResponseCacheDb = await openDB(
        config.cacheConfig.httpNodeResponseCache.dbName,
        config.cacheConfig.httpNodeResponseCache.version,
        {
          upgrade(db: IDBPDatabase) {
            if (!db.objectStoreNames.contains('responseMetadata')) {
              db.createObjectStore('responseMetadata');
            }
          },
        }
      );
    } catch (error) {
      this.httpResponseCacheDb = null;
      throw error;
    }
  }

  private async getDB(): Promise<IDBPDatabase> {
    if (!this.httpResponseCacheDb) {
      await this.initDB();
    }
    if (!this.httpResponseCacheDb) {
      throw new Error('无法初始化HTTP响应缓存数据库');
    }
    return this.httpResponseCacheDb;
  }
  // 缓存返回值（元数据、body、streamData 分离存储）
  async setResponse(id: string, response: ResponseInfo) {
    const db = await this.getDB();
    try {
      const { singleResponseBodySize } = config.cacheConfig.httpNodeResponseCache;
      
      // 分离数据
      const { streamData, ...responseWithoutStream } = response.responseData;
      const { body, ...responseWithoutBody } = response;
      const metadata = {
        ...responseWithoutBody,
        responseData: responseWithoutStream
      };
      
      // 计算总大小
      const metadataStr = JSON.stringify(metadata);
      const metadataSize = new Blob([metadataStr]).size;
      
      let streamDataSize = 0;
      if (streamData && streamData.length > 0) {
        streamDataSize = streamData.reduce((total, item) => total + item.chunk.byteLength, 0);
      }
      
      let bodySize = 0;
      if (body) {
        if (body instanceof Uint8Array) {
          bodySize = body.byteLength;
        } else if (body instanceof ArrayBuffer) {
          bodySize = body.byteLength;
        } else if (typeof body === 'string') {
          bodySize = new Blob([body]).size;
        } else {
          bodySize = new Blob([JSON.stringify(body)]).size;
        }
      }
      
      const totalSize = metadataSize + streamDataSize + bodySize;
      
      // 检查是否超出限制
      if (totalSize > singleResponseBodySize) {
        logger.error(`单个缓存数据超出限制，无法缓存。总大小: ${totalSize}, 限制: ${singleResponseBodySize}`);
        return;
      }
      
      // 存储元数据
      await db.put("responseMetadata", JSON.parse(JSON.stringify(metadata)), id);
      
      // 存储 body（如果存在）
      if (body !== undefined && body !== null) {
        await this.storeBodyData(id, body);
      }
      
      // 存储 streamData（如果存在）
      if (streamData && streamData.length > 0) {
        await this.storeStreamData(id, streamData);
      }
    } catch (error) {
      logger.error('存储响应数据失败', { error });
    }
  }
  // 获取已缓存的返回值
  async getResponse(id: string): Promise<ResponseInfo | null> {
    const db = await this.getDB();
    
    try {
      // 获取元数据
      const metadata = await db.get("responseMetadata", id);
      if (!metadata) {
        return null;
      }
      
      const response = metadata as ResponseInfo;
      
      // 获取 body（如果存在）
      const body = await this.getBodyData(id);
      if (body !== null) {
        response.body = body;
      }
      
      // 获取 streamData（如果存在）
      const streamData = await this.getStreamData(id);
      if (streamData !== null) {
        response.responseData.streamData = streamData;
      }
      
      return response;
    } catch (error) {
      logger.error('获取响应数据失败', { error });
      return null;
    }
  }
  // 清理响应数据（包括元数据、body、streamData）
  private async clearResponse(id: string) {
    const db = await this.getDB();
    try {
      // 清理元数据
      await db.delete("responseMetadata", id);
      
      // 清理 body 数据
      await this.clearBodyData(id);
      
      // 清理 streamData 数据
      await this.clearStreamData(id);
    } catch (error) {
      logger.error('清理响应数据失败', { error });
    }
  }
  // 存储 body 数据
  private async storeBodyData(id: string, body: unknown) {
    const db = await this.getDB();
    try {
      const bodyKey = `${id}_body`;
      let bodyData: BodyRecord;
      // 根据 body 类型进行序列化
      if (body instanceof Uint8Array) {
        bodyData = {
          type: 'Uint8Array',
          data: body
        };
      } else if (body instanceof ArrayBuffer) {
        bodyData = {
          type: 'ArrayBuffer',
          data: new Uint8Array(body)
        };
      } else if (typeof body === 'string') {
        bodyData = {
          type: 'string',
          data: body
        };
      } else {
        // 其他类型序列化为 JSON
        bodyData = {
          type: 'json',
          data: JSON.stringify(body)
        };
      }
      await db.put("responseMetadata", bodyData, bodyKey);
    } catch (error) {
      logger.error('存储 body 数据失败', { error });
    }
  }
  // 存储 streamData（分开存储每个 chunk）
  private async storeStreamData(id: string, streamData: ChunkWithTimestampe[]) {
    const db = await this.getDB();
    try {
      // 存储每个 streamData 项（包含 Uint8Array）
      for (let i = 0; i < streamData.length; i++) {
        const streamKey = `${id}_stream_${i}`;
        const streamItem = {
          chunk: streamData[i].chunk, // Uint8Array 可以直接存储
          timestamp: streamData[i].timestamp
        };
        await db.put("responseMetadata", streamItem, streamKey);
      }
      
      // 存储 streamData 数量元数据
      const streamMetaKey = `${id}_stream_meta`;
      await db.put("responseMetadata", { count: streamData.length }, streamMetaKey);
    } catch (error) {
      logger.error('存储 streamData 失败', { error });
    }
  }
  // 获取 body 数据
  private async getBodyData(id: string): Promise<unknown | null> {
    const db = await this.getDB();
    try {
      const bodyKey = `${id}_body`;
      const bodyRecord = await db.get("responseMetadata", bodyKey);
      
      if (!bodyRecord) {
        return null;
      }
      const { type, data } = bodyRecord as BodyRecord;
      // 根据类型恢复原始数据
      switch (type) {
        case 'Uint8Array':
          return data as Uint8Array;
        case 'ArrayBuffer':
          return (data as Uint8Array).buffer;
        case 'string':
          return data as string;
        case 'json':
          return JSON.parse(data as string);
        default:
          return data;
      }
    } catch (error) {
      logger.error('获取 body 数据失败', { error });
      return null;
    }
  }
  // 获取 streamData
  private async getStreamData(id: string): Promise<ChunkWithTimestampe[] | null> {
    const db = await this.getDB();
    try {
      // 获取 streamData 数量
      const streamMetaKey = `${id}_stream_meta`;
      const streamMeta = await db.get("responseMetadata", streamMetaKey);
      
      if (!streamMeta) {
        return null;
      }
      
      const { count } = streamMeta as { count: number };
      const streamData: ChunkWithTimestampe[] = [];
      
      // 读取所有 streamData 项
      for (let i = 0; i < count; i++) {
        const streamKey = `${id}_stream_${i}`;
        const streamItem = await db.get("responseMetadata", streamKey);
        if (streamItem) {
          streamData.push(streamItem as ChunkWithTimestampe);
        }
      }

      return streamData.length > 0 ? streamData : null;
    } catch (error) {
      logger.error('获取 streamData 失败', { error });
      return null;
    }
  }
  // 清理 body 数据
  private async clearBodyData(id: string) {
    const db = await this.getDB();

    try {
      const bodyKey = `${id}_body`;
      await db.delete("responseMetadata", bodyKey);
    } catch (error) {
      logger.error('清理 body 数据失败', { error });
    }
  }
  // 清理 streamData 数据
  private async clearStreamData(id: string) {
    const db = await this.getDB();

    try {
      // 获取 streamData 数量
      const streamMetaKey = `${id}_stream_meta`;
      const streamMeta = await db.get("responseMetadata", streamMetaKey);
      
      if (streamMeta) {
        const { count } = streamMeta as { count: number };
        
        // 删除所有 streamData 项
        for (let i = 0; i < count; i++) {
          const streamKey = `${id}_stream_${i}`;
          await db.delete("responseMetadata", streamKey);
        }
        
        // 删除元数据
        await db.delete("responseMetadata", streamMetaKey);
      }
    } catch (error) {
      logger.error('清理 streamData 失败', { error });
    }
  }
  // 删除response缓存（包括分块数据）
  async deleteResponse(id: string) {
    try {
      await this.clearResponse(id);
      return Promise.resolve(true);
    } catch (error) {
      logger.error('删除响应缓存失败', { error });
      return Promise.resolve(null);
    }
  }
  // 获取缓存统计信息
  async getCacheStats() {
    const db = await this.getDB();

    try {
      const allKeys = await db.getAllKeys("responseMetadata");
      
      // 过滤出主键（不包含 _body 和 _stream 后缀）
      const responseIds = allKeys.filter(key => {
        const keyStr = String(key);
        return !keyStr.includes('_body') && !keyStr.includes('_stream');
      });

      return {
        totalCacheCount: responseIds.length,
        totalKeys: allKeys.length
      };
    } catch (error) {
      logger.error('获取缓存统计信息失败', { error });
      return null;
    }
  }
  // 清理所有缓存
  async clearAllCache() {
    const db = await this.getDB();

    try {
      await db.clear("responseMetadata");
    } catch (error) {
      logger.error('清理所有缓存失败', { error });
    }
  }
}

export const httpResponseCache = new HttpResponseCache();
