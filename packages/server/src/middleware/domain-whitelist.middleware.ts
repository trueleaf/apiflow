import { Middleware, Config } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { throwError } from '../utils/utils.js';

@Middleware()
export class DomainWhitelistMiddleware {
  @Config('llmDomainWhitelist')
  domainWhitelist: string[];

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      if (!ctx.path.startsWith('/api/llm/')) {
        return await next();
      }
      const origin = ctx.get('origin');
      const referer = ctx.get('referer');
      if (!origin && !referer) {
        return throwError(10030, '域名不在白名单中');
      }
      const originDomain = this.extractDomain(origin);
      const refererDomain = this.extractDomain(referer);
      const isAllowed = 
        (originDomain && this.isDomainAllowed(originDomain)) ||
        (refererDomain && this.isDomainAllowed(refererDomain));
      if (!isAllowed) {
        return throwError(10030, '域名不在白名单中');
      }
      await next();
    };
  }
  // 从URL中提取域名
  private extractDomain(url: string): string | null {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  }
  // 检查域名是否在白名单中
  private isDomainAllowed(domain: string): boolean {
    return this.domainWhitelist.some(allowedDomain => {
      if (domain === allowedDomain) return true;
      if (domain.endsWith(`.${allowedDomain}`)) return true;
      return false;
    });
  }
}
