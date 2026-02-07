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
    if (!this.permissionConfig.isFree) {
      return { enableGuest: true, enableRegister: false };
    }
    let config = await this.systemConfigModel.findOne({}, { enableGuest: 1, enableRegister: 1 }).lean();
    if (!config) {
      config = await this.systemConfigModel.create({ enableGuest: true, enableRegister: true });
    }
    return { enableGuest: config.enableGuest, enableRegister: config.enableRegister };
  }
  // 更新系统配置（仅 DEPLOYMENT_TYPE=user 时允许）
  async updateSystemConfig(params: { enableGuest?: boolean; enableRegister?: boolean }) {
    if (!this.permissionConfig.isFree) {
      throwError(4003, '当前部署模式不支持此操作');
    }
    const existing = await this.systemConfigModel.findOne({});
    if (existing) {
      await this.systemConfigModel.findByIdAndUpdate(existing._id, { $set: params });
    } else {
      await this.systemConfigModel.create({ enableGuest: true, enableRegister: true, ...params });
    }
    return this.getSystemConfig();
  }
}
