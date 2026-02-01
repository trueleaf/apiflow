import { Provide, InjectClient, Logger } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { UserLimitRecord } from '../../entity/security/user_limit_record.js';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class UserLimitCleanupService {
  @InjectEntityModel(UserLimitRecord)
    userLimitRecordModel: ReturnModelType<typeof UserLimitRecord>;
  @InjectClient(CachingFactory, 'default')
    cache: MidwayCache;
  @Logger()
    logger: ILogger;

  /**
   * 清理过期的限制记录
   */
  async cleanupExpiredRecords() {
    const now = new Date();
    
    // 查找所有已过期的记录
    const expiredRecords = await this.userLimitRecordModel.find({
      endTime: { $lt: now },
      isReleased: false
    }).lean();

    // 批量更新过期记录为已释放状态
    if (expiredRecords.length > 0) {
      await this.userLimitRecordModel.updateMany(
        {
          endTime: { $lt: now },
          isReleased: false
        },
        {
          $set: { isReleased: true }
        }
      );

      // 清理相关的缓存
      for (const record of expiredRecords) {
        const cacheKey = this.generateCacheKey(record);
        await this.cache.del(cacheKey);
      }

      this.logger.info(`清理了 ${expiredRecords.length} 条过期的用户限制记录`);
    }

    return {
      cleanedCount: expiredRecords.length
    };
  }

  /**
   * 清理过期的缓存
   */
  async cleanupExpiredCache() {
    // 这里可以添加清理过期缓存的逻辑
    // 由于缓存本身有TTL，大部分情况下不需要手动清理
    this.logger.info('缓存清理完成');
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(record: UserLimitRecord): string {
    if (record.limitType === 'user' && record.userId) {
      return `ban:reqLimit:${record.userId}`;
    } else if (record.limitType === 'ip' && record.ip) {
      return `ban:reqLimit:${record.ip}`;
    }
    return '';
  }

  /**
   * 获取清理统计信息
   */
  async getCleanupStats() {
    const now = new Date();
    
    const [
      totalExpired,
      totalActive,
      totalReleased
    ] = await Promise.all([
      this.userLimitRecordModel.countDocuments({
        endTime: { $lt: now },
        isReleased: false
      }),
      this.userLimitRecordModel.countDocuments({
        endTime: { $gt: now },
        isReleased: false
      }),
      this.userLimitRecordModel.countDocuments({
        isReleased: true
      })
    ]);

    return {
      totalExpired,
      totalActive,
      totalReleased
    };
  }
} 