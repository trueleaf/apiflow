import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: { timestamps: true, collection: 'project_share' },
})
export class ProjectShare {
  /**
   * 分享id
   */
  @prop()
  public shareId: string;
  /**
   * 项目id
   */
  @prop()
  public projectId: string;
  /**
   * 项目名称
   */
  @prop()
  public projectName: string;
  /**
   * 分享标题
   */
  @prop()
  public shareName: string;
  /**
   * 密码
   */
  @prop({ default: '' })
  public password: string;
  /**
   * 过期时间，时间戳
   */
  @prop()
  public expire: number;
  /**
   * 是否自定义过期日期
   */
  @prop({ default: false })
  public isCustomDate: boolean;
  /**
   * 允许用户查看的文档，如果没有当前字段则代表所有数据都允许查看
   */
  @prop({ type: () => [String] })
  public selectedDocs: string[];
  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled: boolean;
}
