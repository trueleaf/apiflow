import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { ProxyHostMapping } from '../../entity/proxy/proxy_host_mapping.js';
import { InjectClient } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { isIPv4 } from 'node:net';

@Provide()
export class ProxyHostService {
  @InjectEntityModel(ProxyHostMapping) proxyHostMappingModel: ReturnModelType<typeof ProxyHostMapping>;

  @InjectClient(CachingFactory, 'default')
  cache: MidwayCache;

  private readonly CACHE_KEY = 'proxy:hosts';
  private readonly CACHE_TTL = 5000;

  async getHostsMap(): Promise<Record<string, string>> {
    const cached = await this.cache.get<Record<string, string>>(this.CACHE_KEY);
    if (cached) {
      return cached;
    }

    const mappings = await this.proxyHostMappingModel.find({}).lean();
    const hostsMap: Record<string, string> = {};
    for (const mapping of mappings) {
      hostsMap[mapping.hostname] = mapping.ip;
    }

    await this.cache.set(this.CACHE_KEY, hostsMap, this.CACHE_TTL);
    return hostsMap;
  }

  async list() {
    return this.proxyHostMappingModel.find({}).sort({ createdAt: -1 }).lean();
  }

  async save(params: { hostname: string; ip: string; description?: string }) {
    if (!isIPv4(params.ip)) {
      throw new Error(`无效的 IP 地址格式: ${params.ip}`);
    }
    await this.cache.del(this.CACHE_KEY);
    return this.proxyHostMappingModel.findOneAndUpdate(
      { hostname: params.hostname },
      { $set: { ip: params.ip, description: params.description || '' } },
      { upsert: true, returnDocument: 'after', lean: true }
    );
  }

  async delete(id: string) {
    await this.cache.del(this.CACHE_KEY);
    return this.proxyHostMappingModel.findByIdAndDelete(id).lean();
  }
}
