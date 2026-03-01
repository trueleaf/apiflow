import { Context, Inject, Provide } from '@midwayjs/core'
import { InjectEntityModel } from '@midwayjs/typegoose'
import { ReturnModelType } from '@typegoose/typegoose'
import { LoginTokenInfo } from '../../types/types.js'
import { CommonController } from '../../controller/common/common.js'
import { ProjectEnvironment } from '../../entity/project/project_environment.js'
import { ProjectEnvironmentVariable } from '../../entity/project/project_environment_variable.js'
import {
  AddProjectEnvironmentDto,
  BatchUpdateProjectEnvironmentVariableDto,
  DeleteProjectEnvironmentDto,
  EditProjectEnvironmentDto,
  GetProjectEnvironmentListDto,
  GetProjectEnvironmentVariableListDto
} from '../../types/dto/project/project.environment.dto.js'
@Provide()
export class ProjectEnvironmentService {
  @InjectEntityModel(ProjectEnvironment)
    projectEnvironmentModel: ReturnModelType<typeof ProjectEnvironment>
  @InjectEntityModel(ProjectEnvironmentVariable)
    projectEnvironmentVariableModel: ReturnModelType<typeof ProjectEnvironmentVariable>
  @Inject()
    commonControl: CommonController
  @Inject()
    ctx: Context & { tokenInfo: LoginTokenInfo }
  async addProjectEnvironment(params: AddProjectEnvironmentDto) {
    const { projectId, name, baseUrl, description, order, visibilityMode } = params
    await this.commonControl.checkDocOperationPermissions(projectId)
    const created = await this.projectEnvironmentModel.create({
      projectId,
      name,
      baseUrl,
      description,
      order,
      visibilityMode,
      creator: this.ctx.tokenInfo.loginName,
      isEnabled: true,
    })
    return {
      _id: created._id.toString(),
    }
  }
  async editProjectEnvironment(params: EditProjectEnvironmentDto) {
    const { _id, projectId, name, baseUrl, description, order, visibilityMode } = params
    await this.commonControl.checkDocOperationPermissions(projectId)
    await this.projectEnvironmentModel.findByIdAndUpdate(
      { _id, projectId, isEnabled: true },
      {
        $set: {
          name,
          baseUrl,
          description,
          order,
          visibilityMode,
        },
      }
    )
    return null
  }
  async deleteProjectEnvironment(params: DeleteProjectEnvironmentDto) {
    const { projectId, ids } = params
    await this.commonControl.checkDocOperationPermissions(projectId)
    await this.projectEnvironmentModel.updateMany(
      { _id: { $in: ids }, projectId, isEnabled: true },
      { $set: { isEnabled: false } }
    )
    await this.projectEnvironmentVariableModel.updateMany(
      { environmentId: { $in: ids }, projectId, isEnabled: true },
      { $set: { isEnabled: false } }
    )
    return null
  }
  async getProjectEnvironmentList(params: GetProjectEnvironmentListDto) {
    const { projectId } = params
    await this.commonControl.checkDocOperationPermissions(projectId, 'readOnly')
    const rows = await this.projectEnvironmentModel.find(
      { projectId, isEnabled: true },
      { __v: 0, isEnabled: 0 }
    ).sort({ order: 1, updatedAt: 1 })
    return rows
  }
  async getProjectEnvironmentVariableList(params: GetProjectEnvironmentVariableListDto) {
    const { projectId, environmentId } = params
    await this.commonControl.checkDocOperationPermissions(projectId, 'readOnly')
    const rows = await this.projectEnvironmentVariableModel.find(
      { projectId, environmentId, isEnabled: true },
      { __v: 0, isEnabled: 0 }
    ).sort({ order: 1, updatedAt: 1 })
    return rows
  }
  async batchUpdateProjectEnvironmentVariable(params: BatchUpdateProjectEnvironmentVariableDto) {
    const { projectId, environmentId, variables } = params
    await this.commonControl.checkDocOperationPermissions(projectId)
    const existingRows = await this.projectEnvironmentVariableModel.find({
      projectId,
      environmentId,
      isEnabled: true,
    })
    const existingMap = new Map(existingRows.map(item => [item._id.toString(), item]))
    const activeIds: string[] = []
    for (let i = 0; i < variables.length; i += 1) {
      const item = variables[i]
      if (item._id && existingMap.has(item._id)) {
        const matched = existingMap.get(item._id)
        if (matched) {
          await this.projectEnvironmentVariableModel.findByIdAndUpdate(
            { _id: item._id, projectId, environmentId },
            {
              $set: {
                key: item.key,
                localValue: item.localValue,
                sharedValue: item.sharedValue,
                valueType: item.valueType,
                enabled: item.enabled,
                order: item.order,
                isEnabled: true,
              },
            }
          )
          activeIds.push(item._id)
        }
      } else {
        const created = await this.projectEnvironmentVariableModel.create({
          projectId,
          environmentId,
          key: item.key,
          localValue: item.localValue,
          sharedValue: item.sharedValue,
          valueType: item.valueType,
          enabled: item.enabled,
          order: item.order,
          creator: this.ctx.tokenInfo.loginName,
          isEnabled: true,
        })
        activeIds.push(created._id.toString())
      }
    }
    const staleIds = existingRows
      .map(item => item._id.toString())
      .filter(id => !activeIds.includes(id))
    if (staleIds.length > 0) {
      await this.projectEnvironmentVariableModel.updateMany(
        { _id: { $in: staleIds }, projectId, environmentId },
        { $set: { isEnabled: false } }
      )
    }
    const rows = await this.projectEnvironmentVariableModel.find(
      { projectId, environmentId, isEnabled: true },
      { __v: 0, isEnabled: 0 }
    ).sort({ order: 1, updatedAt: 1 })
    return rows
  }
}
