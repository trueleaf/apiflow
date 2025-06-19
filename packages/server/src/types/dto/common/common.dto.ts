import { Rule, RuleType } from '@midwayjs/validate';

export class TableSearchParams {
  /**
   * 页码
   */
  @Rule(RuleType.number())
    pageNum?: number;
  /**
   * 每页数量
   */
  @Rule(RuleType.number())
    pageSize?: number;
  /**
   * 开始日期
   */
  @Rule(RuleType.number())
    startTime?: number;
  /**
   * 结束日期
   */
  @Rule(RuleType.number())
    endTime?: number;
}
export class DocProperty {
  /**
   * 文档id
   */
  @Rule(RuleType.string().allow(''))
    _id: string;
  /**
   * 字段名称
   */
  @Rule(RuleType.string().allow(''))
    key: string;
  /**
   * 字段类型
   */
  @Rule(RuleType.string().allow(''))
    type: string;
  /**
   * 字段值
   */
  @Rule(RuleType.string().allow(''))
    value: string;
}
