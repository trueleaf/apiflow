import { Inject, Controller, Body, Post, Put, Del, Get, Query } from '@midwayjs/core';
import { 
  AddProjectVariableDto, 
  DeleteProjectVariableDto, 
  EditProjectVariableDto, 
  GetProjectVariableEnumDto, 
  GetProjectVariableListDto 
} from '../../types/dto/project/project.varible.dto.js';
import { ProjectVariableService } from '../../service/project/project_variable.js';

@Controller('/api')
export class ProjectVariableController {
  @Inject()
    projectVariableService: ProjectVariableService;
  /**
   * 新增全局变量
   */
  @Post('/project/project_variable')
  async addProjectVariable(@Body() params: AddProjectVariableDto) {
    const data = await this.projectVariableService.addProjectVariable(params);
    return data;
  }
  /**
   * 修改全局变量
   */
  @Put('/project/project_variable')
  async editProjectVariable(@Body() params: EditProjectVariableDto) {
    const data = await this.projectVariableService.editProjectVariable(params);
    return data;
  }
  /**
   * 删除全局变量
   */
  @Del('/project/project_variable')
  async deleteProjectVariable(@Body() params: DeleteProjectVariableDto) {
    const data = await this.projectVariableService.deleteProjectVariable(params);
    return data;
  }
  /**
   * 列表方式获取全局变量
   */
  @Get('/project/project_variable')
  async getProjectVariableList(@Query() params: GetProjectVariableListDto) {
    const data = await this.projectVariableService.getProjectVariableList(params);
    return data;
  }
  /**
   * 枚举方式获取全局变量
   */
  @Get('/project/project_variable_enum')
  async getProjectVariableEnum(@Query() params: GetProjectVariableEnumDto) {
    const data = await this.projectVariableService.getProjectVariableEnum(params);
    return data;
  }
}
