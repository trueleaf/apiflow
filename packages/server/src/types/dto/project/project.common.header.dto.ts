import { Rule, RuleType, getSchema } from '@midwayjs/validate';

/**
 * 根据id获取某个请求头
 */
export class GetProjectCommonHeaderByIdDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
  /**
   * 文档id
   */
  @Rule(RuleType.string().required().allow(''))
  id: string;
}

class HeaderProperty {
  @Rule(RuleType.string().required())
  _id: string;
  @Rule(RuleType.string().required().allow(''))
  key: string;
  @Rule(RuleType.string().required().allow(''))
  value: string;
  @Rule(RuleType.string().required().allow(''))
  description: string;
  @Rule(RuleType.boolean())
  select?: boolean;
}
/**
 * 新增或修改公共请求头
 */
export class UpsertProjectCommonHeaderDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
  /**
   * 文档或目录id
   */
  @Rule(RuleType.string().required())
  id: string;
  /**
   * 公共请求头
   */
  @Rule(RuleType.array().items(getSchema(HeaderProperty)))
  commonHeaders: HeaderProperty[];
}
/**
 * 新增获取修改全局公共请求头
 */
export class UpsertGlobalProjectCommonHeaderDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
  /**
  * 文档id
  */
  @Rule(RuleType.array().items(getSchema(HeaderProperty)).required())
  commonHeaders: HeaderProperty[];
}
/**
 * 获取所有公共请求头
 */
export class GetProjectCommonHeadersDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
}
export class GetGlobalProjectCommonHeadersDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
  projectId: string;
}
