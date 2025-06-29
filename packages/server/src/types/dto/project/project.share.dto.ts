import { Rule, RuleType } from '@midwayjs/validate';
import { TableSearchParams } from '../common/common.dto.js';

//生成在线链接
export class GenerateSharedProjectLinkDto {
  /**
   * 链接名称
   */
  @Rule(RuleType.string().required())
    shareName: string;
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 密码
   */
  @Rule(RuleType.string().allow(''))
    password: string;
  /**
   * 过期时间
   */
  @Rule(RuleType.number())
    maxAge: number;
  /**
   * 是否自定义过期日期
   */
  @Rule(RuleType.boolean())
    isCustomDate: boolean;
  /**
   * 被选中的节点
   */
  @Rule(RuleType.array().items(RuleType.string()))
    selectedDocs: string[];
}

//修改在线链接基本信息
export class EditSharedProjectLinkDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 链接id
   */
  @Rule(RuleType.string().required())
    _id: string;
  /**
   * 链接名称
   */
  @Rule(RuleType.string())
    shareName: string;
  /**
   * 密码
   */
  @Rule(RuleType.string().allow(''))
    password: string;
  /**
   * 过期时间
   */
  @Rule(RuleType.number())
    maxAge: number;
  /**
   * 是否自定义过期日期
   */
  @Rule(RuleType.boolean())
    isCustomDate: boolean;
  /**
   * 被选中的节点
   */
  @Rule(RuleType.array().items(RuleType.string()))
    selectedDocs: string[];
}

//分页获取在线链接列表
export class GetSharedProjectLinkListDto extends TableSearchParams {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}

//删除在线链接
export class DeleteSharedProjectLinkDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
  /**
   * 在线链接id
   */
  @Rule(RuleType.string().required())
    _id: string;
}

//根据分享id获取分享项目链接基本信息
export class GetSharedLinkInfoDto {
  /**
   * 随机生成在线链接id
   */
  @Rule(RuleType.string().required())
    shareId: string;
}

//分享链接密码校验
export class CheckOnlineProjectPasswordDto {
  /**
   * 随机生成在线链接id
   */
  @Rule(RuleType.string().required())
    shareId: string;
  /**
   * 密码
   */
  @Rule(RuleType.string())
    password?: string;
}

//根据id和密码获取分享文档的banner信息
export class GetSharedProjectBannerDto {
  /**
   * 随机生成在线链接id
   */
  @Rule(RuleType.string().required())
    shareId: string;
  /**
   * 密码
   */
  @Rule(RuleType.string())
    password?: string;
}

//获取分享项目基本信息
export class GetSharedProjectInfoDto {
  /**
   * 随机生成在线链接id
   */
  @Rule(RuleType.string().required())
    shareId: string;
  /**
   * 密码
   */
  @Rule(RuleType.string())
    password?: string;
}

//获取分享项目基本信息
export class GetSharedDocDetailDto {
  /**
   * 在线链接id
   */
  @Rule(RuleType.string().required())
    _id: string;
  /**
   * 随机生成在线链接id
   */
  @Rule(RuleType.string().required())
    shareId: string;
  /**
   * 密码
   */
  @Rule(RuleType.string())
    password?: string;
}

//分享密码校验
export class VerifySharePasswordDto {
  /**
   * 随机生成在线链接id
   */
  @Rule(RuleType.string().required())
    shareId: string;
  /**
   * 密码
   */
  @Rule(RuleType.string().required())
    password: string;
}
