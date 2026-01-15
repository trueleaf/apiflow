// 加载环境变量（必须在配置导入之前）
import { config as dotenvConfig } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
dotenvConfig({ path: resolve(process.cwd(), '.env') });
dotenvConfig({ path: resolve(process.cwd(), '../../.env'), override: false });

import { Configuration, App, Inject, MidwayDecoratorService, JoinPoint, REQUEST_OBJ_CTX_KEY, Config, IMidwayContainer, InjectClient, MidwayConfig } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as typegoose from '@midwayjs/typegoose';
import * as upload from '@midwayjs/upload';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectEntityModel } from '@midwayjs/typegoose';
import {
  AllServerErrorFilter,
  ValidateErrorFilter,
} from './filter/error.filter.js';
import { ResponseWrapperMiddleware } from './middleware/response.middleware.js';
import { PermissionMiddleware } from './middleware/permission.middleware.js';
import { LLMRateLimitMiddleware } from './middleware/llm-rate-limit.middleware.js';
import { User } from './entity/security/user.js';
import { UserLimitRecord } from './entity/security/user_limit_record.js';
import { initClientMenus, initClientRoutes, initRoles, initServerRoutes, initUser } from './entity/init_entity.js';
import { ServerRoutes } from './entity/security/server_routes.js';
import { ClientRoutes } from './entity/security/client_routes.js';
import { Attachment } from './entity/attachment/attachment.js';
import { Role } from './entity/security/role.js';
import { ClientMenu } from './entity/security/client_menu.js';
import * as crossDomain from '@midwayjs/cross-domain';
import DefaultConfig from './config/config.default.js';
import UnittestConfig from './config/config.unittest.js';
import { REQ_LIMIT_KEY } from './decorator/req_limit.decorator.js';
import { GlobalConfig, ReqLimit } from './types/types.js';
import * as cacheManager from '@midwayjs/cache-manager';
import { REQ_SIGN_KEY } from './decorator/req_sign.decorator.js';
import { getHashedContent, getStrHeader, getStrJsonBody, getStrParams, parseUrl, throwError } from './utils/utils.js';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import * as staticFile from '@midwayjs/static-file';
import * as ws from '@midwayjs/ws';

const __dirname = dirname(fileURLToPath(import.meta.url));
@Configuration({
  imports: [
    koa,
    ws,
    crossDomain,
    upload,
    validate,
    typegoose,
    staticFile,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    cacheManager
  ],
  importConfigs: [{
    default: DefaultConfig,
    unittest: UnittestConfig,
  },],
})
export class ContainerLifeCycle {
  @App()
    app: koa.Application;
  @InjectEntityModel(User)
    userModel: ReturnModelType<typeof User>;
  @InjectEntityModel(ServerRoutes)
    serverRoutesModel: ReturnModelType<typeof ServerRoutes>;
  @InjectEntityModel(ClientRoutes)
    clientRoutesModel: ReturnModelType<typeof ClientRoutes>;
  @InjectEntityModel(Role)
    roleModel: ReturnModelType<typeof Role>;
  @InjectEntityModel(ClientMenu)
    clientMenuModel: ReturnModelType<typeof ClientMenu>;
  @InjectEntityModel(Attachment)
    attachmentModel: ReturnModelType<typeof Attachment>;
  @InjectEntityModel(UserLimitRecord)
    userLimitRecordModel: ReturnModelType<typeof UserLimitRecord>;
  @Inject()
    decoratorService: MidwayDecoratorService;
  @InjectClient(CachingFactory, 'default')
    cache: MidwayCache;
  @Config('signConfig')
    config: GlobalConfig['signConfig'];
  @Config('rateLimitConfig')
    rateLimitConfig: GlobalConfig['rateLimitConfig'];

