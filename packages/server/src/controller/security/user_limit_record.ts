import {
  Inject,
  Controller,
  Get,
  Query,
  Body,
  Put,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserLimitRecordService } from '../../service/security/user_limit_record.js';
import { ReqSign } from '../../decorator/req_sign.decorator.js';
import { ReqLimit } from '../../decorator/req_limit.decorator.js';

@Controller('/api')
export class UserLimitRecordController {
  @Inject()
    ctx: Context;
  @Inject()
    userLimitRecordService: UserLimitRecordService;

  /**
   * 获取用户限制记录列表
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60, max: 10, errorMsg: '1分钟内最多查询10次' })
  @Get('/security/user_limit_records')
  async getUserLimitRecords(@Query() params: {
    page: number;
    pageSize: number;
    limitType?: 'user' | 'ip';
    userId?: string;
    ip?: string;
    isReleased?: boolean;
  }) {
    const data = await this.userLimitRecordService.getUserLimitRecords(params);
    return data;
  }

  /**
   * 获取用户限制记录详情
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60, max: 10, errorMsg: '1分钟内最多查询10次' })
  @Get('/security/user_limit_record/:id')
  async getUserLimitRecordById(@Query() params: { id: string }) {
    const data = await this.userLimitRecordService.getUserLimitRecordById(params.id);
    return data;
  }

  /**
   * 手动解除用户限制
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60, max: 5, errorMsg: '1分钟内最多操作5次' })
  @Put('/security/user_limit_record/release')
  async releaseUserLimit(@Body() params: { id: string }) {
    const data = await this.userLimitRecordService.releaseUserLimit(params.id);
    return data;
  }

  /**
   * 获取用户限制统计信息
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60, max: 10, errorMsg: '1分钟内最多查询10次' })
  @Get('/security/user_limit_stats')
  async getUserLimitStats() {
    const data = await this.userLimitRecordService.getUserLimitStats();
    return data;
  }
} 