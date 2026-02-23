import { Inject, Controller, Get, Put, Body } from '@midwayjs/core';
import { SystemConfigService } from '../../service/security/system_config.js';

@Controller('/api')
export class SystemConfigController {
  @Inject() systemConfigService: SystemConfigService;
  // 获取系统配置（公开接口，登录页需要）
  @Get('/system/config')
  async getSystemConfig() {
    const data = await this.systemConfigService.getSystemConfig();
    return data;
  }
  // 更新系统配置（仅管理员+自部署模式）
  @Put('/system/config')
  async updateSystemConfig(@Body() params: { enableGuest?: boolean; enableRegister?: boolean; enableForgotPassword?: boolean }) {
    const data = await this.systemConfigService.updateSystemConfig(params);
    return data;
  }
}
