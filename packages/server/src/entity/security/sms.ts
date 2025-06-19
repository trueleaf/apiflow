import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';
@modelOptions({
  schemaOptions: { timestamps: true, collection: 'security_sms' },
})
export class Sms extends Timestamps {
  /**
   * 手机号
   */
  @prop()
  public phone: string;
  /**
   * 验证码
   */
  @prop()
  public smsCode: string;
}
