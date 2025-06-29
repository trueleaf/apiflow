import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';

@modelOptions({
  schemaOptions: { timestamps: true, collection: 'security_user_limit_records' },
})
export class UserLimitRecord extends Timestamps {
  /**
   * 用户ID（如果是用户限制）
   */
  @prop()
  public userId?: string;

  /**
   * IP地址（如果是IP限制）
   */
  @prop()
  public ip?: string;

  /**
   * 限制类型：user | ip
   */
  @prop({ required: true })
  public limitType: 'user' | 'ip';

  /**
   * 限制原因
   */
  @prop({ required: true })
  public reason: string;

  /**
   * 限制开始时间
   */
  @prop({ required: true })
  public startTime: Date;

  /**
   * 限制结束时间
   */
  @prop({ required: true })
  public endTime: Date;

  /**
   * 是否已解除限制
   */
  @prop({ default: false })
  public isReleased: boolean;

  /**
   * 触发限制时的请求次数
   */
  @prop({ required: true })
  public triggerCount: number;

  /**
   * 限制时间窗口（毫秒）
   */
  @prop({ required: true })
  public timeWindow: number;

  /**
   * 最大允许请求次数
   */
  @prop({ required: true })
  public maxRequests: number;

  /**
   * 额外限制键（如果有）
   */
  @prop()
  public limitExtraKey?: string;

  /**
   * 额外限制值（如果有）
   */
  @prop()
  public limitExtraValue?: string;
} 