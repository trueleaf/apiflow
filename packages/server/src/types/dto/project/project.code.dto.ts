import { Rule, RuleType } from '@midwayjs/validate';
import { TableSearchParams } from '../common/common.dto.js';

/**
 * 新增脚本代码
 */
export class AddProjectCodeDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 脚本名称
   */
  @Rule(RuleType.string().required())
    codeName: string;
  /**
   * 备注
   */
  @Rule(RuleType.string())
    remark: string;
  /**
   * 源码字符串
   */
  @Rule(RuleType.string().required().allow(''))
    code: string;
  /**
   * 是否公开
   */
  @Rule(RuleType.boolean().default(false).required())
    isPublic?: boolean;
}
/**
 * 修改项目脚本代码
 */
export class EditProjectCodeDto {
  /**
   * 脚本id
   */
  @Rule(RuleType.string().required())
    _id: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 脚本名称
   */
  @Rule(RuleType.string())
    codeName: string;
  /**
   * 备注
   */
  @Rule(RuleType.string())
    remark: string;
  /**
   * 源码字符串
   */
  @Rule(RuleType.string())
    code: string;
  /**
   * 是否公开
   */
  @Rule(RuleType.boolean().default(false))
    isPublic?: boolean;
}

/**
 * 删除脚本代码
 */
export class DeleteProjectCodeDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 需要删除id集合
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    ids: string;
}
/**
 * 获取脚本代码列表
 */
export class GetProjectCodeListDto extends TableSearchParams {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}
/**
 * 枚举方式获取脚本代码列表
 */
export class GetProjectCodeEnumDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}

