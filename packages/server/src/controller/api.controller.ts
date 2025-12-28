import { Controller, Get } from '@midwayjs/core';

@Controller('/api')
export class APIController {
  @Get('/health')
  async health() {
    return { status: 'ok' };
  }
}

