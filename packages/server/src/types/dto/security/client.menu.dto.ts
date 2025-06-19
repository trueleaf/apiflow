import { Rule, RuleType } from '@midwayjs/validate';

/**
 * 新增客户端菜单
 */
export class AddClientMenuDto {
  /**
   * 菜单名称
   */
  @Rule(RuleType.string().required())
    name: string;
  /**
   * 前端路由路径
   */
  @Rule(RuleType.string().required())
    path: string;
  /**
   * 菜单类型( inline前端自己路由  link外部链接 )
   */
  @Rule(RuleType.string().valid('link', 'inline'))
    type: 'link' | 'inline';
  /**
   * 父级菜单id
   */
  @Rule(RuleType.string().allow(''))
    pid: string;
}
/**
 * 修改客户端菜单
 */
export class EditClientMenuDto {
  /**
   * 菜单id
   */
  @Rule(RuleType.string().required())
    _id: string;
  /**
   * 菜单名称
   */
  @Rule(RuleType.string())
    name: string;
  /**
   * 前端跳转路径
   */
  @Rule(RuleType.string())
    path: string;
  /**
   * 菜单类型( inline前端自己路由  link外部链接 )
   */
  @Rule(RuleType.string().valid('link', 'inline'))
    type: 'link' | 'inline';
}
/**
 * 删除客户端菜单
 */
export class DeleteClientMenuDto {
  /**
   * 需要删除的菜单id集合
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    ids: string[];
}
/**
 * 改变菜单位置
 */
export class ChangeCLientMenuPositionDto {
  /**
   * 菜单id
   */
  @Rule(RuleType.string().required())
    _id: string;
  /**
   * 父级菜单id,如果传入则代表拖到父级菜单内部
   */
  @Rule(RuleType.string().allow(''))
    pid: string;
  /**
   * 排序值
   */
  @Rule(RuleType.number().required())
    sort: number;
}

