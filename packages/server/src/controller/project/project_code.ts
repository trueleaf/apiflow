import { Inject, Controller, Body, Post, Del, Get, Put, Query } from '@midwayjs/core';
import { AddProjectCodeDto, EditProjectCodeDto, DeleteProjectCodeDto, GetProjectCodeListDto, GetProjectCodeEnumDto } from '../../types/dto/project/project.code.dto.js';
import { ProjectCodeService } from '../../service/project/project_code.js';

@Controller('/api/apidoc')
export class ProjectCodeController {
  @Inject()
    projectCodeService: ProjectCodeService;

  /**
   * 新增脚本代码
   */
  @Post('/project/code')
  async addProjectCode(@Body() params: AddProjectCodeDto) {
    const data = await this.projectCodeService.addProjectCode(params);
    return data;
  }
  /**
   * 修改脚本代码
   */
  @Put('/project/code')
  async editProjectCode(@Body() params: EditProjectCodeDto) {
    const data = await this.projectCodeService.editProjectCode(params);
    return data;
  }
  /**
   * 删除脚本代码
   */
  @Del('/project/code')
  async deleteProjectCode(@Body() params: DeleteProjectCodeDto) {
    const data = await this.projectCodeService.deleteProjectCode(params);
    return data;
  }
  /**
   * 列表方式获取脚本代码
   */
  @Get('/project/code')
  async getProjectCodeList(@Query() params: GetProjectCodeListDto) {
    const data = await this.projectCodeService.getProjectCodeList(params);
    return data;
  }
  /**
   * 枚举方式获取脚本代码
   */
  @Get('/project/code_enum')
  async getProjectCodeEnum(@Query() params: GetProjectCodeEnumDto) {
    const data = await this.projectCodeService.getProjectCodeEnum(params);
    return data;
  }
}
