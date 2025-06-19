import { Rule, RuleType } from '@midwayjs/validate';
import { TableSearchParams } from '../common/common.dto.js';

/**
 * 新增前缀
 */
export class AddDocPrefixDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 前缀名称
   */
  @Rule(RuleType.string().required())
    name: string;
  /**
   * 前缀url
   */
  @Rule(RuleType.string().required())
    url: string;
}
/**
 * 删除前缀
 */
export class DeleteDocPrefix {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 前缀名称
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    ids: string[];
}
/**
 * 以列表形式获取前缀
 */
export class GetDocPrefixList extends TableSearchParams {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}

/**
 * 以枚举形式获取前缀
 */
export class GetDocPrefixEnum {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}

/**
 * 获取前缀信息
 */
export class GetDocPrefixInfo {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 前缀id
   */
  @Rule(RuleType.string().required())
    id: string;
}
/**
 * 修改前缀信息
 */
export class EditDocPrefix {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 前缀id
   */
  @Rule(RuleType.string().required())
    _id: string;
  /**
   * 前缀名称
   */
  @Rule(RuleType.string())
    name: string;
  /**
   * 前缀url
   */
  @Rule(RuleType.string())
    url: string[];
}
