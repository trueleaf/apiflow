import { Inject, Controller, Body,Get, Put, Query } from '@midwayjs/core';
import { GetProjectRulesByIdDto, UpdateProjectRulesDto } from '../../types/dto/project/project.rules.dto.js';
import { ProjectRulesService } from '../../service/project/project_rules.js';

@Controller('/api/apidoc')
export class ProjectRulesController {
  @Inject()
    projectRulesService: ProjectRulesService;

  /**
   * 修改项目规则
   */
  @Put('/project/project_rules')
  async updateProjectRules(@Body() params: UpdateProjectRulesDto) {
    const data = await this.projectRulesService.updateProjectRules(params);
    return data;
  }
  /**
   * 根据id查询项目规则
   */
  @Get('/project/project_rules')
  async getProjectRulesById(@Query() params: GetProjectRulesByIdDto) {
    const data = await this.projectRulesService.getProjectRulesById(params);
    return data;
  }
}
