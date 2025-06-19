import {
  Inject,
  Controller,
  Post,
  Body,
  Put,
  Del,
  Get,
} from '@midwayjs/core';
import { AddClientMenuDto, ChangeCLientMenuPositionDto, DeleteClientMenuDto, EditClientMenuDto } from '../../types/dto/security/client.menu.dto.js';
import { ClientMenuService } from '../../service/security/client_menu.js';

@Controller('/api')
export class ClientMenuController {
  @Inject()
    clientMenuService: ClientMenuService;
  /**
   * 新增前端菜单
   */
  @Post('/security/client_menu')
  async addClientMenu(@Body() params: AddClientMenuDto) {
    const data = await this.clientMenuService.addClientMenu(params);
    return data;
  }
  /**
   * 修改前端菜单
   */
  @Put('/security/client_menu')
  async editClientMenu(@Body() params: EditClientMenuDto) {
    const data = await this.clientMenuService.editClientMenu(params);
    return data;
  }
  /**
   * 删除前端菜单
   */
  @Del('/security/client_menu')
  async deleteClientMenu(@Body() params: DeleteClientMenuDto) {
    const data = await this.clientMenuService.deleteClientMenu(params);
    return data;
  }
  /**
   * 以树形结构获取前端菜单
   */
  @Get('/security/client_menu_tree')
  async getClientMenuAsTreeData() {
    const data = await this.clientMenuService.getClientMenuAsTreeData();
    return data;
  }
  /**
   * 修改前端菜单位置(传入pid代表拖拽到id等于pid节点下面)
   */
  @Put('/security/client_menu_position')
  async changeClientMenuPosition(@Body() params: ChangeCLientMenuPositionDto) {
    const data = await this.clientMenuService.changeClientMenuPosition(params);
    return data;
  }
}
