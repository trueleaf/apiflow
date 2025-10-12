import { config } from "@src/config/config";
import { ChunkWithTimestampe, ResponseInfo } from "@src/types";
import { getHttpResponseDB } from "../db";

export class HttpResponseCache {
  private httpResponseCacheDb?: Awaited<ReturnType<typeof getHttpResponseDB>>;

  private async getDB() {
    if (!this.httpResponseCacheDb) {
      this.httpResponseCacheDb = await getHttpResponseDB();
    }
    return this.httpResponseCacheDb;
  }

    // 缓存返回值（元数据、body、streamData 分离存储）
  async setResponse(id: string, response: ResponseInfo) {
    await this.getDB();
    try {
      const { singleResponseBodySize } = config.cacheConfig.apiflowResponseCache;
      
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
        console.error(`单个缓存数据超出限制，无法缓存。总大小: ${totalSize}, 限制: ${singleResponseBodySize}`);
        return;
      }
      
      // 存储元数据
      await this.httpResponseCacheDb!.put("responseMetadata", JSON.parse(JSON.stringify(metadata)), id);
      
      // 存储 body（如果存在）
      if (body !== undefined && body !== null) {
        await this.storeBodyData(id, body);
      }
      
      // 存储 streamData（如果存在）
      if (streamData && streamData.length > 0) {
        await this.storeStreamData(id, streamData);
      }
    } catch (error) {
      console.error("存储响应数据失败", error);
    }
  }

  /**
   * 存储 body 数据
   */
  private async storeBodyData(id: string, body: unknown) {
    if (!this.httpResponseCacheDb) {
      return;
    }

    try {
      const bodyKey = `${id}_body`;
      let bodyData: { type: string; data: any };

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

      await this.httpResponseCacheDb.put("responseMetadata", bodyData, bodyKey);
    } catch (error) {
      console.error("存储 body 数据失败", error);
    }
  }

  /**
   * 存储 streamData（分开存储每个 chunk）
   */
  private async storeStreamData(id: string, streamData: ChunkWithTimestampe[]) {
    if (!this.httpResponseCacheDb) {
      return;
    }
    
    try {
      // 存储每个 streamData 项（包含 Uint8Array）
      for (let i = 0; i < streamData.length; i++) {
        const streamKey = `${id}_stream_${i}`;
        const streamItem = {
          chunk: streamData[i].chunk, // Uint8Array 可以直接存储
          timestamp: streamData[i].timestamp
        };
        await this.httpResponseCacheDb.put("responseMetadata", streamItem, streamKey);
      }
      
      // 存储 streamData 数量元数据
      const streamMetaKey = `${id}_stream_meta`;
      await this.httpResponseCacheDb.put("responseMetadata", { count: streamData.length }, streamMetaKey);
    } catch (error) {
      console.error("存储 streamData 失败", error);
    }
  }

  /**
   * 获取 streamData
   */
  private async getStreamData(id: string): Promise<ChunkWithTimestampe[] | null> {
    if (!this.httpResponseCacheDb) {
      return null;
    }

    try {
      // 获取 streamData 数量
      const streamMetaKey = `${id}_stream_meta`;
      const streamMeta = await this.httpResponseCacheDb.get("responseMetadata", streamMetaKey);
      
      if (!streamMeta) {
        return null;
      }
      
      const { count } = streamMeta as { count: number };
      const streamData: ChunkWithTimestampe[] = [];
      
      // 读取所有 streamData 项
      for (let i = 0; i < count; i++) {
        const streamKey = `${id}_stream_${i}`;
        const streamItem = await this.httpResponseCacheDb.get("responseMetadata", streamKey);
        if (streamItem) {
          streamData.push(streamItem as ChunkWithTimestampe);
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
    if (!this.httpResponseCacheDb) {
      return null;
    }

    try {
      const bodyKey = `${id}_body`;
      const bodyRecord = await this.httpResponseCacheDb.get("responseMetadata", bodyKey);
      
      if (!bodyRecord) {
        return null;
      }

      const { type, data } = bodyRecord as { type: string; data: any };

      // 根据类型恢复原始数据
      switch (type) {
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

    // 获取已缓存的返回值
  async getResponse(id: string): Promise<ResponseInfo | null> {
    await this.getDB();
    if (!this.httpResponseCacheDb) {
      return null;
    }
    
    try {
      // 获取元数据
      const metadata = await this.httpResponseCacheDb.get("responseMetadata", id);
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
      console.error("获取响应数据失败", error);
      return null;
    }
  }

  /**
   * 清理响应数据（包括元数据、body、streamData）
   */
  private async clearResponseData(id: string) {
    if (!this.httpResponseCacheDb) {
      return;
    }

    try {
      // 清理元数据
      await this.httpResponseCacheDb.delete("responseMetadata", id);
      
      // 清理 body 数据
      await this.clearBodyData(id);
      
      // 清理 streamData 数据
      await this.clearStreamData(id);
    } catch (error) {
      console.error("清理响应数据失败", error);
    }
  }

  /**
   * 清理 body 数据
   */
  private async clearBodyData(id: string) {
    if (!this.httpResponseCacheDb) {
      return;
    }

    try {
      const bodyKey = `${id}_body`;
      await this.httpResponseCacheDb.delete("responseMetadata", bodyKey);
    } catch (error) {
      console.error("清理 body 数据失败", error);
    }
  }

  /**
   * 清理 streamData 数据
   */
  private async clearStreamData(id: string) {
    if (!this.httpResponseCacheDb) {
      return;
    }

    try {
      // 获取 streamData 数量
      const streamMetaKey = `${id}_stream_meta`;
      const streamMeta = await this.httpResponseCacheDb.get("responseMetadata", streamMetaKey);
      
      if (streamMeta) {
        const { count } = streamMeta as { count: number };
        
        // 删除所有 streamData 项
        for (let i = 0; i < count; i++) {
          const streamKey = `${id}_stream_${i}`;
          await this.httpResponseCacheDb.delete("responseMetadata", streamKey);
        }
        
        // 删除元数据
        await this.httpResponseCacheDb.delete("responseMetadata", streamMetaKey);
      }
    } catch (error) {
      console.error("清理 streamData 失败", error);
    }
  }

    // 删除response缓存（包括分块数据）
  async deleteResponse(id: string) {
    if (!this.httpResponseCacheDb) {
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

    // 获取缓存统计信息
  async getCacheStats() {
    if (!this.httpResponseCacheDb) {
      return null;
    }

    try {
      const allKeys = await this.httpResponseCacheDb.getAllKeys("responseMetadata");
      
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
      console.error("获取缓存统计信息失败", error);
      return null;
    }
  }

    // 清理所有缓存
  async clearAllCache() {
    if (!this.httpResponseCacheDb) {
      return;
    }

    try {
      await this.httpResponseCacheDb.clear("responseMetadata");
    } catch (error) {
      console.error("清理所有缓存失败", error);
    }
  }
}

export const httpResponseCache = new HttpResponseCache();
