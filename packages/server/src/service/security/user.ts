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
  LoginByPasswordDto,
  LoginByPhoneDto,
  RegisterByPhoneDto,
  ResetPasswordByAdminDto,
  ResetPasswordDto,
  SMSDto,
  StarProjectDto,
  UnStarProjectDto,
} from '../../types/dto/security/user.dto.js';
import { getRandomNumber, throwError, uniqueByKey } from '../../utils/utils.js';
import * as XLSX from 'xlsx'
import { GlobalConfig, LoginTokenInfo } from '../../types/types.js';
import Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import $Util from '@alicloud/tea-util';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { createHash } from 'crypto';
import { Context } from '@midwayjs/koa';
import * as jwt from 'jsonwebtoken';
import lodash from 'lodash';
import * as path from 'path';
import * as fs from 'fs-extra';
import { fileTypeFromBuffer } from 'file-type'
import { UploadFileInfo } from '@midwayjs/upload';
import { Sms } from '../../entity/security/sms.js';
import { User } from '../../entity/security/user.js';
import { LoginRecord } from '../../entity/security/login_record.js';
import { validatePassword } from '../../rules/rules.js';
import { TableResponseWrapper } from '../../types/response/common/common.js';
import { ClientMenu } from '../../entity/security/client_menu.js';
import { ClientRoutes } from '../../entity/security/client_routes.js';
import { Role } from '../../entity/security/role.js';
import { Group } from '../../entity/security/group.js';


@Provide()
export class UserService {
  @Inject()
    ctx: Context & { tokenInfo: LoginTokenInfo };
  @Inject()
    appDir: string;

  @Config('smsConfig')
    smsConfig: GlobalConfig['smsConfig'];
  @Config('jwtConfig')
    jwtConfig: GlobalConfig['jwtConfig'];
  @Config('security')
    securityConfig: GlobalConfig['security']
  @Config('pagination')
    paginationConfig: GlobalConfig['pagination']

