import { modelOptions, prop } from '@typegoose/typegoose';
import { Timestamps } from '../common/common.js';
@modelOptions({
  schemaOptions: { timestamps: true, collection: 'security_users' },
})
export class User extends Timestamps {
  /**
   * 用户名称(登录名称)
   */
  @prop()
  public loginName: string;
  /**
   * 加密盐
   */
  @prop()
  public salt: string;
  /**
   * 密码
   */
  @prop()
  public password: string;
  /**
   * 登录次数
   */
  @prop({ default: 0 })
  public loginTimes: number;
  /**
   * 上次登录时间
   */
  @prop()
  public lastLogin: Date;
  /**
   * 角色id列表
   */
  @prop({ type: () => [String], default: [] })
    public roleIds?: string[];
  /**
   * 角色名称，仅供前端显示方便，避免一次查询
   */
  @prop({ type: () => [String], default: [] })
  public roleNames?: string[];
  /**
   * 前端路由，权限管理时候进行修改避免用户登录时多次查询
   */
  @prop({ type: () => [String], default: [] })
  public clientRoutes?: string[];
  /**
   * 前端菜单，权限管理时候进行修改避免用户登录时多次查询
   */
  @prop({ type: () => [String], default: [] })
  public clinetMenus?: string[];
  /**
   * 后端路由，权限管理时候进行修改避免用户登录时多次查询
   */
  @prop({ type: () => [String], default: [] })
  public serverRoutes?: string[];
  /**
   * 最近访问的项目id集合
   */
  @prop({ type: () => [String], default: [] })
  public recentVisitProjects?: string[];
  /**
   * 收藏的项目id集合
   */
  @prop({ type: () => [String], default: [] })
  public starProjects?: string[];
  /**
   * 允许访问项目的id集合
   */
  @prop({ type: () => [String], default: [] })
  public couldVisitProjects?: string[];
  /**
   * 是否允许被邀请到项目或组
   */
  @prop({ default: false })
  public isAllowInvite: boolean;
  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled?: boolean;
  /**
   * 邮箱地址
   */
  @prop({ unique: true, sparse: true })
  public email?: string;
}
