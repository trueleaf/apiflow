import { Controller, Post, Body, Inject } from '@midwayjs/core';
import { ProxyHostService } from '../../service/proxy/proxy_host.service.js';

@Controller('/api/proxy/hosts')
export class ProxyHostController {
  @Inject()
  proxyHostService: ProxyHostService;

  @Post('/list')
  async list() {
    const data = await this.proxyHostService.list();
    return { success: true, data };
  }

  @Post('/save')
  async save(@Body() params: { hostname: string; ip: string; description?: string }) {
    const data = await this.proxyHostService.save(params);
    return { success: true, data };
  }

  @Post('/delete')
  async delete(@Body() params: { id: string }) {
    await this.proxyHostService.delete(params.id);
    return { success: true };
  }
}
