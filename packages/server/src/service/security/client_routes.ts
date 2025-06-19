import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { throwError } from '../../utils/utils.js';
import { TableResponseWrapper } from '../../types/response/common/common.js';
import { ClientRoutes } from '../../entity/security/client_routes.js';
import { AddClientRoutesDto, AddMultiClientRoutesDto, ChangeGroupNameByIds, DeleteClientRoutesDto, EditClientRoutesDto, GetClientRoutesListDto } from '../../types/dto/security/client.routes.dto.js';


@Provide()
export class ClientRoutesService {
  @InjectEntityModel(ClientRoutes)
    clientRoutesModel: ReturnModelType<typeof ClientRoutes>;
  /**
   * 新增前端路由
   */
  async addClientRoutes(params: AddClientRoutesDto) {
    const { name, path, groupName } = params;
    const doc: Partial<ClientRoutes> = {};
    doc.name = name;
    doc.path = path;
    doc.groupName = groupName;

    const hasPath = await this.clientRoutesModel.findOne({ path, isEnabled: true });
    if (hasPath) {
      return throwError(1003, '路由已存在')
    }
    await this.clientRoutesModel.create(doc);
    return;
  }
  /**
   * 批量新增前端路由
   */
  async addMultiClientRoutes(params: AddMultiClientRoutesDto) {
    const { routes } = params;
    for (let i = 0; i < routes.length; i++) {
      const doc = {
        name: routes[i].name,
        path: routes[i].path,
        isEnabled: true
      };
      await this.clientRoutesModel.updateOne({ path: routes[i].path }, doc, { upsert: true });
    }
    return;
  }
  /**
   * 修改前端路由
   */
  async editClientRoutes(params: EditClientRoutesDto) {
    const { _id, name, path, groupName } = params;
    const updateDoc: Partial<ClientRoutes> = {};
    if (name) {
      updateDoc.name = name;
    }
    if (path) {
      updateDoc.path = path;
    }
    if (groupName) {
      updateDoc.groupName = groupName;
    }
    const hasPath = await this.clientRoutesModel.findOne({ _id: { $ne: _id }, path, isEnabled: true });
    if (hasPath) {
      return throwError(1003, '路由已存在')
    }
    await this.clientRoutesModel.findByIdAndUpdate({ _id }, updateDoc);
    return;
  }
  /**
   * 批量修改前端路由分组名称
   */
  async changeGroupNameByIds(params: ChangeGroupNameByIds) {
    const { ids, groupName } = params;
    await this.clientRoutesModel.updateMany({ _id: { $in: ids }}, { $set: { groupName }});
    return;
  }
  /**
   * 删除前端路由
   */
  async deleteClientRoutes(params: DeleteClientRoutesDto) {
    const { ids } = params;
    const result = await this.clientRoutesModel.updateMany({ _id: { $in: ids }}, { $set: { isEnabled: false }});
    return result;
  }
  /**
   * 以列表形式获取前端路由
   */
  async getClientRoutesList(params: GetClientRoutesListDto) {
    const { pageNum, pageSize, startTime, endTime } = params;
    const query = {} as {
      isEnabled: boolean;
      createdAt?: {
        $gt?: number,
        $lt?: number,
      };
    };
    let skipNum = 0;
    let limit = 100;
    query.isEnabled = true;
    if (pageSize != null && pageNum != null) {
      skipNum = (pageNum - 1) * pageSize;
      limit = pageSize;
    }
    if (startTime != null && endTime == null) {
      query.createdAt = { $gt: startTime, $lt: Date.now() };
    } else if (startTime != null && endTime != null) {
      query.createdAt = { $gt: startTime, $lt: endTime };
    }
    const rows = await this.clientRoutesModel.find(query, { isEnabled: 0 }).skip(skipNum).limit(limit);
    const total = await this.clientRoutesModel.find(query).countDocuments();
    const result: TableResponseWrapper = {
      rows: [],
      total: 0
    };
    result.rows = rows;
    result.total = total;
    return result;
  }
  /**
   * 获取全部前端路由
   */
  async getAllClientRoutesList() {
    const query: {
      isEnabled?: boolean;
    } = {};
    const limit = 1000;
    query.isEnabled = true;
    const result = await this.clientRoutesModel.find(query, { _id: 1, path: 1, name: 1, groupName: 1, method: 1 }).limit(limit);
    return result;
  }
}