  //接口限流
  async registerReqLimitDecorator() {
    this.decoratorService.registerMethodHandler(REQ_LIMIT_KEY, (options) => {
      return {
        around: async (joinPoint: JoinPoint) => {
          const { ttl, max, limitBy = 'user', limitExtraKey, errorMsg, enableGlobalLimit } = options.metadata as ReqLimit;
          // 本地(local)环境下把 max 扩大 100 倍以方便本地调试，仅限 local
          const effectiveMax = process.env.NODE_ENV === 'local' && typeof max === 'number' ? max * 100 : max;
          const instance = joinPoint.target;
          const ctx = instance[REQUEST_OBJ_CTX_KEY] as koa.Context;
          const reqBody = ctx.request.body;
          
          let limitKey = '';
          let globalLimitKey = '';
          let userId = '';
          let ip = '';
          
          if (limitBy === 'user') {
            userId = ctx.tokenInfo?.id || '';
            limitKey = limitExtraKey ? `reqLimit:${reqBody[limitExtraKey]}${userId}` : `reqLimit:${userId}`;
            globalLimitKey = limitExtraKey ? `globalLimit:${reqBody[limitExtraKey]}${userId}` : `globalLimit:${userId}`;
          } else if (limitBy === 'ip') {
            ip = ctx.ip;
            limitKey = limitExtraKey ? `reqLimit:${reqBody[limitExtraKey]}${ip}` : `reqLimit:${ip}`;
            globalLimitKey = limitExtraKey ? `globalLimit:${reqBody[limitExtraKey]}${ip}` : `globalLimit:${ip}`;
          }

          // 检查是否已被禁用
          const banKey = `ban:${limitKey}`;
          const isBanned = await this.cache.get(banKey);
          if (isBanned) {
            return throwError(4030, '您的账户已被临时禁用，请稍后再试');
          }

          const reqCount: number = await this.cache.get(limitKey) || 0;
          const globalReqCount: number = await this.cache.get(globalLimitKey) || 0;
          
          // 检查是否超过单次限制（使用 effectiveMax）
          if (reqCount >= effectiveMax) {
            await this.cache.set(globalLimitKey, globalReqCount + 1, ttl);
            return throwError(4029, errorMsg ?? '接口调用过于频繁');
          }

          // 检查是否启用全局限制功能
          const shouldCheckGlobalLimit = enableGlobalLimit !== false && this.rateLimitConfig.enableGlobalLimit;
          if (shouldCheckGlobalLimit) {
            // 获取全局限制的请求次数
            if (globalReqCount >= this.rateLimitConfig.globalMaxRequests) {
              // 创建禁用记录
              const banStartTime = new Date();
              const banEndTime = new Date(banStartTime.getTime() + this.rateLimitConfig.banDuration);
              
              const limitRecord = new this.userLimitRecordModel({
                userId: limitBy === 'user' ? userId : undefined,
                ip: limitBy === 'ip' ? ip : undefined,
                limitType: limitBy,
                reason: `在${Math.ceil(ttl / 60000)}分钟内请求次数超过${this.rateLimitConfig.globalMaxRequests}次`,
                startTime: banStartTime,
                endTime: banEndTime,
                triggerCount: globalReqCount + 1,
                timeWindow: ttl,
                maxRequests: this.rateLimitConfig.globalMaxRequests,
                limitExtraKey,
                limitExtraValue: limitExtraKey ? reqBody[limitExtraKey] : undefined,
              });
              
              await limitRecord.save();
              
              // 设置禁用缓存
              await this.cache.set(banKey, true, this.rateLimitConfig.banDuration);
              return throwError(4030, '您的账户已被临时禁用，请稍后再试');
            }
          }

          await this.cache.set(limitKey, reqCount + 1, ttl);
          const result = await joinPoint.proceed(...joinPoint.args);
          return result;
        },
      };
    });
  }
  //接口验签
  async registerReqSignDecorator() {
    this.decoratorService.registerMethodHandler(REQ_SIGN_KEY, () => {
      return {
        around: async (joinPoint: JoinPoint) => {
          const target = joinPoint.target;
          const ctx = target[REQUEST_OBJ_CTX_KEY] as koa.Context;
          const requestSign = ctx.headers['x-sign'] as string;
          if (!requestSign) {
            return throwError(4002, '接口签名验证不通过');
          }
          const method = ctx.request.method.toLowerCase();
          const parsedUrlInfo = parseUrl(ctx.url);
          const url = parsedUrlInfo.url;
          const strParams = getStrParams(Object.assign({}, parsedUrlInfo.queryParams, ctx.query as Record<string, string>));
          const body = ctx.request.body;
          const timestamp = ctx.headers['x-sign-timestamp'] as string;
          const nonce = ctx.headers['x-sign-nonce'] as string;
          const signHeaders = ctx.headers['x-sign-headers'] as string;
          const originSignContent = ctx.headers['x-sign'] as string;
          const strBody = await getStrJsonBody(body as Record<string, string>);
          const arrSignHeaders = signHeaders.split(',');
          const objectHeader = arrSignHeaders.map((key: string) => {
            return {
              [key.toLowerCase()]: ctx.headers[key.toLowerCase()] as string
            }
          }).reduce((prev, next) => {
            return {
              ...prev,
              ...next
            }
          }
          , {} as Record<string, string>);
          const { strHeader } = getStrHeader(objectHeader);
          const signContent = `${method}\n${url}\n${strParams}\n${strBody}\n${strHeader}\n${timestamp}\n${nonce}`;
          const hashedContent = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(signContent));
          const strHashedContent = getHashedContent(hashedContent);
          if (strHashedContent !== originSignContent) {
            return throwError(4002, '接口签名验证不通过');
          }
          if (Date.now() - Number(timestamp) > this.config.ttl) {
            return throwError(4002, '接口调用已过期');
          }
          // nonce去重防止重放攻击
          const nonceKey = `sign:nonce:${nonce}`;
          const nonceExists = await this.cache.get(nonceKey);
          if (nonceExists) {
            return throwError(4002, '重复的请求，请勿重复提交');
          }
          // 将nonce存入缓存，5分钟过期
          await this.cache.set(nonceKey, true, 5 * 60 * 1000);
          
          const result = await joinPoint.proceed(...joinPoint.args);
          return result;
        },
      };
    });
  }
  async onReady() {
    this.app.useMiddleware([LLMRateLimitMiddleware, ResponseWrapperMiddleware, PermissionMiddleware]);
    this.app.useFilter([ValidateErrorFilter, AllServerErrorFilter]);
    await initUser(this.userModel);
    await initServerRoutes(this.serverRoutesModel)
    await initClientRoutes(this.clientRoutesModel)
    await initRoles(this.roleModel)
    await initClientMenus(this.clientMenuModel)
    await this.registerReqLimitDecorator();
    await this.registerReqSignDecorator();
    // await initAttachment(this.attachmentModel)
  }
  async onConfigLoad(container: IMidwayContainer) {
    const remoteConfig = {} as MidwayConfig;
    try {
      const filePath = resolve(__dirname, 'config/config.local.js');
      const moduleUrl = new URL(`file:///${filePath.replace(/\\/g, '/')}`).href
      const config = await import(moduleUrl);
      Object.assign(remoteConfig, config.default)
      console.log('config.local.js加载成功');
    } catch (error) {
      console.log('config.local.js不存在，使用默认配置');
    }
    return remoteConfig;
  }
}
