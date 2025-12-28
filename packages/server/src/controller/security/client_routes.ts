import {
  Inject,
  Controller,
  Post,
  Body,
  Put,
  Del,
  Get,
} from '@midwayjs/core';
import {
  AddClientRoutesDto,
  ChangeGroupNameByIds,
  DeleteClientRoutesDto,
  EditClientRoutesDto,
} from '../../types/dto/security/client.routes.dto.js';
import { ClientRoutesService } from '../../service/security/client_routes.js';

@Controller('/api')
export class ClientRoutesController {
  @Inject()
    clientRoutesService: ClientRoutesService;
  /**
   * 新增前端路由
   */
  @Post('/security/client_routes')
  async addClientRoutes(@Body() params: AddClientRoutesDto) {
    const data = await this.clientRoutesService.addClientRoutes(params);
    return data;
  }
  /**
   * 修改前端路由
   */
  @Put('/security/client_routes')
  async editClientRoutes(@Body() params: EditClientRoutesDto) {
    const data = await this.clientRoutesService.editClientRoutes(params);
    return data;
  }
  /**
   * 删除前端路由
   */
  @Del('/security/client_routes')
  async deleteClientRoutes(@Body() params: DeleteClientRoutesDto) {
    const data = await this.clientRoutesService.deleteClientRoutes(params);
    return data;
  }
  /**
   * 批量修改前端路由分组名称
   */
  @Put('/security/client_routes_type')
  async changeGroupNameByIds(@Body() params: ChangeGroupNameByIds) {
    const data = await this.clientRoutesService.changeGroupNameByIds(params);
    return data;
  }
  /**
   * 获取全部客户端路由
   */
  @Get('/security/client_routes')
  async getAllClientRoutesList() {
    const data = await this.clientRoutesService.getAllClientRoutesList();       
    return data;
  }
}
