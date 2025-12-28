import {
  Inject,
  Controller,
  Get,
  Post,
  Query,
  SetHeader,
  Body,
  Put,
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
  ResetPasswordByAdminDto,
  StarProjectDto,
  SvgCaptchaDto,
  UnStarProjectDto,
} from '../../types/dto/security/user.dto.js';
import { UserService } from '../../service/security/user.js';
import * as svgCaptcha from 'svg-captcha';
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
   * 修改密码(用户主动修改)
   */
  @Put('/security/user_password')
  async changePasswordByUser(@Body() params: ChangePasswordByUserDto) {
    const data = await this.userService.changePasswordByUser(params);
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
   * 访客登录(默认创建一个固定密码的用户)
   */
  @Post('/security/login_guest')
  async guestLogin() {
    const data = await this.userService.guestLogin();
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
