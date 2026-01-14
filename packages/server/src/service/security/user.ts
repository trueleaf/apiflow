import { Config, Inject, Provide } from '@midwayjs/core';
import {
  AddLastVisitedDto,
  AddUserDto,
  ChangePasswordByUserDto,
  ChangeUserInfoDto,
  ChangeUserStateDto,
  DisableUserDto,
  GetUserInfoByIdDto,
  GetUserListByNameDto,
  GetUserListDto,
  ImportUsersDto,
  LoginByPasswordDto,
  ResetPasswordByAdminDto,
  StarProjectDto,
  UnStarProjectDto,
} from '../../types/dto/security/user.dto.js';
import { getRandomNumber, throwError, uniqueByKey } from '../../utils/utils.js';
import { GlobalConfig, LoginTokenInfo } from '../../types/types.js';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { createHash, randomBytes } from 'crypto';
import { Context } from '@midwayjs/koa';
import * as jwt from 'jsonwebtoken';
import lodash from 'lodash';
import { createRequire } from 'node:module';
import { User } from '../../entity/security/user.js';
import { LoginRecord } from '../../entity/security/login_record.js';
import { validatePassword } from '../../rules/rules.js';
import { TableResponseWrapper } from '../../types/response/common/common.js';   
import { ClientMenu } from '../../entity/security/client_menu.js';
import { ClientRoutes } from '../../entity/security/client_routes.js';
import { Role } from '../../entity/security/role.js';
import { Group } from '../../entity/security/group.js';
import { VerifyCodeService } from './verify_code.js';
import {
  RegisterByEmailDto,
  LoginByEmailDto,
  BindEmailDto,
  ResetPasswordByEmailDto,
  SendEmailCodeDto,
} from '../../types/dto/security/user.dto.js';

const ADMIN_ROLE_ID = '5edf71f2193c7d5fa0ec9b98';
const USER_ROLE_ID = '5ede0ba06f76185204584700';
const require = createRequire(import.meta.url);
const serverPackageJson = require('../../../package.json') as { version?: string };
const appVersion = serverPackageJson.version ?? '0.0.0';


@Provide()
export class UserService {
  @Inject()
    ctx: Context & { tokenInfo: LoginTokenInfo };
  @Config('jwtConfig')
    jwtConfig: GlobalConfig['jwtConfig'];
  @Config('security')
    securityConfig: GlobalConfig['security']
  @Config('pagination')
    paginationConfig: GlobalConfig['pagination']
  @Inject()
    verifyCodeService: VerifyCodeService;

  @InjectEntityModel(Role)
    roleModel: ReturnModelType<typeof Role>;
  @InjectEntityModel(ClientMenu)
    clientMenuModel: ReturnModelType<typeof ClientMenu>;
  @InjectEntityModel(ClientRoutes)
    clientRoutesModel: ReturnModelType<typeof ClientRoutes>;
  @InjectEntityModel(User)
    userModel: ReturnModelType<typeof User>;
  @InjectEntityModel(Group)
    groupModel: ReturnModelType<typeof Group>;
  @InjectEntityModel(LoginRecord)
    loginRecordModel: ReturnModelType<typeof LoginRecord>;

  /**
   * 记录登录次数
   */
  async addLoginTimes() {
    const newLoginRecord = await this.loginRecordModel.updateOne(
      { ip: this.ctx.ip },
      {
        $set: { ip: this.ctx.ip, userAgent: this.ctx.get('user-agent') },
        $inc: { loginTimes: 1 },
      },
      { upsert: true }
    );
    return newLoginRecord.modifiedCount;
  }
  /**
   * 使用密码登录
   */
  async loginByPassword(params: LoginByPasswordDto) {
    const { loginName, password } = params;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginName);
    const userInfo = await this.userModel.findOne({
      $or: [
        { loginName },
        ...(isEmail ? [{ email: loginName }] : [])
      ]
    });
    const env = this.ctx.app.getEnv();
    if (!userInfo) {
      return throwError(2004, env === 'local' ? '用户不存在' : "用户名/邮箱或密码错误")
    }
    if (!userInfo.isEnabled) {
      return throwError(2008, '用户被禁止登录，管理员可以启用当前用户');
    }
    //判断密码
    const hash = createHash('md5');
    hash.update((password + userInfo.salt).slice(2));
    const hashPassword = hash.digest('hex');
    if (userInfo.password !== hashPassword) {
      await this.addLoginTimes();
      return throwError(2004, '用户名/邮箱或密码错误');
    }
    //登录成功
    await this.loginRecordModel.updateOne(
      { ip: this.ctx.ip },
      {
        $set: { loginTimes: 0 },
      }
    );
    await this.userModel.findByIdAndUpdate(
      { _id: userInfo._id },
      {
        $inc: { loginTimes: 1 },
        $set: { lastLogin: new Date() },
      }
    );

