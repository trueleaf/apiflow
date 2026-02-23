import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';
@modelOptions({
  schemaOptions: { timestamps: true, collection: 'system_config' },
})
export class SystemConfig extends Timestamps {
  // 是否启用一键创建账号并登录
  @prop({ default: false })
  public enableGuest: boolean;
  // 是否启用邮箱注册
  @prop({ default: false })
  public enableRegister: boolean;
  // 是否启用忘记密码
  @prop({ default: false })
  public enableForgotPassword: boolean;
}
