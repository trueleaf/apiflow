import { Catch, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ResponseWrapper } from '../types/response/common/common.js';
import { MidwayValidationError } from '@midwayjs/validate';
import { MultipartInvalidFilenameError } from '@midwayjs/upload';
import jwt from 'jsonwebtoken';

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  async catch(err: MidwayValidationError, ctx: Context): Promise<ResponseWrapper> {
    const logStartTime = ctx.__logStartTime || Date.now();
    ctx.logger.error(ctx.request.method, ctx.request.url, '耗时', Date.now() - logStartTime, ctx.origin, err.stack);
    return {
      code: 1001,
      msg: `校验参数错误${err.message}`,
    };
  }
}
@Catch()
export class AllServerErrorFilter {
  async catch(err: MidwayHttpError & { isCustomError?: boolean }, ctx: Context) {
    const logStartTime = ctx.__logStartTime || Date.now();
    ctx.logger.error(ctx.request.method, ctx.request.url, '耗时', Date.now() - logStartTime, ctx.origin);
    if (err?.isCustomError) {
      return err;
    }
    if (err instanceof MultipartInvalidFilenameError) {
      return {
        code: 5000,
        msg: `附件格式错误`,
      };
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return {
        code: 4100,
        msg: `登录已过期`,
      };
    }
    return {
      code: 5000,
      msg: `内部错误：${err.message}`,
    };
  }
}
