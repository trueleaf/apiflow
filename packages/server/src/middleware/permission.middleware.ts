import { Middleware, IMiddleware, Config, ALL } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { GlobalConfig, LoginTokenInfo } from '../types/types.js';
import * as jwt from 'jsonwebtoken';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { User } from '../entity/security/user.js';
import { throwError } from '../utils/utils.js';
import { ServerRoutes } from '../entity/security/server_routes.js';
import { Role } from '../entity/security/role.js';

@Middleware()
export class PermissionMiddleware implements IMiddleware<Context, NextFunction> {
  @Config(ALL)
    config: GlobalConfig;
  @InjectEntityModel(User)
    userModel: ReturnModelType<typeof User>;
  @InjectEntityModel(Role)
    roleModel: ReturnModelType<typeof Role>;
  @InjectEntityModel(ServerRoutes)
    serverRoutesModel: ReturnModelType<typeof ServerRoutes>;
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // isFree 模式下仍需解析 JWT 以设置 ctx.tokenInfo，仅跳过权限表校验
      if (this.config.permission.isFree) {
        if (ctx.headers.authorization) {
          const tokenInfo = jwt.default.verify(
            ctx.headers.authorization,
            this.config.jwtConfig.secretOrPrivateKey
          ) as LoginTokenInfo;
          ctx.tokenInfo = tokenInfo;
        }
        return await next();
      }
      if (!ctx.headers.authorization) {
        return throwError(4100, '缺少Authorization认证头');
      }
      const tokenInfo = jwt.default.verify(
        ctx.headers.authorization,
        this.config.jwtConfig.secretOrPrivateKey
      ) as LoginTokenInfo;
      ctx.tokenInfo = tokenInfo;
      const urlWithoutQueryParams = ctx.request.url.replace(/\?.*$/g, '');
      const serverRouteInfoList: Pick<ServerRoutes, 'path' | 'method'>[] = []; //用户所拥有得权限列表
      const loginName = tokenInfo.loginName;
      const userInfo = await this.userModel.findOne({ loginName });
      const { roleIds } = userInfo;
      const allServerRoutes = await this.serverRoutesModel.find(
        {},
        { path: 1, method: 1 }
      );
      for (let i = 0; i < roleIds.length; i++) {
        const roleInfo = await this.roleModel.findOne({
          _id: roleIds[i],
          isEnabled: true
        });
        if (roleInfo) {
          roleInfo.serverRoutes.forEach(routeId => {
            const matchedRoute = allServerRoutes.find(routeInfo => {
              return routeInfo.id === routeId;
            });
            if (matchedRoute) {
              serverRouteInfoList.push({
                path: matchedRoute.path,
                method: matchedRoute.method,
              });
            }
          });
        }
      }
      if (serverRouteInfoList.every(routeInfo => routeInfo.path !== urlWithoutQueryParams)) {
        return throwError(4004, '暂无当前接口权限')
      }
      const reqMethod = ctx.request.method.toLowerCase();
      const hasPermission = serverRouteInfoList.find(routeInfo => {
        const isSameMethod = routeInfo.method.toLowerCase() === reqMethod;
        const isSamePath = routeInfo.path === urlWithoutQueryParams
        return isSameMethod && isSamePath;
      });
      if (!hasPermission) {
        return throwError(4100, '暂无权限')
      }
      const result = await next();
      return result;
    };
  }
  ignore(ctx: Context): boolean {
    return !!this.config.permission.whiteList.find(freeUrl => {
      // 支持通配符匹配
      if (freeUrl.endsWith('/**')) {
        const basePath = freeUrl.slice(0, -3);
        return ctx.path === basePath || ctx.path.startsWith(basePath + '/');
      } else if (freeUrl.endsWith('/*')) {
        const basePath = freeUrl.slice(0, -2);
        const remainingPath = ctx.path.slice(basePath.length);
        return ctx.path.startsWith(basePath + '/') && !remainingPath.slice(1).includes('/');
      } else {
        // 精确匹配或包含匹配
        return ctx.path.includes(freeUrl);
      }
    });
  }
  static getName(): string {
    return 'permissionMiddleware';
  }
}
