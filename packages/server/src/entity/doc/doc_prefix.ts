import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: { timestamps: true, collection: 'docs_service' },
})
export class DocPrefix {
  /**
   * 前缀名称
   */
  @prop()
  public name: string;
  /**
   * 前缀值
   */
  @prop()
  public url: string;
  /**
   * 项目id
   */
  @prop()
  public projectId: string;
  /**
   * 维护人名称
   */
  @prop()
  public maintainerName: string;
  /**
   * 维护人id
   */
  @prop()
  public maintainerId: string;
  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled: boolean;
}
