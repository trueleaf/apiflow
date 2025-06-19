import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';
@modelOptions({
  schemaOptions: { timestamps: true, collection: 'security_login_record' },
})
export class LoginRecord extends Timestamps {
  /**
   * 登录ip
   */
  @prop()
  public ip: string;
  /**
   * 登录次数
   */
  @prop({ default: 0 })
  public loginTimes: number;
  /**
   * userAgent
   */
  @prop()
  public userAgent: string;
}
