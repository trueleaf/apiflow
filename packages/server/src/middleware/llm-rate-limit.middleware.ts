import { Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { InjectClient } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { throwError } from '../utils/utils.js';

type LimitInfo = {
  hourlyCount: number;
  dailyCount: number;
  hourlyReset: number;
  dailyReset: number;
};

type CachedLimitData = {
  count: number;
  reset: number;
};

@Middleware()
export class LLMRateLimitMiddleware {
  @InjectClient(CachingFactory, 'default')
    cache: MidwayCache;

  private readonly RATE_LIMITS = {
    anonymous: { hourly: 20, daily: 50 },
    authenticated: { hourly: 50, daily: 200 }
  };

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 只对LLM接口进行限流
      if (!ctx.path.startsWith('/api/llm/')) {
        return await next();
      }

      const userId = ctx.tokenInfo?.id;
      const ip = ctx.ip;
      const isAuthenticated = !!userId;
      const identifier = userId || ip;
      const limitConfig = isAuthenticated ? this.RATE_LIMITS.authenticated : this.RATE_LIMITS.anonymous;

      // 检查是否被封禁
      const banKey = `llm:ban:${identifier}`;
      const banInfo = await this.cache.get(banKey);
      if (banInfo) {
        return throwError(4030, '您已被临时禁用访问LLM服务，请稍后再试');
      }

      // 获取当前计数
      const limitInfo = await this.getLimitInfo(identifier);
      const now = Date.now();

      // 重置过期的计数
      if (now >= limitInfo.hourlyReset) {
        limitInfo.hourlyCount = 0;
        limitInfo.hourlyReset = now + 60 * 60 * 1000;
      }
      if (now >= limitInfo.dailyReset) {
        limitInfo.dailyCount = 0;
        limitInfo.dailyReset = now + 24 * 60 * 60 * 1000;
      }

      // 检查是否超限
      if (limitInfo.hourlyCount >= limitConfig.hourly) {
        return throwError(4029, `每小时最多请求${limitConfig.hourly}次，请稍后再试`);
      }
      if (limitInfo.dailyCount >= limitConfig.daily) {
        return throwError(4029, `每天最多请求${limitConfig.daily}次，请明天再试`);
      }

      // 增加计数
      limitInfo.hourlyCount++;
      limitInfo.dailyCount++;
      await this.saveLimitInfo(identifier, limitInfo);

      // 检测异常行为 - 如果在1分钟内请求超过15次，封禁1小时
      const abuseKey = `llm:abuse:${identifier}`;
      const abuseCount: number = (await this.cache.get(abuseKey)) || 0;
      const newAbuseCount = abuseCount + 1;
      
      if (newAbuseCount >= 15) {
        const banDuration = 60 * 60 * 1000;
        await this.cache.set(banKey, { bannedAt: now }, banDuration);
        return throwError(4030, '检测到异常请求行为，您已被临时禁用1小时');
      }
      
      await this.cache.set(abuseKey, newAbuseCount, 60 * 1000);

      await next();
    };
  }

  private async getLimitInfo(identifier: string): Promise<LimitInfo> {
    const hourlyKey = `llm:limit:hourly:${identifier}`;
    const dailyKey = `llm:limit:daily:${identifier}`;
    
    const hourlyData = await this.cache.get(hourlyKey) as CachedLimitData | undefined;
    const dailyData = await this.cache.get(dailyKey) as CachedLimitData | undefined;
    const now = Date.now();
    
    return {
      hourlyCount: hourlyData?.count || 0,
      dailyCount: dailyData?.count || 0,
      hourlyReset: hourlyData?.reset || now + 60 * 60 * 1000,
      dailyReset: dailyData?.reset || now + 24 * 60 * 60 * 1000,
    };
  }

  private async saveLimitInfo(identifier: string, info: LimitInfo): Promise<void> {
    const hourlyKey = `llm:limit:hourly:${identifier}`;
    const dailyKey = `llm:limit:daily:${identifier}`;
    const now = Date.now();
    
    const hourlyTTL = Math.ceil((info.hourlyReset - now) / 1000);
    const dailyTTL = Math.ceil((info.dailyReset - now) / 1000);
    
    await this.cache.set(hourlyKey, { count: info.hourlyCount, reset: info.hourlyReset }, hourlyTTL * 1000);
    await this.cache.set(dailyKey, { count: info.dailyCount, reset: info.dailyReset }, dailyTTL * 1000);
  }
}
