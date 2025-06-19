import { Rule, RuleType } from '@midwayjs/validate';
import { TableSearchParams } from '../common/common.dto.js';

/**
 * 新增项目
 */
export class AddProjectDto {
  /**
   * 项目名称
   */
  @Rule(RuleType.string().required())
    projectName: string;
  /**
   * 备注
   */
  @Rule(RuleType.string().empty(''))
    remark: string;
  /**
   * 成员列表
   */
  @Rule(RuleType.array().items(RuleType.object().keys({
    userId: RuleType.string(),
    userName: RuleType.string(),
    permission: RuleType.string().valid('readOnly', 'readAndWrite', 'admin'),
  })))
    users: {
      userId: string;
      userName: string;
      permission: 'readOnly' | 'readAndWrite' | 'admin';
    }[];
  /**
   * 组列表
   */
  @Rule(RuleType.array().items(RuleType.object().keys({
    groupId: RuleType.string(),
    groupName: RuleType.string(),
    groupUsers: RuleType.array().items(RuleType.object().keys({
      userId: RuleType.string(),
      userName: RuleType.string(),
      permission: RuleType.string().valid('readOnly', 'readAndWrite', 'admin'),
    }))
  })))
    groups: {
      groupId: string;
      groupName: string;
      groupUsers: []
    }[];
}
/**
 * 给项目添加成员
 */
export class AddMemberToProjectDto {
  /**
   * 成员id
   */
  @Rule(RuleType.string().required())
    id: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 成员名称
   */
  @Rule(RuleType.string().required())
    name: string;
  /**
   * 成员类型
   */
  @Rule(RuleType.string().valid('group', 'user'))
    type: 'group' | 'user';
  /**
   * 用户权限
   */
  @Rule(RuleType.string().valid('readOnly', 'readAndWrite', 'admin'))
    permission?: 'readOnly' | 'readAndWrite' | 'admin';
}
/**
 * 从项目中删除用户
 */
export class DeleteMemberFromProjectDto {
  /**
   * 成员id
   */
  @Rule(RuleType.string().required())
    id: string;
  /**
   * 成员类型
   */
  @Rule(RuleType.string().valid('group', 'user'))
    memberType: 'group' | 'user';
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}

/**
 * 删除项目
 */
export class DeleteProjectDto {
  /**
   * 项目id集合
   */
  @Rule(RuleType.array().items(RuleType.string()))
    ids: string[];
}
/**
 * 修改项目
 */
export class EditProjectDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    _id: string;
  /**
   * 项目名称
   */
  @Rule(RuleType.string())
    projectName: string;
  /**
   * 备注
   */
  @Rule(RuleType.string())
    remark: string;
}
/**
 * 改变用户在项目中的权限
 */
export class ChangeMemberPermissionInProjectDto {
  /**
   * 用户id
   */
  @Rule(RuleType.string().required())
    id: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 权限
   */
  @Rule(RuleType.string().valid('readOnly', 'readAndWrite', 'admin'))
    permission: string;
}

/**
 * 列表形式获取项目
 */
export class GetProjectListDto extends TableSearchParams {
  /**
   * 项目名称
   */
  @Rule(RuleType.string())
    projectName: string;
  // /**
  //  * 项目类型
  //  */
  // @Rule(RuleType.string())
  //   projectType: string;
}

/**
 * 根据id获取项目基本信息
 */
export class GetProjectInfoByIdDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    _id: string;
}
/**
 * 根据id获取项目完整信息
 */
export class GetProjectFullInfoByIdDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    _id: string;
}
/**
 * 根据id获取项目成员信息
 */
export class GetProjectMembersByIdDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    _id: string;
}
/**
 * 根据项目关键字过滤项目
 */
export class GetProjectByKeywordDto {
  /**
   * 项目关键字，接口url、备注、body参数等
   */
  @Rule(RuleType.string())
    keyword: string;
}
