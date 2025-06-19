import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { throwError } from '../../utils/utils.js';
import { Role } from '../../entity/security/role.js';
import { AddRoleDto, DeleteRoleDto, EditRoleDto, GetRoleInfoDto, GetRoleListDto } from '../../types/dto/security/role.dto.js';
import { TableResponseWrapper } from '../../types/response/common/common.js';


@Provide()
export class RoleService {
  @InjectEntityModel(Role)
    roleModel: ReturnModelType<typeof Role>;
  /**
   * 新增角色
   */
  async addRole(params: AddRoleDto) {
    const { roleName, clientRoutes, clientBanner, serverRoutes, remark } = params;
    const doc: Partial<Role> = {};
    doc.roleName = roleName;
    doc.clientRoutes = clientRoutes;
    doc.clientBanner = clientBanner;
    doc.serverRoutes = serverRoutes;
    doc.remark = remark;
    const hasRole = await this.roleModel.findOne({ roleName, isEnabled: true});
    if (hasRole) {
      throwError(1003, '角色名称已经存在')
    }
    await this.roleModel.create(doc);
    return;
  }
  /**
   * 修改角色
   */
  async editRole(params: EditRoleDto) {
    const { _id, roleName, clientRoutes, clientBanner, serverRoutes, remark } = params;
    const updateDoc: Partial<Role> = {};
    updateDoc.roleName = roleName;
    updateDoc.clientRoutes = clientRoutes;
    updateDoc.clientBanner = clientBanner;
    updateDoc.serverRoutes = serverRoutes;
    updateDoc.remark = remark;
    await this.roleModel.findByIdAndUpdate({ _id }, updateDoc);
    return;
  }
  /**
   * 删除角色
   */
  async deleteRole(params: DeleteRoleDto) {
    const { ids } = params;
    const result = await this.roleModel.updateMany({ _id: { $in: ids }}, { $set: { isEnabled: false }});
    return result;
  }
  /**
   * 分页方式获取角色列表
   */
  async getRoleList(params: GetRoleListDto) {
    const { pageNum, pageSize, startTime, endTime } = params;
    const query = { isEnabled: true } as {
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
    const rows = await this.roleModel.find(query, { clientRoutes: 0, clientBanner: 0, serverRoutes: 0 }).sort({ updatedAt: -1 }).skip(skipNum).limit(limit);
    const total = await this.roleModel.find(query).countDocuments();
    const result: TableResponseWrapper = {
      rows: [],
      total: 0
    };
    result.rows = rows;
    result.total = total;
    return result;
  }
  /**
   * 以枚举方式获取角色列表
   */
  async getRoleEnum() {
    const limit = 100;
    const result = await this.roleModel.find({ isEnabled: true }, { roleName: 1 }).limit(limit);
    return result;
  }
  /**
   * 根据id获取角色信息
   */
  async getRoleInfoById(params: GetRoleInfoDto) {
    const { _id } = params;
    const query = {
      _id,
      isEnabled: true
    };
    const result = await this.roleModel.findOne(query, { createdAt: 0, updatedAt: 0, isEnabled: 0 });
    return result;
  }
}
