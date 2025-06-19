import { modelOptions, prop } from '@typegoose/typegoose';

class ApidocRequestMethodRule {
  /**
   * 允许请求参数类型
   */
  @prop()
  public enabledContenTypes:
    | 'path'
    | 'params'
    | 'json'
    | 'x-www-form-urlencoded'
    | 'formData'
    | 'text/javascript'
    | 'text/plain'
    | 'text/html'
    | 'application/xml';
  @prop()
  public name: string;
  @prop()
  public value: string;
  @prop()
  public iconColor: string;
}

@modelOptions({
  schemaOptions: { timestamps: true, collection: 'project_rules' },
})
export class ProjectRules {
  /**
   * 项目id
   */
  @prop()
  public projectId: string;
  /**
   * 单个文件夹默认限制文件个数
   */
  @prop({ max: 255 })
  public fileInFolderLimit: number;
  /**
   * 请求方法
   */
  @prop({ type: () => [ApidocRequestMethodRule] })
  public requestMethods: ApidocRequestMethodRule[];
  /**
   * 是否启用
   */
  @prop({ default: true })
  public isEnabled: boolean;
}
