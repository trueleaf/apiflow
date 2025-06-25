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
import { User } from './entity/security/user.js';
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
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import * as staticFile from '@midwayjs/static-file';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = resolve(__dirname, 'config/config.local.js');
@Configuration({
  imports: [
    koa,
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
  @Inject()
    decoratorService: MidwayDecoratorService;
  @InjectClient(CachingFactory, 'default')
    cache: MidwayCache;
  @Config('signConfig')
    config: GlobalConfig['signConfig'];


  //接口限流
  async registerReqLimitDecorator() {
    this.decoratorService.registerMethodHandler(REQ_LIMIT_KEY, (options) => {
      return {
        around: async (joinPoint: JoinPoint) => {
          const { ttl, max, limitBy = 'user', limitExtraKey, errorMsg } = options.metadata as ReqLimit;
          const instance = joinPoint.target;
          const ctx = instance[REQUEST_OBJ_CTX_KEY] as koa.Context;
          const reqBody = ctx.request.body;
          let limitKey = '';
          if (limitBy === 'user') {
            limitKey = limitExtraKey ? `reqLimit:${reqBody[limitExtraKey]}${ctx.tokenInfo.id}` : `reqLimit:${ctx.tokenInfo.id}`;
          } else if (limitBy === 'ip') {
            limitKey = limitExtraKey ? `reqLimit:${reqBody[limitExtraKey]}${ctx.ip}` : `reqLimit:${ctx.ip}`;
          }
          const reqCount: number = await this.cache.get(limitKey) || 0;
          if (reqCount >= max) {
            return throwError(4029, errorMsg ?? '接口调用过于频繁')
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
          const requestSign = target.ctx.headers['x-sign'] as string;
          if (!requestSign) {
            return throwError(4002, '接口签名验证不通过');
          }
          const method = target.ctx.request.method.toLowerCase();
          const parsedUrlInfo = parseUrl(target.ctx.url);
          const url = parsedUrlInfo.url;
          const strParams = getStrParams(Object.assign({}, parsedUrlInfo.queryParams, target.ctx.query));
          const body = target.ctx.request.body;
          const timestamp = target.ctx.headers['x-sign-timestamp'] as string;
          const nonce = target.ctx.headers['x-sign-nonce'] as string;
          const signHeaders = target.ctx.headers['x-sign-headers'] as string;
          const originSignContent = target.ctx.headers['x-sign'] as string;
          const strBody = await getStrJsonBody(body);
          const arrSignHeaders = signHeaders.split(',');
          const objectHeader = arrSignHeaders.map((key: string) => {
            return {
              [key.toLowerCase()]: target.ctx.headers[key.toLowerCase()] as string
            }
          }).reduce((prev, next) => {
            return {
              ...prev,
              ...next
            }
          }
          , {});
          const { strHeader } = getStrHeader(objectHeader);
          const signContent = `${method}\n${url}\n${strParams}\n${strBody}\n${strHeader}\n${timestamp}\n${nonce}`;
          const hashedContent = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(signContent));
          const strHashedContent = getHashedContent(hashedContent);
          // console.log(signContent, strHashedContent, body, strBody)
          if (strHashedContent !== originSignContent) {
            return throwError(4002, '接口签名验证不通过');
          }
          if (Date.now() - Number(timestamp) > this.config.ttl) {
            return throwError(4002, '接口调用已过期');
          }
          // console.log(1, signContent, strHashedContent)
          const result = await joinPoint.proceed(...joinPoint.args);
          return result;
        },
      };
    });
  }
  async onReady() {
    this.app.useMiddleware([ResponseWrapperMiddleware, PermissionMiddleware]);
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
