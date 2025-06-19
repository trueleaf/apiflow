import { modelOptions, prop } from '@typegoose/typegoose';


class FileValue {
  @prop()
  public name: string;
  @prop()
  public fileType: string;
  @prop()
  public path: string;
}
@modelOptions({
  schemaOptions: { timestamps: true, collection: 'project_variable' },
})
export class ProjectVariable {
  /**
   * 项目id
   */
  @prop()
  public projectId: string;
  /**
   * 变量名称
   */
  @prop()
  public name: string;
  /**
   * 变量类型
   */
  @prop({ enum: ["string","number","boolean","null","any","file"] })
  public type: string;
  /**
   * 变量值
   */
  @prop()
  public value: string;
  /**
   * 文件类型变量值
   */
  @prop({ type: () => [FileValue] })
    public fileValue: FileValue;
  /**
   * 创建者信息
   */
  @prop()
  public creator: string;
  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled: boolean;
}
