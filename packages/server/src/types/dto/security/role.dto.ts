import { Rule, RuleType } from '@midwayjs/validate';
import { TableSearchParams } from '../common/common.dto.js';

/**
 * 新增角色
 */
export class AddRoleDto {
  /**
   * 角色名称
   */
  @Rule(RuleType.string().required())
    roleName: string;
  /**
   * 客户端路由
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    clientRoutes: string[];
  /**
   * 客户端菜单
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    clientBanner: string[];
  /**
   * 服务端路由
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    serverRoutes: string[];
  /**
   * 备注信息
   */
  @Rule(RuleType.string())
    remark: string;
}

/**
 * 删除角色
 */
export class DeleteRoleDto {
  /**
   * 需要删除的路由id集合
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    ids: string[];
}
/**
 * 修改角色
 */
export class EditRoleDto {
  /**
   * 角色id
   */
  @Rule(RuleType.string())
    _id: string;
  /**
   * 角色名称
   */
  @Rule(RuleType.string())
    roleName: string;
  /**
   * 客户端路由
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    clientRoutes: string[];
  /**
   * 客户端菜单
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    clientBanner: string[];
  /**
   * 服务端路由
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    serverRoutes: string[];
  /**
   * 备注
   */
  @Rule(RuleType.string())
    remark: string;
}
/**
 * 获取角色列表
 */
export class GetRoleListDto extends TableSearchParams {}
/**
 * 根据id获取角色信息
 */
export class GetRoleInfoDto {
  /**
   * 角色id
   */
  @Rule(RuleType.string().required())
    _id: string;
}
