import { Rule, RuleType, getSchema } from '@midwayjs/validate';

class RequestMethod {
    /**
   * 允许请求参数类型
   */
    @Rule(RuleType.string().valid(
      'path',
      'params',
      'json',
      'x-www-form-urlencoded',
      'formData',
      'text/javascript',
      'text/plain',
      'text/html',
      'application/xml'
    ))
      enabledContenTypes:
      | 'path'
      | 'params'
      | 'json'
      | 'x-www-form-urlencoded'
      | 'formData'
      | 'text/javascript'
      | 'text/plain'
      | 'text/html'
      | 'application/xml';
    @Rule(RuleType.string())
      name: string;
    @Rule(RuleType.string())
      value: string;
    @Rule(RuleType.string())
      iconColor: string;
}

/**
 * 修改项目规则
 */
export class UpdateProjectRulesDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 单个目录限制文档个数
   */
  @Rule(RuleType.number())
    fileInFolderLimit: number;
  /**
   * 请求方法
   */
  @Rule(RuleType.array().items(getSchema(RequestMethod)))
    requestMethods: RequestMethod[];
}
/**
 * 根据项目id获取项目规则
 */
export class GetProjectRulesByIdDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}
