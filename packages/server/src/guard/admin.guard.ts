import { Config, Guard, IGuard } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import jwt from 'jsonwebtoken';
import { ADMIN_ROLE_ID, Role } from '../entity/security/role.js';
import { User } from '../entity/security/user.js';
import { GlobalConfig, LoginTokenInfo } from '../types/types.js';
import { throwError } from '../utils/utils.js';

@Guard()
export class AdminGuard implements IGuard<Context> {
  @Config('jwtConfig')
    jwtConfig: GlobalConfig['jwtConfig'];
  @InjectEntityModel(User)
    userModel: ReturnModelType<typeof User>;
  @InjectEntityModel(Role)
    roleModel: ReturnModelType<typeof Role>;

  // 根据当前账号状态和角色校验管理权限
  async canActivate(ctx: Context) {
    const token = ctx.headers.authorization;
    if (!token) {
      return throwError(4100, '缺少Authorization认证头');
    }
    const tokenInfo = ctx.tokenInfo ?? jwt.verify(token, this.jwtConfig.secretOrPrivateKey) as LoginTokenInfo;
    if (typeof tokenInfo.id !== 'string' || !/^[a-f\d]{24}$/i.test(tokenInfo.id)) {
      return throwError(4100, '登录已过期');
    }
    const user = await this.userModel.exists({ _id: tokenInfo.id, isEnabled: true, roleIds: ADMIN_ROLE_ID });
    if (!user || !(await this.roleModel.exists({ _id: ADMIN_ROLE_ID, isEnabled: true }))) {
      return throwError(4004, '暂无当前接口权限');
    }
    return true;
  }
}