    const role: LoginTokenInfo['role'] = userInfo.roleIds?.includes(ADMIN_ROLE_ID) ? 'admin' : 'user';
    const loginInfo: LoginTokenInfo = {
      id: userInfo.id,
      roleIds: userInfo.roleIds,
      loginName: userInfo.loginName,
      role,
      token: '',
    };
    const token = jwt.default.sign(loginInfo, this.jwtConfig.secretOrPrivateKey, {
      expiresIn: this.jwtConfig.expiresIn,
    });
    loginInfo.token = token;
    return loginInfo;
  }
  /**
   * 验证登录状态
   */
  async verifyLogin() {
    const tokenInfo = this.ctx.tokenInfo;
    if (!tokenInfo || !tokenInfo.id) {
      return throwError(4100, 'Token无效或已过期');
    }
    // 验证用户是否存在
    const userInfo = await this.userModel.findById(tokenInfo.id);
    if (!userInfo) {
      return throwError(2004, '用户不存在');
    }
    
    // 验证用户是否被禁用
    if (!userInfo.isEnabled) {
      return throwError(2008, '用户已被禁用');
    }
    
    // 返回验证结果和用户基本信息
    return {
      isValid: true,
      userInfo: {
        id: userInfo.id,
        loginName: userInfo.loginName,
      },
    };
  }
  /**
   * 修改密码(用户主动)
   */
  async changePasswordByUser(params: ChangePasswordByUserDto) {
    const { oldPassword, newPassword } = params;
    const { id } = this.ctx.tokenInfo;
    if (!validatePassword(newPassword)) {
      return throwError(1007, '密码至少8位，并且必须包含数字和字母');
    }
    const userInfo = await this.userModel.findOne({ _id: id });
    const hash = createHash('md5');
    hash.update((oldPassword + userInfo.salt).slice(2));
    const hashPassword = hash.digest('hex');
    if (userInfo.password !== hashPassword) {
      return throwError(2009, '原密码错误');
    }

    const newHash = createHash('md5');
    const newHashPassword = newHash.update((newPassword + userInfo.salt).slice(2)).digest('hex');
    await this.userModel.findByIdAndUpdate({ _id: id }, { $set: { password: newHashPassword }});
  }

  /**
   * 批量禁用用户
   */
  async disableUser(params: DisableUserDto) {
    const { ids } = params;
    await this.userModel.updateMany({ _id: { $in: ids }}, { $set: { isEnabled: false }});
  }
  /**
   * 管理员重置密码
   */
  async resetPasswordByAdmin(params: ResetPasswordByAdminDto) {
    const { userId, password = this.securityConfig.defaultUserPassword } = params;
    const hash = createHash('md5');
    const salt = getRandomNumber(10000, 9999999).toString();
    hash.update((password + salt).slice(2));
    const hashPassword = hash.digest('hex');
    await this.userModel.updateOne({ _id: userId }, { $set: { salt, password: hashPassword } });
    return;
  }
  /**
   * 手动添加用户
   */
  async addUser(params: AddUserDto) {
    const { loginName, roleIds, roleNames } = params;
    const hasUser = await this.userModel.findOne({ loginName });
    if (loginName.match(/guest/)) { //用于统计访客，内部部署可忽略
      return throwError(2010, '用户名不能以包含guest')
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginName)) {
      return throwError(2015, '用户名不能使用邮箱格式')
    }
    if (hasUser) {
      return throwError(1003, '登录名称已存在')
    }
    const password = this.securityConfig.defaultUserPassword;
    const doc: Pick<User, 'loginName' | 'password' | 'salt' | 'roleIds' | 'roleNames'> = {
      loginName: '',
      password: '',
      salt: '',
      roleIds: [],
      roleNames: [],
    };
    const hash = createHash('md5');
    const salt = getRandomNumber(10000, 9999999).toString();
    hash.update((password + salt).slice(2));
    const hashPassword = hash.digest('hex');
    doc.loginName = loginName;
    doc.password = hashPassword;
    doc.salt = salt;
    doc.roleIds = roleIds || [];
    doc.roleNames = roleNames || [];
    await this.userModel.create(doc);
    return;
  }

  /**
   * 批量导入用户（CSV 解析后提交）
   */
  async importUsers(params: ImportUsersDto) {
    const roleList = await this.roleModel.find(
      { isEnabled: true, _id: { $in: [ADMIN_ROLE_ID, USER_ROLE_ID] } },
      { roleName: 1 }
    ).lean();
    const roleIdToName = new Map<string, string>();
    roleList.forEach(role => {
      roleIdToName.set(role._id.toString(), role.roleName);
    });

    const users = Array.isArray(params.users) ? params.users : [];
    const result: {
      successCount: number;
      failCount: number;
      fails: { index: number; loginName: string; reason: string }[];
    } = {
      successCount: 0,
      failCount: 0,
      fails: [],
    };

    for (let i = 0; i < users.length; i += 1) {
      const rawLoginName = users[i]?.loginName ?? '';
      const loginName = String(rawLoginName).trim();
      const rawRole = users[i]?.role ?? '';
      const roleItems = String(rawRole)
        .split('|')
        .map(v => v.trim().toLowerCase())
        .filter(Boolean);

      if (!loginName) {
        result.failCount += 1;
        result.fails.push({ index: i, loginName: '', reason: '登录名称不能为空' });
        continue;
      }
      if (roleItems.length === 0) {
        result.failCount += 1;
        result.fails.push({ index: i, loginName, reason: '请选择角色' });
        continue;
      }

      const unknownRoles = roleItems.filter(r => r !== 'user' && r !== 'admin');
      if (unknownRoles.length) {
        result.failCount += 1;
        result.fails.push({ index: i, loginName, reason: `Invalid role: ${unknownRoles.join('|')}` });
        continue;
      }

      const roleSet = new Set(roleItems);
      const roleIds: string[] = [];
      const roleNames: string[] = [];
      if (roleSet.has('user')) {
        roleIds.push(USER_ROLE_ID);
        roleNames.push(roleIdToName.get(USER_ROLE_ID) ?? 'user');
      }
      if (roleSet.has('admin')) {
        roleIds.push(ADMIN_ROLE_ID);
        roleNames.push(roleIdToName.get(ADMIN_ROLE_ID) ?? 'admin');
      }
      try {
        await this.addUser({ loginName, roleIds, roleNames });
        result.successCount += 1;
      } catch (err: any) {
        const reason = err?.isCustomError ? (err.msg || '导入失败') : (err?.message || '导入失败');
        result.failCount += 1;
        result.fails.push({ index: i, loginName, reason });
      }
    }

    return result;
  }
  /**
   * 获取用户列表
   */
  async getUserList(params: GetUserListDto) {
    const { pageNum, pageSize, startTime, endTime, loginName } = params;        
    const query = {} as {
      loginName?: RegExp;
      createdAt?: {
        $gt?: number,
        $lt?: number,
      };
    };
    let skipNum = 0;
    let limit = this.paginationConfig.max;
    if (pageSize != null && pageNum != null) {
      skipNum = (pageNum - 1) * pageSize;
      limit = pageSize;
    }
    if (startTime != null && endTime != null) {
      query.createdAt = { $gt: startTime, $lt: endTime };
    }
    if (loginName) {
      query.loginName = new RegExp(lodash.escapeRegExp(loginName));
    }
    const rows = await this.userModel.find(query,
      {
        password: 0,
        salt: 0,
        clientRoutes: 0,
        clinetMenus: 0,
        serverRoutes: 0,
        starProjects: 0
      }
    ).sort({
      loginTimes: -1
    }).skip(skipNum).limit(limit);
    const total = await this.userModel.find(query).countDocuments();
    const result: TableResponseWrapper = {
      rows: [],
      total: 0
    };
    result.rows = rows;
    result.total = total;
    return result;
  }
  /**
   * 禁用启用用户
   */
  async changeUserState(params: ChangeUserStateDto) {
    const { _id, isEnabled } = params;
    //admin用户无法被禁用
    await this.userModel.findOneAndUpdate({ _id, loginName: { $ne: 'admin' } }, { $set: { isEnabled }});
    return;
  }
  /**
   * 根据id获取用户信息
   */
  async getUserInfoById(params: GetUserInfoByIdDto) {
    const { _id } = params;
    const result = await this.userModel.findById({ _id }, {
      accessProjects: 0,
      isEnabled: 0,
      password: 0,
      salt: 0,
      clientRoutes: 0,
      clinetMenus: 0,
      serverRoutes: 0,
      starProjects: 0,
    });
    return result;
  }
  /**
   * 获取自身登录用户信息
   */
  async getLoggedInUserInfo() {
    const { id } = this.ctx.tokenInfo
    const result = await this.userModel.findById(
      { _id: id },
      {
        isEnabled: 0,
        roleIds: 0,
        roleNames: 0,
        loginTimes: 0,
        password: 0,
        salt: 0,
        clientRoutes: 0,
        clinetMenus: 0,
        serverRoutes: 0,
        starProjects: 0,
      }
    );
    return result;
  }
  /**
   * 根据用户名称查询用户列表
   */
  async getUserListByName(params: GetUserListByNameDto) {
    const { name } = params;
    const { tokenInfo } = this.ctx;
    if (!name) {
      return [];
    }
    const escapeName = new RegExp(lodash.escapeRegExp(name));
    const userList = await this.userModel.find({
      loginName: { $regex: escapeName },
      _id: { $ne: tokenInfo.id },
      isAllowInvite: true,
    }, { loginName: 1 }).lean();
    const result = userList.map(val => {
      return {
        userName: val.loginName,
        userId: val._id,
      };
    });
    return result;
  }
  /**
   * 根据用户名称查询用户列表
   */
  async getUserOrGroupListByName(params: GetUserListByNameDto) {
    const { name } = params;
    const { tokenInfo } = this.ctx;
    if (!name) {
      return [];
    }
    const escapeName = new RegExp(lodash.escapeRegExp(name));
    const userList = await this.userModel.find({
      loginName: { $regex: escapeName },
      _id: { $ne: tokenInfo.id },
      isAllowInvite: true,
      isEnabled: true,
    }, { loginName: 1 }).lean();
    const groupList = await this.groupModel.find({ groupName: { $regex: escapeName }, isEnabled: true }, { groupName: 1, }).lean();
    const validUserList = userList.map(val => {
      return {
        name: val.loginName,
        type: "user",
        id: val._id,
      };
    });
    const validGroupList = groupList.map(val => {
      return {
        name: val.groupName,
        type: "group",
        id: val._id,
      };
    })
    return validUserList.concat(validGroupList);
  }
  /**
   * 改变用户权限/登录名称
   */
  async changeUserInfo(params: ChangeUserInfoDto) {
    const { _id, roleIds, roleNames, loginName } = params;
    const updateDoc: Partial<ChangeUserInfoDto> = {};
    if (roleIds) {
      updateDoc.roleIds = roleIds;
    }
    if (roleNames) {
      updateDoc.roleNames = roleNames;
    }
    if (loginName) {
      updateDoc.loginName = loginName;
    }
    await this.userModel.findByIdAndUpdate({ _id }, updateDoc);
    return;
  }
  /**
   * 访客登录(默认创建一个固定密码的用户)
   */
  async guestLogin() {
    const loginName = `guest_${Date.now().toString().slice(-8)}`;
    const password = randomBytes(9).toString('base64url');
    const user: Partial<User> = {};
    const hash = createHash('md5');
    const salt = getRandomNumber(10000, 9999999).toString();
    hash.update((password + salt).slice(2));
    const hashPassword = hash.digest('hex');
    user.loginName = loginName;
    user.password = hashPassword;
    user.salt = salt;
    user.roleIds = ['5ee980553c63cd01a49952e4'];
    user.roleNames = ['普通用户'];
    await this.userModel.create(user);
    const loginTokenInfo = await this.loginByPassword({
      loginName,
      password,
    });
    return { ...loginTokenInfo, password };
  }
  /**
   * 添加最近访问页面
   */
  async addLastVisited(params: AddLastVisitedDto) {
    const { projectId } = params;
    const MAX_RECENT_VISIT = 5;
    const userInfo = this.ctx.tokenInfo;
    const recentVisit = await this.userModel.findOne({ _id: userInfo.id }, { recentVisitProjects: 1 }).lean();
    let recentVisitProjects = recentVisit.recentVisitProjects || [];
    const matchedVisitProjectIndex = recentVisitProjects.findIndex(val => val === projectId);
    if (matchedVisitProjectIndex  !== -1) { //匹配到数据则直接交换
      recentVisitProjects.splice(matchedVisitProjectIndex, 1);
      recentVisitProjects.unshift(projectId);
    } else {
      recentVisitProjects.unshift(projectId);
    }
    recentVisitProjects = recentVisitProjects.slice(0, MAX_RECENT_VISIT);
    const result = await this.userModel.findByIdAndUpdate({ _id: userInfo.id }, {
      $set: {
        recentVisitProjects
      }
    }, { new: true });
    return result.recentVisitProjects;
  }
  /**
   * 收藏项目
   */
  async starProject(params: StarProjectDto) {
    const { projectId } = params;
    const userInfo = this.ctx.tokenInfo;
    await this.userModel.findByIdAndUpdate({ _id: userInfo.id }, {
      $addToSet: {
        starProjects: projectId
      }
    });
    return;
  }
  /**
   * 取消收藏项目
   */
  async unStarProject(params: UnStarProjectDto) {
    const { projectId } = params;
    const userInfo = this.ctx.tokenInfo;
    await this.userModel.findByIdAndUpdate({ _id: userInfo.id }, {
      $pull: {
        starProjects: projectId
      }
    });
    return;
  }
  /**
   * 获取用户基本信息
   */
  async getUserBaseInfo() {
    const { tokenInfo } = this.ctx;
    const roleIds = tokenInfo.roleIds;
    const allClientRoutes = await this.clientRoutesModel.find({isEnabled: true}, { name: 1, path: 1 }); //系统所有前端路由
    const allClientMenu = await this.clientMenuModel.find({isEnabled: true}, { name: 1, path: 1, sort: 1 }); //系统所有前端菜单
    // const globalConfig = await this.ctx.model.Global.Config.findOne({});
    let clientRoutesResult: Partial<ClientRoutes & { id: string }>[] = [];
    let clientMenuResult: Partial<ClientMenu & { id: string }>[] = [];
    for (let i = 0; i < roleIds.length; i++) {
      const roleInfo = await this.roleModel.findById({ _id: roleIds[i] });
      if (roleInfo) {
        //前端路由
        const clientRoutes = roleInfo.clientRoutes.map(val => {
          const matchedData = allClientRoutes.find(val2 => {
            return val2._id.toString() === val;
          });
          return matchedData
        });
        clientRoutesResult = clientRoutesResult.concat(clientRoutes);
        //前端菜单
        const clientBanner = roleInfo.clientBanner.map(val => {
          return allClientMenu.find(val2 => {
            return val2._id.toString() === val;
          });
        }).filter(val => val); //过滤掉被删除的角色
        clientMenuResult = clientMenuResult.concat(clientBanner || []);
      }
    }
    clientRoutesResult = uniqueByKey(clientRoutesResult, 'id');
    clientMenuResult = uniqueByKey(clientMenuResult, 'id');
    return {
      ...tokenInfo,
      role: roleIds.includes(ADMIN_ROLE_ID) ? 'admin' : 'user',
      clientBanner: clientMenuResult.sort((a, b) => {
        return b.sort - a.sort;
      }),
      clientRoutes: clientRoutesResult,
      globalConfig: {
        title: '快乐摸鱼',
        version: appVersion,
        consoleWelcome: true,
        enableRegister: false,
        enableGuest: true,
        enableDocLink: true,
        autoUpdate: false,
        updateUrl: '',
      }
    };
  }
  //发送邮箱验证码
  async sendEmailCode(params: SendEmailCodeDto) {
    const { email, type } = params;
    await this.verifyCodeService.checkSendFrequency(email, type);
    if (type === 'register') {
      if (!this.securityConfig.allowEmailRegister) {
        throwError(2009, '系统未开放邮箱注册功能');
      }
      const existUser = await this.userModel.findOne({ email });
      if (existUser) {
        throwError(2010, '该邮箱已被注册');
      }
    } else if (type === 'login' || type === 'reset' || type === 'bind') {
      const existUser = await this.userModel.findOne({ email });
      if (type === 'bind') {
        if (existUser) {
          throwError(2011, '该邮箱已被其他用户绑定');
        }
      } else {
        if (!existUser) {
          throwError(2012, '该邮箱尚未注册');
        }
        if (!existUser.isEnabled) {
          throwError(2008, '用户被禁止登录');
        }
      }
    }
    await this.verifyCodeService.sendVerifyCode(email, type, this.ctx.ip);
  }
  //邮箱注册
  async registerByEmail(params: RegisterByEmailDto) {
    if (!this.securityConfig.allowEmailRegister) {
      throwError(2009, '系统未开放邮箱注册功能');
    }
    const { email, code, password, loginName } = params;
    const existUser = await this.userModel.findOne({ email });
    if (existUser) {
      throwError(2010, '该邮箱已被注册');
    }
    await this.verifyCodeService.verifyCode(email, code, 'register');
    if (!validatePassword(password)) {
      throwError(2013, '密码格式不正确，至少8位，必须包含字母和数字');
    }
    const finalLoginName = loginName || email.split('@')[0];
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalLoginName)) {
      throwError(2015, '用户名不能使用邮箱格式');
    }
    const existLoginName = await this.userModel.findOne({ loginName: finalLoginName });
    if (existLoginName) {
      throwError(2014, '登录名已被使用，请指定其他登录名');
    }
    const salt = getRandomNumber(10000, 9999999).toString();
    const hash = createHash('md5');
    hash.update((password + salt).slice(2));
    const hashPassword = hash.digest('hex');
    const newUser = await this.userModel.create({
      loginName: finalLoginName,
      email,
      password: hashPassword,
      salt,
      roleIds: [USER_ROLE_ID],
      roleNames: ['普通用户'],
      isEnabled: true,
    });
    const role: LoginTokenInfo['role'] = 'user';
    const loginInfo: LoginTokenInfo = {
      id: newUser.id,
      roleIds: newUser.roleIds,
      loginName: newUser.loginName,
      role,
      token: '',
    };
    const token = jwt.default.sign(loginInfo, this.jwtConfig.secretOrPrivateKey, {
      expiresIn: this.jwtConfig.expiresIn,
    });
    loginInfo.token = token;
    return loginInfo;
  }
  //邮箱登录
  async loginByEmail(params: LoginByEmailDto) {
    const { email, code } = params;
    const userInfo = await this.userModel.findOne({ email });
    if (!userInfo) {
      throwError(2012, '该邮箱尚未注册');
    }
    if (!userInfo.isEnabled) {
      throwError(2008, '用户被禁止登录');
    }
    await this.verifyCodeService.verifyCode(email, code, 'login');
    await this.userModel.findByIdAndUpdate(
      { _id: userInfo._id },
      {
        $inc: { loginTimes: 1 },
        $set: { lastLogin: new Date() },
      }
    );
    const role: LoginTokenInfo['role'] = userInfo.roleIds?.includes(ADMIN_ROLE_ID) ? 'admin' : 'user';
    const loginInfo: LoginTokenInfo = {
      id: userInfo.id,
      roleIds: userInfo.roleIds,
      loginName: userInfo.loginName,
      role,
      token: '',
    };
    const token = jwt.default.sign(loginInfo, this.jwtConfig.secretOrPrivateKey, {
      expiresIn: this.jwtConfig.expiresIn,
    });
    loginInfo.token = token;
    return loginInfo;
  }
  //绑定邮箱
  async bindEmail(params: BindEmailDto) {
    const { email, code } = params;
    const { tokenInfo } = this.ctx;
    if (!tokenInfo || !tokenInfo.id) {
      throwError(4100, '请先登录');
    }
    const existEmail = await this.userModel.findOne({ email });
    if (existEmail) {
      throwError(2011, '该邮箱已被其他用户绑定');
    }
    await this.verifyCodeService.verifyCode(email, code, 'bind');
    await this.userModel.findByIdAndUpdate(tokenInfo.id, { email });
  }
  //通过邮箱重置密码
  async resetPasswordByEmail(params: ResetPasswordByEmailDto) {
    const { email, code, newPassword } = params;
    const userInfo = await this.userModel.findOne({ email });
    if (!userInfo) {
      throwError(2012, '该邮箱尚未注册');
    }
    await this.verifyCodeService.verifyCode(email, code, 'reset');
    if (!validatePassword(newPassword)) {
      throwError(2013, '密码格式不正确，至少8位，必须包含字母和数字');
    }
    const salt = getRandomNumber(10000, 9999999).toString();
    const hash = createHash('md5');
    hash.update((newPassword + salt).slice(2));
    const hashPassword = hash.digest('hex');
    await this.userModel.findByIdAndUpdate(userInfo._id, {
      password: hashPassword,
      salt,
    });
  }
}
