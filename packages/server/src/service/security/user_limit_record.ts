import { Provide, Inject, Context } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { UserLimitRecord } from '../../entity/security/user_limit_record.js';
import { LoginTokenInfo } from '../../types/types.js';
import { TableResponseWrapper } from '../../types/response/common/common.js';

@Provide()
export class UserLimitRecordService {
  @InjectEntityModel(UserLimitRecord)
    userLimitRecordModel: ReturnModelType<typeof UserLimitRecord>;
  @Inject()
    ctx: Context & { tokenInfo: LoginTokenInfo };

  /**
   * 获取用户限制记录列表
   */
  async getUserLimitRecords(params: {
    page: number;
    pageSize: number;
    limitType?: 'user' | 'ip';
    userId?: string;
    ip?: string;
    isReleased?: boolean;
  }) {
    const { page, pageSize, limitType, userId, ip, isReleased } = params;
    const skip = (page - 1) * pageSize;
    
    const filter: any = {};
    if (limitType) filter.limitType = limitType;
    if (userId) filter.userId = userId;
    if (ip) filter.ip = ip;
    if (isReleased !== undefined) filter.isReleased = isReleased;

    const [records, total] = await Promise.all([
      this.userLimitRecordModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.userLimitRecordModel.countDocuments(filter)
    ]);

    return {
      rows: records,
      total
    } as TableResponseWrapper<UserLimitRecord>;
  }

  /**
   * 获取用户限制记录详情
   */
  async getUserLimitRecordById(id: string) {
    const record = await this.userLimitRecordModel.findById(id).lean();
    if (!record) {
      throw new Error('限制记录不存在');
    }
    return record;
  }

  /**
   * 手动解除用户限制
   */
  async releaseUserLimit(id: string) {
    const record = await this.userLimitRecordModel.findById(id);
    if (!record) {
      throw new Error('限制记录不存在');
    }
    
    record.isReleased = true;
    await record.save();
    
    return record;
  }

  /**
   * 检查用户是否被限制
   */
  async checkUserLimit(userId?: string, ip?: string): Promise<{
    isLimited: boolean;
    record?: UserLimitRecord;
  }> {
    const filter: any = {
      isReleased: false,
      endTime: { $gt: new Date() }
    };

    if (userId) {
      filter.$or = [
        { userId },
        { ip }
      ];
    } else if (ip) {
      filter.ip = ip;
    }

    const record = await this.userLimitRecordModel.findOne(filter).lean();
    
    return {
      isLimited: !!record,
      record
    };
  }

  /**
   * 获取用户限制统计信息
   */
  async getUserLimitStats() {
    const [
      totalRecords,
      activeRecords,
      userRecords,
      ipRecords
    ] = await Promise.all([
      this.userLimitRecordModel.countDocuments(),
      this.userLimitRecordModel.countDocuments({ 
        isReleased: false, 
        endTime: { $gt: new Date() } 
      }),
      this.userLimitRecordModel.countDocuments({ limitType: 'user' }),
      this.userLimitRecordModel.countDocuments({ limitType: 'ip' })
    ]);

    return {
      totalRecords,
      activeRecords,
      userRecords,
      ipRecords
    };
  }
} 