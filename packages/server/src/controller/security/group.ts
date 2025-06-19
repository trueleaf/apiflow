import { Controller, Post, Get, Put, Del, Query, Body,Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

import {
  CreateGroupDTO,
  UpdateGroupDTO,
  AddMemberDTO,
  RemoveMemberDTO,
  UpdatePermissionDTO,
  GroupDetailDTO,
  RemoveGroupDTO
} from '../../types/dto/security/group.dto.js';
import { GroupService } from '../../service/security/group.js';
import { LoginTokenInfo } from '../../types/types.js';

@Controller('/api')
export class GroupController {
  @Inject()
  ctx: Context & { tokenInfo: LoginTokenInfo };

  @Inject()
  groupService: GroupService;

  // 创建组
  @Post('/group/create')
  async createGroup(@Body() params: CreateGroupDTO) {
    return this.groupService.createGroup(params);
  }

  // 更新组信息
  @Put('/group/update')
  async updateGroup(@Body() params: UpdateGroupDTO) {
    return this.groupService.updateGroup(params);
  }

  // 获取组详情
  @Get('/group/detail')
  async getGroupDetail(@Query() query: GroupDetailDTO) {
    return this.groupService.getGroupById(query.id);
  }

  // 分页查询组列表
  @Get('/group/list')
  async getGroupList() {
    return this.groupService.getGroupList();
  }

  // 添加组成员
  @Post('/group/member/add')
  async addMember(@Body() params: AddMemberDTO) {
    return this.groupService.addMember(params);
  }

  // 移除组成员
  @Del('/group/member/remove')
  async removeMember(@Body() params: RemoveMemberDTO) {
    return this.groupService.removeMember(params.groupId, params.userId);
  }
  // 删除组
  @Del('/group/remove')
  async removeGroup(@Body() params: RemoveGroupDTO) {
    return this.groupService.removeGroup(params.ids);
  }

  // 更新成员权限
  @Put('/group/member/permission')
  async updateMemberPermission(@Body() params: UpdatePermissionDTO) {
    return this.groupService.updateMemberPermission(
      params.groupId,
      params.userId,
      params.permission
    );
  }
}