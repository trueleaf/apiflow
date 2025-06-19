import { Inject, Controller, Body, Get, Put, Query } from '@midwayjs/core';
import { GetProjectCommonHeaderByIdDto, UpsertProjectCommonHeaderDto, GetProjectCommonHeadersDto, GetGlobalProjectCommonHeadersDto, UpsertGlobalProjectCommonHeaderDto } from '../../types/dto/project/project.common.header.dto.js';
import { ProjectCommonHeaderService } from '../../service/project/project_common_header.js';
import { CommonController } from '../common/common.js';

@Controller('/api')
export class ProjectCommonHeaderController {
  @Inject()
    projectCommonHeaderService: ProjectCommonHeaderService
  @Inject()
    commonControl: CommonController
  /**
   * 根据id获取某个请求头
   */
  @Get('/project/common_header_by_id')
  async getProjectCommonHeaderById(@Query() params: GetProjectCommonHeaderByIdDto) {
    const { projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const data = await this.projectCommonHeaderService.getProjectCommonHeaderById(params);
    return data;
  }
  /**
   * 新增或修改公共请求头
   */
  @Put('/project/common_header')
  async upsertProjectCommonHeader(@Body() params: UpsertProjectCommonHeaderDto) {
    const { projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const data = await this.projectCommonHeaderService.upsertProjectCommonHeader(params);
    return data;
  }
  /**
   * 获取公共请求头
   */
  @Get('/project/common_headers')
  async getProjectCommonHeaders(@Query() params: GetProjectCommonHeadersDto) {
    const { projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const data = await this.projectCommonHeaderService.getProjectCommonHeaders(params);
    return data;
  }
  /**
   * 获取全局公共请求头
   */
  @Get('/project/global_common_headers')
  async getGlobalProjectCommonHeaders(@Query() params: GetGlobalProjectCommonHeadersDto) {
    const { projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const data = await this.projectCommonHeaderService.getGlobalProjectCommonHeaders(params);
    return data;
  }
  /**
   * 更新全局请求头
   */
  @Put('/project/replace_global_common_headers')
  async upsertGlobalProjectCommonHeaders(@Body() params: UpsertGlobalProjectCommonHeaderDto) {
    const { projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const data = await this.projectCommonHeaderService.upsertGlobalProjectCommonHeaders(params);
    return data;
  }
}
