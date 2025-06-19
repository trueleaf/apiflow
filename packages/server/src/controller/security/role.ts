import {
  Inject,
  Controller,
  Post,
  Body,
  Put,
  Del,
  Get,
  Query,
} from '@midwayjs/core';
import { AddRoleDto, DeleteRoleDto, EditRoleDto, GetRoleInfoDto, GetRoleListDto } from '../../types/dto/security/role.dto.js';
import { RoleService } from '../../service/security/role.js';

@Controller('/api')
export class RoleController {
  @Inject()
    roleService: RoleService;
  /**
   * 新增角色
   */
  @Post('/security/role')
  async addRole(@Body() params: AddRoleDto) {
    const data = await this.roleService.addRole(params);
    return data;
  }
  /**
   * 修改角色
   */
  @Put('/security/role')
  async editRole(@Body() params: EditRoleDto) {
    const data = await this.roleService.editRole(params);
    return data;
  }
  /**
   * 删除角色
   */
  @Del('/security/role')
  async deleteRole(@Body() params: DeleteRoleDto) {
    const data = await this.roleService.deleteRole(params);
    return data;
  }
  /**
   * 分页方式获取角色列表
   */
  @Get('/security/role_list')
  async getRoleList(@Query() params: GetRoleListDto) {
    const data = await this.roleService.getRoleList(params);
    return data;
  }
  /**
   * 以枚举方式获取角色列表
   */
  @Get('/security/role_enum')
  async getRoleEnum() {
    const data = await this.roleService.getRoleEnum();
    return data;
  }
  /**
   * 根据id获取角色信息
   */
  @Get('/security/role_info')
  async getRoleInfoById(@Query() params: GetRoleInfoDto) {
    const data = await this.roleService.getRoleInfoById(params);
    return data;
  }
}
