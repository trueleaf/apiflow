import { Rule, RuleType } from '@midwayjs/validate';
import { TableSearchParams } from '../common/common.dto.js';

/**
 * 新增服务端路由
 */
export class AddServerRouteDto {
  /**
   * 接口路径
   */
  @Rule(RuleType.string().required())
    path: string;
    /**
     * 请求方法
    */
  @Rule(RuleType.string().required())
    method: string;
  /**
    * 名称
    */
  @Rule(RuleType.string().required())
    name: string;
  /**
   * 分组名称
   */
  @Rule(RuleType.string())
    groupName: string;
}
/**
 * 修改服务端路由
 */
export class EditServerRouteDto {
  /**
   * 路由id信息
   */
  @Rule(RuleType.string().required())
    _id: string;
  /**
   * 接口路径
   */
  @Rule(RuleType.string())
    path: string;
    /**
     * 请求方法
    */
  @Rule(RuleType.string())
    method: string;
   /**
    * 名称
    */
   @Rule(RuleType.string())
     name: string;
  /**
   * 分组名称
   */
  @Rule(RuleType.string())
    groupName: string;
}
/**
 * 删除服务端路由
 */
export class DeleteServerRouteDto {
  /**
   * 需要删除的路由id集合
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    ids: string[];
}
/**
 * 批量修改路由分组信息
 */
export class ChangeGroupNameByIdsDto {
  /**
   * 需要修改的路由id集合
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    ids: string[];
  /**
   * 分组名称
   */
  @Rule(RuleType.string())
    groupName: string;
}
/**
 * 以列表形式获取服务端路由
 */
export class GetServerRoutesListDto extends TableSearchParams {
  /**
   * 路由path
   */
  @Rule(RuleType.string())
    path?: string;
}
