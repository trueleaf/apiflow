import { Context, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { LoginTokenInfo } from '../../types/types.js';
import { CommonController } from '../../controller/common/common.js';
import { ProjectCode } from '../../entity/project/project_code.js';
import { AddProjectCodeDto, EditProjectCodeDto, DeleteProjectCodeDto, GetProjectCodeListDto, GetProjectCodeEnumDto } from '../../types/dto/project/project.code.dto.js';


@Provide()
export class ProjectCodeService {
  @InjectEntityModel(ProjectCode)
    projectCodeModel: ReturnModelType<typeof ProjectCode>;
  @Inject()
    commonControl: CommonController
  @Inject()
    ctx: Context & { tokenInfo: LoginTokenInfo };
  /**
   * 新增脚本代码
   */
  async addProjectCode(params: AddProjectCodeDto) {
    const { codeName, projectId, remark, code, isPublic  } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const codeInfo = {
      projectId,
      remark,
      codeName,
      code,
      isPublic,
      creator: this.ctx.tokenInfo.realName,
    };
    await this.projectCodeModel.create(codeInfo);
    return;
  }
  /**
   * 修改脚本代码
   */
  async editProjectCode(params: EditProjectCodeDto) {
    const { codeName, projectId, remark, code, isPublic, _id  } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const updateDoc: Partial<ProjectCode> = {};
    if (codeName) {
      updateDoc.codeName = codeName;
    }
    if (remark) {
      updateDoc.remark = remark;
    }
    if (code) {
      updateDoc.code = code;
    }
    if (isPublic != null) {
      updateDoc.isPublic = isPublic;
    }
    await this.projectCodeModel.findByIdAndUpdate({ _id }, updateDoc);
    return;
  }
  /**
   * 删除脚本代码
   */
  async deleteProjectCode(params: DeleteProjectCodeDto) {
    const { ids, projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const result = await this.projectCodeModel.updateMany(
      { _id: { $in: ids }},
      { $set: { isEnabled: false }}
    );
    return result;
  }
  /**
   * 列表方式获取脚本代码
   */
  async getProjectCodeList(params: GetProjectCodeListDto) {
    const { pageNum, pageSize, startTime, endTime, projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const query = {
      isEnabled: true,
      projectId,
    } as {
      projectId: string;
      isEnabled: boolean;
      createdAt?: {
        $gt?: number,
        $lt?: number,
      };
    };
    let skipNum = 0;
    let limit = 100;
    if (pageSize != null && pageNum != null) {
      skipNum = (pageNum - 1) * pageSize;
      limit = pageSize;
    }
    if (startTime != null && endTime == null) {
      query.createdAt = { $gt: startTime, $lt: Date.now() };
    } else if (startTime != null && endTime != null) {
      query.createdAt = { $gt: startTime, $lt: endTime };
    }
    const rows = await this.projectCodeModel.find(query, { projectId: 0, createdAt: 0, updatedAt: 0, __v: 0, isEnabled: 0 }).skip(skipNum).limit(limit);
    const total = await this.projectCodeModel.find(query).countDocuments();
    const result = {
      rows,
      total,
    };
    return result;
  }
  /**
   * 枚举方式获取变量
   */
  async getProjectCodeEnum(params: GetProjectCodeEnumDto) {
    const { projectId } = params;
    await this.commonControl.checkDocOperationPermissions(projectId);
    const result = await this.projectCodeModel.find({ projectId, isEnabled: true }, {
      codeName: 1,
      remark: 1,
      code: 1,
      creator: 1,
    });
    return result;
  }
}
