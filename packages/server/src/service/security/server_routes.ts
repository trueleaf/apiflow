import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { ServerRoutes } from '../../entity/security/server_routes.js';
import { throwError } from '../../utils/utils.js';
import { AddServerRouteDto, ChangeGroupNameByIdsDto, DeleteServerRouteDto, EditServerRouteDto, GetServerRoutesListDto } from '../../types/dto/security/server.routes.dto.js';
import { TableResponseWrapper } from '../../types/response/common/common.js';
import lodash from 'lodash';


@Provide()
export class ServerRoutesService {
  @InjectEntityModel(ServerRoutes)
    serverRoutesModel: ReturnModelType<typeof ServerRoutes>;
  /**
   * 新增服务端路由
   */
  async addServerRoute(params: AddServerRouteDto) {
    const { name, path, method, groupName } = params;
    const doc: Partial<ServerRoutes> = {};
    doc.name = name;
    doc.path = path;
    doc.method = method;
    doc.groupName = groupName;

    const hasPath = await this.serverRoutesModel.findOne({ path, method, isEnabled: true });
    if (hasPath) {
      return throwError(1003, '路由已存在')
    }
    await this.serverRoutesModel.create(doc);
    return;
  }
  /**
   * 修改服务端路由
   */
  async editServerRoute(params: EditServerRouteDto) {
    const { _id, name, path, method, groupName } = params;
    const updateDoc: Partial<ServerRoutes> = {};
    if (name) {
      updateDoc.name = name;
    }
    if (path) {
      updateDoc.path = path;
    }
    if (method) {
      updateDoc.method = method;
    }
    if (groupName) {
      updateDoc.groupName = groupName;
    }
    const hasPath = await this.serverRoutesModel.findOne({ _id: { $ne: _id }, path, method, isEnabled: true });
    if (hasPath) {
      return throwError(1003, '路由已存在')
    }
    await this.serverRoutesModel.findByIdAndUpdate({ _id }, updateDoc);
    return;
  }
  /**
   * 批量修改路由分组信息
   */
  async changeGroupNameByIds(params: ChangeGroupNameByIdsDto) {
    const { ids, groupName } = params;
    await this.serverRoutesModel.updateMany({ _id: { $in: ids }}, { $set: { groupName }});
    return;
  }
  /**
   * 删除服务端路由
   */
  async deleteServerRoute(params: DeleteServerRouteDto) {
    const { ids } = params;
    const result = await this.serverRoutesModel.updateMany({ _id: { $in: ids }}, { $set: { isEnabled: false }});
    return result;
  }
  /**
   * 以列表形式获取服务端路由
   */
  async getServerRoutesList(params: GetServerRoutesListDto) {
    const { pageNum, pageSize, startTime, endTime, path } = params;
    const query = {} as {
      isEnabled: boolean;
      path?: RegExp;
      createdAt?: {
        $gt?: number,
        $lt?: number,
      };
    };
    let skipNum = 0;
    let limit = 100;
    query.isEnabled = true;
    if (path) {
      query.path = new RegExp(lodash.escapeRegExp(path));
    }
    if (pageSize != null && pageNum != null) {
      skipNum = (pageNum - 1) * pageSize;
      limit = pageSize;
    }
    if (startTime != null && endTime == null) {
      query.createdAt = { $gt: startTime, $lt: Date.now() };
    } else if (startTime != null && endTime != null) {
      query.createdAt = { $gt: startTime, $lt: endTime };
    }
    const rows = await this.serverRoutesModel.find(query, { isEnabled: 0 }).skip(skipNum).limit(limit);
    const total = await this.serverRoutesModel.find(query).countDocuments();
    const result: TableResponseWrapper = {
      rows: [],
      total: 0
    };
    result.rows = rows;
    result.total = total;
    return result;
  }
  /**
   * 获取全部服务端路由
   */
  async getAllServerRoutesList() {
    const query: {
      isEnabled?: boolean;
    } = {};
    const limit = 1000;
    query.isEnabled = true;
    const result = await this.serverRoutesModel.find(query, { _id: 1, path: 1, name: 1, groupName: 1, method: 1 }).limit(limit);
    return result;
  }
}
