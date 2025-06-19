import { Rule, RuleType } from '@midwayjs/validate';
import { TableSearchParams } from '../common/common.dto.js';

/**
 * 短信验证码DTO
 */
export class SMSDto {
  @Rule(RuleType.string().required())
    phone: string;
  @Rule(RuleType.string().required())
    captcha: string;
  @Rule(RuleType.string().required())
    clientKey: string;
}

/**
 * 图形验证码DTO
 */
export class SvgCaptchaDto {
  @Rule(RuleType.number().default(100))
    width: number;

  @Rule(RuleType.number().default(100))
    height: number;
}

/**
 * 手机号用户注册
 */

export class RegisterByPhoneDto {
  /**
   * 登录名称
   */
  @Rule(RuleType.string().required())
    loginName: string;
  /**
   * 密码
   */
  @Rule(RuleType.string().required())
    password: string;
  /**
   * 手机验证码
   */
  @Rule(RuleType.string().required())
    smsCode: string;
  /**
   * 手机号码(非必填)
   */
  @Rule(RuleType.string())
    phone?: string;
  /**
   * 昵称(非必填)
   */
  @Rule(RuleType.string())
    realName: string;
}
/**
 * 用户名加密码登录
 */
export class LoginByPasswordDto {
  /**
   * 登录名称
   */
  @Rule(RuleType.string().required())
    loginName: string;
  /**
   * 密码
   */
  @Rule(RuleType.string().required())
    password: string;
  /**
   * 验证码
   */
  @Rule(RuleType.string().allow(''))
    captcha?: string;
}

/**
 * 手机号码登录
 */
export class LoginByPhoneDto {
  /**
   * 手机号码
   */
  @Rule(RuleType.string().required())
    phone: string;
  /**
   * 验证码
   */
  @Rule(RuleType.string().required())
    smsCode: string;
}
/**
 * 修改用户密码
 */
export class ChangePasswordByUserDto {
  /**
   * 原密码
   */
  @Rule(RuleType.string().required())
    oldPassword: string;
  /**
   * 新密码
   */
  @Rule(RuleType.string().required())
    newPassword: string;
}

/**
 * 批量禁用用户
 */
export class DisableUserDto {
  /**
   * 用户id集合
   */
  @Rule(RuleType.array().items(RuleType.string()).required())
    ids: string[];
}
/**
 * 重置密码
 */
export class ResetPasswordDto {
  /**
   * 手机号
   */
  @Rule(RuleType.string().required())
    phone: string;
  /**
   * 短信验证码
   */
  @Rule(RuleType.string().required())
  smsCode: string;
  /**
   * 重置后的密码
   */
  @Rule(RuleType.string().min(6).required())
    password: string;
}
/**
 * 管理员重置密码
 */
export class ResetPasswordByAdminDto {
  /**
   * 用户id
   */
  @Rule(RuleType.string().required())
    userId: string;
  /**
   * 重置后的密码
   */
  @Rule(RuleType.string().min(6).required())
    password: string;
}
/**
 * 手动新增用户
 */
export class AddUserDto {
  /**
   * 登录名称
   */
  @Rule(RuleType.string().required())
    loginName: string;
  /**
   * 昵称
   */
  @Rule(RuleType.string().allow(''))
    realName: string;
  /**
   * 手机号码
   */
  @Rule(RuleType.string())
    phone: string;
  /**
   * 用户默认密码
   */
  @Rule(RuleType.string())
    password: string;
  /**
   * 角色id列表
   */
  @Rule(RuleType.array().items(RuleType.string()).min(1).error(new Error('请选择角色')))
    roleIds: string[];
  /**
   * 角色名称列表
   */
  @Rule(RuleType.array().items(RuleType.string()))
    roleNames: string[];
}
/**
 * 获取用户列表
 */
export class GetUserListDto extends TableSearchParams {
  /**
   * 登录名称
   */
  @Rule(RuleType.string().allow(''))
    loginName: string;
  /**
   * 昵称
   */
  @Rule(RuleType.string().allow(''))
    realName: string;
  /**
   * 手机号搜索
   */
  @Rule(RuleType.string())
    phone: string;
}
/**
 * 用户状态
 */
export class ChangeUserStateDto {
  /**
   * 用户id
   */
  @Rule(RuleType.string().required())
    _id: string;
  /**
   * 是否启用
   */
  @Rule(RuleType.boolean().required())
    isEnabled: boolean;
}
/**
 * 根据id获取用户信息
 */
export class GetUserInfoByIdDto {
  /**
   * 用户id
   */
  @Rule(RuleType.string().required())
    _id: string;
}
/**
 * 根据id获取用户信息
 */
export class GetUserListByNameDto {
  /**
   * 用户名称|昵称
   */
  @Rule(RuleType.string().empty(''))
    name: string;
}
/**
 * 改变用户权限
 */
export class ChangeUserInfoDto {
  /**
   * 用户id
   */
  @Rule(RuleType.string().required())
    _id: string;
  /**
   * 角色id列表
   */
  @Rule(RuleType.array().items(RuleType.string()))
    roleIds?: string[];
  /**
   * 角色名称列表
   */
  @Rule(RuleType.array().items(RuleType.string()))
    roleNames?: string[];
  /**
   * 登录名称
   */
  @Rule(RuleType.string())
    loginName?: string;
  /**
   * 手机号码
   */
  @Rule(RuleType.string())
    phone?: string;
  /**
   * 昵称
   */
  @Rule(RuleType.string())
    realName?: string;
}

/**
 * 添加最近访问页面
 */
export class AddLastVisitedDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}
/**
 * 收藏项目
 */
export class StarProjectDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}
/**
 * 取消收藏项目
 */
export class UnStarProjectDto {
  /**
   * 项目id
   */
  @Rule(RuleType.string().required())
    projectId: string;
}

