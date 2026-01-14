import { modelOptions, prop, index } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';

@index({ email: 1, type: 1 })
@index({ expireAt: 1 }, { expireAfterSeconds: 0 })
@modelOptions({
  schemaOptions: { timestamps: true, collection: 'security_email_verify_codes' },
})
export class EmailVerifyCode extends Timestamps {
  /**
   * 邮箱地址
   */
  @prop({ required: true })
  public email: string;
  /**
   * 验证码
   */
  @prop({ required: true })
  public code: string;
  /**
   * 验证码类型：register-注册, login-登录, bind-绑定邮箱, reset-重置密码
   */
  @prop({ required: true, enum: ['register', 'login', 'bind', 'reset'] })
  public type: 'register' | 'login' | 'bind' | 'reset';
  /**
   * 是否已使用
   */
  @prop({ default: false })
  public isUsed: boolean;
  /**
   * 过期时间
   */
  @prop({ required: true })
  public expireAt: Date;
  /**
   * 发送的IP地址
   */
  @prop()
  public ip?: string;
}
