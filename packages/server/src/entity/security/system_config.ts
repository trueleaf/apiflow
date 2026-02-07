import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';
@modelOptions({
  schemaOptions: { timestamps: true, collection: 'system_config' },
})
export class SystemConfig extends Timestamps {
  // 是否启用一键创建账号并登录
  @prop({ default: true })
  public enableGuest: boolean;
  // 是否启用邮箱注册
  @prop({ default: true })
  public enableRegister: boolean;
}
