import { Body, Controller, Del, Get, Inject, Post, Put, Query } from '@midwayjs/core'
import { ProjectEnvironmentService } from '../../service/project/project_environment.js'
import {
  AddProjectEnvironmentDto,
  BatchUpdateProjectEnvironmentVariableDto,
  DeleteProjectEnvironmentDto,
  EditProjectEnvironmentDto,
  GetProjectEnvironmentListDto,
  GetProjectEnvironmentVariableListDto
} from '../../types/dto/project/project.environment.dto.js'
@Controller('/api')
export class ProjectEnvironmentController {
  @Inject()
    projectEnvironmentService: ProjectEnvironmentService
  @Post('/project/environment')
  async addProjectEnvironment(@Body() params: AddProjectEnvironmentDto) {
    const data = await this.projectEnvironmentService.addProjectEnvironment(params)
    return data
  }
  @Put('/project/environment')
  async editProjectEnvironment(@Body() params: EditProjectEnvironmentDto) {
    const data = await this.projectEnvironmentService.editProjectEnvironment(params)
    return data
  }
  @Del('/project/environment')
  async deleteProjectEnvironment(@Body() params: DeleteProjectEnvironmentDto) {
    const data = await this.projectEnvironmentService.deleteProjectEnvironment(params)
    return data
  }
  @Get('/project/environment/list')
  async getProjectEnvironmentList(@Query() params: GetProjectEnvironmentListDto) {
    const data = await this.projectEnvironmentService.getProjectEnvironmentList(params)
    return data
  }
  @Get('/project/environment/variable/list')
  async getProjectEnvironmentVariableList(@Query() params: GetProjectEnvironmentVariableListDto) {
    const data = await this.projectEnvironmentService.getProjectEnvironmentVariableList(params)
    return data
  }
  @Put('/project/environment/variable/batch')
  async batchUpdateProjectEnvironmentVariable(@Body() params: BatchUpdateProjectEnvironmentVariableDto) {
    const data = await this.projectEnvironmentService.batchUpdateProjectEnvironmentVariable(params)
    return data
  }
}