  @InjectEntityModel(Sms)
    smsModel: ReturnModelType<typeof Sms>;
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
   * 根据手机号码获取短信验证码
   */
  async getSMSCode(params: SMSDto) {
    const { phone } = params;
    const code = getRandomNumber(100000, 999999);
    const config = new $OpenApi.Config({
      accessKeyId: this.smsConfig.accessKeyId,
      accessKeySecret: this.smsConfig.accessKeySecret,
    });
    config.endpoint = this.smsConfig.endpoint;
    // @ts-ignore
    const client = new Dysmsapi20170525.default(config);
    const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: phone,
      signName: this.smsConfig.signName,
      templateCode: this.smsConfig.templateCode,
      templateParam: `{code: ${code}}`,
    });

    await client.sendSmsWithOptions(
      sendSmsRequest,
      new $Util.RuntimeOptions({})
    );
    await this.smsModel.updateOne(
      { phone },
      { $set: { phone, smsCode: code } },
      { upsert: true }
    );
  }

  /**
   * 使用手机号码注册账号
   */
  async registerByPhone(params: RegisterByPhoneDto) {
    const { loginName, realName, phone, password, smsCode } = params;
    const smsInfo = await this.smsModel.findOne({ phone });
    if (!smsInfo) {
      return throwError(2003, '验证码不正确');
    }
    const updateTimestamps = new Date(smsInfo.updatedAt).getTime();
    const isExpire = Date.now() - updateTimestamps > this.smsConfig.maxAge;
    if (isExpire) {
      return throwError(2002, '验证码失效');
    }
    if (smsInfo.smsCode !== smsCode) {
      return throwError(2003, '验证码不正确');
    }
    //注册手机号与接受验证码手机号不一致
    if (phone !== smsInfo.phone) {
      return throwError(2001, '注册手机号与接受验证码手机号不一致');
    }
    const hasUser = await this.userModel.findOne({ loginName });
    const hasPhone = await this.userModel.findOne({ phone });
    if (hasUser) {
      return throwError(1003, '用户已存在');
    }
    if (hasPhone) {
      return throwError(1003, '用户已存在');
    }

    const userInfo: Partial<User> = {};
    const hash = createHash('md5');
    const salt = getRandomNumber(10000, 9999999).toString();
    hash.update((password + salt).slice(2));
    const hashPassword = hash.digest('hex');
    userInfo.loginName = loginName;
    userInfo.realName = realName;
    userInfo.phone = phone;
    userInfo.password = hashPassword;
    userInfo.salt = salt;
    //数据库初始化时候默认生成，创建用户默认权限，可能改变
    userInfo.roleIds = ['5ede0ba06f76185204584700', '5ee980553c63cd01a49952e4'];
    userInfo.roleNames = ['普通用户'];
    await this.userModel.create(userInfo);
  }
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
    const userInfo = await this.userModel.findOne({ loginName });
    const env = this.ctx.app.getEnv();
    if (!userInfo) {
      return throwError(2004, env === 'local' ? '用户不存在' : "用户名或密码错误")
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
      return throwError(2004, '用户名或密码错误');
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

    const loginInfo: LoginTokenInfo = {
      id: userInfo.id,
      roleIds: userInfo.roleIds,
      loginName: userInfo.loginName,
      realName: userInfo.realName,
      phone: userInfo.phone,
      token: '',
    };
    const token = jwt.default.sign(loginInfo, this.jwtConfig.secretOrPrivateKey, {
      expiresIn: this.jwtConfig.expiresIn,
    });
    loginInfo.token = token;
    return loginInfo;
  }
  /**
   * 使用手机号码登录
   */
  async loginByPhone(params: LoginByPhoneDto) {
    const { phone, smsCode } = params;
    const smsInfo = await this.smsModel.findOne({ phone });
    const env = this.ctx.app.getEnv();
    const updateTimestamps = new Date(smsInfo.updatedAt).getTime();
    const isExpire = Date.now() - updateTimestamps > this.smsConfig.maxAge;
    if (!smsInfo) {
      return throwError(2005, '请输入正确的手机号码');
    }
    if (isExpire) {
      return throwError(2003, '验证码已失效');
    }
    if (smsInfo.smsCode !== smsCode) {
      return throwError(2003, '短信验证码错误');
    }
    const userInfo = await this.userModel.findOne({ phone });
    if (!userInfo) {
      return throwError(2004, env === 'local' ? '用户不存在' : "用户名或密码错误");
    }
    if (!userInfo.isEnabled) {
      return throwError(2008, '用户被禁止登录，管理员可以启用当前用户');
    }
    const loginInfo: LoginTokenInfo = {
      id: userInfo.id,
      roleIds: userInfo.roleIds,
      loginName: userInfo.loginName,
      realName: userInfo.realName,
      phone: userInfo.phone,
      token: '',
    };
    const token = jwt.default.sign(loginInfo, this.jwtConfig.secretOrPrivateKey, {
      expiresIn: this.jwtConfig.expiresIn,
    });
    loginInfo.token = token;
    return loginInfo;
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
   * 重置密码
   */
  async resetPassword(params: ResetPasswordDto) {
    const { phone, password, smsCode } = params;
    const smsInfo = await this.smsModel.findOne({ phone });
    if (!smsInfo) {
      return throwError(2003, '验证码不正确');
    }
    const updateTimestamps = new Date(smsInfo.updatedAt).getTime();
    const isExpire = Date.now() - updateTimestamps > this.smsConfig.maxAge;
    if (isExpire) {
      return throwError(2002, '验证码失效');
    }
    if (smsInfo.smsCode !== smsCode) {
      return throwError(2003, '验证码不正确');
    }
    //注册手机号与接受验证码手机号不一致
    if (phone !== smsInfo.phone) {
      return throwError(2001, '注册手机号与接受验证码手机号不一致');
    }
    const matchedUser = await this.userModel.findOne({ phone });
    if (!matchedUser) {
      return throwError(1003, '手机号不存在，无法通过手机号重置密码，可以联系管理员重置密码');
    }
    if (!matchedUser.isEnabled) {
      return throwError(2008, '用户被禁止登录，管理员可以启用当前用户');
    }
    const hash = createHash('md5');
    const salt = getRandomNumber(10000, 9999999).toString();
    hash.update((password + salt).slice(2));
    const hashPassword = hash.digest('hex');
    await this.userModel.updateOne({ phone }, { $set: { salt, password: hashPassword } });
    return;
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
    const { loginName, realName, phone, password = '111111', roleIds, roleNames } = params;
    const hasUser = await this.userModel.findOne({ loginName });
    const hasPhone = await this.userModel.findOne({ phone });
    if (loginName.match(/guest/)) { //用于统计访客，内部部署可忽略
      return throwError(2010, '用户名不能以包含guest')
    }
    if (hasUser) {
      return throwError(1003, '登录名称已存在')
    }
    if (hasPhone) {
      return throwError(1003, '该手机号已经绑定')
    }
    const doc: Pick<User, 'loginName' | 'realName' | 'phone' | 'password' | 'salt' | 'roleIds' | 'roleNames'> = {
      loginName: '',
      realName: '',
      phone: '',
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
    doc.realName = realName;
    doc.phone = phone;
    doc.password = hashPassword;
    doc.salt = salt;
    doc.roleIds = roleIds || [];
    doc.roleNames = roleNames || [];
    await this.userModel.create(doc);
    return;
  }
  /**
   * 获取用户列表
   */
  async getUserList(params: GetUserListDto) {
    const { pageNum, pageSize, startTime, endTime, loginName, realName, phone } = params;
    const query = {} as {
      loginName?: RegExp;
      realName?: RegExp;
      phone?: RegExp;
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
    if (realName) {
      query.realName = new RegExp(lodash.escapeRegExp(realName));
    }
    if (phone) {
      query.phone = new RegExp(lodash.escapeRegExp(phone));
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
    const userList = await this.userModel.find({ $or: [
      {
        realName: { $regex: escapeName },
      },
      {
        loginName: { $regex: escapeName }
      },
      {
        phone: name, //手机号必须完整匹配
      }
    ], _id: { $ne: tokenInfo.id }, isAllowInvite: true }, { realName: 1, loginName: 1 }).lean();
    const result = userList.map(val => {
      return {
        realName: val.realName,
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
    const userList = await this.userModel.find({ $or: [
      {
        realName: { $regex: escapeName },
      },
      {
        loginName: { $regex: escapeName }
      },
      {
        phone: name, //手机号必须完整匹配
      }
    ], _id: { $ne: tokenInfo.id }, isAllowInvite: true, isEnabled: true }, { realName: 1, loginName: 1 }).lean();
    const groupList = await this.groupModel.find({ groupName: { $regex: escapeName }, isEnabled: true }, { groupName: 1, }).lean();
    const validUserList = userList.map(val => {
      return {
        name: val.loginName || val.realName,
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
   * 改变用户权限，手机号，登录名称，昵称
   */
  async changeUserInfo(params: ChangeUserInfoDto) {
    const { _id, roleIds, roleNames, loginName, phone, realName } = params;
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
    if (phone) {
      updateDoc.phone = phone;
    }
    if (realName) {
      updateDoc.realName = realName;
    }
    await this.userModel.findByIdAndUpdate({ _id }, updateDoc);
    return;
  }
  /**
   * 改变用户权限，手机号，登录名称，昵称
   */
  async getBatchUserImportTemplate() {
    const fileName = '用户批量导入模板';
    const filePath = path.join(this.appDir, 'public','用户批量导入模板.xlsx');
    const file = await fs.readFile(filePath);
    const typeInfo = await fileTypeFromBuffer(new Uint8Array(file as Buffer));
    this.ctx.set('content-type', typeInfo.mime);
    this.ctx.set('content-disposition', `attachment;filename=${encodeURIComponent(fileName)}`);
    return file;
  }
  /**
   * 访客登录(默认创建一个固定密码的用户)
   */
  async guestLogin() {
    const loginName = `guest_${Date.now().toString().slice(-8)}`;
    const password = this.securityConfig.defaultUserPassword;
    const user: Partial<User> = {};
    const hash = createHash('md5');
    const salt = getRandomNumber(10000, 9999999).toString();
    hash.update((password + salt).slice(2));
    const hashPassword = hash.digest('hex');
    user.loginName = loginName;
    user.realName = loginName;
    user.password = hashPassword;
    user.salt = salt;
    user.roleIds = ['5ee980553c63cd01a49952e4'];
    user.roleNames = ['普通用户'];
    await this.userModel.create(user);
    const loginTokenInfo = await this.loginByPassword({
      loginName,
      password,
    });
    return loginTokenInfo;
  }
  /**
   * 通过excel批量导入用户
   */
  async addUserByExcel(file: UploadFileInfo<string>) {
    const filePath = file.data;
    const workbook = XLSX.readFile(filePath);
    const sheetname = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetname];
    const sheetJson = XLSX.utils.sheet_to_json(worksheet);
    const userDocs = [];
    const userNum = sheetJson.length;
    let validNum = 0;
    for (let i = 0; i < sheetJson.length; i++) {
      const user = sheetJson[i] as Record<string, string>;
      const loginName = user['登录名称'];
      const phone = user['手机号码'];
      const realName = user['昵称'];
      const password = this.securityConfig.defaultUserPassword;
      const doc: Partial<User> = {};
      const hasUser = await this.userModel.findOne({ $or: [{ loginName }, { phone }] });
      if (!hasUser && loginName && user && realName) {
        const hash = createHash('md5');
        const salt = getRandomNumber(100000, 999999).toString();
        hash.update((password + salt).slice(2));
        const hashPassword = hash.digest('hex');
        doc.loginName = loginName;
        doc.realName = realName;
        doc.phone = phone;
        doc.password = hashPassword;
        doc.salt = salt;
        doc.roleIds = ['5ede0ba06f76185204584700'];
        doc.roleNames = ['管理员'];
        userDocs.push(doc);
        validNum++;
      }
    }
    await this.userModel.insertMany(userDocs);
    return {
      total: userNum,
      success: validNum,
    };
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
      clientBanner: clientMenuResult.sort((a, b) => {
        return b.sort - a.sort;
      }),
      clientRoutes: clientRoutesResult,
      globalConfig: {
        title: '快乐摸鱼',
        version: '0.8.0',
        consoleWelcome: true,
        enableRegister: true,
        enableGuest: true,
        enableDocLink: true,
        autoUpdate: false,
        updateUrl: '',
      }
    };
  }
}
