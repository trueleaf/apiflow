import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: { timestamps: true, collection: 'project_code' },
})
export class ProjectCode {
  /**
   * 项目id
   */
  @prop()
  public projectId: string;
  /**
   * 代码名称
   */
  @prop()
  public codeName: string;
  /**
   * 备注信息
   */
  @prop()
  public remark: string;
  /**
   * 代码内容
   */
  @prop()
  public code: string;
  /**
   * 是否共享代码
   */
  @prop({ default: false })
  public isPublic: boolean;
  /**
   * 创建者
   */
  @prop()
  public creator: string;
  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled: boolean;
}
