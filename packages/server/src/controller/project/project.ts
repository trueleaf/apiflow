import { Inject, Controller, Get, Query, Body, Post, Del, Put } from '@midwayjs/core';
import { 
  AddProjectDto, 
  AddMemberToProjectDto, 
  ChangeMemberPermissionInProjectDto, 
  DeleteProjectDto, 
  DeleteMemberFromProjectDto, 
  EditProjectDto, 
  GetProjectByKeywordDto, 
  GetProjectFullInfoByIdDto, 
  GetProjectInfoByIdDto, 
  GetProjectListDto, 
  GetProjectMembersByIdDto 
} from '../../types/dto/project/project.dto.js';
import { ProjectService } from '../../service/project/project.js';
import { ReqLimit } from '../../decorator/req_limit.decorator.js';

@Controller('/api')
export class ProjectController {
  @Inject()
    projectService: ProjectService;

  /**
   * 新增项目
   */
  @Post('/project/add_project')
  async addProject(@Body() params: AddProjectDto) {
    const data = await this.projectService.addProject(params);
    return data;
  }
  /**
   * 给项目添加成员，用户或者机构
   */
  @Post('/project/add_user')
  async addMemberToProject(@Body() params: AddMemberToProjectDto) {
    const data = await this.projectService.addMemberToProject(params);
    return data;
  }
  /**
   * 从项目中删除用户
   */
  @Del('/project/delete_user')
  async deleteMemberFromProject(@Body() params: DeleteMemberFromProjectDto) {
    const data = await this.projectService.deleteMemberFromProject(params);
    return data;
  }
  /**
   * 改变用户在项目中的权限
   */
  @Put('/project/change_permission')
  async changeMemberPermissionInProject(@Body() params: ChangeMemberPermissionInProjectDto) {
    const data = await this.projectService.changeMemberPermissionInProject(params);
    return data;
  }
  /**
   * 删除项目
   */
  @Del('/project/delete_project')
  async deleteProject(@Body() params: DeleteProjectDto) {
    const data = await this.projectService.deleteProject(params);
    return data;
  }
  /**
   * 修改项目
   */
  @Put('/project/edit_project')
  async editProject(@Body() params: EditProjectDto) {
    const data = await this.projectService.editProject(params);
    return data;
  }

  /**
   * 列表形式获取项目
   */
  @Get('/project/project_list')
  async getProjectList(@Query() params: GetProjectListDto) {
    const data = await this.projectService.getProjectList(params);
    return data;
  }
  /**
   * 根据id获取项目基本信息
   */
  @Get('/project/project_info')
  async getProjectBaseInfoById(@Query() params: GetProjectInfoByIdDto) {
    const data = await this.projectService.getProjectInfoById(params);
    return data;
  }
  /**
   * 根据id获取项目完整信息
   */
  @Get('/project/project_full_info')
  async getProjectFullInfoById(@Query() params: GetProjectFullInfoByIdDto) {
    const data = await this.projectService.getProjectFullInfoById(params);
    return data;
  }
  /**
   * 根据id获取项目成员信息
   */
  @Get('/project/project_members')
  async getProjectMembersById(@Query() params: GetProjectMembersByIdDto) {
    const data = await this.projectService.getProjectMembersById(params);
    return data;
  }
  /**
   * 以枚举方式获取项目
   */
  @Get('/project/project_enum')
  async getProjectEnum() {
    const data = await this.projectService.getProjectEnum();
    return data;
  }
  /**
   * 根据关键字获取项目列表
   */
  @ReqLimit({ max: 10, ttl: 1000 * 60 * 5, errorMsg: '每五分钟允许调用10次' })
  @Get('/project/project_list_by_keyword')
  async getProjectListByKeyword(@Query() params: GetProjectByKeywordDto) {
    const data = await this.projectService.getProjectListByKeyword(params);
    return data;
  }
}
