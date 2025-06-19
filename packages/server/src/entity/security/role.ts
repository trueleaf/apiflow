import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';
@modelOptions({
  schemaOptions: { timestamps: true, collection: 'security_role' },
})
export class Role extends Timestamps {
  /**
   * 角色名称
   */
  @prop()
  public roleName: string;
  /**
   * 前端路由
   */
  @prop({ type: () => [String] })
  public clientRoutes: string[];
  /**
   * 前端菜单
   */
  @prop({ type: () => [String] })
  public clientBanner: string[];
  /**
   * 服务端路由
   */
  @prop({ type: () => [String] })
  public serverRoutes: string[];
  /**
   * 备注信息
   */
  @prop()
  public remark: string;
  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled: boolean;
}
