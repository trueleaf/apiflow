import { config } from "@src/config/config";
import { ChunkWithTimestampe, ResponseInfo } from "@src/types/types";
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
            // 创建响应缓存存储
            if (!db.objectStoreNames.contains("responseCache")) {
              db.createObjectStore("responseCache");
            }
            // 创建分块存储
            if (!db.objectStoreNames.contains("responseChunks")) {
              db.createObjectStore("responseChunks");
            }
            // 创建元数据存储
            if (!db.objectStoreNames.contains("responseMetadata")) {
              db.createObjectStore("responseMetadata");
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
   * 缓存返回值（支持分块存储）
   */
  async setResponse(id: string, response: ResponseInfo) {
    if (!this.responseCacheDb) {
      return;
    }
    try {
      const { singleResponseBodySize, chunkSize } = config.cacheConfig.apiflowResponseCache;
      const { streamData, ...responseWithoutStream } = response.responseData;
      const { body, ...responseWithoutBody } = response;
      const responseWithoutLargeData = {
        ...responseWithoutBody,
        responseData: responseWithoutStream
      };
      const responseStr = JSON.stringify(responseWithoutLargeData);
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
      const responseByteSize = new Blob([responseStr]).size;
      const totalSize = responseByteSize + streamDataSize + bodySize;
      if (totalSize > singleResponseBodySize) {
        console.warn("单个缓存数据超出限制，无法缓存");
        return;
      }
      // 如果数据小于分块大小，直接存储
      if (totalSize <= chunkSize) {
        const responseBlob = new Blob([responseStr], {
          type: "application/json",
        });
        await this.responseCacheDb.put(
          "responseCache",
          { data: responseBlob, size: responseByteSize },
          id
        );
        // 单独存储 streamData
        if (streamData && streamData.length > 0) {
          await this.storeStreamData(id, streamData);
        }
        // 单独存储 body
        if (body) {
          await this.storeBodyData(id, body);
        }
        return;
      }
      await this.storeResponseInChunks(id, responseStr, streamData, body, totalSize);
    } catch (error) {
      console.error(error);
      await this.clearResponseData(id);
    }
  }

  /**
   * 分块存储大型响应数据
   */
  private async storeResponseInChunks(id: string, responseStr: string, streamData: ChunkWithTimestampe[], body: unknown, totalSize: number) {
    const { chunkSize } = config.cacheConfig.apiflowResponseCache;
    const chunks: string[] = [];
    // 将字符串分块
    for (let i = 0; i < responseStr.length; i += chunkSize) {
      chunks.push(responseStr.slice(i, i + chunkSize));
    }
    // 存储元数据
    const metadata = {
      totalChunks: chunks.length,
      totalSize,
      timestamp: Date.now(),
      hasStreamData: streamData && streamData.length > 0,
      hasBody: body !== undefined && body !== null
    };
    await this.responseCacheDb!.put("responseMetadata", metadata, id);
    // 存储分块数据
    for (let i = 0; i < chunks.length; i++) {
      const chunkBlob = new Blob([chunks[i]], { type: "application/json" });
      const chunkKey = `${id}_chunk_${i}`;
      await this.responseCacheDb!.put("responseChunks", chunkBlob, chunkKey);
    }

    // 单独存储 streamData
    if (streamData && streamData.length > 0) {
      await this.storeStreamData(id, streamData);
    }

    // 单独存储 body
    if (body) {
      await this.storeBodyData(id, body);
    }
  }

  /**
   * 存储 body 数据
   */
  private async storeBodyData(id: string, body: unknown) {
    if (!this.responseCacheDb) {
      return;
    }

    try {
      const bodyKey = `${id}_body`;
      let bodyData: any;

      // 根据 body 类型进行不同的处理
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

      await this.responseCacheDb.put("responseChunks", bodyData, bodyKey);

      // 存储 body 元数据
      const bodyMetadata = {
        hasBody: true,
        bodyType: bodyData.type,
        timestamp: Date.now()
      };
      const bodyMetaKey = `${id}_body_meta`;
      await this.responseCacheDb.put("responseMetadata", bodyMetadata, bodyMetaKey);
    } catch (error) {
      console.error("存储 body 数据失败", error);
    }
  }

  /**
   * 存储 streamData (Uint8Array 数据)
   */
  private async storeStreamData(id: string, streamData: any[]) {
    if (!this.responseCacheDb) {
      return;
    }
    for (let i = 0; i < streamData.length; i++) {
      const streamItem = streamData[i];
      const streamKey = `${id}_stream_${i}`;
      // 分别存储 chunk (Uint8Array) 和 timestamp
      const streamRecord = {
        chunk: streamItem.chunk, // Uint8Array 可以直接存储到 IndexedDB
        timestamp: streamItem.timestamp
      };
      await this.responseCacheDb.put("responseChunks", streamRecord, streamKey);
    }

    // 存储 streamData 的元数据
    const streamMetadata = {
      streamCount: streamData.length,
      timestamp: Date.now()
    };
    const streamMetaKey = `${id}_stream_meta`;
    await this.responseCacheDb.put("responseMetadata", streamMetadata, streamMetaKey);
  }

  /**
   * 获取 streamData
   */
  private async getStreamData(id: string): Promise<any[] | null> {
    if (!this.responseCacheDb) {
      return null;
    }

    try {
      // 获取 streamData 元数据
      const streamMetaKey = `${id}_stream_meta`;
      const streamMetadata = await this.responseCacheDb.get("responseMetadata", streamMetaKey);
      
      if (!streamMetadata) {
        return null;
      }

      const { streamCount } = streamMetadata as any;
      const streamData: any[] = [];

      // 读取所有 streamData 项
      for (let i = 0; i < streamCount; i++) {
        const streamKey = `${id}_stream_${i}`;
        const streamRecord = await this.responseCacheDb.get("responseChunks", streamKey);
        
        if (streamRecord) {
          streamData.push(streamRecord);
        }
      }

      return streamData.length > 0 ? streamData : null;
    } catch (error) {
      console.error("获取 streamData 失败", error);
      return null;
    }
  }

  /**
   * 获取 body 数据
   */
  private async getBodyData(id: string): Promise<unknown | null> {
    if (!this.responseCacheDb) {
      return null;
    }

    try {
      // 获取 body 元数据
      const bodyMetaKey = `${id}_body_meta`;
      const bodyMetadata = await this.responseCacheDb.get("responseMetadata", bodyMetaKey);
      
      if (!bodyMetadata) {
        return null;
      }

      const { bodyType } = bodyMetadata as any;
      const bodyKey = `${id}_body`;
      const bodyRecord = await this.responseCacheDb.get("responseChunks", bodyKey);
      
      if (!bodyRecord) {
        return null;
      }

      const { data } = bodyRecord as any;

      // 根据类型恢复原始数据
      switch (bodyType) {
        case 'Uint8Array':
          return data;
        case 'ArrayBuffer':
          return data.buffer;
        case 'string':
          return data;
        case 'json':
          return JSON.parse(data);
        default:
          return data;
      }
    } catch (error) {
      console.error("获取 body 数据失败", error);
      return null;
    }
  }

  /**
   * 获取已缓存的返回值（支持分块读取）
   */
  async getResponse(id: string): Promise<ResponseInfo | null> {
    if (!this.responseCacheDb) {
      return Promise.resolve(null);
    }
    try {
      // 首先尝试从普通缓存获取
      const directEntry = await this.responseCacheDb.get("responseCache", id);
      if (directEntry) {
        const data: any = (directEntry as any).data;
        try {
          const text = await data.text();
          const response = JSON.parse(text) as ResponseInfo;
          
          // 尝试获取 streamData
          const streamData = await this.getStreamData(id);
          if (streamData) {
            response.responseData.streamData = streamData;
          }
          
          // 尝试获取 body
          const body = await this.getBodyData(id);
          if (body !== null) {
            response.body = body;
          }
          
          return response;
        } catch (e) {
          console.error("解析 Blob 失败", e);
          return null;
        }
      }

      // 尝试从分块存储获取
      const metadata = await this.responseCacheDb.get("responseMetadata", id);
      if (metadata) {
        return await this.assembleResponseFromChunks(id, metadata as any);
      }

      return Promise.resolve(null);
    } catch (error) {
      console.error(error);
      return Promise.resolve(null);
    }
  }

  /**
   * 从分块数据组装完整响应
   */
  private async assembleResponseFromChunks(id: string, metadata: { totalChunks: number; totalSize: number; timestamp: number; hasStreamData?: boolean; hasBody?: boolean }): Promise<ResponseInfo | null> {
    if (!this.responseCacheDb) {
      return null;
    }

    try {
      const chunks: string[] = [];
      
      // 读取所有分块
      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunkKey = `${id}_chunk_${i}`;
        const chunkBlob = await this.responseCacheDb.get("responseChunks", chunkKey);
        
        if (!chunkBlob) {
          console.error(`分块 ${i} 缺失，无法组装完整数据`);
          return null;
        }
        
        const chunkText = await (chunkBlob as Blob).text();
        chunks.push(chunkText);
      }
      
      // 组装完整数据
      const completeResponse = chunks.join('');
      const response = JSON.parse(completeResponse) as ResponseInfo;
      
      // 如果有 streamData，获取并添加
      if (metadata.hasStreamData) {
        const streamData = await this.getStreamData(id);
        if (streamData) {
          response.responseData.streamData = streamData;
        }
      }
      
      // 如果有 body，获取并添加
      if (metadata.hasBody) {
        const body = await this.getBodyData(id);
        if (body !== null) {
          response.body = body;
        }
      }
      
      return response;
    } catch (error) {
      console.error("组装分块数据失败", error);
      return null;
    }
  }

  /**
   * 清理响应数据（包括分块数据和streamData）
   */
  private async clearResponseData(id: string) {
    if (!this.responseCacheDb) {
      return;
    }

    try {
      // 清理普通缓存
      await this.responseCacheDb.delete("responseCache", id);
      
      // 检查是否有分块数据
      const metadata = await this.responseCacheDb.get("responseMetadata", id);
      if (metadata) {
        const { totalChunks } = metadata as any;
        
        // 清理所有分块
        for (let i = 0; i < totalChunks; i++) {
          const chunkKey = `${id}_chunk_${i}`;
          await this.responseCacheDb.delete("responseChunks", chunkKey);
        }
        
        // 清理元数据
        await this.responseCacheDb.delete("responseMetadata", id);
      }
      
      // 清理 streamData 相关数据
      await this.clearStreamData(id);
      
      // 清理 body 相关数据
      await this.clearBodyData(id);
    } catch (error) {
      console.error("清理响应数据失败", error);
    }
  }

  /**
   * 清理 body 相关数据
   */
  private async clearBodyData(id: string) {
    if (!this.responseCacheDb) {
      return;
    }

    try {
      // 清理 body 数据
      const bodyKey = `${id}_body`;
      await this.responseCacheDb.delete("responseChunks", bodyKey);
      
      // 清理 body 元数据
      const bodyMetaKey = `${id}_body_meta`;
      await this.responseCacheDb.delete("responseMetadata", bodyMetaKey);
    } catch (error) {
      console.error("清理 body 数据失败", error);
    }
  }

  /**
   * 清理 streamData 相关数据
   */
  private async clearStreamData(id: string) {
    if (!this.responseCacheDb) {
      return;
    }

    try {
      // 获取 streamData 元数据
      const streamMetaKey = `${id}_stream_meta`;
      const streamMetadata = await this.responseCacheDb.get("responseMetadata", streamMetaKey);
      
      if (streamMetadata) {
        const { streamCount } = streamMetadata as any;
        
        // 清理所有 streamData 项
        for (let i = 0; i < streamCount; i++) {
          const streamKey = `${id}_stream_${i}`;
          await this.responseCacheDb.delete("responseChunks", streamKey);
        }
        
        // 清理 streamData 元数据
        await this.responseCacheDb.delete("responseMetadata", streamMetaKey);
      }
    } catch (error) {
      console.error("清理 streamData 失败", error);
    }
  }

  /**
   * 删除response缓存（包括分块数据）
   */
  async deleteResponse(id: string) {
    if (!this.responseCacheDb) {
      return Promise.resolve(null);
    }
    try {
      await this.clearResponseData(id);
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      return Promise.resolve(null);
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats() {
    if (!this.responseCacheDb) {
      return null;
    }

    try {
      const directCacheKeys = await this.responseCacheDb.getAllKeys("responseCache");
      const metadataKeys = await this.responseCacheDb.getAllKeys("responseMetadata");
      const chunkKeys = await this.responseCacheDb.getAllKeys("responseChunks");

      return {
        directCacheCount: directCacheKeys.length,
        chunkedCacheCount: metadataKeys.length,
        totalChunkCount: chunkKeys.length,
        totalCacheCount: directCacheKeys.length + metadataKeys.length
      };
    } catch (error) {
      console.error("获取缓存统计信息失败", error);
      return null;
    }
  }

  /**
   * 清理所有缓存
   */
  async clearAllCache() {
    if (!this.responseCacheDb) {
      return;
    }

    try {
      await this.responseCacheDb.clear("responseCache");
      await this.responseCacheDb.clear("responseChunks");
      await this.responseCacheDb.clear("responseMetadata");
    } catch (error) {
      console.error("清理所有缓存失败", error);
    }
  }
}
