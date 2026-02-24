import { Config, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { SystemConfig } from '../../entity/security/system_config.js';
import { GlobalConfig } from '../../types/types.js';
import { throwError } from '../../utils/utils.js';

@Provide()
export class SystemConfigService {
  @InjectEntityModel(SystemConfig) systemConfigModel: ReturnModelType<typeof SystemConfig>;
  @Config('permission') permissionConfig: GlobalConfig['permission'];
  // 获取系统配置（单例，不存在则自动创建默认值）
  async getSystemConfig() {
    const isOfficial = !this.permissionConfig.isFree;
    if (!isOfficial) {
      return { enableGuest: false, enableRegister: false, enableForgotPassword: false, isOfficial: false };
    }
    let config = await this.systemConfigModel.findOne({}, { enableGuest: 1, enableRegister: 1, enableForgotPassword: 1 }).lean();
    if (!config) {
      config = await this.systemConfigModel.create({ enableGuest: true, enableRegister: true, enableForgotPassword: true });
    }
    return { enableGuest: config.enableGuest, enableRegister: config.enableRegister, enableForgotPassword: config.enableForgotPassword ?? false, isOfficial: true };
  }
  // 更新系统配置（仅 DEPLOYMENT_TYPE=official 时允许）
  async updateSystemConfig(params: { enableGuest?: boolean; enableRegister?: boolean; enableForgotPassword?: boolean }) {
    if (this.permissionConfig.isFree) {
      throwError(4003, '当前部署模式不支持此操作');
    }
    const existing = await this.systemConfigModel.findOne({});
    if (existing) {
      await this.systemConfigModel.findByIdAndUpdate(existing._id, { $set: params });
    } else {
      await this.systemConfigModel.create({ enableGuest: false, enableRegister: false, enableForgotPassword: false, ...params });
    }
    return this.getSystemConfig();
  }
}
