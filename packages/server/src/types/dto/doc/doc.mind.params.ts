import { Rule, RuleType, getSchema } from '@midwayjs/validate';
import { TableSearchParams } from '../common/common.dto.js';

class BaseProperty {
  /**
   * 参数所属项目id
   */
  @Rule(RuleType.string().allow(''))
    projectId: string;
  /**
   * 字段id
   */
  @Rule(RuleType.string().allow(''))
    _id: string;
  /**
   * 字段名称
   */
  @Rule(RuleType.string().required().allow(''))
    key: string;
  /**
   * 字段类型
   */
  @Rule(RuleType.string().valid('string', 'number', 'boolean', 'array', 'object', 'file').required())
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file';
  /**
   * 字段描述
   */
  @Rule(RuleType.string().required().allow(''))
    description: string;
  /**
   * 是否必填
   */
  @Rule(RuleType.boolean())
  public required?: boolean;
  /**
   * 业务参数，是否选中
   */
  @Rule(RuleType.boolean())
  public select?: boolean;
  /**
   * 字段值
   */
  @Rule(RuleType.string().required().allow(''))
    value: string;
  /**
   * 参数位置
   */
  @Rule(RuleType.string().valid('paths', 'queryParams', 'requestBody', 'responseParams').required())
    paramsPosition: 'paths' | 'queryParams' | 'requestBody' | 'responseParams';
  /**
   * 是否启用
   */
  @Rule(RuleType.boolean())
    isEnabled: boolean;
}
/**
 * 新增文档联想参数
 */
export class AddDocMindParamsDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 联想参数
   */
  @Rule(RuleType.array().items(getSchema(BaseProperty)).required())
    mindParams: BaseProperty[];
}
/**
 * 删除文档联想参数
 */
export class DeleteDocMindParams {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 文档联想参数名称
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    ids: string[];
}
/**
 * 以列表形式获取文档联想参数
 */
export class GetDocMindParamsList extends TableSearchParams {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}
