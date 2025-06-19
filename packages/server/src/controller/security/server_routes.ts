import {
  Inject,
  Controller,
  Post,
  Body,
  Put,
  Del,
  Query,
  Get,
} from '@midwayjs/core';
import { AddServerRouteDto, ChangeGroupNameByIdsDto, DeleteServerRouteDto, EditServerRouteDto, GetServerRoutesListDto } from '../../types/dto/security/server.routes.dto.js';
import { ServerRoutesService } from '../../service/security/server_routes.js';

@Controller('/api')
export class ServerMenuController {
  @Inject()
    serverRoutesService: ServerRoutesService;
  /**
   * 新增服务端路由
   */
  @Post('/security/server_routes')
  async addServerRoute(@Body() params: AddServerRouteDto) {
    const data = await this.serverRoutesService.addServerRoute(params);
    return data;
  }
  /**
   * 修改服务端路由
   */
  @Put('/security/server_routes')
  async editServerRoute(@Body() params: EditServerRouteDto) {
    const data = await this.serverRoutesService.editServerRoute(params);
    return data;
  }
  /**
   * 批量修改路由分组信息
   */
  @Put('/security/server_routes_type')
  async changeGroupNameByIds(@Body() params: ChangeGroupNameByIdsDto) {
    const data = await this.serverRoutesService.changeGroupNameByIds(params);
    return data;
  }
  /**
   * 删除服务端路由
   */
  @Del('/security/server_routes')
  async deleteServerRoute(@Body() params: DeleteServerRouteDto) {
    const data = await this.serverRoutesService.deleteServerRoute(params);
    return data;
  }
  /**
   * 以列表形式获取服务端路由
   */
  @Get('/security/server_routes_list')
  async getServerRoutesList(@Query() params: GetServerRoutesListDto) {
    const data = await this.serverRoutesService.getServerRoutesList(params);
    return data;
  }
  /**
   * 获取全部服务端路由
   */
  @Get('/security/server_routes')
  async getAllServerRoutesList() {
    const data = await this.serverRoutesService.getAllServerRoutesList();
    return data;
  }
}
