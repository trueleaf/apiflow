import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';
@modelOptions({
  schemaOptions: { timestamps: true, collection: 'security_client_routes' },
})
export class ClientRoutes extends Timestamps {
  /**
   * 路由名称
   */
  @prop()
  public name: string;
  /**
   * 路由地址
   */
  @prop()
  public path: string;
  /**
   * 分组名称，仅用于前端分组无其他实际意义
   */
  @prop()
  public groupName: string;
  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled: boolean;
}
