import {
  Inject,
  Controller,
  Get,
  Post,
  Query,
  SetHeader,
  Body,
  Put,
  Files,
  InjectClient,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import {
  AddLastVisitedDto,
  AddUserDto,
  ChangePasswordByUserDto,
  ChangeUserInfoDto,
  ChangeUserStateDto,
  GetUserInfoByIdDto,
  GetUserListByNameDto,
  GetUserListDto,
  LoginByPasswordDto,
  LoginByPhoneDto,
  RegisterByPhoneDto,
  ResetPasswordByAdminDto,
  ResetPasswordDto,
  SMSDto,
  StarProjectDto,
  SvgCaptchaDto,
  UnStarProjectDto,
} from '../../types/dto/security/user.dto.js';
import { UserService } from '../../service/security/user.js';
import * as svgCaptcha from 'svg-captcha';
import { UploadFileInfo } from '@midwayjs/upload';
import {  throwError } from '../../utils/utils.js';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { nanoid } from 'nanoid';
import { ReqSign } from '../../decorator/req_sign.decorator.js';
import { ReqLimit } from '../../decorator/req_limit.decorator.js';

@Controller('/api')
export class UserController {
  @Inject()
    ctx: Context;
  @Inject()
    userService: UserService;
  @InjectClient(CachingFactory, 'default')
    cache: MidwayCache;
  /**
   * 获取手机验证码
   */
  @ReqSign()
  @Get('/security/sms')
  async getSMSCode(@Query() params: SMSDto) {
    const captcha: string = await this.cache.get(params.clientKey);
    if (!params.clientKey) {
      return throwError(4005, '请输入图形验证码')
    }
    if (!captcha) {
      return throwError(4005, '图形验证码已失效请重新获取')
    }
    if (captcha.toLowerCase() !== params.captcha.toLowerCase()) {
      return throwError(4005, '图形验证码错误')
    }
    const blockedKey = `sms:blocked:${params.phone}`;
    const countKey = `sms:count:${params.phone}`;
    const sendKey = `sms:send:${params.phone}`
    const dayLimitKey = `sms:dailySend:${params.phone}`
    const isBlock = await this.cache.get(blockedKey);
    const phoneCallCount: number = await this.cache.get(countKey) || 0;
    const isSend = await this.cache.get(sendKey);
    const dailySendCount: number = await this.cache.get(dayLimitKey);

    if (dailySendCount > 3) {
      this.cache.set(dayLimitKey, dailySendCount + 1, 1000 * 60 * 60 * 12);
      return throwError(4006, '短信验证码调用过于频繁')
    }


    if (isBlock && phoneCallCount > 10) {
      this.cache.set(blockedKey, true, 48 * 60 * 60 * 1000); // 封禁48小时
    }
    if (isBlock) {
      this.cache.set(countKey, phoneCallCount + 1, 1000 * 60 * 5);
      return throwError(4006, '短信验证码调用过于频繁')
    }
    if (phoneCallCount > 2) { //五分钟内调用超过2次，封禁12小时
      this.cache.set(blockedKey, true, 12 * 60 * 60 * 1000); // 12小时
      this.cache.set(countKey, phoneCallCount + 1, 1000 * 60 * 5);
      return throwError(4006, '短信验证码调用过于频繁')
    } 
    this.cache.set(countKey, phoneCallCount + 1, 1000 * 60 * 5);
    if (isSend) {
      return throwError(4006, '短信验证码调用过于频繁')
    }
    this.cache.set(sendKey, true, 1000 * 60 * 1);
    const data = await this.userService.getSMSCode(params);
    return data;
  }
  /**
   * 获取图形验证码
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60, max: 10, limitBy: 'ip' })
  @Get('/security/captcha')
  @SetHeader('content-type', 'image/svg+xml')
  async getSVGCaptcha(@Query() params: SvgCaptchaDto) {
    const captcha = svgCaptcha.create({
      width: params.width,
      height: params.height,
    });
    const key = nanoid();
    this.cache.set(key, captcha.text, 1000 * 60 * 5);
    this.ctx.set('x-client-key', key);
    return Buffer.from(captcha.data, 'utf-8');
  }
  /**
   * 手机号用户注册
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60 * 60, max: 30, limitBy: 'ip' })
  @Post('/security/register')
  async registerByPhone(@Body() params: RegisterByPhoneDto) {
    const data = await this.userService.registerByPhone(params);
    return data;
  }
  /**
   * 根据账号密码登录
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60 * 60, max: 10, limitBy: 'ip', limitExtraKey: 'loginName' })
  @Post('/security/login_password')
  async loginByPassword(@Body() params: LoginByPasswordDto) {
    const data = await this.userService.loginByPassword(params);
    return data;
  }
  /**
   * 根据手机号码登录
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60 * 60, max: 10, limitBy: 'ip', limitExtraKey: 'phone'})
  @Post('/security/login_phone')
  async loginByPhone(@Body() params: LoginByPhoneDto) {
    const data = await this.userService.loginByPhone(params);
    return data;
  }
  /**
   * 修改密码(用户主动修改)
   */
  @Put('/security/user_password')
  async changePasswordByUser(@Body() params: ChangePasswordByUserDto) {
    const data = await this.userService.changePasswordByUser(params);
    return data;
  }
  /**
   * 重置密码
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60 * 60, max: 5, limitBy: 'ip' })
  @Post('/security/user_reset_password')
  async resetPassword(params: ResetPasswordDto) {
    const data = await this.userService.resetPassword(params);
    return data;
  }
  /**
   * 管理员重置密码
   */
  @Put('/security/reset_password')
  async resetPasswordByAdmin(@Body() params: ResetPasswordByAdminDto) {
    const data = await this.userService.resetPasswordByAdmin(params);
    return data;
  }
  /**
   * 手动添加用户
   */
  @Post('/security/useradd')
  async addUser(@Body() params: AddUserDto) {
    const data = await this.userService.addUser(params);
    return data;
  }
  /**
   * 获取用户列表
   */
  @Get('/security/user_list')
  async getUserList(@Query() params: GetUserListDto) {
    const data = await this.userService.getUserList(params);
    return data;
  }
  /**
   * 禁用启用用户
   */
  @Put('/security/user_state')
  async changeUserState(@Body() params: ChangeUserStateDto) {
    const data = await this.userService.changeUserState(params);
    return data;
  }
  /**
   * 根据用户id获取用户信息
   */
  @Get('/security/user_info_by_id')
  async getUserInfoById(@Query() params: GetUserInfoByIdDto) {
    const data = await this.userService.getUserInfoById(params);
    return data;
  }
  /**
   * 获取自身登录用户信息
   */
  @Get('/security/user_info')
  async getLoggedInUserInfo() {
    const data = await this.userService.getLoggedInUserInfo();
    return data;
  }
  /**
   * 根据用户名称查询用户列表
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60, max: 10, errorMsg: '1分钟内最多查询10次' })
  @Get('/security/userListByName')
  async getUserListByName(@Query() params: GetUserListByNameDto) {
    const data = await this.userService.getUserListByName(params);
    return data;
  }
  /**
   * 根据用户名称|手机号|组名查询
   */
  @ReqSign()
  @ReqLimit({ ttl: 1000 * 60, max: 10, errorMsg: '1分钟内最多查询10次' })
  @Get('/security/userOrGroupListByName')
  async getUserOrGroupListByName(@Query() params: GetUserListByNameDto) {
    const data = await this.userService.getUserOrGroupListByName(params);
    return data;
  }
  /**
   * 改变用户权限，手机号，登录名称，昵称
   */
  @Put('/security/user_permission')
  async changeUserInfo(@Body() params: ChangeUserInfoDto) {
    const data = await this.userService.changeUserInfo(params);
    return data;
  }
  /**
   * 下载用户批量导入模板
   */
  @Get('/security/user_excel_template')
  async getBatchUserImportTemplate() {
    const data = await this.userService.getBatchUserImportTemplate();
    return data;
  }
  /**
   * 访客登录(默认创建一个固定密码的用户)
   */
  @Post('/security/login_guest')
  async guestLogin() {
    const data = await this.userService.guestLogin();
    return data;
  }
  /**
   * 通过excel批量导入用户
   */
  @Post('/security/add_user_by_excel')
  async addUserByExcel(@Files() files: UploadFileInfo<string>[]) {
    if (files?.length === 0) {
      throwError(1006, '文件格式不正确');
    }
    if (files?.[0].mimeType !== 'application/vnd.ms-excel' && files?.[0].mimeType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      throwError(1006, '文件格式不正确');
    }
    const data = await this.userService.addUserByExcel(files[0]);
    return data;
  }
  /**
   * 添加最近访问页面
   */
  @Put('/project/visited')
  async addLastVisited(@Body() params: AddLastVisitedDto) {
    const data = await this.userService.addLastVisited(params);
    return data;
  }
  /**
   * 收藏项目
   */
  @Put('/project/star')
  async starProject(@Body() params: StarProjectDto) {
    const data = await this.userService.starProject(params);
    return data;
  }
  /**
   * 取消收藏项目
   */
  @Put('/project/unstar')
  async unStarProject(@Body() params: UnStarProjectDto) {
    const data = await this.userService.unStarProject(params);
    return data;
  }
}
