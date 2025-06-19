import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ResponseWrapperMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now()
      ctx.__logStartTime = startTime;
      const result = await next();
      ctx.logger.info(ctx.request.method, ctx.request.url, '耗时', Date.now() - startTime, ctx.origin);
      if (Buffer.isBuffer(result)) {
        return result
      }
      if (result?.isCustomError) {
        return result;
      }
      return {
        code: 0,
        msg: '操作成功',
        data: result,
      };
    };
  }
  static getName(): string {
    return 'responseWrapper';
  }
}
