import { Context, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { LoginTokenInfo } from '../../types/types.js';
import { CommonController } from '../../controller/common/common.js';
import { ProjectRules } from '../../entity/project/project_rules.js';
import { GetProjectRulesByIdDto, UpdateProjectRulesDto } from '../../types/dto/project/project.rules.dto.js';

const BASE_RULES = {
  fileInFolderLimit: 255, //单个文件夹默认限制文件个数
  requestMethods: [
    {
      name: 'GET',
      value: 'GET',
      isEnabled: true,
      iconColor: '#28a745',
      enabledContenTypes: ['path', 'params'],
    },
    {
      name: 'POST',
      value: 'POST',
      isEnabled: true,
      iconColor: '#ffc107',
      enabledContenTypes: ['params', 'json', 'formData'],
    },
    {
      name: 'PUT',
      value: 'PUT',
      isEnabled: true,
      iconColor: '#409EFF',
      enabledContenTypes: ['params', 'json'],
    },
    {
      name: 'DEL',
      value: 'DELETE',
      isEnabled: true,
      iconColor: '#f56c6c',
      enabledContenTypes: ['params'],
    },
    {
      name: 'PATCH',
      value: 'PATCH',
      isEnabled: true,
      iconColor: '#17a2b8',
      enabledContenTypes: ['params', 'json'],
    },
    {
      name: 'HEAD',
      value: 'HEAD',
      isEnabled: true,
      iconColor: '#17a2b8',
      enabledContenTypes: ['params', 'json'],
    },
    {
      name: 'OPTIONS',
      value: 'OPTIONS',
      isEnabled: true,
      iconColor: '#17a2b8',
      enabledContenTypes: ['params', 'json'],
    },
    {
      name: 'Test',
      value: 'Test',
      isEnabled: true,
      iconColor: '#17a2b8',
      enabledContenTypes: ['params', 'json'],
    },
  ],
};
@Provide()
export class ProjectRulesService {
  @InjectEntityModel(ProjectRules)
    projectRulesModel: ReturnModelType<typeof ProjectRules>;
  @Inject()
    commonControl: CommonController
  @Inject()
    ctx: Context & { tokenInfo: LoginTokenInfo };
  /**
   * 修改项目规则
   */
  async updateProjectRules(params: UpdateProjectRulesDto) {
    const { projectId, fileInFolderLimit, requestMethods } = params;
    const doc: Partial<ProjectRules> = {};
    doc.projectId = projectId;
    if (fileInFolderLimit) {
      doc.fileInFolderLimit = fileInFolderLimit || BASE_RULES.fileInFolderLimit;
    }
    if (requestMethods) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc.requestMethods = requestMethods || (BASE_RULES.requestMethods as any);
    }
    await this.projectRulesModel.updateOne({ projectId }, doc, {
      upsert: true
    });
    return;
  }
  /**
   * 根据id查询项目规则
   */
  async getProjectRulesById(params: GetProjectRulesByIdDto) {
    const { projectId } = params;
    console.log(this.projectRulesModel)
    const result = await this.projectRulesModel.findOne({
      projectId,
    }).lean();
    return result || BASE_RULES;
  }
}
